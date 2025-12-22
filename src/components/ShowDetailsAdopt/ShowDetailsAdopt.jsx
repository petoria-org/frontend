import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HeartIcon from "../../assets/icons/heart.svg";
import LocationIcon from "../../assets/icons/location.svg";
import GenderIcon from "../../assets/icons/tick-circle.svg";
import AgeIcon from "../../assets/icons/clock.svg";
import PetIcon from "../../assets/icons/pet.svg";
import BackIcon from "../../assets/icons/arrow-left.svg";
import ContactInfoIcon from "../../assets/icons/stickynote.svg";
import PetImage from "../../assets/images/shivvava.png";
import "../../styles/ShowDetailsAdopt.css";

const HealthToggle = ({ checked, disabled = false, label }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`health-toggle ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}
      disabled={true}
      tabIndex={-1}
    >
      <span className="switch-thumb" />
    </button>
  );
};

export const ShowDetailsAdopt = () => {
  const [isAdoptionPost, setIsAdoptionPost] = useState(false);
  const [healthStatus, setHealthStatus] = useState({
    has_birth_certificate: false,
    vaccination: false,
    steriliz: false
  });
  
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: ""
  });
  
  const [petDetails, setPetDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDefaultImage, setShowDefaultImage] = useState(false);
  const [postData, setPostData] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (location.state?.postData) {
      const data = location.state.postData;
      setPostData(data);
      initializeData(data);
    } 
    
    else {
      const postId = new URLSearchParams(window.location.search).get('id');
      if (postId) {
        fetchPostDetails(postId);
      } 
      
      else {
        setLoading(false);
      }
    }
  }, [location]);

  const initializeData = (data) => {
    const isAdoption = data.type === "surrender" || 
                      data.originalData?.type === "surrender" ||
                      location.pathname.includes("surrender");
    
    setIsAdoptionPost(isAdoption);
    
    const details = [
      {
        label: "نوع حیوان",
        value: data.pet_type === "dog" ? "سگ" : 
               data.pet_type === "cat" ? "گربه" : "سایر",
        icon: PetIcon,
      },
      {
        label: "نژاد",
        value: data.breed || data.originalData?.breed || "نامشخص",
        icon: HeartIcon,
      },
      {
        label: "سن",
        value: data.pet_age ? `${data.pet_age} سال` : 
               data.originalData?.pet_age ? `${data.originalData.pet_age} سال` : "نامشخص",
        icon: AgeIcon,
      },
      {
        label: "جنسیت",
        value: data.pet_sex === "male" ? "نر" : 
               data.pet_sex === "female" ? "ماده" : "نامشخص",
        icon: GenderIcon,
      },
    ];
    
    setPetDetails(details);
    
    if (isAdoption) {
      const newHealthStatus = {
        has_birth_certificate: data.has_birth_certificate || 
                              data.originalData?.has_birth_certificate || 
                              false,
        vaccination: data.vaccination || 
                    data.originalData?.vaccination || 
                    false,
        steriliz: data.steriliz || 
                 data.originalData?.steriliz || 
                 false,
      };
      setHealthStatus(newHealthStatus);
    } 
    else {
      setHealthStatus({
        has_birth_certificate: false,
        vaccination: false,
        steriliz: false
      });
    }
    
    const contactEmail = data.contact_email || 
                        data.user_email || 
                        data.originalData?.contact_email ||
                        data.originalData?.user_email ||
                        (data.contact_phone ? `تماس: ${data.contact_phone}` : "");
    
    setContactInfo({
      name: data.contact_name || 
            data.user_name || 
            data.originalData?.contact_name ||
            data.originalData?.user_name ||
            "",
      email: contactEmail || ""
    });

    const hasImage = data.pet_image && 
                    data.pet_image !== "null" && 
                    data.pet_image !== "";
    
    setShowDefaultImage(!hasImage);
    setLoading(false);
  };

  const fetchPostDetails = async (id) => {
    try {
      setLoading(true);
      
      let url = "";
      let postType = "";
      
      if (window.location.pathname.includes("lost")) {
        url = `/posts/api/lost-posts/${id}/`;
        postType = "lost";
      } else if (window.location.pathname.includes("found")) {
        url = `/posts/api/found-posts/${id}/`;
        postType = "found";
      } else if (window.location.pathname.includes("surrender") || 
                 window.location.pathname.includes("adoption")) {
        url = `/posts/api/surrender-posts/${id}/`;
        postType = "surrender";
        setIsAdoptionPost(true);
      } else {
        url = `/posts/all/${id}/`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("خطا در دریافت اطلاعات");
      
      const data = await response.json();
      initializeData({...data, type: postType});
    } catch (error) {
      console.error("خطا در دریافت جزئیات پست:", error);
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (document.referrer.includes('/posts') || location.state?.fromPosts) {
      navigate(-1);
    } 
    
    else {
      navigate('/posts'); 
    }
  };

  const handleStartChat = () => {
    console.log("شروع گفتگو", { contactInfo, postData });
  };

  if (loading) {
    return (
      <div className="show-details-container loading">
        <div className="loading-message">در حال بارگذاری جزئیات...</div>
      </div>
    );
  }

  const getStatusText = () => {
    if (isAdoptionPost) return "سرپرستی";
    
    const type = postData?.type || 
                postData?.originalData?.type || 
                "";
    
    switch(type) {
      case "lost":
        return "گم شده";
      case "found":
        return "پیدا شده";
      default:
        return "آگهی";
    }
  };

  return (
    <div className="show-details-container">
      <div className="back-button-container">
        <button 
          onClick={handleBackClick}
          className="back-button"
        >
          <span className="back-text">بازگشت به لیست آگهی ها</span>
          <img src={BackIcon} alt="بازگشت" className="back-icon" />
        </button>
      </div>

      <div className="main-card">
        <div className="card-content-wrapper">
          <div className="card-image-container">
            {showDefaultImage ? (
              <div className="no-image-placeholder">
                <div className="placeholder-icon">🐾</div>
                <div className="placeholder-text">تصویر موجود نیست</div>
              </div>
            ) : (
              <img
                className="card-image"
                alt="Pet"
                src={PetImage}
              />
            )}
            <div className="card-badge">
              <span className="badge-text">
                {getStatusText()}
              </span>
            </div>
          </div>

          <div className="content-section">
            <h1 className="pet-name-show-details">
              {postData?.pet_name || 
               postData?.title || 
               postData?.originalData?.pet_name || 
               "بدون نام"}
            </h1>

            <div className="details-grid">
              {petDetails.map((detail, index) => (
                <div 
                  key={index} 
                  className="detail-item"
                >
                  <div className="detail-text">
                    <div className="detail-value">
                      {detail.value}
                    </div>
                    <div className="detail-label">
                      {detail.label}
                    </div>
                  </div>
                  <img
                    src={detail.icon}
                    alt={detail.label}
                    className="detail-icon"
                  />
                </div>
              ))}
            </div>

            <div className="location-item">
              <div className="detail-text">
                <div className="detail-value">
                  {postData?.location?.readable || 
                   postData?.location || 
                   postData?.originalData?.location?.readable ||
                   postData?.originalData?.location ||
                   "مکان نامشخص"}
                </div>
                <div className="detail-label">
                  مکان
                </div>
              </div>
              <img src={LocationIcon} alt="مکان" className="detail-icon" />
            </div>

            <section className="section">
              <h2 className="section-title-show-details">
                بیماری ها
              </h2>
              <div className="diseases-content">
                {postData?.diseases || 
                 postData?.Specific_symptoms || 
                 postData?.originalData?.diseases ||
                 "این حیوان هیچ بیماری خاصی ندارد."}
              </div>
            </section>

            {isAdoptionPost && (
              <section className="section">
                <h2 className="section-title-show-details">
                  وضعیت سلامت
                </h2>
                <div className="toggles-container">
                  <div className="toggle-item">
                    <HealthToggle
                      checked={healthStatus.has_birth_certificate}
                      disabled={false}
                      label="دارای شناسنامه"
                    />
                    <span className="toggle-label">
                      دارای شناسنامه
                    </span>
                  </div>
                  <div className="toggle-item">
                    <HealthToggle
                      checked={healthStatus.vaccination}
                      disabled={false}
                      label="واکسینه شده"
                    />
                    <span className="toggle-label">
                      واکسینه شده
                    </span>
                  </div>
                  <div className="toggle-item">
                    <HealthToggle
                      checked={healthStatus.steriliz}
                      disabled={false}
                      label="عقیم شده"
                    />
                    <span className="toggle-label">
                      عقیم شده
                    </span>
                  </div>
                </div>
              </section>
            )}

            <section className="section">
              <h2 className="section-title-show-details">
                توضیحات
              </h2>
              <div className="description-content">
                {postData?.description || 
                 postData?.originalData?.description || 
                 "توضیحاتی برای این آگهی ثبت نشده است."}
              </div>
            </section>

            <section className="contact-section">
              <div className="contact-container">
                <div className="contact-header">
                  <img src={ContactInfoIcon} alt="اطلاعات تماس" className="contact-icon-show-details" />
                  <h2 className="contact-title">
                    اطلاعات تماس
                  </h2>
                </div>

                <div className="contact-fields">
                  <div className="contact-field">
                    <label className="field-label">
                      ثبت کننده آگهی
                    </label>
                    <input
                      type="text"
                      placeholder="نام و نام خانوادگی"
                      value={contactInfo.name}
                      readOnly
                      className="contact-input readonly"
                    />
                  </div>
                  <div className="contact-field">
                    <label className="field-label">
                      ایمیل
                    </label>
                    <input
                      type="email"
                      placeholder="آدرس ایمیل"
                      value={contactInfo.email}
                      readOnly
                      className="contact-input readonly"
                    />
                  </div>
                </div>

                <p className="contact-note">
                  اطلاعات تماس فقط برای ارتباط با ثبت کننده آگهی است
                </p>
              </div>
            </section>

            <button 
              onClick={handleStartChat}
              className="start-chat-button"
            >
              شروع گفتگو
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};