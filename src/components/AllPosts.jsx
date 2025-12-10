import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AllPosts.css";

const API_ENDPOINTS = {
  all: "/posts/all/",
  lost: "/posts/api/lost-posts/",
  found: "/posts/api/found-posts/",
  adoption: "/posts/api/surrender-posts/",
};

const PLACEHOLDER_IMAGE = "/images/placeholder.jpg";

const ITEMS_PER_PAGE = 6;

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

export default function AllPosts() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState("همه حیوانات");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async (url, page = 1) => {
    setLoading(true);
    setError("");

    try {
      const urlWithPage = page > 1 ? `${url}?page=${page}` : url;
      
      const res = await fetch(urlWithPage);
      if (!res.ok) throw new Error(`دریافت داده با خطا مواجه شد: ${res.status}`);

      const data = await res.json();
      const results = Array.isArray(data) ? data : data.results || [];

      setPosts(results);

      const totalCount = data.count || results.length;
      
      const calculatedTotalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
      
      setPagination({
        next: (Array.isArray(data) ? null : data.next) || null,
        previous: (Array.isArray(data) ? null : data.previous) || null,
        count: totalCount,
      });
      
      setTotalPages(calculatedTotalPages);
      
      console.log(`تعداد کل پست‌ها: ${totalCount}, صفحات: ${calculatedTotalPages}, صفحه فعلی: ${page}`);
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
    } 
    
    else if (activeFilter === "پیدا شده") {
      url = API_ENDPOINTS.found;
    } 
    
    else if (activeFilter === "سرپرستی") {
      url = API_ENDPOINTS.adoption;
    } 
    
    else {
      url = API_ENDPOINTS.all;
    }

    fetchPosts(url, currentPage);
  }, [activeFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const normalizedPosts = useMemo(() => {
    return posts.map((p) => {
      let status = "active";
      let statusLabel = "فعال";

      if (activeFilter === "گم شده") {
        status = "گم شده";
        statusLabel = "گم شده";
      } 
      
      else if (activeFilter === "پیدا شده") {
        status = "پیدا شده";
        statusLabel = "پیدا شده";
      } 
      
      else if (activeFilter === "سرپرستی") {
        status = "سرپرستی";
        statusLabel = "سرپرستی";
      } 
      
      else {
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
        originalData: p 
      };
    });
  }, [posts, activeFilter]);

  const filteredAds = useMemo(() => {
    return normalizedPosts.filter((ad) => {
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
  }, [normalizedPosts, categoryFilter, search]);

  const handleViewDetails = (ad) => {
    console.log("مشاهده جزئیات برای آگهی:", ad);

    const postType = ad.type || ad.originalData?.type || "generic";

    navigate('/post-details', { 
      state: { 
        postId: ad.rawId,
        postType: postType,
        postData: {
          ...ad,
          originalData: ad.originalData,
          has_birth_certificate: ad.originalData?.has_birth_certificate || false,
          vaccination: ad.originalData?.vaccination || false,
          steriliz: ad.originalData?.steriliz || false,
        }
      } 
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const ChevronRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  );

  const ChevronLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  );

  return (
    <div className="new-post-container-all-posts">
      <h2 className="section-title-all-posts">آگهی‌ها</h2>

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
            <option value="سایر">سایر</option>
          </select>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="جستجو در پست‌ها..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">در حال بارگذاری...</div>}

      <div className="ads-grid">
        {!loading && filteredAds.length === 0 && (
          <div className="no-posts-message">هیچ پستی یافت نشد</div>
        )}

        {filteredAds.map((ad) => (
          <div className="ad-card-all-posts" key={ad.id}>
            <img
              className="pet-image-all-posts"
              src={ad.image}
              alt={ad.name}
            />
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
                {ad.statusLabel}
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
                onClick={() => handleViewDetails(ad)}
              >
                مشاهده جزئیات
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && pagination.count > 0 && totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || loading}
          >
            <ChevronRightIcon />
          </button>

          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-page-button ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageClick(page)}
                disabled={loading}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-button"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || loading}
          >
            <ChevronLeftIcon />
          </button>
        </div>
      )}
    </div>
  );
}