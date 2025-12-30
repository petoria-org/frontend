import React, { useState, useEffect } from "react";
import { SuccessStoryDetail } from "../SuccessStoryDetail/SuccessStoryDetail";
import "../../styles/SuccessStoriesAll.css";
import { getSuccessStories } from "../../Services/successStoryService";
import { config } from "../../config";

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

const SuccessStoriesAll = () => {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const BACKEND_URL = config.BACKEND_URL;

  const truncateText = (text, maxLength = 110) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.slice(0, maxLength) + "..."
      : text;
  };

  useEffect(() => {
    setIsVisible(true);

    const fetchStories = async () => {
      try {
        const data = await getSuccessStories();

        const mapped = data.map((story) => ({
          id: story.id,
          title: story.title,
          author: story.user_name,
          date: toJalaliDate(story.created_at),
          status: storyTypeMap[story.story_type],
          statusColor: "rgba(122, 238, 151, 0.15)",
          statusTextColor: "#0f7228",
          image: story.image
            ? `${BACKEND_URL}${story.image}`
            : "/src/assets/images/default-pet.png",
          images: story.image
            ? [`${BACKEND_URL}${story.image}`]
            : [],
          content: story.story,
        }));

        setStories(mapped);
      } catch (e) {
        console.error("SuccessStory error:", e);
      }
    };

    fetchStories();
  }, []);

  return (
    <div className="success-stories-container-all">
      <div className="blue-waves-all"></div>

      <main className="success-stories-main-all">
        <div className={`stories-card-all ${isVisible ? "visible" : ""}`}>
          <div className="card-border"></div>

          <div className="stories-content-all">
            <header className="stories-header-all">
              <div className="title-container-all">
                <div className="icon-circle-all">
                  <svg className="heart-icon-all" width="24" height="24" viewBox="0 0 24 24">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      fill="currentColor"
                    />
                  </svg>
                </div>

                <div className="title-text-content-all">
                  <h1 className="stories-title-all">
                    <span className="title-gradient-all">داستان‌های موفق</span>
                  </h1>
                </div>
              </div>
              
              <div className="header-decoration-all">
                <div className="decoration-line-main-all"></div>
                <div className="decoration-dots-container-all">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="decoration-dot-simple-all" style={{ animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
              </div>
            </header>

            <div className="stories-list-all">
              {stories.map((story, index) => (
                <div
                  key={story.id}
                  className={`story-card-all ${isVisible ? "slide-in" : ""}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                  onClick={() => setSelectedStory(story)}
                >
                  <div className="card-border-inner"></div>
                  <div className="story-number-all">0{index + 1}</div>

                  <div className="story-content-wrapper-all">
                    <div className="story-image-section-all">
                      <div className="image-frame-all">
                        <div className="image-border">
                          <img
                            className="story-image-all"
                            src={story.image}
                            alt={story.title}
                          />
                        </div>
                      </div>

                      <div className="image-decoration-all">
                        <div className="decoration-circle-all"></div>
                        <div className="decoration-circle-all"></div>
                        <div className="decoration-circle-all"></div>
                      </div>
                    </div>

                    <div className="story-text-section-all">
                      <div className="story-header-all">
                        <div className="story-meta-all">
                          <div className="title-wrapper-all">
                            <h3 className="story-title-all">{story.title}</h3>
                            <div className="title-line-all"></div>
                          </div>

                          <div className="author-date-all">
                            <span className="story-author-all">{story.author}</span>
                            <span className="date-separator-all">•</span>
                            <span className="story-date-all">{story.date}</span>
                          </div>
                        </div>

                        <div className="status-section-all">
                          <div
                            className="status-badge-all"
                            style={{
                              backgroundColor: story.statusColor,
                              color: story.statusTextColor,
                            }}
                          >
                            <span className="status-text-all">{story.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="story-content-box-all">
                        <p className="story-content">
                          {truncateText(story.content)}
                        </p>
                      </div>

                      <div className="story-footer-all">
                        <button className="read-more-btn-all">
                          <span>خواندن ادامه داستان</span>
                          <div className="btn-arrow-all">
                            →
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {selectedStory && (
        <SuccessStoryDetail
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
};

export default SuccessStoriesAll;