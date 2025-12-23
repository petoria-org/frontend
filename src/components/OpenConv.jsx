import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

function MessageBubble({ m }) {
  const isMine = m.side === "out";

  return (
    <div className={`msgRow ${isMine ? "msgRow--out" : "msgRow--in"}`}>
      <div className={`msg ${isMine ? "msg--out" : ""}`}>
        {!!m.text && <div className="msg__text">{m.text}</div>}

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
      // menu above the button (similar to your previous bottom: 48px)
      const top = r.top - 8; // we will translate up with CSS via transform
      const left = r.left;   // align left edge; rtl is ok
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

  // close on outside click (since it's in body)
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      // if click is on anchor, ignore (button handler already toggles)
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
        transform: "translateY(-100%)", // pop above the button
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
}) {
  const bottomRef = useRef(null);
  const attachBtnRef = useRef(null);
  const [attachOpen, setAttachOpen] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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

        <div className="open__messages">
          {messages.map((m) => (
            <MessageBubble key={m.id} m={m} />
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="open__composer">
          <button
            className="sendBtn"
            type="button"
            onClick={onSend}
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
              if (e.key === "Enter") onSend?.();
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
