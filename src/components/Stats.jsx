import { useEffect, useState } from "react";
import "../styles/Hero.css";
import api from "../Services/api";

export default function Stats() {
  const [activeAdsCount, setActiveAdsCount] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActiveAdsCount = async () => {
      try {
        setError("");

        const res = await api.get("posts/all/");
        const data = res.data;

        let count = 0;
        if (typeof data.count === "number") {
          count = data.count;
        } else if (Array.isArray(data)) {
          count = data.length;
        } else if (Array.isArray(data.results)) {
          count = data.results.length;
        }

        setActiveAdsCount(count);
      } catch (err) {
        console.error("Stats fetch error:", err);
        setError("خطا در دریافت آگهی‌ها");
      }
    };

    fetchActiveAdsCount();
  }, []);

  return (
    <div className="compact-stats-wrapper">
      <div className="compact-stats-boxes">
        
        <div className="compact-stats-box">
          <img className="compact-stats-img" src="/images/correct.png" alt="داستان‌های موفق" />
          <div className="compact-stats-number">1,200</div>
          <div className="compact-stats-label">داستان‌های موفق</div>
        </div>

        <div className="compact-stats-box">
          <img className="compact-stats-img" src="/images/person.png" alt="کاربران فعال" />
          <div className="compact-stats-number">12,548</div>
          <div className="compact-stats-label">کاربران فعال</div>
        </div>

        <div className="compact-stats-box">
          <img className="compact-stats-img" src="/images/paw.png" alt="آگهی‌های فعال" />
          <div className="compact-stats-number">
            {activeAdsCount !== null
              ? activeAdsCount.toLocaleString("en-US")
              : "…"}
          </div>
          <div className="compact-stats-label">آگهی‌های فعال</div>
          {error && <div className="compact-stats-error">{error}</div>}
        </div>

      </div>
    </div>
  );
}