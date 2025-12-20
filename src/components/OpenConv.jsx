import React, { useEffect, useRef } from "react";

function MessageBubble({ m }) {
  const isMine = m.side === "out";
  const hasAttachments = (m.attachments?.length || 0) > 0;

  return (
    <div className={`msgRow ${m.side === "out" ? "msgRow--out" : "msgRow--in"}`}>
      <div className={`msg ${m.side === "out" ? "msg--out" : ""}`}>
        {!!m.text && <div className="msg__text">{m.text}</div>}

        {hasAttachments && (
          <div className="msg__attachments">
            {m.attachments.map((a, idx) => {
              if (a.type === "image") {
                return (
                  <img
                    key={idx}
                    className="msg__image"
                    src={a.url}
                    alt={a.name || "attachment"}
                  />
                );
              }
              return (
                <a
                  key={idx}
                  className="msg__file"
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  📎 {a.name || "فایل"}
                </a>
              );
            })}
          </div>
        )}

        <div className="msg__meta">
          <span className="msg__time">{m.time}</span>
          {isMine && (
            <span className={`msg__tick msg__tick--${m.status || "sent"}`}>
              {m.status === "seen" ? "✓✓" : m.status === "delivered" ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!chat) {
    return (
      <section className="open empty">
        <div className="emptyState">
          <div className="emptyState__title">یک گفتگو را انتخاب کنید</div>
        </div>
      </section>
    );
  }

  return (
    <section className="open">
      <div className="open__top">
        <div className="open__profile">
          <div className="open__name">{chat.title}</div>
          <div className="open__avatar" />
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
        <button className="iconBtn" type="button" onClick={onAttach} aria-label="attach">
          +
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

        <button className="sendBtn" type="button" onClick={onSend} aria-label="send" disabled={!chat}>
          ➤
        </button>
      </div>
    </section>
  );
}
