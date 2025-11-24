import { useState } from "react";
import "../styles/Notification.css";

const Notification = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    age: "",
    gender: "",
    location: "",
    lostTime: "",
    specialSigns: "",
    description: "",
    status: "گم شده",
    image: null,
    imagePreview: "",
    breed: "",
    animalType: "",
    diseases: "",
    hasCertificate: false,
    isVaccinated: false,
    isSterilized: false
  });

  const [selectedAdType, setSelectedAdType] = useState("lost");

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
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: ""
    }));
  };

  return (
    <div className="notification-page">
      <div className="notification-container" dir="rtl">

        <h2 className="notification-title">ثبت آگهی جدید</h2>
        <p className="notification-subtitle">اطلاعات را وارد کنید</p>

        <form>
            <div className="form-section">
            <h3 className="form-section-title">نوع آگهی</h3>
            <div className="ad-type-grid">
                <div 
                className={`ad-type-card ad-type-card-lost ${selectedAdType === "lost" ? "ad-type-card-active" : ""}`}
                onClick={() => handleAdTypeSelect("lost")}
                >
                <div className="ad-type-card-content">
                    <img 
                    className="ad-type-icon ad-type-icon-lost" 
                    src="/src/icons/search.svg"
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
                    src="/src/icons/Checkmark Color.svg"
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
                    src="/src/icons/Vector.svg"
                    alt="سرپرستی"
                    />
                    <span className={`ad-type-label ad-type-label-adoption ${selectedAdType === "adoption" ? "ad-type-label-active" : ""}`}>
                    سرپرستی
                    </span>
                </div>
                </div>
            </div>
            </div>

            <div className="form-section form-section-image">
            <h3 className="form-section-title">تصویر حیوان</h3>
            {formData.imagePreview ? (
                <div className="image-preview-container">
                <img 
                    src={formData.imagePreview} 
                    alt="Preview" 
                    className="image-preview" 
                />
                <div className="image-preview-overlay">
                    <span className="image-name">
                    {formData.image ? formData.image.name : "تصویر فعلی"}
                    </span>
                    <button 
                    type="button"
                    className="remove-image-btn"
                    onClick={handleRemoveImage}
                    >
                    حذف تصویر
                    </button>
                </div>
                </div>
            ) : (
                <label className="image-upload-container">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                />
                <img 
                src="/src/icons/direct-inbox.svg"
                    alt="Upload" 
                    className="image-upload-icon"
                />
                <span className="image-upload-text">برای آپلود عکس کلیک کنید</span>
                <span className="image-upload-subtext">فرمت: JPG, PNG (حداکثر 5MB)</span>
                </label>
            )}
            </div>

            <div className="form-section form-section-main-info">
              <div className="form-grid">

                <div className="form-field">
                <label className="form-label">نام حیوان</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="نام حیوان"
                    required
                />
                </div>

                <div className="form-field">
                <label className="form-label">عنوان آگهی</label>
                <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="عنوان خودکار ایجاد میشود"
                    required
                />
                </div>

                <div className="form-field">
                <label className="form-label">نژاد</label>
                <input
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="مثال: پرشین، ژرمن شپرد، پارسی"
                />
                </div>

                <div className="form-field">
                <label className="form-label">نوع حیوان</label>
                <input
                    type="text"
                    name="animalType"
                    value={formData.animalType}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="مثال: سگ، گربه، پرنده"
                />
                </div>

                <div className="form-field">
                <label className="form-label">سن</label>
                <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="مثال: 2 سال، 6 ماه"
                />
                </div>

                <div className="form-field">
                <label className="form-label">جنسیت</label>
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

            <div className="form-vertical-fields">
                <div className="form-field">
                <label className="form-label">موقعیت مکانی</label>
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
                    src="/src/icons/location.svg" 
                    alt="Location" 
                    className="form-input-icon"
                    />
                </div>
                </div>

                <div className="form-field">
                <label className="form-label">زمان گم شدن</label>
                <div className="input-container">
                    <input
                    type="text"
                    name="lostTime"
                    value={formData.lostTime}
                    onChange={handleInputChange}
                    className="form-input-with-icon"
                    placeholder="مثال: دیروز عصر، ۱۴۰۲/۰۸/۱۵، ۱۸:۳۰"
                    />
                    <img 
                    src="/src/icons/calendar.svg"
                    alt="Time" 
                    className="form-input-icon"
                    />
                </div>
                </div>

                <div className="form-field">
                <label className="form-label">علائم خاص</label>
                <input
                    type="text"
                    name="specialSigns"
                    value={formData.specialSigns}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="مثال: لکه سفید روی پیشانی، پای شکسته، قلاده قرمز"
                />
                </div>
            </div>

                <div className="form-field">
                <label className="form-label">بیماری‌ها (در صورت وجود)</label>
                <input
                    type="text"
                    name="diseases"
                    value={formData.diseases}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="بیماری‌های خاص را ذکر کنید یا خالی بگذارید"
                />
                </div>

            <div className="form-section health-status-section">
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

            <div className="form-section">
            <label className="form-label">توضیحات</label>
            <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="توضیحات کامل درباره حیوان، ویژگی‌های رفتاری، شرایط خاص سلامت، نحوه برخورد با حیوان و هر اطلاعات مفید دیگری که می‌تواند به پیدا کردن یا شناخت بهتر حیوان کمک کند."
                rows="4"
                required
            />
            </div>

            <div className="form-section">
            <h3 className="form-section-title"> </h3>
            <div className="contact-info-card">
                <div className="contact-info-header">
                <h4 className="contact-info-title">اطلاعات تماس</h4>
                <img 
                    src="/src/icons/stickynote.svg"
                    alt="Contact" 
                    className="contact-info-icon"
                />
                </div>
                <div className="form-grid">
                <div className="form-field">
                    <label className="form-label form-label-small">شماره موبایل</label>
                    <input
                    type="text"
                    className="form-input"
                    placeholder="09123456789"
                    />
                </div>
                <div className="form-field">
                    <label className="form-label form-label-small">ایمیل</label>
                    <input
                    type="text"
                    className="form-input"
                    placeholder="saranasher8@gmail.com"
                    />
                </div>
                </div>
                <p className="contact-info-note">
                در صورت خالی گذاشتن، اطلاعات پیش‌فرض حساب کاربری شما استفاده می‌شود.
                </p>
            </div>
            </div>

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
                ثبت آگهی
            </button>
            </div>
        </form>
      </div>
    </div>    
  );
};

export default Notification