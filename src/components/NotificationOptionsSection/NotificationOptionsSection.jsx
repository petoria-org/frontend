import React, { useState, useEffect } from "react";
import "../../styles/NotificationOptionsSection.css";
import searchIcon from '../../assets/icons/Search.svg';
import checkmarkIcon from '../../assets/icons/Checkmark Color.svg';
import heartIcon from '../../assets/icons/Vector.svg';
import calendarIcon from '../../assets/icons/calendar-2.svg';
import locationIcon from '../../assets/icons/location.svg';
import uploadIcon from '../../assets/icons/direct-inbox.svg';
import contactIcon from '../../assets/icons/stickynote.svg';
import closeIcon from '../../assets/icons/close.svg';

export const NotificationOptionsSection = ({ adData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    age: "",
    gender: "",
    location: "",
    lostTime: "",
    foundTime: "",
    specialSigns: "",
    description: "",
    status: "گم شده",
    images: [],
    imagePreview: "",
    breed: "",
    animalType: "",
    diseases: "",
    hasCertificate: false,
    isVaccinated: false,
    isSterilized: false
  });

  const [selectedAdType, setSelectedAdType] = useState("lost");

  useEffect(() => {
    if (adData) {
      setFormData({
        name: adData.name || "ماکس",
        type: adData.type || "سگ سفید گم شده در پارک",
        age: adData.age || "2 سال",
        gender: adData.gender || "نر",
        location: adData.location || "پارک لاله، منطقه ۶",
        lostTime: adData.lostTime || "دیروز عصر، ۱۴۰۲/۰۸/۱۵",
        foundTime: adData.foundTime || "",
        specialSigns: adData.specialSigns || "لکه سفید روی پیشانی، قلاده قرمز",
        description: adData.desc || "سگ سفید رنگ با لکه سیاه روی گوش چپ. بسیار بازیگوش و با کودکان رابطه خوبی دارد. در صورت دیدن با شماره زیر تماس بگیرید.",
        status: adData.status || "گم شده",
        images: adData.images || [],
        imagePreview: adData.image || "",
        breed: adData.breed || "ژرمن شپرد",
        animalType: adData.animalType || "سگ",
        diseases: adData.diseases || "",
        hasCertificate: adData.hasCertificate || false,
        isVaccinated: adData.isVaccinated || false,
        isSterilized: adData.isSterilized || false
      });

      if (adData.status === "پیدا شده") setSelectedAdType("found");
      else if (adData.status === "سرپرستی") setSelectedAdType("adoption");
      else setSelectedAdType("lost");
    }
  }, [adData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (name) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleAdTypeSelect = (type) => {
    setSelectedAdType(type);
    const statusMap = {
      lost: "گم شده",
      found: "پیدا شده",
      adoption: "سرپرستی"
    };
    setFormData(prev => ({
      ...prev,
      status: statusMap[type]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    const remainingSlots = 7 - formData.images.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    if (filesToAdd.length === 0) {
      alert("شما حداکثر 7 عکس می‌توانید آپلود کنید");
      return;
    }

    const newImages = filesToAdd.map(file => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (e) => {
          resolve({
            file: file,
            preview: e.target.result,
            id: Date.now() + Math.random()
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImages).then(images => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...images]
      }));
    });
  };

  const handleRemoveImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleRemoveAllImages = () => {
    setFormData(prev => ({
      ...prev,
      images: []
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedAd = {
      id: adData?.id,
      name: formData.name,
      type: formData.type,
      age: formData.age,
      gender: formData.gender,
      location: formData.location,
      lostTime: formData.lostTime,
      foundTime: formData.foundTime,
      specialSigns: formData.specialSigns,
      desc: formData.description,
      status: formData.status,
      images: formData.images,
      time: "همین الان ویرایش شد",
      breed: formData.breed,
      animalType: formData.animalType,
      diseases: formData.diseases,
      hasCertificate: formData.hasCertificate,
      isVaccinated: formData.isVaccinated,
      isSterilized: formData.isSterilized
    };

    onSave(updatedAd);
  };

  return (
    <div className="notification-options-section">
      <div className="notification-options-container">
        <div className="notification-options-content">
          <div className="notification-options-inner">
            
            <div className="form-section-header">
              <h2 className="notification-options-title">ویرایش آگهی</h2>
              <button 
                onClick={onClose}
                className="close-button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* بخش نوع آگهی */}
              <div className="form-section">
                <div className="form-vertical-fields">
                  <div className="form-field">
                    <h3 className="form-section-title">نوع آگهی</h3>
                    <div className="ad-type-grid">
                      <div 
                        className={`ad-type-card ad-type-card-lost ${selectedAdType === "lost" ? "ad-type-card-active" : ""}`}
                        onClick={() => handleAdTypeSelect("lost")}
                      >
                        <div className="ad-type-card-content">
                          <img 
                            className="ad-type-icon ad-type-icon-lost" 
                            src={searchIcon} 
                            alt="گم شده"
                          />
                          <span className={`ad-type-label ad-type-label-lost ${selectedAdType === "lost" ? "ad-type-label-active" : ""}`}>
                            گم شده
                          </span>
                        </div>
                      </div>

                      <div 
                        className={`ad-type-card ad-type-card-found ${selectedAdType === "found" ? "ad-type-card-active" : ""}`}
                        onClick={() => handleAdTypeSelect("found")}
                      >
                        <div className="ad-type-card-content">
                          <img 
                            className="ad-type-icon ad-type-icon-found" 
                            src={checkmarkIcon} 
                            alt="پیدا شده"
                          />
                          <span className={`ad-type-label ad-type-label-found ${selectedAdType === "found" ? "ad-type-label-active" : ""}`}>
                            پیدا شده
                          </span>
                        </div>
                      </div>

                      <div 
                        className={`ad-type-card ad-type-card-adoption ${selectedAdType === "adoption" ? "ad-type-card-active" : ""}`}
                        onClick={() => handleAdTypeSelect("adoption")}
                      >
                        <div className="ad-type-card-content">
                          <img 
                            className="ad-type-icon ad-type-icon-adoption" 
                            src={heartIcon} 
                            alt="سرپرستی"
                          />
                          <span className={`ad-type-label ad-type-label-adoption ${selectedAdType === "adoption" ? "ad-type-label-active" : ""}`}>
                            سرپرستی
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* گالری عکس‌ها */}
              <div className="form-section">
                <div className="form-vertical-fields">
                  <div className="form-field">
                    <h3 className="form-section-title">تصاویر حیوان</h3>
                    
                    {/* کادر اصلی نقطه‌چین با هدر داخلی */}
                    <div className="image-upload-main-container">
                      {/* هدر داخلی کادر */}
                      <div className="upload-container-header">
                        <div className="upload-header-info">
                          <span className="upload-header-title">گالری عکس‌ها</span>
                          <span className="upload-header-count">
                            {formData.images.length} از 7 عکس
                          </span>
                        </div>
                        
                        {/* دکمه حذف همه - داخل کادر */}
                        {formData.images.length > 0 && (
                          <button 
                            type="button"
                            className="remove-all-images-btn-inside"
                            onClick={handleRemoveAllImages}
                          >
                            <img src={closeIcon} alt="حذف همه" className="remove-all-icon" />
                            حذف همه عکس‌ها
                          </button>
                        )}
                      </div>
                      
                      {/* محتوای اصلی کادر */}
                      <div className="upload-container-content">
                        {/* نمایش عکس‌های آپلود شده */}
                        <div className="uploaded-images-grid">
                          {formData.images.map((image, index) => (
                            <div key={image.id} className="image-gallery-item">
                              <div className="image-item-overlay">
                                <img 
                                  src={image.preview} 
                                  alt={`تصویر ${index + 1}`} 
                                  className="gallery-image"
                                />
                                <div className="image-actions">
                                  <button 
                                    type="button"
                                    className="remove-single-image-btn"
                                    onClick={() => handleRemoveImage(image.id)}
                                  >
                                    <img src={closeIcon} alt="حذف" className="remove-icon" />
                                  </button>
                                  <span className="image-badge">{index + 1}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* دکمه افزودن عکس - همیشه نمایش داده می‌شود */}
                        {formData.images.length < 7 && (
                          <label className="image-upload-button">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              multiple
                              style={{ display: 'none' }}
                            />
                            <div className="upload-button-content">
                              <div className="upload-button-icon-wrapper">
                                <img 
                                  src={uploadIcon} 
                                  alt="Upload" 
                                  className="upload-button-icon"
                                />
                                <div className="upload-button-plus">+</div>
                              </div>
                              <span className="upload-button-text">افزودن عکس</span>
                            </div>
                          </label>
                        )}
                      </div>
                      
                      {/* فوتر کادر */}
                      <div className="upload-container-footer">
                        <div className="upload-footer-info">
                          <span className="upload-footer-icon">💡</span>
                          <span className="upload-footer-text">
                            عکس‌ها به ترتیب شماره‌گذاری نمایش داده می‌شوند
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* اطلاعات اصلی */}
              <div className="form-section">
                <div className="form-vertical-fields">
                  <div className="form-field">
                    <h3 className="form-section-title">اطلاعات اصلی</h3>
                    
                    <div className="form-grid">


                      <div className="form-field">
                        <label className="form-label">نام حیوان</label>
                        <div className="input-container">
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="مثال: ماکس، میمی، بادی"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label className="form-label">عنوان آگهی</label>
                        <div className="input-container">
                          <input
                            type="text"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="مثال: سگ سفید گم شده در پارک"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label className="form-label">نژاد</label>
                        <div className="input-container">
                          <input
                            type="text"
                            name="breed"
                            value={formData.breed}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="مثال: پرشین، ژرمن شپرد، پارسی"
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label className="form-label">نوع حیوان</label>
                        <div className="input-container">
                          <input
                            type="text"
                            name="animalType"
                            value={formData.animalType}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="مثال: سگ، گربه، پرنده"
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label className="form-label">سن</label>
                        <div className="input-container">
                          <input
                            type="text"
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="مثال: 2 سال، 6 ماه"
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label className="form-label">جنسیت</label>
                        <div className="input-container">
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="form-input"
                          >
                            <option value="">انتخاب جنسیت</option>
                            <option value="نر">نر</option>
                            <option value="ماده">ماده</option>
                          </select>
                        </div>
                      </div>

                    </div>

                    <div className="form-vertical-fields">
                      <div className="form-field">
                        <label className="form-label form-distance">موقعیت مکانی</label>
                        <div className="input-container">
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="form-input-with-icon"
                            placeholder="مثال: پارک لاله، خیابان ولیعصر، منطقه ۱"
                            required
                          />
                          <img 
                            src={locationIcon} 
                            alt="Location" 
                            className="form-input-icon"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* فیلدهای خاص بر اساس نوع آگهی */}
              {selectedAdType === "lost" && (
                <>
                  {/* زمان گم شدن */}
                  <div className="form-section">
                    <div className="form-vertical-fields">
                      <div className="form-field">
                        <label className="form-label form-distance">زمان گم شدن</label>
                        <div className="input-container">
                          <input
                            type="text"
                            name="lostTime"
                            value={formData.lostTime}
                            onChange={handleInputChange}
                            className="form-input-with-icon"
                            placeholder="مثال: دیروز عصر، ۱۴۰۲/۰۸/۱۵، ۱۸:۳۰"
                            required
                          />
                          <img 
                            src={calendarIcon} 
                            alt="Time" 
                            className="form-input-icon"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* علائم خاص */}
                  <div className="form-section">
                    <div className="form-vertical-fields">
                      <div className="form-field">
                        <label className="form-label form-distance">علائم خاص</label>
                        <div className="input-container">
                          <input
                            type="text"
                            name="specialSigns"
                            value={formData.specialSigns}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="مثال: لکه سفید روی پیشانی، پای شکسته، قلاده قرمز"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedAdType === "found" && (
                <>
                  {/* زمان پیدا شدن */}
                  <div className="form-section">
                    <div className="form-vertical-fields">
                      <div className="form-field">
                        <label className="form-label form-distance">زمان پیدا شدن</label>
                        <div className="input-container">
                          <input
                            type="text"
                            name="foundTime"
                            value={formData.foundTime}
                            onChange={handleInputChange}
                            className="form-input-with-icon"
                            placeholder="مثال: امروز صبح، ۱۴۰۲/۰۸/۱۶، ۰۸:۱۵"
                            required
                          />
                          <img 
                            src={calendarIcon} 
                            alt="Time" 
                            className="form-input-icon"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* علائم خاص */}
                  <div className="form-section">
                    <div className="form-vertical-fields">
                      <div className="form-field">
                        <label className="form-label form-distance">علائم خاص</label>
                        <div className="input-container">
                          <input
                            type="text"
                            name="specialSigns"
                            value={formData.specialSigns}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="مثال: لکه سفید روی پیشانی، پای شکسته، قلاده قرمز"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedAdType === "adoption" && (
                <>
                  {/* بیماری‌ها */}
                  <div className="form-section">
                    <div className="form-vertical-fields">
                      <div className="form-field">
                        <label className="form-label form-distance">بیماری‌ها (در صورت وجود)</label>
                        <div className="input-container">
                          <input
                            type="text"
                            name="diseases"
                            value={formData.diseases}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="بیماری‌های خاص را ذکر کنید یا خالی بگذارید"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* وضعیت سلامت */}
                  <div className="form-section">
                    <div className="form-vertical-fields">
                      <div className="form-field">
                        <label className="form-label form-distance">وضعیت سلامت</label>
                        <div className="health-status-grid">
                          <div className={`health-status-card ${formData.hasCertificate ? 'active' : ''}`}>
                            <span className="health-status-label">دارای شناسنامه</span>
                            <label className="health-toggle-switch">
                              <input
                                type="checkbox"
                                checked={formData.hasCertificate}
                                onChange={() => handleToggleChange('hasCertificate')}
                              />
                              <span className="health-toggle-slider"></span>
                            </label>
                          </div>
                          
                          <div className={`health-status-card ${formData.isVaccinated ? 'active' : ''}`}>
                            <span className="health-status-label">واکسینه شده</span>
                            <label className="health-toggle-switch">
                              <input
                                type="checkbox"
                                checked={formData.isVaccinated}
                                onChange={() => handleToggleChange('isVaccinated')}
                              />
                              <span className="health-toggle-slider"></span>
                            </label>
                          </div>
                          
                          <div className={`health-status-card ${formData.isSterilized ? 'active' : ''}`}>
                            <span className="health-status-label">عقیم شده</span>
                            <label className="health-toggle-switch">
                              <input
                                type="checkbox"
                                checked={formData.isSterilized}
                                onChange={() => handleToggleChange('isSterilized')}
                              />
                              <span className="health-toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* توضیحات */}
              <div className="form-section">
                <div className="form-vertical-fields">
                  <div className="form-field">
                    <label className="form-label form-distance">توضیحات</label>
                    <div className="input-container">
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="form-textarea"
                        placeholder={
                          selectedAdType === "lost" 
                            ? "توضیحات کامل درباره حیوان گم شده، آخرین موقعیت دیده شدن، ویژگی‌های رفتاری و هر اطلاعات مفید دیگری که می‌تواند به پیدا کردن حیوان کمک کند."
                            : selectedAdType === "found"
                            ? "توضیحات کامل درباره حیوان پیدا شده، شرایط فعلی، ویژگی‌های رفتاری و هر اطلاعات مفید دیگری که می‌تواند به پیدا کردن صاحب اصلی کمک کند."
                            : "توضیحات کامل درباره حیوان، ویژگی‌های رفتاری، شرایط خاص سلامت، نیازهای خاص و هر اطلاعات مفید دیگری برای سرپرستی."
                        }
                        rows="4"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* اطلاعات تماس */}
              <div className="form-section">
                <div className="form-vertical-fields">
                  <div className="form-field">
                    <div className="contact-info-card">
                      <div className="contact-info-header">
                        <h4 className="contact-info-title">اطلاعات تماس</h4>
                        <img 
                          src={contactIcon} 
                          alt="Contact" 
                          className="contact-info-icon"
                        />
                      </div>
                      <div className="form-grid">
                        <div className="form-field">
                          <label className="form-label form-label-small">ایمیل</label>
                          <div className="input-container">
                            <input
                              type="text"
                              className="form-input"
                              value="saranasher8@gmail.com"
                              disabled
                            />
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label form-label-small">شماره موبایل</label>
                          <div className="input-container">
                            <input
                              type="text"
                              className="form-input"
                              value="09123456789"
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                      <p className="contact-info-note">
                        در صورت خالی گذاشتن، اطلاعات پیش‌فرض حساب کاربری شما استفاده می‌شود
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* دکمه‌های action */}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="form-button form-button-cancel"
                  onClick={onClose}
                >
                  انصراف
                </button>
                <button 
                  type="submit" 
                  className="form-button form-button-submit"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};