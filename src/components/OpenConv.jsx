import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

function MessageBubble({ m, onReply, chatTitle, onJumpToMessage }) {
  const isMine = m.side === "out";
  const safeText = m.text || "";
  const senderName = m.senderName || (isMine ? "You" : chatTitle || "Sender");

  const reply = m.replyTo?.id
    ? {
        id: m.replyTo.id,
        name: m.replyTo.sender_name || "User",
        text: m.replyTo.content || "",
      }
    : null;

  return (
    <div
      className={`msgRow ${isMine ? "msgRow--out" : "msgRow--in"}`}
      // ✅ observe only real server messages
      data-msgid={m.id != null ? String(m.id) : ""}
    >
      <div className={`msg ${isMine ? "msg--out" : ""}`}>
        {reply && (
          <div
            className={`replyQuote ${isMine ? "replyQuote--out" : "replyQuote--in"}`}
            role="button"
            tabIndex={0}
            title="Jump to replied message"
            onClick={() => onJumpToMessage?.(reply.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onJumpToMessage?.(reply.id);
            }}
          >
            <div className="replyQuote__bar" />
            <div className="replyQuote__content">
              <div className="replyQuote__name">{reply.name}</div>
              <div className="replyQuote__text">{reply.text}</div>
            </div>
          </div>
        )}

        <button
          type="button"
          className={`msg__replyBtn ${isMine ? "msg__replyBtn--out" : "msg__replyBtn--in"}`}
          aria-label="reply to message"
          onClick={() => onReply?.({ ...m, text: safeText, senderName })}
          title="Reply"
        >
          {"\u21a9"}
        </button>

        {!!safeText && <div className="msg__text">{safeText}</div>}

        <div className="msg__meta">
          <span className="msg__time">{m.time}</span>

          {isMine && (
            <span className={`msg__tick msg__tick--${m.status || "sent"}`}>
              {m.status === "seen" ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function AttachMenuPortal({ open, anchorEl, onClose, onPick }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !anchorEl) return;

    const update = () => {
      const r = anchorEl.getBoundingClientRect();
      const top = r.top - 8;
      const left = r.left;
      setPos({ top, left });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, anchorEl]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (anchorEl && anchorEl.contains(e.target)) return;
      onClose?.();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, anchorEl, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="attachMenuPortal"
      style={{ top: pos.top, left: pos.left, transform: "translateY(-100%)" }}
      role="menu"
      aria-label="attach options"
    >
      <button
        type="button"
        className="attachMenu__item"
        onClick={() => {
          onClose?.();
          onPick?.("image");
        }}
      >
        🖼️ تصاویر
      </button>

      <button
        type="button"
        className="attachMenu__item"
        onClick={() => {
          onClose?.();
          onPick?.("video");
        }}
      >
        🎥 ویدیو
      </button>
    </div>,
    document.body
  );
}

export default function OpenConv({
  chat = null,
  messages = [],
  inputValue = "",
  onInputChange,
  onSend,
  onAttach,
  onMountMessagesViewport,
}) {
  const bottomRef = useRef(null);
  const attachBtnRef = useRef(null);
  const messagesViewportRef = useRef(null);
  const pendingScrollOnSendRef = useRef(false);
  const prevMessageCountRef = useRef(Array.isArray(messages) ? messages.length : 0);

  const [attachOpen, setAttachOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);

  useEffect(() => {
    onMountMessagesViewport?.(messagesViewportRef.current);
  }, [onMountMessagesViewport]);

  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const nextCount = Array.isArray(messages) ? messages.length : 0;
    const newMessages =
      Array.isArray(messages) && nextCount > prevCount ? messages.slice(prevCount, nextCount) : [];
    const hasNewOutgoing = newMessages.some((msg) => msg?.side === "out");

    if (pendingScrollOnSendRef.current && hasNewOutgoing) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      pendingScrollOnSendRef.current = false;
    }

    prevMessageCountRef.current = nextCount;
  }, [messages]);

  useEffect(() => {
    setReplyTarget(null);
  }, [chat?.id]);

  const handleSendClick = useCallback(() => {
    if (!chat) return;
    if (!inputValue.trim()) return;
    pendingScrollOnSendRef.current = true;
    onSend?.(replyTarget);
    setReplyTarget(null);
  }, [chat, inputValue, onSend, replyTarget]);

  const handleReplyPick = useCallback(
    (msg) => {
      if (!msg?.id) return;
      const textSnippet = (msg.text || "").trim();
      setReplyTarget({
        id: msg.id,
        text: textSnippet || "(No text)",
        senderName: msg.senderName || (msg.side === "out" ? "You" : chat?.title || "Sender"),
      });
    },
    [chat?.title]
  );

  const jumpToMessage = useCallback((msgId) => {
    const viewport = messagesViewportRef.current;
    if (!viewport || !msgId) return;
    const el = viewport.querySelector(`[data-msgid="${msgId}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  if (!chat) {
    return (
      <section className="open">
        <div className="emptyState">
          <div className="emptyState__title">یک گفتگو را انتخاب کنید</div>
        </div>
      </section>
    );
  }

  return (
    <section className="open">
      <div
        className="open__col"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          minHeight: 0,
        }}
      >
        <div className="open__top">
          <div className="open__profile">
            <img className="open__avatar" src={chat.avatar} alt={chat.title} />
            <div className="open__name">{chat.title}</div>
          </div>
        </div>

        <div className="open__sub">
          <span className="open__subIcon">🐾</span>
          {chat.subtitle}
        </div>

        <div
          ref={messagesViewportRef}
          className="open__messages"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            position: "relative",
          }}
        >
          {messages.map((m) => (
            <MessageBubble
              key={m.id ?? m.client_temp_id ?? `${m.time}_${Math.random()}`}
              m={m}
              onReply={handleReplyPick}
              chatTitle={chat.title}
              onJumpToMessage={jumpToMessage}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {replyTarget && (
          <div className="replyComposer" style={{ flex: "0 0 auto" }}>
            <div className="replyComposer__bar" />
            <div className="replyComposer__text">
              <div className="replyComposer__name">{replyTarget.senderName}</div>
              <div className="replyComposer__snippet">{replyTarget.text}</div>
            </div>
            <button
              type="button"
              className="replyComposer__close"
              aria-label="cancel reply"
              onClick={() => setReplyTarget(null)}
              title="Cancel reply"
            >
              ×
            </button>
          </div>
        )}

        <div className="open__composer" style={{ flex: "0 0 auto" }}>
          <button
            className="sendBtn"
            type="button"
            onClick={handleSendClick}
            aria-label="send"
            disabled={!chat}
          >
            ➤
          </button>

          <input
            className="composer__input"
            value={inputValue}
            onChange={(e) => onInputChange?.(e.target.value)}
            placeholder="پیام خود را بنویسید…"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendClick();
            }}
            disabled={!chat}
          />

          <div className="attachWrap">
            <button
              ref={attachBtnRef}
              className="iconBtn"
              type="button"
              aria-label="attach"
              onClick={() => setAttachOpen((v) => !v)}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <AttachMenuPortal
        open={attachOpen}
        anchorEl={attachBtnRef.current}
        onClose={() => setAttachOpen(false)}
        onPick={(type) => onAttach?.(type)}
      />
    </section>
  );
}
