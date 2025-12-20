import React, { useMemo, useState } from "react";
import OpenConv from "../components/OpenConv";
import Conversations from "../components/Conversations";
import { Navbar_SignIn } from "../components/Navbar_SignIn";
import "../styles/Chats.css";

import { chatEvents } from "../mock/chatEvents";

const CURRENT_USER_ID = 1;

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
}

function buildStateFromEvents(events) {
  const chatsById = new Map();
  const messagesByChatId = new Map();

  for (const e of events) {
    if (e.type !== "chat_list_update" || !e.chat) continue;

    const chat = e.chat;

    chatsById.set(chat.id, {
      id: chat.id,
      unread_count: chat.unread_count,
      last_message: chat.last_message,
    });

    if (chat.last_message) {
      const cid = chat.id;
      const arr = messagesByChatId.get(cid) || [];
      if (!arr.some((m) => m.id === chat.last_message.id)) {
        arr.push(chat.last_message);
      }
      messagesByChatId.set(cid, arr);
    }
  }

  return {
    chats: Array.from(chatsById.values()).sort((a, b) => {
      const ta = a.last_message?.timestamp || 0;
      const tb = b.last_message?.timestamp || 0;
      return new Date(tb) - new Date(ta);
    }),
    messagesByChatId,
  };
}

export default function ChatPage() {
  const { chats, messagesByChatId } = useMemo(
    () => buildStateFromEvents(chatEvents),
    []
  );

  const [selectedChatId, setSelectedChatId] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const convItems = useMemo(() => {
    return chats.map((c) => {
      let tag = "پیدا شده: گلدن رتریور";
      let tagStyle = "blue";

      if (c.id === 8) {
        tag = "سرپرستی: لونا";
        tagStyle = "green";
      }
      if (c.id === 9) {
        tag = "گم شده: بادی";
        tagStyle = "red";
      }

      return {
        id: c.id,
        name: c.last_message?.sender_name || "—",
        time: c.last_message?.timestamp
          ? formatTime(c.last_message.timestamp)
          : "",
        tag,
        tagStyle,
        unreadCount: c.unread_count || 0,
        hint: c.last_message?.content || "—",
      };
    });
  }, [chats]);

  const openMessages = useMemo(() => {
    if (!selectedChatId) return [];
    const raw = messagesByChatId.get(selectedChatId) || [];

    return raw.map((m) => ({
      id: m.id,
      side: m.sender_id === CURRENT_USER_ID ? "out" : "in",
      text: m.content || "",
      time: formatTime(m.timestamp),
      status: m.is_read ? "seen" : "delivered",
      attachments: (m.attachments || []).map((a) => ({
        type: a.type,
        url: a.url,
        name: a.name,
      })),
    }));
  }, [messagesByChatId, selectedChatId]);

  const openChat = useMemo(() => {
    if (!selectedChatId) return null;

    const c = convItems.find((x) => x.id === selectedChatId);
    return {
      id: selectedChatId,
      title: c?.name || "—",
      subtitle: c ? `گفتگو درمورد ${c.tag}` : "",
    };
  }, [selectedChatId, convItems]);

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
          messages={openMessages}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          onAttach={() => alert("attach")}
        />
      </div>
    </div>
  );
}
