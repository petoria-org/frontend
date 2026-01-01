import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/NewPosts.css";
import api from "../../Services/api";
import { getPostImage } from "../../utils/postImages";

const API_ENDPOINTS = {
  all: "posts/all/",
  lost: "posts/lost-posts/",
  found: "posts/found-posts/",
  adoption: "posts/surrender-posts/",
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

const LocationIcon = () => (
  <img 
    src="/src/icons/location.svg" 
    alt="location"
    width="16" 
    height="16"
    className="icon-img-landing"
  />
);

const CalendarIcon = () => (
  <img 
    src="/src/icons/calendar-2.svg" 
    alt="calendar"
    width="16" 
    height="16"
    className="icon-img-landing"
  />
);

const ArrowIcon = () => (
  <svg className="arrow-icon-landing" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
  </svg>
);

export default function NewPosts() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("همه");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

    

  const fetchPosts = async (url) => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get(url);
      const data = res.data;
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
      let status = "فعال";
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
        if (p.post_type === "found" || p.found_time) {
          status = "پیدا شده";
          statusLabel = "پیدا شده";
        } else if (p.psot_type === "lost" || p.lost_time) {
          status = "گم شده";
          statusLabel = "گم شده";
        } else if (p.post_type === "surrender") {
          status = "سرپرستی";
          statusLabel = "سرپرستی";
        } else {
          status = p.status || "فعال";
          statusLabel = "فعال";
        }
      }

      const categoryMap = {
        dog: "سگ",
        cat: "گربه",
        bird: "پرنده",
        rabbit: "خرگوش",
        hamster: "همستر",
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
        id: `${p.post_type || "generic"}-${p.id}`,
        rawId: p.id,
        name: p.pet_name || p.title || "بدون نام",
        desc: p.description || "",
        category: categoryMap[p.pet_type] || "سایر",
        status,
        statusLabel,
        location: locationText,
        city: locationText,
        time: calculateRelativeTime(p.created_at || p.updated_at),
        image: getPostImage(p),
        type: p.post_type || "generic",
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

  const displayedAds = useMemo(() => {
    return normalizedPosts.slice(0, 6);
  }, [normalizedPosts]);

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

  const filters = [
    { label: "همه", count: normalizedPosts.length },
    {
      label: "پیدا شده",
      count: normalizedPosts.filter((a) => a.status === "پیدا شده").length,
    },
    {
      label: "گم شده",
      count: normalizedPosts.filter((a) => a.status === "گم شده").length,
    },
    {
      label: "سرپرستی",
      count: normalizedPosts.filter((a) => a.status === "سرپرستی").length,
    },
  ];

  return (
    <div className="new-posts-page-landing">
      <main>
        <section className="posts-section-landing">
          <div className="posts-container-landing">
            <header className="posts-header-landing">
              <h1 className="posts-title-landing">مرور آگهی‌ها</h1>
              <p className="posts-subtitle-landing">مرور آگهی‌های حیوانات</p>
            </header>

            <div className="posts-categories-tabs-landing">
              <div className="posts-categories-list-landing">
                {filters.map((filter) => (
                  <button
                    key={filter.label}
                    className={`posts-category-tab-landing ${activeFilter === filter.label ? "active-landing" : ""}`}
                    onClick={() => setActiveFilter(filter.label)}
                  >
                    <div className="posts-category-content-landing">
                      <span className="posts-category-label-landing">{filter.label}</span>
                      <div className="posts-category-count-landing">
                        <span>{filter.count}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="error-message-landing">{error}</div>}
            {loading && <div className="loading-message-landing">در حال بارگذاری...</div>}

            <div className="posts-grid-landing">
              {!loading && displayedAds.length === 0 && (
                <div className="no-results-container-landing">
                  <div className="no-results-icon-landing">
                    <img src="/src/assets/icons/search-n.svg" alt="no results" />
                  </div>
                  <h3>هیچ آگهی‌ای یافت نشد</h3>
                  <p className="no-results-text-landing">
                    در حال حاضر آگهی‌ای برای نمایش وجود ندارد.
                  </p>
                </div>
              )}

              {displayedAds.map((ad) => {
                const getStatusClass = () => {
                  if (ad.status === 'پیدا شده') return 'found-landing';
                  if (ad.status === 'گم شده') return 'lost-landing';
                  if (ad.status === 'سرپرستی') return 'adoption-landing';
                  return 'active-landing';
                };

                const statusClass = getStatusClass();
                
                return (
                  <div className="post-card-landing" key={ad.id}>
                    <div className="post-image-container-landing">
                      <img className="post-image-landing" src={ad.image} alt={ad.name} />
                      
                      <div className={`pet-listing-status-landing ${statusClass}`}>
                        <span className="status-label-landing">{ad.statusLabel}</span>
                        <div className="status-pulse-landing"></div>
                      </div>
                    </div>

                    <div className="post-content-landing">
                      <div className="post-header-landing">
                        <div className="post-info-landing">
                          <h3 className="post-name-landing">{ad.name}</h3>
                          <p className="post-subtitle-landing">{ad.category}</p>
                        </div>
                        <div className="post-type-landing">
                          {ad.category}
                        </div>
                      </div>

                      <p className="post-description-landing">{ad.desc}</p>

                      <div className="post-details-container-landing">
                        <div className="post-detail-landing">
                          <div className="detail-icon-landing">
                            <LocationIcon />
                          </div>
                          <span className="post-detail-text-landing">{ad.location}</span>
                        </div>

                        <div className="post-detail-landing">
                          <div className="detail-icon-landing">
                            <CalendarIcon />
                          </div>
                          <span className="post-detail-text-landing">{formatDate(ad.time)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="post-action-buttons-landing">
                      <button
                        className="view-details-btn-landing"
                        onClick={() => handleViewDetails(ad)}
                      >
                        <span className="btn-glow-landing"></span>
                        <span className="border-animation-landing"></span>
                        مشاهده جزئیات
                        <svg className="btn-icon-landing" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="show-more-container-landing">
              <button
                className="show-more-btn-landing"
                onClick={() => navigate("/posts")}
              >
                <span className="pulse-effect-landing"></span>
                <span className="glowing-border-landing"></span>
                مشاهده بیشتر
                <svg className="arrow-icon-landing" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}