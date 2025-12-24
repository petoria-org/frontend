import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import OpenConv from "../components/OpenConv";
import Conversations from "../components/Conversations";
import { Navbar_SignIn } from "../components/Navbar_SignIn";
import "../styles/Chats.css";

import {
  getChatList,
  getChatMessages,
  buildChatWsUrl,
  ensureChat,
} from "../Services/chatService";

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
}

function getCurrentUserIdFromAccessToken() {
  const token = localStorage.getItem("access");
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);
    return Number(payload.user_id);
  } catch {
    return null;
  }
}

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [recipient, setRecipient] = useState(null); // { id, username }
  const recipientRef = useRef(null);

  const currentUserId = useMemo(() => getCurrentUserIdFromAccessToken(), []);

  // WS refs
  const wsRef = useRef(null);
  const selectedChatIdRef = useRef(null);
  const currentUserIdRef = useRef(null);

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    recipientRef.current = recipient;
  }, [recipient]);

  const wsSend = (payload) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error("WS send failed:", e);
      return false;
    }
  };

  // ===== Partial seen tracking =====
  const messagesViewportRef = useRef(null);
  const observerRef = useRef(null);
  const seenSentRef = useRef(new Set());
  const seenPendingRef = useRef(new Set());
  const seenFlushTimerRef = useRef(null);

  const flushSeen = useCallback(() => {
    const chatId = selectedChatIdRef.current;
    if (!chatId) return;
    if (seenPendingRef.current.size === 0) return;

    const ids = Array.from(seenPendingRef.current);
    seenPendingRef.current.clear();

    wsSend({
      action: "mark_seen",
      chat_id: chatId,
      message_ids: ids,
    });
  }, []);

  const scheduleFlushSeen = useCallback(() => {
    if (seenFlushTimerRef.current) return;
    seenFlushTimerRef.current = setTimeout(() => {
      seenFlushTimerRef.current = null;
      flushSeen();
    }, 250);
  }, [flushSeen]);

  const handleMountMessagesViewport = useCallback((el) => {
    messagesViewportRef.current = el;
  }, []);

  // Upsert chat & sort
  const upsertChatAndSort = (
    incomingChatOrId,
    maybeLastMessage,
    unreadCountOverride
  ) => {
    setChats((prev) => {
      const list = Array.isArray(prev) ? [...prev] : [];

      const chatId =
        typeof incomingChatOrId === "object"
          ? incomingChatOrId?.id
          : incomingChatOrId;

      if (!chatId) return list;

      const incomingChat =
        typeof incomingChatOrId === "object" ? incomingChatOrId : null;
      const idx = list.findIndex((c) => String(c.id) === String(chatId));

      const lastMsg =
        incomingChat?.last_message ??
        maybeLastMessage ??
        (idx >= 0 ? list[idx]?.last_message : null);

      const updated = {
        ...(idx >= 0 ? list[idx] : {}),
        ...(incomingChat || {}),
        id: chatId,
        last_message: lastMsg,
        unread_count:
          typeof unreadCountOverride === "number"
            ? unreadCountOverride
            : typeof incomingChat?.unread_count === "number"
            ? incomingChat.unread_count
            : idx >= 0
            ? list[idx].unread_count || 0
            : 0,
        updated_at:
          lastMsg?.timestamp ||
          incomingChat?.updated_at ||
          (idx >= 0 ? list[idx]?.updated_at : undefined),
      };

      if (idx >= 0) list[idx] = updated;
      else list.push(updated);

      list.sort(
        (a, b) =>
          new Date(b?.last_message?.timestamp || b?.updated_at || 0) -
          new Date(a?.last_message?.timestamp || a?.updated_at || 0)
      );

      return list;
    });
  };

  // Ensure chat exists
  const ensureChatIdForRecipient = async (recipientId) => {
    const existing = selectedChatIdRef.current;
    if (existing) return existing;

    const res = await ensureChat(recipientId);
    if (!res?.success || !res?.data?.id) {
      throw new Error(res?.message || "ساخت/یافتن گفتگو ناموفق بود.");
    }

    const chat = res.data;

    upsertChatAndSort(chat);
    setSelectedChatId(chat.id);
    wsSend({ action: "open_chat", chat_id: chat.id });

    const other = chat?.other_participant;
    if (other?.id) {
      setRecipient({ id: other.id, username: other.username || "Unknown" });
    }

    return chat.id;
  };

  // WS connect
  useEffect(() => {
    const url = buildChatWsUrl();
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (selectedChatIdRef.current) {
        wsSend({ action: "open_chat", chat_id: selectedChatIdRef.current });
      }
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        console.log("WS message:", event.data);
        return;
      }

      // ✅ 1) message_sent (server ack for my message)
      if (data?.type === "message_sent" && data?.chat_id && data?.message) {
        const chatId = data.chat_id;
        const serverMsg = data.message;

        // move chat top + reset unread for open
        upsertChatAndSort(chatId, serverMsg, 0);

        if (String(chatId) === String(selectedChatIdRef.current)) {
          setMessages((prev) => {
            const me = currentUserIdRef.current;
            const content = String(serverMsg.content ?? "");

            const copy = [...prev];
            let replaceIndex = -1;

            for (let i = copy.length - 1; i >= 0; i--) {
              const m = copy[i];
              const isMatch =
                m?._optimistic &&
                String(m.chat_id) === String(chatId) &&
                String(m.sender_id ?? m.sender) === String(me) &&
                String(m.content ?? "") === content;

              if (isMatch) {
                replaceIndex = i;
                break;
              }
            }

            if (replaceIndex !== -1) {
              copy[replaceIndex] = { ...serverMsg, _optimistic: false };
              return copy;
            }

            if (
              serverMsg.id &&
              copy.some((m) => m?.id && String(m.id) === String(serverMsg.id))
            ) {
              return copy;
            }

            return [...copy, serverMsg];
          });
        }

        return;
      }

      // ✅ 2) new_message (if your backend ever sends it)
      if (data?.type === "new_message" && data?.chat_id && data?.message) {
        const chatId = data.chat_id;
        const msg = data.message;

        const me = currentUserIdRef.current;
        const senderId = msg?.sender_id ?? msg?.sender;

        // Avoid duplicating my own message if backend broadcasts it here too
        if (me != null && senderId != null && String(senderId) === String(me)) {
          upsertChatAndSort(data.chat || chatId, msg);
          return;
        }

        const isOpen = String(chatId) === String(selectedChatIdRef.current);

        if (isOpen) {
          setMessages((prev) => {
            if (msg.id && prev.some((m) => m?.id && String(m.id) === String(msg.id)))
              return prev;
            return [...prev, msg];
          });
        }

        // sidebar unread
        setChats((prev) => {
          const list = Array.isArray(prev) ? [...prev] : [];
          const idx = list.findIndex((c) => String(c.id) === String(chatId));

          const base =
            idx >= 0
              ? list[idx]
              : data.chat || {
                  id: chatId,
                  other_participant: { username: msg.sender_name || "Unknown" },
                  avatar: "https://i.pravatar.cc/80?img=12",
                  unread_count: 0,
                };

          const nextUnread = isOpen ? 0 : (base.unread_count || 0) + 1;

          const updated = {
            ...base,
            last_message: msg,
            unread_count: nextUnread,
            updated_at: msg.timestamp,
          };

          if (idx >= 0) list[idx] = updated;
          else list.push(updated);

          list.sort(
            (a, b) =>
              new Date(b?.last_message?.timestamp || b?.updated_at || 0) -
              new Date(a?.last_message?.timestamp || a?.updated_at || 0)
          );

          return list;
        });

        return;
      }

      // ✅ 3) chat_list_update (YOUR backend sends this when I receive a message)
      if (data?.type === "chat_list_update" && data?.chat?.id) {
        const chat = data.chat;
        const chatId = chat.id;
        const msg = chat.last_message;

        // always update sidebar
        upsertChatAndSort(chat);

        // if open chat, append last_message to messages so it appears realtime
        if (msg && String(chatId) === String(selectedChatIdRef.current)) {
          setMessages((prev) => {
            if (
              msg.id &&
              prev.some((m) => m?.id && String(m.id) === String(msg.id))
            )
              return prev;
            return [...prev, msg];
          });
        }

        // if not open, backend might be sending unread_count wrong (like 0)
        // so we locally bump unread by 1 (never decreasing below server value)
        if (String(chatId) !== String(selectedChatIdRef.current) && msg?.id) {
          setChats((prev) =>
            (Array.isArray(prev) ? prev : []).map((c) => {
              if (String(c.id) !== String(chatId)) return c;
              const baseUnread = Number(c.unread_count || 0);
              const serverUnread =
                typeof chat.unread_count === "number" ? chat.unread_count : 0;
              return { ...c, unread_count: Math.max(serverUnread, baseUnread + 1) };
            })
          );
        }

        return;
      }

      // ✅ 4) read receipts: messages_seen
      if (
        data?.type === "messages_seen" &&
        data?.chat_id &&
        Array.isArray(data?.message_ids)
      ) {
        const chatId = data.chat_id;
        const ids = data.message_ids.map(String);

        if (String(chatId) === String(selectedChatIdRef.current)) {
          setMessages((prev) =>
            prev.map((m) =>
              m?.id != null && ids.includes(String(m.id))
                ? { ...m, is_read: true }
                : m
            )
          );
        }

        setChats((prev) =>
          (Array.isArray(prev) ? prev : []).map((c) => {
            if (String(c.id) !== String(chatId)) return c;
            const last = c.last_message;
            if (!last?.id) return c;
            if (ids.includes(String(last.id)))
              return { ...c, last_message: { ...last, is_read: true } };
            return c;
          })
        );

        return;
      }

      console.log("WS JSON:", data);
    };

    ws.onerror = (e) => console.error("WebSocket error:", e);
    ws.onclose = () => console.log("WebSocket closed");

    return () => {
      try {
        flushSeen();
      } catch {}
      try {
        wsSend({ action: "close_chat" });
      } catch {}
      try {
        ws.close();
      } catch {}
      wsRef.current = null;
    };
  }, [flushSeen]);

  // Load chat list
  useEffect(() => {
    const loadChats = async () => {
      const res = await getChatList();
      if (res.success) {
        setChats(Array.isArray(res.data) ? res.data : []);
      } else {
        setChats([]);
        alert(res.message || "خطا در دریافت لیست گفتگوها");
      }
    };
    loadChats();
  }, []);

  // Load messages on chat select
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoadingMessages(true);
      const res = await getChatMessages(selectedChatId);
      setLoadingMessages(false);

      if (res.success) {
        const arr = Array.isArray(res.data) ? res.data : [];
        setMessages(arr.slice().reverse());
      } else {
        setMessages([]);
        alert(res.message || "خطا در دریافت پیام‌ها");
      }
    };

    loadMessages();
  }, [selectedChatId]);

  // Select chat
  const handleSelectChat = (chatId) => {
    flushSeen();

    setSelectedChatId(chatId);

    const chatObj = (Array.isArray(chats) ? chats : []).find(
      (c) => String(c.id) === String(chatId)
    );
    const other = chatObj?.other_participant;

    if (other?.id)
      setRecipient({ id: other.id, username: other.username || "Unknown" });
    else setRecipient(null);

    wsSend({ action: "open_chat", chat_id: chatId });

    // reset unread on open
    setChats((prev) =>
      (Array.isArray(prev) ? prev : []).map((c) =>
        String(c.id) === String(chatId) ? { ...c, unread_count: 0 } : c
      )
    );
  };

  // Sidebar items (tick info included)
  const convItems = useMemo(() => {
    const safeChats = Array.isArray(chats) ? chats : [];
    const sorted = [...safeChats].sort(
      (a, b) =>
        new Date(b?.last_message?.timestamp || b?.updated_at || 0) -
        new Date(a?.last_message?.timestamp || a?.updated_at || 0)
    );

    return sorted.map((c) => {
      const lastSenderId = c.last_message?.sender_id ?? c.last_message?.sender;
      const isMineLast =
        currentUserId != null &&
        lastSenderId != null &&
        String(lastSenderId) === String(currentUserId);

      return {
        id: c.id,
        name:
          c.other_participant?.username ||
          c.last_message?.sender_name ||
          "Unknown",
        avatar:
          c.other_participant?.avatar ||
          c.avatar ||
          "https://i.pravatar.cc/80?img=12",
        time: c.last_message?.timestamp ? formatTime(c.last_message.timestamp) : "",
        unreadCount: c.unread_count || 0,
        hint: c.last_message?.content || "",
        isMineLast,
        lastIsRead: !!c.last_message?.is_read,
      };
    });
  }, [chats, currentUserId]);

  // Open chat header
  const openChat = useMemo(() => {
    if (!selectedChatId) return null;
    const c = convItems.find((x) => String(x.id) === String(selectedChatId));
    if (!c) return null;
    const title = recipient?.username || c.name;
    return { id: c.id, title, subtitle: "", avatar: c.avatar };
  }, [selectedChatId, convItems, recipient]);

  // Messages mapping
  const openMessages = useMemo(() => {
    const safe = Array.isArray(messages) ? messages : [];
    return safe.map((m) => {
      const senderId = m.sender_id ?? m.sender;
      const isMine = currentUserId != null && Number(senderId) === Number(currentUserId);

      return {
        id: m.id, // backend id (needed for seen tracking)
        client_temp_id: m.client_temp_id,
        side: isMine ? "out" : "in",
        text: m.content || "",
        time: formatTime(m.timestamp),
        status: isMine ? (m.is_read ? "seen" : "sent") : undefined,
        attachments: m.attachments || [],
        senderName: m.sender_name || (isMine ? "You" : "Other"),
        chat_id: m.chat_id,
        sender_id: m.sender_id ?? m.sender,
        is_read: !!m.is_read,
        _optimistic: !!m._optimistic,
      };
    });
  }, [messages, currentUserId]);

  // Observe visible messages => mark_seen for incoming unread
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const viewport = messagesViewportRef.current;
    if (!viewport) return;
    if (!selectedChatId) return;

    seenSentRef.current = new Set();
    seenPendingRef.current = new Set();

    const byId = new Map();
    for (const m of messages) {
      if (!m?.id) continue;
      const senderId = m.sender_id ?? m.sender;
      const isMine = currentUserId != null && Number(senderId) === Number(currentUserId);
      byId.set(String(m.id), { isMine, isRead: !!m.is_read, chatId: m.chat_id });
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const msgId = entry.target?.getAttribute("data-msgid");
          if (!msgId) continue;

          const meta = byId.get(String(msgId));
          if (!meta) continue;

          if (String(meta.chatId) !== String(selectedChatIdRef.current)) continue;
          if (meta.isMine) continue;
          if (meta.isRead) continue;
          if (seenSentRef.current.has(String(msgId))) continue;

          seenSentRef.current.add(String(msgId));
          seenPendingRef.current.add(Number(msgId));
          scheduleFlushSeen();

          // local optimistic read
          setMessages((prev) =>
            prev.map((mm) =>
              mm?.id && String(mm.id) === String(msgId) ? { ...mm, is_read: true } : mm
            )
          );
        }
      },
      { root: viewport, threshold: 0.6 }
    );

    const nodes = viewport.querySelectorAll("[data-msgid]");
    nodes.forEach((n) => observerRef.current.observe(n));

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = null;
    };
  }, [selectedChatId, messages, currentUserId, scheduleFlushSeen]);

  // Send message (minimal payload + reply_to_id)
  const handleSend = async (replyTarget) => {
    const text = inputValue.trim();
    if (!text) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("اتصال وب‌سوکت برقرار نیست. دوباره تلاش کنید.");
      return;
    }

    // Ensure chat exists
    let chatId = selectedChatIdRef.current;
    if (!chatId) {
      const r = recipientRef.current;
      if (!r?.id) {
        alert("برای ساخت گفتگو باید recipient مشخص باشد.");
        return;
      }
      try {
        chatId = await ensureChatIdForRecipient(r.id);
      } catch (e) {
        alert(e?.message || "ساخت/یافتن گفتگو ناموفق بود.");
        return;
      }
    }

    // optimistic message
    const clientId = `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const nowIso = new Date().toISOString();

    const optimisticMsg = {
      id: null,
      client_temp_id: clientId,
      chat_id: chatId,
      sender_id: currentUserId,
      sender_name: "You",
      content: text,
      timestamp: nowIso,
      is_read: false,
      attachments: [],
      _optimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputValue("");

    const payload = {
      action: "send_message",
      chat_id: chatId,
      message: text,
      reply_to_id: replyTarget?.id ?? null,
      attachment_ids: [],
    };

    const ok = wsSend(payload);

    if (!ok) {
      setMessages((prev) =>
        prev.map((m) =>
          m.client_temp_id === clientId ? { ...m, _failed: true } : m
        )
      );
      alert("ارسال پیام ناموفق بود.");
    } else {
      // optimistic sidebar update for ticks (include sender_id)
      upsertChatAndSort(
        chatId,
        {
          content: text,
          timestamp: nowIso,
          sender_id: currentUserId,
          sender_name: "You",
          chat_id: chatId,
          is_read: false,
        },
        0
      );
    }
  };

  return (
    <div className="chatShell">
      <Navbar_SignIn />

      <div className="chatMain">
        <Conversations
          items={convItems}
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
        />

        <OpenConv
          chat={openChat}
          messages={
            loadingMessages
              ? [
                  {
                    id: "loading",
                    side: "in",
                    text: "در حال بارگذاری…",
                    time: "",
                    status: undefined,
                    attachments: [],
                  },
                ]
              : openMessages
          }
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          onAttach={(type) => alert(`attach type: ${type }`)}
          onMountMessagesViewport={handleMountMessagesViewport}
        />
      </div>
    </div>
  );
}
