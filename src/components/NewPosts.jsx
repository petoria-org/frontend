import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NewPosts.css";

const API_ENDPOINTS = {
  all: "/posts/all/",
  lost: "/posts/api/lost-posts/",
  found: "/posts/api/found-posts/",
  adoption: "/posts/api/surrender-posts/",
};

const PLACEHOLDER_IMAGE = "/images/placeholder.jpg";

const calculateRelativeTime = (isoDate) => {
  if (!isoDate) return "تاریخ نامشخص";

  const now = new Date();
  const date = new Date(isoDate);

  if (isNaN(date)) return "تاریخ نامشخص";

  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "همین الان";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقیقه پیش`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعت پیش`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} روز پیش`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} ماه پیش`;
  return `${Math.floor(diffInSeconds / 31536000)} سال پیش`;
};

export default function NewPosts() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("all");
  const [posts, setPosts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("همه حیوانات");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = async (url) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`دریافت داده با خطا مواجه شد: ${res.status}`);

      const data = await res.json();
      const results = Array.isArray(data) ? data : data.results || [];

      setPosts(results);
    } catch (err) {
      console.error("خطا در دریافت آگهی‌ها:", err);
      setError("بارگذاری آگهی‌ها موفقیت‌آمیز نبود.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let url;
    if (activeFilter === "گم شده") {
      url = API_ENDPOINTS.lost;
    } else if (activeFilter === "پیدا شده") {
      url = API_ENDPOINTS.found;
    } else if (activeFilter === "سرپرستی") {
      url = API_ENDPOINTS.adoption;
    } else {
      url = API_ENDPOINTS.all;
    }

    fetchPosts(url);
  }, [activeFilter]);

  const normalizedPosts = useMemo(() => {
    return posts.map((p) => {
      let status = "active";
      let statusLabel = "فعال";

      if (activeFilter === "گم شده") {
        status = "گم شده";
        statusLabel = "گم شده";
      } else if (activeFilter === "پیدا شده") {
        status = "پیدا شده";
        statusLabel = "پیدا شده";
      } else if (activeFilter === "سرپرستی") {
        status = "سرپرستی";
        statusLabel = "سرپرستی";
      } else {
        if (p.type === "found" || p.found_time) {
          status = "پیدا شده";
          statusLabel = "پیدا شده";
        } else if (p.type === "lost" || p.lost_time) {
          status = "گم شده";
          statusLabel = "گم شده";
        } else if (p.type === "surrender") {
          status = "سرپرستی";
          statusLabel = "سرپرستی";
        } else {
          status = p.status || "active";
          statusLabel = "فعال";
        }
      }

      const categoryMap = {
        dog: "سگ",
        cat: "گربه",
        other: "سایر",
      };

      return {
        id: `${p.type || "generic"}-${p.id}`,
        rawId: p.id,
        name: p.pet_name || p.title || "بدون نام",
        desc: p.description || "",
        category: categoryMap[p.pet_type] || p.pet_type || "سایر",
        status,
        statusLabel,
        location: p.location?.readable || p.location || "موقعیت نامشخص",
        time: calculateRelativeTime(p.created_at || p.updated_at),
        image: PLACEHOLDER_IMAGE,
        type: p.type || "generic",
        originalData: p,
      };
    });
  }, [posts, activeFilter]);

  const filteredAds = useMemo(() => {
    const base = normalizedPosts.filter((ad) => {
      const matchCategory =
        categoryFilter === "همه حیوانات" || ad.category === categoryFilter;

      const term = search.trim().toLowerCase();
      const matchSearch =
        !term ||
        ad.name.toLowerCase().includes(term) ||
        ad.desc.toLowerCase().includes(term) ||
        ad.location.toLowerCase().includes(term);

      return matchCategory && matchSearch;
    });

    return base.slice(0, 6);
  }, [normalizedPosts, categoryFilter, search]);

  const handleViewDetails = (ad) => {
    console.log("مشاهده جزئیات برای آگهی (NewPosts):", ad);

    const postType = ad.type || ad.originalData?.type || "generic";

    navigate("/post-details", {
      state: {
        postId: ad.rawId,
        postType: postType,
        postData: {
          ...ad,
          originalData: ad.originalData,
          has_birth_certificate: ad.originalData?.has_birth_certificate || false,
          vaccination: ad.originalData?.vaccination || false,
          steriliz: ad.originalData?.steriliz || false,
        },
        fromPosts: true,
      },
    });
  };

  const formatDate = (isoOrRelative) => {
    // here `time` is already relative string, but just in case:
    if (!isoOrRelative) return "";
    if (isoOrRelative.includes("پیش") || isoOrRelative === "همین الان") {
      return isoOrRelative;
    }
    const d = new Date(isoOrRelative);
    return isNaN(d) ? isoOrRelative : d.toLocaleDateString();
  };

  return (
    <div className="new-post-container-new-posts">
      <h2 className="section-title-new-posts">مرور آگهی ها</h2>

      <div className="filter-tabs-new-posts">
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

      <div className="search-container-new-posts">
        <div className="category-filter-new-posts">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-select-new-posts"
          >
            <option value="همه حیوانات">همه حیوانات</option>
            <option value="سگ">سگ</option>
            <option value="گربه">گربه</option>
            <option value="سایر">سایر</option>
          </select>
        </div>
        <div className="search-box-new-posts">
          <input
            type="text"
            placeholder="جستجو بر اساس نام،نژاد یا مکان... "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-message-new-posts">{error}</div>}
      {loading && <div className="loading-message-new-posts">در حال بارگذاری...</div>}

      <div className="ads-grid-new-posts">
        {!loading && filteredAds.length === 0 && (
          <div className="no-posts-message-new-posts">هیچ پستی یافت نشد</div>
        )}

        {filteredAds.map((ad) => (
          <div className="ad-card-new-posts" key={ad.id}>
            <img className="pet-image-new-posts" src={ad.image} alt={ad.name} />

            <div className="status-badge-new-posts">
              <div
                className={`status-background-new-posts ${
                  ad.status === "پیدا شده"
                    ? "status-found-new-posts"
                    : ad.status === "سرپرستی"
                    ? "status-adoption-new-posts"
                    : "status-missing-new-posts"
                }`}
              >
                {ad.statusLabel}
              </div>
            </div>

            <div className="ad-content-new-posts">
              <div className="top-row-new-posts">
                <div className="pet-name-new-posts">{ad.name}</div>
                <div className="category-badge-new-posts">{ad.category}</div>
              </div>

              <p className="pet-description-new-posts">{ad.desc}</p>

              <div className="location-container-new-posts">
                <div>{ad.location}</div>
                <img
                  className="location-icon"
                  alt="location"
                  src="/src/icons/location.svg"
                />
              </div>

              <div className="calender-container-new-posts">
                <div>{formatDate(ad.time)}</div>
                <img
                  className="calendar-icon"
                  alt="calendar"
                  src="/src/icons/calendar-2.svg"
                />
              </div>
            </div>

            <div className="action-buttons-new-posts">
              <div
                className="btn view-details-btn-new-posts"
                onClick={() => handleViewDetails(ad)}
              >
                مشاهده جزییات
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="show-more-container-new-posts">
        <button
          className="show-more-btn-new-posts"
          onClick={() => navigate("/pposts")}
        >
          مشاهده بیشتر
          <svg className="arrow-icon" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
