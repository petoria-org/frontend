// src/pages/Chats.jsx  (or src/pages/chat.jsx)
import React, { useEffect, useMemo, useState } from "react";
import OpenConv from "../components/OpenConv";
import Conversations from "../components/Conversations";
import { Navbar_SignIn } from "../components/Navbar_SignIn";
import "../styles/Chats.css";

import { getChatList, getChatMessages } from "../Services/chatService";

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
    const payloadJson = atob(
      payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
    );
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
        const arr = Array.isArray(res.data) ? res.data : [];
        // backend often newest-first; reverse to show oldest -> newest
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
      name:
        c.other_participant?.username ||
        c.last_message?.sender_name ||
        "Unknown",
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

    return {
      id: c.id,
      title: c.name,
      subtitle: "",
      avatar: c.avatar,
    };
  }, [selectedChatId, convItems]);

  // Messages mapping for OpenConv (tick logic based on is_read + mine)
  const openMessages = useMemo(() => {
    const safe = Array.isArray(messages) ? messages : [];

    return safe.map((m) => {
      const isMine = currentUserId != null && m.sender === currentUserId;

      return {
        id: m.id,
        side: isMine ? "out" : "in",
        text: m.content || "",
        time: formatTime(m.timestamp),
        // ✅ my message: seen -> double tick, else single tick
        status: isMine ? (m.is_read ? "seen" : "sent") : undefined,
        attachments: [],
      };
    });
  }, [messages, currentUserId]);

  const handleSend = () => {
    const t = inputValue.trim();
    if (!t || !selectedChatId) return;

    alert(`Send to chat ${selectedChatId}: ${t}`);
    setInputValue("");
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
          onAttach={() => alert("attach")}
        />
      </div>
    </div>
  );
}
