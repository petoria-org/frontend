import React, { useState, useEffect } from "react";
import "../../styles/SuccessStoryDetail.css";
import { useOutletContext } from "react-router-dom";
import { getSuccessStoryDetail } from "../../Services/successStoryService";

export const SuccessStoryDetail = ({ story, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(story.images && story.images.length > 0 ? story.images[0] : story.image);
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

  const storyImages = story.images && story.images.length > 0
  ? story.images
  : story.image
      ? [story.image]
      : [];

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
                  alt={story.title}
                  className="main-preview-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZjBmMGYwIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNmMGYwZjAiLz48cGF0aCBkPSJNMTkgNUg1Yy0xLjEgMC0yIC45LTIgMnYxNGMwIDEuMS45IDIgMiAyaDE0YzEuMSAwIDItLjkgMi0yVjdjMC0xLjEtLjktMi0yLTJ6bTAgMTZINVY3aDE0djE0ek0xMy41MSA4LjQ5Yy0xLjA2LTEuMDYtIi43OC0xLjA2LTMuODQgMEw3LjUgMTEuMTdsLS4wOS0uMDljLS4zOS0uMzktMS4wMi0uMzktMS40MSAwLS4zOS4zOS0uMzkgMS4wMiAwIDEuNDFsMy41OSAzLjU5Yy44OS44OSAyLjMzLjg5IDMuMjIwMGw1LjU5LTUuNTljLjM5LS4zOS4zOS0xLjAyIDAtMS40MS0uMzktLjM4LTEuMDItLjM5LTEuNDEtLjA4bC01LjA4IDUuMDd6Ii8+PC9zdmc+";
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
                      key={index}
                      className={`thumbnail-wrapper ${selectedImage === img ? 'active' : ''}`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <div className="thumbnail">
                        <img
                          src={img}
                          alt={`تصویر ${index + 1}`}
                          className="thumbnail-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2YwZjBmMCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjBmMGYwIi8+PHBhdGggZD0iTTE5IDVINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMlY3YzAtMS4xLS45LTItMi0yem0wIDE2SDVWN2gxNHYxNHpNMTMuNTEgOC40OWMtMS4wNi0xLjA2LTIuNzgtMS4wNi0zLjg0IDBMNy41IDExLjE3bC0uMDktLjA5Yy0uMzktLjM5LTEuMDItLjM5LTEuNDEgMC0uMzkuMzktLjM5IDEuMDIgMCAxLjQxbDMuNTkgMy41OWMuODkuODkgMi4zMy44OSAzLjIyMGw1LjU5LTUuNTljLjM5LS4zOS4zOS0xLjAyIDAtMS40MS0uMzktLjM4LTEuMDItLjM5LTEuNDEtLjA4bC01LjA4IDUuMDd6Ii8+PC9zdmc+";
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
                  <h2 className="story-title-main">{story.title}</h2>
                  <div 
                    className="story-status-badge"
                    style={{ 
                      backgroundColor: story.statusColor,
                      color: story.statusTextColor
                    }}
                  >
                    <HeartIcon />
                    <span>{story.status}</span>
                  </div>
                </div>
                
                <div className="story-meta">
                  <div className="meta-item">
                    <span className="meta-label">نویسنده:</span>
                    <span className="meta-value">{story.author}</span>
                  </div>
                  <div className="meta-divider">•</div>
                  <div className="meta-item">
                    <span className="meta-label">تاریخ انتشار:</span>
                    <span className="meta-value">{story.date}</span>
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
                  <p>{story.content}</p>
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