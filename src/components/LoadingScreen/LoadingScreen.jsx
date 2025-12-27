import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = ({ message = "در حال بارگذاری آگهی‌ها..." }) => {
  return (
    <div className="pet-loading-screen">
      <div className="loading-container">
        <div className="loading-background">
          <div className="paw-prints">
            <div className="paw paw-1"></div>
            <div className="paw paw-2"></div>
            <div className="paw paw-3"></div>
            <div className="paw paw-4"></div>
          </div>
          
          <div className="pet-animation">
            <div className="pet-silhouette">
              <div className="pet-head">
                <div className="pet-ear ear-left"></div>
                <div className="pet-ear ear-right"></div>
              </div>
              <div className="pet-body"></div>
              <div className="pet-tail"></div>
            </div>
          </div>
        </div>

        <div className="loading-content">
          <div className="loading-icon">
            <svg className="heart-pulse" width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="currentColor"
              />
            </svg>
          </div>

          <h2 className="loading-title">
            <span className="loading-title-text">{message}</span>
            <div className="loading-dots">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </div>
          </h2>

          <p className="loading-subtitle">
            در حال یافتن بهترین همراهان برای شما
          </p>

          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill"></div>
              <div className="progress-bone">
                <div className="bone-notch"></div>
                <div className="bone-notch"></div>
              </div>
            </div>
            <div className="progress-text">در حال جستجو در آگهی‌ها</div>
          </div>

          <div className="loading-pets">
            <div className="pet-item pet-1">
              <div className="pet-dot"></div>
              <span className="pet-label">گربه‌ها</span>
            </div>
            <div className="pet-item pet-2">
              <div className="pet-dot"></div>
              <span className="pet-label">سگ‌ها</span>
            </div>
            <div className="pet-item pet-3">
              <div className="pet-dot"></div>
              <span className="pet-label">پرنده‌ها</span>
            </div>
            <div className="pet-item pet-4">
              <div className="pet-dot"></div>
              <span className="pet-label">حیوانات دیگر</span>
            </div>
          </div>
        </div>

        <div className="loading-tip">
          <svg className="tip-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M13 16h-2v-6h2v6zm-1-8.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="currentColor"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
          </svg>
          <span>آگهی‌ها در حال بارگذاری هستند. لطفا شکیبا باشید...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;