import React, { useState } from "react";
import "../styles/Navbar.css";

export const Navbar = () => {
  const [activeItem, setActiveItem] = useState("پروفایل");

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
  };

  const isActive = (itemName) => {
    return activeItem === itemName;
  };

  return (
    <div className="navbar">
      <div 
        className={`signUp-nav ${isActive("ورود") ? "active" : ""}`}
        onClick={() => handleItemClick("ورود")}
      >
        <div className="signUp-text">ورود</div>
        <img src="" alt="" />
      </div>

      <div className="new-ad-button">
        <div className="new-ad-text">آگهی جدید</div>
        <img
          className="add-icon"
          alt="Add"
          src="/src/icons/add.svg"
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
          src="/src/icons/Advertisements.svg"
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
          src="/src/icons/heart.svg"
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
          src="/src/icons/house.svg"
        />
      </div>

      <img
        className="logo"
        alt="Logo"
        src="/src/icons/logo.jpg"
      />
    </div>
  );
};