import React, { useState, useEffect } from "react";
import "../../styles/UserProfile.css";
import { SuccessStoryCreation } from "../SuccessStoryCreation";
import { Pagination } from './../Pagination/Pagination';
import ProfileEdit from "../ProfileEdit/ProfileEdit";
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
import { getUserSuccessStories, deleteSuccessStory  } from "../../Services/successStoryService";
import { config } from "../../config";
import { SuccessStoryEdit } from "../SuccessStoryEdit/SuccessStoryEdit";
import { NotificationToast } from "../NotificationToast/NotificationToast";
import profileAvatar from "../../assets/images/profile_avatar.png";
import { getSuccessStoryDefaultImage } from "../../utils/postImages";


const PET_DEFAULT_IMAGES = {
  dog: "/src/assets/images/dog.png",
  cat: "/src/assets/images/cat.png",
  bird: "/src/assets/images/bird.png",
  rabbit: "/src/assets/images/rabbit.png",
  hamster: "/src/assets/images/hamester.png",
  other: "/src/assets/images/other.png",
};

const getPostImage = (post, BACKEND_URL) => {
  if (post.thumbnail) {
    return `${BACKEND_URL}${post.thumbnail}`;
  }

  const rawType =
    post?.pet_type?.value ||
    post?.pet_type ||
    post?.pet?.pet_type ||
    post?.pet?.type ||
    post?.type ||
    "";
  const petType = String(rawType).toLowerCase();
  return PET_DEFAULT_IMAGES[petType] || PET_DEFAULT_IMAGES.other;
};

const getRawPetType = (post) =>
  post?.pet_type?.value ||
  post?.pet_type ||
  post?.pet?.pet_type ||
  post?.pet?.type ||
  post?.type ||
  "";

const getStoryDefaultImage = (story) => getSuccessStoryDefaultImage(story);

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

const StoryReadEditButton = ({ story, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    return () => {
      setIsActive(false);
    };
  }, []);

  return (
    <div className="story-action-wrapper">
      <button
        className={`story-read-edit-btn ${isActive ? 'active' : ''}`}
        onClick={() => {
          setIsActive(true);
          onEdit(story);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setTimeout(() => setIsActive(false), 300);
        }}
      >
        <div className="btn-inner-content">
          <div className="btn-icon">
            {isHovered ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="currentColor"/>
              </svg>
            )}
          </div>
          <span className="btn-text">
            {isHovered ? 'ویرایش داستان' : 'خواندن/ویرایش داستان'}
          </span>
          <div className="btn-arrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        <div className="btn-status-indicator">
          <div className="read-indicator"></div>
          <div className="edit-indicator"></div>
        </div>
      </button>
    </div>
  );
};

const GlassDeleteButton = ({ onDelete }) => (
  <div className="glass-delete-container">
    <div className="glass-delete-wrapper">
      <button
        className="glass-delete-btn"
        onClick={onDelete}
        title="حذف آگهی"
      >
        <div className="delete-btn-content">
          <div className="delete-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </button>
    </div>
  </div>
);

export const UserProfile = ({ onEditClick, refreshKey }) => {
  const [allAds, setAllAds] = useState([]);
  const [userSuccessStories, setUserSuccessStories] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const [notification, setNotification] = useState(null);
  const [confirmToast, setConfirmToast] = useState(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [skeletonFading, setSkeletonFading] = useState(false);
  const TAB_SWITCH_SKELETON_MS = 500;
  const SKELETON_FADE_MS = 350;

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      window.location.href = "/login";
      return;
    }
  }, []);

  const BACKEND_URL = config.BACKEND_URL;

  const buildImageUrl = (path) => {
    if (!path) return "";
    if (typeof path === "object" && path !== null) {
      const nested =
        path.url ||
        path.image ||
        path.thumbnail ||
        path.file ||
        path.image_url;
      return buildImageUrl(nested);
    }

    const rawPath = String(path).trim();
    if (!rawPath || rawPath === "null" || rawPath === "undefined") return "";
    if (rawPath.startsWith("http")) return rawPath;
    const cleanPath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;
    return `${BACKEND_URL}/${cleanPath}`;
  };

  const profileImageSrc = buildImageUrl(user?.profileImage) || profileAvatar;

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
            pet_type: getRawPetType(p),
            type: getPetType(getRawPetType(p)),
            status: "lost",
            statusLabel: "گم شده",
            image: getPostImage(p, BACKEND_URL),
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
            pet_type: getRawPetType(p),
            type: getPetType(getRawPetType(p)),
            status: "found",
            statusLabel: "پیدا شده",
            image: getPostImage(p, BACKEND_URL),
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
            pet_type: getRawPetType(p),
            type: getPetType(getRawPetType(p)),
            status: "adoption",
            statusLabel: "سرپرستی",
            image: getPostImage(p, BACKEND_URL),
            time: toJalaliDate(p.updated_at),
            location: p.location?.readable || "",
            desc: p.description || "",
            postTime: toJalaliDate(p.updated_at),
            resolved: false,
          })),
        ];

        setAllAds(mappedAds);

        const mappedStories = successStories.map(story => {
          const defaultStoryImage = getStoryDefaultImage(story);
          const formattedImages = (story.images || [])
            .map((img, index) => {
              const url = buildImageUrl(img?.image || img?.url || img);
              if (!url) return null;
              return {
                id: img?.id ?? index,
                backendId: img?.id ?? null,
                url,
              };
            })
            .filter(Boolean);
          const imageUrls = formattedImages.map(img => img.url);
          const primaryImage = imageUrls[0] || buildImageUrl(story.image);

          return {
            id: story.id,
            title: story.title,
            author: story.user_name,
            date: toJalaliDate(story.created_at),
          status: story.story_type === "lost" ? "بازگشت به خانه" : 
                  story.story_type === "found" ? "به خانواده بازگشت" : 
                  "فرزندخوانده شد",
            statusColor: "rgba(122, 238, 151, 0.15)",
            statusTextColor: "#0f7228",
            image: primaryImage || defaultStoryImage,
            images: imageUrls.length > 0 ? imageUrls : [primaryImage || defaultStoryImage],
            fallbackImage: defaultStoryImage,
            backendImages: formattedImages,
            content: story.story,
          };
        });

        setUserSuccessStories(mappedStories);

      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  useEffect(() => {
    if (loading) {
      setShowSkeleton(true);
      setSkeletonFading(false);
      return;
    }

    setSkeletonFading(true);
    const fadeTimer = setTimeout(() => {
      setShowSkeleton(false);
      setSkeletonFading(false);
    }, SKELETON_FADE_MS);

    return () => clearTimeout(fadeTimer);
  }, [loading, SKELETON_FADE_MS]);

  const [activeTab, setActiveTab] = useState("ads");
  const [activeFilter, setActiveFilter] = useState("همه");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentStoryPage, setCurrentStoryPage] = useState(1);
  const [showSuccessStoryModal, setShowSuccessStoryModal] = useState(false);
  const [selectedPetForStory, setSelectedPetForStory] = useState(null);
  const [editingStory, setEditingStory] = useState(null);
  
  const itemsPerPage = 6;

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const openConfirmToast = ({
    message,
    onConfirm,
    onCancel,
    confirmText = "تایید",
    cancelText = "انصراف",
    confirmVariant = "danger",
    type = "warning"
  }) => {
    setConfirmToast({
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      confirmVariant,
      type
    });
  };

  const handleResolvePost = (globalId) => {
    const pet = allAds.find(ad => ad.globalId === globalId);
    
    if (pet?.hasSuccessStory) {
      showNotification("برای این آگهی قبلاً داستان موفق ثبت شده است.", "warning");
      return;
    }
    
    setSelectedPetForStory(pet);
    setShowSuccessStoryModal(true);
  };


  const handleSuccessStorySave = (newStory) => {
    setUserSuccessStories(prev => [newStory, ...prev]);

    if (selectedPetForStory) {
      setAllAds(prevAds => 
        prevAds.filter(ad => ad.globalId !== selectedPetForStory.globalId)
      );
    }
    
    setShowSuccessStoryModal(false);
    setSelectedPetForStory(null);
    setCurrentPage(1);
    
    showNotification("داستان موفق با موفقیت ثبت شد", "success");
  };

  const handleSuccessStorySkip = (petId) => {
    if (petId) {
      setAllAds(prevAds =>
        prevAds.filter(ad =>
          ad.globalId !== petId && String(ad.id) !== String(petId)
        )
      );
    } else if (selectedPetForStory) {
      setAllAds(prevAds =>
        prevAds.filter(ad => ad.globalId !== selectedPetForStory.globalId)
      );
    }

    setShowSuccessStoryModal(false);
    setSelectedPetForStory(null);
    setCurrentPage(1);
    showNotification("آگهی با موفقیت حذف شد", "success");
  };
  const handleSuccessStoryCancel = () => {
    setShowSuccessStoryModal(false);
    setSelectedPetForStory(null);
  };

  const handleDeleteConfirm = async (ad) => {
    if (!ad) return;

    try {
      console.log(`Deleting ${ad.status} post with ID:`, ad.id);
      
      let response;
      if (ad.status === "lost") {
        response = await deleteLostPost(ad.id);
      } else if (ad.status === "found") {
        response = await deleteFoundPost(ad.id);
      } else if (ad.status === "adoption") {
        response = await deleteSurrenderPost(ad.id);
      }

      console.log("Delete response:", response);

      setAllAds(prev =>
        prev.filter(item => item.globalId !== ad.globalId)
      );

      setCurrentPage(1);
 
      showNotification("آگهی با موفقیت حذف شد", "success");
      
    } catch (err) {
      console.error("Delete error details:", err);
      showNotification("خطا در حذف آگهی. لطفاً دوباره تلاش کنید", "error");
    }
  };

  const handleDeleteClick = (ad) => {
    if (!ad) return;
    openConfirmToast({
      message: `آیا از حذف آگهی "${ad.name}" مطمئن هستید؟`,
      confirmText: "حذف",
      cancelText: "انصراف",
      confirmVariant: "danger",
      onConfirm: () => handleDeleteConfirm(ad)
    });
  };

  const handleRemoveSuccessStoryConfirm = (petId) => {
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
  };

  const handleRemoveSuccessStory = (petId) => {
    openConfirmToast({
      message: "آیا از حذف داستان موفقیت مطمئن هستید؟",
      confirmText: "حذف",
      cancelText: "انصراف",
      confirmVariant: "danger",
      onConfirm: () => handleRemoveSuccessStoryConfirm(petId)
    });
  };

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
    showNotification("داستان با موفقیت ویرایش شد", "success");
  };

  const handleStoryDeleteRequest = (story) => {
    if (!story) return;
    openConfirmToast({
      message: "آیا از حذف داستان موفقیت مطمئن هستید؟",
      confirmText: "حذف",
      cancelText: "انصراف",
      confirmVariant: "danger",
      onConfirm: () => handleStoryDelete(story.id)
    });
  };

  const handleStoryDelete = async (storyId) => {

    try {
      await deleteSuccessStory(storyId);
      const deletedStory = userSuccessStories.find(story => story.id === storyId);
      if (deletedStory) {
        setUserSuccessStories(prev =>
          prev.filter(story => story.id !== storyId)
        );
      }

      setEditingStory(null);
      showNotification("داستان موفق با موفقیت حذف شد", "success");

    } catch (err) {
      console.error("Delete story error:", err);
      showNotification("خطا در حذف داستان موفق", "error");
    }
  };

  const handleProfileSave = async (updatedData) => {
    try {
      console.log('Updated profile data:', updatedData);
      setUser(prev => ({
        ...prev,
        username: updatedData.username,
        email: updatedData.email,
      }));
      
      showNotification("پروفایل با موفقیت به‌روزرسانی شد", "success");
      
    } catch (error) {
      console.error('Error saving profile:', error);
      showNotification("خطا در ذخیره تغییرات پروفایل", "error");
    }
  };

  const handleProfileClose = () => {
    setShowProfileEdit(false);
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

  const storyTotalPages = Math.ceil(userSuccessStories.length / itemsPerPage);
  const storyStartIndex = (currentStoryPage - 1) * itemsPerPage;
  const storyEndIndex = storyStartIndex + itemsPerPage;
  const currentStories = userSuccessStories.slice(storyStartIndex, storyEndIndex);

  const adsRemaining = filteredAds.length - (currentPage - 1) * itemsPerPage;
  const skeletonAdsCount =
    currentAds.length ||
    Math.min(itemsPerPage, Math.max(0, adsRemaining)) ||
    itemsPerPage;

  const storiesRemaining = userSuccessStories.length - (currentStoryPage - 1) * itemsPerPage;
  const skeletonStoriesCount =
    currentStories.length ||
    Math.min(itemsPerPage, Math.max(0, storiesRemaining)) ||
    itemsPerPage;

  useEffect(() => {
    if (loading) return;

    setShowSkeleton(true);
    setSkeletonFading(false);

    let fadeTimer;
    const holdTimer = setTimeout(() => {
      setSkeletonFading(true);
      fadeTimer = setTimeout(() => {
        setShowSkeleton(false);
        setSkeletonFading(false);
      }, SKELETON_FADE_MS);
    }, TAB_SWITCH_SKELETON_MS);

    return () => {
      clearTimeout(holdTimer);
      if (fadeTimer) {
        clearTimeout(fadeTimer);
      }
    };
  }, [activeTab, loading, TAB_SWITCH_SKELETON_MS, SKELETON_FADE_MS]);

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

  const handleStoryPreviousPage = () => {
    if (currentStoryPage > 1) {
      setCurrentStoryPage(currentStoryPage - 1);
    }
  };

  const handleStoryNextPage = () => {
    if (currentStoryPage < storyTotalPages) {
      setCurrentStoryPage(currentStoryPage + 1);
    }
  };

  const handleStoryPageClick = (pageNumber) => {
    setCurrentStoryPage(pageNumber);
  };

  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return;
    setShowSkeleton(true);
    setSkeletonFading(false);
    setActiveTab(tab);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
    setCurrentStoryPage(1);
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
      <div className="edit-icon-wrapper">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path 
            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" 
            stroke="#1c7bd1" 
            strokeWidth="2"
          />
          <path 
            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" 
            stroke="#1c7bd1" 
            strokeWidth="2"
          />
        </svg>
        <div className="edit-icon-glow"></div>
      </div>
    </div>
  );

  const DeleteIcon = ({ onClick }) => (
    <div 
      className="action-icon-container"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
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
      className="paw-icon-profile"
    />
  );

  const TickIcon = () => (
    <div className="tick-icon-container">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
  
  const truncateText = (text, maxLength = 110) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.slice(0, maxLength) + "..."
      : text;
  };

  return (
  <div className="user-profile-page">
    <main>
      <div className="profile-panels-wrapper">
        <div className="profile-panels-border"></div>
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

                  {confirmToast && (
                    <NotificationToast
                      message={confirmToast.message}
                      type={confirmToast.type || "warning"}
                      onClose={() => setConfirmToast(null)}
                      position="top-right"
                      duration={0}
                      actions={[
                        {
                          label: confirmToast.cancelText || "انصراف",
                          variant: "ghost",
                          onClick: confirmToast.onCancel
                        },
                        {
                          label: confirmToast.confirmText || "تایید",
                          variant: confirmToast.confirmVariant || "danger",
                          onClick: confirmToast.onConfirm
                        }
                      ]}
                    />
                  )}

                  {notification && (
                    <NotificationToast
                      message={notification.message}
                      type={notification.type}
                      onClose={() => setNotification(null)}
                      position="top-right"
                    />
                  )}

              <div className="avatar-container">
                <div className="avatar-border" />
                <img 
                  className="avatar-image" 
                  alt={user?.username || "Profile avatar"}
                  src={profileImageSrc}
                />
                <button 
                  className="edit-profile-button"
                  onClick={() => setShowProfileEdit(true)}
                >
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

      {activeTab === 'ads' ? (
        <section className="pet-listings-section">
          <div className="pet-listings-container-enhanced"> 
            <div className="user-stories-card"> 
              <div className="user-card-border"></div>
              <div className="user-stories-content">
                <header className="user-stories-header">
                  <div className="user-title-container">
                    <div className="user-icon-circle">
                      <img 
                        src="src/assets/icons/Advertisements.svg" 
                        alt="آیکن آگهی"
                        width="32"
                        height="32"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    </div>
                    <div className="user-title-text-content">
                      <h1 className="user-stories-title">
                        <span className="user-title-gradient">آگهی های من</span>
                      </h1>
                      <p className="user-stories-subtitle">
                        مدیریت و مشاهده تمام آگهی‌های ثبت‌شده توسط شما
                      </p>
                    </div>

                    <div className="oval-switch-container">
                      <div className="oval-switch">
                        <div className="switch-liquid-effect"></div>
                        <div className="light-beam"></div>

                        <div className="particle-effect">
                          {[...Array(8)].map((_, i) => (
                            <div 
                              key={i}
                              className="particle"
                              style={{
                                '--tx': `${Math.random() * 40 - 20}px`,
                                '--ty': `${Math.random() * 40 - 20}px`,
                                '--tx2': `${Math.random() * 60 - 30}px`,
                                '--ty2': `${Math.random() * 60 - 30}px`,
                                '--tx3': `${Math.random() * 80 - 40}px`,
                                '--ty3': `${Math.random() * 80 - 40}px`,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${i * 0.5}s`
                              }}
                            />
                          ))}
                        </div>
                        
                        <button 
                          className={`switch-option ${activeTab === 'ads' ? 'active' : ''}`}
                          onClick={() => handleTabSwitch('ads')}
                          style={{ order: 2 }}
                        >
                          <div className="option-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                              <path d="M7 21h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              <path d="M10 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <span className="option-label">آگهی‌ها</span>
                          <span className="option-count">{allAds.length}</span>
                        </button>
                        
                        <button 
                          className={`switch-option ${activeTab === 'stories' ? 'active' : ''}`}
                          onClick={() => handleTabSwitch('stories')}
                          style={{ order: 1 }}
                        >
                          <div className="option-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                fill="none"
                              />
                            </svg>
                          </div>
                          <span className="option-label">داستان‌ها</span>
                          <span className="option-count">{userSuccessStories.length}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </header>

                <div className="original-pet-listings">
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

                  <div
                    className={`pet-listings-grid ${showSkeleton ? "show-skeleton" : ""} ${
                      skeletonFading ? "skeleton-fade-out" : ""
                    }`}
                  >
                    {showSkeleton && (
                      <>
                        {Array.from({ length: skeletonAdsCount }).map((_, index) => (
                          <div className="pet-listing-card pet-skeleton-card" key={`skeleton-${index}`}>
                            <div className="pet-listing-image-container pet-skeleton-block pet-skeleton-image"></div>

                            <div className="pet-listing-content">
                              <div className="pet-listing-header">
                                <div className="pet-listing-info">
                                  <div className="pet-skeleton-block pet-skeleton-title"></div>
                                  <div className="pet-skeleton-block pet-skeleton-subtitle"></div>
                                </div>
                                <div className="pet-skeleton-block pet-skeleton-pill"></div>
                              </div>

                              <div className="pet-skeleton-block pet-skeleton-desc"></div>
                              <div className="pet-skeleton-block pet-skeleton-desc short"></div>

                              <div className="pet-details-container">
                                <div className="pet-listing-detail">
                                  <div className="detail-icon pet-skeleton-block pet-skeleton-icon"></div>
                                  <div className="pet-skeleton-block pet-skeleton-detail"></div>
                                </div>

                                <div className="pet-listing-detail">
                                  <div className="detail-icon pet-skeleton-block pet-skeleton-icon"></div>
                                  <div className="pet-skeleton-block pet-skeleton-detail"></div>
                                </div>
                              </div>

                              <div className="pet-listing-time pet-skeleton-time-wrap">
                                <div className="time-icon pet-skeleton-block pet-skeleton-time-icon"></div>
                                <div className="pet-skeleton-block pet-skeleton-time-text"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {!showSkeleton && currentAds.length > 0 ? (
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
                              <div className="status-pulse-user"></div>
                            </div>
                            
                            <div className="action-buttons-container">
                              <div className="glass-card">
                                <div className="action-buttons-wrapper">
                                  <button 
                                    className="action-button tick-button"
                                    onClick={() => handleResolvePost (pet.globalId)}
                                    title="حل کردن آگهی (ثبت داستان موفق یا حذف آگهی)"
                                    disabled={pet.hasSuccessStory} 
                                  >
                                    <TickIcon />
                                  </button>
                                  
                                  <button 
                                    className="action-button edit-button"
                                    onClick={() => onEditClick(pet)}
                                    title="ویرایش آگهی"
                                  >
                                    <EditIcon />
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
                    ) : !showSkeleton ? (
                      <div className="no-data-message">
                        <div className="no-data-icon">
                          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#7ab3e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <h3 className="no-data-title">آگهی‌ای یافت نشد</h3>
                        <p className="no-data-description">شما هنوز هیچ آگهی ثبت نکرده‌اید.</p>
                      </div>
                    ) : null}
                  </div>
                  
                  {!showSkeleton && currentAds.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageClick}
                      onPrevious={handlePreviousPage}
                      onNext={handleNextPage}
                    />
                  )}
                </div>
              </div>
            </div>
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

                    <div className="oval-switch-container">
                      <div className="oval-switch">
                        <button 
                          className={`switch-option ${activeTab === 'ads' ? 'active' : ''}`}
                          onClick={() => handleTabSwitch('ads')}
                        >
                          <div className="option-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                              <path d="M7 21h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              <path d="M10 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <span className="option-label">آگهی‌ها</span>
                          <span className="option-count">{allAds.length}</span>
                        </button>
                        
                        <button 
                          className={`switch-option ${activeTab === 'stories' ? 'active' : ''}`}
                          onClick={() => handleTabSwitch('stories')}
                        >
                          <div className="option-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <span className="option-label">داستان‌ها</span>
                          <span className="option-count">{userSuccessStories.length}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </header>

                {!showSkeleton && userSuccessStories.length === 0 ? (
                  <div className="no-data-message">
                    <div className="no-data-icon">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="#7ab3e0" strokeWidth="2"/>
                      </svg>
                    </div>
                    <h3 className="no-data-title">داستان موفقی یافت نشد</h3>
                    <p className="no-data-description">شما هنوز هیچ داستان موفقیت ثبت نکرده‌اید.</p>
                    <button className="no-data-action-btn" onClick={() => handleTabSwitch('ads')}>
                      مشاهده آگهی‌ها برای ثبت داستان موفقیت
                    </button>
                  </div>
                ) : (
                  <>
                  <div
                    className={`user-stories-list ${showSkeleton ? "show-skeleton" : ""} ${
                      skeletonFading ? "skeleton-fade-out" : ""
                    }`}
                  >
                    {showSkeleton && (
                      <>
                        {Array.from({ length: skeletonStoriesCount }).map((_, index) => (
                          <div key={`skeleton-${index}`} className="user-story-card user-story-skeleton">
                            <div className="user-card-border-inner"></div>
                            <div className="user-story-number user-skeleton-block"></div>

                            <div className="user-story-content-wrapper">
                              <div className="user-story-image-section">
                                <div className="user-image-frame user-skeleton-block"></div>
                                <div className="user-image-decoration">
                                  <div className="user-decoration-circle user-skeleton-block"></div>
                                  <div className="user-decoration-circle user-skeleton-block"></div>
                                  <div className="user-decoration-circle user-skeleton-block"></div>
                                </div>
                              </div>
                              <div className="user-story-text-section">
                                <div className="user-story-header">
                                  <div className="user-story-meta">
                                    <div className="user-skeleton-block user-skeleton-title"></div>
                                    <div className="user-skeleton-block user-skeleton-subtitle"></div>
                                  </div>
                                  <div className="user-skeleton-block user-skeleton-badge"></div>
                                </div>
                                <div className="user-story-content-box user-skeleton-block"></div>
                                <div className="user-story-footer">
                                  <div className="user-skeleton-block user-skeleton-btn"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {!showSkeleton && currentStories.map((story, index) => {
                      const fallbackImage =
                        story.fallbackImage || getStoryDefaultImage(story);

                      return (
                      <div
                        key={story.id}
                        className="user-story-card"
                      >
                        <GlassDeleteButton
                          onDelete={() => handleStoryDeleteRequest(story)}
                        />

                        <div className="user-card-border-inner"></div>
                        <div className="user-story-number">0{index + 1}</div>
                        
                        <div className="user-story-content-wrapper">
                          <div className="user-story-image-section">
                            <div className="user-image-frame">
                              <div className="user-image-border">
                                <img
                                  className="user-story-image"
                                  src={story.image || fallbackImage}
                                  alt={story.title}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = fallbackImage;
                                  }}
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
                              <StoryReadEditButton
                                story={story}
                                onEdit={handleEditStory}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                  {!showSkeleton && currentStories.length > 0 && (
                    <Pagination
                      currentPage={currentStoryPage}
                      totalPages={storyTotalPages}
                      onPageChange={handleStoryPageClick}
                      onPrevious={handleStoryPreviousPage}
                      onNext={handleStoryNextPage}
                    />
                  )}
                </>            
                )}
              </div>
            </div>
          </div>
        </section>
      )}
      </div>
    </main>

    {showSuccessStoryModal && (
      <SuccessStoryCreation
        pet={selectedPetForStory}
        onSave={handleSuccessStorySave}
        onCancel={handleSuccessStoryCancel}
        onSkip={handleSuccessStorySkip}/>
    )}

    {editingStory && (
      <SuccessStoryEdit
        story={editingStory}
        onUpdate={handleStoryUpdate}
        onDelete={handleStoryDelete}
        onCancel={() => setEditingStory(null)}
      />
    )}

    {showProfileEdit && (
      <ProfileEdit
        userData={{
          username: user?.username || "",
          email: user?.email || "",
          profileImage: user?.profileImage || null,
          bio: user?.bio || "",
        }}
        onSave={handleProfileSave}
        onClose={handleProfileClose}
      />
    )}
  </div>
);
};


