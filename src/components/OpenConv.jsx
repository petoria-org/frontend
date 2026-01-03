// OpenConv.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { config } from "../config";
import api from "../Services/api";

const ABS_URL_RE = /^https?:\/\//i;

const makeAbsoluteUrl = (path) => {
  if (!path) return null;
  const pathStr = String(path).trim();
  if (!pathStr) return null;
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

const downloadAttachment = async (att) => {
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
    alert("Download failed. Please try again.");
  }
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
                downloadAttachment(att);
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
          {isMine && <span className={`msg__tick msg__tick--${m.status || "sent"}`}>{m.status === "seen" ? "✓✓" : "✓"}</span>}
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

// Crop Controls Component
function CropControls({ zoom, onZoomChange, onCropToggle, isCropping, onCropComplete, onCancelCrop }) {
  return (
    <div className="cropControls">
      <div className="cropControls__zoom">
        <span className="cropControls__zoomIcon">🔍</span>
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          className="cropControls__zoomSlider"
        />
        <span className="cropControls__zoomValue">{zoom.toFixed(1)}x</span>
      </div>

      <div className="cropControls__buttons">
        <button
          type="button"
          className={`cropControls__btn cropControls__btn--crop ${isCropping ? "cropControls__btn--active" : ""}`}
          onClick={onCropToggle}
          title={isCropping ? "خروج از حالت کراپ" : "کراپ تصویر"}
        >
          ✂️
        </button>

        {isCropping && (
          <>
            <button type="button" className="cropControls__btn cropControls__btn--check" onClick={onCropComplete} title="اعمال کراپ">
              ✓
            </button>
            <button type="button" className="cropControls__btn cropControls__btn--close" onClick={onCancelCrop} title="انصراف از کراپ">
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Attachment Modal Component
function AttachmentModal({ isOpen, type, onClose, onSend }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  // ✅ null instead of ""
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);
  const previewContainerRef = useRef(null);
  const imageRef = useRef(null);
  const cropOverlayRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    setZoom(1);
    setImagePosition({ x: 0, y: 0 });
    setIsCropping(false);
    setCropArea(null);
  }, [currentFileIndex]);

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

  useEffect(() => {
    if (!previewContainerRef.current || !imageRef.current) return;

    const container = previewContainerRef.current;
    const image = imageRef.current;

    const handleMouseDown = (e) => {
      if (zoom <= 1) return;
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      });
      e.preventDefault();
    };

    const handleMouseMove = (e) => {
      if (!isDragging || zoom <= 1) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      const maxX = Math.max(0, (image.width * zoom - container.clientWidth) / 2);
      const maxY = Math.max(0, (image.height * zoom - container.clientHeight) / 2);

      const clampedX = Math.max(-maxX, Math.min(maxX, newX));
      const clampedY = Math.max(-maxY, Math.min(maxY, newY));

      setImagePosition({ x: clampedX, y: clampedY });
      e.preventDefault();
    };

    const handleMouseUp = () => setIsDragging(false);

    container.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, imagePosition, zoom]);

  useEffect(() => {
    if (!isCropping || !previewContainerRef.current) return;

    const container = previewContainerRef.current;
    let cropStart = null;
    let currentCropRect = null;

    const getRelativeCoordinates = (e) => {
      const rect = container.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const createCropOverlay = () => {
      if (cropOverlayRef.current) cropOverlayRef.current.remove();

      const overlay = document.createElement("div");
      overlay.className = "cropOverlay";
      overlay.style.position = "absolute";
      overlay.style.left = "0";
      overlay.style.top = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.cursor = "crosshair";
      overlay.style.zIndex = "10";
      overlay.style.pointerEvents = "auto";
      container.appendChild(overlay);
      cropOverlayRef.current = overlay;
    };

    const updateCropDisplay = (rect) => {
      if (!cropOverlayRef.current || !rect) return;
      cropOverlayRef.current.innerHTML = `
        <div style="position:absolute;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.3);"></div>
        <div style="position:absolute;left:${rect.x}px;top:${rect.y}px;width:${rect.width}px;height:${rect.height}px;
             background:transparent;border:2px solid #4dabf7;box-shadow:0 0 0 9999px rgba(0,0,0,0.4);pointer-events:none;"></div>
        <div style="position:absolute;left:${rect.x + rect.width / 2 - 30}px;top:${rect.y + rect.height / 2 - 15}px;
             background:rgba(77,171,247,0.9);color:white;padding:4px 8px;border-radius:4px;font-size:12px;pointer-events:none;">
             ${Math.round(rect.width)}×${Math.round(rect.height)}
        </div>
      `;
    };

    const handleMouseDown = (e) => {
      cropStart = getRelativeCoordinates(e);
      createCropOverlay();
    };

    const handleMouseMove = (e) => {
      if (!cropStart) return;

      const pos = getRelativeCoordinates(e);
      const minX = Math.max(0, Math.min(cropStart.x, pos.x));
      const minY = Math.max(0, Math.min(cropStart.y, pos.y));
      const maxX = Math.min(container.clientWidth, Math.max(cropStart.x, pos.x));
      const maxY = Math.min(container.clientHeight, Math.max(cropStart.y, pos.y));

      currentCropRect = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
      updateCropDisplay(currentCropRect);
    };

    const handleMouseUp = () => {
      if (currentCropRect && currentCropRect.width > 10 && currentCropRect.height > 10) {
        setCropArea(currentCropRect);
      } else if (cropOverlayRef.current) {
        cropOverlayRef.current.remove();
        cropOverlayRef.current = null;
      }
      cropStart = null;
    };

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseup", handleMouseUp);
      if (cropOverlayRef.current) {
        cropOverlayRef.current.remove();
        cropOverlayRef.current = null;
      }
    };
  }, [isCropping]);

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

  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleToggleCrop = () => {
    if (type === "video") return;
    const next = !isCropping;
    setIsCropping(next);
    if (!next) {
      setCropArea(null);
      if (cropOverlayRef.current) {
        cropOverlayRef.current.remove();
        cropOverlayRef.current = null;
      }
    }
  };

  const handleCropComplete = () => {
    if (cropArea) {
      alert(`کراپ اعمال شد: ${Math.round(cropArea.width)}×${Math.round(cropArea.height)} پیکسل`);
      // TODO: apply real crop logic
    }
    setIsCropping(false);
    setCropArea(null);
    if (cropOverlayRef.current) {
      cropOverlayRef.current.remove();
      cropOverlayRef.current = null;
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setCropArea(null);
    if (cropOverlayRef.current) {
      cropOverlayRef.current.remove();
      cropOverlayRef.current = null;
    }
  };

  const handleSend = () => {
    if (selectedFiles.length > 0) onSend?.(selectedFiles);
    handleClose();
  };

  const handleClose = () => {
    setIsCropping(false);
    setCropArea(null);
    setZoom(1);
    setImagePosition({ x: 0, y: 0 });
    setSelectedFiles([]);
    setCurrentFileIndex(0);
    if (cropOverlayRef.current) {
      cropOverlayRef.current.remove();
      cropOverlayRef.current = null;
    }
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
                {currentFile.type.startsWith("image/") && (
                  <div className="previewControls">
                    <CropControls
                      zoom={zoom}
                      onZoomChange={handleZoomChange}
                      onCropToggle={handleToggleCrop}
                      isCropping={isCropping}
                      onCropComplete={handleCropComplete}
                      onCancelCrop={handleCancelCrop}
                    />
                  </div>
                )}

                <div
                  ref={previewContainerRef}
                  className={`modernPreviewContainer ${isCropping ? "modernPreviewContainer--cropping" : ""} ${
                    zoom > 1 ? "modernPreviewContainer--zoomed" : ""
                  }`}
                  style={{
                    cursor: isCropping ? "crosshair" : zoom > 1 ? "grab" : "default",
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
                        ref={imageRef}
                        src={currentPreviewUrl}
                        alt="Preview"
                        className="modernPreviewImage"
                        style={{
                          width: "100%",
                          height: "100%",
                          maxHeight: 320,
                          objectFit: "contain",
                          transform: `scale(${zoom}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                          transformOrigin: "center center",
                          transition: isDragging ? "none" : "transform 0.2s ease",
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
                  {cropArea && (
                    <p>
                      <strong>اندازه کراپ:</strong> {Math.round(cropArea.width)}×{Math.round(cropArea.height)} پیکسل
                    </p>
                  )}
                  {zoom > 1 && (
                    <p>
                      <strong>زوم:</strong> {zoom.toFixed(1)}x
                    </p>
                  )}
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
  onInputChange,
  onSend,
  onAttach,
  onMountMessagesViewport,
}) {
  const attachBtnRef = useRef(null);
  const messagesViewportRef = useRef(null);
  const avatarSrc = chat?.avatar ? makeAbsoluteUrl(chat.avatar) || chat.avatar || null : null;

  const pendingScrollOnSendRef = useRef(false);
  const prevMessageCountRef = useRef(Array.isArray(messages) ? messages.length : 0);
  const lastMessageKeyRef = useRef(null);
  const initialScrollDoneRef = useRef(false);
  const lastOutgoingAtRef = useRef(0);
  const LIVE_WINDOW_MS = 60000;

  const [attachOpen, setAttachOpen] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [attachmentModalType, setAttachmentModalType] = useState("image");
  const [replyTarget, setReplyTarget] = useState(null);

  const [pendingAttachments, setPendingAttachments] = useState(null);

  const [pendingPreviewUrls, setPendingPreviewUrls] = useState([]);

  const scrollToBottom = useCallback(
    (behavior = "smooth") => {
      const vp = messagesViewportRef.current;
      if (!vp) return;

      const run = () => vp.scrollTo({ top: vp.scrollHeight, behavior });

      // Run across a couple of frames so late layout (fonts/images) are included.
      requestAnimationFrame(() => {
        run();
        requestAnimationFrame(() => run());
        setTimeout(run, 60);
      });
    },
    []
  );

  const settleBottomAfterSend = useCallback(() => {
    // Re-run bottom scroll a few times to catch late layout (fonts/images)
    const runs = [0, 80, 160, 280];
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

  useEffect(() => {
    if (initialScrollDoneRef.current) return;

    const viewport = messagesViewportRef.current;
    if (!viewport) return;
    if (!Array.isArray(messages) || messages.length === 0) return;

    const isLoadingPlaceholder = messages.length === 1 && messages[0]?.id === "loading";
    if (isLoadingPlaceholder) return;

    const firstUnread = messages.find((m) => m && m.side !== "out" && !m.is_read && m.id != null);

    if (firstUnread) {
      const target = viewport.querySelector(`[data-msgid="${firstUnread.id}"]`);
      if (target) {
        viewport.scrollTo({ top: Math.max(target.offsetTop - 8, 0), behavior: "auto" });
        initialScrollDoneRef.current = true;
        return;
      }
    }

    scrollToBottom("auto");
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

    // Scroll any time the list grows after we triggered a send; sorting by id can re-order items,
    // so the new outgoing message is not guaranteed to sit in the tail slice.
    if (pendingScrollOnSendRef.current && listGrew) {
      scrollToBottom("smooth");
      settleBottomAfterSend();
      pendingScrollOnSendRef.current = false;
    }

    if (hasNewIncoming) {
      const now = Date.now();
      const recentlyTyping = now - (lastOutgoingAtRef.current || 0) <= LIVE_WINDOW_MS;

      if (recentlyTyping) scrollToBottom("smooth");
      else if (isNearBottom()) scrollToBottom("smooth");
    }

    prevMessageCountRef.current = nextCount;
  }, [messages, isNearBottom, scrollToBottom, settleBottomAfterSend]);

  const handleSendClick = useCallback(() => {
    if (!chat) return;

    // Upload attachments + include text + replyTo
    if (hasPendingUpload) {
      lastOutgoingAtRef.current = Date.now();
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
      // Ensure the reply bar is visible by nudging the viewport to the bottom
      setTimeout(() => scrollToBottom("smooth"), 0);
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
    if (replyTarget || hasPendingUpload) {
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
            {messages.map((m) => (
              <MessageBubble
                key={m.id ?? m.client_temp_id ?? `${m.time}_${m.side}`}
                m={m}
                onReply={handleReplyPick}
                chatTitle={chat.title}
                onJumpToMessage={jumpToMessage}
              />
            ))}
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
    </section>
  );
}
