import React, { useState, useEffect } from "react";
import "../../styles/UserProfile.css";
import { SuccessStoryCreation } from "../SuccessStoryCreation";
import { Pagination } from './../Pagination/Pagination';
import { useAuth } from "../../context/AuthContext";
import {
  getUserProfile,
  getUserLostPosts,
  getUserFoundPosts,
  getUserSurrenderPosts,
  deleteLostPost,
  deleteFoundPost,
  deleteSurrenderPost,
} from "../../Services/userService";
import { getUserSuccessStories } from "../../Services/successStoryService";
import { config } from "../../config";
import { SuccessStoryEdit } from "../SuccessStoryEdit/SuccessStoryEdit";

const toJalaliDate = (dateString) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",  
    day: "numeric",
  }).format(new Date(dateString));
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, petName }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <div className="delete-modal-header">
          <div className="delete-modal-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#F44336" strokeWidth="2"/>
              <path d="M15 9l-6 6m0-6l6 6" stroke="#F44336" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="delete-modal-title">حذف آگهی</h3>
          <p className="delete-modal-subtitle">آیا از حذف آگهی "{petName}" مطمئن هستید؟</p>
        </div>
        
        <div className="delete-modal-actions">
          <button 
            className="delete-modal-cancel-btn"
            onClick={onClose}
          >
            لغو
          </button>
          <button 
            className="delete-modal-confirm-btn"
            onClick={onConfirm}
          >
            بله، حذف شود
          </button>
        </div>
      </div>
    </div>
  );
};

const getPetType = (type) => {
  switch (type) {
    case "cat":
      return "گربه";
    case "dog":
      return "سگ";
    case "bird":
      return "پرنده";
    case "rabbit":
      return "خرگوش";
    case "hamster":
      return "همستر";
    case "other":
      return "سایر";
    default:
      return "نامشخص";
  }
};

export const UserProfile = ({ onEditClick, refreshKey }) => {
  const [allAds, setAllAds] = useState([]);
  const [userSuccessStories, setUserSuccessStories] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      window.location.href = "/login";
      return;
    }
  }, []);

  const BACKEND_URL = config.BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile();
        setUser(profile);

        const [lost, found, surrender, successStories] = await Promise.all([
          getUserLostPosts(),
          getUserFoundPosts(),
          getUserSurrenderPosts(),
          getUserSuccessStories(),
        ]);

        const mappedAds = [
          ...lost.map(p => ({
            id: p.id,
            globalId: `lost-${p.id}`,
            name: p.title,
            breed: p.breed || "",
            type: getPetType(p.pet_type),
            status: "lost",
            statusLabel: "گم شده",
            image: p.thumbnail ? `${BACKEND_URL}${p.thumbnail}` : "/src/assets/images/default-pet.png",
            time: toJalaliDate(p.lost_time),
            location: p.location?.readable || "",
            desc: p.description || "",
            postTime: toJalaliDate(p.updated_at),
            resolved: false,
          })),

          ...found.map(p => ({
            id: p.id,
            globalId: `found-${p.id}`,
            name: p.title,
            breed: p.breed || "",
            type: getPetType(p.pet_type),
            status: "found",
            statusLabel: "پیدا شده",
            image: p.thumbnail ? `${BACKEND_URL}${p.thumbnail}` : "/src/assets/images/default-pet.png",
            time: toJalaliDate(p.found_time),
            location: p.location?.readable || "",
            desc: p.description || "",
            postTime: toJalaliDate(p.updated_at),
            resolved: false,
          })),

          ...surrender.map(p => ({
            id: p.id,
            globalId: `adoption-${p.id}`,
            name: p.title,
            breed: p.breed || "",
            type: getPetType(p.pet_type),
            status: "adoption",
            statusLabel: "سرپرستی",
            image: p.thumbnail ? `${BACKEND_URL}${p.thumbnail}` : "/src/assets/images/default-pet.png",
            time: toJalaliDate(p.updated_at),
            location: p.location?.readable || "",
            desc: p.description || "",
            postTime: toJalaliDate(p.updated_at),
            resolved: false,
          })),
        ];

        setAllAds(mappedAds);

        const mappedStories = successStories.map(story => ({
          id: story.id,
          title: story.title,
          author: story.user_name,
          date: toJalaliDate(story.created_at),
          status: story.story_type === "lost" ? "بازگشت به خانه" : 
                  story.story_type === "found" ? "به خانواده بازگشت" : 
                  "فرزندخوانده شد",
          statusColor: "rgba(122, 238, 151, 0.15)",
          statusTextColor: "#0f7228",
          image: story.images && story.images.length > 0 
            ? story.images[0].image 
            : "/src/assets/images/default-pet.png",
          images: story.images ? story.images.map(img => img.image) : [],
          content: story.story,
        }));

        setUserSuccessStories(mappedStories);

      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  const [activeTab, setActiveTab] = useState("ads");
  const [activeFilter, setActiveFilter] = useState("همه");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccessStoryModal, setShowSuccessStoryModal] = useState(false);
  const [selectedPetForStory, setSelectedPetForStory] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const itemsPerPage = 6;

  const handleMarkAsResolved = (globalId) => {
    const pet = allAds.find(ad => ad.globalId === globalId);
    setSelectedPetForStory(pet);
    setShowSuccessStoryModal(true);
  };

  const handleSuccessStorySave = (newStory) => {
    setUserSuccessStories(prev => [newStory, ...prev]);
    setShowSuccessStoryModal(false);
    setSelectedPetForStory(null);
  };

  const handleDeleteClick = (ad) => {
    setPetToDelete(ad);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!petToDelete) return;

    try {
      if (petToDelete.status === "lost") {
        await deleteLostPost(petToDelete.id);
      } else if (petToDelete.status === "found") {
        await deleteFoundPost(petToDelete.id);
      } else if (petToDelete.status === "adoption") {
        await deleteSurrenderPost(petToDelete.id);
      }

      setAllAds(prev =>
        prev.filter(item => item.globalId !== petToDelete.globalId)
      );

      setCurrentPage(1);
      
    } catch (err) {
      console.error("Delete error:", err);
      alert("خطا در حذف آگهی");
    } finally {
      setDeleteModalOpen(false);
      setPetToDelete(null);
    }
  };

  const handleRemoveSuccessStory = (petId) => {
    if (window.confirm("آیا از حذف داستان موفقیت مطمئن هستید؟")) {
      setAllAds(prevAds => prevAds.map(ad => 
        ad.globalId === petId 
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
    height="18"
    alt="ایمیل"
    />
  );

  const Edit3Icon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#1c7bd1" strokeWidth="2"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#1c7bd1" strokeWidth="2"/>
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

  const PawIcon = () => (
    <img 
      src="src/assets/icons/pet.svg" 
      alt="پنجه حیوان"
      width="85"
      height="85"
      className="paw-icon"
    />
  );

  const truncateText = (text, maxLength = 110) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.slice(0, maxLength) + "..."
      : text;
  };

  const [editingStory, setEditingStory] = useState(null);
  const handleEditStory = (story) => {
    setEditingStory(story);
  };

  const handleStoryUpdate = (updatedStory) => {
    setUserSuccessStories(prev => 
      prev.map(story => 
        story.id === updatedStory.id ? updatedStory : story
      )
    );
    setEditingStory(null);
  };

  const handleStoryDelete = (storyId) => {
    setUserSuccessStories(prev => 
      prev.filter(story => story.id !== storyId)
    );
    setEditingStory(null);
  };

  const StoryEditIcon = () => (
    <div className="story-edit-icon-container">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#1c7bd1" strokeWidth="2"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#1c7bd1" strokeWidth="2"/>
      </svg>
    </div>
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
                  onClick={() => logout()}
                >
                  <LogOutIcon />
                  <span className="logout-text">خروج</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="main-tabs-section">
          <div className="main-tabs-container">
            <div className="main-tabs">
              <button
                className={`main-tab ${activeTab === 'ads' ? 'active' : ''}`}
                onClick={() => setActiveTab('ads')}
              >
                <div className="main-tab-content">
                  <div className="main-tab-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M7 21h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M10 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="main-tab-label">آگهی های من</span>
                  <div className="main-tab-count">
                    <span>{allAds.length}</span>
                  </div>
                </div>
              </button>
              
              <button
                className={`main-tab ${activeTab === 'stories' ? 'active' : ''}`}
                onClick={() => setActiveTab('stories')}
              >
                <div className="main-tab-content">
                  <div className="main-tab-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <span className="main-tab-label">داستان های موفق من</span>
                  <div className="main-tab-count">
                    <span>{userSuccessStories.length}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {activeTab === 'ads' ? (
          <section className="pet-listings-section">
            <div className="pet-listings-container">
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
                {currentAds.length > 0 ? (
                  currentAds.map((pet) => (
                    <div key={pet.globalId} className={`pet-listing-card ${pet.resolved ? 'resolved' : ''}`}>
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
                                onClick={() => handleMarkAsResolved(pet.globalId)}
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
                                onClick={() => handleDeleteClick(pet)}
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
                            <p className="pet-listing-subtitle">{pet.breed || "نامشخص"}</p>
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
                  ))
                ) : (
                  <div className="no-data-message">
                    <div className="no-data-icon">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#7ab3e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="no-data-title">آگهی‌ای یافت نشد</h3>
                    <p className="no-data-description">شما هنوز هیچ آگهی ثبت نکرده‌اید.</p>
                  </div>
                )}
              </div>
              
              {currentAds.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageClick}
                  onPrevious={handlePreviousPage}
                  onNext={handleNextPage}
                />
              )}
            </div>
          </section>
        ) : (
          <section className="user-success-stories-section">
            <div className="user-success-stories-container">
              <div className="user-stories-card">
                <div className="user-card-border"></div>
                <div className="user-stories-content">
                  <header className="user-stories-header">
                    <div className="user-title-container">
                      <div className="user-icon-circle">
                        <svg className="user-heart-icon" width="32" height="32" viewBox="0 0 24 24">
                          <path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                            2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 
                            4.5 2.09C13.09 3.81 14.76 3 
                            16.5 3 19.58 3 22 5.42 
                            22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                      <div className="user-title-text-content">
                        <h1 className="user-stories-title">
                          <span className="user-title-gradient">داستان های موفق من</span>
                        </h1>
                        <p className="user-stories-subtitle">
                          داستان‌های موفقیت‌آمیز شما در بازگرداندن حیوانات خانگی به خانه
                        </p>
                      </div>
                    </div>
                  </header>

                  {userSuccessStories.length > 0 ? (
                    <div className="user-stories-list">
                      {userSuccessStories.map((story, index) => (
                        <div
                          key={story.id}
                          className="user-story-card"
                        >
                          <div className="user-card-border-inner"></div>
                          <div className="user-story-number">0{index + 1}</div>
                            <button 
                              className="user-story-edit-btn"
                              onClick={() => handleEditStory(story)}
                              title="ویرایش داستان"
                            >
                              <StoryEditIcon />
                            </button>
                          <div className="user-story-content-wrapper">
                            <div className="user-story-image-section">
                              <div className="user-image-frame">
                                <div className="user-image-border">
                                  <img
                                    className="user-story-image"
                                    src={story.image}
                                    alt={story.title}
                                  />
                                </div>
                              </div>
                              <div className="user-image-decoration">
                                <div className="user-decoration-circle"></div>
                                <div className="user-decoration-circle"></div>
                                <div className="user-decoration-circle"></div>
                              </div>
                            </div>
                            <div className="user-story-text-section">
                              <div className="user-story-header">
                                <div className="user-story-meta">
                                  <div className="user-title-wrapper">
                                    <h3 className="user-story-title">{story.title}</h3>
                                    <div className="user-title-line"></div>
                                  </div>
                                  <div className="user-author-date">
                                    <span className="user-story-author">{story.author}</span>
                                    <span className="user-date-separator">•</span>
                                    <span className="user-story-date">{story.date}</span>
                                  </div>
                                </div>
                                <div className="user-status-section">
                                  <div
                                    className="user-status-badge"
                                    style={{
                                      backgroundColor: story.statusColor,
                                      color: story.statusTextColor,
                                    }}
                                  >
                                    <span className="user-status-text">{story.status}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="user-story-content-box">
                                <p className="user-story-content">
                                  {truncateText(story.content)}
                                </p>
                              </div>
                              <div className="user-story-footer">
                                <button className="user-read-more-btn">
                                  <span>خواندن ادامه داستان</span>
                                  <div className="user-btn-arrow">
                                    →
                                  </div>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-data-message">
                      <div className="no-data-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="#7ab3e0" strokeWidth="2"/>
                        </svg>
                      </div>
                      <h3 className="no-data-title">داستان موفقی یافت نشد</h3>
                      <p className="no-data-description">شما هنوز هیچ داستان موفقیت ثبت نکرده‌اید.</p>
                      <button className="no-data-action-btn" onClick={() => setActiveTab('ads')}>
                        مشاهده آگهی‌ها برای ثبت داستان موفقیت
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
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

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPetToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        petName={petToDelete?.name || ""}
      />

            <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPetToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        petName={petToDelete?.name || ""}
      />

      {editingStory && (
        <SuccessStoryEdit
          story={editingStory}
          onUpdate={handleStoryUpdate}
          onDelete={handleStoryDelete}
          onCancel={() => setEditingStory(null)}
        />
      )}
    </div>
  );
};
