import React, { useEffect, useState } from "react";
import "../styles/Stats.css";

const ALL_POSTS_URL = "/posts/all/";

export default function Stats() {
  const [activeAdsCount, setActiveAdsCount] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActiveAdsCount = async () => {
      try {
        setError("");
        const res = await fetch(ALL_POSTS_URL);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data = await res.json();

        let count = 0;
        if (typeof data.count === "number") {
          count = data.count;
        } else if (Array.isArray(data)) {
          count = data.length;
        }

        setActiveAdsCount(count);
      } catch (err) {
        console.error("Stats fetch error:", err);
        setError("Error loading posts");
      }
    };

    fetchActiveAdsCount();
  }, []);

  return (
    <div className="main-container">
      <div className="boxes-container">
        
        <div className="box">
          <img className="stats-img" src="/images/correct.png" />
          <div className="stats-number">1,200</div>
          <div className="stats-labels">داستان های موفق</div>
        </div>

        <div className="box">
          <img className="stats-img" src="/images/person.png" />
          <div className="stats-number">12,548</div>
          <div className="stats-labels">کاربران فعال</div>
        </div>

        <div className="box">
          <img className="stats-img" src="/images/heart.png" />
          <div className="stats-number">2,647</div>
          <div className="stats-labels">حیوانات نجات یافته</div>
        </div>

        <div className="box">
          <img className="stats-img" src="/images/paw.png" />
          <div className="stats-number">
            {activeAdsCount !== null
              ? activeAdsCount.toLocaleString("en-US")
              : "…"}
          </div>
          <div className="stats-labels">آگهی های فعال</div>
          {error && <div className="stats-error">{error}</div>}
        </div>

      </div>
    </div>
  );
}
