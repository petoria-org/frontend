import React from "react";

export default function Conversations({
  items = [],
  selectedChatId,
  onSelectChat,
  search,
  onSearchChange,
  loading = false,
  skeletonCount = 6,
}) {

  return (
    <aside className="conv">
      <div className="conv__header">
        <div className="conv__title">گفتگوها</div>
      </div>

      <div className="conv__list">
        {loading ? Array.from({ length: skeletonCount }).map((_, index) => (
              <div className="convItem convItem--skeleton" key={`conv-skeleton-${index}`} aria-hidden="true">
                <div className="convItem__avatar conv-skeleton-block conv-skeleton-avatar"></div>
                <div className="name_hint_container">
                  <div className="conv-skeleton-block conv-skeleton-name"></div>
                  <div className="conv-skeleton-block conv-skeleton-hint"></div>
                </div>
                <div className="time_unread_container">
                  <div className="conv-skeleton-block conv-skeleton-time"></div>
                </div>
              </div>
            ))
          : items.map((c) => {
              const active = c.id === selectedChatId;
              const tick = c.isMineLast 
                ? (c.lastIsRead 
                    ? <img 
                        src="/src/icons/double-check.svg"  
                        alt="read" 
                        style={{
                          width: "16px",
                          height: "16px",
                          filter: "brightness(0) saturate(100%) invert(46%) sepia(14%) saturate(640%) hue-rotate(169deg)",
                        }}
                      />
                    : <img 
                        src="/src/icons/check.svg"
                        alt="sent"
                        style={{
                          width: "16px",
                          height: "16px",
                          filter: "brightness(0) saturate(100%) invert(46%) sepia(14%) saturate(640%) hue-rotate(169deg)",
                        }}                    
                      />) 
                : null;

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
                    <div className="convItem__timeCol">
                      {tick}
                      {c.time}
                    </div>
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

