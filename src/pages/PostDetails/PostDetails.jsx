import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ShowDetailsAdopt } from "../../components/ShowDetailsAdopt";
import "../../styles/PostDetails.css";

const PostDetailsLoading = () => {
  return (
    <div className="post-details-loading-overlay">
      <div className="post-details-loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <div className="spinner"></div>
          <div className="spinner"></div>
          <div className="spinner"></div>
        </div>
        <div className="loading-text">در حال بارگذاری جزئیات آگهی...</div>
        <div className="loading-subtext">لطفا چند لحظه صبر کنید</div>
      </div>
    </div>
  );
};

export const PostDetails = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  const { postId, postType, postData } = location.state || {};
  
  console.log("داده‌های دریافتی:", { postId, postType, postData });

  useEffect(() => {
    // وقتی داده‌های state وجود ندارند، لودینگ را نشان بده
    if (!postId && !postData) {
      setIsLoading(true);
      // پس از 3 ثانیه هم اگر داده نیامد، صفحه را نشان بده
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      return () => clearTimeout(timeout);
    } else {
      // اگر داده داریم، 500 میلی‌ثانیه لودینگ نشان بده
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [postId, postData]);

  return (
    <div className="post-details-page">
      {isLoading ? (
        <PostDetailsLoading />
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