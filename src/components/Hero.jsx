import { useState, useEffect, useRef } from "react";
import "../styles/Hero.css";
import Stats from "./Stats";

import dogImage from "../assets/images/bgc1.png";
import catImage from "../assets/images/bgc2.png";
import dog2Image from "../assets/images/bgc3.png";
import cat2Image from "../assets/images/bgc4.png";
import dog3Image from "../assets/images/bgc5.png";
import catDogImage from "../assets/images/bgc6.png";
import dogCatImage from "../assets/images/bgc7.png";

import pLetter from "../assets/images/p.png";
import eLetter from "../assets/images/e.png";
import tLetter from "../assets/images/t.png";
import oLetter from "../assets/images/o.png";
import rLetter from "../assets/images/r.png";
import iLetter from "../assets/images/i.png";
import aLetter from "../assets/images/a.png";

import backgroundImage from "../assets/images/background.png";

export default function Hero() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPetoria, setShowPetoria] = useState(true);
  const autoSlideInterval = useRef(null);

  const stripRef = useRef(null);
  
  const PETORIA_LETTERS = [
    { id: 'p', src: pLetter, alt: "P", delay: 0 },
    { id: 'e', src: eLetter, alt: "E", delay: 0.2 },
    { id: 't', src: tLetter, alt: "T", delay: 0.4 },
    { id: 'o', src: oLetter, alt: "O", delay: 0.6 },
    { id: 'r', src: rLetter, alt: "R", delay: 0.8 },
    { id: 'i', src: iLetter, alt: "I", delay: 1.0 },
    { id: 'a', src: aLetter, alt: "A", delay: 1.2 },
  ];

  const pages = [
    {
      id: 0,
      title: "خوش آمدید به پتوریا",
      image: dogImage,
      description: "به دنیای حیوانات خانگی خوش آمدید",
      accentColor: "#4A90E2",
      imageSide: "center",
      contentPosition: "center",
      pageType: "welcome"
    },
    {
      id: 1,
      title: "گمشده‌ها را پیدا کنید",
      image: catImage,
      description: "هر حیوان خانگی بخشی از خانواده است... وقتی گم می‌شود، خانوار ناقص می‌ماند. ما پلی هستیم برای بازگرداندن این عزیزان به آغوش خانواده‌هایشان. با ثبت حیوان گم‌شده یا پیدا شده، به وصل کردن دوباره دلها کمک کنید.",
      accentColor: "#FF9EAD",
      imageSide: "right",
      contentPosition: "left",
      pageType: "content"
    },
    {
      id: 2,
      title: "سرپرستی با عشق",
      image: dog2Image,
      description: "بعضی قلب‌ها منتظر خانه‌ای امن هستند... حیوانات بی‌سرپرست منتظر دست‌های مهربانی هستند که به آنها پناه دهند. اینجا خانواده‌های مسئولیت‌پذیر به دنبال دوستانی وفادار می‌گردند. سرپرستی یعنی دادن فرصت دوباره به زندگی.",
      accentColor: "#87CEEB",
      imageSide: "left",
      contentPosition: "right",
      pageType: "content"
    },
    {
      id: 3,
      title: "داستان‌های شیرین",
      image: cat2Image,
      description: "هر بازگشت، یک معجزه است... هر سرپرستی، آغاز قصه‌ای جدید. در بخش داستان‌های موفق، روایت‌های واقعی از پیوند دوباره حیوانات با خانواده‌هایشان را می‌خوانید. این موفقیت‌ها امید می‌آفرینند و ثابت می‌کنند که مهربانی تغییردهنده است.",
      accentColor: "#FFB6C1",
      imageSide: "right",
      contentPosition: "left",
      pageType: "content"
    },
    {
      id: 4,
      title: "همراه شما هستیم",
      image: dog3Image,
      description: "پذیرش یک حیوان خانگی، تعهدی زیباست... ما همراه شما هستیم تا این سفر پرمسئولیت را با آگاهی آغاز کنید. سرپرستی یعنی پذیرفتن یک عضو جدید خانواده با تمام نیازها و ویژگی‌هایش. اینجا راهنمایی می‌شوید تا بهترین تصمیم را بگیرید.",
      accentColor: "#A6D8FF",
      imageSide: "right",
      contentPosition: "left",
      pageType: "content"
    },
    {
      id: 5,
      title: "دل‌های دوباره",
      image: catDogImage,
      description: "لحظه دیدار دوباره، بی‌نظیر است... وقتی حیوانی پس از مدت‌ها به خانواده‌اش بازمی‌گردد، شادی همه را دربر می‌گیرد. ما این لحظات را ممکن می‌سازیم. با همکاری و اطلاع‌رسانی، شبکه‌ای از مهربانی می‌سازیم که هیچ حیوانی در آن گم نمی‌ماند.",
      accentColor: "#FFD1DC",
      imageSide: "right",
      contentPosition: "left",
      pageType: "content"
    },
    {
      id: 6,
      title: "جامعه پتوریا",
      image: dogCatImage,
      description: "با هم قدرتمندیم... سایت ما بیش از یک پلتفرم است؛ جامعه‌ای است از افرادی که برای رفاه حیوانات ارزش قائلند. چه با گزارش حیوان گم‌شده، چه با پذیرش سرپرستی، چه با اشتراک داستان موفقیت—همه ما بخشی از این حرکت مهربانی هستیم.",
      accentColor: "#C8E6FF",
      imageSide: "right",
      contentPosition: "left",
      pageType: "content",
      showStats: true
    },
  ];

  const AUTO_SLIDE_INTERVAL = 5000;

  const handleNextPage = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    const nextPage = (currentPage + 1) % pages.length;

    if (nextPage === 0) {
      setShowPetoria(true);
    } else if (currentPage === 0) {
      setShowPetoria(false);
    }
    
    setTimeout(() => {
      setCurrentPage(nextPage);
      setIsAnimating(false);
    }, 600);
  };

  const handlePrevPage = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    const prevPage = (currentPage - 1 + pages.length) % pages.length;

    if (prevPage === 0) {
      setShowPetoria(true);
    } else if (currentPage === 0) {
      setShowPetoria(false);
    }
    
    setTimeout(() => {
      setCurrentPage(prevPage);
      setIsAnimating(false);
    }, 600);
  };

  const startAutoSlide = () => {
    if (autoSlideInterval.current) {
      clearInterval(autoSlideInterval.current);
    }
    
    autoSlideInterval.current = setInterval(() => {
      handleNextPage();
    }, AUTO_SLIDE_INTERVAL);
  };

  const stopAutoSlide = () => {
    if (autoSlideInterval.current) {
      clearInterval(autoSlideInterval.current);
      autoSlideInterval.current = null;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    startAutoSlide();
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopAutoSlide();
    };
  }, [currentPage, isAnimating]);

  useEffect(() => {
    if (currentPage === 0) {
      setShowPetoria(true);
    }
  }, [currentPage]);

  const handleMouseEnter = () => {
    stopAutoSlide();
  };

  const handleMouseLeave = () => {
    startAutoSlide();
  };

  const currentPageData = pages[currentPage];

  return (
    <div 
      className="hero-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <section className="hero-section">
        <div 
          className="hero-background"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        ></div>
        
        <div className="hero-overlay"></div>
        
        <button 
          className="side-nav-btn side-prev-btn"
          onClick={() => {
            handlePrevPage();
            stopAutoSlide();
            startAutoSlide();
          }}
          disabled={isAnimating}
          aria-label="صفحه قبلی"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button 
          className="side-nav-btn side-next-btn"
          onClick={() => {
            handleNextPage();
            stopAutoSlide();
            startAutoSlide();
          }}
          disabled={isAnimating}
          aria-label="صفحه بعد"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="hero-content">
          {currentPage === 0 && showPetoria && (
            <div className="petoria-screen">
              <div className="letters-container-hero">
                {PETORIA_LETTERS.map((letter, index) => (
                  <img
                    key={letter.id}
                    src={letter.src}
                    alt={letter.alt}
                    className="petoria-letter-hero"
                    style={{
                      animationDelay: `${letter.delay}s`,
                      zIndex: PETORIA_LETTERS.length - index,
                    }}
                  />
                ))}
              </div>

              <div className="welcome-message-container">
                <p className="welcome-subtitle-hero">
                  {pages[0].description}
                </p>
              </div>
            </div>
          )}

          {currentPage === 0 && (
            <div className="welcome-dog">
              <img 
                src={dogImage} 
                alt="سگ خوش آمدگویی"
                className="welcome-dog-image"
              />
            </div>
          )}

          {currentPage > 0 && currentPage < 6 && (
            <div className={`content-screen-hero ${currentPageData.imageSide} page-${currentPageData.id}`}>
              <div className="animal-image-container">
                <img 
                  src={currentPageData.image} 
                  alt={currentPageData.title}
                  className={`main-animal-image-hero ${isAnimating ? 'slide-out' : 'slide-in'}`}
                />
                <div className="image-glow"></div>
              </div>

              <div
                className={`text-content-hero ${currentPageData.contentPosition} text-page-${currentPageData.id}`}
              >
                <div className="content-wrapper-hero">
                  <h2 className="page-title-hero">{currentPageData.title}</h2>
                  <div className="accent-line-hero" style={{ backgroundColor: currentPageData.accentColor }}></div>
                  <p className="page-description-hero">{currentPageData.description}</p>
                </div>
              </div>
            </div>
          )}

          {currentPage === 6 && (
          <>
            <div className={`content-screen-hero ${currentPageData.imageSide} page-${currentPageData.id} page-with-stats`}>
              <div className="animal-image-container">
                <img 
                  src={currentPageData.image} 
                  alt={currentPageData.title}
                  className={`main-animal-image-hero ${isAnimating ? 'slide-out' : 'slide-in'}`}
                />
                <div className="image-glow"></div>
              </div>

              <div
                className={`text-content-hero ${currentPageData.contentPosition} text-page-${currentPageData.id}`}
              >
                <div className="content-wrapper-hero"> 
                  <h2 className="page-title-hero">جامعه پتوریا</h2> 
                  <div className="accent-line-hero" style={{ backgroundColor: currentPageData.accentColor }}></div> 
                  <p className="page-description-hero"> 
                    با هم قدرتمندیم... سایت ما بیش از یک پلتفرم است؛ جامعه‌ای است از افرادی که برای رفاه حیوانات ارزش قائلند. چه با گزارش حیوان گم‌شده، چه با پذیرش سرپرستی، چه با اشتراک داستان موفقیت—همه ما بخشی از این حرکت مهربانی هستیم.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="compact-stats-container">
              <Stats />
            </div>
          </>
        )}
        </div>
      </section>

      <div className="vertical-strip-container">
        <div className="vertical-strip" ref={stripRef}>
          {pages.map((page, index) => (
            <div 
              key={page.id}
              className={`vertical-thumb ${index === currentPage ? 'active' : ''}`}
              onClick={() => {
                if (isAnimating || index === currentPage) return;
                setIsAnimating(true);
                
                if (index === 0) {
                  setShowPetoria(true);
                } else if (currentPage === 0) {
                  setShowPetoria(false);
                }
                
                setTimeout(() => {
                  setCurrentPage(index);
                  setIsAnimating(false);
                }, 600);
              }}
              onMouseEnter={stopAutoSlide}
              onMouseLeave={startAutoSlide}
            >
              <div className="vertical-thumb-icon">
                <img 
                  src={page.image} 
                  alt={page.title}
                  className="vertical-thumb-image"
                />
                <div className="vertical-thumb-overlay"></div>
              </div>
              
              <div className="vertical-thumb-label">
                {index === 0 ? "پتوریا" : page.title.split(" ")[0]}
              </div>
              
              <div className="vertical-thumb-indicator"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}