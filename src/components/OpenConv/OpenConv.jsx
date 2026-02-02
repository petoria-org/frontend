// OpenConv.jsx
import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { config } from "../../config";
import api from "../../Services/api";
import { NotificationToast } from "../NotificationToast";

const ABS_URL_RE = /^https?:\/\//i;

const makeAbsoluteUrl = (path) => {
  if (!path) return null;
  const pathStr = String(path).trim();
  if (!pathStr) return null;
  if (pathStr.startsWith("data:") || pathStr.startsWith("blob:")) return pathStr;
  if (
    pathStr.startsWith("/assets/") ||
    pathStr.startsWith("assets/") ||
    pathStr.startsWith("/src/") ||
    pathStr.startsWith("src/")
  ) {
    return pathStr;
  }
  if (ABS_URL_RE.test(pathStr)) return pathStr;
  const base = (config?.BACKEND_URL || "").replace(/\/$/, "");
  const normalized = pathStr.startsWith("/") ? pathStr : `/${pathStr}`;
  return `${base}${normalized}` || null;
};

const buildDownloadUrl = (att) => {
  if (!att) return null;
  if (att.download_url) return makeAbsoluteUrl(att.download_url);
  if (att.id != null) return makeAbsoluteUrl(`/api/chat/attachments/${att.id}/download/`);
  return null;
};

const getAttachmentLabel = (att, hrefFallback = "") => {
  const fromName =
    att?.name ||
    att?.filename ||
    att?.file_name ||
    att?.original_filename ||
    att?.original_name;
  if (fromName) return fromName;
  if (att?.id != null) return `Attachment #${att.id}`;
  if (hrefFallback) return hrefFallback.split("/").pop() || "Attachment";
  return "Attachment";
};

const downloadAttachment = async (att , notify) => {
  const downloadUrl = buildDownloadUrl(att);
  if (!downloadUrl) return;

  try {
    const res = await api.get(downloadUrl, { responseType: "blob" });
    const blobUrl = window.URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = getAttachmentLabel(att, downloadUrl);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (e) {
    console.error("Attachment download failed", e);
    if (typeof notify === "function") {
      notify("Download failed. Please try again.", "error");
    }
  }
};

const StatusTick = ({ status }) => {
  if (status === "seen") {
    return <img className="msg__tick-icon" src="/src/assets/icons/double-check.svg" alt="seen" />;
  } else if (status === "sent" || status === "delivered") {
    return <img className="msg__tick-icon" src="/src/assets/icons/check.svg" alt="sent" />;
  }
  return null;
};

function MessageBubble({ m, onReply, chatTitle, onJumpToMessage }) {
  const isMine = m.side === "out";
  const safeText = m.text || "";
  const senderName = m.senderName || (isMine ? "You" : chatTitle || "Sender");
  const attachments = Array.isArray(m.attachments) ? m.attachments : [];

  const reply = m.replyTo?.id
    ? {
        id: m.replyTo.id,
        name: m.replyTo.sender_name || "User",
        text: m.replyTo.content || "",
      }
    : null;

  const renderAttachment = (att, idx) => {
    const viewUrl = makeAbsoluteUrl(att?.url || att?.file_url);
    const downloadUrl = buildDownloadUrl(att);
    const label = getAttachmentLabel(att, viewUrl || downloadUrl);
    const type = (att?.type || att?.content_type || "").toLowerCase();
    const urlLower = (viewUrl || "").toLowerCase();
    const isImage =
      type.startsWith("image") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(urlLower);
    const isVideo = type.startsWith("video") || /\.(mp4|webm|ogg|mov)$/i.test(urlLower);
    const fileTag = (type.split("/")[0] || "file").toUpperCase();

    return (
      <div className="msg__attachment" key={att?.id ?? `${m.id ?? "msg"}_att_${idx}`}>
        <div className="msg__attachmentCard">
          {downloadUrl && (
            <button
              type="button"
              className="msg__attachmentDlBtn"
              aria-label="download attachment"
              title="Download"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                downloadAttachment(att, m?.notify);
              }}
            >
              ⬇
            </button>
          )}

          {isImage && viewUrl ? (
            <a className="msg__attachmentThumbLink" href={viewUrl} target="_blank" rel="noopener noreferrer">
              <img className="msg__attachmentThumb" src={viewUrl} alt={label} loading="lazy" />
            </a>
          ) : isVideo && viewUrl ? (
            <video className="msg__attachmentVideo" src={viewUrl} controls />
          ) : (
            <a
              className="msg__attachmentFileCard"
              href={viewUrl || downloadUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="msg__attachmentFileIcon">{fileTag}</span>
              <span className="msg__attachmentFileName">{label}</span>
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`msgRow ${isMine ? "msgRow--out" : "msgRow--in"}`} data-msgid={m.id != null ? String(m.id) : ""}>
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

        {attachments.length > 0 && <div className="msg__attachments">{attachments.map((att, idx) => renderAttachment(att, idx))}</div>}
        {!!safeText && <div className="msg__text">{safeText}</div>}

        <div className="msg__meta">
          <span className="msg__time">{m.time}</span>
          {isMine && (
            <span className={`msg__tick msg__tick--${m.status || "sent"}`}>
              <StatusTick status={m.status} />
            </span>
          )}
        </div>
        
      </div>
    </div>
  );
}

// Simple Attach Menu Component
function SimpleAttachMenu({ open, anchorEl, onClose, onPick }) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        anchorEl &&
        !anchorEl.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, anchorEl, onClose]);

  if (!open) return null;

  const rect = anchorEl?.getBoundingClientRect();
  const style = rect
    ? {
        position: "fixed",
        top: `${rect.top - 100}px`,
        left: `${rect.left - 40}px`,
        zIndex: 1000,
        transform: "translateY(-10px)",
      }
    : { display: "none" };

  return (
    <div ref={menuRef} className="modernAttachMenu" style={style}>
      <div className="modernAttachMenu__arrow"></div>
      <button
        type="button"
        className="modernAttachMenu__item"
        onClick={() => {
          onPick?.("image");
          onClose();
        }}
      >
        <span className="modernAttachMenu__icon">🖼️</span>
        <span className="modernAttachMenu__text">تصاویر</span>
      </button>
      <button
        type="button"
        className="modernAttachMenu__item"
        onClick={() => {
          onPick?.("video");
          onClose();
        }}
      >
        <span className="modernAttachMenu__icon">🎥</span>
        <span className="modernAttachMenu__text">ویدیو</span>
      </button>
    </div>
  );
}
// Attachment Modal Component
function AttachmentModal({ isOpen, type, onClose, onSend }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // ✅ null instead of ""
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const currentFile = selectedFiles[currentFileIndex];

  // Create + revoke preview URL for current file (prevents memory leaks)
  useEffect(() => {
    if (!currentFile) {
      setCurrentPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(currentFile);
    setCurrentPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [currentFile]);
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const filteredFiles = files.filter((file) => {
      if (type === "image") return file.type.startsWith("image/");
      if (type === "video") return file.type.startsWith("video/");
      return false;
    });

    setSelectedFiles((prev) => [...prev, ...filteredFiles]);
    if (filteredFiles.length > 0 && selectedFiles.length === 0) setCurrentFileIndex(0);
  };

  const handleAddMoreClick = () => fileInputRef.current?.click();

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (index === currentFileIndex && index > 0) setCurrentFileIndex(index - 1);
  };

  const handleSelectFile = (index) => setCurrentFileIndex(index);

  const handleSend = () => {
    if (selectedFiles.length > 0) onSend?.(selectedFiles);
    handleClose();
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setCurrentFileIndex(0);
    setCurrentPreviewUrl(null);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="modernModalOverlay">
      <div className="modernModal">
        <div className="modernModal__header">
          <h3>
            {type === "image" ? "🖼️ انتخاب تصاویر" : "🎥 انتخاب ویدیوها"}
            {selectedFiles.length > 0 && ` (${selectedFiles.length} انتخاب شده)`}
          </h3>
          <button className="modernModal__closeBtn" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="modernModal__content">
          <div className="modernModal__sidebar">
            <div className="modernFileList">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className={`modernFileItem ${index === currentFileIndex ? "modernFileItem--active" : ""}`}
                  onClick={() => handleSelectFile(index)}
                >
                  <div className="modernFileItem__name">
                    {file.name.length > 20
                      ? `${file.name.substring(0, 17)}...${file.name.substring(file.name.lastIndexOf("."))}`
                      : file.name}
                  </div>
                  <div className="modernFileItem__size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  <button
                    className="modernFileItem__remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>

            <button className="modernAddMoreBtn" onClick={handleAddMoreClick}>
              + اضافه کردن {type === "image" ? "تصاویر بیشتر" : "ویدیوهای بیشتر"}
            </button>
          </div>

          <div className="modernModal__preview">
            {currentFile ? (
              <>
                <div
                  className="modernPreviewContainer"
                  style={{
                    overflow: "hidden",
                    height: 320,
                    maxHeight: 320,
                    borderRadius: 12,
                    position: "relative",
                  }}
                >
                  {/* ✅ Don’t render if preview url is null */}
                  {currentFile.type.startsWith("image/") ? (
                    currentPreviewUrl ? (
                      <img
                        src={currentPreviewUrl}
                        alt="Preview"
                        className="modernPreviewImage"
                        style={{
                          width: "100%",
                          height: "100%",
                          maxHeight: 320,
                          objectFit: "contain",
                        }}
                      />
                    ) : null
                  ) : currentPreviewUrl ? (
                    <video
                      src={currentPreviewUrl}
                      controls
                      className="modernPreviewVideo"
                      style={{
                        width: "100%",
                        height: "100%",
                        maxHeight: 320,
                        objectFit: "contain",
                      }}
                    />
                  ) : null}
                </div>

                <div className="modernFileInfo">
                  <p>
                    <strong>نام:</strong> {currentFile.name}
                  </p>
                  <p>
                    <strong>اندازه:</strong> {(currentFile.size / 1024 / 1024).toFixed(2)} مگابایت
                  </p>
                  <p>
                    <strong>نوع:</strong> {currentFile.type}
                  </p>
                </div>
              </>
            ) : (
              <div className="modernEmptyPreview">
                <div className="modernEmptyPreview__icon">{type === "image" ? "🖼️" : "🎥"}</div>
                <p className="modernEmptyPreview__text">
                  {type === "image" ? "تصویری انتخاب نشده" : "ویدیویی انتخاب نشده"}
                </p>
                <button className="modernEmptyPreview__btn" onClick={handleAddMoreClick}>
                  کلیک برای انتخاب {type === "image" ? "تصویر" : "ویدیو"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="modernModal__footer">
          <div className="modernModal__actions">
            <button className="modernActionBtn modernActionBtn--secondary" onClick={handleClose}>
              لغو
            </button>
            <button
              className="modernActionBtn modernActionBtn--primary"
              onClick={handleSend}
              disabled={selectedFiles.length === 0}
            >
              انتخاب ({selectedFiles.length})
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={type === "image" ? "image/*" : "video/*"}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}

export default function OpenConv({
  chat = null,
  messages = [],
  inputValue = "",
  loadingOlderMessages = false,
  loadingMessages = false,
  onInputChange,
  onSend,
  onAttach,
  onMountMessagesViewport,
  onBack,
  showBackButton = false,
}) {
  const attachBtnRef = useRef(null);
  const messagesViewportRef = useRef(null);
  const avatarSrc = chat?.avatar ? makeAbsoluteUrl(chat.avatar) || chat.avatar || null : null;

  const pendingScrollOnSendRef = useRef(false);
  const autoScrollOnSendRef = useRef(true);
  const prevMessageCountRef = useRef(Array.isArray(messages) ? messages.length : 0);
  const lastMessageKeyRef = useRef(null);
  const initialScrollDoneRef = useRef(false);
  const lastOutgoingAtRef = useRef(0);
  const LIVE_WINDOW_MS = 60000;

  const [notification, setNotification] = useState(null);
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const [attachOpen, setAttachOpen] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [attachmentModalType, setAttachmentModalType] = useState("image");
  const [replyTarget, setReplyTarget] = useState(null);

  const [pendingAttachments, setPendingAttachments] = useState(null);

  const [pendingPreviewUrls, setPendingPreviewUrls] = useState([]);

  const skeletonRows = [
    { side: "in", width: 220 },
    { side: "out", width: 180 },
    { side: "in", width: 260 },
    { side: "out", width: 200 },
    { side: "in", width: 190 },
    { side: "out", width: 240 },
  ];


  const scrollToBottom = useCallback(
    (behavior = "smooth") => {
      const vp = messagesViewportRef.current;
      if (!vp) return;

      const run = () => vp.scrollTo({ top: vp.scrollHeight, behavior });

      setTimeout(() => {
        run()
        setTimeout(run , 120);
      }, 100);
    }, [] );

  const settleBottomAfterSend = useCallback(() => {
    const runs = [120 , 260];
    runs.forEach((delay) => {
      setTimeout(() => scrollToBottom("auto"), delay);
    });
  }, [scrollToBottom]);

  useEffect(() => {
    if (!pendingAttachments?.files?.length) {
      // revoke any existing urls (defensive)
      setPendingPreviewUrls((prev) => {
        prev.forEach((it) => it?.url && URL.revokeObjectURL(it.url));
        return [];
      });
      return;
    }

    const items = pendingAttachments.files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type || "",
      name: file.name || "",
      size: file.size || 0,
    }));

    setPendingPreviewUrls(items);

    return () => {
      items.forEach((it) => it?.url && URL.revokeObjectURL(it.url));
    };
  }, [pendingAttachments]);

  const hasPendingUpload = !!pendingAttachments?.files?.length;

  const setViewportEl = useCallback(
    (el) => {
      messagesViewportRef.current = el || null;
      onMountMessagesViewport?.(el || null);
    },
    [onMountMessagesViewport]
  );

  const isNearBottom = useCallback(() => {
    const vp = messagesViewportRef.current;
    if (!vp) return false;
    const threshold = 140;
    const distance = vp.scrollHeight - (vp.scrollTop + vp.clientHeight);
    return distance <= threshold;
  }, []);

  useEffect(() => {
    setReplyTarget(null);
    setPendingAttachments(null);
  }, [chat?.id]);

  useEffect(() => {
    pendingScrollOnSendRef.current = false;
    initialScrollDoneRef.current = false;
    prevMessageCountRef.current = 0;
    lastOutgoingAtRef.current = 0;
  }, [chat?.id]);

  useLayoutEffect(() => {
    if (initialScrollDoneRef.current) return;

    const viewport = messagesViewportRef.current;
    if (!viewport) return;
    if (!Array.isArray(messages) || messages.length === 0) return;

    const isLoadingPlaceholder = messages.length === 1 && messages[0]?.id === "loading";
    if (isLoadingPlaceholder) return;

      const hasUnread = messages.some(
        (m) => m && m.side !== "out" && !m.is_read
      );

      if (!hasUnread) {
        viewport.scrollTop = viewport.scrollHeight; // instant, no animation
        initialScrollDoneRef.current = true;
        return;
      }

    const firstUnread = messages.find((m) => m && m.side !== "out" && !m.is_read && m.id != null);

    if (firstUnread) {
      const target = viewport.querySelector(`[data-msgid="${firstUnread.id}"]`);
      if (target) {
        viewport.scrollTo({ top: Math.max(target.offsetTop - 8, 0), behavior: "auto" });
        initialScrollDoneRef.current = true;
        return;
      }
    }

    initialScrollDoneRef.current = true;
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const nextCount = Array.isArray(messages) ? messages.length : 0;
    const listGrew = nextCount > prevCount;

    if (nextCount <= prevCount) {
      prevMessageCountRef.current = nextCount;
      return;
    }

    const isLoadingPlaceholder = nextCount === 1 && messages[0]?.id === "loading";
    if (isLoadingPlaceholder) {
      prevMessageCountRef.current = nextCount;
      return;
    }

    const viewport = messagesViewportRef.current;
    if (!viewport) {
      prevMessageCountRef.current = nextCount;
      return;
    }

    if (!initialScrollDoneRef.current) {
      prevMessageCountRef.current = nextCount;
      return;
    }

    const newMessages = messages.slice(prevCount, nextCount);
    const hasNewIncoming = newMessages.some((msg) => msg?.side !== "out");

    // so the new outgoing message is not guaranteed to sit in the tail slice.
    if (pendingScrollOnSendRef.current && listGrew) {
      if (autoScrollOnSendRef.current) {
        scrollToBottom("smooth");
        settleBottomAfterSend();
      }
      pendingScrollOnSendRef.current = false;
    }

    if (hasNewIncoming && isNearBottom()) {
      scrollToBottom("smooth")
    }

    prevMessageCountRef.current = nextCount;
  }, [messages, isNearBottom, scrollToBottom, settleBottomAfterSend]);

  const handleSendClick = useCallback(() => {
    if (!chat) return;

    // Upload attachments + include text + replyTo
    if (hasPendingUpload) {
      lastOutgoingAtRef.current = Date.now();
      autoScrollOnSendRef.current = true;
      pendingScrollOnSendRef.current = true;

      onAttach?.(pendingAttachments.type, pendingAttachments.files, {
        text: (inputValue || "").trim(),
        replyTo: replyTarget,
      });

      setPendingAttachments(null);
      setReplyTarget(null);
      onInputChange?.("");
      return;
    }

    if (!inputValue.trim()) return;

    lastOutgoingAtRef.current = Date.now();
    pendingScrollOnSendRef.current = true;
    onSend?.(replyTarget);
    setReplyTarget(null);
  }, [chat, hasPendingUpload, pendingAttachments, inputValue, replyTarget, onAttach, onSend, onInputChange]);

  const handleReplyPick = useCallback(
    (msg) => {
      if (!msg?.id) return;
      const textSnippet = (msg.text || "").trim();
      setReplyTarget({
        id: msg.id,
        text: textSnippet || "(No text)",
        senderName: msg.senderName || (msg.side === "out" ? "You" : chat?.title || "Sender"),
      });
      if(isNearBottom()) {
        setTimeout(() => scrollToBottom("smooth"), 0);
      }
    },
    [chat?.title, scrollToBottom]
  );

  const handleAttachPick = useCallback((type) => {
    setAttachmentModalType(type);
    setAttachmentModalOpen(true);
    setAttachOpen(false);
  }, []);

  const handleSendAttachments = useCallback(
    (files) => {
      setPendingAttachments({ type: attachmentModalType, files });
      setAttachmentModalOpen(false);
    },
    [attachmentModalType]
  );

  // When reply bar or pending attachments appear, keep the latest messages in view
  useEffect(() => {
    if ((replyTarget || hasPendingUpload) && isNearBottom()) {
      scrollToBottom("smooth");
    }
  }, [replyTarget, hasPendingUpload, scrollToBottom]);

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
      <div className="open__col" style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", minHeight: 0 }}>
        <div className="open__top">
          <div className="open__profile">
            {avatarSrc ? (
              <img className="open__avatar" src={avatarSrc} alt={chat.title} />
            ) : (
              <div
                className="open__avatar"
                aria-hidden="true"
                style={{
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(0,0,0,0.06)",
                  color: "#555",
                  fontWeight: 600,
                }}
              >
                {chat.title?.[0] ?? "?"}
              </div>
            )}
            <div className="open__name">{chat.title}</div>
          </div>
          {showBackButton && (
            <button type="button" className="open__backBtn" aria-label="back to conversations" onClick={() => onBack?.()}>
              <svg className="open__backIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
          )}
        </div>

        <div className="open__messagesWrap" style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <div
            ref={setViewportEl}
            className="open__messages"
            style={{ height: "100%", overflowY: "auto", position: "relative", background: "transparent" }}
          >
            {loadingOlderMessages && (
              <div className="messagesLoader" aria-live="polite">
                <span className="messagesLoader__spinner" />
                <span className="messagesLoader__text">Loading earlier messages...</span>
              </div>
            )}
            {loadingMessages ? (
              <div className="open__skeleton" aria-hidden="true">
                {skeletonRows.map((row, index) => (
                  <div
                    key={`msg-skeleton-${index}`}
                    className={`msgRow ${row.side === "out" ? "msgRow--out" : "msgRow--in"}`}
                  >
                    <div className={`msg ${row.side === "out" ? "msg--out" : ""} msg--skeleton`}>
                      <div className="chat-skeleton-block chat-skeleton-line" style={{ width: row.width }}></div>
                      <div
                        className="chat-skeleton-block chat-skeleton-meta"
                        style={{ width: Math.max(60, Math.round(row.width * 0.35)) }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              messages.map((m) => (
                <MessageBubble
                  key={m.id ?? m.client_temp_id ?? `${m.time}_${m.side}`}
                  m={m}
                  onReply={handleReplyPick}
                  chatTitle={chat.title}
                  onJumpToMessage={jumpToMessage}
                />
              ))
            )}
          </div>
        </div>

        {/* ✅ Reply ABOVE attachments */}
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

        {hasPendingUpload && (
          <div className="attachComposer" style={{ flex: "0 0 auto" }}>
            <div className="attachComposer__bar" />

            <div className="attachComposer__text" style={{ flex: 1, minWidth: 0 }}>
              <div className="attachComposer__name">
                {pendingAttachments.type === "image" ? "فایل تصویر انتخاب شد" : "فایل ویدیو انتخاب شد"} (
                {pendingAttachments.files.length})
              </div>

              <div className="attachComposer__thumbs" style={{ display: "flex", gap: 6, marginTop: 6, overflowX: "auto", paddingBottom: 2 }}>
                {pendingPreviewUrls.map((it, idx) => {
                  const isImg = (it.type || "").startsWith("image/");
                  const isVid = (it.type || "").startsWith("video/");
                  const mb = ((it.size || 0) / 1024 / 1024).toFixed(2);
                  if (!it.url) return null;

                  return (
                    <div
                      key={`${it.name || "file"}_${idx}`}
                      title={`${it.name || "file"} — ${mb} MB`}
                      style={{
                        width: 40,
                        height: 40,
                        flex: "0 0 auto",
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.12)",
                        background: "rgba(0,0,0,0.04)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {isImg ? (
                        <img src={it.url} alt={it.name || "preview"} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                      ) : isVid ? (
                        <video src={it.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline />
                      ) : (
                        <span style={{ fontSize: 10, opacity: 0.7 }}>FILE</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="attachComposer__close"
              aria-label="cancel upload"
              onClick={() => setPendingAttachments(null)}
              title="Cancel upload"
            >
              ×
            </button>
          </div>
        )}

        <div className="open__composer" style={{ flex: "0 0 auto" }}>
          <button className="sendBtn" type="button" onClick={handleSendClick} aria-label="send">
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

      <SimpleAttachMenu open={attachOpen} anchorEl={attachBtnRef.current} onClose={() => setAttachOpen(false)} onPick={handleAttachPick} />

      <AttachmentModal isOpen={attachmentModalOpen} type={attachmentModalType} onClose={() => setAttachmentModalOpen(false)} onSend={handleSendAttachments} />

      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          position="top-right"
        />
      )}
    </section>
  );
}


