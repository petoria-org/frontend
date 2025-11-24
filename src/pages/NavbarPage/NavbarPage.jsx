import React, { useState, useEffect } from "react";
import { Navbar_SignIn } from "../../components/Navbar_SignIn";
import "../../styles/NavbarPage.css";

export const NavbarPage = () => {
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
    <div className={`screen ${showEditModal ? "modal-open" : ""}`}>
      <div className="screen-background" />
      <Navbar_SignIn />
    </div>
  );
};