import React, { useState } from "react";
import "../../styles/AdvancedFilters.css";

export default function AdvancedFilters({
  activeFilter,
  filterAnimal,
  setFilterAnimal,
  filterSex,
  setFilterSex,
  filterCity,
  setFilterCity,
  filterAge,
  setFilterAge,
  filterHasCertificate,
  setFilterHasCertificate,
  filterIsVaccinated,
  setFilterIsVaccinated,
  filterIsSterilized,
  setFilterIsSterilized,
  clearAllFilters,
  activeFiltersCount,
}) {
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);
  const [showSexDropdown, setShowSexDropdown] = useState(false);
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [showCertificateDropdown, setShowCertificateDropdown] = useState(false);
  const [showVaccineDropdown, setShowVaccineDropdown] = useState(false);
  const [showSterilizeDropdown, setShowSterilizeDropdown] = useState(false);
  
  const [citySearchTerm, setCitySearchTerm] = useState("");

  // لیست شهرها (مثال)
  const cities = [
    "تهران", "مشهد", "اصفهان", "شیراز", "تبریز", "کرج", "اهواز", 
    "قم", "کرمانشاه", "ارومیه", "رشت", "زاهدان", "همدان", 
    "کرمان", "یزد", "اردبیل", "بندرعباس", "قزوین", "زنجان", 
    "سنندج", "خرم‌آباد", "گرگان", "ساری", "بوشهر", "بیرجند",
    "ایلام", "سمنان", "شهرکرد", "یاسوج", "کاشان", "نیشابور",
    "بجنورد", "آمل", "قائم‌شهر", "ورامین", "اسلامشهر", "دزفول",
    "سبزوار", "نجف‌آباد", "خوی", "ملارد", "آباده", "نوشهر"
  ].sort();

  const filteredCities = cities.filter(city =>
    city.includes(citySearchTerm)
  );

  const handleCitySelect = (city) => {
    setFilterCity(city);
    setShowCityDropdown(false);
    setCitySearchTerm("");
  };

  const handleAnimalSelect = (value) => {
    setFilterAnimal(value);
    setShowAnimalDropdown(false);
  };

  const handleSexSelect = (value) => {
    setFilterSex(value);
    setShowSexDropdown(false);
  };

  const handleAgeSelect = (value) => {
    setFilterAge(value);
    setShowAgeDropdown(false);
  };

  const handleCertificateSelect = (value) => {
    setFilterHasCertificate(value);
    setShowCertificateDropdown(false);
  };

  const handleVaccineSelect = (value) => {
    setFilterIsVaccinated(value);
    setShowVaccineDropdown(false);
  };

  const handleSterilizeSelect = (value) => {
    setFilterIsSterilized(value);
    setShowSterilizeDropdown(false);
  };

  // تابع‌های حذف فیلتر
  const removeAnimalFilter = () => setFilterAnimal("all");
  const removeSexFilter = () => setFilterSex("all");
  const removeCityFilter = () => setFilterCity("all");
  const removeAgeFilter = () => setFilterAge("all");
  const removeCertificateFilter = () => setFilterHasCertificate("all");
  const removeVaccinationFilter = () => setFilterIsVaccinated("all");
  const removeSterilizationFilter = () => setFilterIsSterilized("all");

  // رندر فیلترهای اصلی (همیشه نمایش داده می‌شوند)
  const renderMainFilters = () => (
    <div className="main-filters-grid-new-posts">
      {/* نوع حیوان */}
{/* نوع حیوان */}
      <div className="filter-select-wrapper-new-posts">
        <div 
          className="custom-select filter-select-with-label" 
          onClick={() => {
            setShowAnimalDropdown(!showAnimalDropdown);
            setShowSexDropdown(false);
            setShowCityDropdown(false);
            setShowAgeDropdown(false);
          }}
        >
          <span className="select-placeholder-text">
            {filterAnimal === "all" ? "نوع حیوان" : filterAnimal}
          </span>
        </div>

        {showAnimalDropdown && (
          <div className="dropdown-menu">
            <div className="dropdown-options-list">
              <div 
                className={`dropdown-option ${filterAnimal === "all" ? "selected" : ""}`}
                onClick={() => handleAnimalSelect("all")}
              >
                نوع حیوان
              </div>
              <div 
                className={`dropdown-option ${filterAnimal === "سگ" ? "selected" : ""}`}
                onClick={() => handleAnimalSelect("سگ")}
              >
                سگ
              </div>
              <div 
                className={`dropdown-option ${filterAnimal === "گربه" ? "selected" : ""}`}
                onClick={() => handleAnimalSelect("گربه")}
              >
                گربه
              </div>
              {/* اضافه کردن حیوانات جدید */}
              <div 
                className={`dropdown-option ${filterAnimal === "خرگوش" ? "selected" : ""}`}
                onClick={() => handleAnimalSelect("خرگوش")}
              >
                خرگوش
              </div>
              <div 
                className={`dropdown-option ${filterAnimal === "همستر" ? "selected" : ""}`}
                onClick={() => handleAnimalSelect("همستر")}
              >
                همستر
              </div>
              <div 
                className={`dropdown-option ${filterAnimal === "پرنده" ? "selected" : ""}`}
                onClick={() => handleAnimalSelect("پرنده")}
              >
                پرنده
              </div>
              <div 
                className={`dropdown-option ${filterAnimal === "سایر" ? "selected" : ""}`}
                onClick={() => handleAnimalSelect("سایر")}
              >
                سایر
              </div>
            </div>
          </div>
        )}
      </div>

      {/* جنسیت */}
      <div className="filter-select-wrapper-new-posts">
        <div 
          className="custom-select filter-select-with-label" 
          onClick={() => {
            setShowSexDropdown(!showSexDropdown);
            setShowAnimalDropdown(false);
            setShowCityDropdown(false);
            setShowAgeDropdown(false);
          }}
        >
          <span className="select-placeholder-text">
            {filterSex === "all" ? "جنسیت" : filterSex}
          </span>
        </div>

        {showSexDropdown && (
          <div className="dropdown-menu">
            <div className="dropdown-options-list">
              <div 
                className={`dropdown-option ${filterSex === "all" ? "selected" : ""}`}
                onClick={() => handleSexSelect("all")}
              >
                جنسیت
              </div>
              <div 
                className={`dropdown-option ${filterSex === "نر" ? "selected" : ""}`}
                onClick={() => handleSexSelect("نر")}
              >
                نر
              </div>
              <div 
                className={`dropdown-option ${filterSex === "ماده" ? "selected" : ""}`}
                onClick={() => handleSexSelect("ماده")}
              >
                ماده
              </div>
            </div>
          </div>
        )}
      </div>

      {/* شهر */}
      <div className="filter-select-wrapper-new-posts">
        <div 
          className="custom-select filter-select-with-label" 
          onClick={() => {
            setShowCityDropdown(!showCityDropdown);
            setShowAnimalDropdown(false);
            setShowSexDropdown(false);
            setShowAgeDropdown(false);
          }}
        >
          <span className="select-placeholder-text">
            {filterCity === "all" ? "شهر" : filterCity}
          </span>
        </div>

        {showCityDropdown && (
          <div className="dropdown-menu city-dropdown">
            <div className="dropdown-search-container">
              <div className="dropdown-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="جستجوی شهر..."
                className="dropdown-search-input"
                value={citySearchTerm}
                onChange={(e) => setCitySearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <div className="dropdown-options-list">
              <div 
                className={`dropdown-option ${filterCity === "all" ? "selected" : ""}`}
                onClick={() => handleCitySelect("all")}
              >
                همه شهرها
              </div>
              {filteredCities.map((city) => (
                <div
                  key={city}
                  className={`dropdown-option ${filterCity === city ? "selected" : ""}`}
                  onClick={() => handleCitySelect(city)}
                >
                  {city}
                </div>
              ))}
              {filteredCities.length === 0 && (
                <div className="no-option-found">
                  شهری یافت نشد
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* سن */}
      <div className="filter-select-wrapper-new-posts">
        <div 
          className="custom-select filter-select-with-label" 
          onClick={() => {
            setShowAgeDropdown(!showAgeDropdown);
            setShowAnimalDropdown(false);
            setShowSexDropdown(false);
            setShowCityDropdown(false);
          }}
        >
          <span className="select-placeholder-text">
            {filterAge === "all" ? "سن" : 
              filterAge === "under-1" ? "زیر 1 سال" :
              filterAge === "1-2" ? "1 تا 2 سال" :
              filterAge === "2-3" ? "2 تا 3 سال" :
              filterAge === "3-5" ? "3 تا 5 سال" :
              filterAge === "5-7" ? "5 تا 7 سال" :
              "بالای 7 سال"
            }
          </span>
        </div>

        {showAgeDropdown && (
          <div className="dropdown-menu">
            <div className="dropdown-options-list">
              <div 
                className={`dropdown-option ${filterAge === "all" ? "selected" : ""}`}
                onClick={() => handleAgeSelect("all")}
              >
                سن
              </div>
              <div 
                className={`dropdown-option ${filterAge === "under-1" ? "selected" : ""}`}
                onClick={() => handleAgeSelect("under-1")}
              >
                زیر 1 سال
              </div>
              <div 
                className={`dropdown-option ${filterAge === "1-2" ? "selected" : ""}`}
                onClick={() => handleAgeSelect("1-2")}
              >
                1 تا 2 سال
              </div>
              <div 
                className={`dropdown-option ${filterAge === "2-3" ? "selected" : ""}`}
                onClick={() => handleAgeSelect("2-3")}
              >
                2 تا 3 سال
              </div>
              <div 
                className={`dropdown-option ${filterAge === "3-5" ? "selected" : ""}`}
                onClick={() => handleAgeSelect("3-5")}
              >
                3 تا 5 سال
              </div>
              <div 
                className={`dropdown-option ${filterAge === "5-7" ? "selected" : ""}`}
                onClick={() => handleAgeSelect("5-7")}
              >
                5 تا 7 سال
              </div>
              <div 
                className={`dropdown-option ${filterAge === "over-7" ? "selected" : ""}`}
                onClick={() => handleAgeSelect("over-7")}
              >
                بالای 7 سال
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // رندر فیلترهای مخصوص سرپرستی (فقط در تب سرپرستی)
  const renderAdoptionFilters = () => {
    if (activeFilter !== "سرپرستی") return null;

    return (
      <div className="adoption-specific-filters">
        <div className="filters-subtitle-new-posts">
          <h4>فیلترهای مخصوص سرپرستی</h4>
        </div>
        <div className="adoption-filters-grid-new-posts">
          {/* گواهی تولد */}
          <div className="filter-select-wrapper-new-posts">
            <div 
              className="custom-select filter-select-with-label" 
              onClick={() => {
                setShowCertificateDropdown(!showCertificateDropdown);
                setShowVaccineDropdown(false);
                setShowSterilizeDropdown(false);
              }}
            >
              <span className="select-placeholder-text">
                {filterHasCertificate === "all" ? "شناسنامه" : 
                  filterHasCertificate === "yes" ? "دارد" : "ندارد"
                }
              </span>
            </div>

            {showCertificateDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-options-list">
                  <div 
                    className={`dropdown-option ${filterHasCertificate === "all" ? "selected" : ""}`}
                    onClick={() => handleCertificateSelect("all")}
                  >
                    شناسنامه
                  </div>
                  <div 
                    className={`dropdown-option ${filterHasCertificate === "yes" ? "selected" : ""}`}
                    onClick={() => handleCertificateSelect("yes")}
                  >
                    دارد
                  </div>
                  <div 
                    className={`dropdown-option ${filterHasCertificate === "no" ? "selected" : ""}`}
                    onClick={() => handleCertificateSelect("no")}
                  >
                    ندارد
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* واکسیناسیون */}
          <div className="filter-select-wrapper-new-posts">
            <div 
              className="custom-select filter-select-with-label" 
              onClick={() => {
                setShowVaccineDropdown(!showVaccineDropdown);
                setShowCertificateDropdown(false);
                setShowSterilizeDropdown(false);
              }}
            >
              <span className="select-placeholder-text">
                {filterIsVaccinated === "all" ? "واکسیناسیون" : 
                  filterIsVaccinated === "yes" ? "انجام شده" : "انجام نشده"
                }
              </span>
            </div>

            {showVaccineDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-options-list">
                  <div 
                    className={`dropdown-option ${filterIsVaccinated === "all" ? "selected" : ""}`}
                    onClick={() => handleVaccineSelect("all")}
                  >
                    واکسیناسیون
                  </div>
                  <div 
                    className={`dropdown-option ${filterIsVaccinated === "yes" ? "selected" : ""}`}
                    onClick={() => handleVaccineSelect("yes")}
                  >
                    انجام شده
                  </div>
                  <div 
                    className={`dropdown-option ${filterIsVaccinated === "no" ? "selected" : ""}`}
                    onClick={() => handleVaccineSelect("no")}
                  >
                    انجام نشده
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* استریل‌سازی */}
          <div className="filter-select-wrapper-new-posts">
            <div 
              className="custom-select filter-select-with-label" 
              onClick={() => {
                setShowSterilizeDropdown(!showSterilizeDropdown);
                setShowCertificateDropdown(false);
                setShowVaccineDropdown(false);
              }}
            >
              <span className="select-placeholder-text">
                {filterIsSterilized === "all" ? "عقیم سازی" : 
                  filterIsSterilized === "yes" ? "انجام شده" : "انجام نشده"
                }
              </span>
            </div>

            {showSterilizeDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-options-list">
                  <div 
                    className={`dropdown-option ${filterIsSterilized === "all" ? "selected" : ""}`}
                    onClick={() => handleSterilizeSelect("all")}
                  >
                    عقیم سازی
                  </div>
                  <div 
                    className={`dropdown-option ${filterIsSterilized === "yes" ? "selected" : ""}`}
                    onClick={() => handleSterilizeSelect("yes")}
                  >
                    انجام شده
                  </div>
                  <div 
                    className={`dropdown-option ${filterIsSterilized === "no" ? "selected" : ""}`}
                    onClick={() => handleSterilizeSelect("no")}
                  >
                    انجام نشده
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // رندر بج‌های فیلترهای فعال
  const renderActiveFilters = () => {
    const badges = [];

    if (filterAnimal !== "all") {
      badges.push({
        key: "animal",
        label: `نوع: ${filterAnimal}`,
        className: "animal-badge",
        onRemove: removeAnimalFilter
      });
    }

    if (filterSex !== "all") {
      badges.push({
        key: "sex",
        label: `جنسیت: ${filterSex}`,
        className: "sex-badge",
        onRemove: removeSexFilter
      });
    }

    if (filterCity !== "all") {
      badges.push({
        key: "city",
        label: `شهر: ${filterCity}`,
        className: "city-badge",
        onRemove: removeCityFilter
      });
    }

    if (filterAge !== "all") {
      const ageLabels = {
        "under-1": "زیر 1 سال",
        "1-2": "1 تا 2 سال",
        "2-3": "2 تا 3 سال",
        "3-5": "3 تا 5 سال",
        "5-7": "5 تا 7 سال",
        "over-7": "بالای 7 سال"
      };
      badges.push({
        key: "age",
        label: `سن: ${ageLabels[filterAge]}`,
        className: "age-badge",
        onRemove: removeAgeFilter
      });
    }

    // فقط فیلترهای سرپرستی را در تب سرپرستی نشان بده
    if (activeFilter === "سرپرستی") {
      if (filterHasCertificate !== "all") {
        badges.push({
          key: "certificate",
          label: `گواهی تولد: ${filterHasCertificate === "yes" ? "دارد" : "ندارد"}`,
          className: "certificate-badge",
          onRemove: removeCertificateFilter
        });
      }

      if (filterIsVaccinated !== "all") {
        badges.push({
          key: "vaccine",
          label: `واکسیناسیون: ${filterIsVaccinated === "yes" ? "انجام شده" : "انجام نشده"}`,
          className: "vaccine-badge",
          onRemove: removeVaccinationFilter
        });
      }

      if (filterIsSterilized !== "all") {
        badges.push({
          key: "sterilize",
          label: `استریل‌سازی: ${filterIsSterilized === "yes" ? "انجام شده" : "انجام نشده"}`,
          className: "sterilize-badge",
          onRemove: removeSterilizationFilter
        });
      }
    }

    if (badges.length === 0) return null;

    return (
      <div className="active-filters-display-new-posts">
        <span className="active-filters-label-new-posts">فیلترهای فعال:</span>
        <div className="active-filters-badges-new-posts">
          {badges.map((badge) => (
            <div 
              key={badge.key} 
              className={`active-filter-badge-new-posts ${badge.className}`}
            >
              <span>{badge.label}</span>
              <button 
                className="remove-filter-btn"
                onClick={badge.onRemove}
              >
                <img src="/src/assets/icons/close.svg" alt="حذف" />
              </button>
            </div>
          ))}
        </div>
        {badges.length > 0 && (
          <button 
            className="clear-filters-btn-new-posts"
            onClick={clearAllFilters}
          >
            <img src="/src/assets/icons/close.svg" alt="پاک کردن" className="clear-icon" />
            پاک کردن همه فیلترها
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="filters-section-new-posts">
      {renderMainFilters()}
      {renderAdoptionFilters()}
      {renderActiveFilters()}
    </div>
  );
}