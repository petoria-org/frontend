// ConfirmDialog.jsx
import React from "react";
import "../../styles/ConfirmDialog.css";

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "تأیید",
  cancelText = "لغو",
  type = "warning",
  icon,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  // انتخاب آیکون بر اساس نوع
  const renderIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case "warning":
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2"/>
            <path d="M12 8v4" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="#F59E0B"/>
          </svg>
        );
      case "danger":
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#F44336" strokeWidth="2"/>
            <path d="M15 9l-6 6m0-6l6 6" stroke="#F44336" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "success":
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2"/>
            <path d="M8 12l3 3 5-5" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "info":
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2"/>
            <path d="M12 16v-4M12 8h.01" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      default:
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2"/>
            <path d="M12 16v-4M12 8h.01" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
    }
  };

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <div className={`confirm-dialog-icon ${type}`}>
            {renderIcon()}
          </div>
          <h3 className="confirm-dialog-title">{title}</h3>
          <p className="confirm-dialog-subtitle">{message}</p>
        </div>
        
        <div className="confirm-dialog-actions">
          <button 
            className="confirm-dialog-cancel-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-dialog-confirm-btn ${type}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="confirm-loading-spinner"></div>
                در حال پردازش...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};