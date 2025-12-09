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
      image: "src/assets/images/max.svg",
      status: "lost",
      statusLabel: "گم شده",
    },
    {
      id: 2,
      name: "ابیگل",
      desc: "گربه پرشین سفید با چشمان سبز",
      location: "تهران، خیابان ولیعصر",
      time: "۱۴۰۴/۰۸/۱۸",
      postTime: "یک هفته پیش",
      type: "گربه",
      image: "src/assets/images/abigail.png",
      status: "found",
      statusLabel: "پیدا شده",
    },
    {
      id: 3,
      name: "جوکر",
      desc: "گربه پرشین ماده خاکستری با با چشمان طلایی",
      location: "تهران، سعادت‌آباد",
      time: "۱۴۰۴/۰۸/۰۴",
      postTime: "پنج روز پیش",
      type: "گربه",
      image: "src/assets/images/joker.svg",
      status: "lost",
      statusLabel: "گم شده",
    },
    {
      id: 4,
      name: "لونا",
      desc: "سگ ماده قهوه‌ای رنگ 3 ماهه بازیگوش",
      location: "تهران، شهرک غرب",
      time: "۱۴۰۴/۰۵/۱۸",
      postTime: "دو هفته پیش",
      type: "سگ",
      image: "src/assets/images/luna.svg",
      status: "adoption",
      statusLabel: "سرپرستی",
    },
    {
      id: 5,
      name: "میلو",
      desc: "گربه پرشین عسلی با چشمان مشکی",
      location: "تهران، نیاوران",
      time: "۱۴۰۴/۰۸/۱۰",
      postTime: "دو روز پیش",
      type: "گربه",
      image: "src/assets/images/milu.png",
      status: "found",
      statusLabel: "پیدا شده",
    },
    {
      id: 6,
      name: "باکس",
      desc: "سگ نژاد گلدن نر 2 ساله",
      location: "تهران، اقدسیه",
      time: "۱۴۰۴/۰۸/۱۲",
      postTime: "چهار روز پیش",
      type: "سگ",
      image: "src/assets/images/box.png",
      status: "lost",
      statusLabel: "گم شده",
    },
    {
      id: 7,
      name: "چارلی",
      desc: "سگ نژاد گلدن رتریور 4 ماهه",
      location: "تهران، فرمانیه",
      time: "۱۴۰۴/۰۵/۲۰",
      postTime: "سه هفته پیش",
      type: "سگ",
      image: "src/assets/images/luna.svg",
      status: "adoption",
      statusLabel: "سرپرستی",
    },
    {
      id: 8,
      name: "لئو",
      desc: "گربه پرشین نر قهوه ای با چشمان سبز",
      location: "تهران، زعفرانیه",
      time: "۱۴۰۴/۰۸/۰۶",
      postTime: "شش روز پیش",
      type: "گربه",
      image: "src/assets/images/joker.svg",
      status: "lost",
      statusLabel: "گم شده",
    },
    {
      id: 9,
      name: "رکس",
      desc: "سگ نژاد دوبرمن نر 1 ساله",
      location: "تهران، پاسداران",
      time: "۱۴۰۴/۰۷/۲۰",
      postTime: "ده روز پیش",
      type: "سگ",
      image: "src/assets/images/max.svg",
      status: "found",
      statusLabel: "پیدا شده",
    },
    {
      id: 10,
      name: "سیمرغ",
      desc: "گربه پرشین نقرهای با چشمان آبی",
      location: "تهران، شیخ بهایی",
      time: "۱۴۰۴/۰۸/۰۱",
      postTime: "هفت روز پیش",
      type: "گربه",
      image: "src/assets/images/abigail.png",
      status: "lost",
      statusLabel: "گم شده",
    },
    {
      id: 11,
      name: "بادی",
      desc: "سگ نژاد هاسکی ماده 2 ساله",
      location: "تهران، ونک",
      time: "۱۴۰۴/۰۷/۱۵",
      postTime: "دو هفته پیش",
      type: "سگ",
      image: "src/assets/images/luna.svg",
      status: "adoption",
      statusLabel: "سرپرستی",
    },
    {
      id: 12,
      name: "میشا",
      desc: "گربه پرشین سفید 3 ساله",
      location: "تهران، میرداماد",
      time: "۱۴۰۴/۰۸/۰۵",
      postTime: "چهار روز پیش",
      type: "گربه",
      image: "src/assets/images/joker.svg",
      status: "found",
      statusLabel: "پیدا شده",
    },
  ]);

  const [activeFilter, setActiveFilter] = useState("همه");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleDeleteAd = (adId) => {
    if (window.confirm("آیا از حذف این آگهی مطمئن هستید؟")) {
      setAllAds(prevAds => prevAds.filter(ad => ad.id !== adId));
      if (filteredAds.length <= itemsPerPage && currentPage > 1) {
        setCurrentPage(1);
      }
    }
  };

  const filters = [
    { label: "همه", count: allAds.length },
    {
      label: "پیدا شده",
      count: allAds.filter((a) => a.status === "found").length,
    },
    {
      label: "گم شده",
      count: allAds.filter((a) => a.status === "lost").length,
    },
    {
      label: "سرپرستی",
      count: allAds.filter((a) => a.status === "adoption").length,
    },
  ];

  const filteredAds =
    activeFilter === "همه"
      ? allAds
      : activeFilter === "پیدا شده" ? allAds.filter((ad) => ad.status === "found") :
        activeFilter === "گم شده" ? allAds.filter((ad) => ad.status === "lost") :
        allAds.filter((ad) => ad.status === "adoption");

  const totalPages = Math.ceil(filteredAds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAds = filteredAds.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const LocationIcon = () => (
    <img src="src/assets/icons/location.svg" alt="مکان" className="pet-listing-detail-icon" />
  );

  const CalendarIcon = () => (
    <img src="src/assets/icons/calendar-2.svg" alt="تاریخ" className="pet-listing-detail-icon" />
  );

  const ClockIcon = () => (
    <img src="src/assets/icons/clock.svg" alt="زمان" className="pet-listing-time-icon" />
  );

  const LogOutIcon = () => (
    <img src="src/assets/icons/logout.svg" alt="خروج" className="logout-icon" />
  );

  const EmailIcon = () => (
    <img src="src/assets/icons/email.svg" alt="ایمیل" className="email-icon" />
  );

  const Edit3Icon = () => (
    <img src="src/assets/icons/edit.svg" alt="ویرایش پروفایل" className="edit-profile-icon" />
  );

  const ChevronRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  );

  const ChevronLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  );

  return (
    <div className="user-profile-page">
      <main>
        <section className="profile-section">
          <div className="profile-card">
            <div className="profile-card-header"></div>
            <div className="profile-card-content">
              <div className="profile-content-wrapper">
                {/* بخش اطلاعات کاربر */}
                <div className="profile-info">
                  <h2 className="profile-username">sara_nasher</h2>
                  <div className="profile-email-container">
                    <div className="email-icon-wrapper">
                      <EmailIcon />
                    </div>
                    <span className="profile-email">saranasher8@gmail.com</span>
                  </div>
                </div>

                {/* بخش عکس پروفایل */}
                <div className="avatar-container">
                  <div className="avatar-border" />
                  <img 
                    className="avatar-image" 
                    alt="User"
                    src="src/assets/icons/avator.svg" 
                  />
                  <button className="edit-profile-button">
                    <Edit3Icon />
                  </button>
                </div>

                {/* بخش آیکون پنجه و دکمه خروج */}
                <div className="profile-pet-icon">
                  <img
                    src="src/assets/icons/pet.svg"
                    alt="Pet icon"
                  />
                </div>
                <button className="logout-button">
                  <LogOutIcon />
                  <span className="logout-text">خروج</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="pet-listings-section">
          <div className="pet-listings-container">
            <header className="pet-listings-header">
              <h1 className="pet-listings-title">آگهی های من</h1>
              <p className="pet-listings-subtitle">مدیریت و ویرایش آگهی ها</p>
            </header>

            <div className="pet-categories-tabs">
              <div className="pet-categories-list">
                {filters.map((filter) => (
                  <button
                    key={filter.label}
                    className={`pet-category-tab ${activeFilter === filter.label ? "active" : ""}`}
                    onClick={() => handleFilterChange(filter.label)}
                  >
                    <div className="pet-category-content">
                      <span className="pet-category-label">{filter.label}</span>
                      <div className="pet-category-count">
                        <span>{filter.count}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pet-listings-grid">
              {currentAds.map((pet) => (
                <div key={pet.id} className="pet-listing-card">
                  <div className="pet-listing-image-container">
                    <img
                      src={pet.image}
                      alt={pet.name}
                      className="pet-listing-image"
                    />
                    <div className={`pet-listing-status ${pet.status}`}>
                      {pet.statusLabel}
                    </div>
                    
                    <div className="action-buttons-container">
                      <div 
                        className="edit-action-btn"
                        onClick={() => onEditClick(pet)}
                      >
                        <img
                          className="action-icon"
                          alt="Edit"
                          src="src/assets/icons/edit.svg"
                        />
                      </div>
                      <div 
                        className="delete-action-btn"
                        onClick={() => handleDeleteAd(pet.id)}
                      >
                        <img
                          className="action-icon"
                          alt="Delete"
                          src="src/assets/icons/trash-2.svg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pet-listing-content">
                    <div className="pet-listing-header">
                      <div className="pet-listing-info">
                        <h3 className="pet-listing-name">{pet.name}</h3>
                        <p className="pet-listing-subtitle">{pet.name}</p>
                      </div>
                      <div className="pet-listing-type">
                        {pet.type}
                      </div>
                    </div>

                    <p className="pet-listing-description">{pet.desc}</p>

                    <div className="pet-listing-detail">
                      <LocationIcon />
                      <span className="pet-listing-detail-text">{pet.location}</span>
                    </div>

                    <div className="pet-listing-detail">
                      <CalendarIcon />
                      <span className="pet-listing-detail-text">{pet.time}</span>
                    </div>

                    <div className="pet-listing-time">
                      <ClockIcon />
                      <span className="pet-listing-time-text">{pet.postTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredAds.length > itemsPerPage && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronRightIcon />
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-page-button ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageClick(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-button"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronLeftIcon />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};