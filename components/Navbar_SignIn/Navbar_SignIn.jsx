import React, { useState } from "react";
import "./Navbar_SignIn.css";

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
        className={`profile-nav ${isActive("پروفایل") ? "active" : ""}`}
        onClick={() => handleItemClick("پروفایل")}
      >
        <div className="profile-text">پروفایل</div>
        <img
          className="user-icon"
          alt="User"
          src="/src/assets/icons/user.svg"
        />
      </div>

      <div 
        className={`messages-nav ${isActive("گفتگوها") ? "active" : ""}`}
        onClick={() => handleItemClick("گفتگوها")}
      >
        <div className="messages-text">گفتگوها</div>
        <img
          className="message-icon"
          alt="Message"
          src="/src/assets/icons/message.svg"
        />
      </div>

      <div 
        className={`ads-nav ${isActive("آگهی ها") ? "active" : ""}`}
        onClick={() => handleItemClick("آگهی ها")}
      >
        <div className="ads-text">آگهی ها</div>
        <img
          className="ads-icon"
          alt="Advertisements"
          src="/src/assets/icons/Advertisements.svg"
        />
      </div>

      <div 
        className={`stories-nav ${isActive("داستان های موفق") ? "active" : ""}`}
        onClick={() => handleItemClick("داستان های موفق")}
      >
        <div className="stories-text">داستان های موفق</div>
        <img
          className="heart-icon"
          alt="Heart"
          src="/src/assets/icons/heart.svg"
        />
      </div>

      <div 
        className={`home-nav ${isActive("خانه") ? "active" : ""}`}
        onClick={() => handleItemClick("خانه")}
      >
        <div className="home-text">خانه</div>
        <img
          className="home-icon"
          alt="House"
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