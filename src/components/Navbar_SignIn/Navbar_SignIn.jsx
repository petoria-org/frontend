import React, { useState } from "react";
import "../../styles/Navbar_SignIn.css";

export const Navbar_SignIn = () => {
  const [activeItem, setActiveItem] = useState("پروفایل");

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
  };

  const isActive = (itemName) => {
    return activeItem === itemName;
  };

  return (
    <div className="navbar">
      <div className="new-ad-button">
        <div className="new-ad-text">آگهی جدید</div>
        <img
          className="add-icon"
          alt="Add"
          src="/src/assets/icons/add.svg"
        />
      </div>

      <div 
        className={`nav-item ${isActive("پروفایل") ? "active" : ""}`}
        onClick={() => handleItemClick("پروفایل")}
      >
        <div className="nav-text">پروفایل</div>
        <img
          className="nav-icon"
          alt="User"
          src="/src/assets/icons/user.svg"
        />
      </div>

      <div 
        className={`nav-item ${isActive("گفتگوها") ? "active" : ""}`}
        onClick={() => handleItemClick("گفتگوها")}
      >
        <div className="nav-text">گفتگوها</div>
        <img
          className="nav-icon"
          alt="Message"
          src="/src/assets/icons/message.svg"
        />
      </div>

      <div 
        className={`nav-item ${isActive("آگهی ها") ? "active" : ""}`}
        onClick={() => handleItemClick("آگهی ها")}
      >
        <div className="nav-text">آگهی ها</div>
        <img
          className="advertisements-icon"
          alt="Advertisements"
          src="/src/assets/icons/Advertisements.svg"
        />
      </div>

      <div 
        className={`nav-item ${isActive("داستان های موفق") ? "active" : ""}`}
        onClick={() => handleItemClick("داستان های موفق")}
      >
        <div className="nav-text">داستان های موفق</div>
        <img
          className="heart-icon"
          alt="Heart"
          src="/src/assets/icons/heart.svg"
        />
      </div>

      <div 
        className={`nav-item ${isActive("خانه") ? "active" : ""}`}
        onClick={() => handleItemClick("خانه")}
      >
        <div className="nav-text">خانه</div>
        <img
          className="home-icon"
          alt="Home"
          src="/src/assets/icons/house.svg"
        />
      </div>

      <img
        className="logo"
        alt="Logo"
        src="/src/assets/images/logo.jpg"
      />
    </div>
  );
};