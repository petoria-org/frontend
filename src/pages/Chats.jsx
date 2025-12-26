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
  // =========================
  // DEBUG
  // =========================
  const DEBUG = true;
  const dlog = useCallback(
    (...args) => {
      if (DEBUG) console.log(...args);
    },
    [DEBUG]
  );

  // 🔥 If you do NOT see this log, you are not on this file/component.
  dlog("🔥 [Chat.jsx] ChatPage render (IF YOU DON'T SEE THIS, WRONG FILE/ROUTE)");

  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [recipient, setRecipient] = useState(null); // { id, username }
  const recipientRef = useRef(null);

  const currentUserId = useMemo(() => getCurrentUserIdFromAccessToken(), []);
  useEffect(() => {
    dlog("[Auth] currentUserId:", currentUserId);
  }, [currentUserId, dlog]);

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

// ✅ fallback: if OpenConv doesn't provide viewport, grab it from DOM
  useEffect(() => {
    if (messagesViewportRef.current) return;
    const el = document.querySelector(".open__messages");
    if (el) {
      messagesViewportRef.current = el;
      dlog("[Viewport fallback] grabbed .open__messages from DOM", { ok: true });
    } else {
      dlog("[Viewport fallback] .open__messages not found yet", { ok: false });
    }
  }, [selectedChatId, messages.length, dlog]);

  const wsSend = useCallback(
    (payload) => {
      const ws = wsRef.current;
      const state = ws ? ws.readyState : -1;
      const stateName =
        state === WebSocket.CONNECTING
          ? "CONNECTING"
          : state === WebSocket.OPEN
          ? "OPEN"
          : state === WebSocket.CLOSING
          ? "CLOSING"
          : state === WebSocket.CLOSED
          ? "CLOSED"
          : "NO_WS";

      dlog("[WS SEND attempt]", { state: stateName, payload });

      if (!ws || ws.readyState !== WebSocket.OPEN) {
        dlog("[WS SEND blocked] ws not open", { state: stateName });
        return false;
      }

      try {
        ws.send(JSON.stringify(payload));
        dlog("[WS SEND ok]", payload);
        return true;
      } catch (e) {
        console.error("[WS SEND failed]", e);
        return false;
      }
    },
    [dlog]
  );

  // =========================
  // Seen tracking (real-time / one-by-one)
  // =========================
  const messagesViewportRef = useRef(null);

  const seenSentRef = useRef(new Set());
  const pendingReadIdsRef = useRef(new Set());

  const handleMountMessagesViewport = useCallback((el) => {
    messagesViewportRef.current = el;
    dlog("[Viewport mounted from OpenConv]", { ok: !!el });
  }, [dlog]);

  useEffect(() => {
    seenSentRef.current = new Set();
    pendingReadIdsRef.current = new Set();
    dlog("[Seen reset] selectedChatId:", selectedChatId);
  }, [selectedChatId, dlog]);

  const applyLocalSeenUpdate = useCallback(
    (chatId, ids) => {
      if (!chatId || !Array.isArray(ids) || ids.length === 0) return;

      const idSet = new Set(ids.map((id) => String(id)));
      dlog("[applyLocalSeenUpdate]", { chatId, ids: Array.from(idSet) });

      setChats((prev) => {
        const list = Array.isArray(prev) ? [...prev] : [];

        return list.map((c) => {
          if (String(c.id) !== String(chatId)) return c;

          const last = c.last_message;
          const lastNeedsUpdate = last?.id && idSet.has(String(last.id));
          const currentUnread = typeof c.unread_count === "number" ? c.unread_count : 0;
          const nextUnread = Math.max(0, currentUnread - idSet.size);

          dlog("[unread_count optimistic]", {
            chatId,
            before: currentUnread,
            after: nextUnread,
            decBy: idSet.size,
          });

          return {
            ...c,
            unread_count: nextUnread,
            last_message: lastNeedsUpdate ? { ...last, is_read: true } : last,
          };
        });
      });
    },
    [dlog]
  );

  const applyReadUpdate = useCallback(
    ({ chatIdMaybeNull, ids, unreadCountMaybe }) => {
      if (!Array.isArray(ids) || ids.length === 0) return;

      const chatId = chatIdMaybeNull ?? selectedChatIdRef.current;
      if (!chatId) return;

      const idSet = new Set(ids.map(String));
      dlog("[applyReadUpdate] server authoritative", {
        chatId,
        ids: Array.from(idSet),
        unreadCountMaybe,
      });

      if (String(chatId) === String(selectedChatIdRef.current)) {
        setMessages((prev) =>
          prev.map((m) =>
            m?.id != null && idSet.has(String(m.id)) ? { ...m, is_read: true } : m
          )
        );
      }

      setChats((prev) => {
        const list = Array.isArray(prev) ? [...prev] : [];
        return list.map((c) => {
          if (String(c.id) !== String(chatId)) return c;

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
      });
    },
    [dlog]
  );

  const sendMarkReadOne = useCallback(
    (chatId, messageId) => {
      if (!chatId || !messageId) return false;

      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        pendingReadIdsRef.current.add(Number(messageId));
        dlog("[mark_read queued] ws not open", { chatId, messageId });
        return false;
      }

      const payload = {
        action: "mark_read",
        chat_id: chatId,
        message_ids: [Number(messageId)],
      };

      const ok = wsSend(payload);
      if (!ok) {
        pendingReadIdsRef.current.add(Number(messageId));
        dlog("[mark_read queued] send failed", { chatId, messageId });
      } else {
        dlog("[mark_read sent]", payload);
      }
      return ok;
    },
    [wsSend, dlog]
  );

  const flushPendingReadIds = useCallback(() => {
    const chatId = selectedChatIdRef.current;
    const ws = wsRef.current;
    if (!chatId) return;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (pendingReadIdsRef.current.size === 0) return;

    const ids = Array.from(pendingReadIdsRef.current);
    pendingReadIdsRef.current.clear();

    dlog("[flushPendingReadIds]", { chatId, count: ids.length, ids });

    for (const id of ids) sendMarkReadOne(chatId, id);
  }, [sendMarkReadOne, dlog]);

  const markMessagesSeen = useCallback(
    (msgs) => {
      const chatId = selectedChatIdRef.current;
      const me = currentUserIdRef.current;

      dlog("[markMessagesSeen] called", {
        chatId,
        me,
        msgsCount: Array.isArray(msgs) ? msgs.length : 0,
        ids: (msgs || []).map((x) => x?.id),
      });

      if (!Array.isArray(msgs) || msgs.length === 0) return;
      if (!chatId || me == null) return;

      const newlyReadIds = [];

      for (const msg of msgs) {
        if (!msg?.id) {
          dlog("[markMessagesSeen] skip: no id", msg);
          continue;
        }

        const messageChatId = msg.chat_id ?? chatId;
        if (String(messageChatId) !== String(chatId)) {
          dlog("[markMessagesSeen] skip: different chat", {
            msgId: msg.id,
            messageChatId,
            chatId,
          });
          continue;
        }

        const senderId = msg.sender_id ?? msg.sender;
        const isMine = senderId != null && String(senderId) === String(me);
        if (isMine) {
          dlog("[markMessagesSeen] skip: mine", { msgId: msg.id, senderId, me });
          continue;
        }

        if (msg.is_read) {
          dlog("[markMessagesSeen] skip: already read", { msgId: msg.id });
          continue;
        }

        const idStr = String(msg.id);
        if (seenSentRef.current.has(idStr)) {
          dlog("[markMessagesSeen] skip: already sent", { msgId: msg.id });
          continue;
        }

        dlog("[markMessagesSeen] WILL MARK", { msgId: msg.id });

        seenSentRef.current.add(idStr);
        newlyReadIds.push(Number(msg.id));

        // ✅ realtime / one-by-one send
        sendMarkReadOne(chatId, msg.id);
      }

      dlog("[markMessagesSeen] newlyReadIds", newlyReadIds);

      if (!newlyReadIds.length) return;

      const idsSet = new Set(newlyReadIds);

      // optimistic message update
      setMessages((prev) =>
        prev.map((m) =>
          m?.id != null && idsSet.has(Number(m.id)) ? { ...m, is_read: true } : m
        )
      );

      // optimistic sidebar update
      applyLocalSeenUpdate(chatId, newlyReadIds);
    },
    [applyLocalSeenUpdate, sendMarkReadOne, dlog]
  );

  const markVisibleUnreadNow = useCallback(() => {
    const viewport = messagesViewportRef.current;
    const chatId = selectedChatIdRef.current;
    if (!viewport || !chatId) {
      dlog("[SEEN scan] missing viewport/chat", { viewport: !!viewport, chatId });
      return;
    }

    const viewportRect = viewport.getBoundingClientRect();
    const nodes = viewport.querySelectorAll("[data-msgid]");
    dlog("[SEEN scan] DOM nodes", { chatId, nodes: nodes.length });

    if (!nodes || nodes.length === 0) return;

    const currentMessages = messagesRef.current || [];
    const visibleMessages = [];

    nodes.forEach((n) => {
      const msgId = n.getAttribute("data-msgid");
      if (!msgId) return;

      const rect = n.getBoundingClientRect();
      const visibleHeight =
        Math.min(rect.bottom, viewportRect.bottom) - Math.max(rect.top, viewportRect.top);

      if (visibleHeight <= 0) return;

      const ratio = visibleHeight / (rect.height || 1);
      if (ratio < 0.15) return;

      const msg = currentMessages.find(
        (x) => x?.id != null && String(x.id) === String(msgId)
      );
      if (msg) visibleMessages.push(msg);
    });

    dlog("[SEEN scan result]", { chatId, visibleIds: visibleMessages.map((m) => m.id) });

    if (visibleMessages.length) markMessagesSeen(visibleMessages);
  }, [markMessagesSeen, dlog]);

  // ✅ ALWAYS WORKS: scan on scroll + resize
  useEffect(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport || !selectedChatId) {
      dlog("[SCROLL-SEEN] no viewport or no chat", { viewport: !!viewport, selectedChatId });
      return;
    }

    dlog("[SCROLL-SEEN] attach listeners", { selectedChatId });

    const onScroll = () => {
      dlog("[SCROLL-SEEN] scroll event", { top: viewport.scrollTop });
      markVisibleUnreadNow();
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // run once after render
    setTimeout(() => markVisibleUnreadNow(), 0);

    return () => {
      dlog("[SCROLL-SEEN] detach listeners", { selectedChatId });
      viewport.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [selectedChatId, markVisibleUnreadNow, dlog]);

  // =========================
  // Upsert chat & sort
  // =========================
  const upsertChatAndSort = useCallback((incomingChatOrId, maybeLastMessage, unreadCountOverride) => {
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
      if (other?.id) setRecipient({ id: other.id, username: other.username || "Unknown" });

      return chat.id;
    },
    [upsertChatAndSort]
  );

  // =========================
  // WS connect
  // =========================
  useEffect(() => {
    const url = buildChatWsUrl();
    if (!url) {
      dlog("[WS] buildChatWsUrl returned empty!");
      return;
    }

    dlog("[WS] connecting to", url);

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      dlog("[WS] OPEN");
      flushPendingReadIds();
      setTimeout(() => markVisibleUnreadNow(), 0);
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        console.log("[WS RECV raw]", event.data);
        return;
      }

      dlog("[WS RECV]", data);

      if (data?.type === "read_update" && data?.chat?.id) {
        const chat = data.chat;
        applyReadUpdate({
          chatIdMaybeNull: chat.id ?? chat.chat_id ?? null,
          ids: chat.updated_ids || [],
          unreadCountMaybe: chat.unread_count,
        });
        return;
      }

      if (data?.type === "marked_read" && Array.isArray(data?.message_ids)) {
        applyReadUpdate({
          chatIdMaybeNull: null,
          ids: data.message_ids,
          unreadCountMaybe: undefined,
        });
        return;
      }

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
              copy[replaceIndex] = { ...prevMsg, ...serverMsg, _optimistic: false };
              return copy;
            }

            if (serverMsg.id && copy.some((m) => m?.id && String(m.id) === String(serverMsg.id))) {
              return copy;
            }

            return [...copy, serverMsg];
          });

          setTimeout(() => markVisibleUnreadNow(), 0);
        }

        return;
      }

      if (
        (data?.type === "chat_list_update" || data?.type === "message_update") &&
        data?.chat?.id
      ) {
        const chat = data.chat;
        const chatId = chat.id;
        const msg = chat.last_message;

        upsertChatAndSort(chat);

        if (msg && String(chatId) === String(selectedChatIdRef.current)) {
          setMessages((prev) => {
            if (msg.id && prev.some((m) => m?.id && String(m.id) === String(msg.id))) return prev;
            return [...prev, msg];
          });

          setTimeout(() => markVisibleUnreadNow(), 0);
        }
      }
    };

    ws.onerror = (e) => console.error("[WS] error", e);
    ws.onclose = () => dlog("[WS] CLOSED");

    return () => {
      try {
        ws.close();
      } catch {}
      wsRef.current = null;
    };
  }, [applyReadUpdate, flushPendingReadIds, markVisibleUnreadNow, upsertChatAndSort, dlog]);

  // Load chat list
  useEffect(() => {
    const loadChats = async () => {
      const res = await getChatList();
      if (res.success) setChats(Array.isArray(res.data) ? res.data : []);
      else {
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
        dlog("[Messages loaded] count:", arr.length);
        dlog("[Messages loaded] sample 3:", arr.slice(0, 3));
      } else {
        setMessages([]);
        alert(res.message || "خطا در دریافت پیام‌ها");
      }
    };

    loadMessages();
  }, [selectedChatId, dlog]);

  // Select chat
  const handleSelectChat = useCallback(
    (chatId) => {
      dlog("[Select chat]", chatId);
      setSelectedChatId(chatId);

      const chatObj = (Array.isArray(chats) ? chats : []).find(
        (c) => String(c.id) === String(chatId)
      );
      const other = chatObj?.other_participant;

      if (other?.id) setRecipient({ id: other.id, username: other.username || "Unknown" });
      else setRecipient(null);
    },
    [chats, dlog]
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

  // Messages mapping (keep is_read!!)
  const openMessages = useMemo(() => {
    const safe = Array.isArray(messages) ? messages : [];

    return safe.map((m) => {
      const senderId = m.sender_id ?? m.sender;
      const isMine = currentUserId != null && String(senderId) === String(currentUserId);

      const rt = m?.reply_to && typeof m.reply_to === "object" ? m.reply_to : null;
      const replyTo =
        rt?.id != null ? { id: rt.id, sender_name: rt.sender_name, content: rt.content } : null;

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
        sender: currentUserId,
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
                    is_read: true,
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
