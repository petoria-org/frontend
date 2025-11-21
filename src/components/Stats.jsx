import "../styles/Stats.css";

export default function Stats() {
  return (
    <div className="main-container">
        <div className="boxes-container">
            <div className="box">
                <img  className="stats-img" src="/images/correct.png" />
                <div className="stats-number">1,200</div>
                <div className="stats-labels">داستان های موفق</div>
            </div>
            <div className="box">
                <img  className="stats-img" src="/images/person.png" />
                <div className="stats-number">12,548</div>
                <div className="stats-labels">کاربران فعال</div>
            </div>
            <div className="box">
                <img  className="stats-img" src="/images/heart.png" />
                <div className="stats-number">2,647</div>
                <div className="stats-labels">حیوانات نجات یافته</div>
            </div>
            <div className="box">
                <img  className="stats-img" src="/images/paw.png" />
                <div className="stats-number">246</div>
                <div className="stats-labels">آگهی های فعال</div>
            </div>
        </div>
    </div>
  );
}