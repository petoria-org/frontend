import { useState, useEffect } from "react";
import { UserProfile } from "../../components/UserProfile";
import { NotificationOptionsSection } from "../../components/NotificationOptionsSection";
import "../../styles/UserProfilePage.css";

export const UserProfilePage = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const refreshAds = () => setRefreshKey(prev => prev + 1);

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
    handleCloseModal();
    refreshAds();
  };

  return (
    <>
      <UserProfile
        onEditClick={handleEditClick}
        refreshKey={refreshKey}
      />

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <NotificationOptionsSection
              adData={selectedAd}
              onClose={handleCloseModal}
              onSave={handleSaveAd}
              mode="edit"
            />
          </div>
        </div>
      )}
    </>
  );
};