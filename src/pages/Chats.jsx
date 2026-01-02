// Chat.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import OpenConv from "../components/OpenConv";
import Conversations from "../components/Conversations";
import "../styles/Chats.css";

import {
  getChatList,
  getChatMessages,
  buildChatWsUrl,
  ensureChat,
  uploadAttachments,
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

function getAttachmentTypeLabel(attachments) {
  if (!Array.isArray(attachments) || attachments.length === 0) return "";
  const first = attachments[0] || {};
  const raw = first.type || first.content_type || "";
  if (typeof raw === "string" && raw.includes("/")) {
    return raw.split("/")[0];
  }
  return raw || "attachment";
}

function getMessageOrderTs(msg) {
  if (!msg) return 0;

  // Prefer stable creation time; fall back to anything usable
  const candidates = [
    msg.created_at,
    msg.createdAt,
    msg.updated_at,
    msg.timestamp,
    msg.time,
  ];

  let best = null;
  for (const c of candidates) {
    if (!c) continue;
    const t = new Date(c).getTime();
    if (!Number.isFinite(t)) continue;
    best = best == null ? t : Math.min(best, t);
  }

  return best ?? 0;
}

function sortMessagesOldestFirst(arr) {
  const safe = Array.isArray(arr) ? [...arr] : [];

  safe.sort((a, b) => {
    const aId = Number(a?.id);
    const bId = Number(b?.id);

    const aHasId = Number.isFinite(aId);
    const bHasId = Number.isFinite(bId);

    if (aHasId && bHasId) return aId - bId;

    // 2️⃣ only one has server id → server message first
    if (aHasId && !bHasId) return -1;
    if (!aHasId && bHasId) return 1;

    // 3️⃣ neither has id (optimistic messages)
    const aTmp = a?.client_temp_id || "";
    const bTmp = b?.client_temp_id || "";
    return aTmp.localeCompare(bTmp);
  });

  return safe;
}


function mergeMessages(prevList, incomingList = []) {
  const prevArr = Array.isArray(prevList) ? prevList : [];
  const incomingArr = Array.isArray(incomingList) ? incomingList : [incomingList];

  const byId = new Map();
  const byTempId = new Map();
  const merged = [];

  const makeChatKey = (msg) =>
    msg?.chat_id ?? msg?.chatId ?? msg?.chat ?? msg?.chatID ?? null;

  const makeIdKey = (msg) => {
    if (!msg || msg.id == null) return null;
    const chatKey = makeChatKey(msg);
    return chatKey != null ? `${chatKey}::${msg.id}` : `global::${msg.id}`;
  };

  const makeTempKey = (msg) => {
    if (!msg || !msg.client_temp_id) return null;
    const chatKey = makeChatKey(msg);
    return chatKey != null
      ? `${chatKey}::${msg.client_temp_id}`
      : `global::${msg.client_temp_id}`;
  };

  const push = (msg) => {
    if (!msg) return;

    const baseTs = msg?._order_ts ?? 0;
    const idKey = makeIdKey(msg);
    const tempKey = makeTempKey(msg);

    if (idKey) {
      if (byId.has(idKey)) {
        const idx = byId.get(idKey);
        const existing = merged[idx];
        const preservedTs = Number.isFinite(existing?._order_ts)
          ? existing._order_ts
          : getMessageOrderTs(existing);
        merged[idx] = { ...existing, ...msg, _order_ts: preservedTs };
      } else {
        byId.set(idKey, merged.length);
        merged.push({ ...msg, _order_ts: baseTs });
      }
      return;
    }

    if (tempKey) {
      if (byTempId.has(tempKey)) {
        const idx = byTempId.get(tempKey);
        const existing = merged[idx];
        const preservedTs = Number.isFinite(existing?._order_ts)
          ? existing._order_ts
          : getMessageOrderTs(existing);
        merged[idx] = { ...existing, ...msg, _order_ts: preservedTs };
      } else {
        byTempId.set(tempKey, merged.length);
        merged.push({ ...msg, _order_ts: baseTs });
      }
      return;
    }

    merged.push({ ...msg, _order_ts: baseTs });
  };

  prevArr.forEach(push);
  incomingArr.forEach(push);

  return sortMessagesOldestFirst(merged);
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
  const currentUserIdRef = useRef(null);
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  // =========================
  // WS refs
  // =========================
  const wsRef = useRef(null);
  const selectedChatIdRef = useRef(null);

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    recipientRef.current = recipient;
  }, [recipient]);

  // messages ref for latest data
  const messagesRef = useRef([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // =========================
  // Viewport ref from OpenConv
  // =========================
  const messagesViewportRef = useRef(null);

  const handleMountMessagesViewport = useCallback((el) => {
    messagesViewportRef.current = el;
  }, []);

  // fallback: grab from DOM if needed
  useEffect(() => {
    if (messagesViewportRef.current) return;
    const el = document.querySelector(".open__messages");
    if (el) messagesViewportRef.current = el;
  }, [selectedChatId, messages.length]);

  // =========================
  // WS send helper
  // =========================
  const wsSend = useCallback((payload) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;

    try {
      ws.send(JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error("[WS SEND failed]", e);
      return false;
    }
  }, []);

  // =========================
  // Seen tracking (one-by-one)
  // =========================
  const seenSentRef = useRef(new Set());
  const pendingReadIdsRef = useRef(new Set());

  useEffect(() => {
    seenSentRef.current = new Set();
    pendingReadIdsRef.current = new Set();
  }, [selectedChatId]);

  const applyReadUpdate = useCallback(({ chatIdMaybeNull, ids, unreadCountMaybe }) => {
    if (!Array.isArray(ids) || ids.length === 0) return;

    const chatId = chatIdMaybeNull ?? selectedChatIdRef.current;
    if (!chatId) return;

    const idSet = new Set(ids.map(String));

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

        const me = currentUserIdRef.current;
        const lastSenderId = last?.sender_id ?? last?.sender;
        const lastIsMine =
          me != null &&
          lastSenderId != null &&
          String(lastSenderId) === String(me);

        let nextUnread =
          typeof unreadCountMaybe === "number"
            ? unreadCountMaybe
            : typeof c.unread_count === "number"
            ? c.unread_count
            : 0;

        // ✅ sender-side safety ONLY
        if (lastIsMine) nextUnread = 0;

        return {
          ...c,
          unread_count: nextUnread,
          last_message: lastNeedsUpdate ? { ...last, is_read: true } : last,
        };
      });
    });
  }, []);

  const applyLocalSeenUpdate = useCallback((chatId, decBy = 0) => {
    if (!chatId || decBy <= 0) return;

    setChats((prev) => {
      const list = Array.isArray(prev) ? [...prev] : [];
      return list.map((c) => {
        if (String(c.id) !== String(chatId)) return c;

        const currentUnread = typeof c.unread_count === "number" ? c.unread_count : 0;
        const nextUnread = Math.max(0, currentUnread - decBy);

        return { ...c, unread_count: nextUnread };
      });
    });
  }, []);

  const sendMarkReadOne = useCallback(
    (chatId, messageId) => {
      if (!chatId || !messageId) return false;

      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        pendingReadIdsRef.current.add(Number(messageId));
        return false;
      }

      const payload = {
        action: "mark_read",
        chat_id: chatId,
        message_ids: [Number(messageId)],
      };

      const ok = wsSend(payload);
      if (!ok) pendingReadIdsRef.current.add(Number(messageId));
      return ok;
    },
    [wsSend]
  );

  const flushPendingReadIds = useCallback(() => {
    const chatId = selectedChatIdRef.current;
    const ws = wsRef.current;
    if (!chatId) return;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (pendingReadIdsRef.current.size === 0) return;

    const ids = Array.from(pendingReadIdsRef.current);
    pendingReadIdsRef.current.clear();

    for (const id of ids) sendMarkReadOne(chatId, id);
  }, [sendMarkReadOne]);

  const markMessagesSeen = useCallback(
    (msgs) => {
      const chatId = selectedChatIdRef.current ?? selectedChatId;
      const me = currentUserIdRef.current;

      if (!Array.isArray(msgs) || msgs.length === 0) return;
      if (!chatId || me == null) return;

      const newlyReadIds = [];
      let incomingMarkedCount = 0;

      for (const msg of msgs) {
        if (!msg?.id) continue;

        const messageChatId = msg.chat_id ?? chatId;
        if (String(messageChatId) !== String(chatId)) continue;

        const senderId = msg.sender_id ?? msg.sender;
        const isMine = senderId != null && String(senderId) === String(me);

        // ✅ only mark incoming
        if (isMine) continue;
        if (msg.is_read) continue;

        const idStr = String(msg.id);
        if (seenSentRef.current.has(idStr)) continue;

        seenSentRef.current.add(idStr);
        newlyReadIds.push(Number(msg.id));
        incomingMarkedCount += 1;

        sendMarkReadOne(chatId, msg.id);
      }

      if (!newlyReadIds.length) return;

      const idsSet = new Set(newlyReadIds);

      setMessages((prev) =>
        prev.map((m) =>
          m?.id != null && idsSet.has(Number(m.id)) ? { ...m, is_read: true } : m
        )
      );

      // ✅ decrease unread ONLY when actually seen
      applyLocalSeenUpdate(chatId, incomingMarkedCount);
    },
    [selectedChatId, sendMarkReadOne, applyLocalSeenUpdate]
  );

  const markVisibleUnreadNow = useCallback(() => {
    const viewport = messagesViewportRef.current;
    const chatId = selectedChatIdRef.current ?? selectedChatId;
    if (!viewport || !chatId) return;

    const viewportRect = viewport.getBoundingClientRect();
    const nodes = viewport.querySelectorAll("[data-msgid]");
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

      const msg = currentMessages.find((x) => x?.id != null && String(x.id) === String(msgId));
      if (msg) visibleMessages.push(msg);
    });

    if (visibleMessages.length) markMessagesSeen(visibleMessages);
  }, [markMessagesSeen, selectedChatId]);

  // run after new messages render (real-time seen)
  useEffect(() => {
    if (!selectedChatId) return;
    const t = setTimeout(() => markVisibleUnreadNow(), 0);
    return () => clearTimeout(t);
  }, [selectedChatId, messages.length, markVisibleUnreadNow]);

  // scan on scroll + resize
  useEffect(() => {
    const viewport = messagesViewportRef.current;
    const chatId = selectedChatIdRef.current ?? selectedChatId;
    if (!viewport || !chatId) return;

    const onScroll = () => markVisibleUnreadNow();

    viewport.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    setTimeout(() => markVisibleUnreadNow(), 0);

    return () => {
      viewport.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [selectedChatId, markVisibleUnreadNow]);

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

      let nextUnread =
        typeof unreadCountOverride === "number"
          ? unreadCountOverride
          : typeof incomingChat?.unread_count === "number"
          ? incomingChat.unread_count
          : idx >= 0
          ? list[idx].unread_count || 0
          : 0;

      const me = currentUserIdRef.current;
      const lastSenderId = lastMsg?.sender_id ?? lastMsg?.sender;
      const lastIsMine =
        me != null &&
        lastSenderId != null &&
        String(lastSenderId) === String(me);

      // ✅ sender-side ONLY
      if (lastIsMine) nextUnread = 0;

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

  // =========================
  // Ensure chat exists
  // =========================
  const ensureChatIdForRecipient = useCallback(
    async (recipientId) => {
      const existing = selectedChatIdRef.current;
      if (existing) return existing;

      const res = await ensureChat(recipientId);
      if (!res?.success || !res?.data?.id) {
        throw new Error(res?.message || "Failed to create/find chat.");
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

  // =========================
  // Real-time message insert helper
  // =========================
  const pushMessageToOpenChat = useCallback(
    (chatId, msgObj) => {
      if (!chatId || !msgObj) return;
      if (String(chatId) !== String(selectedChatIdRef.current)) return;

      const withChat = msgObj?.chat_id ? msgObj : { ...msgObj, chat_id: chatId };
      setMessages((prev) => mergeMessages(prev, [withChat]));

      setTimeout(() => markVisibleUnreadNow(), 0);
    },
    [markVisibleUnreadNow]
  );

  // =========================
  // Debounced fetch for open chat (when WS doesn't include message object)
  // =========================
  const refetchTimerRef = useRef(null);
  const refetchInFlightRef = useRef(false);

  const refetchOpenChatMessagesDebounced = useCallback(
    (chatId) => {
      if (!chatId) return;
      if (String(chatId) !== String(selectedChatIdRef.current)) return;

      if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);

      refetchTimerRef.current = setTimeout(async () => {
        if (refetchInFlightRef.current) return;
        refetchInFlightRef.current = true;

        try {
          const res = await getChatMessages(chatId);
          if (res?.success) {
            const arr = Array.isArray(res.data) ? res.data : [];
            const normalized = arr.map((m) =>
              m?.chat_id ? m : { ...m, chat_id: chatId }
            );
            setMessages((prev) => mergeMessages(prev, normalized));
            setTimeout(() => markVisibleUnreadNow(), 0);
          }
        } finally {
          refetchInFlightRef.current = false;
        }
      }, 150);
    },
    [markVisibleUnreadNow]
  );

  useEffect(() => {
    return () => {
      if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
    };
  }, []);

  // =========================
  // WS connect
  // =========================
  useEffect(() => {
    const url = buildChatWsUrl();
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      flushPendingReadIds();
      setTimeout(() => markVisibleUnreadNow(), 0);
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
  console.log("[WS IN]", {
    type: data?.type,
    chatId: data?.chat?.id ?? data?.chat_id ?? null,
    msgId:
      data?.message?.id ??
      data?.chat?.last_message?.id ??
      null,
    ts:
      data?.message?.timestamp ??
      data?.chat?.last_message?.timestamp ??
      null,
    raw: data,
  });
      // read updates
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

      // new message / chat update
      if (
        (data?.type === "chat_list_update" || data?.type === "message_update") &&
        data?.chat?.id
      ) {
        const chat = data.chat;
        const chatId = chat.id;

        upsertChatAndSort(chat);

        const msgObj = data?.message || data?.chat?.message || data?.chat?.last_message || null;

        if (msgObj) {
          pushMessageToOpenChat(chatId, msgObj);
        } else {
          refetchOpenChatMessagesDebounced(chatId);
        }

        return;
      }

      // my own message ack
      if (data?.type === "message_sent" && data?.chat_id && data?.message) {
        const chatId = data.chat_id;
        const serverMsg = data.message;

        // sender-side: unread should stay 0
        upsertChatAndSort(chatId, serverMsg, 0);

        if (String(chatId) === String(selectedChatIdRef.current)) {
          setMessages((prev) => {
            const me = currentUserIdRef.current;
            const content = String(serverMsg.content ?? "");
            const normalizedServerMsg = serverMsg?.chat_id
              ? serverMsg
              : { ...serverMsg, chat_id: chatId };

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
              copy[replaceIndex] = { ...prevMsg, ...normalizedServerMsg, _optimistic: false };
              return mergeMessages(copy, []);
            }

            return mergeMessages(prev, [normalizedServerMsg]);
          });

          setTimeout(() => markVisibleUnreadNow(), 0);
        }

        return;
      }
    };

    ws.onerror = (e) => console.error("[WS] error", e);

    return () => {
      try {
        ws.close();
      } catch {}
      wsRef.current = null;
    };
  }, [
    applyReadUpdate,
    flushPendingReadIds,
    markVisibleUnreadNow,
    upsertChatAndSort,
    pushMessageToOpenChat,
    refetchOpenChatMessagesDebounced,
  ]);

  // =========================
  // Load chat list
  // =========================
  useEffect(() => {
    const loadChats = async () => {
      const res = await getChatList();
      if (res.success) {
        setChats(Array.isArray(res.data) ? res.data : []);
      } else {
        setChats([]);
        alert(res.message || "Error fetching chat list");
      }
    };
    loadChats();
  }, []);

  // =========================
  // Load messages on select
  // =========================
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    // Clear previous chat's messages before loading the new thread
    setMessages([]);

    const loadMessages = async () => {
      setLoadingMessages(true);
      const res = await getChatMessages(selectedChatId);
      setLoadingMessages(false);

      if (res.success) {
        const arr = Array.isArray(res.data) ? res.data : [];
        const normalized = arr.map((m) =>
          m?.chat_id ? m : { ...m, chat_id: selectedChatId }
        );
        setMessages(() => mergeMessages([], normalized));
      } else {
        setMessages([]);
        alert(res.message || "Error fetching messages");
      }
    };

    loadMessages();
  }, [selectedChatId]);

  // =========================
  // Select chat
  // =========================
  const handleSelectChat = useCallback(
    (chatId) => {
      setSelectedChatId(chatId);

      const chatObj = (Array.isArray(chats) ? chats : []).find(
        (c) => String(c.id) === String(chatId)
      );

      const other = chatObj?.other_participant;
      if (other?.id) setRecipient({ id: other.id, username: other.username || "Unknown" });
      else setRecipient(null);
    },
    [chats]
  );

  // =========================
  // Sidebar items
  // =========================
  const convItems = useMemo(() => {
    const safeChats = Array.isArray(chats) ? chats : [];
    const sorted = [...safeChats].sort(
      (a, b) => new Date(getChatSortTime(b)) - new Date(getChatSortTime(a))
    );

    return sorted.map((c) => {
      const lastContent = (c.last_message?.content || "").trim();
      const lastAttachmentType = getAttachmentTypeLabel(c.last_message?.attachments);
      const hint =
        lastContent ||
        (lastAttachmentType ? `[${lastAttachmentType}]` : "");

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
        // ✅ do NOT zero when opening; only sender-side safety
        unreadCount: isMineLast ? 0 : c.unread_count || 0,
        hint,
        isMineLast,
        lastIsRead: !!c.last_message?.is_read,
      };
    });
  }, [chats, currentUserId]);

  // =========================
  // Open chat header
  // =========================
  const openChat = useMemo(() => {
    if (!selectedChatId) return null;
    const c = convItems.find((x) => String(x.id) === String(selectedChatId));
    if (!c) return null;
    const title = recipient?.username || c.name;
    return { id: c.id, title, subtitle: "", avatar: c.avatar };
  }, [selectedChatId, convItems, recipient]);

  // =========================
  // Messages mapping
  // =========================
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

  // =========================
  // Send message
  // =========================
  const handleSend = useCallback(
    async (replyTarget) => {
      const text = inputValue.trim();
      if (!text) return;

      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        alert("WebSocket not connected. Try again.");
        return;
      }

      let chatId = selectedChatIdRef.current;
      if (!chatId) {
        const r = recipientRef.current;
        if (!r?.id) {
          alert("Recipient is required to create chat.");
          return;
        }
        try {
          chatId = await ensureChatIdForRecipient(r.id);
        } catch (e) {
          alert(e?.message || "Failed to create/find chat.");
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

      setMessages((prev) => mergeMessages(prev, [optimisticMsg]));
      setInputValue("");
      setTimeout(() => {
        const vp = messagesViewportRef.current;
        if (vp) vp.scrollTo({ top: vp.scrollHeight, behavior: "smooth" });
      }, 0);

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
        alert("Send failed.");
      } else {
        // sender-side: unread_count should stay 0
        upsertChatAndSort(chatId, { content: text, timestamp: nowIso, sender: currentUserId }, 0);
      }
    },
    [inputValue, currentUserId, ensureChatIdForRecipient, wsSend, upsertChatAndSort]
  );

  const handleSendAttachments = useCallback(
    async (type, files, meta = {}) => {
      if (!files || !files.length) return;

      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        alert("WebSocket not connected. Try again.");
        return;
      }

      let chatId = selectedChatIdRef.current;
      if (!chatId) {
        const r = recipientRef.current;
        if (!r?.id) {
          alert("Recipient is required to create chat.");
          return;
        }
        try {
          chatId = await ensureChatIdForRecipient(r.id);
        } catch (e) {
          alert(e?.message || "Failed to create/find chat.");
          return;
        }
      }

      const uploadRes = await uploadAttachments(files, type);
      if (!uploadRes?.success) {
        alert(uploadRes?.message || "Attachment upload failed.");
        return;
      }

      const uploaded = Array.isArray(uploadRes.data) ? uploadRes.data : [];
      if (!uploaded.length) {
        alert("No attachments uploaded.");
        return;
      }

      const ids = uploaded
        .map((a) => (a && a.id != null ? Number(a.id) : null))
        .filter((id) => id != null);

      const trimmedText = (meta?.text || "").trim();
      const replyTo = meta?.replyTo || null;
      const replyToId = replyTo?.id ?? null;
      const clientId = `tmp_att_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const nowIso = new Date().toISOString();

      const optimisticMsg = {
        id: null,
        client_temp_id: clientId,
        chat_id: chatId,
        sender: currentUserId,
        sender_name: "You",
        content: trimmedText,
        timestamp: nowIso,
        is_read: false,
        attachments: uploaded,
        _optimistic: true,
        reply_to: replyToId
          ? { id: replyToId, sender_name: replyTo.senderName, content: replyTo.text }
          : null,
      };

      setMessages((prev) => mergeMessages(prev, [optimisticMsg]));
      setInputValue("");

      const payload = {
        action: "send_message",
        chat_id: chatId,
        message: trimmedText,
        reply_to_id: replyToId,
        attachment_ids: ids,
      };

      const ok = wsSend(payload);

      if (!ok) {
        setMessages((prev) =>
          prev.map((m) => (m.client_temp_id === clientId ? { ...m, _failed: true } : m))
        );
        alert("Send failed.");
      } else {
        const previewContent = trimmedText || "[Attachment]";
        upsertChatAndSort(
          chatId,
          { content: previewContent, timestamp: nowIso, sender: currentUserId, attachments: uploaded },
          0
        );
      }
    },
    [currentUserId, ensureChatIdForRecipient, uploadAttachments, wsSend, upsertChatAndSort]
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
                    text: "Loading…",
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
          onAttach={handleSendAttachments}
          onMountMessagesViewport={handleMountMessagesViewport}
        />
      </div>
    </div>
  );
}
