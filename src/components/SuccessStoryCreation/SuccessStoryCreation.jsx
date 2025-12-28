import React, { useState, useRef, useEffect } from "react";
import "../../styles/SuccessStoryCreation.css";
import { useOutletContext } from "react-router-dom";
import { createSuccessStory } from "../../Services/successStoryService";

export const SuccessStoryCreation = ({ pet, onSave, onCancel, onRemove }) => {
  const [images, setImages] = useState([]);
  const [storyText, setStoryText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
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
    if (pet?.successStory) {
      setStoryText(pet.successStory);
    }
    if (pet?.images && Array.isArray(pet.images)) {
      setImages(pet.images.map((url, index) => ({
        id: Date.now() + index,
        url: url,
        name: `تصویر ${index + 1}`
      })));
    }
  }, [pet]);

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

    e.target.value = "";
  };

  const handleFiles = (files) => {
    const totalFiles = images.length + files.length;
    if (totalFiles > 7) {
      alert("حداکثر می‌توانید 7 عکس آپلود کنید");
      return;
    }

    const newImages = files.map((file, index) => {
      const reader = new FileReader();
      
      return new Promise((resolve) => {
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
          resolve(newImage);
        };

        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImages).then(loadedImages => {
      setImages(prev => [...prev, ...loadedImages]);
    });
  };

  const removeImage = (id) => {
    setImages(prev => {
      const nextImages = prev.filter(img => img.id !== id);

      setActiveImageIndex(index =>
        index >= nextImages.length ? Math.max(0, nextImages.length - 1) : index
      );

      return nextImages;
    });
  };

  const handleSave = async () => {
    if (!storyText.trim()) {
      alert("لطفا متن داستان موفقیت را وارد کنید");
      return;
    }

    if (pet?.hasSuccessStory && !pet.successStory) {
      alert("برای این پست قبلاً داستان موفق ثبت شده است. نمی‌توانید داستان جدیدی ثبت کنید.");
      return;
    }

    try {
      const payload = {
        title: `داستان ${pet?.name || "موفقیت"}`,
        story: storyText.trim(),
        story_type: pet?.status === "adoption" ? "surrender" : pet?.status,
        pet_id: pet?.id, 
        images: images
          .filter(img => img.file)
          .map(img => img.file),
      };

      const createdStory = await createSuccessStory(payload);

      onSave?.({
        id: createdStory.id,
        title: createdStory.title,
        author: createdStory.user_name,
        date: new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(new Date(createdStory.created_at)),
        status:
          createdStory.story_type === "lost"
            ? "بازگشت به خانه"
            : createdStory.story_type === "found"
            ? "به خانواده بازگشت"
            : "فرزندخوانده شد",
        statusColor: "rgba(122, 238, 151, 0.15)",
        statusTextColor: "#0f7228",
        image:
          createdStory.images?.length > 0
            ? createdStory.images[0].image
            : "/src/assets/images/default-pet.png",
        images: createdStory.images
          ? createdStory.images.map(img => img.image)
          : [],
        content: createdStory.story,
        pet_id: pet?.id, 
      });

      setStoryText("");
      setImages([]);
      setActiveImageIndex(0);

    } catch (err) {
      console.error(err);

      if (err.response?.status === 400 && err.response?.data?.error?.includes("already has a success story")) {
        alert("برای این پست قبلاً داستان موفق ثبت شده است.");
      } 
      
      else {
        alert("خطا در ثبت داستان موفقیت");
      }
    }
  };

  const handleCancel = () => {
    setStoryText("");
    setImages([]);
    setActiveImageIndex(0);

    onCancel?.();
  };

  const handleRemoveStory = () => {
    if (window.confirm("آیا از حذف داستان موفقیت مطمئن هستید؟")) {
      const removeData = {
        petId: pet?.id,
        action: "remove",
        storyText: "",
        images: [],
        hasSuccessStory: false 
      };
      
      onSave?.(removeData);

      setStoryText("");
      setImages([]);
      setActiveImageIndex(0);
    }
  };

  const handleClose = () => {
    handleCancel();
  };

  const ImageIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

  const TrashIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );

  return (
    <div className="success-story-creation-overlay" onClick={handleClose}>
      <div className="success-story-creation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-story-header">
          <div className="header-content">
            <div className="header-icon">
              <SparkleIcon />
            </div>
            <div className="header-text">
              <h2 className="success-story-title">
                {pet?.hasSuccessStory || pet?.successStory ? 
                  (pet?.successStory ? "ویرایش داستان موفقیت" : "مشاهده داستان موفقیت") : 
                  "ثبت داستان موفقیت"}
              </h2>
              <p className="success-story-subtitle">
                {pet?.hasSuccessStory || pet?.successStory 
                  ? `داستان موفقیت ${pet?.name || "پت"} را مشاهده یا ویرایش کنید`
                  : `داستان خود را از پیدا کردن ${pet?.name || "پت خود"} به اشتراک بگذارید`}
              </p>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="success-story-content">
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

            <div 
              ref={dropZoneRef}
              className={`drop-zone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{ cursor: images.length === 0 ? 'pointer' : 'default' }}
            >
              {images.length === 0 ? (
                <div 
                  className="empty-drop-zone"
                  onClick={() => fileInputRef.current?.click()}
                >
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
                  <div className="preview-area">
                    {images[activeImageIndex] && (
                      <div className="main-image-preview">
                        <img 
                          src={images[activeImageIndex].url} 
                          alt={`Preview ${activeImageIndex + 1}`}
                          className="main-preview-image"
                        />
                        
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

                      {images.length < 7 && (
                        <div 
                          className="add-more-thumbnail"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          <div className="add-more-icon">+</div>
                          <span className="add-more-text">افزودن</span>
                        </div>
                      )}
                    </div>
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

        <div className="success-story-footer">
          {pet?.successStory && (
            <button 
              className="cancel-btn" 
              onClick={handleRemoveStory}
              style={{ 
                background: '#fee2e2',
                color: '#dc2626',
                borderColor: '#fca5a5'
              }}
            >
              <TrashIcon />
              <span>حذف داستان</span>
            </button>
          )}
          
          <button className="cancel-btn" onClick={handleCancel}>
            انصراف
          </button>
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={!storyText.trim() || (pet?.hasSuccessStory && !pet?.successStory)}
          >
            <SparkleIcon />
            <span>
              {pet?.hasSuccessStory || pet?.successStory 
                ? (pet?.successStory ? "بروزرسانی داستان" : "مشاهده داستان") 
                : "انتشار داستان موفقیت"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};