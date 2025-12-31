import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdvancedFilters from "../AdvancedFilters";
import SortFilters from "../SortFilters";
import { Pagination } from "../Pagination/Pagination";
import LoadingScreen from "../LoadingScreen/LoadingScreen"; 
import "../../styles/AllPosts.css";
import { config } from "../../config";

const API_BASE_URL = config.API_BASE_URL;
const BACKEND_URL = config.BACKEND_URL;
const API_ENDPOINTS = {
  all: `${API_BASE_URL}/posts/all/`,
  lost: `${API_BASE_URL}/posts/lost-posts/`,
  found: `${API_BASE_URL}/posts/found-posts/`,
  adoption: `${API_BASE_URL}/posts/surrender-posts/`,
};

const DEFAULT_PET_IMAGE = "/src/assets/images/default-pet.png";

const ITEMS_PER_PAGE = 6;

const toJalaliDate = (dateString) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",  
    day: "numeric",
  }).format(new Date(dateString));
};

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

export const getPetType = (type) => {
  switch (type) {
    case "cat":
      return "گربه";
    case "dog":
      return "سگ";
    case "bird":
      return "پرنده";
    case "rabbit":
      return "خرگوش";
    case "hamster":
      return "همستر";
    case "other":
      return "سایر";
    default:
      return "نامشخص";
  }
};

const getPostType = (type) => {
  if (!type) return "نامشخص";
  
  const typeStr = String(type).toLowerCase().trim();
  
  switch (typeStr) {
    case "lost":
    case "گم شده":
      return "گم شده";
    case "found":
    case "پیدا شده":
      return "پیدا شده";
    case "surrender":
    case "سرپرستی":
      return "سرپرستی";
    default:
      return "نامشخص";
  }
};

const LocationIcon = () => (
  <img 
    src="/src/icons/location.svg" 
    alt="location"
    width="16" 
    height="16"
    className="icon-img-all-posts"
  />
);

const CalendarIcon = () => (
  <img 
    src="/src/icons/calendar-2.svg" 
    alt="calendar"
    width="16" 
    height="16"
    className="icon-img-all-posts"
  />
);

const ClockIcon = () => (
  <img 
    src="/src/icons/clock.svg" 
    alt="time"
    width="12" 
    height="12"
    className="icon-img-all-posts"
  />
);

const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

export default function AllPosts() {
  const navigate = useNavigate();
  
  const [activeFilter, setActiveFilter] = useState("همه");
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
  });
  
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filterAnimal, setFilterAnimal] = useState("همه");
  const [filterSex, setFilterSex] = useState("همه");
  const [filterCity, setFilterCity] = useState("همه");
  const [filterAge, setFilterAge] = useState("همه");
  const [filterHasCertificate, setFilterHasCertificate] = useState("همه");
  const [filterIsVaccinated, setFilterIsVaccinated] = useState("همه");
  const [filterIsSterilized, setFilterIsSterilized] = useState("همه");
  
  const [sortOrder, setSortOrder] = useState("");

  const activeFiltersCount = [
    filterAnimal !== "همه",
    filterSex !== "همه",
    filterCity !== "همه",
    filterAge !== "همه",
    filterHasCertificate !== "همه",
    filterIsVaccinated !== "همه",
    filterIsSterilized !== "همه",
  ].filter(Boolean).length;

  const fetchAllPosts = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`دریافت داده با خطا مواجه شد: ${res.status}`);

      const data = await res.json();
      const results = Array.isArray(data) ? data : data.results || [];
      
      return results;
    } catch (err) {
      console.error("خطا در دریافت تمام آگهی‌ها:", err);
      return [];
    }
  };

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

      if (currentPage === 1) {
        let allResults = results;
        let nextUrl = data.next;
        
        while (nextUrl) {
          try {
            const nextRes = await fetch(nextUrl);
            if (!nextRes.ok) break;
            
            const nextData = await nextRes.json();
            const nextResults = nextData.results || [];
            
            allResults = [...allResults, ...nextResults];
            nextUrl = nextData.next;
          } catch (err) {
            console.error("خطا در دریافت صفحه بعد:", err);
            break;
          }
        }
        
        setAllPosts(allResults);
      }
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

  const normalizedAllPosts = useMemo(() => {
    return allPosts.map((p) => {
      const postType = p.post_type || "generic";
      const petType = getPetType(p.pet_type);
      const postTypeLabel = getPostType(postType);
      
      let status = "فعال";
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
        if (postType === "found" || p.found_time) {
          status = "پیدا شده";
          statusLabel = "پیدا شده";
        } 
        
        else if (postType === "lost" || p.lost_time) {
          status = "گم شده";
          statusLabel = "گم شده";
        } 
        
        else if (postType === "surrender") {
          status = "سرپرستی";
          statusLabel = "سرپرستی";
        } 
        
        else {
          status = p.status || "فعال";
          statusLabel = "فعال";
        }
      }

      return {
        id: `${postType}-${p.id}`,
        postTypeLabel: postTypeLabel,
      };
    });
  }, [allPosts, activeFilter]);

  const normalizedPosts = useMemo(() => {
    return posts.map((p) => {
      const postType = p.post_type || "generic";
      const petType = getPetType(p.pet_type);
      const postTypeLabel = getPostType(postType);
      
      let status = "فعال";
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
        if (postType === "found" || p.found_time) {
          status = "پیدا شده";
          statusLabel = "پیدا شده";
        } 
        
        else if (postType === "lost" || p.lost_time) {
          status = "گم شده";
          statusLabel = "گم شده";
        } 
        
        else if (postType === "surrender") {
          status = "سرپرستی";
          statusLabel = "سرپرستی";
        } 
        
        else {
          status = p.status || "فعال";
          statusLabel = "فعال";
        }
      }

      const breed = p.breed || "";
      const locationText = p.location?.readable || p.location || "موقعیت نامشخص";
      const imageUrl = p.thumbnail ? `${BACKEND_URL}${p.thumbnail}` : DEFAULT_PET_IMAGE;
      
      const timeText = postType === "lost" ? toJalaliDate(p.lost_time) : 
                      postType === "found" ? toJalaliDate(p.found_time) : 
                      toJalaliDate(p.updated_at);
      
      const postTimeText = toJalaliDate(p.updated_at);

      const createdAt = p.created_at ? new Date(p.created_at) : new Date();
      const updatedAt = p.updated_at ? new Date(p.updated_at) : createdAt;
      const eventDate = p.lost_time || p.found_time || p.surrender_date || p.created_at;
      const eventDateTime = eventDate ? new Date(eventDate) : createdAt;

      return {
        id: `${postType}-${p.id}`,
        rawId: p.id,
        name: p.pet_name || p.title || "بدون نام",
        breed: breed,
        type: petType,
        postType: postType,
        postTypeLabel: postTypeLabel,
        status: status,
        statusLabel: statusLabel,
        image: imageUrl,
        time: timeText,
        location: locationText,
        desc: p.description || "",
        postTime: postTimeText,
        relativeTime: calculateRelativeTime(p.updated_at),
        createdAt: createdAt,
        updatedAt: updatedAt,
        eventDateTime: eventDateTime,
        originalData: p,
        pet_type: p.pet_type,
        sex: p.sex || (p.pet_sex === "male" ? "نر" : p.pet_sex === "female" ? "ماده" : null),
        age: p.age || p.pet_age || null,
        hasBirthCertificate: p.has_birth_certificate || false,
        vaccination: p.vaccination || false,
        steriliz: p.steriliz || false,
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
        (ad.type && ad.type.toLowerCase().includes(term));

      const matchAnimal = filterAnimal === "همه" || ad.type === filterAnimal;
      const matchSex = filterSex === "همه" || ad.sex === filterSex;
      const matchCity = filterCity === "همه" || ad.location === filterCity;
      
      let matchAge = true;
      if (filterAge !== "همه" && ad.age) {
        const ageInYears = parseAgeToYears(ad.age);
        
        switch (filterAge) {
          case "زیر 1 سال":
            matchAge = ageInYears < 1;
            break;
          case "1-2 سال":
            matchAge = ageInYears >= 1 && ageInYears < 2;
            break;
          case "2-3 سال":
            matchAge = ageInYears >= 2 && ageInYears < 3;
            break;
          case "3-5 سال":
            matchAge = ageInYears >= 3 && ageInYears < 5;
            break;
          case "5-7 سال":
            matchAge = ageInYears >= 5 && ageInYears < 7;
            break;
          case "بالای 7 سال":
            matchAge = ageInYears >= 7;
            break;
          default:
            matchAge = true;
        }
      }

      let matchCertificate = true;
      let matchVaccination = true;
      let matchSterilization = true;
      
      if (activeFilter === "سرپرستی" || ad.postType === "surrender") {
        if (filterHasCertificate !== "همه") {
          const hasCert = ad.hasBirthCertificate || ad.originalData?.has_birth_certificate || false;
          matchCertificate = filterHasCertificate === "دارد" ? hasCert : !hasCert;
        }
        
        if (filterIsVaccinated !== "همه") {
          const isVacc = ad.vaccination || ad.originalData?.vaccination || false;
          matchVaccination = filterIsVaccinated === "دارد" ? isVacc : !isVacc;
        }
        
        if (filterIsSterilized !== "همه") {
          const isSteril = ad.steriliz || ad.originalData?.steriliz || false;
          matchSterilization = filterIsSterilized === "دارد" ? isSteril : !isSteril;
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
    setFilterAnimal("همه");
    setFilterSex("همه");
    setFilterCity("همه");
    setFilterAge("همه");
    setFilterHasCertificate("همه");
    setFilterIsVaccinated("همه");
    setFilterIsSterilized("همه");
    setSortOrder("");
    setSearch("");
    setCurrentPage(1);
  };

  const handleViewDetails = (ad) => {
    const postType = ad.postType || "generic";

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

  const filters = [
    { 
      label: "همه", 
      count: allPosts.length 
    },
    {
      label: "پیدا شده",
      count: normalizedAllPosts.filter((a) => a.postTypeLabel === "پیدا شده").length,
    },
    {
      label: "گم شده",
      count: normalizedAllPosts.filter((a) => a.postTypeLabel === "گم شده").length,
    },
    {
      label: "سرپرستی",
      count: normalizedAllPosts.filter((a) => a.postTypeLabel === "سرپرستی").length,
    },
  ];

return (
  <div className="new-post-container-all-posts">
    <div className="main-content-wrapper">
      
      {loading && (
        <div className="loading-background-overlay">
          <div className="white-3d-back-layer">
            <div className="Three-d-layer-border"></div>
            <div className="Three-d-layer-content">
              <div className="Three-d-layer-pattern"></div>
              <div className="loading-center-container-posts">
                <LoadingScreen
                title="در حال بارگذاری آگهی‌ها" 
                subtitle="آگهی‌های مرتبط در حال آماده‌سازی هستند..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={`posts-main-content-layer ${loading ? 'hidden' : 'visible'}`}>
        <header className="posts-header-all-posts">
          <div className="header-content-wrapper">
            <div className="header-title-section">
              <div className="title-icon-wrapper">
                <div className="title-icon-heart">
                  <HeartIcon />
                </div>
                <h1 className="posts-title-all-posts">
                  آگهی‌ها
                  <span className="title-gradient-line"></span>
                </h1>
              </div>
            </div>
          </div>
          <div className="header-decoration-simple">
            <div className="decoration-line-main"></div>
            <div className="decoration-dots-container">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="decoration-dot-simple" style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
          </div>
        </header>

        <div className="posts-categories-tabs-all-posts">
          <div className="posts-categories-list-all-posts">
            {filters.map((filter) => (
              <button
                key={filter.label}
                className={`posts-category-tab-all-posts ${activeFilter === filter.label ? "active-all-posts" : ""}`}
                onClick={() => setActiveFilter(filter.label)}
              >
                <div className="posts-category-content-all-posts">
                  <span className="posts-category-label-all-posts">{filter.label}</span>
                  <div className="posts-category-count-all-posts">
                    <span>{filter.count}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="search-wrapper">
          <div className="search-box-inner" onClick={() => document.querySelector('.search-input-container-landing input')?.focus()}>
            <div className="search-input-container">
              <div className="search-icon-box">
                <img 
                  src="/src/assets/icons/search-normal.svg" 
                  alt="search"
                  width="20"
                  height="20"
                  className="search-icon-img"
                />
              </div>
              <input
                type="text"
                placeholder="جستجو در آگهی‌ها..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              
              {search && (
                <button 
                  className="search-clear-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearch('');
                  }}
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
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

        <div className="pet-listings-grid-all-posts">
          {filteredAds.length === 0 && !loading && (
            <div className="no-results-container-all-posts">
              <div className="no-results-icon-all-posts">
                <img src="/src/assets/icons/search-n.svg" alt="no results" />
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

          {filteredAds.map((pet) => {
            const getStatusClass = () => {
              if (pet.status === 'پیدا شده') return 'found-all-posts';
              if (pet.status === 'گم شده') return 'lost-all-posts';
              if (pet.status === 'سرپرستی') return 'adoption-all-posts';
              return 'active-all-posts';
            };

            const statusClass = getStatusClass();
            
            return (
              <div className="pet-listing-card-all-posts" key={pet.id}>
                <div className="pet-listing-image-container-all-posts">
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className="pet-listing-image-all-posts"
                  />
                  
                  <div className={`pet-listing-status-all-posts ${statusClass}`}>
                    <span className="status-label-all-posts">{pet.statusLabel}</span>
                    <div className="status-pulse-all-posts"></div>
                  </div>
                  
                  <div className="image-hover-glass-overlay-all-posts">
                    <button
                      className="image-glass-view-btn-all-posts"
                      onClick={() => handleViewDetails(pet)}
                    >
                      <span className="image-glass-btn-text-all-posts">مشاهده جزئیات</span>
                      <svg className="image-glass-btn-icon-all-posts" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="pet-listing-content-all-posts">
                  <div className="pet-listing-header-all-posts">
                    <div className="pet-listing-info-all-posts">
                      <h3 className="pet-listing-name-all-posts">{pet.name}</h3>
                      <p className="pet-listing-subtitle-all-posts">{pet.breed || "نامشخص"}</p>
                    </div>
                    <div className="pet-listing-type-all-posts">
                      {pet.type}
                    </div>
                  </div>

                  <p className="pet-listing-description-all-posts">{pet.desc}</p>

                  <div className="pet-details-container-all-posts">
                    <div className="pet-listing-detail-all-posts">
                      <div className="detail-icon-all-posts">
                        <LocationIcon />
                      </div>
                      <span className="pet-listing-detail-text-all-posts">{pet.location}</span>
                    </div>

                    <div className="pet-listing-detail-all-posts">
                      <div className="detail-icon-all-posts">
                        <CalendarIcon />
                      </div>
                      <span className="pet-listing-detail-text-all-posts">{pet.time}</span>
                    </div>
                  </div>

                  <div className="pet-listing-time-all-posts">
                    <div className="time-icon-all-posts">
                      <ClockIcon />
                    </div>
                    <span className="pet-listing-time-text-all-posts">{pet.postTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAds.length > 0 && totalPages > 1 && !loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageClick}
            onPrevious={handlePreviousPage}
            onNext={handleNextPage}
          />
        )}
        
      </div>
      
    </div>
  </div>
);
}