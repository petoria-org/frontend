import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SuccessStories.css";
import { getSuccessStories } from "../Services/successStoryService";
import { config } from "../config";
import { SuccessStoryDetail } from "./SuccessStoryDetail/SuccessStoryDetail";
import { getSuccessStoryDefaultImage } from "../utils/postImages";

const SuccessStoriesModern = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const BACKEND_URL = config.BACKEND_URL;

  const buildImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${BACKEND_URL}${cleanPath}`;
  };

  const toJalaliDate = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const storyTypeMap = {
    lost: "بازگشت به خانه",
    found: "به خانواده بازگشت",
    surrender: "فرزندخوانده شد",
  };

  const getStatusColor = (storyType) => {
    switch(storyType) {
      case 'lost':
        return {
          statusClass: 'ls-lost-landing',
          backgroundColor: "rgba(234, 151, 153, 0.85)",
          color: "#fff",
          borderColor: "rgba(255, 255, 255, 0.9)"
        };
      case 'found':
        return {
          statusClass: 'ls-found-landing',
          backgroundColor: "rgba(159, 199, 235, 0.85)",
          color: "#fff",
          borderColor: "rgba(255, 255, 255, 0.9)"
        };
      case 'surrender':
        return {
          statusClass: 'ls-adoption-landing',
          backgroundColor: "rgba(122, 238, 151, 0.85)",
          color: "#fff",
          borderColor: "rgba(255, 255, 255, 0.9)"
        };
      default:
        return {
          statusClass: 'ls-active-landing',
          backgroundColor: "rgba(122, 179, 224, 0.85)",
          color: "#fff",
          borderColor: "rgba(255, 255, 255, 0.9)"
        };
    }
  };

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      
      const startTime = Date.now();
      
      
      try {
        const data = await getSuccessStories();

        const mapped = data.slice(0, 4).map((story) => {
          const statusColors = getStatusColor(story.story_type);
          const galleryImages = story.images && story.images.length > 0
            ? story.images
                .map(img => buildImageUrl(img.image || img.url || img))
                .filter(Boolean)
            : story.image
              ? [buildImageUrl(story.image)]
              : [];
          const mainImage =
            galleryImages[0] ||
            (story.image ? buildImageUrl(story.image) : "") ||
            getSuccessStoryDefaultImage(story);

          return {
            id: story.id,
            title: story.title,
            author: story.user_name,
            date: toJalaliDate(story.created_at),
            status: storyTypeMap[story.story_type] || "موفقیت",
            statusClass: statusColors.statusClass,
            statusColor: statusColors.backgroundColor,
            statusTextColor: statusColors.color,
            statusBorderColor: statusColors.borderColor,
            image: mainImage,
            images: galleryImages,
            content: story.story,
            story_type: story.story_type,
            category: "داستان موفق",
            description: story.story,
            location: story.location || "موقعیت نامشخص",
            time: toJalaliDate(story.created_at),
            postTime: toJalaliDate(story.created_at),
          };
        });

        setStories(mapped);
        setIsVisible(true);
      } catch (err) {
        console.error("خطا در دریافت داستان‌ها:", err);
        setError("خطا در دریافت داستان‌های موفق");
      } finally {
        const elapsedTime = Date.now() - startTime;
        const minLoadingTime = 1500;
        
        if (elapsedTime < minLoadingTime) {
          setTimeout(() => {
            setLoading(false);
          }, minLoadingTime - elapsedTime);
        } else {
          setLoading(false);
        }
      }
    };

    fetchStories();
  }, []);

  const handleViewStory = (story) => {
    setSelectedStory(story);
  };

  const handleCloseModal = () => {
    setSelectedStory(null);
  };

  const handleViewAllStories = () => {
    navigate("/success-stories");
  };

  const LocationIcon = () => (
    <img 
      src="/src/icons/location.svg" 
      alt="location"
      width="16" 
      height="16"
      className="ls-icon-img-landing"
    />
  );

  const CalendarIcon = () => (
    <img 
      src="/src/icons/calendar-2.svg" 
      alt="calendar"
      width="16" 
      height="16"
      className="ls-icon-img-landing"
    />
  );

  const ClockIcon = () => (
    <img 
      src="/src/icons/clock.svg" 
      alt="time"
      width="12" 
      height="12"
      className="ls-icon-img-landing"
    />
  );

  if (loading) {
    return (
        <div className="ls-success-stories-profile-style">
          <div className="ls-loading-overlay-profile">
            <div className="ls-spinner-profile">
              <div className="ls-spinner-circle-profile"></div>
            </div>
            <p>در حال بارگذاری داستان‌های موفق...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="ls-success-stories-profile-style">
        <div className="ls-error-profile">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="ls-retry-btn-profile"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ls-success-stories-profile-style">
      <div className="ls-success-stories-card">
        <div className="ls-success-stories-border"></div>
        <div className="ls-success-stories-content">
          <header className="ls-success-stories-header">
              <div className="ls-success-stories-title-container">
                <div className="ls-success-stories-title-text-content">
                <h1 className="ls-success-stories-title-gradient">
                  داستان‌های موفقیت پتوریا
                </h1>
                <p className="ls-success-stories-subtitle">
                  روایت‌هایی از عشق و بازگشت، هر داستان پر از امید و لبخند
                </p>
              </div>
            </div>
          </header>

          <div className="ls-success-stories-grid-profile">
            {stories.map((story, index) => (
              <div
                key={story.id}
                className="ls-success-story-card-profile"
              >
                <div className="ls-success-story-border-inner"></div>
                <div className="ls-success-story-number">0{index + 1}</div>
                
                <div className="ls-success-story-content-wrapper">
                  <div className="ls-success-story-image-section">
                    <div className="ls-success-story-image-frame">
                      <div className="ls-success-story-image-border">
                        <img
                          className="ls-success-story-image"
                          src={story.image}
                          alt={story.title}
                        />
                      </div>
                    </div>
                    <div className="ls-success-story-image-decoration">
                      <div className="ls-success-story-decoration-circle"></div>
                      <div className="ls-success-story-decoration-circle"></div>
                      <div className="ls-success-story-decoration-circle"></div>
                    </div>
                  </div>
                  <div className="ls-success-story-text-section">
                    <div className="ls-success-story-header">
                      <div className="ls-success-story-meta">
                        <div className="ls-success-story-title-wrapper">
                          <h3 className="ls-success-story-title-text">{story.title}</h3>
                          <div className="ls-success-story-title-line"></div>
                        </div>
                        <div className="ls-success-story-author-date">
                          <span className="ls-success-story-author">{story.author}</span>
                          <span className="ls-success-story-date-separator">•</span>
                          <span className="ls-success-story-date">{story.date}</span>
                        </div>
                      </div>
                      
                      
            
                    </div>
                    <div className="ls-success-story-content-box">
                      <p className="ls-success-story-content-text">
                        {story.content}
                      </p>
                    </div>
                    <div className="ls-success-story-footer">
                      <button
                        className="ls-success-story-read-more-btn"
                        onClick={() => handleViewStory(story)}
                      >
                        <span>مشاهده داستان</span>
                        <svg className="ls-success-story-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="ls-show-all-stories-container">
            <button
              className="ls-show-all-stories-btn"
              onClick={handleViewAllStories}
            >
              مشاهده همه داستان‌ها
              <svg className="ls-show-all-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {selectedStory && (
        <SuccessStoryDetail
          story={selectedStory}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SuccessStoriesModern;
