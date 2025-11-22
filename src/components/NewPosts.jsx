import React, { useState } from "react";
import "../styles/NewPosts.css";

const adsData = [
  {
    id: 1,
    name: "Bella",
    desc: "A calm and friendly dog found near City Park. Looking for the owner.",
    image: "/images/dog1.jpg",
    location: "City Park",
    time: "2 hours ago",
    status: "پیدا شده",
    category: "سگ"
  },
  {
    id: 2,
    name: "Milo",
    desc: "Lost golden retriever last seen in East Road.",
    image: "/images/dog2.jpg",
    location: "East Road",
    time: "5 hours ago",
    status: "گم شده",
    category: "سگ"
  },
  {
    id: 3,
    name: "Luna",
    desc: "A cute kitten ready for adoption.",
    image: "/images/cat1.jpg",
    location: "North Avenue",
    time: "1 day ago",
    status: "سرپرستی",
    category: "گربه"
  },
  {
    id: 4,
    name: "Max",
    desc: "Friendly black lab found near the river.",
    image: "/images/dog3.jpg",
    location: "River Side",
    time: "3 hours ago",
    status: "پیدا شده",
    category: "سگ"
  },
  {
    id: 5,
    name: "Charlie",
    desc: "Small white cat missing since yesterday.",
    image: "/images/cat2.jpg",
    location: "West Street",
    time: "1 day ago",
    status: "گم شده",
    category: "گربه"
  },
  {
    id: 6,
    name: "Lucy",
    desc: "Young puppy looking for a loving home.",
    image: "/images/dog4.jpg",
    location: "South Park",
    time: "2 days ago",
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
    // برای آینده اضافه خواهد شد
    console.log("View details for ad:", adId);
  };

  return (
    <div className="user-profile-container">
      <h2 className="section-title">All Posts</h2>
      <p className="section-subtitle">Find lost pets or help return them.</p>

      {/* Filter Tabs - بالا سرچ باکس */}
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

      {/* Search Box با فیلتر دسته بندی */}
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

      {/* Cards Grid */}
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

              <div className="category-badge">
                {ad.category}
              </div>

              <div className="ad-content">
                <div className="pet-name">{ad.name}</div>
                <p className="pet-description">{ad.desc}</p>

                <div className="info-row">
                  <span>{ad.location}</span>
                  <span>{ad.time}</span>
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
      <div className="show-more-container">
          <button 
            className="show-more-btn"
            onClick={() => setShowAll(true)}
          >
            مشاهده بیشتر
          </button>
      </div>
    </div>
  );
}