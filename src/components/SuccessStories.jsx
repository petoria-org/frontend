import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SuccessStories.css";
import { getSuccessStories } from "../Services/successStoryService";
import { config } from "../config";
import { SuccessStoryDetail } from "./SuccessStoryDetail/SuccessStoryDetail";

const SuccessStoriesModern = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const BACKEND_URL = config.BACKEND_URL;

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
          backgroundColor: "rgba(122, 238, 151, 0.95)",
          color: "#0f7228",
          borderColor: "rgba(255, 255, 255, 0.9)"
        };
      case 'found':
        return {
          backgroundColor: "rgba(159, 199, 235, 0.95)",
          color: "#0a5ca6",
          borderColor: "rgba(255, 255, 255, 0.9)"
        };
      case 'surrender':
        return {
          backgroundColor: "rgba(122, 179, 224, 0.95)",
          color: "#1c7bd1",
          borderColor: "rgba(255, 255, 255, 0.9)"
        };
      default:
        return {
          backgroundColor: "rgba(122, 238, 151, 0.95)",
          color: "#0f7228",
          borderColor: "rgba(255, 255, 255, 0.9)"
        };
    }
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.slice(0, maxLength) + "..."
      : text;
  };

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      
      const startTime = Date.now();
      
      try {
        const data = await getSuccessStories();
        
        const mapped = data.slice(0, 3).map((story) => ({
          id: story.id,
          title: story.title,
          author: story.user_name,
          date: toJalaliDate(story.created_at),
          status: storyTypeMap[story.story_type] || "موفقیت",
          statusColor: getStatusColor(story.story_type).backgroundColor,
          statusTextColor: getStatusColor(story.story_type).color,
          statusBorderColor: getStatusColor(story.story_type).borderColor,
          image: story.image
            ? `${BACKEND_URL}${story.image}`
            : "/src/assets/images/default-pet.png",
          images: story.image
            ? [`${BACKEND_URL}${story.image}`]
            : [],
          content: story.story,
          story_type: story.story_type,
        }));

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

  if (loading) {
    return (
      <div className="success-stories-modern">
        <div className="stories-container-modern">
          <div className="loading-overlay-modern">
            <div className="spinner-modern">
              <div className="spinner-circle-modern"></div>
            </div>
            <p>در حال بارگذاری داستان‌های موفق...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="success-stories-modern">
        <div className="stories-container-modern">
          <div className="error-modern">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-btn-modern"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="success-stories-modern">
      <div className="floating-particles-modern">
        <div className="floating-particle"></div>
        <div className="floating-particle"></div>
        <div className="floating-particle"></div>
      </div>

      <div className="stories-container-modern">
        <div className="stories-header-modern">
          <div className="stories-title-wrapper-modern">
            <h1 className="stories-title-modern">
              داستان‌های موفقیت
              <span className="title-accent-modern"> پتوریا</span>
            </h1>
          </div>
          <p className="stories-subtitle-modern">
            روایت‌هایی از عشق و بازگشت، هر داستان پر از امید و لبخند
          </p>
        </div>

        <div className="stories-grid-modern">
          {stories.map((story, index) => (
            <div 
              key={story.id} 
              className={`story-card-modern ${isVisible ? "slide-in" : ""}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="story-image-wrapper-modern">
                <div 
                  className="story-status-badge-modern"
                  style={{
                    backgroundColor: story.statusColor,
                    color: story.statusTextColor,
                    borderColor: story.statusBorderColor
                  }}
                >
                  <div className="status-pulse-landing"></div>
                  <span className="status-text-badge-modern">{story.status}</span>
                </div>
                
                <img
                  src={story.image}
                  alt={story.title}
                  className="story-image-modern"
                  loading="lazy"
                />
                <div className="image-overlay-modern"></div>
              </div>

              <div className="story-content-modern">
                <div className="story-header-modern">
                  <div className="story-meta-modern">
                    <div className="title-wrapper-modern">
                      <h3 className="story-title-modern">{story.title}</h3>
                      <div className="title-line-modern"></div>
                    </div>
                    
                    <div className="author-date-modern">
                      <span className="date-separator-modern">•</span>
                      <span className="story-author-modern">{story.author}</span>
                    </div>
                  </div>
                  
                  <div className="story-number-modern">0{index + 1}</div>
                </div>

                <div className="story-content-box-modern">
                  <div className="story-description-container-modern">
                    <p className="story-description-text-modern">
                      {truncateText(story.content)}
                    </p>
                  </div>
                </div>

                <div className="story-footer-modern">
                  <span className="story-date-modern">
                    <svg 
                      className="date-icon-modern" 
                      viewBox="0 0 24 24" 
                      fill="none"
                    >
                      <path 
                        d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M16 2V6" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M8 2V6" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M3 10H21" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                    {story.date}
                  </span>
                  
                  <button
                    className="story-view-btn-modern"
                    onClick={() => handleViewStory(story)}
                  >
                    <span>مشاهده داستان</span>
                    <svg 
                      className="story-arrow-modern" 
                      viewBox="0 0 24 24" 
                      fill="none"
                    >
                      <path 
                        d="M15 18L9 12L15 6" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="view-more-section-modern">
          <button
            className="view-more-btn-modern"
            onClick={handleViewAllStories}
          >
            <span>مشاهده همه داستان‌ها</span>
            <svg 
              className="view-more-arrow-modern" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path 
                d="M15 18L9 12L15 6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
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