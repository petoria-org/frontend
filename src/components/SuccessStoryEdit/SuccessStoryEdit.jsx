import React, { useState, useEffect } from "react";
import "../../styles/SuccessStoryEdit.css";
import { config } from "../../config";
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
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${BACKEND_URL}/${cleanPath}`;
  };

  const normalizeStoryImages = (rawImages = [], fallbackImage = "") => {
    const baseImages =
      Array.isArray(rawImages) && rawImages.length > 0
        ? rawImages
        : fallbackImage
        ? [fallbackImage]
        : [];

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
        };
      })
      .filter(Boolean);
  };

  const FALLBACK_IMAGE = "/src/assets/images/default-pet.png";

  const initialImages = normalizeStoryImages(
    story.backendImages || story.images || [],
    story.image || FALLBACK_IMAGE
  );

  const [selectedImage, setSelectedImage] = useState(
    initialImages[0]?.url || story.image || FALLBACK_IMAGE
  );
  const [title, setTitle] = useState(story.title || "");
  const [content, setContent] = useState(story.content || "");
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
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
    if (story) {
      setTitle(story.title || "");
      setContent(story.content || "");
      const normalized = normalizeStoryImages(
        story.backendImages || story.images || [],
        story.image || FALLBACK_IMAGE
      );
      setImages(normalized);
      setSelectedImage(normalized[0]?.url || story.image || FALLBACK_IMAGE);
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
      : [{ id: "fallback-preview", url: FALLBACK_IMAGE }];

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

  const handleCropComplete = (croppedResult) => {
    if (croppedResult) {
      const rawImage = croppedResult.image || "";
      const backendId = croppedResult.id ?? croppedResult.backendId ?? null;
      const finalUrl = rawImage
        ? rawImage.includes("?t=")
          ? rawImage
          : `${rawImage}${rawImage.includes("?") ? "&" : "?"}t=${Date.now()}`
        : imageToCrop || FALLBACK_IMAGE;

      const newImage = {
        id: backendId || Date.now(),
        url: finalUrl,
        backendId,
        uploading: false,
      };

      setImages((prev) => {
        const next = [...prev, newImage];
        if (!selectedImage) {
          setSelectedImage(finalUrl);
        }
        return next;
      });
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
    const remainingSlots = 7 - (images.length + pendingFiles.length);
    const filesToAdd = files.slice(0, Math.max(0, remainingSlots));

    if (filesToAdd.length === 0) {
      showNotification("حداکثر می‌توانید 7 عکس آپلود کنید", "warning");
      event.target.value = "";
      return;
    }

    setPendingFiles((prev) => [...prev, ...filesToAdd]);
    event.target.value = "";
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const imageToDelete = prev.find((img) => img.id === id);
      if (imageToDelete?.backendId) {
        deleteSuccessStoryImage(imageToDelete.backendId).catch((err) => {
          console.error("Failed to delete story image:", err);
        });
      }

      const nextImages = prev.filter((img) => img.id !== id);
      if (selectedImage && imageToDelete && selectedImage === imageToDelete.url) {
        setSelectedImage(nextImages[0]?.url || FALLBACK_IMAGE);
      }

      return nextImages;
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
        updatedStory.image || story.image || FALLBACK_IMAGE
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
        image: normalized[0]?.url || story.image || FALLBACK_IMAGE,
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

  const handleDelete = async () => {
    if (
      !window.confirm("آیا مطمئن هستید که می‌خواهید این داستان موفقیت را حذف کنید؟")
    ) {
      return;
    }

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
                <button type="button" className="close-button" onClick={onCancel}>
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div className="story-edit-content">
              <div className="images-section">
                <div className="image-upload-section">
                  <div className="section-header">
                    <h3 className="section-title">
                      <ImageIcon />
                      <span>پیش‌نمایش عکس اصلی</span>
                    </h3>
                  </div>
                  <div className="main-image-preview">
                    <img
                      src={selectedImage || FALLBACK_IMAGE}
                      alt={title}
                      className="main-preview-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                </div>

                <div className="image-upload-section">
                  <div className="section-header">
                    <h3 className="section-title">
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
                              e.target.src = FALLBACK_IMAGE;
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

              <div className="story-info-section">
                <div className="story-text-section">
                  <div className="section-header">
                    <h3 className="section-title">
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
