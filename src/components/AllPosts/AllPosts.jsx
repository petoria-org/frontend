import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdvancedFilters from "../AdvancedFilters";
import SortFilters from "../SortFilters";
import "../../styles/AllPosts.css";

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
  
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filterAnimal, setFilterAnimal] = useState("all");
  const [filterSex, setFilterSex] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterAge, setFilterAge] = useState("all");
  const [filterHasCertificate, setFilterHasCertificate] = useState("all");
  const [filterIsVaccinated, setFilterIsVaccinated] = useState("all");
  const [filterIsSterilized, setFilterIsSterilized] = useState("all");
  
  const [sortOrder, setSortOrder] = useState("");

  const activeFiltersCount = [
    filterAnimal !== "all",
    filterSex !== "all",
    filterCity !== "all",
    filterAge !== "all",
    filterHasCertificate !== "all",
    filterIsVaccinated !== "all",
    filterIsSterilized !== "all",
  ].filter(Boolean).length;

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
        rabbit: "خرگوش",
        hamster: "همستر",
        bird: "پرنده",
      };

      const sex = p.sex || (p.pet_sex === "male" ? "نر" : p.pet_sex === "female" ? "ماده" : null);
      
      const age = p.age || p.pet_age || null;
      
      const locationText = p.location?.readable || p.location || "موقعیت نامشخص";
      
      const createdAt = p.created_at ? new Date(p.created_at) : new Date();
      const updatedAt = p.updated_at ? new Date(p.updated_at) : createdAt;
      
      const eventDate = p.lost_time || p.found_time || p.surrender_date || p.created_at;
      const eventDateTime = eventDate ? new Date(eventDate) : createdAt;

      return {
        id: `${p.type || "generic"}-${p.id}`,
        rawId: p.id,
        name: p.pet_name || p.title || "بدون نام",
        desc: p.description || "",
        category: categoryMap[p.pet_type] || p.pet_type || "سایر",
        status,
        statusLabel,
        location: locationText,
        city: locationText,
        time: calculateRelativeTime(p.created_at || p.updated_at),
        image: p.image_url || PLACEHOLDER_IMAGE,
        type: p.type || "generic",
        sex: sex,
        age: age,
        hasBirthCertificate: p.has_birth_certificate || false,
        isVaccinated: p.vaccination || false,
        isSterilized: p.steriliz || false,
        createdAt,
        updatedAt,
        eventDateTime,
        originalData: p,
      };
    });
  }, [posts, activeFilter]);

  const parseAgeToYears = (ageString) => {
    if (!ageString) return 0;
    
    if (typeof ageString === 'number') return ageString;
    
    const str = String(ageString);
    
    const yearMatch = str.match(/(\d+)\s*سال/);
    if (yearMatch) return parseInt(yearMatch[1]);
    
    const monthMatch = str.match(/(\d+)\s*ماه/);
    if (monthMatch) return parseInt(monthMatch[1]) / 12;
    
    const num = parseInt(str);
    if (!isNaN(num)) return num;
    
    return 0;
  };

  const sortAds = (ads) => {
    if (!sortOrder) {
      return ads;
    }
    
    switch (sortOrder) {
      case "newest-post":
        return [...ads].sort((a, b) => b.createdAt - a.createdAt);
      
      case "oldest-post":
        return [...ads].sort((a, b) => a.createdAt - b.createdAt);
      
      case "newest-event":
        return [...ads].sort((a, b) => b.eventDateTime - a.eventDateTime);
      
      case "oldest-event":
        return [...ads].sort((a, b) => a.eventDateTime - b.eventDateTime);
      
      case "recently-updated":
        return [...ads].sort((a, b) => b.updatedAt - a.updatedAt);
      
      default:
        return ads;
    }
  };

  const filteredAds = useMemo(() => {
    const base = normalizedPosts.filter((ad) => {
      const term = search.trim().toLowerCase();
      const matchSearch = !term ||
        ad.name.toLowerCase().includes(term) ||
        ad.desc.toLowerCase().includes(term) ||
        ad.location.toLowerCase().includes(term) ||
        (ad.category && ad.category.toLowerCase().includes(term));

      const matchAnimal = filterAnimal === "all" || ad.category === filterAnimal;
      const matchSex = filterSex === "all" || ad.sex === filterSex;
      const matchCity = filterCity === "all" || ad.city === filterCity;
      
      let matchAge = true;
      if (filterAge !== "all" && ad.age) {
        const ageInYears = parseAgeToYears(ad.age);
        
        switch (filterAge) {
          case "under-1":
            matchAge = ageInYears < 1;
            break;
          case "1-2":
            matchAge = ageInYears >= 1 && ageInYears < 2;
            break;
          case "2-3":
            matchAge = ageInYears >= 2 && ageInYears < 3;
            break;
          case "3-5":
            matchAge = ageInYears >= 3 && ageInYears < 5;
            break;
          case "5-7":
            matchAge = ageInYears >= 5 && ageInYears < 7;
            break;
          case "over-7":
            matchAge = ageInYears >= 7;
            break;
          default:
            matchAge = true;
        }
      }

      let matchCertificate = true;
      let matchVaccination = true;
      let matchSterilization = true;
      
      if (activeFilter === "سرپرستی" || ad.type === "surrender") {
        if (filterHasCertificate !== "all") {
          const hasCert = ad.hasBirthCertificate || ad.originalData?.has_birth_certificate || false;
          matchCertificate = filterHasCertificate === "yes" ? hasCert : !hasCert;
        }
        
        if (filterIsVaccinated !== "all") {
          const isVacc = ad.isVaccinated || ad.originalData?.vaccination || false;
          matchVaccination = filterIsVaccinated === "yes" ? isVacc : !isVacc;
        }
        
        if (filterIsSterilized !== "all") {
          const isSteril = ad.isSterilized || ad.originalData?.steriliz || false;
          matchSterilization = filterIsSterilized === "yes" ? isSteril : !isSteril;
        }
      }

      return matchSearch && matchAnimal && matchSex && matchCity && matchAge && 
             matchCertificate && matchVaccination && matchSterilization;
    });

    const sortedAds = sortAds(base);
    
    return sortedAds;
  }, [normalizedPosts, search, filterAnimal, filterSex, filterCity, filterAge, 
      filterHasCertificate, filterIsVaccinated, filterIsSterilized, activeFilter, sortOrder]);

  const clearAllFilters = () => {
    setFilterAnimal("all");
    setFilterSex("all");
    setFilterCity("all");
    setFilterAge("all");
    setFilterHasCertificate("all");
    setFilterIsVaccinated("all");
    setFilterIsSterilized("all");
    setSortOrder("");
    setSearch("");
    setCurrentPage(1);
  };

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
          className={`filter-button ${activeFilter === "پیدا شده" ? "active" : ""}`}
          onClick={() => setActiveFilter("پیدا شده")}
        >
          پیدا شده
        </div>
        <div
          className={`filter-button ${activeFilter === "گم شده" ? "active" : ""}`}
          onClick={() => setActiveFilter("گم شده")}
        >
          گم شده
        </div>
        <div
          className={`filter-button ${activeFilter === "سرپرستی" ? "active" : ""}`}
          onClick={() => setActiveFilter("سرپرستی")}
        >
          سرپرستی
        </div>
      </div>

      <div className="search-container-all-posts">
        <div className="search-box-all-posts">
          <input
            type="text"
            placeholder="جستجو بر اساس نام، نژاد یا مکان..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <AdvancedFilters
        activeFilter={activeFilter}
        filterAnimal={filterAnimal}
        setFilterAnimal={setFilterAnimal}
        filterSex={filterSex}
        setFilterSex={setFilterSex}
        filterCity={filterCity}
        setFilterCity={setFilterCity}
        filterAge={filterAge}
        setFilterAge={setFilterAge}
        filterHasCertificate={filterHasCertificate}
        setFilterHasCertificate={setFilterHasCertificate}
        filterIsVaccinated={filterIsVaccinated}
        setFilterIsVaccinated={setFilterIsVaccinated}
        filterIsSterilized={filterIsSterilized}
        setFilterIsSterilized={setFilterIsSterilized}
        clearAllFilters={clearAllFilters}
        activeFiltersCount={activeFiltersCount}
      />

      <SortFilters
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {error && <div className="error-message-all-posts">{error}</div>}
      {loading && <div className="loading-message-all-posts">در حال بارگذاری...</div>}

      <div className="ads-grid-all-posts">
        {!loading && filteredAds.length === 0 && (
          <div className="no-results-container-all-posts">
            <div className="no-results-icon-all-posts">
              <img src="/src/assets/icons/search.svg" alt="no results" />
            </div>
            <h3>هیچ آگهی‌ای یافت نشد</h3>
            <p className="no-results-text-all-posts">
              با فیلترهای انتخاب شده، آگهی مناسبی پیدا نشد. لطفا فیلترهای دیگری را امتحان کنید.
            </p>
            <button
              onClick={clearAllFilters}
              className="clear-filters-btn-no-results-all-posts"
            >
              <img src="/src/assets/icons/close.svg" alt="clear" className="clear-icon-all-posts" />
              پاک کردن همه فیلترها
            </button>
          </div>
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
                className={`status-background-all-posts ${
                  ad.status === "پیدا شده"
                    ? "status-found-all-posts"
                    : ad.status === "سرپرستی"
                    ? "status-adoption-all-posts"
                    : "status-missing-all-posts"
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
                  className="location-icon-all-posts"
                  alt="location"
                  src="/src/icons/location.svg"
                />
              </div>
              <div className="calender-container-all-posts">
                <div>{ad.time}</div>
                <img
                  className="calendar-icon-all-posts"
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

      {!loading && filteredAds.length > 0 && totalPages > 1 && (
        <div className="pagination-all-posts">
          <button
            className="pagination-button-all-posts"
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || loading}
          >
            <ChevronRightIcon />
          </button>

          <div className="pagination-pages-all-posts">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-page-button-all-posts ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageClick(page)}
                disabled={loading}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-button-all-posts"
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