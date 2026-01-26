import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdvancedFilters from "../AdvancedFilters";
import SortFilters from "../SortFilters";
import { Pagination } from "../Pagination/Pagination";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import "../../styles/AllPosts.css";
import { config } from "../../config";
import { getPostImage } from "../../utils/postImages";
import { getPetType } from "../../utils/petTypes";
import {
  AGE_TO_BACKEND,
  AGE_VALUES,
  ANIMAL_TO_BACKEND,
  PET_TYPE_VALUES,
  SEX_TO_BACKEND,
  SEX_VALUES,
  SORT_TO_BACKEND,
  YES_NO_TO_BACKEND,
  YES_NO_VALUES,
} from "../../utils/postFilters";

const API_BASE_URL = config.API_BASE_URL;
const API_ENDPOINTS = {
  all: `${API_BASE_URL}/posts/all/`,
  lost: `${API_BASE_URL}/posts/lost-posts/`,
  found: `${API_BASE_URL}/posts/found-posts/`,
  adoption: `${API_BASE_URL}/posts/surrender-posts/`,
};

const ITEMS_PER_PAGE = 6;
const MIN_LOADING_DURATION_MS = 2500;
const LOADING_SCREEN_DELAY_MS = 1200;

const POST_TYPE_TO_BACKEND = {
  lost: "lost",
  "گم شده": "lost",
  found: "found",
  "پیدا شده": "found",
  surrender: "surrender",
  "سرپرستی": "surrender",
  adoption: "surrender",
};

const normalizePostTypeValue = (value) => {
  if (!value) {
    return "";
  }

  const normalized = String(value).trim().toLowerCase();
  return POST_TYPE_TO_BACKEND[normalized] || normalized;
};

const resolvePostType = (post) => {
  if (!post) {
    return "generic";
  }

  const explicit = normalizePostTypeValue(post.post_type || post.type);
  if (explicit === "lost" || explicit === "found" || explicit === "surrender") {
    return explicit;
  }

  if (post.found_time) {
    return "found";
  }

  if (post.lost_time) {
    return "lost";
  }

  if (post.surrender_date || post.has_birth_certificate || post.vaccination || post.steriliz) {
    return "surrender";
  }

  return "generic";
};

const isAllValue = (value) => {
  if (value == null) {
    return true;
  }

  const normalized = String(value).trim().toLowerCase();
  return normalized === "" || normalized === "all" || normalized === "همه";
};

const splitFilterValues = (value) => {
  if (isAllValue(value)) {
    return [];
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const mapFilterValues = (value, mapping, allowedValues = null) => {
  const mapped = splitFilterValues(value).map((item) => {
    const normalized = item.trim();
    const lower = normalized.toLowerCase();
    return mapping[normalized] || mapping[lower] || normalized;
  });

  if (!allowedValues) {
    return mapped.filter(Boolean);
  }

  return mapped.filter((item) => allowedValues.includes(item));
};

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
  const [searchQuery, setSearchQuery] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [skeletonFading, setSkeletonFading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  
  const [filterAnimal, setFilterAnimal] = useState("");
  const [filterSex, setFilterSex] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterAge, setFilterAge] = useState("");
  const [filterHasCertificate, setFilterHasCertificate] = useState("");
  const [filterIsVaccinated, setFilterIsVaccinated] = useState("");
  const [filterIsSterilized, setFilterIsSterilized] = useState("");
  
  const [sortOrder, setSortOrder] = useState("");

  const lastQueryRef = useRef("");
  const isFirstRender = useRef(true);
  const searchInputRef = useRef(null);

  const activeFiltersCount = [
    !isAllValue(filterAnimal),
    !isAllValue(filterSex),
    !isAllValue(filterCity),
    !isAllValue(filterAge),
    !isAllValue(filterHasCertificate),
    !isAllValue(filterIsVaccinated),
    !isAllValue(filterIsSterilized),
  ].filter(Boolean).length;

  const activeEndpoint = useMemo(() => {
    if (activeFilter === "گم شده") {
      return API_ENDPOINTS.lost;
    }
    if (activeFilter === "پیدا شده") {
      return API_ENDPOINTS.found;
    }
    if (activeFilter === "سرپرستی") {
      return API_ENDPOINTS.adoption;
    }
    return API_ENDPOINTS.all;
  }, [activeFilter]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    const term = searchQuery.trim(); 

    if (term) {
      params.set("q", term);
    }

    const sortParam = SORT_TO_BACKEND[sortOrder];
    if (sortParam) {
      params.set("sort", sortParam);
    }

    const petTypes = mapFilterValues(
      filterAnimal,
      ANIMAL_TO_BACKEND,
      PET_TYPE_VALUES
    );
    if (petTypes.length) {
      params.set("pet_type", petTypes.join(","));
    }

    const petSexes = mapFilterValues(filterSex, SEX_TO_BACKEND, SEX_VALUES);
    if (petSexes.length) {
      params.set("pet_sex", petSexes.join(","));
    }

    const cities = splitFilterValues(filterCity);
    if (cities.length) {
      params.set("city", cities.join(","));
    }

    const ageRanges = mapFilterValues(filterAge, AGE_TO_BACKEND, AGE_VALUES);
    if (ageRanges.length) {
      params.set("pet_age_range", ageRanges.join(","));
    }

    if (activeFilter === "سرپرستی") {
      const certificates = mapFilterValues(
        filterHasCertificate,
        YES_NO_TO_BACKEND,
        YES_NO_VALUES
      );
      if (certificates.length) {
        params.set("has_birth_certificate", certificates.join(","));
      }

      const vaccinations = mapFilterValues(
        filterIsVaccinated,
        YES_NO_TO_BACKEND,
        YES_NO_VALUES
      );
      if (vaccinations.length) {
        params.set("vaccination", vaccinations.join(","));
      }

      const sterilizations = mapFilterValues(
        filterIsSterilized,
        YES_NO_TO_BACKEND,
        YES_NO_VALUES
      );
      if (sterilizations.length) {
        params.set("steriliz", sterilizations.join(","));
      }
    }

    return params.toString();
  }, [
    searchQuery, 
    sortOrder,
    filterAnimal,
    filterSex,
    filterCity,
    filterAge,
    filterHasCertificate,
    filterIsVaccinated,
    filterIsSterilized,
    activeFilter,
  ]);

  const normalizedAllPosts = useMemo(() => {
    try {
      if (!Array.isArray(allPosts) || allPosts.length === 0) {
        return [];
      }
      
      return allPosts.map((p) => {
        if (!p) return { id: 'unknown', postTypeLabel: 'نامشخص' };
        
        const postType = resolvePostType(p);
        const postTypeLabel = getPostType(postType);
        
        return {
          id: `${postType}-${p.id || 'unknown'}`,
          postTypeLabel: postTypeLabel,
        };
      });
    } catch (error) {
      console.error("Error in normalizedAllPosts:", error);
      return [];
    }
  }, [allPosts]);

  const filters = useMemo(() => {
    try {
      const normalized = normalizedAllPosts || [];
      
      return [
        { 
          label: "همه", 
          count: allPosts.length || 0
        },
        {
          label: "پیدا شده",
          count: normalized.filter((a) => a?.postTypeLabel === "پیدا شده").length,
        },
        {
          label: "گم شده",
          count: normalized.filter((a) => a?.postTypeLabel === "گم شده").length,
        },
        {
          label: "سرپرستی",
          count: normalized.filter((a) => a?.postTypeLabel === "سرپرستی").length,
        },
      ];
    } catch (error) {
      console.error("Error calculating filters:", error);
      return [
        { label: "همه", count: 0 },
        { label: "پیدا شده", count: 0 },
        { label: "گم شده", count: 0 },
        { label: "سرپرستی", count: 0 },
      ];
    }
  }, [allPosts, normalizedAllPosts]);

  const fetchPosts = async (url, page = 1, query = "") => {
    const startTime = Date.now();
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams(query);
      if (page > 1) {
        params.set("page", page);
      }

      const urlWithParams = params.toString()
        ? `${url}?${params.toString()}`
        : url;
      
      const res = await fetch(urlWithParams);
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
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOADING_DURATION_MS - elapsed);
      if (remaining) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllPostsForCount = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.all);
        if (!res.ok) return;

        const data = await res.json();
        const results = data.results || [];

        let allResults = results;
        let nextUrl = data.next;

        while (nextUrl) {
          const nextRes = await fetch(nextUrl);
          if (!nextRes.ok) break;

          const nextData = await nextRes.json();
          allResults = [...allResults, ...(nextData.results || [])];
          nextUrl = nextData.next;
        }

        setAllPosts(allResults);
      } catch (err) {
        console.error("خطا در دریافت allPosts:", err);
      }
    };

    fetchAllPostsForCount();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchPosts(activeEndpoint, currentPage, queryString);
      return;
    }

    const queryKey = `${activeEndpoint}|${queryString}`;
    
    const oldParams = new URLSearchParams(lastQueryRef.current.split('|')[1] || '');
    const newParams = new URLSearchParams(queryString);
    
    oldParams.delete('page');
    newParams.delete('page');
    
    if (oldParams.toString() !== newParams.toString() && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }
    
    lastQueryRef.current = queryKey;
    fetchPosts(activeEndpoint, currentPage, queryString);
  }, [activeEndpoint, currentPage, queryString]);

  useEffect(() => {
    let introTimer;
    let fadeTimer;

    if (loading) {
      setShowLoadingScreen(true);
      setShowSkeleton(false);
      setSkeletonFading(false);
      introTimer = setTimeout(() => {
        setShowLoadingScreen(false);
        setShowSkeleton(true);
      }, LOADING_SCREEN_DELAY_MS);
    } else {
      setShowLoadingScreen(false);
      setSkeletonFading(true);
      fadeTimer = setTimeout(() => {
        setShowSkeleton(false);
        setSkeletonFading(false);
      }, 350);
    }

    return () => {
      if (introTimer) clearTimeout(introTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [loading]);

  const normalizedPosts = useMemo(() => {
    return posts.map((p) => {
      const postType = resolvePostType(p);
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
      const imageUrl = getPostImage(p);
      
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

  const displayedAds = normalizedPosts;
  const expectedPageCount = useMemo(() => {
    const remaining = pagination.count - (currentPage - 1) * ITEMS_PER_PAGE;
    if (!Number.isFinite(remaining) || remaining <= 0) return ITEMS_PER_PAGE;
    return Math.min(ITEMS_PER_PAGE, remaining);
  }, [pagination.count, currentPage]);

  const skeletonCount = useMemo(() => {
    if (displayedAds.length) return displayedAds.length;
    return expectedPageCount || ITEMS_PER_PAGE;
  }, [displayedAds.length, expectedPageCount]);

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
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleViewDetails = (ad) => {
    const postType =
      ad.postType && ad.postType !== "generic"
        ? ad.postType
        : resolvePostType(ad.originalData);

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

  const handleSearchInputChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchQuery(search);
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setSearch('');
    setSearchQuery('');
    setCurrentPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="all-posts-container">
      <div className="new-post-container-all-posts">
        <div className="main-content-wrapper">
          <div className="posts-main-content-layer visible">
          <header className="posts-header-all-posts">
          <div className="header-content-wrapper">
            <div className="header-title-section">
              <div className="title-icon-wrapper">
                <div className="title-icon-heart">
                  <img
                    className="posts-header-icon-img"
                    src="/src/assets/icons/Advertisements.svg"
                    alt="آگهی‌ها"
                    width="24"
                    height="24"
                  />
                </div>
                <div>
                  <h1 className="posts-title-all-posts">
                    آگهی‌ها
                    <span className="title-gradient-line"></span>
                  </h1>
                  <p className="posts-header-subtext">
                    آگهی‌های گمشده، پیداشده و سرپرستی مسیر رسیدن حیوان‌ها به خانه یا خانواده جدید را می‌سازند؛ با هم به سرانجام این مسیرها کمک کنیم.
                  </p>
                </div>
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
        
        <div className="search-wrapper-post">
          <div className="search-box-inner-post">
            <div className="search-input-container-post">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="جستجو در آگهی‌ها..."
                value={search}
                onChange={handleSearchInputChange}
                onKeyPress={handleKeyPress}
                className="search-input-post"
              />
              
              {search && (
                <button 
                  className="search-clear-btn-post"
                  onClick={handleClearSearch}
                  type="button"
                  title="پاک کردن جستجو"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              
              <button 
                className="search-submit-btn-post"
                onClick={handleSearchSubmit}
                type="button"
                title="جستجو"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15.5 14.5l5 5" strokeLinecap="round"/>
                  <circle cx="10.5" cy="10.5" r="6.5"/>
                </svg>
              </button>
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

        <div
          className={`pet-listings-grid-all-posts ${showSkeleton ? "show-skeleton" : ""} ${
            skeletonFading ? "skeleton-fade-out" : ""
          }`}
        >
          {showLoadingScreen && (
            <div className="inline-loading-holder">
              <LoadingScreen
                title="در حال آماده‌سازی آگهی‌ها"
                subtitle="لطفاً چند لحظه صبر کنید..."
              />
            </div>
          )}
          {displayedAds.length === 0 && !loading && (
            <div className="no-results-container-all-posts">
              <div className="no-results-icon-all-posts">
                <img src="/src/assets/icons/search-n.svg" alt="no results" />
              </div>
              <h3>هیچ آگهی‌ای یافت نشد</h3>
              <p className="no-results-text-all-posts">
                {searchQuery ? `با عبارت "${searchQuery}"` : "با فیلترهای انتخاب شده"}، آگهی مناسبی پیدا نشد.
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

          {showSkeleton && (
            <>
              {Array.from({ length: skeletonCount }).map((_, index) => (
                <div className="pet-listing-card-all-posts skeleton-card-all-posts" key={`skeleton-${index}`}>
                  <div className="pet-listing-image-container-all-posts skeleton-block-all-posts skeleton-image-all-posts"></div>

                  <div className="pet-listing-content-all-posts">
                    <div className="pet-listing-header-all-posts">
                      <div className="pet-listing-info-all-posts">
                        <div className="skeleton-block-all-posts skeleton-title-all-posts"></div>
                        <div className="skeleton-block-all-posts skeleton-subtitle-all-posts"></div>
                      </div>
                      <div className="skeleton-block-all-posts skeleton-pill-all-posts"></div>
                    </div>

                    <div className="skeleton-block-all-posts skeleton-desc-all-posts"></div>
                    <div className="skeleton-block-all-posts skeleton-desc-all-posts short"></div>

                    <div className="pet-details-container-all-posts">
                      <div className="pet-listing-detail-all-posts">
                        <div className="detail-icon-all-posts skeleton-block-all-posts skeleton-icon-all-posts"></div>
                        <div className="skeleton-block-all-posts skeleton-detail-all-posts"></div>
                      </div>

                      <div className="pet-listing-detail-all-posts">
                        <div className="detail-icon-all-posts skeleton-block-all-posts skeleton-icon-all-posts"></div>
                        <div className="skeleton-block-all-posts skeleton-detail-all-posts"></div>
                      </div>
                    </div>

                    <div className="pet-listing-time-all-posts skeleton-time-wrap-all-posts">
                      <div className="time-icon-all-posts skeleton-block-all-posts skeleton-time-icon-all-posts"></div>
                      <div className="skeleton-block-all-posts skeleton-time-text-all-posts"></div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading && displayedAds.map((pet) => {
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

        {displayedAds.length > 0 && totalPages > 1 && !loading && (
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
    </div>
  );
}

