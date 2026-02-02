import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ShowDetailsAdopt } from "../../components/ShowDetailsAdopt";
import "../../styles/PostDetails.css";
import "../../styles/ShowDetailsAdopt.css";

const PostDetailsSkeleton = () => {
  return (
    <div className="details-container">
      <div className="show-details-shell">
        <div className="show-details-frame">
          <div className="show-details-card">
            <div className="show-details-scroll">
              <div className="show-details-inner">
                <div className="show-details-container">
                  <div className="back-button-container">
                    <div className="details-skeleton-block details-skeleton-back"></div>
                  </div>

                  <div className="main-card">
                    <div className="card-content-wrapper">
                      <div className="content-sections">
                        <div className="details-section details-skeleton-section">
                          <div className="details-header">
                            <div className="details-skeleton-block details-skeleton-title"></div>
                            <div className="details-skeleton-block details-skeleton-badge"></div>
                          </div>

                          <div className="details-grid">
                            {Array.from({ length: 4 }).map((_, index) => (
                              <div className="detail-item details-skeleton-item" key={`detail-item-${index}`}>
                                <div className="detail-icon details-skeleton-block details-skeleton-icon"></div>
                                <div className="detail-text">
                                  <div className="details-skeleton-block details-skeleton-value"></div>
                                  <div className="details-skeleton-block details-skeleton-label"></div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="section">
                            <div className="section-title-show-details">
                              <div className="details-skeleton-block details-skeleton-section-title"></div>
                            </div>
                            <div className="description-content">
                              <div className="details-skeleton-block details-skeleton-paragraph long"></div>
                              <div className="details-skeleton-block details-skeleton-paragraph medium"></div>
                              <div className="details-skeleton-block details-skeleton-paragraph short"></div>
                            </div>
                          </div>

                          <div className="section">
                            <div className="section-title-show-details">
                              <div className="details-skeleton-block details-skeleton-section-title"></div>
                            </div>
                            <div className="toggles-container">
                              {Array.from({ length: 3 }).map((_, index) => (
                                <div className="toggle-item" key={`detail-toggle-${index}`}>
                                  <div className="details-skeleton-block details-skeleton-toggle-label"></div>
                                  <div className="details-skeleton-block details-skeleton-toggle"></div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="contact-section">
                            <div className="contact-container">
                              <div className="contact-header">
                                <div className="details-skeleton-block details-skeleton-contact-icon"></div>
                                <div className="details-skeleton-block details-skeleton-contact-title"></div>
                              </div>
                              <div className="contact-fields">
                                {Array.from({ length: 2 }).map((_, index) => (
                                  <div className="contact-field" key={`detail-field-${index}`}>
                                    <div className="details-skeleton-block details-skeleton-field-label"></div>
                                    <div className="details-skeleton-block details-skeleton-field-input"></div>
                                  </div>
                                ))}
                              </div>
                              <div className="details-skeleton-block details-skeleton-btn"></div>
                            </div>
                          </div>
                        </div>

                        <div className="gallery-section">
                          <div className="gallery-container">
                            <div className="main-image-frame">
                              <div className="details-skeleton-block details-skeleton-image"></div>
                            </div>
                            <div className="image-dots-container">
                              <div className="details-skeleton-block details-skeleton-dots"></div>
                            </div>
                            <div className="other-images-container">
                              <div className="other-images-title">
                                <div className="details-skeleton-block details-skeleton-small-title"></div>
                              </div>
                              <div className="other-images-grid">
                                {Array.from({ length: 4 }).map((_, index) => (
                                  <div className="other-image-item" key={`detail-thumb-grid-${index}`}>
                                    <div className="details-skeleton-block details-skeleton-thumb"></div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PostDetails = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const MIN_DETAILS_LOADING_MS = 2500;
  
  const { postId, postType, postData } = location.state || {};
  
  console.log("داده‌های دریافتی:", { postId, postType, postData });

  useEffect(() => {
    if (!postId && !postData) {
      setIsLoading(true);
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, MIN_DETAILS_LOADING_MS);
      return () => clearTimeout(timeout);
    }

    setIsLoading(false);
  }, [postId, postData]);

  return (
    <div className="post-details-page">
      {isLoading ? (
        <PostDetailsSkeleton />
      ) : (
        <div className="page-content">
          {postId || postData ? (
            <ShowDetailsAdopt 
              postId={postId}
              postType={postType}
              postData={postData}
            />
          ) : (
            <div className="no-data-message">
              <h2>آگهی یافت نشد</h2>
              <p>لطفاً از صفحه آگهی‌ها، آگهی مورد نظر خود را انتخاب کنید.</p>
              <button 
                className="back-to-posts-btn"
                onClick={() => window.location.href = '/posts'}
              >
                بازگشت به آگهی‌ها
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};








