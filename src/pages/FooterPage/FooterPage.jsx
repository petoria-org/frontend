import React, { useState, useEffect } from "react";
import { Footer } from "../../components/Footer";
import "../../styles/Footer.css";
import "../../styles/FooterPage.css";
import "../../styles/global.css";

export const FooterPage = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    if (showEditModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showEditModal]);

  const handleEditClick = (ad) => {
    setSelectedAd(ad);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedAd(null);
  };

  const handleSaveAd = (updatedAd) => {
    console.log("آگهی ویرایش شده:", updatedAd);
    setShowEditModal(false);
    setSelectedAd(null);
  };

  return (
    <div className={`screen ${showEditModal ? "modal-open" : ""}`}>
      <div className="screen-background" />
      <div style={{ 
        minHeight: 'calc(100vh - 400px)',
        padding: '40px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
      }}>
        <h1 style={{ 
          fontSize: '4rem', 
          marginBottom: '20px', 
          color: '#1e3a8a',
          marginTop: '100px'
        }}>
          🐾 Petoria
        </h1>
        
        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '20px 40px',
          borderRadius: '15px',
          border: '2px solid #3b82f6',
          marginBottom: '40px',
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)'
        }}>
          <p style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#3b82f6',
            textTransform: 'uppercase'
          }}>
            {currentPage}
          </p>
        </div>
        
        <div style={{
          maxWidth: '600px',
          margin: '0 auto 60px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '25px',
          borderRadius: '15px',
          border: '1px solid #e5e7eb'
        }}>
        </div>
        
        <button
          onClick={() => handleEditClick({ id: 1, title: 'آگهی تست' })}
          style={{
            padding: '15px 30px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 5px 15px rgba(139, 92, 246, 0.3)'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#7c3aed'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#8b5cf6'}
        >

        </button>
      </div>

      {showEditModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '40px' }}>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
};