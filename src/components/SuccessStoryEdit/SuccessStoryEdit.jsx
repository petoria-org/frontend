import React, { useState, useEffect } from "react";
import "../../styles/SuccessStoryEdit.css";
import { config } from "../../config";
import { getSuccessStoryDefaultImage } from "../../utils/postImages";
import {
  updateSuccessStory,
  deleteSuccessStory,
  uploadSuccessStoryImage,
  deleteSuccessStoryImage,
} from "../../Services/successStoryService";
import { useOutletContext } from "react-router-dom";
import { ImageCropper } from "../ImageCropper";
import { NotificationToast } from "../NotificationToast/NotificationToast";

export const SuccessStoryEdit = ({ story, onUpdate, onDelete, onCancel }) => {
  const BACKEND_URL = config.BACKEND_URL;

  const buildImageUrl = (path) => {
    if (!path) return "";
    if (typeof path === "object" && path !== null) {
      const nested =
        path.url ||
        path.image ||
        path.thumbnail ||
        path.file ||
        path.image_url;
      return buildImageUrl(nested);
    }

    const rawPath = String(path).trim();
    if (!rawPath || rawPath === "null" || rawPath === "undefined") return "";
    if (rawPath.startsWith("http")) return rawPath;
    if (rawPath.startsWith("data:") || rawPath.startsWith("blob:")) return rawPath;
    if (
      rawPath.startsWith("/src/") ||
      rawPath.startsWith("src/") ||
      rawPath.startsWith("/assets/") ||
      rawPath.startsWith("assets/")
    ) {
      return rawPath;
    }

    const cleanPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
    return `${BACKEND_URL}${cleanPath}`;
  };

  const normalizeStoryImages = (rawImages = [], fallbackImage = "") => {
    const hasRawImages = Array.isArray(rawImages) && rawImages.length > 0;
    const baseImages = hasRawImages
      ? rawImages
      : fallbackImage
      ? [fallbackImage]
      : [];
    const normalizedFallback = buildImageUrl(fallbackImage);

    return baseImages
      .map((img, index) => {
        const rawPath = typeof img === "string" ? img : img?.image || img?.url;
        const url = buildImageUrl(rawPath);
        if (!url) return null;

        return {
          id: img?.id ?? img?.backendId ?? `img-${index}`,
          backendId: img?.id ?? img?.backendId ?? null,
          url,
          uploading: false,
          isFallback: !hasRawImages && url === normalizedFallback,
        };
      })
      .filter(Boolean);
  };

  const DEFAULT_FALLBACK_IMAGE = "/src/assets/images/default-pet.png";
  const storyFallbackImage =
    story?.fallbackImage ||
    getSuccessStoryDefaultImage(story) ||
    DEFAULT_FALLBACK_IMAGE;
  const isFallbackUrl = (url) =>
    !url ||
    url === storyFallbackImage ||
    url === DEFAULT_FALLBACK_IMAGE;
  const isFallbackImage = (image) =>
    Boolean(image?.isFallback) || isFallbackUrl(image?.url);

  const initialImages = normalizeStoryImages(
    story.backendImages || story.images || [],
    story.image || storyFallbackImage
  );

  const normalizeStoryContent = (value) => {
    if (!value) return "";
    return String(value).replace(/[\r\n]+$/g, "");
  };

  const [selectedImage, setSelectedImage] = useState(
    initialImages[0]?.url || story.image || storyFallbackImage
  );
  const [title, setTitle] = useState(story.title || "");
  const [content, setContent] = useState(normalizeStoryContent(story.content));
  const [images, setImages] = useState(initialImages);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const MIN_EDIT_LOADING_MS = 2500;
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmToast, setConfirmToast] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const { setHideNavbar, setHideFooter } = useOutletContext();

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  useEffect(() => {
    setHideNavbar(true);
    setHideFooter(true);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      setHideNavbar(false);
      setHideFooter(false);
      document.body.style.overflow = originalOverflow;
    };
  }, [setHideNavbar, setHideFooter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSkeletonLoading(false);
    }, MIN_EDIT_LOADING_MS);

    return () => clearTimeout(timer);
  }, [MIN_EDIT_LOADING_MS]);

  useEffect(() => {
    if (story) {
      setTitle(story.title || "");
      setContent(normalizeStoryContent(story.content));
      const normalized = normalizeStoryImages(
        story.backendImages || story.images || [],
        story.image || storyFallbackImage
      );
      setImages(normalized);
      setSelectedImage(normalized[0]?.url || story.image || storyFallbackImage);
    }
  }, [story]);

  useEffect(() => {
    if (!cropModalOpen && pendingFiles.length > 0) {
      startCropForFile(pendingFiles[0]);
    }
  }, [pendingFiles, cropModalOpen]);

  const storyImages =
    images.length > 0
      ? images
      : selectedImage
      ? [{ id: "selected-preview", url: selectedImage }]
      : [{ id: "fallback-preview", url: storyFallbackImage }];

  const isUploadingImages =
    images.some((img) => img.uploading) || cropModalOpen || pendingFiles.length > 0;

  const startCropForFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageToCrop(e.target.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const finalizeCropStep = () => {
    setPendingFiles((prev) => prev.slice(1));
    setCropModalOpen(false);
    setImageToCrop(null);
  };

  const handleTextareaKeyDown = (e) => {
  // اگر دکمه Enter نیست، اجازه نده به خط جدید برود
  if (e.key === 'Enter') {
    // اگر Shift + Enter زده، بگذار به خط جدید برود
    if (e.shiftKey) {
      return;
    }
    // اگر فقط Enter زده، از رفتن به خط جدید جلوگیری کن
    e.preventDefault();
  }
  
  // برای سایر کلیدها، بررسی کن که آیا در حالت "ادامه دادن" هستیم
  const textarea = e.target;
  const cursorPosition = textarea.selectionStart;
  
  // اگر در وسط خط هستیم و داریم تایپ می‌کنیم، بگذار ادامه دهد
  // این قسمت برای فارسی مهم است
  if (cursorPosition > 0) {
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    const lastNewLineIndex = textBeforeCursor.lastIndexOf('\n');
    
    // اگر بعد از آخرین Enter هستیم و هنوز به انتهای خط نرسیده‌ایم
    const currentLineStart = lastNewLineIndex + 1;
    const currentLineText = textBeforeCursor.substring(currentLineStart);
    
    // اندازه فونت برای محاسبه عرض
    const fontSize = 16; // باید با فونت واقعی تطبیق دهید
    const estimatedWidth = currentLineText.length * (fontSize * 0.6); // تقریب عرض
    
    // اگر خط خیلی طولانی شده، جلوگیری نکن (بگذار برود خط بعد)
    // یا اگر می‌خواهید جلوگیری کنید:
    // if (estimatedWidth > textarea.clientWidth - 30) { // 30 برای padding
    //   e.preventDefault();
    //   return;
    // }
  }
};

const handleTextareaChange = (e) => {
  const value = e.target.value;
  
  // حذف خطوط جدید غیرضروری (فقط آنهایی که با Enter ایجاد نشده‌اند)
  // این ممکن است مشکل شما را حل کند
  const lines = value.split('\n');
  const processedLines = lines.map(line => {
    // اگر خط خالی نیست و طولانی است، آن را بشکن
    if (line.trim() !== '' && line.length > 50) { // 50 کاراکتر آستانه
      // می‌توانید خط را بشکنید یا کاری دیگر انجام دهید
      return line;
    }
    return line;
  });
  
  setContent(processedLines.join('\n'));
};
  const handleCropComplete = (croppedResult) => {
    if (croppedResult) {
      const rawImage = croppedResult.image || "";
      const backendId = croppedResult.id ?? croppedResult.backendId ?? null;
      const finalUrl = rawImage
        ? rawImage.includes("?t=")
          ? rawImage
          : `${rawImage}${rawImage.includes("?") ? "&" : "?"}t=${Date.now()}`
        : imageToCrop || storyFallbackImage;

      const newImage = {
        id: backendId || Date.now(),
        url: finalUrl,
        backendId,
        uploading: false,
      };

      setImages((prev) => {
        const next = prev.filter((img) => !isFallbackImage(img));
        return [...next, newImage];
      });
      setSelectedImage((prevSelected) =>
        isFallbackUrl(prevSelected) ? finalUrl : prevSelected || finalUrl
      );
    }

    finalizeCropStep();
  };

  const handleCropCancel = () => {
    finalizeCropStep();
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith("image/")
    );
    const effectiveImageCount = images.filter((img) => !isFallbackImage(img)).length;
    const remainingSlots = 7 - (effectiveImageCount + pendingFiles.length);
    const filesToAdd = files.slice(0, Math.max(0, remainingSlots));

    if (filesToAdd.length === 0) {
      showNotification("حداکثر می‌توانید 7 عکس آپلود کنید", "warning");
      event.target.value = "";
      return;
    }

    setPendingFiles((prev) => [...prev, ...filesToAdd]);
    event.target.value = "";
  };

  const confirmRemoveImage = (id) => {
    setImages((prev) => {
      const imageToDelete = prev.find((img) => img.id === id);
      if (imageToDelete?.backendId) {
        deleteSuccessStoryImage(imageToDelete.backendId).catch((err) => {
          console.error("Failed to delete story image:", err);
        });
      }

      const nextImages = prev.filter((img) => img.id !== id);
      if (selectedImage && imageToDelete && selectedImage === imageToDelete.url) {
        setSelectedImage(nextImages[0]?.url || storyFallbackImage);
      }

      return nextImages;
    });

    setImageToDelete(null);
    showNotification("\u062a\u0635\u0648\u06cc\u0631 \u0628\u0627 \u0645\u0648\u0641\u0642\u06cc\u062a \u062d\u0630\u0641 \u0634\u062f", "success");
  };

  const handleRemoveImage = (id) => {
    const targetImage = images.find((img) => img.id === id);
    if (!targetImage) return;

    setImageToDelete(targetImage);
    setConfirmToast({
      message: "\u0622\u06cc\u0627 \u0627\u0632 \u062d\u0630\u0641 \u0627\u06cc\u0646 \u062a\u0635\u0648\u06cc\u0631 \u0645\u0637\u0645\u0626\u0646 \u0647\u0633\u062a\u06cc\u062f\u061f \u0627\u06cc\u0646 \u06a9\u0627\u0631 \u0642\u0627\u0628\u0644 \u0628\u0627\u0632\u06af\u0634\u062a \u0646\u06cc\u0633\u062a.",
      confirmText: "\u062d\u0630\u0641 \u062a\u0635\u0648\u06cc\u0631",
      cancelText: "\u0627\u0646\u0635\u0631\u0627\u0641",
      confirmVariant: "danger",
      type: "warning",
      onConfirm: () => confirmRemoveImage(id),
      onCancel: () => setImageToDelete(null)
    });
  };

  const getStoryTypeFromStatus = (status) => {
    switch (status) {
      case "lost":
      case "بازگشت به خانه":
        return "lost";
      case "found":
      case "به خانواده بازگشت":
        return "found";
      case "surrender":
      case "adoption":
      case "فرزندخوانده شد":
        return "surrender";
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUploadingImages) {
      showNotification("منتظر بمانید تا بارگذاری عکس‌ها تمام شود.", "warning");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const imageIds = images.filter((img) => img.backendId).map((img) => img.backendId);

      const storyType =
        story.story_type || getStoryTypeFromStatus(story.status) || "lost";

      const storyData = {
        title,
        story: content,
        story_type: storyType,
        image_ids: imageIds,
        images: imageIds,
      };

      const updatedStory = await updateSuccessStory(story.id, storyData);
      const normalized = normalizeStoryImages(
        updatedStory.images || story.backendImages || [],
        updatedStory.image || story.image || storyFallbackImage
      );

      setImages(normalized);
      if (normalized[0]?.url) {
        setSelectedImage(normalized[0].url);
      }

      onUpdate({
        ...story,
        id: updatedStory.id,
        title: updatedStory.title,
        content: updatedStory.story,
        image: normalized[0]?.url || story.image || storyFallbackImage,
        images: normalized.map((img) => img.url),
        backendImages: normalized,
        story_type: updatedStory.story_type,
        date: new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(new Date(updatedStory.updated_at || updatedStory.created_at)),
      });

      showNotification("داستان موفقیت با موفقیت بروزرسانی شد", "success");
    } catch (err) {
      showNotification("خطا در بروزرسانی داستان موفقیت", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteSuccessStory(story.id);
      onDelete(story.id);
      showNotification("داستان موفقیت با موفقیت حذف شد", "success");
    } catch (err) {
      showNotification("خطا در حذف داستان موفقیت", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setConfirmToast({
      message: "آیا مطمئن هستید که می‌خواهید این داستان موفقیت را حذف کنید؟",
      confirmText: "حذف",
      cancelText: "انصراف",
      confirmVariant: "danger",
      onConfirm: handleDeleteConfirm
    });
  };

  const CloseIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const HeartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );

  const UploadIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );

  const ImageIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );

  const GalleryIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  const InfoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );

  const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const MessageIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );

  const DocumentIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );

  const ErrorIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );

  const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );

  const DeleteIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" strokeLinecap="round" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );

  const SaveIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );

  if (skeletonLoading) {
    return (
      <div className="story-edit-overlay">
        <div className="story-edit-modal">
          <div className="story-edit-header">
            <div className="header-content">
              <div className="story-skeleton-block story-skeleton-icon"></div>
              <div className="header-text">
                <div className="story-skeleton-block story-skeleton-title"></div>
                <div className="story-skeleton-block story-skeleton-subtitle"></div>
              </div>
              <div className="story-skeleton-block story-skeleton-close"></div>
            </div>
          </div>

          <div className="story-edit-content">
            <div className="images-section-edit">
              <div className="image-upload-section-edit">
                <div className="section-header-edit">
                  <div className="story-skeleton-block story-skeleton-section-title"></div>
                </div>
                <div className="main-image-preview-edit">
                  <div className="story-skeleton-block story-skeleton-main-image"></div>
                </div>
              </div>

              <div className="image-upload-section-edit">
                <div className="section-header-edit">
                  <div className="story-skeleton-block story-skeleton-section-title"></div>
                  <div className="story-skeleton-block story-skeleton-counter"></div>
                </div>
                <div className="thumbnail-container">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`story-thumb-skel-${index}`}
                      className="story-skeleton-block story-skeleton-thumb"
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="story-info-section-edit">
              <div className="story-text-section-edit">
                <div className="section-header-edit">
                  <div className="story-skeleton-block story-skeleton-section-title"></div>
                </div>

                <div className="form-group">
                  <div className="story-skeleton-block story-skeleton-label"></div>
                  <div className="story-skeleton-block story-skeleton-input"></div>
                </div>

                <div className="form-group">
                  <div className="story-skeleton-block story-skeleton-label"></div>
                  <div className="story-skeleton-block story-skeleton-badge"></div>
                </div>

                <div className="form-group">
                  <div className="story-skeleton-block story-skeleton-label"></div>
                  <div className="story-skeleton-block story-skeleton-textarea"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="story-edit-footer">
            <div className="footer-actions">
              <div className="story-skeleton-block story-skeleton-btn"></div>
              <div className="story-skeleton-block story-skeleton-btn"></div>
              <div className="story-skeleton-block story-skeleton-btn primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="story-edit-overlay" onClick={onCancel}>
        <div className="story-edit-modal" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSubmit}>
            <div className="story-edit-header">
              <div className="header-content">
                <div className="header-icon">
                  <HeartIcon />
                </div>
                <div className="header-text">
                  <h1 className="edit-story-title">ویرایش داستان موفقیت</h1>
                  <p className="edit-story-subtitle">عکس‌ها و متن داستان را بروزرسانی کنید</p>
                </div>
                <button type="button" className="close-button-success-story" onClick={onCancel}>
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div className="story-edit-content">
              <div className="images-section-edit">
                <div className="image-upload-section-edit">
                  <div className="section-header-edit">
                    <h3 className="section-title-edit">
                      <ImageIcon />
                      <span>پیش‌نمایش عکس اصلی</span>
                    </h3>
                  </div>
                  <div className="main-image-preview-edit">
                    <img
                      src={selectedImage || storyFallbackImage}
                      alt={title}
                      className="main-preview-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = storyFallbackImage;
                      }}
                    />
                  </div>
                </div>

                <div className="image-upload-section-edit">
                  <div className="section-header-edit">
                    <h3 className="section-title-edit">
                      <GalleryIcon />
                      <span>گالری عکس‌ها</span>
                    </h3>
                    <div className="image-counter">
                      <span className="current-count">{storyImages.length}</span>
                      <span className="max-count">/7</span>
                    </div>
                  </div>

                  <div className="thumbnail-container">
                    {storyImages.map((img, index) => (
                      <div
                        key={img.id || index}
                        className={`thumbnail-wrapper ${selectedImage === img.url ? "active" : ""}`}
                        onClick={() => setSelectedImage(img.url)}
                      >
                        <div className="thumbnail">
                          <img
                            src={img.url}
                            alt={`پیش‌نمایش ${index + 1}`}
                            className="thumbnail-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = storyFallbackImage;
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(img.id || index);
                          }}
                          title="حذف عکس"
                        >
                          ×
                        </button>
                        <div className="thumbnail-number-badge">{index + 1}</div>
                      </div>
                    ))}

                    {storyImages.length < 7 && (
                      <label className="upload-thumbnail-wrapper">
                        <div className="upload-thumbnail">
                          <UploadIcon />
                          <span>افزودن عکس</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          style={{ display: "none" }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="story-info-section-edit">
                <div className="story-text-section-edit">
                  <div className="section-header-edit">
                    <h3 className="section-title-edit">
                      <InfoIcon />
                      <span>جزئیات داستان موفقیت</span>
                    </h3>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <UserIcon />
                      عنوان داستان موفقیت
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="عنوان داستان موفقیت را وارد کنید"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <MessageIcon />
                      وضعیت داستان
                    </label>
                    <div className="status-display">
                      <div
                        className="story-status-badge"
                        style={{
                          backgroundColor: story.statusColor || "rgba(122, 238, 151, 0.15)",
                          color: story.statusTextColor || "#0f7228",
                        }}
                      >
                        <HeartIcon />
                        <span>{story.status || ""}</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <DocumentIcon />
                      متن داستان
                    </label>
                    <textarea
                      className="form-textarea"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      rows="8"
                      placeholder="متن داستان موفقیت را اینجا بنویسید..."
                    />
                  </div>

                  {error && (
                    <div className="error-message">
                      <ErrorIcon />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="story-edit-footer">
              <div className="footer-actions">
                <button type="button" className="cancel-btn" onClick={onCancel} disabled={loading}>
                  <BackIcon />
                  <span>بازگشت</span>
                </button>

                <button type="button" className="delete-btn" onClick={handleDelete} disabled={loading}>
                  <DeleteIcon />
                  <span>حذف داستان</span>
                </button>

                <button type="submit" className="save-btn" disabled={loading || isUploadingImages}>
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>در حال بروزرسانی...</span>
                    </>
                  ) : (
                    <>
                      <SaveIcon />
                      <span>ذخیره تغییرات</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {cropModalOpen && imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onClose={handleCropCancel}
          aspect={3 / 4}
          cropSize={{ width: 360, height: 480 }}
          uploadImageFn={uploadSuccessStoryImage}
          format="jpeg"
          quality={0.92}
        />
      )}
      {confirmToast && (
        <NotificationToast
          message={confirmToast.message}
          type={confirmToast.type || "warning"}
          onClose={() => {
            setConfirmToast(null);
            setImageToDelete(null);
          }}
          position="top-right"
          duration={0}
          actions={[
            {
              label: confirmToast.cancelText || "انصراف",
              variant: "ghost",
              onClick: confirmToast.onCancel
            },
            {
              label: confirmToast.confirmText || "تایید",
              variant: confirmToast.confirmVariant || "danger",
              onClick: confirmToast.onConfirm
            }
          ]}
        />
      )}
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          position="top-right"
        />
      )}
    </>
  );
};
