import React from "react";

export default function Conversations({
  items = [],
  selectedChatId,
  onSelectChat,
  search,
  onSearchChange,
}) {
  return (
    <aside className="conv">
      <div className="conv__header">
        <div className="conv__title">گفتگوها</div>
      </div>

      <div className="conv__list">
        {items.map((c) => {
          const active = c.id === selectedChatId;
          return (
            <button
              key={c.id}
              className={`convItem ${active ? "convItem--active" : ""}`}
              onClick={() => onSelectChat?.(c.id)}
              type="button"
            >
              <img
                className="convItem__avatar"
                src={c.avatar}
                alt={c.name}
              />
              <div className="name_hint_container">
                <div className="convItem__name">{c.name}</div>
                <div className="convItem__hint">{c.hint}</div>
              </div>

              <div className="time_unread_container">
                <div className="convItem__timeCol">{c.time}</div>
                {c.unreadCount > 0 && (
                  <span className="convItem__unread">{c.unreadCount}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
