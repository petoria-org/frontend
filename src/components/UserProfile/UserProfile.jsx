import React, { useState, useEffect } from "react";
import "../../styles/UserProfile.css";
import { SuccessStoryCreation } from "../SuccessStoryCreation";
import { Pagination } from './../Pagination/Pagination';
import {
  getUserProfile,
  getUserLostPosts,
  getUserFoundPosts,
  getUserSurrenderPosts,
} from "../../Services/userService";

export const UserProfile = ({ onEditClick }) => {
  const [allAds, setAllAds] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      window.location.href = "/login";
      return;
    }
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const profile = await getUserProfile();
        setUser(profile);

        const [lost, found, surrender] = await Promise.all([
          getUserLostPosts(),
          getUserFoundPosts(),
          getUserSurrenderPosts(),
        ]);

        const mappedAds = [
          ...lost.map(p => ({
            id: p.id,
            name: p.title,
            type: p.pet_type === "cat" ? "گربه" : "سگ",
            status: "lost",
            statusLabel: "گم شده",
            image: p.thumbnail || "/src/assets/images/default-pet.png",
            time: new Date(p.lost_time).toLocaleDateString("fa-IR"),
            postTime: "—",
            resolved: false,
          })),
          ...found.map(p => ({
            id: p.id,
            name: p.title,
            type: p.pet_type === "cat" ? "گربه" : "سگ",
            status: "found",
            statusLabel: "پیدا شده",
            image: p.thumbnail || "/src/assets/images/default-pet.png",
            time: new Date(p.created_at).toLocaleDateString("fa-IR"),
            postTime: "—",
            resolved: false,
          })),
          ...surrender.map(p => ({
            id: p.id,
            name: p.title,
            type: p.pet_type === "cat" ? "گربه" : "سگ",
            status: "adoption",
            statusLabel: "سرپرستی",
            image: p.thumbnail || "/src/assets/images/default-pet.png",
            time: new Date(p.created_at).toLocaleDateString("fa-IR"),
            postTime: "—",
            resolved: false,
          })),
        ];

        setAllAds(mappedAds);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

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
    <img 
      src="src/assets/icons/location.svg" 
      alt="مکان"
      width="16" 
      height="16"
      className="icon-img"
    />
  );

  const CalendarIcon = () => (
    <img 
      src="src/assets/icons/calendar-2.svg" 
      alt="تاریخ"
      width="16" 
      height="16"
      className="icon-img"
    />
  );

  const ClockIcon = () => (
    <img 
      src="src/assets/icons/clock.svg" 
      alt="زمان"
      width="12" 
      height="12"
      className="icon-img"
    />
  );

  const LogOutIcon = () => (
    <svg width="17" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );

  const EmailIcon = () => (
    <img
    src="src/assets/icons/email.svg"
    width="18"
    hight="18"
    />
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
    <div className="action-icon-container">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#5CDC87" strokeWidth="2"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#5CDC87" strokeWidth="2"/>
      </svg>
    </div>
  );

  const DeleteIcon = () => (
    <div className="action-icon-container">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M3 6h18" stroke="#F44336" strokeWidth="2" strokeLinecap="round"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#F44336" strokeWidth="2"/>
      </svg>
    </div>
  );

  const StoryIcon = ({ hasSuccessStory }) => (
    <div className={`story-icon-container ${hasSuccessStory ? 'with-success-story' : ''}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="#8ED8FF"/>
      </svg>
    </div>
  );

  const ImageCountIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="currentColor"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="white"/>
      <path d="M21 15L16 10 5 21" stroke="white" strokeWidth="2"/>
    </svg>
  );

  const PawIcon = () => (
    <img 
      src="src/assets/icons/pet.svg" 
      alt="پنجه حیوان"
      width="85"
      height="85"
      className="paw-icon"
    />
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
                  <h2 className="profile-username">
                    {user?.username || ""}
                  </h2>

                  <div className="profile-email-container">
                    <div className="email-icon-wrapper">
                      <EmailIcon />
                    </div>

                    <span className="profile-email">
                      {user?.email || ""}
                    </span>
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
                  <PawIcon />
                </div>
                
                <button
                  className="logout-button"
                  onClick={() => {
                    localStorage.removeItem("access");
                    localStorage.removeItem("refresh");
                    window.location.href = "/login";
                  }}
                >
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
                <div key={pet.id} className={`pet-listing-card ${pet.resolved ? 'resolved' : ''}`}>
                  <div className="pet-listing-image-container">
                    <img
                      src={pet.image}
                      alt={pet.name}
                      className="pet-listing-image"
                    />
                    
                    <div className={`pet-listing-status ${pet.status}`}>
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
                            <StoryIcon hasSuccessStory={pet.resolved} />
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

                    <div className="pet-details-container">
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageClick}
              onPrevious={handlePreviousPage}
              onNext={handleNextPage}
            />
          </div>
        </section>
      </main>

      {showSuccessStoryModal && (
        <SuccessStoryCreation
          pet={selectedPetForStory}
          onSave={handleSuccessStorySave}
          onCancel={() => {
            setShowSuccessStoryModal(false);
            setSelectedPetForStory(null);
          }}
          onRemove={handleRemoveSuccessStory}
        />
      )}
    </div>
  );
};