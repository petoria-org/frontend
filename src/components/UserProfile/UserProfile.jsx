import React, { useState } from "react";
import "../../styles/UserProfile.css";
import { SuccessStoryCreation } from "../SuccessStoryCreation";

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
      resolved: false,
      successStory: "",
      images: []
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
      resolved: true,
      successStory: "ابیگل بعد از 3 روز جستجو در پارک محله پیدا شد!",
      images: ["src/assets/images/abigail.png"]
    },
    {
      id: 3,
      name: "جوکر",
      desc: "گربه پرشین ماده خاکستری با چشمان طلایی",
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
      resolved: true,
      successStory: "لونا توسط یک خانواده عالی در شهرک غرب به سرپرستی گرفته شد.",
      images: ["src/assets/images/luna.svg"]
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
  const [showSuccessStoryModal, setShowSuccessStoryModal] = useState(false);
  const [selectedPetForStory, setSelectedPetForStory] = useState(null);
  const itemsPerPage = 6;

  const handleMarkAsResolved = (petId) => {
    const pet = allAds.find(ad => ad.id === petId);
    setSelectedPetForStory(pet);
    setShowSuccessStoryModal(true);
  };

  const handleSuccessStorySave = (successData) => {
    setAllAds(prevAds => prevAds.map(ad => 
      ad.id === successData.petId 
        ? { 
            ...ad, 
            resolved: successData.action !== "remove",
            successStory: successData.storyText || "",
            images: successData.images || []
          }
        : ad
    ));
    
    setShowSuccessStoryModal(false);
    setSelectedPetForStory(null);
  };

  const handleDeleteAd = (adId) => {
    if (window.confirm("آیا از حذف این آگهی مطمئن هستید؟")) {
      setAllAds(prevAds => prevAds.filter(ad => ad.id !== adId));
      if (filteredAds.length <= itemsPerPage && currentPage > 1) {
        setCurrentPage(1);
      }
    }
  };

  const handleRemoveSuccessStory = (petId) => {
    if (window.confirm("آیا از حذف داستان موفقیت مطمئن هستید؟")) {
      setAllAds(prevAds => prevAds.map(ad => 
        ad.id === petId 
          ? { 
              ...ad, 
              resolved: false,
              successStory: "",
              images: []
            }
          : ad
      ));
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
    {
      label: "به سرانجام رسیده",
      count: allAds.filter((a) => a.resolved).length,
    },
  ];

  const filteredAds =
    activeFilter === "همه"
      ? allAds
      : activeFilter === "پیدا شده" ? allAds.filter((ad) => ad.status === "found") :
        activeFilter === "گم شده" ? allAds.filter((ad) => ad.status === "lost") :
        activeFilter === "سرپرستی" ? allAds.filter((ad) => ad.status === "adoption") :
        allAds.filter((ad) => ad.resolved);

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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2Z" fill="#666666"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>
  );

  const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="#666666"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth="2"/>
      <line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth="2"/>
      <line x1="3" y1="10" x2="21" y2="10" stroke="white" strokeWidth="2"/>
    </svg>
  );

  const ClockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#898989"/>
      <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const LogOutIcon = () => (
    <svg width="17" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );

  const EmailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="#666666"/>
      <polyline points="22,6 12,13 2,6" stroke="white" strokeWidth="2"/>
    </svg>
  );

  const Edit3Icon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#1c7bd1" strokeWidth="2"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#1c7bd1" strokeWidth="2"/>
    </svg>
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

  const CheckCircleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const EditIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#4CAF50" strokeWidth="2"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#4CAF50" strokeWidth="2"/>
    </svg>
  );

  const DeleteIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18" stroke="#F44336" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#F44336" strokeWidth="2"/>
    </svg>
  );

  const StoryIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="#03A9F4"/>
    </svg>
  );

  const StatusIcon = ({ type }) => {
    const icons = {
      found: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#0867BD"/>
          <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      lost: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#C3080B"/>
          <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      adoption: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.46 11.5 4 14l8 8 8-8c2.54-2.5 2.54-7.3.42-9.42z" fill="#0F7228"/>
        </svg>
      )
    };
    return icons[type] || null;
  };

  const ImageCountIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="currentColor"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="white"/>
      <path d="M21 15L16 10 5 21" stroke="white" strokeWidth="2"/>
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

                <div className="profile-info">
                  <h2 className="profile-username">sara_nasher</h2>
                  <div className="profile-email-container">
                    <div className="email-icon-wrapper">
                      <EmailIcon />
                    </div>
                    <span className="profile-email">saranasher8@gmail.com</span>
                  </div>
                </div>

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

                <div className="profile-pet-icon">
                  <svg width="85" height="85" viewBox="0 0 85 85" fill="none">
                    <path d="M42.5 20C45.2614 20 47.5 17.7614 47.5 15C47.5 12.2386 45.2614 10 42.5 10C39.7386 10 37.5 12.2386 37.5 15C37.5 17.7614 39.7386 20 42.5 20Z" fill="#7AB3E0"/>
                    <path d="M60 35C62.7614 35 65 32.7614 65 30C65 27.2386 62.7614 25 60 25C57.2386 25 55 27.2386 55 30C55 32.7614 57.2386 35 60 35Z" fill="#7AB3E0"/>
                    <path d="M25 35C27.7614 35 30 32.7614 30 30C30 27.2386 27.7614 25 25 25C22.2386 25 20 27.2386 20 30C20 32.7614 22.2386 35 25 35Z" fill="#7AB3E0"/>
                    <path d="M52.5 55C55.2614 55 57.5 52.7614 57.5 50C57.5 47.2386 55.2614 45 52.5 45C49.7386 45 47.5 47.2386 47.5 50C47.5 52.7614 49.7386 55 52.5 55Z" fill="#7AB3E0"/>
                    <path d="M32.5 55C35.2614 55 37.5 52.7614 37.5 50C37.5 47.2386 35.2614 45 32.5 45C29.7386 45 27.5 47.2386 27.5 50C27.5 52.7614 29.7386 55 32.5 55Z" fill="#7AB3E0"/>
                    <path d="M42.5 70C49.4036 70 55 64.4036 55 57.5C55 50.5964 49.4036 45 42.5 45C35.5964 45 30 50.5964 30 57.5C30 64.4036 35.5964 70 42.5 70Z" fill="#7AB3E0"/>
                  </svg>
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
                      <div className="status-icon-wrapper">
                        <StatusIcon type={pet.status} />
                      </div>
                      <span className="status-label">{pet.statusLabel}</span>
                      <div className="status-pulse"></div>
                    </div>
                    
                    <div className="action-buttons-container">
                      <div className="glass-card">
                        <div className="action-buttons-wrapper">
                          <button 
                            className="action-button story-button"
                            onClick={() => handleMarkAsResolved(pet.id)}
                            title={pet.resolved ? "مشاهده/ویرایش داستان موفقیت" : "ثبت داستان موفقیت"}
                          >
                            <StoryIcon />
                          </button>
                          
                          <button 
                            className="action-button edit-button"
                            onClick={() => onEditClick(pet)}
                            title="ویرایش آگهی"
                          >
                            <EditIcon />
                          </button>
                          
                          <button 
                            className="action-button delete-button"
                            onClick={() => handleDeleteAd(pet.id)}
                            title="حذف آگهی"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pet-listing-content">
                    {pet.resolved && (
                      <div className="simple-resolved-indicator">
                        <div className="resolved-icon">
                          <CheckCircleIcon />
                        </div>
                        <span className="resolved-text">به سرانجام رسیده</span>
                        <button 
                          className="remove-story-btn"
                          onClick={() => handleRemoveSuccessStory(pet.id)}
                          title="حذف داستان موفقیت"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="#721c24" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    )}

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
                      <div className="detail-icon">
                        <LocationIcon />
                      </div>
                      <span className="pet-listing-detail-text">{pet.location}</span>
                    </div>

                    <div className="pet-listing-detail">
                      <div className="detail-icon">
                        <CalendarIcon />
                      </div>
                      <span className="pet-listing-detail-text">{pet.time}</span>
                    </div>

                    <div className="pet-listing-time">
                      <div className="time-icon">
                        <ClockIcon />
                      </div>
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

      {showSuccessStoryModal && selectedPetForStory && (
        <SuccessStoryCreation
          petData={selectedPetForStory}
          onClose={() => {
            setShowSuccessStoryModal(false);
            setSelectedPetForStory(null);
          }}
          onSave={handleSuccessStorySave}
        />
      )}
    </div>
  );
};