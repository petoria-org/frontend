import React, { useState } from "react";
import "../../styles/SortFilters.css";
import { SORT_OPTIONS as sortOptions } from "../../utils/postFilters";

export default function SortFilters({
  sortOrder,
  setSortOrder
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getSortDescription = () => {
    if (!sortOrder) return "مرتب‌سازی غیرفعال است";
    
    const currentOption = sortOptions.find(opt => opt.value === sortOrder);
    if (!currentOption) return "مرتب‌سازی فعال است";
    
    return currentOption.description;
  };

  const handleSortClick = (value) => {
    if (sortOrder === value) {
      setSortOrder("");
    } 
    
    else {
      setSortOrder(value);
    }
  };

  const getActiveOption = () => {
    return sortOptions.find(opt => opt.value === sortOrder);
  };

  return (
    <div className="sort-filters-container">
      <div className={`sort-toggle-box ${isOpen ? 'sort-open' : ''} ${sortOrder ? 'active' : 'inactive'}`}>
        <div 
          className="sort-toggle-content"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="sort-toggle-title">
            <div className="sort-toggle-icon-wrapper">
              <img src="/assets/icons/sort.svg" alt="sort" className="sort-toggle-icon" />
            </div>
            <div className="sort-toggle-texts">
              <span className="sort-toggle-text">مرتب‌سازی</span>
              <span className="sort-toggle-description">
                {getSortDescription()}
              </span>
            </div>
          </div>
          
          <div className={`sort-toggle-arrow ${isOpen ? "open" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 9L12 16L5 9" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        {isOpen && (
          <div className="sort-options-wrapper">
            <div className="sort-options-grid">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  className={`sort-option-btn ${sortOrder === option.value ? "active" : ""}`}
                  onClick={() => handleSortClick(option.value)}
                >
                  <div className="sort-option-content">
                    <span className="sort-option-label">{option.label}</span>
                    <span className="sort-option-desc">{option.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
