import "../styles/SuccessStories.css";

export default function SuccessStories() {
  const stories = [
    {
      id: 1,
      image: "/src/images/stories/luna.jpg",
      title: "لونا و صاحب جدیدش",
      description: "توله سگ میکس که خانواده دوست داشتنی پیدا کرد",
      date: "۳ روز پیش"
    },
    {
      id: 2,
      image: "/src/images/stories/max.jpg", 
      title: "ماکس پس از سه روز پیدا شد",
      description: "سگ گمشده با کمک شما پیدا شد",
      date: "۱ هفته پیش"
    },
    {
      id: 3,
      image: "/src/images/stories/beld.jpg",
      title: "بلا و خانواده جدیدش",
      description: "بلا هم اکنون در خانه‌ای جدید و امن زندگی می‌کند",
      date: "۲ هفته پیش"
    }
  ];

  return (
    <div className="success-stories">
      <div className="stories-header">
        <h2 className="stories-title">داستان موفقیت ما</h2>
      </div>

      <div className="stories-grid">
        {stories.map((story) => (
          <div key={story.id} className="story-card">
            <div className="story-image-container">
              <img 
                src={story.image} 
                alt={story.title}
                className="story-image"
              />
              <div className="story-overlay">
                <button className="story-view-more">
                  مشاهده بیشتر
                  <svg className="story-arrow" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="story-content">
              <h3 className="story-title">{story.title}</h3>
              <p className="story-description">{story.description}</p>
              <div className="story-footer">
                <span className="story-date">{story.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="view-more-container">
        <button className="view-more-btn">
          مشاهده بیشتر
        <svg className="arrow-icon" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2"/>
        </svg>
        </button>
      </div>
    </div>
  );
}