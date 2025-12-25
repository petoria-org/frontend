import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import OpenConv from "../components/OpenConv";
import Conversations from "../components/Conversations";
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

function getChatSortTime(chat) {
  return (
    chat?.last_message_time ||
    chat?.last_message?.timestamp ||
    chat?.updated_at ||
    chat?.created_at ||
    0
  );
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

  // latest messages ref (prevents stale closures)
  const messagesRef = useRef([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    recipientRef.current = recipient;
  }, [recipient]);

  const wsSend = useCallback((payload) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error("WS send failed:", e);
      return false;
    }
  }, []);

  // ===== Seen tracking (mark_read) =====
  const messagesViewportRef = useRef(null);
  const observerRef = useRef(null);

  // messages already queued/sent for this chat (prevents duplicates)
  const seenSentRef = useRef(new Set());
  // batch to send soon
  const seenPendingRef = useRef(new Set());
  const seenFlushTimerRef = useRef(null);

  const flushSeen = useCallback(() => {
    const chatId = selectedChatIdRef.current;
    if (!chatId) return;
    if (seenPendingRef.current.size === 0) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const ids = Array.from(seenPendingRef.current);

    const ok = wsSend({
      action: "mark_read",
      chat_id: chatId,
      message_ids: ids,
    });

    if (ok) {
      seenPendingRef.current.clear();
    }
  }, [wsSend]);

  const scheduleFlushSeen = useCallback(() => {
    if (seenFlushTimerRef.current) return;
    seenFlushTimerRef.current = setTimeout(() => {
      seenFlushTimerRef.current = null;
      // if WS is not open, we'll try next time something schedules a flush
      flushSeen();
      // if still pending (ws closed), it will remain in seenPendingRef and can flush later
      if (seenPendingRef.current.size > 0) {
        // try once more shortly
        scheduleFlushSeen();
      }
    }, 250);
  }, [flushSeen]);

  const handleMountMessagesViewport = useCallback((el) => {
    messagesViewportRef.current = el;
  }, []);

  // reset seen tracking when switching chats
  useEffect(() => {
    seenSentRef.current = new Set();
    seenPendingRef.current = new Set();
  }, [selectedChatId]);

  // Upsert chat & sort
  const upsertChatAndSort = useCallback((incomingChatOrId, maybeLastMessage, unreadCountOverride) => {
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

      const nextUnread =
        typeof unreadCountOverride === "number"
          ? unreadCountOverride
          : typeof incomingChat?.unread_count === "number"
          ? incomingChat.unread_count
          : idx >= 0
          ? list[idx].unread_count || 0
          : 0;

      const updated = {
        ...(idx >= 0 ? list[idx] : {}),
        ...(incomingChat || {}),
        id: chatId,
        last_message: lastMsg,
        unread_count: nextUnread,
        last_message_time:
          incomingChat?.last_message_time ||
          lastMsg?.timestamp ||
          (idx >= 0 ? list[idx]?.last_message_time : undefined),
        updated_at:
          incomingChat?.last_message_time ||
          lastMsg?.timestamp ||
          incomingChat?.updated_at ||
          (idx >= 0 ? list[idx]?.updated_at : undefined),
      };

      if (idx >= 0) list[idx] = updated;
      else list.push(updated);

      list.sort((a, b) => new Date(getChatSortTime(b)) - new Date(getChatSortTime(a)));
      return list;
    });
  }, []);

  // Ensure chat exists
  const ensureChatIdForRecipient = useCallback(
    async (recipientId) => {
      const existing = selectedChatIdRef.current;
      if (existing) return existing;

      const res = await ensureChat(recipientId);
      if (!res?.success || !res?.data?.id) {
        throw new Error(res?.message || "ساخت/یافتن گفتگو ناموفق بود.");
      }

      const chat = res.data;

      upsertChatAndSort(chat);
      setSelectedChatId(chat.id);

      const other = chat?.other_participant;
      if (other?.id) {
        setRecipient({ id: other.id, username: other.username || "Unknown" });
      }

      return chat.id;
    },
    [upsertChatAndSort]
  );

  // ✅ Apply read updates to UI (authoritative for read state + unread_count if provided)
  const applyReadUpdate = useCallback(({ chatIdMaybeNull, ids, unreadCountMaybe }) => {
    if (!Array.isArray(ids) || ids.length === 0) return;

    const chatId = chatIdMaybeNull ?? selectedChatIdRef.current;
    if (!chatId) return;

    const idSet = new Set(ids.map(String));

    // update messages when this chat is open
    if (String(chatId) === String(selectedChatIdRef.current)) {
      setMessages((prev) =>
        prev.map((m) =>
          m?.id != null && idSet.has(String(m.id)) ? { ...m, is_read: true } : m
        )
      );
    }

    // update sidebar unread_count + last_message is_read
    setChats((prev) => {
      const list = Array.isArray(prev) ? [...prev] : [];
      let found = false;

      const updated = list.map((c) => {
        if (String(c.id) !== String(chatId)) return c;
        found = true;

        const last = c.last_message;
        const lastNeedsUpdate = last?.id && idSet.has(String(last.id));

        const nextUnread =
          typeof unreadCountMaybe === "number"
            ? unreadCountMaybe
            : typeof c.unread_count === "number"
            ? c.unread_count
            : 0;

        return {
          ...c,
          unread_count: nextUnread,
          last_message: lastNeedsUpdate ? { ...last, is_read: true } : last,
        };
      });

      if (!found) {
        updated.push({
          id: chatId,
          unread_count: typeof unreadCountMaybe === "number" ? unreadCountMaybe : 0,
          last_message: null,
        });
      }

      return updated;
    });
  }, []);

  // ✅ helper: mark all unread incoming (loaded) messages as read (best UX when opening chat)
  const markAllUnreadInOpenChatNow = useCallback(() => {
    const chatId = selectedChatIdRef.current;
    const me = currentUserIdRef.current;
    if (!chatId || me == null) return;

    const arr = messagesRef.current || [];
    if (!Array.isArray(arr) || arr.length === 0) return;

    const idsToRead = [];
    for (const msg of arr) {
      if (!msg?.id) continue;
      const senderId = msg.sender_id ?? msg.sender;
      const isMine = senderId != null && String(senderId) === String(me);
      if (isMine) continue;
      if (msg.is_read) continue;
      if (seenSentRef.current.has(String(msg.id))) continue;

      seenSentRef.current.add(String(msg.id));
      seenPendingRef.current.add(Number(msg.id));
      idsToRead.push(Number(msg.id));
    }

    if (idsToRead.length) {
      // optimistic UI
      setMessages((prev) =>
        prev.map((m) =>
          m?.id != null && idsToRead.includes(Number(m.id)) ? { ...m, is_read: true } : m
        )
      );
      scheduleFlushSeen();
    }
  }, [scheduleFlushSeen]);

  // ✅ helper: scan visible DOM and mark unread incoming as read (fallback)
  const markVisibleUnreadNow = useCallback(() => {
    const viewport = messagesViewportRef.current;
    const chatId = selectedChatIdRef.current;
    const me = currentUserIdRef.current;
    if (!viewport || !chatId || me == null) return;

    const nodes = viewport.querySelectorAll("[data-msgid]");
    if (!nodes || nodes.length === 0) return;

    const currentMessages = messagesRef.current || [];
    const idsToRead = [];

    for (const n of nodes) {
      const msgId = n.getAttribute("data-msgid");
      if (!msgId) continue;

      const msg = currentMessages.find((x) => x?.id != null && String(x.id) === String(msgId));
      if (!msg) continue;

      const senderId = msg.sender_id ?? msg.sender;
      const isMine = senderId != null && String(senderId) === String(me);

      if (isMine) continue;
      if (msg.is_read) continue;
      if (seenSentRef.current.has(String(msgId))) continue;

      seenSentRef.current.add(String(msgId));
      seenPendingRef.current.add(Number(msgId));
      idsToRead.push(Number(msgId));
    }

    if (idsToRead.length) {
      setMessages((prev) =>
        prev.map((m) =>
          m?.id != null && idsToRead.includes(Number(m.id)) ? { ...m, is_read: true } : m
        )
      );
      scheduleFlushSeen();
    }
  }, [scheduleFlushSeen]);

  // WS connect
  useEffect(() => {
    const url = buildChatWsUrl();
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {};

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        console.log("WS message:", event.data);
        return;
      }

      // ✅ message_sent (server ack)
      if (data?.type === "message_sent" && data?.chat_id && data?.message) {
        const chatId = data.chat_id;
        const serverMsg = data.message;

        // If server provides unread_count in this payload (some APIs do), trust it.
        const serverUnread =
          typeof data?.unread_count === "number"
            ? data.unread_count
            : typeof data?.chat?.unread_count === "number"
            ? data.chat.unread_count
            : undefined;

        upsertChatAndSort(chatId, serverMsg, typeof serverUnread === "number" ? serverUnread : 0);

        if (String(chatId) === String(selectedChatIdRef.current)) {
          setMessages((prev) => {
            const me = currentUserIdRef.current;
            const content = String(serverMsg.content ?? "");

            const copy = [...prev];
            let replaceIndex = -1;

            for (let i = copy.length - 1; i >= 0; i--) {
              const m = copy[i];
              const senderId = m?.sender_id ?? m?.sender;

              const isMatch =
                m?._optimistic &&
                String(m.chat_id) === String(chatId) &&
                String(senderId) === String(me) &&
                String(m.content ?? "") === content;

              if (isMatch) {
                replaceIndex = i;
                break;
              }
            }

            if (replaceIndex !== -1) {
              const prevMsg = copy[replaceIndex];
              copy[replaceIndex] = {
                ...prevMsg,
                ...serverMsg,
                reply_to: serverMsg.reply_to ?? prevMsg.reply_to ?? null,
                _optimistic: false,
              };
              return copy;
            }

            if (serverMsg.id && copy.some((m) => m?.id && String(m.id) === String(serverMsg.id))) {
              return copy;
            }

            return [...copy, serverMsg];
          });
        }

        return;
      }

      // ✅ chat_list_update/message_update
      if (
        (data?.type === "chat_list_update" || data?.type === "message_update") &&
        data?.chat?.id
      ) {
        const chat = data.chat;
        const chatId = chat.id;
        const msg = chat.last_message;

        // ✅ Always trust server unread_count if present
        upsertChatAndSort(chat);

        if (msg && String(chatId) === String(selectedChatIdRef.current)) {
          setMessages((prev) => {
            if (msg.id && prev.some((m) => m?.id && String(m.id) === String(msg.id))) return prev;
            return [...prev, msg];
          });

          // If we are currently viewing this chat, mark unread incoming as read quickly
          // (server may still count as unread until mark_read is processed)
          setTimeout(() => {
            markVisibleUnreadNow();
          }, 0);
        }

        // ❌ Removed client-side "+1" unread bump to avoid desync.
        // Server should be source of truth for unread_count.

        return;
      }

      // ✅ broadcast update (double tick + unread_count) — authoritative for read state
      if (data?.type === "read_update" && data?.chat?.id) {
        const chat = data.chat;
        applyReadUpdate({
          chatIdMaybeNull: chat.id ?? chat.chat_id ?? null,
          ids: chat.updated_ids || [],
          unreadCountMaybe: chat.unread_count,
        });
        return;
      }

      // ✅ server confirms MY mark_read request (fallback if read_update is delayed/missing)
      if (data?.type === "marked_read" && Array.isArray(data?.message_ids)) {
        applyReadUpdate({
          chatIdMaybeNull: null,
          ids: data.message_ids,
          unreadCountMaybe: undefined,
        });
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
        ws.close();
      } catch {}
      wsRef.current = null;
    };
  }, [upsertChatAndSort, flushSeen, applyReadUpdate, markVisibleUnreadNow]);

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

  // ✅ after messages load/open:
  // 1) mark all unread incoming as read (loaded)
  // 2) also run visible scan (in case DOM nodes are ready a bit later)
  useEffect(() => {
    if (!selectedChatId) return;
    if (loadingMessages) return;

    const t1 = setTimeout(() => {
      markAllUnreadInOpenChatNow();
    }, 0);

    const t2 = setTimeout(() => {
      markVisibleUnreadNow();
    }, 50);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [selectedChatId, loadingMessages, messages.length, markAllUnreadInOpenChatNow, markVisibleUnreadNow]);

  // Select chat
  const handleSelectChat = useCallback(
    (chatId) => {
      flushSeen();

      setSelectedChatId(chatId);

      const chatObj = (Array.isArray(chats) ? chats : []).find(
        (c) => String(c.id) === String(chatId)
      );
      const other = chatObj?.other_participant;

      if (other?.id) setRecipient({ id: other.id, username: other.username || "Unknown" });
      else setRecipient(null);

      // ✅ optimistic reset unread for opened chat (server should later confirm)
      setChats((prev) =>
        (Array.isArray(prev) ? prev : []).map((c) =>
          String(c.id) === String(chatId) ? { ...c, unread_count: 0 } : c
        )
      );
    },
    [chats, flushSeen]
  );

  // Sidebar items
  const convItems = useMemo(() => {
    const safeChats = Array.isArray(chats) ? chats : [];
    const sorted = [...safeChats].sort(
      (a, b) => new Date(getChatSortTime(b)) - new Date(getChatSortTime(a))
    );

    return sorted.map((c) => {
      const lastSenderId = c.last_message?.sender_id ?? c.last_message?.sender;
      const isMineLast =
        currentUserId != null &&
        lastSenderId != null &&
        String(lastSenderId) === String(currentUserId);

      return {
        id: c.id,
        name: c.other_participant?.username || c.last_message?.sender_name || "Unknown",
        avatar: c.other_participant?.avatar || c.avatar || "https://i.pravatar.cc/80?img=12",
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

  // Messages mapping (double tick status)
  const openMessages = useMemo(() => {
    const safe = Array.isArray(messages) ? messages : [];

    return safe.map((m) => {
      const senderId = m.sender_id ?? m.sender;
      const isMine = currentUserId != null && String(senderId) === String(currentUserId);

      const rt = m?.reply_to && typeof m.reply_to === "object" ? m.reply_to : null;
      const replyTo =
        rt?.id != null
          ? {
              id: rt.id,
              sender_id: rt.sender_id ?? rt.sender,
              sender_name: rt.sender_name,
              content: rt.content,
            }
          : null;

      return {
        id: m.id,
        client_temp_id: m.client_temp_id,
        side: isMine ? "out" : "in",
        text: m.content || "",
        time: formatTime(m.timestamp),
        status: isMine ? (m.is_read ? "seen" : "sent") : undefined,
        attachments: m.attachments || [],
        senderName: m.sender_name || (isMine ? "You" : "Other"),
        chat_id: m.chat_id,
        sender_id: senderId,
        is_read: !!m.is_read,
        _optimistic: !!m._optimistic,
        replyTo,
      };
    });
  }, [messages, currentUserId]);

  // Observe visible messages => send mark_read to backend
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const viewport = messagesViewportRef.current;
    if (!viewport) return;
    if (!selectedChatId) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const chatId = selectedChatIdRef.current;
        const me = currentUserIdRef.current;
        if (!chatId || me == null) return;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const msgId = entry.target?.getAttribute("data-msgid");
          if (!msgId) continue;

          const msg = (messagesRef.current || []).find(
            (x) => x?.id != null && String(x.id) === String(msgId)
          );
          if (!msg) continue;

          // ensure still same chat
          if (String(msg.chat_id) !== String(chatId)) continue;

          const senderId = msg.sender_id ?? msg.sender;
          const isMine = senderId != null && String(senderId) === String(me);
          if (isMine) continue;

          if (msg.is_read) continue;
          if (seenSentRef.current.has(String(msgId))) continue;

          seenSentRef.current.add(String(msgId));
          seenPendingRef.current.add(Number(msgId));
          scheduleFlushSeen();

          setMessages((prev) =>
            prev.map((mm) =>
              mm?.id && String(mm.id) === String(msgId) ? { ...mm, is_read: true } : mm
            )
          );
        }
      },
      {
        root: viewport,
        threshold: 0.15,
        rootMargin: "120px 0px 120px 0px",
      }
    );

    const nodes = viewport.querySelectorAll("[data-msgid]");
    nodes.forEach((n) => observerRef.current.observe(n));

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = null;
    };
  }, [selectedChatId, currentUserId, scheduleFlushSeen]);

  // Send message
  const handleSend = useCallback(
    async (replyTarget) => {
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

      const clientId = `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const nowIso = new Date().toISOString();

      const optimisticMsg = {
        id: null,
        client_temp_id: clientId,
        chat_id: chatId,
        sender: currentUserId, // backend uses sender
        sender_name: "You",
        content: text,
        timestamp: nowIso,
        is_read: false,
        attachments: [],
        _optimistic: true,
        reply_to: replyTarget?.id
          ? { id: replyTarget.id, sender_name: replyTarget.senderName, content: replyTarget.text }
          : null,
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
          prev.map((m) => (m.client_temp_id === clientId ? { ...m, _failed: true } : m))
        );
        alert("ارسال پیام ناموفق بود.");
      } else {
        // optimistic sidebar update; unread_count should remain 0 for my own sent message
        upsertChatAndSort(
          chatId,
          { content: text, timestamp: nowIso, sender: currentUserId, is_read: false },
          0
        );
      }
    },
    [inputValue, currentUserId, ensureChatIdForRecipient, wsSend, upsertChatAndSort]
  );

  return (
    <div className="chatShell">
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
