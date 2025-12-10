import React from "react";
import "../../styles/SuccessStoriesAll.css";

const stories = [
  {
    title: "داستان میمی",
    author: "سارا احمدی",
    date: "۱۴۰۴/۸/۲۱",
    status: "به خانواده بازگشت",
    statusColor: "#7aee97",
    statusTextColor: "#0f7228",
    image: "src/assets/images/mimi.png",
    content:
      "روز گذشته در حال قدم زدن در پارک بودم که صدای ناله یک گربه کوچک را شنیدم. او را زیر یک نیمکت پیدا کردم، ترسیده و گرسنه بود. با کمک این سایت عالی توانستم صاحب واقعیاش را پیدا کنم! خانم احمدی که ۳ روز بود دنبال گربهاش میگشت، از خوشحالی اشک میریخت. چه لحظه احساساتی بود! ممنونم پتکانکت که این اتصال زیبا را ممکن کردید. 🐱❤",
  },
  {
    title: "داستان چارلی",
    author: "فرهاد کریمی",
    date: "۱۴۰۴/۸/۱۷",
    status: "فرزندخوانده شد",
    statusColor: "#7aee97",
    statusTextColor: "#0f7228",
    image: "src/assets/images/charli.png",
    content:
      "بعد از ماهها جستجو برای حیوان خانگی مناسب، چارلی را در این سایت دیدم و عاشقش شدم! او یک بیگل پرانرژی و شیطون است که خانه ما را پر از شادی کرده. بچههایم عاشقش هستند و او هم عاشق آنها! هر روز با هم بازی میکنند و قدم میزنند. واقعا معتقدم که چارلی فرشتهای بود که به زندگی ما آمد. از پناهگاه و این پلتفرم فوقالعاده تشکر میکنم که این دوست کوچولوی جدید را به ما معرفی کردند! 🐕💙",
  },
  {
    title: "داستان مکس",
    author: "احمد محمدی",
    date: "۱۴۰۴/۸/۲۳",
    status: "بازگشت به خانه",
    statusColor: "#7aee97",
    statusTextColor: "#0f7228",
    image: "src/assets/images/max2.png",
    content:
      "بدترین کابوس هر صاحب حیوان خانگی برایم واقعیت شد وقتی مکس در پارک گم شد. ۴ روز و شب بدون خواب و آرامش، پوستر زدم در همه جا، اما هیچ خبری نبود. دوست من به من پیشنهاد داد که در پتکانکت پست بگذارم. فقط ۲ ساعت بعد از پست، یک خانم محترم تماس گرفت و گفت سگم را دیده! نمیتوانم توصیف کنم چه احساسی داشتم وقتی مکس را دوباره در آغوش گرفتم. او هم انقدر خوشحال بود که بیوقفه دمشم را تکان میداد و صورتم را میلیسید. این سایت واقعا جان مکس را نجات داد! 🙏💛",
  },
];

const SuccessStoriesAll = () => {
  return (
    <div className="success-stories-container-x">
      <main className="success-stories-main-x">
        <div className="stories-card-x">
          <div className="stories-content-x">
            <header className="stories-header-x">
              <div className="header-content-wrapper-x">
                <div className="stories-title-wrapper-x">
                  <div className="title-container-x">
                    <img 
                      src="/src/assets/icons/heart.svg" 
                      alt="heart icon" 
                      className="heart-icon-x"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzFjN2JkMSIgc3Ryb2tlPSIjMWM3YmQxIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0yMC44NCA0LjYxYTUuNSA1LjUgMCAwIDAtNy43OCAwTDEyIDUuNjdsLTEuMDYtMS4wNmE1LjUgNS41IDAgMCAwLTcuNzggNy43OGwxLjA2IDEuMDZMMTIgMjEuMjNsNy43OC03Ljc4IDEuMDYtMS4wNmE1LjUgNS41IDAgMCAwIDAtNy43OFoiLz48L3N2Zz4=";
                      }}
                    />
                    <h1 className="stories-title-x">داستان های موفق</h1>
                  </div>
                  
                  <p className="stories-subtitle-x">
                    جشن گرفتن بازگشت های موفق و فرزندخواندگی ها! این داستان های دلگرم کننده قدرت جامعه ما را نشان می دهند.
                  </p>
                </div>
              </div>
            </header>
            <div className="stories-list-x">
              {stories.map((story, index) => (
                <div 
                  key={index} 
                  className="story-card-x"
                  style={{ animationDelay: `${600 + index * 200}ms` }}
                >
                  <div className="story-content-wrapper-x">
                    <img
                      className="story-image-x"
                      alt={story.title}
                      src={story.image}
                    />
                    <div className="story-text-content-x">
                      <div className="story-header-x">
                        <div className="story-meta-x">
                          <h3 className="story-title-x">{story.title}</h3>
                          <p className="story-author-x">
                            توسط {story.author} • {story.date}
                          </p>
                        </div>
                        <div 
                          className="status-badge-x"
                          style={{ 
                            backgroundColor: story.statusColor,
                            color: story.statusTextColor
                          }}
                        >
                          <span className="status-text-x">{story.status}</span>
                          <img 
                            src="/src/assets/icons/heart.svg" 
                            alt="heart" 
                            className="status-heart-icon-x"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIj48cGF0aCBkPSJNMjAuODQgNC42MWE1LjUgNS41IDAgMCAwLTcuNzggMEwxMiA1LjY3bC0xLjA2LTEuMDZhNS41IDUuNSAwIDAgMC03Ljc4IDcuNzhsMS4wNiAxLjA2TDEyIDIxLjIzbDcuNzgtNy43OCAxLjA2LTEuMDZhNS41IDUuNSAwIDAgMCAwLTcuNzhaIi8+PC9zdmc+";
                            }}
                          />
                        </div>
                      </div>
                      <p className="story-content-x">{story.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuccessStoriesAll;