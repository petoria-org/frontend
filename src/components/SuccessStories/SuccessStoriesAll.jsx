import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SuccessStories.css";

export default function SuccessStories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/stories/")
      .then((res) => res.json())
      .then((data) => {
        setStories(data.results);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>در حال بارگذاری...</p>;

  return (
    <div className="success-stories">
      <div className="stories-header">
        <h2 className="stories-title">داستان موفقیت ما</h2>
      </div>

      <div className="stories-grid">
        {stories.map((story) => (
          <div key={story.id} className="story-card">
            <div className="story-image-container">
              <img src={story.image} alt={story.title} className="story-image" />
              <div className="story-overlay">
                <button
                  className="story-view-more"
                  onClick={() => navigate(`/stories/${story.id}`)}
                >
                  مشاهده جزئیات
                </button>
              </div>
            </div>

            <div className="story-content">
              <h3 className="story-title">{story.title}</h3>
              <p className="story-description">
                {story.content.length > 100
                  ? story.content.slice(0, 100) + "..."
                  : story.content}
              </p>
              <div className="story-footer">
                <span className="story-date">{story.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
