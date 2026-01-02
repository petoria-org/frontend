
import React, { useState, useEffect, useRef } from "react";
import "../../styles/AdvancedFilters.css";
import {
  AGE_OPTIONS as ageOptions,
  ANIMAL_OPTIONS as animals,
  SEX_OPTIONS as sexes,
  STATUS_OPTIONS as statusOptions,
  STATUS_YES_NO_OPTIONS as statusYesNoOptions,
} from "../../utils/postFilters";

const AdvancedFilters = ({
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);
  const [showSexDropdown, setShowSexDropdown] = useState(false);
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [showCertificateDropdown, setShowCertificateDropdown] = useState(false);
  const [showVaccineDropdown, setShowVaccineDropdown] = useState(false);
  const [showSterilizeDropdown, setShowSterilizeDropdown] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState("");

  const dropdownRef = useRef(null);
  const lastToggleTime = useRef(0);

  const [selectedAnimals, setSelectedAnimals] = useState(
    filterAnimal === "all" ? [] : filterAnimal.split(",").filter(item => item.trim())
  );
  const [selectedSexes, setSelectedSexes] = useState(
    filterSex === "all" ? [] : filterSex.split(",").filter(item => item.trim())
  );
  const [selectedCities, setSelectedCities] = useState(
    filterCity === "all" ? [] : filterCity.split(",").filter(item => item.trim())
  );
  const [selectedAges, setSelectedAges] = useState(
    filterAge === "all" ? [] : filterAge.split(",").filter(item => item.trim())
  );
  const [selectedCertificates, setSelectedCertificates] = useState(
    filterHasCertificate === "all" ? [] : filterHasCertificate.split(",").filter(item => item.trim())
  );
  const [selectedVaccinations, setSelectedVaccinations] = useState(
    filterIsVaccinated === "all" ? [] : filterIsVaccinated.split(",").filter(item => item.trim())
  );
  const [selectedSterilizations, setSelectedSterilizations] = useState(
    filterIsSterilized === "all" ? [] : filterIsSterilized.split(",").filter(item => item.trim())
  );

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeAllDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const closeAllDropdowns = () => {
    setShowAnimalDropdown(false);
    setShowSexDropdown(false);
    setShowCityDropdown(false);
    setShowAgeDropdown(false);
    setShowCertificateDropdown(false);
    setShowVaccineDropdown(false);
    setShowSterilizeDropdown(false);
    setCitySearchTerm("");
  };

  const toggleDropdown = (name) => {
    setShowAnimalDropdown(name === "animal" ? prev => !prev : false);
    setShowSexDropdown(name === "sex" ? prev => !prev : false);
    setShowCityDropdown(name === "city" ? prev => !prev : false);
    setShowAgeDropdown(name === "age" ? prev => !prev : false);
    setShowCertificateDropdown(name === "certificate" ? prev => !prev : false);
    setShowVaccineDropdown(name === "vaccine" ? prev => !prev : false);
    setShowSterilizeDropdown(name === "sterilize" ? prev => !prev : false);
  };

  const closeFilterDashboard = () => {
    closeAllDropdowns();
    setIsOpen(false);
  };

  const handleToggleClick = () => {
    const now = Date.now();

    if (isOpen) {
      closeFilterDashboard();
      return;
    }
 
    setIsOpen(true);
    lastToggleTime.current = now;
  };


  const handleAnimalSelect = (animal) => {
    let newSelected;

    if (animal === "all") {
      const allSelected = selectedAnimals.length === animals.length;

      newSelected = allSelected ? [] : [...animals];
    } 
    
    else {
      newSelected = selectedAnimals.includes(animal)
        ? selectedAnimals.filter(item => item !== animal)
        : [...selectedAnimals, animal];
    }

    setSelectedAnimals(newSelected);
    setFilterAnimal(newSelected.length > 0 ? newSelected.join(",") : "all");
  };


  const handleSexSelect = (sex) => {
    let newSelected;

    if (sex === "all") {
      const allSelected = selectedSexes.length === sexes.length;
      newSelected = allSelected ? [] : [...sexes];
    } 
    
    else {
      newSelected = selectedSexes.includes(sex)
        ? selectedSexes.filter(item => item !== sex)
        : [...selectedSexes, sex];
    }

    setSelectedSexes(newSelected);
    setFilterSex(newSelected.length > 0 ? newSelected.join(",") : "all");
  };

  const handleCitySelect = (city) => {
    let newSelected;
    const targetCities = citySearchTerm ? filteredCities : cities;

    if (city === "all") {
      const allSelected = selectedCities.length === targetCities.length;
      newSelected = allSelected ? [] : [...targetCities];
    } 
    
    else {
      newSelected = selectedCities.includes(city)
        ? selectedCities.filter(item => item !== city)
        : [...selectedCities, city];
    }

    setSelectedCities(newSelected);
    setFilterCity(newSelected.length > 0 ? newSelected.join(",") : "all");
  };

  const handleAgeSelect = (ageValue) => {
    let newSelected;
    const allAgeValues = ageOptions.map(age => age.value);

    if (ageValue === "all") {
      const allSelected = selectedAges.length === allAgeValues.length;
      newSelected = allSelected ? [] : [...allAgeValues];
    } 
    
    else {
      newSelected = selectedAges.includes(ageValue)
        ? selectedAges.filter(item => item !== ageValue)
        : [...selectedAges, ageValue];
    }

    setSelectedAges(newSelected);
    setFilterAge(newSelected.length > 0 ? newSelected.join(",") : "all");
  };

  const handleCertificateSelect = (certificate) => {
    let newSelected;
    const allStatusValues = statusOptions.map(status => status.value);

    if (certificate === "all") {
      const allSelected = selectedCertificates.length === allStatusValues.length;
      newSelected = allSelected ? [] : [...allStatusValues];
    } 
    
    else {
      newSelected = selectedCertificates.includes(certificate)
        ? selectedCertificates.filter(item => item !== certificate)
        : [...selectedCertificates, certificate];
    }

    setSelectedCertificates(newSelected);
    setFilterHasCertificate(newSelected.length > 0 ? newSelected.join(",") : "all");
  };

  const handleVaccineSelect = (vaccine) => {
    let newSelected;
    const allStatusValues = statusYesNoOptions.map(status => status.value);

    if (vaccine === "all") {
      const allSelected = selectedVaccinations.length === allStatusValues.length;
      newSelected = allSelected ? [] : [...allStatusValues];
    } 
    
    else {
      newSelected = selectedVaccinations.includes(vaccine)
        ? selectedVaccinations.filter(item => item !== vaccine)
        : [...selectedVaccinations, vaccine];
    }

    setSelectedVaccinations(newSelected);
    setFilterIsVaccinated(newSelected.length > 0 ? newSelected.join(",") : "all");
  };


  const handleSterilizeSelect = (sterilize) => {
    let newSelected;
    const allStatusValues = statusYesNoOptions.map(status => status.value);

    if (sterilize === "all") {
      const allSelected = selectedSterilizations.length === allStatusValues.length;
      newSelected = allSelected ? [] : [...allStatusValues];
    } 
    
    else {
      newSelected = selectedSterilizations.includes(sterilize)
        ? selectedSterilizations.filter(item => item !== sterilize)
        : [...selectedSterilizations, sterilize];
    }

    setSelectedSterilizations(newSelected);
    setFilterIsSterilized(newSelected.length > 0 ? newSelected.join(",") : "all");
  };


  const removeAnimalFilter = () => {
    setSelectedAnimals([]);
    setFilterAnimal("all");
  };

  const removeSexFilter = () => {
    setSelectedSexes([]);
    setFilterSex("all");
  };

  const removeCityFilter = () => {
    setSelectedCities([]);
    setFilterCity("all");
  };

  const removeAgeFilter = () => {
    setSelectedAges([]);
    setFilterAge("all");
  };

  const removeCertificateFilter = () => {
    setSelectedCertificates([]);
    setFilterHasCertificate("all");
  };

  const removeVaccinationFilter = () => {
    setSelectedVaccinations([]);
    setFilterIsVaccinated("all");
  };

  const removeSterilizationFilter = () => {
    setSelectedSterilizations([]);
    setFilterIsSterilized("all");
  };

  const handleClearAllFilters = () => {
    setSelectedAnimals([]);
    setSelectedSexes([]);
    setSelectedCities([]);
    setSelectedAges([]);
    setSelectedCertificates([]);
    setSelectedVaccinations([]);
    setSelectedSterilizations([]);
    closeAllDropdowns();
    clearAllFilters();
  };

  const getActiveFiltersCount = () => {
    return [
      selectedAnimals.length > 0,
      selectedSexes.length > 0,
      selectedCities.length > 0,
      selectedAges.length > 0,
      selectedCertificates.length > 0,
      selectedVaccinations.length > 0,
      selectedSterilizations.length > 0,
    ].filter(Boolean).length;
  };

  const getFiltersDescription = () => {
    const count = getActiveFiltersCount();
    if (count === 0) return "هیچ فیلتری اعمال نشده است";
    
    const filters = [];
    
    if (selectedAnimals.length > 0) {
      if (selectedAnimals.length === 1) {
        filters.push(`نوع: ${selectedAnimals[0]}`);
      } 
      
      else if (selectedAnimals.length === animals.length) {
        filters.push(`نوع: همه`);
      } 
      
      else {
        filters.push(`نوع: ${selectedAnimals.length} مورد`);
      }
    }
    
    if (selectedSexes.length > 0) {
      if (selectedSexes.length === 1) {
        filters.push(`جنسیت: ${selectedSexes[0]}`);
      } 
      
      else if (selectedSexes.length === sexes.length) {
        filters.push(`جنسیت: همه`);
      } 
      
      else {
        filters.push(`جنسیت: ${selectedSexes.length} مورد`);
      }
    }
    
    if (selectedCities.length > 0) {
      if (selectedCities.length === 1) {
        filters.push(`شهر: ${selectedCities[0]}`);
      } 
      
      else if (selectedCities.length === (citySearchTerm ? filteredCities.length : cities.length)) {
        filters.push(`شهر: همه`);
      } 
      
      else {
        filters.push(`شهر: ${selectedCities.length} شهر`);
      }
    }
    
    if (selectedAges.length > 0) {
      const ageLabels = {
        "under-1": "زیر 1 سال",
        "1-2": "1 تا 2 سال",
        "2-3": "2 تا 3 سال",
        "3-5": "3 تا 5 سال",
        "5-7": "5 تا 7 سال",
        "over-7": "بالای 7 سال"
      };
      
      if (selectedAges.length === 1) {
        filters.push(`سن: ${ageLabels[selectedAges[0]]}`);
      } 
      
      else if (selectedAges.length === ageOptions.length) {
        filters.push(`سن: همه`);
      } 
      
      else {
        filters.push(`سن: ${selectedAges.length} بازه`);
      }
    }
    
    if (activeFilter === "سرپرستی") {
      if (selectedCertificates.length > 0) {
        if (selectedCertificates.length === 1) {
          filters.push(`شناسنامه: ${selectedCertificates[0] === "yes" ? "دارد" : "ندارد"}`);
        } 
        
        else if (selectedCertificates.length === statusOptions.length) {
          filters.push(`شناسنامه: همه وضعیت‌ها`);
        } 
        
        else {
          filters.push(`شناسنامه: ${selectedCertificates.length} وضعیت`);
        }
      }
      
      if (selectedVaccinations.length > 0) {
        if (selectedVaccinations.length === 1) {
          filters.push(`واکسیناسیون: ${selectedVaccinations[0] === "yes" ? "انجام شده" : "انجام نشده"}`);
        } 
        
        else if (selectedVaccinations.length === statusYesNoOptions.length) {
          filters.push(`واکسیناسیون: همه وضعیت‌ها`);
        } 
        
        else {
          filters.push(`واکسیناسیون: ${selectedVaccinations.length} وضعیت`);
        }
      }
      
      if (selectedSterilizations.length > 0) {
        if (selectedSterilizations.length === 1) {
          filters.push(`عقیم‌سازی: ${selectedSterilizations[0] === "yes" ? "انجام شده" : "انجام نشده"}`);
        } 
        
        else if (selectedSterilizations.length === statusYesNoOptions.length) {
          filters.push(`عقیم‌سازی: همه وضعیت‌ها`);
        } 
        
        else {
          filters.push(`عقیم‌سازی: ${selectedSterilizations.length} وضعیت`);
        }
      }
    }
    
    return `${count} فیلتر فعال: ${filters.join("، ")}`;
  };

  const getMultiSelectPlaceholder = (selectedItems, defaultPlaceholder, singleText, multipleText, totalItems) => {
    if (selectedItems.length === 0) return defaultPlaceholder;
    if (selectedItems.length === 1) return `${singleText}: ${selectedItems[0]}`;
    if (selectedItems.length === totalItems) return `${singleText}: همه`;
    return `${multipleText} (${selectedItems.length})`;
  };

  const FilterField = ({ title, children, hasValue = false }) => {
    return (
      <div className="advanced-filter-title-container">
        <div className="advanced-filter-title">
          <svg 
            className="advanced-filter-title-icon" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path 
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          {title}
          {hasValue && (
            <span className="advanced-filter-title-indicator"></span>
          )}
        </div>
        {children}
      </div>
    );
  };

  const renderMainFilters = () => (
    <div className="advanced-main-filters-grid">
      <div className="advanced-filter-select-wrapper">
        <FilterField 
          title="انتخاب نوع حیوان" 
          hasValue={selectedAnimals.length > 0}
        >
          <div 
            className={`advanced-custom-select ${showAnimalDropdown ? 'active' : ''}`} 
            onClick={() => {
              closeAllDropdowns();
              setShowAnimalDropdown(!showAnimalDropdown);
            }}
          >
            <span className="advanced-select-placeholder-text">
              {getMultiSelectPlaceholder(selectedAnimals, "نوع حیوان", "نوع", "انواع حیوان", animals.length)}
            </span>
          </div>
        </FilterField>

        {showAnimalDropdown && (
          <div className="advanced-dropdown-menu advanced-multi-select">
            <div className="advanced-dropdown-options-list">
              <div 
                className={`advanced-dropdown-option ${selectedAnimals.length === animals.length ? "selected" : ""}`}
                onClick={() => handleAnimalSelect("all")}
              >
                <div className="advanced-checkbox-wrapper">
                  <div className={`advanced-checkbox ${selectedAnimals.length === animals.length ? "checked" : ""}`}>
                    {selectedAnimals.length === animals.length && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span>همه حیوانات</span>
                </div>
              </div>
              
              {animals.map((animal) => (
                <div 
                  key={animal}
                  className={`advanced-dropdown-option ${selectedAnimals.includes(animal) ? "selected" : ""}`}
                  onClick={() => handleAnimalSelect(animal)}
                >
                  <div className="advanced-checkbox-wrapper">
                    <div className={`advanced-checkbox ${selectedAnimals.includes(animal) ? "checked" : ""}`}>
                      {selectedAnimals.includes(animal) && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span>{animal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="advanced-filter-select-wrapper">
        <FilterField 
          title="انتخاب جنسیت" 
          hasValue={selectedSexes.length > 0}
        >
          <div 
            className={`advanced-custom-select ${showSexDropdown ? 'active' : ''}`} 
            onClick={() => {
              closeAllDropdowns();
              setShowSexDropdown(!showSexDropdown);
            }}
          >
            <span className="advanced-select-placeholder-text">
              {getMultiSelectPlaceholder(selectedSexes, "جنسیت", "جنسیت", "جنسیت‌ها", sexes.length)}
            </span>
          </div>
        </FilterField>

        {showSexDropdown && (
          <div className="advanced-dropdown-menu advanced-multi-select">
            <div className="advanced-dropdown-options-list">
              <div 
                className={`advanced-dropdown-option ${selectedSexes.length === sexes.length ? "selected" : ""}`}
                onClick={() => handleSexSelect("all")}
              >
                <div className="advanced-checkbox-wrapper">
                  <div className={`advanced-checkbox ${selectedSexes.length === sexes.length ? "checked" : ""}`}>
                    {selectedSexes.length === sexes.length && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span>همه جنسیت‌ها</span>
                </div>
              </div>
              
              {sexes.map((sex) => (
                <div 
                  key={sex}
                  className={`advanced-dropdown-option ${selectedSexes.includes(sex) ? "selected" : ""}`}
                  onClick={() => handleSexSelect(sex)}
                >
                  <div className="advanced-checkbox-wrapper">
                    <div className={`advanced-checkbox ${selectedSexes.includes(sex) ? "checked" : ""}`}>
                      {selectedSexes.includes(sex) && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span>{sex}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="advanced-filter-select-wrapper">
        <FilterField 
          title="انتخاب شهر" 
          hasValue={selectedCities.length > 0}
        >
          <div 
            className={`advanced-custom-select ${showCityDropdown ? 'active' : ''}`} 
            onClick={() => {
              closeAllDropdowns();
              setShowCityDropdown(!showCityDropdown);
            }}
          >
            <span className="advanced-select-placeholder-text">
              {getMultiSelectPlaceholder(
                selectedCities, 
                "شهر", 
                "شهر", 
                "شهرها", 
                citySearchTerm ? filteredCities.length : cities.length
              )}
            </span>
          </div>
        </FilterField>

        {showCityDropdown && (
          <div className="advanced-dropdown-menu advanced-multi-select advanced-city-dropdown">
            <div className="advanced-dropdown-header">
              <div className="advanced-dropdown-search-container">
                <div className="advanced-dropdown-search-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="جستجوی شهر..."
                  className="advanced-dropdown-search-input"
                  value={citySearchTerm}
                  onChange={(e) => setCitySearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="advanced-dropdown-options-list">
              <div 
                className={`advanced-dropdown-option ${selectedCities.length === (citySearchTerm ? filteredCities.length : cities.length) ? "selected" : ""}`}
                onClick={() => handleCitySelect("all")}
              >
                <div className="advanced-checkbox-wrapper">
                  <div className={`advanced-checkbox ${selectedCities.length === (citySearchTerm ? filteredCities.length : cities.length) ? "checked" : ""}`}>
                    {selectedCities.length === (citySearchTerm ? filteredCities.length : cities.length) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span>همه شهرها</span>
                </div>
              </div>
              
              {(citySearchTerm ? filteredCities : cities).map((city) => (
                <div
                  key={city}
                  className={`advanced-dropdown-option ${selectedCities.includes(city) ? "selected" : ""}`}
                  onClick={() => handleCitySelect(city)}
                >
                  <div className="advanced-checkbox-wrapper">
                    <div className={`advanced-checkbox ${selectedCities.includes(city) ? "checked" : ""}`}>
                      {selectedCities.includes(city) && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span>{city}</span>
                  </div>
                </div>
              ))}
              {filteredCities.length === 0 && (
                <div className="advanced-no-option-found">
                  شهری یافت نشد
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="advanced-filter-select-wrapper">
        <FilterField 
          title="انتخاب بازه سنی" 
          hasValue={selectedAges.length > 0}
        >
          <div 
            className={`advanced-custom-select ${showAgeDropdown ? 'active' : ''}`} 
            onClick={() => {
              closeAllDropdowns();
              setShowAgeDropdown(!showAgeDropdown);
            }}
          >
            <span className="advanced-select-placeholder-text">
              {selectedAges.length === 0 ? "سن" : 
                selectedAges.length === 1 ? 
                  `سن: ${ageOptions.find(a => a.value === selectedAges[0])?.label}` :
                  selectedAges.length === ageOptions.length ? "سن: همه" :
                  `سن (${selectedAges.length} بازه)`
              }
            </span>
          </div>
        </FilterField>

        {showAgeDropdown && (
          <div className="advanced-dropdown-menu advanced-multi-select">
            <div className="advanced-dropdown-options-list">
              <div 
                className={`advanced-dropdown-option ${selectedAges.length === ageOptions.length ? "selected" : ""}`}
                onClick={() => handleAgeSelect("all")}
              >
                <div className="advanced-checkbox-wrapper">
                  <div className={`advanced-checkbox ${selectedAges.length === ageOptions.length ? "checked" : ""}`}>
                    {selectedAges.length === ageOptions.length && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span>همه بازه‌های سنی</span>
                </div>
              </div>
              
              {ageOptions.map((age) => (
                <div 
                  key={age.value}
                  className={`advanced-dropdown-option ${selectedAges.includes(age.value) ? "selected" : ""}`}
                  onClick={() => handleAgeSelect(age.value)}
                >
                  <div className="advanced-checkbox-wrapper">
                    <div className={`advanced-checkbox ${selectedAges.includes(age.value) ? "checked" : ""}`}>
                      {selectedAges.includes(age.value) && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span>{age.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

const renderAdoptionFilters = () => {
  if (activeFilter !== "سرپرستی") return null;

  return (
    <div className="advanced-adoption-specific-filters">
      <div className="advanced-adoption-filters-grid">
        <div className="advanced-filter-select-wrapper">
          <FilterField 
            title="انتخاب وضعیت شناسنامه" 
            hasValue={selectedCertificates.length > 0}
          >
            <div 
              className={`advanced-custom-select ${showCertificateDropdown ? 'active' : ''}`} 
              onClick={() => {
                closeAllDropdowns();
                setShowCertificateDropdown(!showCertificateDropdown);
              }}
            >
              <span className="advanced-select-placeholder-text">
                {getMultiSelectPlaceholder(
                  selectedCertificates, 
                  "شناسنامه", 
                  "شناسنامه", 
                  "وضعیت‌ها",
                  statusOptions.length
                )}
              </span>
            </div>
          </FilterField>

          {showCertificateDropdown && (
            <div className="advanced-dropdown-menu advanced-multi-select">
              <div className="advanced-dropdown-options-list">
                <div 
                  className={`advanced-dropdown-option ${selectedCertificates.length === statusOptions.length ? "selected" : ""}`}
                  onClick={() => handleCertificateSelect("all")}
                >
                  <div className="advanced-checkbox-wrapper">
                    <div className={`advanced-checkbox ${selectedCertificates.length === statusOptions.length ? "checked" : ""}`}>
                      {selectedCertificates.length === statusOptions.length && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span>همه وضعیت‌ها</span>
                  </div>
                </div>
                
                {statusOptions.map((status) => (
                  <div 
                    key={status.value}
                    className={`advanced-dropdown-option ${selectedCertificates.includes(status.value) ? "selected" : ""}`}
                    onClick={() => handleCertificateSelect(status.value)}
                  >
                    <div className="advanced-checkbox-wrapper">
                      <div className={`advanced-checkbox ${selectedCertificates.includes(status.value) ? "checked" : ""}`}>
                        {selectedCertificates.includes(status.value) && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span>{status.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="advanced-filter-select-wrapper">
          <FilterField 
            title="انتخاب وضعیت واکسیناسیون" 
            hasValue={selectedVaccinations.length > 0}
          >
            <div 
              className={`advanced-custom-select ${showVaccineDropdown ? 'active' : ''}`} 
              onClick={() => {
                closeAllDropdowns();
                setShowVaccineDropdown(!showVaccineDropdown);
              }}
            >
              <span className="advanced-select-placeholder-text">
                {getMultiSelectPlaceholder(
                  selectedVaccinations, 
                  "واکسیناسیون", 
                  "واکسیناسیون", 
                  "وضعیت‌ها",
                  statusYesNoOptions.length
                )}
              </span>
            </div>
          </FilterField>

          {showVaccineDropdown && (
            <div className="advanced-dropdown-menu advanced-multi-select">
              <div className="advanced-dropdown-options-list">
                <div 
                  className={`advanced-dropdown-option ${selectedVaccinations.length === statusYesNoOptions.length ? "selected" : ""}`}
                  onClick={() => handleVaccineSelect("all")}
                >
                  <div className="advanced-checkbox-wrapper">
                    <div className={`advanced-checkbox ${selectedVaccinations.length === statusYesNoOptions.length ? "checked" : ""}`}>
                      {selectedVaccinations.length === statusYesNoOptions.length && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span>همه وضعیت‌ها</span>
                  </div>
                </div>
                
                {statusYesNoOptions.map((status) => (
                  <div 
                    key={status.value}
                    className={`advanced-dropdown-option ${selectedVaccinations.includes(status.value) ? "selected" : ""}`}
                    onClick={() => handleVaccineSelect(status.value)}
                  >
                    <div className="advanced-checkbox-wrapper">
                      <div className={`advanced-checkbox ${selectedVaccinations.includes(status.value) ? "checked" : ""}`}>
                        {selectedVaccinations.includes(status.value) && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span>{status.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="advanced-filter-select-wrapper">
          <FilterField 
            title="انتخاب وضعیت عقیم‌سازی" 
            hasValue={selectedSterilizations.length > 0}
          >
            <div 
              className={`advanced-custom-select ${showSterilizeDropdown ? 'active' : ''}`} 
              onClick={() => {
                closeAllDropdowns();
                setShowSterilizeDropdown(!showSterilizeDropdown);
              }}
            >
              <span className="advanced-select-placeholder-text">
                {getMultiSelectPlaceholder(
                  selectedSterilizations, 
                  "عقیم سازی", 
                  "عقیم سازی", 
                  "وضعیت‌ها",
                  statusYesNoOptions.length
                )}
              </span>
            </div>
          </FilterField>

          {showSterilizeDropdown && (
            <div className="advanced-dropdown-menu advanced-multi-select">
              <div className="advanced-dropdown-options-list">
                <div 
                  className={`advanced-dropdown-option ${selectedSterilizations.length === statusYesNoOptions.length ? "selected" : ""}`}
                  onClick={() => handleSterilizeSelect("all")}
                >
                  <div className="advanced-checkbox-wrapper">
                    <div className={`advanced-checkbox ${selectedSterilizations.length === statusYesNoOptions.length ? "checked" : ""}`}>
                      {selectedSterilizations.length === statusYesNoOptions.length && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span>همه وضعیت‌ها</span>
                  </div>
                </div>
                
                {statusYesNoOptions.map((status) => (
                  <div 
                    key={status.value}
                    className={`advanced-dropdown-option ${selectedSterilizations.includes(status.value) ? "selected" : ""}`}
                    onClick={() => handleSterilizeSelect(status.value)}
                  >
                    <div className="advanced-checkbox-wrapper">
                      <div className={`advanced-checkbox ${selectedSterilizations.includes(status.value) ? "checked" : ""}`}>
                        {selectedSterilizations.includes(status.value) && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span>{status.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

  const renderActiveFilters = () => {
    const badges = [];

    selectedAnimals.forEach((animal, index) => {
      badges.push({
        key: `animal-${index}`,
        label: `نوع: ${animal}`,
        className: "advanced-animal-badge",
        onRemove: () => {
          const newSelected = selectedAnimals.filter(item => item !== animal);
          setSelectedAnimals(newSelected);
          setFilterAnimal(newSelected.length > 0 ? newSelected.join(",") : "all");
        }
      });
    });

    selectedSexes.forEach((sex, index) => {
      badges.push({
        key: `sex-${index}`,
        label: `جنسیت: ${sex}`,
        className: "advanced-sex-badge",
        onRemove: () => {
          const newSelected = selectedSexes.filter(item => item !== sex);
          setSelectedSexes(newSelected);
          setFilterSex(newSelected.length > 0 ? newSelected.join(",") : "all");
        }
      });
    });

    selectedCities.forEach((city, index) => {
      badges.push({
        key: `city-${index}`,
        label: `شهر: ${city}`,
        className: "advanced-city-badge",
        onRemove: () => {
          const newSelected = selectedCities.filter(item => item !== city);
          setSelectedCities(newSelected);
          setFilterCity(newSelected.length > 0 ? newSelected.join(",") : "all");
        }
      });
    });

    selectedAges.forEach((age, index) => {
      const ageLabels = {
        "under-1": "زیر 1 سال",
        "1-2": "1 تا 2 سال",
        "2-3": "2 تا 3 سال",
        "3-5": "3 تا 5 سال",
        "5-7": "5 تا 7 سال",
        "over-7": "بالای 7 سال"
      };
      badges.push({
        key: `age-${index}`,
        label: `سن: ${ageLabels[age]}`,
        className: "advanced-age-badge",
        onRemove: () => {
          const newSelected = selectedAges.filter(item => item !== age);
          setSelectedAges(newSelected);
          setFilterAge(newSelected.length > 0 ? newSelected.join(",") : "all");
        }
      });
    });

    if (activeFilter === "سرپرستی") {
      selectedCertificates.forEach((cert, index) => {
        badges.push({
          key: `certificate-${index}`,
          label: `شناسنامه: ${cert === "yes" ? "دارد" : "ندارد"}`,
          className: "advanced-certificate-badge",
          onRemove: () => {
            const newSelected = selectedCertificates.filter(item => item !== cert);
            setSelectedCertificates(newSelected);
            setFilterHasCertificate(newSelected.length > 0 ? newSelected.join(",") : "all");
          }
        });
      });

      selectedVaccinations.forEach((vaccine, index) => {
        badges.push({
          key: `vaccine-${index}`,
          label: `واکسیناسیون: ${vaccine === "yes" ? "انجام شده" : "انجام نشده"}`,
          className: "advanced-vaccine-badge",
          onRemove: () => {
            const newSelected = selectedVaccinations.filter(item => item !== vaccine);
            setSelectedVaccinations(newSelected);
            setFilterIsVaccinated(newSelected.length > 0 ? newSelected.join(",") : "all");
          }
        });
      });

      selectedSterilizations.forEach((sterilize, index) => {
        badges.push({
          key: `sterilize-${index}`,
          label: `عقیم‌سازی: ${sterilize === "yes" ? "انجام شده" : "انجام نشده"}`,
          className: "advanced-sterilize-badge",
          onRemove: () => {
            const newSelected = selectedSterilizations.filter(item => item !== sterilize);
            setSelectedSterilizations(newSelected);
            setFilterIsSterilized(newSelected.length > 0 ? newSelected.join(",") : "all");
          }
        });
      });
    }

    if (badges.length === 0) return null;

    return (
      <div className="advanced-active-filters-display">
        <div className="advanced-active-filters-header">
          <span className="advanced-active-filters-label">
            {badges.length} فیلتر فعال:
          </span>
          <button 
            className="advanced-clear-filters-btn"
            onClick={handleClearAllFilters}
          >
            <img src="/src/assets/icons/close.svg" alt="پاک کردن" className="advanced-clear-icon" />
            پاک کردن همه فیلترها
          </button>
        </div>
        <div className="advanced-active-filters-badges">
          {badges.map((badge) => (
            <div 
              key={badge.key} 
              className={`advanced-active-filter-badge ${badge.className}`}
            >
              <span>{badge.label}</span>
              <button 
                className="advanced-remove-filter-btn"
                onClick={badge.onRemove}
              >
                <img src="/src/assets/icons/close.svg" alt="حذف" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="advanced-filters-container" ref={dropdownRef}>
      <div className={`advanced-toggle-box ${isOpen ? 'advanced-open' : ''} ${getActiveFiltersCount() > 0 ? 'advanced-active' : 'advanced-inactive'}`}>
        <div 
          className="advanced-toggle-content"
          onClick={handleToggleClick}
        >
          <div className="advanced-toggle-title">
            <div className="advanced-toggle-icon-wrapper">
              <img src="/src/assets/icons/filter-search.svg" alt="filter" className="advanced-toggle-icon" />
            </div>
            <div className="advanced-toggle-texts">
              <span className="advanced-toggle-text">فیلترهای پیشرفته</span>
              <span className="advanced-toggle-description">
                {getFiltersDescription()}
              </span>
            </div>
          </div>
          
          <div className={`advanced-toggle-arrow ${isOpen ? "open" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 9L12 16L5 9" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        {isOpen && (
          <div className="advanced-options-wrapper">
            <div className="advanced-main-filters-section">
              {renderMainFilters()}
            </div>

            <div className="advanced-adoption-filters-section">
              {renderAdoptionFilters()}
            </div>

            <div className="advanced-active-filters-section">
              {renderActiveFilters()}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilters;
