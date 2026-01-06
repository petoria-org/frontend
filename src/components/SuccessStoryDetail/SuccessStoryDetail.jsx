import React, { useState, useEffect, useMemo } from "react";
import "../../styles/SuccessStoryDetail.css";
import { useOutletContext } from "react-router-dom";
import { getSuccessStoryDetail } from "../../Services/successStoryService";
import { config } from "../../config";
import { getSuccessStoryDefaultImage } from "../../utils/postImages";

export const SuccessStoryDetail = ({ story, onClose }) => {
  const [storyData, setStoryData] = useState(story || {});
  const [loadingDetail, setLoadingDetail] = useState(false);
  const BACKEND_URL = config.BACKEND_URL;

  const buildImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${BACKEND_URL}${cleanPath}`;
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!story?.id) return;
      try {
        setLoadingDetail(true);
        const detail = await getSuccessStoryDetail(story.id);
        setStoryData(detail);
      } catch (error) {
        console.error("Failed to load success story detail:", error);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [story]);

  const fallbackImage = useMemo(
    () => getSuccessStoryDefaultImage(storyData || story || {}),
    [storyData, story]
  );

  const galleryImages = useMemo(() => {
    const rawList = storyData.backendImages || storyData.images || [];

    const mapped = rawList
      .map((img, index) => {
        const rawPath = typeof img === "string" ? img : img?.image || img?.url;
        const url = buildImageUrl(rawPath);
        if (!url) return null;
        return { id: img?.id ?? img?.backendId ?? `img-${index}`, url };
      })
      .filter(Boolean);

    if (mapped.length === 0 && storyData.image) {
      mapped.push({ id: "main-image", url: buildImageUrl(storyData.image) });
    }

    return mapped;
  }, [storyData, BACKEND_URL]);

  const [selectedImage, setSelectedImage] = useState(
    (galleryImages[0] && galleryImages[0].url) || storyData.image || fallbackImage
  );
  const { setHideNavbar, setHideFooter } = useOutletContext();

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    setHideNavbar(true);
    setHideFooter(true);
    document.body.style.overflow = "hidden";

    return () => {
      setHideNavbar(false);
      setHideFooter(false);
      document.body.style.overflow = originalOverflow;
    };
  }, [setHideNavbar, setHideFooter]);

  useEffect(() => {
    if (galleryImages.length > 0) {
      setSelectedImage(galleryImages[0].url);
    } else if (storyData.image) {
      setSelectedImage(buildImageUrl(storyData.image));
    } else {
      setSelectedImage(fallbackImage);
    }
  }, [galleryImages, storyData.image]);

  const storyImages = galleryImages.length > 0 ? galleryImages : [{ id: "fallback", url: fallbackImage }];

  const displayTitle = storyData.title || story?.title || "";
  const displayStatus = storyData.status || story?.status || "";
  const displayStatusColor = storyData.statusColor || story?.statusColor;
  const displayStatusTextColor = storyData.statusTextColor || story?.statusTextColor;
  const displayAuthor = storyData.user_name || storyData.author || story?.author || "";
  const displayDate = storyData.date || (storyData.created_at ? new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(storyData.created_at)) : story?.date || "");
  const displayContent = storyData.story || storyData.content || story?.content || "";

  const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const CloseIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const HeartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );

  return (
    <div className="story-detail-overlay" onClick={onClose}>
      <div className="story-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="story-detail-header">
          <div className="header-content">
            <div className="header-icon">
              <HeartIcon />
            </div>
            <div className="header-text">
              <h1 className="success-story-title">جزئیات داستان موفق</h1>
              <p className="success-story-subtitle">مشاهده کامل داستان موفقیت</p>
            </div>
            <button className="close-button" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="story-detail-content">
          <div className="images-section">
            <div className="image-upload-section">
              <div className="section-header">
                <h3 className="section-title">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>تصویر اصلی داستان</span>
                </h3>
              </div>
              <div className="main-image-preview">
                <img
                  src={selectedImage}
                  alt={displayTitle}
                  className="main-preview-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/images/default-pet.png";
                  }}
                />
              </div>
            </div>

            {storyImages.length > 1 && (
              <div className="image-upload-section">
                <div className="section-header">
                  <h3 className="section-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>عکس‌های داستان</span>
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
                      className={`thumbnail-wrapper ${selectedImage === img.url ? 'active' : ''}`}
                      onClick={() => setSelectedImage(img.url)}
                    >
                      <div className="thumbnail">
                        <img
                          src={img.url}
                          alt={`????? ${index + 1}`}
                          className="thumbnail-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/assets/images/default-pet.png";
                          }}
                        />
                      </div>
                      <div className="thumbnail-number-badge">{index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="story-info-section">
            <div className="story-text-section">
              <div className="section-header">
                <h3 className="section-title">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                  <span>اطلاعات داستان</span>
                </h3>
              </div>
              
              <div className="story-header-details">
                <div className="story-title-wrapper">
                  <h2 className="story-title-main">{displayTitle}</h2>
                  <div 
                    className="story-status-badge"
                    style={{ 
                      backgroundColor: displayStatusColor,
                      color: displayStatusTextColor
                    }}
                  >
                    <HeartIcon />
                    <span>{displayStatus}</span>
                  </div>
                </div>
                
                <div className="story-meta">
                  <div className="meta-item">
                    <span className="meta-label">نویسنده:</span>
                    <span className="meta-value">{displayAuthor}</span>
                  </div>
                  <div className="meta-divider">•</div>
                  <div className="meta-item">
                    <span className="meta-label">تاریخ انتشار:</span>
                    <span className="meta-value">{displayDate}</span>
                  </div>
                </div>
              </div>

              <div className="content-section">
                <div className="section-header">
                  <h4 className="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    <span>داستان کامل</span>
                  </h4>
                </div>
                <div className="story-text-content">
                  <p>{displayContent}</p>
                </div>
              </div>

              <div className="tags-section">
                <div className="section-header">
                  <h4 className="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    <span>برچسب‌ها</span>
                  </h4>
                </div>
                <div className="tags-list">
                  <span className="story-tag">#داستان_موفقیت</span>
                  <span className="story-tag">#پتوریا</span>
                  <span className="story-tag">#بازگشت_به_خانواده</span>
                  <span className="story-tag">#حیوانات</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="story-detail-footer">
          <div className="footer-actions">
            <button className="cancel-btn" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>بازگشت به لیست</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
