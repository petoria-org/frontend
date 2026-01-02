import React from "react";
import "../../styles/LoadingScreen.css";

const LoadingScreen = ({ 
  title = "در حال بارگذاری", 
  subtitle = "لطفا چند لحظه صبر کنید...",
  showPaws = true
}) => {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="card-border-loading"></div>
        
        <div className="loading-content">
          <div className="loading-heart-wrapper">
            <div className="loading-heart">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  stroke="url(#heart-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7ab3e0" />
                    <stop offset="100%" stopColor="#5a9bc9" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          <div className="loading-text-container">
            <h3 className="loading-title">{title}</h3>
            <p className="loading-subtitle">{subtitle}</p>
          </div>
          
          {showPaws && (
            <div className="loading-paws">
              <div className="paw-icon">
                <img src="/src/assets/icons/paw.svg" alt="Paw" className="paw-svg" />
              </div>
              <div className="paw-icon">
                <img src="/src/assets/icons/paw.svg" alt="Paw" className="paw-svg" />
              </div>
              <div className="paw-icon">
                <img src="/src/assets/icons/paw.svg" alt="Paw" className="paw-svg" />
              </div>
              <div className="paw-icon">
                <img src="/src/assets/icons/paw.svg" alt="Paw" className="paw-svg" />
              </div>
            </div>
          )}
          
          <div className="loading-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <div className="progress-dots">
              <div className="progress-dot dot-1"></div>
              <div className="progress-dot dot-2"></div>
              <div className="progress-dot dot-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;