import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "../../styles/NotificationToast.css";

export const NotificationToast = ({ 
  message, 
  type = "success", 
  duration = 3000,
  onClose,
  position = "top-right",
  actions = []
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const hasActions = Array.isArray(actions) && actions.length > 0;
  const shouldAutoClose = typeof duration === "number" && duration > 0;

  useEffect(() => {
    if (!shouldAutoClose) return undefined;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, shouldAutoClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#10B981"/>
            <path d="M7 12L10 15L17 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "error":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#EF4444"/>
            <path d="M15 9L9 15M9 9L15 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "warning":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#F59E0B"/>
            <path d="M12 8v4m0 4h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "info":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#3B82F6"/>
            <path d="M12 8v8m0-12v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success": return "#10B981";
      case "error": return "#EF4444";
      case "warning": return "#F59E0B";
      case "info": return "#3B82F6";
      default: return "#3B82F6";
    }
  };

  const getPositionClass = () => "top-right";

  const toast = (
    <div 
      className={`notification-toast-wrapper ${getPositionClass()} ${
        isExiting ? "exiting" : ""
      }`}
    >
      <div 
        className="notification-toast" 
        style={{ 
          borderLeft: `4px solid ${getBgColor()}`,
          backgroundColor: type === "success" ? "#f0fdf4" : 
                          type === "error" ? "#fef2f2" : 
                          type === "warning" ? "#fffbeb" : 
                          "#eff6ff"
        }}
      >
        <div className="toast-content">
          <div className="toast-icon" style={{ color: getBgColor() }}>
            {getIcon()}
          </div>
          
          <div className="toast-message">
            <h4 className="toast-title" style={{ color: getBgColor() }}>
              {type === "success" && "عملیات موفق"}
              {type === "error" && "خطا"}
              {type === "warning" && "هشدار"}
              {type === "info" && "اطلاعیه"}
            </h4>
            <p className="toast-text">{message}</p>
          </div>
          
          <button 
            className="toast-close" 
            onClick={handleClose}
            style={{ color: "#6B7280" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        {hasActions && (
          <div className="toast-actions">
            {actions.map((action, index) => (
              <button
                key={`${action.label}-${index}`}
                type="button"
                className={`toast-action${action.variant ? ` toast-action-${action.variant}` : ""}`}
                onClick={() => {
                  action.onClick?.();
                  handleClose();
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {shouldAutoClose && (
          <div className="toast-progress">
            <div 
              className="progress-bar" 
              style={{ 
                backgroundColor: getBgColor(),
                animation: `progressShrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return toast;
  }

  return createPortal(toast, document.body);
};
