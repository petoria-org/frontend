import React, { useState } from "react";
import "../styles/AllPosts.css";

const adsData = [
  {
    id: 1,
    name: "بلا",
    desc: "یک سگ آرام و دوستانه که نزدیک پارک شهر پیدا شده است. به دنبال صاحبش هستیم.",
    image: "/images/dog1.jpg",
    location: "پارک شهر",
    time: "۲ ساعت پیش",
    status: "پیدا شده",
    category: "سگ"
  },
  {
    id: 2,
    name: "مایلو",
    desc: "گلدن رتریور گمشده که آخرین بار در خیابان شرق دیده شده است.",
    image: "/images/dog2.jpg",
    location: "خیابان شرق",
    time: "۵ ساعت پیش",
    status: "گم شده",
    category: "سگ"
  },
  {
    id: 3,
    name: "لونا",
    desc: "یک بچه‌گربه بامزه که آماده واگذاری است.",
    image: "/images/cat1.jpg",
    location: "خیابان شمالی",
    time: "۱ روز پیش",
    status: "سرپرستی",
    category: "گربه"
  },
  {
    id: 4,
    name: "مکس",
    desc: "لبرادور سیاه و مهربان که نزدیک رودخانه پیدا شده است.",
    image: "/images/dog3.jpg",
    location: "کنار رودخانه",
    time: "۳ ساعت پیش",
    status: "پیدا شده",
    category: "سگ"
  },
  {
    id: 5,
    name: "چارلی",
    desc: "گربه سفید کوچک که از دیروز گم شده است.",
    image: "/images/cat2.jpg",
    location: "خیابان غربی",
    time: "۱ روز پیش",
    status: "گم شده",
    category: "گربه"
  },
  {
    id: 6,
    name: "لوسی",
    desc: "توله‌سگ جوانی که به دنبال یک خانه مهربان است.",
    image: "/images/dog4.jpg",
    location: "پارک جنوبی",
    time: "۲ روز پیش",
    status: "سرپرستی",
    category: "سگ"
  },
];

export default function NewPosts() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("همه حیوانات");
  const [search, setSearch] = useState("");

  const filteredAds = adsData.filter((ad) => {
    const matchStatusFilter = activeFilter === "all" || ad.status === activeFilter;
    const matchCategoryFilter = categoryFilter === "همه حیوانات" || ad.category === categoryFilter;
    const matchSearch = ad.name.toLowerCase().includes(search.toLowerCase()) || 
                       ad.desc.toLowerCase().includes(search.toLowerCase());

    return matchStatusFilter && matchCategoryFilter && matchSearch;
  });

  const handleViewDetails = (adId) => {
    //اضافه خواهد شد
    console.log("View details for ad:", adId);
  };

  return (
    <div className="new-post-container">
      <h2 className="section-title">مرور آگهی ها</h2>
      <div className="filter-tabs">
        <div
          className={`filter-button ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          همه
        </div>

        <div
          className={`filter-button ${
            activeFilter === "پیدا شده" ? "active" : ""
          }`}
          onClick={() => setActiveFilter("پیدا شده")}
        >
          پیدا شده
        </div>

        <div
          className={`filter-button ${
            activeFilter === "گم شده" ? "active" : ""
          }`}
          onClick={() => setActiveFilter("گم شده")}
        >
          گم شده
        </div>

        <div
          className={`filter-button ${
            activeFilter === "سرپرستی" ? "active" : ""
          }`}
          onClick={() => setActiveFilter("سرپرستی")}
        >
          سرپرستی
        </div>
      </div>

      <div className="search-container">
        <div className="category-filter">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-select"
          >
            <option value="همه حیوانات">همه حیوانات</option>
            <option value="سگ">سگ</option>
            <option value="گربه">گربه</option>
            <option value="پرنده">پرنده</option>
            <option value="خرگوش">خرگوش</option>
            <option value="همستر">همستر</option>
          </select>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="جستجو در پست ها..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="ads-grid">
        {filteredAds.length > 0 ? (
          filteredAds.map((ad) => (
            <div className="ad-card" key={ad.id}>
              <img className="pet-image" src={ad.image} alt={ad.name} />
              <div className="status-badge">
                <div
                  className={`status-background ${
                    ad.status === "پیدا شده"
                      ? "status-found"
                      : ad.status === "سرپرستی"
                      ? "status-adoption"
                      : "status-missing"
                  }`}
                >
                  {ad.status}
                </div>
              </div>

              <div className="ad-content">
                <div className="top-row">
                  <div className="pet-name">{ad.name}</div>
                  <div className="category-badge">{ad.category}</div>
                </div>
                <p className="pet-description">{ad.desc}</p>
                <div className="location-container">
                  <div>{ad.location}</div>
                  <img
                    className="location-icon"
                    alt="location"
                    src="/src/icons/location.svg"
                  />
                </div>
                <div className="calender-container">
                  <div>{ad.time}</div>
                  <img
                    className="calendar-icon"
                    alt="calendar"
                    src="/src/icons/calendar-2.svg"
                  />
                </div>
              </div>

              <div className="action-buttons">
                <div 
                  className="btn view-details-btn"
                  onClick={() => handleViewDetails(ad.id)}
                >
                  مشاهده جزییات
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-posts-message">
            هیچ پستی یافت نشد
          </div>
        )}
      </div>
      <div class="show-more-container">
        <button class="show-more-btn">
        <svg class="arrow-icon" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
        </svg>
         مشاهده بیشتر
        </button>
      </div>
    </div>
  );
}