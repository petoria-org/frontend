import React, { useEffect, useMemo, useRef, useState } from "react";
import OpenConv from "../components/OpenConv";
import Conversations from "../components/Conversations";
import { Navbar_SignIn } from "../components/Navbar_SignIn";
import "../styles/Chats.css";

import { getChatList, getChatMessages, buildChatWsUrl } from "../Services/chatService";

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

  // ✅ store current open recipient (must come from chat list: other_participant)
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

  // ✅ Connect ONCE when user enters ChatPage
  useEffect(() => {
    const url = buildChatWsUrl();
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      // if a chat already selected (rare), open it
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

      // ✅ 1) Confirm your sent message
      // { type:"message_sent", chat_id:6, message:{...} }
      if (data?.type === "message_sent" && data?.chat_id && data?.message) {
        const serverChatId = data.chat_id;
        const serverMsg = data.message;

        if (String(serverChatId) === String(selectedChatIdRef.current)) {
          setMessages((prev) => {
            // Replace the first optimistic message that matches mine + same text
            const me = currentUserIdRef.current;
            const idx = prev.findIndex(
              (m) =>
                m?._optimistic &&
                Number(m.sender_id ?? m.sender) === Number(me) &&
                String(m.content ?? "") === String(serverMsg.content ?? "")
            );

            if (idx === -1) {
              // Not found: avoid duplicates by id, else append
              if (serverMsg.id && prev.some((x) => x.id === serverMsg.id)) return prev;
              return [...prev, serverMsg];
            }

            const copy = [...prev];
            copy[idx] = {
              ...serverMsg,
              _optimistic: false,
              client_temp_id: prev[idx]?.client_temp_id,
            };
            return copy;
          });
        }

        return;
      }

      // ✅ 2) Update chat list
      // { type:"chat_list_update", chat:{ id, last_message, unread_count } }
      if (data?.type === "chat_list_update" && data?.chat?.id) {
        const c = data.chat;
        const chatId = c.id;

        setChats((prev) => {
          const list = Array.isArray(prev) ? [...prev] : [];
          const idx = list.findIndex((x) => String(x.id) === String(chatId));

          if (idx >= 0) {
            list[idx] = {
              ...list[idx],
              last_message: c.last_message ?? list[idx].last_message,
              unread_count:
                typeof c.unread_count === "number" ? c.unread_count : list[idx].unread_count,
            };
          } else {
            list.push({
              id: chatId,
              last_message: c.last_message,
              unread_count: c.unread_count || 0,
              other_participant: { username: "Unknown" },
              avatar: "https://i.pravatar.cc/80?img=12",
            });
          }

          list.sort(
            (a, b) =>
              new Date(b?.last_message?.timestamp || b?.updated_at || 0) -
              new Date(a?.last_message?.timestamp || a?.updated_at || 0)
          );

          return list;
        });

        return;
      }

      // Any other message types (you can extend later for incoming "new_message")
      console.log("WS JSON:", data);
    };

    ws.onerror = (e) => console.error("WebSocket error:", e);
    ws.onclose = () => console.log("WebSocket closed");

    return () => {
      try {
        wsSend({ action: "close_chat" });
      } catch {}
      try {
        ws.close();
      } catch {}
      wsRef.current = null;
    };
  }, []);

  // 1) Load chat list
  useEffect(() => {
    const loadChats = async () => {
      const res = await getChatList();
      if (res.success) {
        const data = Array.isArray(res.data?.results) ? res.data.results : res.data;
        setChats(Array.isArray(data) ? data : []);
      } else {
        setChats([]);
        alert(res.message || "خطا در دریافت لیست گفتگوها");
      }
    };
    loadChats();
  }, []);

  // 2) Load messages on chat select
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
        const arr = Array.isArray(res.data?.results)
          ? res.data.results
          : Array.isArray(res.data)
          ? res.data
          : [];
        setMessages(arr.slice().reverse());
      } else {
        setMessages([]);
        alert(res.message || "خطا در دریافت پیام‌ها");
      }
    };

    loadMessages();
  }, [selectedChatId]);

  // ✅ Handle chat selection: save recipient + open_chat in WS
  const handleSelectChat = (chatId) => {
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

    // Tell backend which chat is active for this WS connection
    wsSend({ action: "open_chat", chat_id: chatId });
  };

  // Sidebar mapping
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
      avatar: c.other_participant?.avatar || "https://i.pravatar.cc/80?img=12",
      time: c.last_message?.timestamp ? formatTime(c.last_message.timestamp) : "",
      tag: "chat",
      unreadCount: c.unread_count || 0,
      hint: c.last_message?.content || "",
    }));
  }, [chats]);

  // Open chat header
  const openChat = useMemo(() => {
    if (!selectedChatId) return null;

    const c = convItems.find((x) => x.id === selectedChatId);
    if (!c) return null;

    // prefer recipient username if available
    const title = recipient?.username || c.name || "Unknown";

    return { id: c.id, title, subtitle: "", avatar: c.avatar };
  }, [selectedChatId, convItems, recipient]);

  // Messages mapping for OpenConv
  const openMessages = useMemo(() => {
    const safe = Array.isArray(messages) ? messages : [];

    return safe.map((m) => {
      const senderId = m.sender_id ?? m.sender;
      const isMine = currentUserId != null && Number(senderId) === Number(currentUserId);

      return {
        id: m.id ?? m.client_temp_id,
        side: isMine ? "out" : "in",
        text: m.content || "",
        time: formatTime(m.timestamp),
        status: isMine ? (m.is_read ? "seen" : "sent") : undefined,
        attachments: m.attachments || [],
        senderName: m.sender_name || (isMine ? "You" : "Other"),
      };
    });
  }, [messages, currentUserId]);

  // ✅ Send message using recipientRef + include chat_id to avoid wrong chat updates
  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || !selectedChatId) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("اتصال وب‌سوکت برقرار نیست. دوباره تلاش کنید.");
      return;
    }

    const r = recipientRef.current;
    if (!r?.id) {
      alert("طرف مقابل این گفتگو مشخص نیست (other_participant=null). لطفاً از بک‌اند اصلاح شود.");
      return;
    }

    // optimistic message
    const clientId = `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const nowIso = new Date().toISOString();

    const optimisticMsg = {
      id: null,
      client_temp_id: clientId,
      chat_id: selectedChatId,
      sender_id: currentUserId,
      sender_name: "You",
      content: text,
      timestamp: nowIso,
      is_read: false,
      reply_to: null,
      attachments: [],
      _optimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputValue("");

    // ✅ payload matches backend receive() AND forces correct chat
    const payload = {
      action: "send_message",
      chat_id: selectedChatId, // ✅ IMPORTANT: prevent backend from routing to wrong chat
      recipient_id: r.id,
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
        />
      </div>
    </div>
  );
}
