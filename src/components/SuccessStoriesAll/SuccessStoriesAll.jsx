import React, { useState, useEffect } from "react";
import { SuccessStoryDetail } from "../SuccessStoryDetail/SuccessStoryDetail";
import "../../styles/SuccessStoriesAll.css";

const stories = [
  {
    id: 1,
    title: "داستان میمی",
    author: "سارا احمدی",
    date: "۱۴۰۴/۸/۲۱",
    status: "به خانواده بازگشت",
    statusColor: "rgba(122, 238, 151, 0.15)",
    statusTextColor: "#0f7228",
    image: "src/assets/images/mimi.png",
    images: [
      "src/assets/images/mimi.png",
      "src/assets/images/milu.png",
      "src/assets/images/shivvava.png"
    ],
    content: "روز گذشته در حال قدم زدن در پارک بودم که صدای ناله یک گربه کوچک را شنیدم. او را زیر یک نیمکت پیدا کردم، ترسیده و گرسنه بود. با کمک این سایت عالی توانستم صاحب واقعیاش را پیدا کنم! خانم احمدی که ۳ روز بود دنبال گربهاش میگشت، از خوشحالی اشک میریخت. چه لحظه احساساتی بود! ممنونم پتوریا که این اتصال زیبا را ممکن کردید. 🐱❤️",
  },
  {
    id: 2,
    title: "داستان چارلی",
    author: "فرهاد کریمی",
    date: "۱۴۰۴/۸/۱۷",
    status: "فرزندخوانده شد",
    statusColor: "rgba(122, 238, 151, 0.15)",
    statusTextColor: "#0f7228",
    image: "src/assets/images/charli.png",
    images: [
      "src/assets/images/charli.png"
    ],
    content: "بعد از ماهها جستجو برای حیوان خانگی مناسب، چارلی را در این سایت دیدم و عاشقش شدم! او یک بیگل پرانرژی و شیطون است که خانه ما را پر از شادی کرده. بچههایم عاشقش هستند و او هم عاشق آنها! هر روز با هم بازی میکنند و قدم میزنند. واقعا معتقدم که چارلی فرشتهای بود که به زندگی ما آمد. از پناهگاه و این پلتفرم فوقالعاده تشکر میکنم که این دوست کوچولوی جدید را به ما معرفی کردند! 🐕💙",
  },
  {
    id: 3,
    title: "داستان مکس",
    author: "احمد محمدی",
    date: "۱۴۰۴/۸/۲۳",
    status: "بازگشت به خانه",
    statusColor: "rgba(122, 238, 151, 0.15)",
    statusTextColor: "#0f7228",
    image: "src/assets/images/max2.png",
    images: [
      "src/assets/images/max2.png",
      "src/assets/images/charli.png",
    ],
    content: "بدترین کابوس هر صاحب حیوان خانگی برایم واقعیت شد وقتی مکس در پارک گم شد. ۴ روز و شب بدون خواب و آرامش، پوستر زدم در همه جا، اما هیچ خبری نبود. دوست من به من پیشنهاد داد که در پتکانکت پست بگذارم. فقط ۲ ساعت بعد از پست، یک خانم محترم تماس گرفت و گفت سگم را دیده! نمیتوانم توصیف کنم چه احساسی داشتم وقتی مکس را دوباره در آغوش گرفتم. او هم انقدر خوشحال بود که بیوقفه دمشم را تکان میداد و صورتم را میلیسید. این سایت واقعا جان مکس را نجات داد! 🙏💛",
  },
];

const SuccessStoriesAll = () => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStoryClick = (story) => {
    setSelectedStory(story);
  };

  const handleCloseDetail = () => {
    setSelectedStory(null);
  };

  return (
    <div className="success-stories-container-all">
      <div className="blue-waves-all"></div>
      
      <main className="success-stories-main-all">
        <div className={`stories-card-all ${isVisible ? 'visible' : ''}`}>
          <div className="card-border-glow-all"></div>
          
          <div className="stories-content-all">
            <header className="stories-header-all">
              <div className="title-container-all">
                <div className="title-icon-wrapper-all">
                  <div className="icon-circle-all">
                    <svg className="heart-icon-all" width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
                <div className="title-text-content-all">
                  <h1 className="stories-title-all">
                    <span className="title-gradient-all">داستان های موفق</span>
                  </h1>
                  <p className="stories-subtitle-all">
                    جشن گرفتن بازگشت های موفق و فرزندخواندگی ها! این داستان های دلگرم کننده قدرت جامعه ما را نشان می دهند.
                  </p>
                </div>
              </div>
            </header>
            
            <div className="stories-list-all">
              {stories.map((story, index) => (
                <div 
                  key={story.id} 
                  className={`story-card-all ${isVisible ? 'slide-in' : ''}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                  onClick={() => handleStoryClick(story)}
                >
                  <div className="card-inner-glow-all"></div>
                  <div className="story-number-all">0{index + 1}</div>
                  
                  <div className="story-content-wrapper-all">
                    <div className="story-image-section-all">
                      <div className="image-frame-all">
                        <img
                          className="story-image-all"
                          alt={story.title}
                          src={story.image}
                        />
                        <div className="image-overlay-all"></div>
                      </div>
                      <div className="image-decoration-all">
                        <div className="decoration-circle-all"></div>
                        <div className="decoration-circle-all"></div>
                        <div className="decoration-circle-all"></div>
                      </div>
                    </div>
                    
                    <div className="story-text-section-all">
                      <div className="story-header-all">
                        <div className="story-meta-all">
                          <div className="title-wrapper-all">
                            <h3 className="story-title-all">{story.title}</h3>
                            <div className="title-line-all"></div>
                          </div>
                          <div className="author-date-all">
                            <span className="author-icon-all">👤</span>
                            <span className="story-author-all">{story.author}</span>
                            <span className="date-separator-all">•</span>
                            <span className="story-date-all">{story.date}</span>
                          </div>
                        </div>
                        
                        <div className="status-section-all">
                          <div 
                            className="status-badge-all"
                            style={{ 
                              backgroundColor: story.statusColor,
                              color: story.statusTextColor
                            }}
                          >
                            <div className="status-icon-all">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                              </svg>
                            </div>
                            <span className="status-text-all">{story.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="story-content-box-all">
                        <p className="story-content">
                          {story.content.length > 180 
                            ? story.content.substring(0, 180) + "..." 
                            : story.content}
                        </p>
                      </div>
                      
                      <div className="story-footer-all">
                        <button className="read-more-btn-all">
                          <span>خواندن ادامه داستان</span>
                          <div className="btn-arrow-all">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14" />
                              <path d="M12 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {selectedStory && (
        <SuccessStoryDetail 
          story={selectedStory} 
          onClose={handleCloseDetail} 
        />
      )}
    </div>
  );
};

export default SuccessStoriesAll;