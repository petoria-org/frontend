import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdvancedFilters from "../AdvancedFilters";
import SortFilters from "../SortFilters";
import "../../styles/NewPosts.css";

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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filterAnimal, setFilterAnimal] = useState("all");
  const [filterSex, setFilterSex] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterAge, setFilterAge] = useState("all");
  
  const [filterHasCertificate, setFilterHasCertificate] = useState("all");
  const [filterIsVaccinated, setFilterIsVaccinated] = useState("all");
  const [filterIsSterilized, setFilterIsSterilized] = useState("all");
  
  const [sortOrder, setSortOrder] = useState("");
  const [isSortEnabled, setIsSortEnabled] = useState(true);

  const activeFiltersCount = [
    filterAnimal !== "all",
    filterSex !== "all",
    filterCity !== "all",
    filterAge !== "all",
    filterHasCertificate !== "all",
    filterIsVaccinated !== "all",
    filterIsSterilized !== "all",
  ].filter(Boolean).length;

  const fetchPosts = async (url) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`دریافت داده با خطا مواجه شد: ${res.status}`);

      const data = await res.json();
      const results = Array.isArray(data) ? data : data.results || [];

      setPosts(results);
    } 
    
    catch (err) {
      console.error("خطا در دریافت آگهی‌ها:", err);
      setError("بارگذاری آگهی‌ها موفقیت‌آمیز نبود.");
    } 
    
    finally {
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

    fetchPosts(url);
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
        } 
        
        else if (p.type === "lost" || p.lost_time) {
          status = "گم شده";
          statusLabel = "گم شده";
        } 
        
        else if (p.type === "surrender") {
          status = "سرپرستی";
          statusLabel = "سرپرستی";
        } 
        
        else {
          status = p.status || "active";
          statusLabel = "فعال";
        }
      }

      const categoryMap = {
        dog: "سگ",
        cat: "گربه",
        other: "سایر",
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
    
    return sortedAds.slice(0, 6);
  }, [normalizedPosts, search, filterAnimal, filterSex, filterCity, filterAge, 
      filterHasCertificate, filterIsVaccinated, filterIsSterilized, activeFilter, sortOrder, isSortEnabled]);

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
  };

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    if (newSortOrder !== "none") {
      setIsSortEnabled(true);
    }
  };

  const toggleSortEnabled = () => {
    setIsSortEnabled(!isSortEnabled);
    if (!isSortEnabled) {
      setSortOrder("newest-post"); 
    }
  };

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
    if (!isoOrRelative) return "";
    if (isoOrRelative.includes("پیش") || isoOrRelative === "همین الان") {
      return isoOrRelative;
    }
    const d = new Date(isoOrRelative);
    return isNaN(d) ? isoOrRelative : d.toLocaleDateString('fa-IR');
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
        <div className="search-box-new-posts">
          <input
            type="text"
            placeholder="جستجو بر اساس نام،نژاد یا مکان... "
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

      {error && <div className="error-message-new-posts">{error}</div>}
      {loading && <div className="loading-message-new-posts">در حال بارگذاری...</div>}

      <div className="ads-grid-new-posts">
        {!loading && filteredAds.length === 0 && (
          <div className="no-results-container-new-posts">
            <div className="no-results-icon">
              <img src="/src/assets/icons/search-n.svg" alt="no results" />
            </div>
            <h3>هیچ آگهی‌ای یافت نشد</h3>
            <p className="no-results-text">
              با فیلترهای انتخاب شده، آگهی مناسبی پیدا نشد. لطفا فیلترهای دیگری را امتحان کنید.
            </p>
            <button
              onClick={clearAllFilters}
              className="clear-filters-btn-no-results"
            >
              <img src="/src/assets/icons/close.svg" alt="clear" className="clear-icon" />
              پاک کردن همه فیلترها
            </button>
          </div>
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