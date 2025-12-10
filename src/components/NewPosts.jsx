import React, { useEffect, useMemo, useState } from "react";
import "../styles/NewPosts.css";

const API_ENDPOINTS = {
  all: "/posts/all/",
  lost: "/posts/api/lost-posts/",
  found: "/posts/api/found-posts/",
  adoption: "/posts/api/surrender-posts/",
};

const placeholderImage = "/images/placeholder.jpg";

const toProxyUrl = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
};

export default function NewPosts() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = async (url, append = false) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data = await res.json();
      const results = Array.isArray(data) ? data : data.results || [];

      setPosts((prev) => (append ? [...prev, ...results] : results));

      setPagination({
        next: (Array.isArray(data) ? null : toProxyUrl(data.next)) || null,
        previous: (Array.isArray(data) ? null : toProxyUrl(data.previous)) || null,
        count: (Array.isArray(data) ? results.length : data.count) ?? results.length,
      });
    } catch (err) {
      console.error("NewPosts fetch error:", err);
      setError("Could not load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let url;
    if (activeFilter === "lost") {
      url = API_ENDPOINTS.lost;
    } else if (activeFilter === "found") {
      url = API_ENDPOINTS.found;
    } else if (activeFilter === "adoption") {
      url = API_ENDPOINTS.adoption;
    } else {
      url = API_ENDPOINTS.all;
    }

    fetchPosts(url, false);
  }, [activeFilter]);

  const normalizedPosts = useMemo(
    () =>
      posts.map((p) => {
        let status = "active";

        if (activeFilter === "lost") {
          status = "lost";
        } else if (activeFilter === "found") {
          status = "found";
        } else if (activeFilter === "adoption") {
          status = "adoption";
        } else {
          // 🔹 تب "همه" — اینجا مشکل داشتی
          // هم بر اساس type و هم بر اساس زمان‌ها تشخیص می‌دهیم
          if (p.type === "found" || p.found_time) {
            status = "found";
          } else if (p.type === "lost" || p.lost_time) {
            status = "lost";
          } else if (p.type === "surrender") {
            status = "adoption";
          } else {
            status = p.status || "active";
          }
        }

        return {
          id: `${p.type || "generic"}-${p.id}`,
          rawId: p.id,
          name: p.title || "Untitled",
          desc: p.description || "",
          category: p.pet_type || "other",
          status,
          location: p.location?.readable || p.location || "",
          time: p.created_at || p.updated_at || "",
          image: p.image || placeholderImage,
        };
      }),
    [posts, activeFilter]
  );

  const filteredAds = useMemo(() => {
    const base = normalizedPosts.filter((ad) => {
      const matchCategory =
        categoryFilter === "all" || ad.category === categoryFilter;

      const term = search.trim().toLowerCase();
      const matchSearch =
        !term ||
        ad.name.toLowerCase().includes(term) ||
        ad.desc.toLowerCase().includes(term) ||
        ad.location.toLowerCase().includes(term);

      return matchCategory && matchSearch;
    });

    // 🔹 الان همه‌ی فیلترها (همه / گم‌شده / پیدا شده / سرپرستی)
    // حداکثر ۶ تا آگهی نشان می‌دهند
    return base.slice(0, 6);
  }, [normalizedPosts, categoryFilter, search]);

  const handleViewDetails = (adId) => {
    console.log("View details for ad:", adId);
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleDateString();
  };

  const showMoreEnabled =
    activeFilter !== "all" && !!pagination.next && !loading;

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
          className={`filter-button ${activeFilter === "lost" ? "active" : ""}`}
          onClick={() => setActiveFilter("lost")}
        >
          گم شده
        </div>
        <div
          className={`filter-button ${activeFilter === "found" ? "active" : ""}`}
          onClick={() => setActiveFilter("found")}
        >
          پیدا شده
        </div>
        <div
          className={`filter-button ${activeFilter === "adoption" ? "active" : ""}`}
          onClick={() => setActiveFilter("adoption")}
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
            <option value="all">همه حیوانات</option>
            <option value="dog">سگ</option>
            <option value="cat">گربه</option>
            <option value="other">سایر</option>
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
      {loading && <div className="loading-message-new-posts">Loading...</div>}

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
                  ad.status === "found"
                    ? "status-found-new-posts"
                    : ad.status === "lost"
                    ? "status-missing-new-posts"
                    : "status-adoption-new-posts"
                }`}
              >
                {ad.status}
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
                onClick={() => handleViewDetails(ad.rawId)}
              >
                مشاهده جزییات
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="show-more-container-new-posts">
        <button className="show-more-btn-new-posts">
          مشاهده بیشتر
          <svg className="arrow-icon" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
