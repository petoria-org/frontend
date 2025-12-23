// src/pages/Chats.jsx
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

  const currentUserId = useMemo(() => getCurrentUserIdFromAccessToken(), []);

  // ✅ WebSocket ref (connect once on page load)
  const wsRef = useRef(null);

  // Keep a map from clientTempId -> serverMessageId (optional)
  const pendingMapRef = useRef(new Map());

  // ✅ Connect WS when user enters ChatPage
  useEffect(() => {
    const url = buildChatWsUrl();
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      // Try parse JSON; if backend sends plain text, we just log it
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        console.log("WS message:", event.data);
        return;
      }

      /**
       * EXPECTED-ish shapes (adjust to your backend):
       * 1) Incoming message:
       *    { type:"chat_message", message:{ id, chat, sender, content, timestamp, is_read } }
       * 2) Ack for your sent message:
       *    { type:"message_ack", client_id:"tmp_...", message:{ id, chat, sender, content, timestamp, is_read } }
       */

      if (data?.type === "message_ack" && data?.client_id && data?.message) {
        const clientId = data.client_id;
        const serverMsg = data.message;

        setMessages((prev) =>
          prev.map((m) => {
            if (m.client_temp_id === clientId) {
              return {
                ...m,
                id: serverMsg.id ?? m.id,
                timestamp: serverMsg.timestamp ?? m.timestamp,
                is_read: serverMsg.is_read ?? m.is_read,
                _optimistic: false,
              };
            }
            return m;
          })
        );

        pendingMapRef.current.delete(clientId);
        return;
      }

      if (data?.type === "chat_message" && data?.message) {
        const msg = data.message;

        // If message belongs to currently open chat, append it
        if (String(msg.chat) === String(selectedChatId)) {
          setMessages((prev) => {
            // prevent duplicates if server echoes the same message id
            if (msg.id && prev.some((x) => x.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }

        // (optional) update sidebar last_message/unread_count could be done later
        return;
      }

      console.log("WS JSON:", data);
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    // ✅ cleanup when leaving page
    return () => {
      try {
        ws.close();
      } catch {}
      wsRef.current = null;
    };
  }, [selectedChatId]);

  // 1) Load chat list
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

  // Sidebar mapping
  const convItems = useMemo(() => {
    const safeChats = Array.isArray(chats) ? chats : [];
    return safeChats.map((c) => ({
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

    return { id: c.id, title: c.name, subtitle: "", avatar: c.avatar };
  }, [selectedChatId, convItems]);

  // Messages mapping for OpenConv
  const openMessages = useMemo(() => {
    const safe = Array.isArray(messages) ? messages : [];

    return safe.map((m) => {
      const isMine = currentUserId != null && m.sender === currentUserId;

      return {
        id: m.id ?? m.client_temp_id, // fallback for optimistic
        side: isMine ? "out" : "in",
        text: m.content || "",
        time: formatTime(m.timestamp),
        status: isMine ? (m.is_read ? "seen" : "sent") : undefined,
        attachments: [],
        senderName:
          m.sender_name ||
          m.sender_username ||
          m.sender_fullname ||
          (isMine ? "You" : "Other"),
      };
    });
  }, [messages, currentUserId]);

  const handleSend = () => {
    const t = inputValue.trim();
    if (!t || !selectedChatId) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("اتصال وب‌سوکت برقرار نیست. دوباره تلاش کنید.");
      return;
    }

    // optimistic message (matches your backend-ish fields)
    const clientId = `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const nowIso = new Date().toISOString();

    const optimisticMsg = {
      id: null,
      client_temp_id: clientId,
      chat: selectedChatId,
      sender: currentUserId,
      content: t,
      timestamp: nowIso,
      is_read: false,
      _optimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputValue("");

    // payload to server (adjust keys if needed)
    const payload = {
      type: "chat_message",
      chat_id: selectedChatId,
      content: t,
      client_id: clientId, // so server can ack and we can match it
    };

    try {
      ws.send(JSON.stringify(payload));
      pendingMapRef.current.set(clientId, true);
    } catch (e) {
      console.error("WS send failed:", e);
      // mark optimistic message as failed (optional)
      setMessages((prev) =>
        prev.map((m) =>
          m.client_temp_id === clientId ? { ...m, _failed: true } : m
        )
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
          onSelectChat={setSelectedChatId}
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
