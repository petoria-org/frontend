import React, { useState, useRef, useEffect } from "react";
import "../../styles/SuccessStoryCreation.css";

export const SuccessStoryCreation = ({ petData, onClose, onSave }) => {
  const [images, setImages] = useState([]);
  const [storyText, setStoryText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

    useEffect(() => {
    // قفل کردن اسکرول صفحه اصلی
    document.body.style.overflow = "hidden";

    return () => {
        // آزاد کردن اسکرول وقتی مودال بسته شد
        document.body.style.overflow = "";
    };
    }, []);

  useEffect(() => {
    if (petData?.successStory) {
      setStoryText(petData.successStory);
    }
    if (petData?.images && Array.isArray(petData.images)) {
      setImages(petData.images.map((url, index) => ({
        id: Date.now() + index,
        url: url,
        name: `تصویر ${index + 1}`
      })));
    }
  }, [petData]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files) => {
    const totalFiles = images.length + files.length;
    if (totalFiles > 7) {
      alert("حداکثر می‌توانید 7 عکس آپلود کنید");
      return;
    }

    files.forEach((file, index) => {
      const reader = new FileReader();
      
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 0
      }));

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[file.name] || 0;
          if (current >= 90) {
            clearInterval(interval);
            return prev;
          }
          return {
            ...prev,
            [file.name]: current + 10
          };
        });
      }, 100);

      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + index,
          url: e.target.result,
          file: file,
          name: file.name
        };

        setImages(prev => [...prev, newImage]);
        
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }));

        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }, 500);

        clearInterval(interval);
      };

      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (activeImageIndex >= images.length - 1) {
      setActiveImageIndex(prev => Math.max(0, prev - 1));
    }
  };

  const handleSave = () => {
    if (!storyText.trim()) {
      alert("لطفا متن داستان موفقیت را وارد کنید");
      return;
    }

    const successData = {
      petId: petData?.id,
      petName: petData?.name,
      storyText,
      images: images.map(img => img.url),
      createdAt: new Date().toISOString()
    };

    onSave?.(successData);
  };

  const ImageIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );

  const UploadIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );

  const CameraIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );

  const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );

  const ArrowRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );

  const SparkleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );

  return (
    <div className="success-story-creation-overlay">
      <div className="success-story-creation-modal">
        {/* Header */}
        <div className="success-story-header">
          <div className="header-content">
            <div className="header-icon">
              <SparkleIcon />
            </div>
            <div className="header-text">
              <h2 className="success-story-title">داستان موفقیت</h2>
              <p className="success-story-subtitle">
                داستان خود را از پیدا کردن {petData?.name || "پت خود"} به اشتراک بگذارید
              </p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Main Content */}
        <div className="success-story-content">
          {/* Image Upload Section */}
          <div className="image-upload-section">
            <div className="section-header">
              <div className="section-title">
                <CameraIcon />
                <span>آپلود عکس‌ها</span>
              </div>
              <div className="image-counter">
                <span className="current-count">{images.length}</span>
                <span className="max-count">/7</span>
              </div>
            </div>

            {/* Drop Zone */}
            <div 
              ref={dropZoneRef}
              className={`drop-zone ${isDragging ? 'dragging' : ''} ${images.length === 0 ? 'empty' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => images.length === 0 && fileInputRef.current?.click()}
            >
              {images.length === 0 ? (
                <div className="empty-drop-zone">
                  <div className="upload-icon">
                    <UploadIcon />
                  </div>
                  <p className="upload-instruction">
                    عکس‌ها را اینجا بکشید یا کلیک کنید
                  </p>
                  <p className="upload-hint">حداکثر 7 عکس • JPG, PNG تا 5MB</p>
                </div>
              ) : (
                <div className="image-preview-container">
                  {/* Main Preview */}
                  {images[activeImageIndex] && (
                    <div className="main-image-preview">
                      <img 
                        src={images[activeImageIndex].url} 
                        alt={`Preview ${activeImageIndex + 1}`}
                        className="main-preview-image"
                      />
                      
                      {/* Navigation Arrows */}
                      {images.length > 1 && (
                        <>
                          <button 
                            className="nav-arrow prev-arrow"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex(prev => 
                                prev === 0 ? images.length - 1 : prev - 1
                              );
                            }}
                          >
                            <ArrowRightIcon />
                          </button>
                          <button 
                            className="nav-arrow next-arrow"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex(prev => 
                                prev === images.length - 1 ? 0 : prev + 1
                              );
                            }}
                          >
                            <ArrowLeftIcon />
                          </button>
                        </>
                      )}

                      {/* Progress Bar for Uploading Images */}
                      {uploadProgress[images[activeImageIndex]?.name] && 
                       uploadProgress[images[activeImageIndex]?.name] < 100 && (
                        <div className="upload-progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${uploadProgress[images[activeImageIndex]?.name]}%` 
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Thumbnails */}
                  <div className="thumbnail-container">
                    {images.map((image, index) => (
                      <div 
                        key={image.id}
                        className={`thumbnail-wrapper ${index === activeImageIndex ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(index);
                        }}
                      >
                        <div className="thumbnail">
                          <img 
                            src={image.url} 
                            alt={`Thumbnail ${index + 1}`}
                            className="thumbnail-image"
                          />
                          <button 
                            className="remove-thumbnail"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(image.id);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add More Button */}
                    {images.length < 7 && (
                      <div 
                        className="add-more-thumbnail"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="add-more-icon">+</div>
                        <span className="add-more-text">افزودن</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Story Text Section */}
          <div className="story-text-section">
            <div className="section-header">
              <div className="section-title">
                <ImageIcon />
                <span>داستان خود را بنویسید</span>
              </div>
              <div className="character-counter">
                <span className={`character-count ${storyText.length > 500 ? 'warning' : ''}`}>
                  {storyText.length}
                </span>
                <span className="character-max">/500</span>
              </div>
            </div>

            <div className="story-textarea-wrapper">
              <textarea
                className="story-textarea"
                placeholder="داستان موفقیت خود را اینجا بنویسید... مثلاً چگونه پت خود را پیدا کردید، چه چالش‌هایی داشتید و چه لحظه‌ای برای شما ویژه بود."
                value={storyText}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setStoryText(e.target.value);
                  }
                }}
                rows={8}
                dir="rtl"
              />
              
              {/* Text Formatting Tools */}
              <div className="text-formatting-tools">
                <button 
                  className="format-btn"
                  onClick={() => setStoryText(prev => prev + "❤️")}
                  type="button"
                >
                  ❤️
                </button>
                <button 
                  className="format-btn"
                  onClick={() => setStoryText(prev => prev + "🐶")}
                  type="button"
                >
                  🐶
                </button>
                <button 
                  className="format-btn"
                  onClick={() => setStoryText(prev => prev + "😊")}
                  type="button"
                >
                  😊
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="story-tips">
              <h4 className="tips-title">نکات نوشتن داستان موفق:</h4>
              <ul className="tips-list">
                <li>تجربه شخصی خود را به اشتراک بگذارید</li>
                <li>جزئیات مهم را فراموش نکنید</li>
                <li>احساسات خود را توصیف کنید</li>
                <li>از دیگران تشکر کنید اگر کمکی کردند</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="success-story-footer">
          <button className="cancel-btn" onClick={onClose}>
            انصراف
          </button>
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={!storyText.trim()}
          >
            <SparkleIcon />
            <span>انتشار داستان موفقیت</span>
          </button>
        </div>
      </div>
    </div>
  );
};