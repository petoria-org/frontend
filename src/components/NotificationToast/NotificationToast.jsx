import React, { useEffect } from "react";
import "../../styles/NotificationToast.css";

export const NotificationToast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification-toast ${type}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {type === "success" ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#4CAF50"/>
              <path d="M7 12L10 15L17 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#F44336"/>
              <path d="M15 9L9 15M9 9L15 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </div>
        <div className="toast-message">
          <p className="toast-title">
            {type === "success" ? "عملیات موفق" : "خطا"}
          </p>
          <p className="toast-text">{message}</p>
        </div>
        <button className="toast-close" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};