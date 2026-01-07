import React, { useState, useRef, useEffect } from "react";
import "../../styles/ProfileEdit.css";
import { NotificationToast } from '../NotificationToast/NotificationToast';
import { ImageCropper } from "../ImageCropper";

const ProfileEditEditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#1c7bd1" strokeWidth="2"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#1c7bd1" strokeWidth="2"/>
  </svg>
);

const ProfileEditCameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11z" 
      stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const ProfileEditLockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="#1c7bd1" strokeWidth="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4" stroke="#1c7bd1" strokeWidth="2"/>
  </svg>
);

const ProfileEdit = ({ userData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: userData?.username || "",
    email: userData?.email || "",
    profileImage: userData?.profileImage || null,
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setNotification({
        message: "لطفا فقط تصویر آپلود کنید",
        type: "error"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        message: "حجم تصویر نباید بیشتر از 5 مگابایت باشد",
        type: "error"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageToCrop(event.target.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedResult) => {
    if (croppedResult && croppedResult.image) {
      const timestamp = Date.now();
      const imageUrl = `${croppedResult.image}?t=${timestamp}`;
      
      setFormData(prev => ({
        ...prev,
        profileImage: imageUrl
      }));
      
      setNotification({
        message: "تصویر پروفایل با موفقیت برش و ذخیره شد",
        type: "success"
      });
    }
    
    setCropModalOpen(false);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      profileImage: null
    }));
    setNotification({
      message: "تصویر پروفایل حذف شد",
      type: "success"
    });
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.username.trim()) {
      errors.push("نام کاربری نمی‌تواند خالی باشد");
    }
    
    if (!formData.email.trim()) {
      errors.push("ایمیل نمی‌تواند خالی باشد");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("فرمت ایمیل معتبر نیست");
    }
    
    if (!formData.firstName.trim()) {
      errors.push("نام نمی‌تواند خالی باشد");
    }
    
    if (!formData.lastName.trim()) {
      errors.push("نام خانوادگی نمی‌تواند خالی باشد");
    }
    
    if (formData.username.length < 3) {
      errors.push("نام کاربری باید حداقل ۳ کاراکتر باشد");
    }
    
    if (formData.username.length > 20) {
      errors.push("نام کاربری نمی‌تواند بیشتر از ۲۰ کاراکتر باشد");
    }
    
    if (showPasswordFields) {
      if (!formData.currentPassword) {
        errors.push("رمز عبور فعلی را وارد کنید");
      }
      
      if (formData.newPassword && formData.newPassword.length < 6) {
        errors.push("رمز عبور جدید باید حداقل ۶ کاراکتر باشد");
      }
      
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        errors.push("رمز عبور جدید و تأیید آن مطابقت ندارند");
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setNotification({
        message: validationErrors.join(" - "),
        type: "error"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const saveData = {
        username: formData.username,
        email: formData.email,
        profileImage: formData.profileImage,
        firstName: formData.firstName,
        lastName: formData.lastName
      };
      
      if (showPasswordFields && formData.newPassword) {
        saveData.currentPassword = formData.currentPassword;
        saveData.newPassword = formData.newPassword;
      }
      
      onSave?.(saveData);
      
      setNotification({
        message: "پروفایل با موفقیت ویرایش شد",
        type: "success"
      });
      
      setTimeout(() => {
        setIsLoading(false);
        onClose?.();
      }, 1000);
      
    } catch (error) {
      setNotification({
        message: "خطا در ویرایش پروفایل. لطفا دوباره تلاش کنید",
        type: "error"
      });
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose?.();
  };

  const togglePasswordFields = () => {
    setShowPasswordFields(!showPasswordFields);
    if (showPasswordFields) {
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    }
  };

  return (
    <div className="profile-edit-overlay-container">
      <div className="profile-edit-modal-section">
        <div className="profile-edit-modal-container">
          <div className="profile-edit-modal-content">
            <div className="profile-edit-content-scroll-wrapper">
              <div className="profile-edit-inner-content">
                <div className="profile-edit-header-section">
                  <h2 className="profile-edit-title-text">ویرایش پروفایل</h2>
                  <button
                    onClick={onClose}
                    className="profile-edit-close-button"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="profile-edit-form-section">
                    <div className="profile-edit-fields-vertical">
                      <div className="profile-edit-field-group">
                        <h3 className="profile-edit-section-title">تصویر پروفایل</h3>
                        
                        <div className="profile-edit-image-upload-container">
                          <div className="profile-edit-image-main-container">
                            <div className="profile-edit-image-preview-area">
                              {formData.profileImage ? (
                                <div className="profile-edit-image-preview-wrapper">
                                  <img 
                                    src={formData.profileImage} 
                                    alt="پروفایل" 
                                    className="profile-edit-image-preview-large"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/default-avatar.jpg';
                                    }}
                                  />
                                  <div className="profile-edit-image-actions">
                                    <button
                                      type="button"
                                      className="profile-edit-image-action-btn profile-edit-image-crop-btn"
                                      onClick={() => {
                                        if (formData.profileImage) {
                                          const cleanUrl = formData.profileImage.split("?")[0];
                                          setImageToCrop(`${cleanUrl}?t=${Date.now()}`);
                                          setCropModalOpen(true);
                                        }
                                      }}
                                      disabled={isLoading}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="white" strokeWidth="2"/>
                                        <line x1="8" y1="3" x2="8" y2="21" stroke="white" strokeWidth="2"/>
                                        <line x1="16" y1="3" x2="16" y2="21" stroke="white" strokeWidth="2"/>
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      className="profile-edit-image-action-btn profile-edit-image-remove-btn"
                                      onClick={handleRemoveImage}
                                      disabled={isLoading}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="profile-edit-image-placeholder-large">
                                  <div className="profile-edit-placeholder-icon">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                      <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" 
                                        stroke="#1c7bd1" strokeWidth="2"/>
                                      <path d="M6 20C6 17.7909 7.79086 16 10 16H14C16.2091 16 18 17.7909 18 20V21H6V20Z" 
                                        stroke="#1c7bd1" strokeWidth="2"/>
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="profile-edit-image-upload-controls">
                              <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                                disabled={isLoading}
                              />
                              
                              <button
                                type="button"
                                className="profile-edit-image-upload-button"
                                onClick={handleTriggerFileInput}
                                disabled={isLoading}
                              >
                                <ProfileEditCameraIcon />
                                <span>انتخاب تصویر</span>
                              </button>
                              
                              <div className="profile-edit-image-info">
                                <p className="profile-edit-image-description">
                                  فرمت‌های مجاز: JPG, PNG, GIF
                                  <br />
                                  حداکثر حجم: 5 مگابایت
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="profile-edit-form-section">
                    <div className="profile-edit-fields-vertical">
                      <div className="profile-edit-field-group">
                        <h3 className="profile-edit-section-title">اطلاعات شخصی</h3>
                        
                        <div className="profile-edit-form-grid">
                          <div className="profile-edit-field-group">
                            <label className="profile-edit-form-label">
                              نام کاربری
                            </label>
                            <div className="profile-edit-input-container">
                              <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className="profile-edit-form-input"
                                placeholder="نام کاربری خود را وارد کنید"
                                required
                                disabled={isLoading}
                              />
                            </div>
                            <p className="profile-edit-form-hint">
                              حداقل ۳ کاراکتر و حداکثر ۲۰ کاراکتر
                            </p>
                          </div>

                          <div className="profile-edit-field-group">
                            <label className="profile-edit-form-label">
                              ایمیل
                            </label>
                            <div className="profile-edit-input-container">
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="profile-edit-form-input"
                                placeholder="ایمیل خود را وارد کنید"
                                required
                                disabled={isLoading}
                              />
                            </div>
                            <p className="profile-edit-form-hint">
                              ایمیل معتبر با قالب example@domain.com
                            </p>
                          </div>

                          <div className="profile-edit-field-group">
                            <label className="profile-edit-form-label">
                              نام
                            </label>
                            <div className="profile-edit-input-container">
                              <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="profile-edit-form-input"
                                placeholder="نام خود را وارد کنید"
                                required
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <div className="profile-edit-field-group">
                            <label className="profile-edit-form-label">
                              نام خانوادگی
                            </label>
                            <div className="profile-edit-input-container">
                              <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="profile-edit-form-input"
                                placeholder="نام خانوادگی خود را وارد کنید"
                                required
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="profile-edit-form-section">
                    <div className="profile-edit-fields-vertical">
                      <div className="profile-edit-field-group">
                        <div className="profile-edit-security-header">
                          <div className="profile-edit-section-icon">
                            <ProfileEditLockIcon />
                          </div>
                          <div className="profile-edit-section-title-content">
                            <h3>تغییر رمز عبور</h3>
                            <p>برای تغییر رمز عبور روی دکمه زیر کلیک کنید</p>
                          </div>
                          <label className="profile-edit-toggle-switch">
                            <input
                              type="checkbox"
                              checked={showPasswordFields}
                              onChange={togglePasswordFields}
                              disabled={isLoading}
                            />
                            <span className="profile-edit-toggle-slider"></span>
                          </label>
                        </div>
                        
                        {showPasswordFields && (
                          <div className="profile-edit-password-fields">
                            <div className="profile-edit-form-grid">
                              <div className="profile-edit-field-group">
                                <label className="profile-edit-form-label">رمز عبور فعلی</label>
                                <div className="profile-edit-input-container">
                                  <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    className="profile-edit-form-input"
                                    placeholder="رمز عبور فعلی را وارد کنید"
                                    disabled={isLoading}
                                  />
                                </div>
                              </div>
                              
                              <div className="profile-edit-field-group">
                                <label className="profile-edit-form-label">رمز عبور جدید</label>
                                <div className="profile-edit-input-container">
                                  <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    className="profile-edit-form-input"
                                    placeholder="رمز عبور جدید را وارد کنید"
                                    disabled={isLoading}
                                  />
                                </div>
                                <p className="profile-edit-form-hint">حداقل ۶ کاراکتر</p>
                              </div>
                              
                              <div className="profile-edit-field-group">
                                <label className="profile-edit-form-label">تأیید رمز عبور جدید</label>
                                <div className="profile-edit-input-container">
                                  <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="profile-edit-form-input"
                                    placeholder="رمز عبور جدید را مجدداً وارد کنید"
                                    disabled={isLoading}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="profile-edit-form-actions">
                    <button 
                      type="button" 
                      className="profile-edit-button profile-edit-cancel-button"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      انصراف
                    </button>
                    <button
                        type="submit"
                        className={`profile-edit-button profile-edit-submit-button`}
                        disabled={isLoading}
                        >
                        {isLoading ? (
                            <span className="profile-edit-btn-content">
                            <span className="profile-edit-loading-spinner"></span>
                            در حال ذخیره...
                            </span>
                        ) : (
                            <span className="profile-edit-btn-content">
                            ذخیره تغییرات
                            </span>
                        )}
                        </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {cropModalOpen && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onClose={() => setCropModalOpen(false)}
          aspect={1/1}
          cropSize={{ width: 360, height: 360 }}
          maskShape="circle"
        />
      )}
      
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default ProfileEdit;
