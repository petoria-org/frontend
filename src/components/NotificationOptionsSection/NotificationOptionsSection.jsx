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
import { NotificationToast } from '../NotificationToast/NotificationToast';
import {
  getLostPostDetail,
  getFoundPostDetail,
  getSurrenderPostDetail,
  updateLostPost,
  updateFoundPost,
  updateSurrenderPost
} from "../../Services/userService";

const toInputDateTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
};

const toISO = (value) => {
  if (!value) return null;
  return new Date(value).toISOString();
};

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
    isSterilized: false,
    email: "",
    phone: "",
    contact_email: true
  });

  const [selectedAdType, setSelectedAdType] = useState("lost");
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!adData) return;

    const fetchDetail = async () => {
      try {
        let data;

        if (adData.status === "lost") {
          data = await getLostPostDetail(adData.id);
          setSelectedAdType("lost");
        } 
        else if (adData.status === "found") {
          data = await getFoundPostDetail(adData.id);
          setSelectedAdType("found");
        } 
        else {
          data = await getSurrenderPostDetail(adData.id);
          setSelectedAdType("adoption");
        }

        setFormData({
          name: data.pet_name || "",
          type: data.title || "",
          age: data.pet_age || "",
          gender: data.pet_sex === "male" ? "نر" : "ماده",
          location: data.location?.readable || "",
          lostTime: toInputDateTime(data.lost_time),
          foundTime: toInputDateTime(data.found_time),
          specialSigns: data.Specific_symptoms || "",
          description: data.description || "",
          breed: data.breed || "",
          animalType: data.pet_type === "cat" ? "گربه" : "سگ",
          diseases: data.diseases || "",
          hasCertificate: data.has_birth_certificate || false,
          isVaccinated: data.vaccination || false,
          isSterilized: data.steriliz || false,
          images: [],
          imagePreview: data.thumbnail || "",
          email: data.email || "",
          phone: data.phone || "",
          contact_email: data.contact_email !== undefined ? data.contact_email : true
        });
      } catch (error) {
        console.error("Error fetching post detail:", error);
        setNotification({
          message: "خطا در دریافت اطلاعات آگهی",
          type: "error"
        });
      }
    };

    fetchDetail();
  }, [adData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
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
      setNotification({
        message: "شما حداکثر 7 عکس می‌توانید آپلود کنید",
        type: "error"
      });
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
      
      if (images.length > 0) {
        setNotification({
          message: `${images.length} عکس با موفقیت آپلود شد`,
          type: "success"
        });
      }
    }).catch(error => {
      setNotification({
        message: "خطا در آپلود عکس‌ها",
        type: "error"
      });
    });
  };

  const handleRemoveImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
    setNotification({
      message: "عکس با موفقیت حذف شد",
      type: "success"
    });
  };

  const handleRemoveAllImages = () => {
    setFormData(prev => ({
      ...prev,
      images: []
    }));
    setNotification({
      message: "تمام عکس‌ها با موفقیت حذف شدند",
      type: "success"
    });
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      title: formData.type,
      pet_name: formData.name,
      pet_type: formData.animalType === "گربه" ? "cat" : "dog",
      pet_sex: formData.gender === "نر" ? "male" : "female",
      pet_age: formData.age || null,
      Specific_symptoms: formData.specialSigns || "",
      description: formData.description,
      diseases: formData.diseases || "",
      has_birth_certificate: formData.hasCertificate,
      vaccination: formData.isVaccinated,
      steriliz: formData.isSterilized,
      contact_email: formData.contact_email
    };

    // فقط اگر کاربر اجازه نمایش ایمیل را داده، اطلاعات تماس را ارسال کنید
    if (formData.contact_email) {
      if (formData.email) payload.email = formData.email;
      if (formData.phone) payload.phone = formData.phone;
    } else {
      // اگر contact_email false است، مطمئن شویم اطلاعات تماس ارسال نمی‌شود
      delete payload.email;
      delete payload.phone;
    }

    try {
      if (selectedAdType === "lost") {
        payload.lost_time = toISO(formData.lostTime);
        await updateLostPost(adData.id, payload);
      }

      if (selectedAdType === "found") {
        payload.found_time = toISO(formData.foundTime);
        await updateFoundPost(adData.id, payload);
      }

      if (selectedAdType === "adoption") {
        await updateSurrenderPost(adData.id, payload);
      }

      showNotification("آگهی با موفقیت ویرایش شد", "success");
      
      setTimeout(() => {
        onSave();
        setIsLoading(false);
      }, 1500);

    } catch (err) {
      console.error("Update error:", err);
      setIsLoading(false);
      showNotification("خطا در ویرایش آگهی. لطفاً دوباره تلاش کنید", "error");
    }
  };

  return (
    <>
      <div className="notification-options-section">
        <div className="notification-options-container">
          <div className="notification-options-content">
            <div className="notification-options-inner">
              
              <div className="form-section-header">
                <h2 className="notification-options-title">ویرایش آگهی</h2>
                <button 
                  onClick={onClose}
                  className="close-button"
                  disabled={isLoading}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
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

                <div className="form-section">
                  <div className="form-vertical-fields">
                    <div className="form-field">
                      <h3 className="form-section-title">تصاویر حیوان</h3>

                      <div className="image-upload-main-container">
                        <div className="upload-container-header">
                          <div className="upload-header-info">
                            <span className="upload-header-title">گالری عکس‌ها</span>
                            <span className="upload-header-count">
                              {formData.images.length} از 7 عکس
                            </span>
                          </div>

                          {formData.images.length > 0 && (
                            <button 
                              type="button"
                              className="remove-all-images-btn-inside"
                              onClick={handleRemoveAllImages}
                              disabled={isLoading}
                            >
                              <img src={closeIcon} alt="حذف همه" className="remove-all-icon" />
                              حذف همه عکس‌ها
                            </button>
                          )}
                        </div>

                        <div className="upload-container-content">
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
                                      disabled={isLoading}
                                    >
                                      <img src={closeIcon} alt="حذف" className="remove-icon" />
                                    </button>
                                    <span className="image-badge">{index + 1}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {formData.images.length < 7 && (
                            <label className="image-upload-button">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                multiple
                                style={{ display: 'none' }}
                                disabled={isLoading}
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
                              disabled={isLoading}
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
                              disabled={isLoading}
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
                              disabled={isLoading}
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
                              disabled={isLoading}
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
                              disabled={isLoading}
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
                              disabled={isLoading}
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
                              disabled={isLoading}
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

                {selectedAdType === "lost" && (
                  <>
                    <div className="form-section">
                      <div className="form-vertical-fields">
                        <div className="form-field">
                          <label className="form-label form-distance">زمان گم شدن</label>
                          <div className="input-container">
                            <input
                              type="datetime-local"
                              name="lostTime"
                              value={formData.lostTime}
                              onChange={handleInputChange}
                              className="form-input-with-icon"
                              placeholder="مثال: دیروز عصر، ۱۴۰۲/۰۸/۱۵، ۱۸:۳۰"
                              required
                              disabled={isLoading}
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
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedAdType === "found" && (
                  <>
                    <div className="form-section">
                      <div className="form-vertical-fields">
                        <div className="form-field">
                          <label className="form-label form-distance">زمان پیدا شدن</label>
                          <div className="input-container">
                            <input
                              type="datetime-local"
                              name="foundTime"
                              value={formData.foundTime}
                              onChange={handleInputChange}
                              className="form-input-with-icon"
                              placeholder="مثال: امروز صبح، ۱۴۰۲/۰۸/۱۶، ۰۸:۱۵"
                              required
                              disabled={isLoading}
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
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedAdType === "adoption" && (
                  <>
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
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

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
                                  disabled={isLoading}
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
                                  disabled={isLoading}
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
                                  disabled={isLoading}
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
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-vertical-fields">
                    <div className="form-field">
                      <h3 className="form-section-title">تنظیمات تماس</h3>
                      
                      <div className="contact-settings-toggle">
                        <div className="toggle-container">
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={formData.contact_email}
                              onChange={() => handleToggleChange('contact_email')}
                              disabled={isLoading}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                          <div className="toggle-info">
                            <span className="toggle-label">نمایش اطلاعات تماس در آگهی</span>
                            <p className="toggle-description">
                              {formData.contact_email 
                                ? "ایمیل شما در آگهی نمایش داده می‌شود"
                                : "ایمیل و شماره تماس شما در آگهی نمایش داده نمی‌شود. کاربران از طریق پیام خصوصی می‌توانند با شما ارتباط برقرار کنند."
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {formData.contact_email ? (
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
                                  type="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  className="form-input"
                                  placeholder="saranasher8@gmail.com"
                                  disabled={isLoading}
                                />
                              </div>
                            </div>
                          </div>
                          <p className="contact-info-note">
                            این اطلاعات در آگهی شما نمایش داده خواهد شد
                          </p>
                        </div>
                      ) : (
                        <div className="contact-disabled-message">
                          <div className="contact-disabled-icon">🔒</div>
                          <div className="contact-disabled-content">
                            <h4 className="contact-disabled-title">اطلاعات تماس مخفی است</h4>
                            <p className="contact-disabled-description">
                              اطلاعات تماس شما در این آگهی نمایش داده نمی‌شود. 
                              کاربران از طریق پیام خصوصی می‌توانند با شما ارتباط برقرار کنند.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="form-button form-button-cancel"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    انصراف
                  </button>
                  <button 
                    type="submit" 
                    className="form-button form-button-submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="loading-spinner">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.3"/>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                            <animateTransform 
                              attributeName="transform" 
                              type="rotate" 
                              from="0 12 12" 
                              to="360 12 12" 
                              dur="1s" 
                              repeatCount="indefinite"
                            />
                          </path>
                        </svg>
                        در حال ذخیره...
                      </span>
                    ) : (
                      "ذخیره تغییرات"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};