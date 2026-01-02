import '../../styles/DeleteConfirmationModal.css';
import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";


const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "حذف عکس",
  message = "آیا از حذف این عکس اطمینان دارید؟",
  confirmText = "حذف",
  cancelText = "لغو",
  isLoading = false,
  imageUrl = null
}) => {

  const { setHideNavbar } = useOutletContext();

  useEffect(() => {
    if (isOpen) {
      setHideNavbar(true);
      document.body.style.overflow = "hidden";
    }

    return () => {
      setHideNavbar(false);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, setHideNavbar]);

  if (!isOpen) return null;
  
  return (
    <div className="delete-confirmation-overlay">
      <div className="delete-confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-content">
          <div className="delete-modal-header">
            <div className="delete-modal-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 20 12 20ZM12 7C11.45 7 11 7.45 11 8V12C11 12.55 11.45 13 12 13C12.55 13 13 12.55 13 12V8C13 7.45 12.55 7 12 7ZM11 15V17H13V15H11Z" fill="#EF4444"/>
              </svg>
            </div>
            <h3 className="delete-modal-title">{title}</h3>
            <button className="delete-modal-close" onClick={onClose} disabled={isLoading}>
              ×
            </button>
          </div>

          <div className="delete-modal-body">
            {imageUrl && (
              <div className="delete-preview-container">
                <img 
                  src={imageUrl} 
                  alt="عکس برای حذف" 
                  className="delete-preview-image"
                />
                <div className="delete-preview-overlay">
                  <div className="delete-preview-warning">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 9V11M12 15H12.01M5.07 19H18.93C20.45 19 21.26 17.24 20.25 16L13.18 4.29C12.79 3.64 12.11 3.27 11.39 3.27C10.67 3.27 9.99 3.64 9.6 4.29L2.53 16C1.52 17.24 2.33 19 3.85 19Z" 
                        stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}
            
            <p className="delete-modal-message">{message}</p>
            
            <div className="delete-modal-details">
              <div className="delete-detail-item">
                <span className="delete-detail-label">تأثیر:</span>
                <span className="delete-detail-value">این عکس از سرور حذف خواهد شد</span>
              </div>
              <div className="delete-detail-item">
                <span className="delete-detail-label">غیر قابل بازگشت:</span>
                <span className="delete-detail-value">این عمل برگشت‌ناپذیر است</span>
              </div>
            </div>
          </div>

          <div className="delete-modal-footer">
            <button
              className="delete-cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              className="delete-confirm-btn"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="delete-loading">
                  <span className="delete-loading-spinner"></span>
                  در حال حذف...
                </span>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="delete-confirm-icon">
                    <path d="M4 4L12 12M4 12L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {confirmText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;