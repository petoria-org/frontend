import React, { useState, useEffect } from "react";
import { UserProfile } from "../../components/UserProfile/UserProfile";
import { NotificationOptionsSection } from "../../components/NotificationOptionsSection/NotificationOptionsSection";
import { NavbarPage } from "../NavbarPage/NavbarPage";
import "../../styles/UserProfilePage.css";

export const UserProfilePage = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    if (showEditModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
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
  };

  return (
    <div className={`user-profile-screen ${showEditModal ? "modal-open" : ""}`}>
      <div className="screen-background" />

      <NavbarPage />

      <div className="profile-content">
        <UserProfile onEditClick={handleEditClick} />
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