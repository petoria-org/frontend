import React, { useState, useEffect } from "react";
import { SuccessStoryDetail } from "../SuccessStoryDetail/SuccessStoryDetail";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import "../../styles/SuccessStoriesAll.css";
import { getSuccessStories } from "../../Services/successStoryService";
import { config } from "../../config";
import { getSuccessStoryDefaultImage } from "../../utils/postImages";
import { Pagination } from "../Pagination/Pagination";

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
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const BACKEND_URL = config.BACKEND_URL;

  const buildImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${BACKEND_URL}${cleanPath}`;
  };

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      
      const startTime = Date.now();
      
      try {
        const data = await getSuccessStories();

        const mapped = data.map((story) => {
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
            status: storyTypeMap[story.story_type],
            statusColor: "rgba(122, 238, 151, 0.15)",
            statusTextColor: "#0f7228",
            image: mainImage,
            images: galleryImages,
            content: story.story,
          };
        });

        setStories(mapped);
        setCurrentPage(1);
        setIsVisible(true);
      } catch (e) {
        console.error("خطا در دریافت داستان‌های موفق:", e);
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

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(stories.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleStories = stories.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="success-stories-container-all">
  
      {loading && (
        <div className="loading-background-overlay">
          <div className="white-3d-back-layer">
            <div className="Three-d-layer-border"></div>
            <div className="Three-d-layer-content">
              <div className="Three-d-layer-pattern"></div>
              <div className="loading-center-container-success-story">
                <LoadingScreen 
                  title="در حال بارگذاری داستان‌های موفق" 
                  subtitle="داستان‌های زیبای بازگشت حیوانات خانگی در حال آماده‌سازی هستند..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={`success-stories-main-all ${loading ? 'hidden' : 'visible'}`}>
        <div className="blue-waves-all"></div>
        
        <div className={`stories-card-all ${isVisible ? "visible" : ""}`}>
          <div className="card-border"></div>

          <div className="stories-content-all">
                        <header className="stories-header-all">

              <div className="title-container-all">

                <div className="title-icon-heart story-header-icon">

                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>

                  </svg>

                </div>



                <div className="title-text-content-all">

                  <h1 className="stories-title-all">
                    <span className="title-gradient-all">داستان‌های موفق</span>
                  </h1>
                  <p className="stories-subtitle-all">
                    داستان‌های زیبای بازگشت حیوانات خانگی به آغوش خانواده‌هایشان
                    <span className="subtitle-dots">
                      <span className="dot">.</span>
                      <span className="dot">.</span>
                      <span className="dot">.</span>
                    </span>
                  </p>
                </div>

              </div>

            </header>

            <div className="header-decoration-all">
              <div className="decoration-line-main-all"></div>
              <div className="decoration-dots-container-all">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="decoration-dot-simple-all"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>


            <div className="stories-list-all">
              {!loading && stories.length === 0 ? (
                <div className="no-stories-message">
                  <p>در حال حاضر داستان موفقیتی برای نمایش وجود ندارد.</p>
                </div>
              ) : (
                visibleStories.map((story, index) => (
                  <div
                    key={story.id}
                    className={`story-card-all ${isVisible ? "slide-in" : ""}`}
                    style={{ animationDelay: `${index * 0.15}s` }}
                    onClick={() => setSelectedStory(story)}
                  >
                    <div className="card-border-inner"></div>
                    <div className="story-number-all">0{startIndex + index + 1}</div>

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
                            {story.content}
                          </p>
                        </div>

                        <div className="story-footer-all">
                          <button className="read-more-btn-all" onClick={() => setSelectedStory(story)}>
                            <span>خواندن ادامه داستان</span>
                            <div className="btn-arrow-all">
                              →
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="success-stories-pagination-wrapper">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPrevious={handlePrev}
          onNext={handleNext}
        />
      </div>

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
