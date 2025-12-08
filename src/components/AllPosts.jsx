import React, { useState } from "react";
import "../styles/AllPosts.css";

const adsData = [
  {
    id: 1,
    name: "بلا",
    desc: "یک سگ آرام و دوستانه که نزدیک پارک شهر پیدا شده است. به دنبال صاحبش هستیم متن اضافه این سگ خیلی مهربون است و دنبال خانه ای ارام میگردد و به او کمک کنید.",
    image: "src/picture_test/a.jpg",
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
    <div className="new-post-container-all-posts">
      <h2 className="section-title-all-posts">آگهی ها</h2>
      <div className="filter-tabs-all-posts">
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
            <div className="ad-card-all-posts" key={ad.id}>
              <img className="pet-image-all-posts" src={ad.image} alt={ad.name} />
              <div className="status-badge-all-posts">
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

              <div className="ad-content-all-posts">
                <div className="top-row-all-posts">
                  <div className="pet-name-all-posts">{ad.name}</div>
                  <div className="category-badge-all-posts">{ad.category}</div>
                </div>
                <p className="pet-description-all-posts">{ad.desc}</p>
                <div className="location-container-all-posts">
                  <div>{ad.location}</div>
                  <img
                    className="location-icon"
                    alt="location"
                    src="/src/icons/location.svg"
                  />
                </div>
                <div className="calender-container-all-posts">
                  <div>{ad.time}</div>
                  <img
                    className="calendar-icon"
                    alt="calendar"
                    src="/src/icons/calendar-2.svg"
                  />
                </div>
              </div>

              <div className="action-buttons-all-posts">
                <div 
                  className="view-details-btn-all-posts"
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
    </div>
  );
}