import React from "react";
import "../../styles/Pagination.css";

export const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  onPrevious, 
  onNext 
}) => {
  return (
    <div className="pagination">
      <button 
        className="pagination-button" 
        onClick={onPrevious} 
        disabled={currentPage === 1 || totalPages <= 1}
        aria-label="صفحه قبل"
      >
        <ChevronRightIcon />
      </button>

      <div className="pagination-pages">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`pagination-page-button ${currentPage === page ? "active" : ""}`}
            onClick={() => onPageChange(page)}
            aria-label={`صفحه ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      <button 
        className="pagination-button" 
        onClick={onNext} 
        disabled={currentPage === totalPages || totalPages <= 1}
        aria-label="صفحه بعد"
      >
        <ChevronLeftIcon />
      </button>
    </div>
  );
};

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);