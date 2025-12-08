import React, { useState } from "react";
import "../../styles/UserProfile.css";

export const UserProfile = ({ onEditClick }) => {
  const [allAds, setAllAds] = useState([
    {
      id: 1,
      name: "ماکس",
      desc: "سگ نژاد ژرمن شپرد نر 3 ساله",
      location: "تهران، پارک ملت",
      time: "۱۴۰۲/۰۸/۱۵",
      postTime: "سه روز پیش",
      type: "سگ",
      image: "/src/assets/images/max.svg",
      status: "گم شده",
    },
    {
      id: 2,
      name: "ابیگل",
      desc: "گربه پرشین سفید با چشمان سبز",
      location: "تهران، خیابان ولیعصر",
      time: "۱۴۰۴/۰۸/۱۸",
      postTime: "یک هفته پیش",
      type: "گربه",
      image: "/src/assets/images/abigail.svg",
      status: "پیدا شده",
    },
    {
      id: 3,
      name: "جوکر",
      desc: "گربه پرشین ماده خاکستری با چشمان طلایی",
      location: "تهران، سعادت‌آباد",
      time: "۱۴۰۴/۰۸/۰۴",
      postTime: "پنج روز پیش",
      type: "گربه",
      image: "/src/assets/images/joker.svg",
      status: "گم شده",
    },
    {
      id: 4,
      name: "لونا",
      desc: "سگ ماده قهوه‌ای رنگ 3 ماهه بازیگوش",
      location: "تهران، شهرک غرب",
      time: "۱۴۰۴/۰۵/۱۸",
      postTime: "دو هفته پیش",
      type: "سگ",
      image: "/src/assets/images/luna.svg",
      status: "سرپرستی",
      
    },
  ]);

  const [activeFilter, setActiveFilter] = useState("همه");

  const handleDeleteAd = (adId) => {
    if (window.confirm("آیا از حذف این آگهی مطمئن هستید؟")) {
      setAllAds(prevAds => prevAds.filter(ad => ad.id !== adId));
    }
  };

  const filters = [
    { label: "همه", count: allAds.length },
    {
      label: "پیدا شده",
      count: allAds.filter((a) => a.status === "پیدا شده").length,
    },
    {
      label: "گم شده",
      count: allAds.filter((a) => a.status === "گم شده").length,
    },
    {
      label: "سرپرستی",
      count: allAds.filter((a) => a.status === "سرپرستی").length,
    },
  ];

  const filteredAds =
    activeFilter === "همه"
      ? allAds
      : allAds.filter((ad) => ad.status === activeFilter);

  const renderAd = (ad, className = "ad-card-user-profile") => (
    <div key={ad.id} className={className}>
      <div className="ad-content-user-profile">
        <div className="ad-background" />
        <div className="pet-name-user-profile">{ad.name}</div>
        <div className="pet-breed">{ad.name}</div>

        <div className="pet-type-badge">
          <div className="badge-background" />
          <div className="type-text">{ad.type}</div>
        </div>

        <p className="pet-description-user-profile">{ad.desc}</p>

        <div className="location-text">{ad.location}</div>
        <div className="time-text">{ad.time}</div>

        <img
          className="location-icon-user-profile"
          alt="Location"
          src="/src/assets/icons/location.svg"
        />

        <img
          className="calendar-icon-user-profile"
          alt="Calendar"
          src="/src/assets/icons/calendar-2.svg"
        />

        <div className="post-time-card">
          <div className="post-time-card-inner">
            <img 
              className="post-time-clock-icon"
              alt="Clock"
              src="/src/assets/icons/clock.svg"
            />
            <span className="post-time-text">{ad.postTime}</span>
          </div>
        </div>
      </div>

      <div className="action-buttons-container">
        <div 
          className="edit-action-btn"
          onClick={() => onEditClick(ad)}
        >
          <img
            className="action-icon"
            alt="Edit"
            src="/src/assets/icons/edit.svg"
          />
        </div>
        <div 
          className="delete-action-btn"
          onClick={() => handleDeleteAd(ad.id)}
        >
          <img
            className="action-icon"
            alt="Delete"
            src="/src/assets/icons/trash-2.svg"
          />
        </div>
      </div>

      <img className="pet-image-user-profile" alt="Pet" src={ad.image} />

      <div className="status-badge-user-profile">
        <div className={`status-background-user-profile ${
          ad.status === "پیدا شده" ? "status-found-user-profile" : 
          ad.status === "سرپرستی" ? "status-adoption-user-profile" : "status-missing-user-profile"
        }`} />
        <div className={`status-text ${
          ad.status === "پیدا شده" ? "status-found-text" : 
          ad.status === "سرپرستی" ? "status-adoption-text" : "status-missing-text"
        }`}>
          {ad.status}
        </div>
      </div>
    </div>
  );

  return (
    <div className="user-profile-container">
      <div className="ads-section">
        <div className="section-background" />
        <p className="section-subtitle">مدیریت و ویرایش آگهی ها</p>
        <div className="section-title-user-profile">آگهی های من</div>

        <div className="filter-tabs-user-profile">
          {filters.map((f) => (
            <div
              key={f.label}
              className={`filter-button-user-profile ${activeFilter === f.label ? "active" : ""}`}
              onClick={() => setActiveFilter(f.label)}
            >
              <div className="count-badge">{f.count}</div>
              <div className="filter-text">{f.label}</div>
            </div>
          ))}
        </div>

        {filteredAds.map((ad, index) => {
          let className = "ad-card-user-profile";
          if (index === 1) className = "ad-card-user-profile-2";
          if (index === 2) className = "ad-card-user-profile-3";
          if (index === 3) className = "ad-card-user-profile-4";
          
          return renderAd(ad, className);
        })}
      </div>

      <div className="profile-sidebar">
        <div className="sidebar-background" />
        <div className="sidebar-header" />
        <div className="username">sara_nasher</div>

        <div className="avatar-container">
          <div className="avatar-border" />
          <img 
            className="avatar-image" 
            alt="User"
            src="/src/assets/icons/avator.svg" 
          />
        </div>

        <div className="phone-contact-container">
          <div className="phone-contact-background" />
          <div className="phone-label">شماره موبایل</div>
          <div className="phone-number">09123456789</div>
          <div className="phone-icon-background" />
          <img
            className="call-icon"
            alt="Call"
            src="/src/assets/icons/call.svg"
          />
        </div>

        <div className="contact-info">
          <div className="contact-background" />
          <div className="contact-label">ایمیل</div>
          <div className="contact-value">saranasher8@gmail.com</div>
          <div className="contact-icon-bg" />
          <img
            className="email-icon"
            alt="Email"
            src="/src/assets/icons/email.svg"
          />
        </div>

        <div className="sidebar-menu-item">
          <div className="menu-background" />
          <div className="menu-icon-bg" />
          <div className="menu-text">تنظیمات</div>
          <img
            className="settings-icon"
            alt="Setting"
            src="/src/assets/icons/setting-2.svg"
          />
        </div>

        <div className="logout-menu-item">
          <div className="menu-background" />
          <div className="menu-icon-bg" />
          <img
            className="logout-icon"
            alt="Logout"
            src="/src/assets/icons/logout.svg"
          />
          <div className="logout-text">خروج از حساب</div>
        </div>
      </div>
    </div>
  );
};