import React from 'react';
import { 
  PawPrint, 
  Heart,
} from 'lucide-react';

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

const handleFooterNavigation = (setCurrentPage, page) => {
  if (setCurrentPage && typeof setCurrentPage === 'function') {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
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
    paw.style.animationDelay = `${index * 0.5}s`;
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
  React.useEffect(() => {
    initializePawAnimations();
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

        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="floating-paw"
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
          >
            <PawPrint className="paw-icon" />
          </div>
        ))}

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
              onClick={() => handleFooterNavigation(setCurrentPage, "new-post")}
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
                      onClick={() => handleFooterNavigation(setCurrentPage, item.page)}
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
                      onClick={() => handleFooterNavigation(setCurrentPage, item.page)}
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

            <div className="footer-column">
              <div className="social-icons">
              </div>

              <div className="stats-grid">
                {stats.slice(0, 2).map((stat, index) => (
                  <div key={index} className="stat-card">
                    <p className="stat-number">{stat.value}</p>
                    <p className="stat-label">{stat.label}</p>
                  </div>
                ))}
              </div>
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