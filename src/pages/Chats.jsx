import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import OpenConv from "../components/OpenConv";
import Conversations from "../components/Conversations";
import { Navbar_SignIn } from "../components/Navbar_SignIn";
import "../styles/Chats.css";

import { getChatList, getChatMessages, buildChatWsUrl, ensureChat } from "../Services/chatService";

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
}

// Decode JWT payload to get user_id (UI-only)
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

  // store current open recipient (from chat list: other_participant)
  const [recipient, setRecipient] = useState(null); // { id, username }
  const recipientRef = useRef(null);

  const currentUserId = useMemo(() => getCurrentUserIdFromAccessToken(), []);

  // WS refs
  const wsRef = useRef(null);
  const selectedChatIdRef = useRef(null);
  const currentUserIdRef = useRef(null);

  // ====== Seen tracking refs ======
  const messagesViewportRef = useRef(null);     // scroll container in OpenConv
  const observerRef = useRef(null);             // IntersectionObserver instance
  const seenSentRef = useRef(new Set());        // msg IDs already sent to backend
  const seenPendingRef = useRef(new Set());     // msg IDs to send soon (batch)
  const seenFlushTimerRef = useRef(null);       // debounce timer

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

  // Flush pending seen IDs immediately
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

  // Schedule a flush (debounced) to batch many seen IDs
  const scheduleFlushSeen = useCallback(() => {
    if (seenFlushTimerRef.current) return;
    seenFlushTimerRef.current = setTimeout(() => {
      seenFlushTimerRef.current = null;
      flushSeen();
    }, 250);
  }, [flushSeen]);

  // Called by OpenConv to give us the viewport element
  const handleMountMessagesViewport = useCallback((el) => {
    messagesViewportRef.current = el;
  }, []);

  // Upsert chat and keep sorted by last_message timestamp / updated_at
  const upsertChatAndSort = (incomingChatOrId, maybeLastMessage, unreadCountOverride) => {
    setChats((prev) => {
      const list = Array.isArray(prev) ? [...prev] : [];

      const chatId =
        typeof incomingChatOrId === "object" ? incomingChatOrId?.id : incomingChatOrId;

      if (!chatId) return list;

      const incomingChat = typeof incomingChatOrId === "object" ? incomingChatOrId : null;

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

  // Ensure chat exists for recipient (create if missing)
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

  // Connect once
  useEffect(() => {
    const url = buildChatWsUrl();
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
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

      // message_sent -> replace optimistic message
      if (data?.type === "message_sent" && data?.chat_id && data?.message) {
        const chatId = data.chat_id;
        const serverMsg = data.message;

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

      // new_message -> update list + open chat (if backend broadcasts)
      if (data?.type === "new_message" && data?.chat_id && data?.message) {
        const chatId = data.chat_id;
        const msg = data.message;

        const me = currentUserIdRef.current;
        const senderId = msg?.sender_id ?? msg?.sender;

        // If backend broadcasts my own message too, avoid duplicating
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

        // Update sidebar + unread
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

      if (data?.type === "chat_list_update" && data?.chat?.id) {
        upsertChatAndSort(data.chat);
        return;
      }

      // OPTIONAL: if your backend sends seen updates, you can handle them here
      // if (data?.type === "messages_seen" && data?.chat_id && Array.isArray(data?.message_ids)) {
      //   setMessages((prev) =>
      //     prev.map((m) =>
      //       data.message_ids.includes(m.id) ? { ...m, is_read: true } : m
      //     )
      //   );
      // }

      console.log("WS JSON:", data);
    };

    ws.onerror = (e) => console.error("WebSocket error:", e);
    ws.onclose = () => console.log("WebSocket closed");

    return () => {
      try {
        flushSeen(); // flush pending seen before leaving
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
    // flush seen from previous chat before switching
    flushSeen();

    setSelectedChatId(chatId);

    const chatObj = (Array.isArray(chats) ? chats : []).find(
      (c) => String(c.id) === String(chatId)
    );

    const other = chatObj?.other_participant;

    if (other?.id) {
      setRecipient({ id: other.id, username: other.username || "Unknown" });
    } else {
      setRecipient(null);
      console.warn("other_participant is null for chat:", chatId, chatObj);
    }

    wsSend({ action: "open_chat", chat_id: chatId });

    // reset unread in sidebar
    setChats((prev) =>
      (Array.isArray(prev) ? prev : []).map((c) =>
        String(c.id) === String(chatId) ? { ...c, unread_count: 0 } : c
      )
    );
  };

  // Sidebar items
  const convItems = useMemo(() => {
    const safeChats = Array.isArray(chats) ? chats : [];
    const sorted = [...safeChats].sort(
      (a, b) =>
        new Date(b?.last_message?.timestamp || b?.updated_at || 0) -
        new Date(a?.last_message?.timestamp || a?.updated_at || 0)
    );

    return sorted.map((c) => ({
      id: c.id,
      name: c.other_participant?.username || c.last_message?.sender_name || "Unknown",
      avatar: c.other_participant?.avatar || c.avatar || "https://i.pravatar.cc/80?img=12",
      time: c.last_message?.timestamp ? formatTime(c.last_message.timestamp) : "",
      tag: "chat",
      unreadCount: c.unread_count || 0,
      hint: c.last_message?.content || "",
    }));
  }, [chats]);

  // Open chat header
  const openChat = useMemo(() => {
    if (!selectedChatId) return null;

    const c = convItems.find((x) => String(x.id) === String(selectedChatId));
    if (!c) return null;

    const title = recipient?.username || c.name;
    return { id: c.id, title, subtitle: "", avatar: c.avatar };
  }, [selectedChatId, convItems, recipient]);

  // Messages mapping (IMPORTANT: keep message.id for seen tracking)
  const openMessages = useMemo(() => {
    const safe = Array.isArray(messages) ? messages : [];

    return safe.map((m) => {
      const senderId = m.sender_id ?? m.sender;
      const isMine = currentUserId != null && Number(senderId) === Number(currentUserId);

      return {
        id: m.id, // ✅ must be real backend message ID for seen
        client_temp_id: m.client_temp_id, // local only
        side: isMine ? "out" : "in",
        text: m.content || "",
        time: formatTime(m.timestamp),
        status: isMine ? (m.is_read ? "seen" : "sent") : undefined,
        attachments: m.attachments || [],
        senderName: m.sender_name || (isMine ? "You" : "Other"),

        // keep raw for observer logic if needed
        _raw: m,
      };
    });
  }, [messages, currentUserId]);

  // ====== IntersectionObserver: mark visible incoming messages as seen ======
  useEffect(() => {
    // cleanup old observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const viewport = messagesViewportRef.current;
    if (!viewport) return;
    if (!selectedChatId) return;

    // Reset per-chat tracking
    seenSentRef.current = new Set();
    seenPendingRef.current = new Set();

    // Build quick lookup from current messages state
    const byId = new Map();
    for (const m of messages) {
      if (!m?.id) continue;

      const senderId = m.sender_id ?? m.sender;
      const isMine = currentUserId != null && Number(senderId) === Number(currentUserId);

      byId.set(String(m.id), {
        isMine,
        isRead: !!m.is_read,
        chatId: m.chat_id,
      });
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const msgId = entry.target?.getAttribute("data-msgid");
          if (!msgId) continue;

          const meta = byId.get(String(msgId));
          if (!meta) continue;

          // ensure correct chat
          if (String(meta.chatId) !== String(selectedChatIdRef.current)) continue;

          // only incoming + unread
          if (meta.isMine) continue;
          if (meta.isRead) continue;

          // dedupe
          if (seenSentRef.current.has(String(msgId))) continue;

          // queue
          seenSentRef.current.add(String(msgId));
          seenPendingRef.current.add(Number(msgId));
          scheduleFlushSeen();
        }
      },
      { root: viewport, threshold: 0.6 }
    );

    // Observe all message nodes (OpenConv must put data-msgid on each message node)
    const nodes = viewport.querySelectorAll("[data-msgid]");
    nodes.forEach((n) => observerRef.current.observe(n));

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = null;
    };
  }, [selectedChatId, messages, currentUserId, scheduleFlushSeen]);

  // Send message (minimal WS payload)
  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("اتصال وب‌سوکت برقرار نیست. دوباره تلاش کنید.");
      return;
    }

    // If chat doesn't exist yet, we still need recipient to create it
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

    // optimistic local message
    const clientId = `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const nowIso = new Date().toISOString();

    const optimisticMsg = {
      id: null,
      client_temp_id: clientId, // local only
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

    // minimal payload you requested
    const payload = {
      action: "send_message",
      chat_id: chatId,
      message: text,
      reply_to_id: null,
      attachment_ids: [],
    };

    const ok = wsSend(payload);

    if (!ok) {
      setMessages((prev) =>
        prev.map((m) => (m.client_temp_id === clientId ? { ...m, _failed: true } : m))
      );
      alert("ارسال پیام ناموفق بود.");
    } else {
      upsertChatAndSort(chatId, { content: text, timestamp: nowIso }, 0);
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
          onAttach={(type) => alert(`attach type: ${type}`)}

          onMountMessagesViewport={handleMountMessagesViewport}
        />
      </div>
    </div>
  );
}
