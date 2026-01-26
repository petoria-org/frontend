import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { getUserSuccessStories, deleteSuccessStory, updateSuccessStory } from "../../Services/successStoryService";
import "../../styles/UserProfile.css";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import { StoryDetailView } from "./StoryDetailView";
import { EditStoryModal } from "./EditStoryModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { NotificationToast } from "../NotificationToast/NotificationToast";

const toJalaliDate = (dateString) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
};

const UserStoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [skeletonFading, setSkeletonFading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const LOADING_SCREEN_DELAY_MS = 1200;
  const MIN_LOADING_DURATION_MS = 1800;
  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const truncateText = (text, maxLength = 110) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.slice(0, maxLength) + "..."
      : text;
  };

  const storyTypeMap = {
    lost: "بازگشت به خانه",
    found: "به خانواده بازگشت",
    surrender: "فرزندخوانده شد",
  };

  const getStatusColor = (type) => {
    switch(type) {
      case "lost":
        return { bg: "rgba(122, 238, 151, 0.15)", text: "#0f7228" };
      case "found":
        return { bg: "rgba(159, 199, 235, 0.15)", text: "#1c7bd1" };
      case "surrender":
        return { bg: "rgba(255, 200, 100, 0.15)", text: "#f57c00" };
      default:
        return { bg: "rgba(122, 238, 151, 0.15)", text: "#0f7228" };
    }
  };

  const fetchStories = async () => {
    const startTime = Date.now();
    try {
      setLoading(true);
      const data = await getUserSuccessStories();
      
      const mapped = data.map((story) => {
        const statusColors = getStatusColor(story.story_type);
        const imageUrl = story.images && story.images.length > 0 
          ? story.images[0].image 
          : "/src/assets/images/default-pet.png";
          
        return {
          id: story.id,
          title: story.title,
          author: story.user_name,
          date: toJalaliDate(story.created_at),
          status: storyTypeMap[story.story_type] || story.story_type,
          statusColor: statusColors.bg,
          statusTextColor: statusColors.text,
          image: imageUrl,
          images: story.images || [],
          content: story.story,
          story_type: story.story_type,
          created_at: story.created_at,
        };
      });

      setStories(mapped);
    } catch (e) {
      console.error("SuccessStory error:", e);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOADING_DURATION_MS - elapsed);
      if (remaining) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    fetchStories();
  }, []);

  useEffect(() => {
    let introTimer;
    let fadeTimer;

    if (loading) {
      setShowLoadingScreen(true);
      setShowSkeleton(false);
      setSkeletonFading(false);
      introTimer = setTimeout(() => {
        setShowLoadingScreen(false);
        setShowSkeleton(true);
      }, LOADING_SCREEN_DELAY_MS);
    } else {
      setShowLoadingScreen(false);
      setSkeletonFading(true);
      fadeTimer = setTimeout(() => {
        setShowSkeleton(false);
        setSkeletonFading(false);
      }, 350);
    }

    return () => {
      if (introTimer) clearTimeout(introTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [loading]);

  const handleStoryClick = (story) => {
    setSelectedStory(story);
    setIsDetailViewOpen(true);
  };

  const handleEditStory = (story) => {
    setSelectedStory(story);
    setIsEditModalOpen(true);
  };

  const handleUpdateStory = async (updatedData) => {
    try {
      await updateSuccessStory(selectedStory.id, {
        title: updatedData.title,
        story: updatedData.content,
        story_type: updatedData.story_type
      });
      
      await fetchStories();
      setIsEditModalOpen(false);
      setIsDetailViewOpen(false);
      showNotification("داستان با موفقیت ویرایش شد", "success");
    } catch (error) {
      console.error("Error updating story:", error);
      showNotification("خطا در ویرایش داستان", "error");
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!storyId) return;
    
    try {
      await deleteSuccessStory(storyId);
      setStories(prev => prev.filter(story => story.id !== storyId));
      setIsDeleteModalOpen(false);
      setIsDetailViewOpen(false);
      showNotification("داستان با موفقیت حذف شد", "success");
    } catch (error) {
      console.error("Error deleting story:", error);
      showNotification("خطا در حذف داستان", "error");
    }
  };

  const confirmDeleteStory = (story) => {
    setStoryToDelete(story);
    setIsDeleteModalOpen(true);
  };

  const DeleteIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  return (
    <div className="user-stories-container-all">
      <main className={`user-stories-main-all ${isVisible ? "visible" : ""}`}>
          <div className="user-card-border"></div>

          <div className="user-stories-content-all">
            <header className="user-stories-header-all">
              <div className="user-title-container-all">
                <div className="user-icon-circle-all">
                  <svg className="user-heart-icon-all" width="32" height="32" viewBox="0 0 24 24">
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

                <div className="user-title-text-content-all">
                  <h1 className="user-stories-title-all">
                    <span className="user-title-gradient-all">داستان های من</span>
                  </h1>
                  <p className="user-stories-subtitle-all">
                    داستان های موفقیت و بازگشت حیوانات خانگی شما
                  </p>
                </div>
              </div>
            </header>

            {!loading && stories.length === 0 ? (
              <div className="user-empty-stories">
                <p>شما هنوز داستان موفقیتی ندارید.</p>
              </div>
            ) : (
              <div
                className={`user-stories-list-all ${showSkeleton ? "show-skeleton" : ""} ${
                  skeletonFading ? "skeleton-fade-out" : ""
                }`}
              >
                {showLoadingScreen && (
                  <div className="inline-loading-holder">
                    <LoadingScreen
                      title="در حال آماده‌سازی داستان‌ها"
                      subtitle="لطفاً چند لحظه صبر کنید..."
                    />
                  </div>
                )}
                {showSkeleton && (
                  <>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="user-story-card-all user-story-skeleton-all"
                      >
                        <div className="user-card-border-inner"></div>
                        <div className="user-story-number-all user-skeleton-block-all"></div>

                        <div className="user-story-content-wrapper-all">
                          <div className="user-story-image-section-all">
                            <div className="user-image-frame-all user-skeleton-block-all"></div>

                            <div className="user-image-decoration-all">
                              <div className="user-decoration-circle-all user-skeleton-block-all"></div>
                              <div className="user-decoration-circle-all user-skeleton-block-all"></div>
                              <div className="user-decoration-circle-all user-skeleton-block-all"></div>
                            </div>
                          </div>

                          <div className="user-story-text-section-all">
                            <div className="user-story-header-all">
                              <div className="user-story-meta-all">
                                <div className="user-skeleton-block-all user-skeleton-title-all"></div>
                                <div className="user-skeleton-block-all user-skeleton-subtitle-all"></div>
                              </div>

                              <div className="user-skeleton-block-all user-skeleton-badge-all"></div>
                            </div>

                            <div className="user-story-content-box-all user-skeleton-block-all"></div>

                            <div className="user-story-footer-all">
                              <div className="user-skeleton-block-all user-skeleton-btn-all"></div>
                              <div className="user-skeleton-block-all user-skeleton-btn-all"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {!loading &&
                  stories.map((story, index) => (
                    <div
                      key={story.id}
                      className={`user-story-card-all ${isVisible ? "user-slide-in" : ""}`}
                      style={{ animationDelay: `${index * 0.15}s` }}
                      onClick={() => handleStoryClick(story)}
                    >
                      <div className="user-card-border-inner"></div>
                      <div className="user-story-number-all">0{index + 1}</div>

                      <div className="user-story-content-wrapper-all">
                        <div className="user-story-image-section-all">
                          <div className="user-image-frame-all">
                            <div className="user-image-border">
                              <img
                                className="user-story-image-all"
                                src={story.image}
                                alt={story.title}
                              />
                            </div>
                          </div>

                          <div className="user-image-decoration-all">
                            <div className="user-decoration-circle-all"></div>
                            <div className="user-decoration-circle-all"></div>
                            <div className="user-decoration-circle-all"></div>
                          </div>
                        </div>

                        <div className="user-story-text-section-all">
                          <div className="user-story-header-all">
                            <div className="user-story-meta-all">
                              <div className="user-title-wrapper-all">
                                <h3 className="user-story-title-all">{story.title}</h3>
                                <div className="user-title-line-all"></div>
                              </div>

                              <div className="user-author-date-all">
                                <span className="user-story-author-all">{story.author}</span>
                                <span className="user-date-separator-all">•</span>
                                <span className="user-story-date-all">{story.date}</span>
                              </div>
                            </div>

                            <div className="user-status-section-all">
                              <div
                                className="user-status-badge-all"
                                style={{
                                  backgroundColor: story.statusColor,
                                  color: story.statusTextColor,
                                }}
                              >
                                <span className="user-status-text-all">{story.status}</span>
                              </div>
                            </div>
                          </div>

                          <div className="user-story-content-box-all">
                            <p className="user-story-content">
                              {truncateText(story.content)}
                            </p>
                          </div>

                          <div className="user-story-footer-all">
                            <button 
                              className="user-story-delete-btn-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDeleteStory(story);
                              }}
                            >
                              <DeleteIcon />
                              <span>حذف</span>
                            </button>
                            <button 
                              className="user-story-edit-btn-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditStory(story);
                              }}
                            >
                              <EditIcon />
                              <span>ویرایش</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

          </div>
      </main>

      <StoryDetailView
        story={selectedStory}
        isOpen={isDetailViewOpen}
        onClose={() => {
          setIsDetailViewOpen(false);
          setSelectedStory(null);
        }}
        onDelete={confirmDeleteStory}
        onEdit={handleEditStory}
      />

      <EditStoryModal
        story={selectedStory}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStory(null);
        }}
        onSave={handleUpdateStory}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setStoryToDelete(null);
        }}
        onConfirm={() => handleDeleteStory(storyToDelete?.id)}
        petName={storyToDelete?.title || "داستان"}
        title="حذف داستان"
        subtitle="آیا از حذف این داستان مطمئن هستید؟ این عمل قابل بازگشت نیست."
      />

      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          position="top-right"
        />
      )}
    </div>
  );
};

export default UserStoriesPage;

