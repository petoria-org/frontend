import { useState, useEffect } from "react";
import { UserProfile } from "../../components/UserProfile";
import { NotificationOptionsSection } from "../../components/NotificationOptionsSection";
import { useOutletContext } from "react-router-dom";
import "../../styles/UserProfilePage.css";

export const UserProfilePage = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const { setHideNavbar, setHideFooter } = useOutletContext();

  const [refreshKey, setRefreshKey] = useState(0);
  const refreshAds = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    if (showEditModal) {
      document.body.classList.add("modal-open");
      setHideNavbar(true);
      setHideFooter(true);
    } else {
      document.body.classList.remove("modal-open");
      setHideNavbar(false);
      setHideFooter(false);
    }

    return () => {
      document.body.classList.remove("modal-open");
      setHideNavbar(false);
      setHideFooter(false);
    };
  }, [showEditModal]);

  const handleEditClick = (ad) => {
    setSelectedAd(ad);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedAd(null);
  };

  const handleSaveAd = (updatedAd) => {
    console.log("آگهی ویرایش شده:", updatedAd);
    setShowEditModal(false);
    setSelectedAd(null);
    refreshAds();
  };

  return (
    <div className={`screen ${showEditModal ? "modal-open" : ""}`}>
      <div className="screen-background" />
      
      <div className="page-layout">
        <div className="main-content-area">
          <div className="content-wrapper">
            <UserProfile 
              onEditClick={handleEditClick}
              refreshKey={refreshKey}
            />
          </div>
        </div>
      </div>
      
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <NotificationOptionsSection 
              adData={selectedAd}
              onClose={handleCloseModal}
              onSave={handleSaveAd}
            />
          </div>
        </div>
      )}
    </div>
  );
};