import React, { useState } from "react";
import HeartIcon from "../../assets/icons/heart.svg";
import LocationIcon from "../../assets/icons/location.svg";
import GenderIcon from "../../assets/icons/tick-circle.svg";
import AgeIcon from "../../assets/icons/clock.svg";
import PetIcon from "../../assets/icons/pet.svg";
import BackIcon from "../../assets/icons/arrow-left.svg";
import ContactInfoIcon from "../../assets/icons/stickynote.svg";
import PetImage from "../../assets/images/shivvava.png";
import "../../styles/ShowDetailsAdopt.css";

const petDetails = [
  {
    label: "نوع حیوان",
    value: "سگ",
    icon: PetIcon,
  },
  {
    label: "نژاد",
    value: "شیواوا",
    icon: HeartIcon,
  },
  {
    label: "سن",
    value: "2 سال",
    icon: AgeIcon,
  },
  {
    label: "جنسیت",
    value: "نر",
    icon: GenderIcon,
  },
];

const healthToggles = [
  { label: "دارای شناسنامه", checked: false },
  { label: "واکسینه شده", checked: false },
  { label: "عقیم شده", checked: true },
];

const SimpleSwitch = ({ defaultChecked, onChange }) => {
  const [checked, setChecked] = useState(defaultChecked);

  const handleToggle = () => {
    const newChecked = !checked;
    setChecked(newChecked);
    if (onChange) {
      onChange(newChecked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`health-toggle ${checked ? 'checked' : ''}`}
      onClick={handleToggle}
    >
      <span className="switch-thumb" />
    </button>
  );
};

export const ShowDetailsAdopt = () => {
  const [toggles, setToggles] = useState(healthToggles);
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: ""
  });

  const handleToggleChange = (index, newChecked) => {
    const newToggles = [...toggles];
    newToggles[index].checked = newChecked;
    setToggles(newToggles);
  };

  const handleInputChange = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBackClick = () => {
    console.log("بازگشت به لیست آگهی ها");
  };

  const handleStartChat = () => {
    console.log("شروع گفتگو", contactInfo);
  };

  return (
    <div className="show-details-container">
      <div className="back-button-container">
        <button 
          onClick={handleBackClick}
          className="back-button"
        >
          <span className="back-text">بازگشت به لیست آگهی ها</span>
          <img src={BackIcon} alt="بازگشت" className="back-icon" />
        </button>
      </div>

      <div className="main-card">
        <div className="card-content-wrapper">
            <div className="card-image-container">
              <img
                className="card-image"
                alt="Pet"
                src={PetImage}
              />
              <div className="card-badge">
                <span className="badge-text">سرپرستی</span>
            </div>

            <div className="content-section">
              <h1 className="pet-name">
                مکس
              </h1>

              <div className="details-grid">
                {petDetails.map((detail, index) => (
                  <div 
                    key={index} 
                    className="detail-item"
                  >
                    <div className="detail-text">
                      <div className="detail-value">
                        {detail.value}
                      </div>
                      <div className="detail-label">
                        {detail.label}
                      </div>
                    </div>
                    <img
                      src={detail.icon}
                      alt={detail.label}
                      className="detail-icon"
                    />
                  </div>
                ))}
              </div>

              <div className="location-item">
                <div className="detail-text">
                  <div className="detail-value">
                    تهران . تهرانپارس
                  </div>
                  <div className="detail-label">
                    مکان
                  </div>
                </div>
                <img src={LocationIcon} alt="مکان" className="detail-icon" />
              </div>

              <section className="section">
                <h2 className="section-title">
                  بیماری ها
                </h2>
                <div className="diseases-content">
                  این حیوان هیچ بیماری خاصی ندارد.
                </div>
              </section>

              <section className="section">
                <div className="toggles-container">
                  {toggles.map((toggle, index) => (
                    <div 
                      key={index} 
                      className="toggle-item"
                    >
                      <SimpleSwitch
                        defaultChecked={toggle.checked}
                        onChange={(checked) => handleToggleChange(index, checked)}
                      />
                      <span className="toggle-label">
                        {toggle.label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="section">
                <h2 className="section-title">
                  توضیحات
                </h2>
                <div className="description-content">
                  مکس یک سگ شیواوای دوست داشتنی و بازیگوش است. او بسیار با کودکان 
                  مهربان است و آموزش‌های پایه را دیده است. این سگ به دنبال یک خانه 
                  دائمی و پر از محبت می‌گردد.
                </div>
              </section>

              <section className="contact-section">
                <div className="contact-container">
                  <div className="contact-header">
                    <img src={ContactInfoIcon} alt="اطلاعات تماس" className="contact-icon" />
                    <h2 className="contact-title">
                      اطلاعات تماس
                    </h2>
                  </div>

                  <div className="contact-fields">
                    <div className="contact-field">
                      <label className="field-label">
                        ثبت کننده آگهی
                      </label>
                      <input
                        type="text"
                        placeholder="نام و نام خانوادگی"
                        value={contactInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="contact-input"
                      />
                    </div>
                    <div className="contact-field">
                      <label className="field-label">
                        شماره تلفن
                      </label>
                      <input
                        type="tel"
                        placeholder="شماره تماس"
                        value={contactInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="contact-input"
                      />
                    </div>
                  </div>

                  <p className="contact-note">
                    در صورت خالی گذاشتن، اطلاعات پیشفرض حساب کاربری شما استفاده می‌شود
                  </p>
                </div>
              </section>

              <button 
                onClick={handleStartChat}
                className="start-chat-button"
              >
                شروع گفتگو
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};