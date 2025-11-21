import "../styles/Hero.css";

export default function Hero() {
  return (
    <div className="hero-container">
      <div className="hero-logo">
        <img src="/images/logo.png" alt="Logo" style={{ width: '110px', height: '116px', borderRadius: '50%' }} />
      </div>
      <h1 className="hero-title">به Petoria خوش آمدید</h1>
      <p className="hero-description">
        پلتفرم جامع برای یافتن حیوانات گمشده و سرپرستی حیوانات خانگی
      </p>

      <div className="search-white-container">
        <button className="search-button">
          <span className="search-text">جستجو</span>
          <img src="/src/icons/search.svg" alt="Search" className="search-icon" />
        </button>
        
        <div className="search-gray-container">
          <input
            className="hero-search-input"
            placeholder="جستجوی حیوان خانگی..."
          />
        </div>
      </div>
    </div>
  );
}