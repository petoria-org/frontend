import React from 'react';
import { 
  PawPrint, 
  Heart,
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

import "../../styles/Footer.css"

const getQuickLinks = () => {
  return [
    { 
      label: 'صفحه اصلی', 
      page: 'home',
      icon: '/src/assets/icons/house.svg'
    },
    { 
      label: 'جستجوی آگهی‌ها', 
      page: 'ads',
      icon: '/src/assets/icons/search-normal.svg'
    },
    { 
      label: 'ثبت آگهی', 
      page: 'new-post',
      icon: '/src/assets/icons/document-text.svg'
    },
    { 
      label: 'داستان‌های موفق', 
      page: 'happy-tales',
      icon: '/src/assets/icons/heart.svg'
    },
    { 
      label: 'پیام‌رسانی', 
      page: 'chats',
      icon: '/src/assets/icons/message.svg'
    },
  ];
};

const getAccountLinks = () => {
  return [
    { 
      label: 'پروفایل من', 
      page: 'profile',
      icon: '/src/assets/icons/user.svg'
    },
    { 
      label: 'ورود به حساب', 
      page: 'login',
      icon: '/src/assets/icons/login.svg'
    },
    { 
      label: 'ثبت‌نام', 
      page: 'signup',
      icon: '/src/assets/icons/user-add.svg'
    },
  ];
};

const getContactInfo = () => {
  return {
    email: 'petoria58@gmail.com',
    emailIcon: '/src/assets/icons/email.svg'
  };
};

const PAGE_ROUTE_MAP = {
  home: "/",
  ads: "/posts",
  "new-post": "/create-ad",
  "happy-tales": "/success-stories",
  chats: "/chats",
  profile: "/user-profile",
  login: "/login",
  signup: "/signup",
};

const handleFooterNavigation = (navigate, setCurrentPage, page) => {
  const target = PAGE_ROUTE_MAP[page] || "/";
  if (setCurrentPage && typeof setCurrentPage === "function") {
    setCurrentPage(page);
  }
  navigate(target);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const getStats = () => {
  return [
    { value: '۱۲۰۰+', label: 'نجات موفق' },
    { value: '۵۰۰۰+', label: 'کاربر فعال' },
    { value: '۵۰+', label: 'شهر' },
    { value: '۱۰۰+', label: 'همکار' },
  ];
};

const initializePawAnimations = () => {
  const paws = document.querySelectorAll('.floating-paw');
  paws.forEach((paw, index) => {
    paw.style.animationDelay = `${index * 0.8}s`;
  });
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const Icon = ({ src, alt, className = "", fallback = null }) => {
  const [error, setError] = React.useState(false);

  if (error && fallback) {
    return fallback;
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

export const Footer = ({ setCurrentPage }) => {
  const navigate = useNavigate();
  const pawContainerRef = React.useRef(null);
  const pawElementsRef = React.useRef([]);
  const previousPositionsRef = React.useRef([]);
  
  React.useEffect(() => {
    initializePawAnimations();

    const initializeFloatingPaws = () => {
      if (!pawContainerRef.current) return;
  
      pawElementsRef.current.forEach(paw => {
        if (paw && paw.parentNode) {
          paw.parentNode.removeChild(paw);
        }
      });
      pawElementsRef.current = [];
      previousPositionsRef.current = [];
      const PAW_COUNT = 3;

      const createPawElement = (index) => {
        const paw = document.createElement('div');
        paw.className = 'floating-paw-icon';
        
        const img = document.createElement('img');
        img.src = '/src/assets/icons/pet.svg';
        img.alt = '';
        
        paw.appendChild(img);
        pawContainerRef.current.appendChild(paw);

        const size = 20 + Math.random() * 40;
        paw.style.width = `${size}px`;
        paw.style.height = `${size}px`;

        const hue = Math.floor(Math.random() * 60 - 30);
        const brightness = 0.8 + Math.random() * 0.4;
        paw.style.filter = `brightness(${brightness}) invert(1) drop-shadow(0 6px 15px rgba(0, 0, 0, 0.2)) hue-rotate(${hue}deg)`;

        setPawPosition(paw, index);

        const duration = 8 + Math.random() * 7;
        const delay = index * 2 + Math.random() * 3;
        paw.style.animation = `pawLifecycle ${duration}s ease-in-out ${delay}s infinite`;

        pawElementsRef.current.push(paw);

        const handleAnimationIteration = () => {
          setPawPosition(paw, index);
        };
        
        paw.addEventListener('animationiteration', handleAnimationIteration);

        paw._animationHandler = handleAnimationIteration;
        paw._pawIndex = index;
      };
      
      for (let i = 0; i < PAW_COUNT; i++) {
        createPawElement(i);
      }
    };
    
    const setPawPosition = (paw, pawIndex) => {
      let top, left;
      let attempts = 0;
      const MAX_ATTEMPTS = 50;
      
      const zones = [
        {
          topMin: 15, topMax: 50,
          leftMin: 3, leftMax: 15
        },
        {
          topMin: 55, topMax: 85,
          leftMin: 40, leftMax: 60
        },
        {
          topMin: 20, topMax: 50,
          leftMin: 80, leftMax: 120
        }
      ];
      
      if (pawIndex < zones.length) {
        const zone = zones[pawIndex];
        top = zone.topMin + Math.random() * (zone.topMax - zone.topMin);
        left = zone.leftMin + Math.random() * (zone.leftMax - zone.leftMin);
      } else {
        top = 15 + Math.random() * 70;
        left = 10 + Math.random() * 80;
      }
      
      let tooClose = false;
      do {
        tooClose = false;
        attempts++;
        
        for (const pos of previousPositionsRef.current) {
          const distance = Math.sqrt(
            Math.pow(top - pos.top, 2) + 
            Math.pow(left - pos.left, 2)
          );
          
          if (distance < 25) {
            tooClose = true;
            if (pawIndex < zones.length) {
              const zone = zones[pawIndex];
              top = zone.topMin + Math.random() * (zone.topMax - zone.topMin);
              left = zone.leftMin + Math.random() * (zone.leftMax - zone.leftMin);
            } else {
              top = 15 + Math.random() * 70;
              left = 10 + Math.random() * 80;
            }
            break;
          }
        }
      } while (tooClose && attempts < MAX_ATTEMPTS);
      
      const newPosition = { top, left, index: pawIndex };
      const existingIndex = previousPositionsRef.current.findIndex(p => p.index === pawIndex);
      if (existingIndex >= 0) {
        previousPositionsRef.current[existingIndex] = newPosition;
      } else {
        previousPositionsRef.current.push(newPosition);
      }
      
      if (previousPositionsRef.current.length > 3) {
        previousPositionsRef.current.shift();
      }
      
      paw.style.top = `${top}%`;
      paw.style.left = `${left}%`;
      paw.style.opacity = '0';
      
      const rotation = Math.random() * 20 - 10;
      paw.style.transform = `translateY(0) scale(1) rotate(${rotation}deg)`;
      
      paw.offsetHeight;
    };
    
    initializeFloatingPaws();
    
    return () => {
      pawElementsRef.current.forEach(paw => {
        if (paw && paw._animationHandler) {
          paw.removeEventListener('animationiteration', paw._animationHandler);
        }
      });
    };
  }, []);

  const contactInfo = getContactInfo();
  const stats = getStats();
  const quickLinks = getQuickLinks();
  const accountLinks = getAccountLinks();

  return (
    <footer className="footer" dir="rtl">
      <div className="footer-background">
        <div className="background-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        {[...Array(5)].map((_, i) => {
          const positions = [
            { left: '10%', top: '25%' },
            { left: '30%', top: '65%' },
            { left: '50%', top: '35%' },
            { left: '70%', top: '75%' },
            { left: '90%', top: '45%' },
          ];
          
          return (
            <div
              key={`static-paw-${i}`}
              className="floating-paw"
              style={{
                left: positions[i]?.left || `${20 + i * 20}%`,
                top: positions[i]?.top || `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.8}s`,
                opacity: 0.04 + (i * 0.01),
              }}
            >
              <PawPrint className="paw-icon" />
            </div>
          );
        })}
        
        <div className="paw-container" ref={pawContainerRef}></div>

        <div className="footer-content">
          <div className="footer-top">
            <div className="logo-section">
              <div className="logo-container">
                <div className="logo-glow"></div>
                <div className="logo-image-wrapper">
                  <img 
                    src="/src/assets/images/logo_footer.jpg" 
                    alt="لوگوی پتوریا" 
                    className="logo-image"
                    onError={(e) => {
                      console.error('لوگو لود نشد:', e.target.src);
                      e.target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'logo-fallback';
                      fallback.innerHTML = '🐾';
                      fallback.style.fontSize = '2rem';
                      e.target.parentNode.appendChild(fallback);
                    }}
                  />
                </div>
              </div>
              <div className="logo-text">
                <h3 className="logo-title">Petoria</h3>
                <p className="logo-subtitle">کمک به یافتن حیوانات گمشده</p>
              </div>
            </div>

            <button
              onClick={() => handleFooterNavigation(navigate, setCurrentPage, "new-post")}
              className="cta-button"
            >
              <div className="cta-glow"></div>
              <div className="cta-content">
                <Heart className="cta-heart" />
                <span>ثبت آگهی رایگان</span>
              </div>
            </button>
          </div>

          <div className="footer-grid">
            <div className="footer-column">
              <h4 className="column-title">دسترسی سریع</h4>
              <ul className="links-list">
                {quickLinks.map((item) => (
                  <li key={item.page}>
                    <button
                      onClick={() => handleFooterNavigation(navigate, setCurrentPage, item.page)}
                      className="link-btn"
                    >
                      <span className="link-btn-content">
                        <Icon 
                          src={item.icon} 
                          alt={item.label}
                          className="link-icon"
                          fallback={<span className="icon-fallback">📄</span>}
                        />
                        <span className="link-text">{item.label}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="column-title">حساب کاربری</h4>
              <ul className="links-list">
                {accountLinks.map((item) => (
                  <li key={item.page}>
                    <button
                      onClick={() => handleFooterNavigation(navigate, setCurrentPage, item.page)}
                      className="link-btn"
                    >
                      <span className="link-btn-content">
                        <Icon 
                          src={item.icon} 
                          alt={item.label}
                          className="link-icon"
                          fallback={<span className="icon-fallback">👤</span>}
                        />
                        <span className="link-text">{item.label}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="column-title">تماس با ما</h4>
              <ul className="contact-list">
                <li>
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="contact-link"
                  >
                    <Icon 
                      src={contactInfo.emailIcon} 
                      alt="ایمیل"
                      className="contact-icon"
                      fallback={<span className="icon-fallback">📧</span>}
                    />
                    <span>{contactInfo.email}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="copyright">
              <span>© ۱۴۰۳ پتوریا</span>
              <span>•</span>
              <span>تمامی حقوق محفوظ است</span>
            </div>
            <div className="made-with">
              <span>ساخته شده با</span>
              <div className="heart-animation">
                <Heart className="heart-icon" />
              </div>
              <span>برای حیوانات</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.utils = {
  getQuickLinks,
  getAccountLinks,
  getContactInfo,
  handleFooterNavigation,
  getStats,
  initializePawAnimations,
  validateEmail
};