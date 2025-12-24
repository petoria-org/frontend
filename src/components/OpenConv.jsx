import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function MessageBubble({ m, onReply, chatTitle }) {
  const isMine = m.side === "out";
  const safeText = m.text || "";
  const senderName = m.senderName || (isMine ? "You" : chatTitle || "Sender");

  return (
    // ✅ data-msgid added for IntersectionObserver (only real ids will be set)
    <div
      className={`msgRow ${isMine ? "msgRow--out" : "msgRow--in"}`}
      data-msgid={m.id ?? ""}
    >
      <div className={`msg ${isMine ? "msg--out" : ""}`}>
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

/** Portal menu rendered into <body> so it never gets clipped */
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
      style={{
        top: pos.top,
        left: pos.left,
        transform: "translateY(-100%)",
      }}
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

  // ✅ NEW: used by Chat.jsx for partial seen tracking
  onMountMessagesViewport,
}) {
  const bottomRef = useRef(null);
  const attachBtnRef = useRef(null);

  // ✅ NEW: ref to the scrollable messages container
  const messagesViewportRef = useRef(null);

  const [attachOpen, setAttachOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);

  // expose viewport to parent once mounted
  useEffect(() => {
    onMountMessagesViewport?.(messagesViewportRef.current);
  }, [onMountMessagesViewport]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (replyTarget) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [replyTarget]);

  useEffect(() => {
    setReplyTarget(null);
  }, [chat?.id]);

  const handleSendClick = () => {
    if (!chat) return;
    if (!inputValue.trim()) return;
    onSend?.(replyTarget); // ✅ sends replyTarget up to Chat.jsx
    setReplyTarget(null);
  };

  const handleReplyPick = (msg) => {
    if (!msg) return;
    const textSnippet = (msg.text || "").trim();
    setReplyTarget({
      id: msg.id,
      text: textSnippet || "(No text)",
      senderName: msg.senderName || (msg.side === "out" ? "You" : chat?.title || "Sender"),
    });
  };

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
      <div style={{ display: "flex", flexDirection: "column", width: "100%", minHeight: 0 }}>
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

        {/* ✅ this MUST be the scroll container */}
        <div
          ref={messagesViewportRef}
          className={replyTarget ? "open__messages open__messages--withReply" : "open__messages"}
        >
          {messages.map((m) => (
            <MessageBubble
              key={m.id ?? m.client_temp_id ?? `${m.time}_${Math.random()}`}
              m={m}
              onReply={handleReplyPick}
              chatTitle={chat.title}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {replyTarget && (
          <div className="replyPreview" title={replyTarget.text}>
            <div className="replyPreview__text">
              ({replyTarget.senderName} : {replyTarget.text})
            </div>
            <button
              type="button"
              className="replyPreview__close"
              aria-label="cancel reply"
              onClick={() => setReplyTarget(null)}
            >
              x
            </button>
          </div>
        )}

        <div className="open__composer">
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
