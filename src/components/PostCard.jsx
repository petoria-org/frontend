import { useState } from "react";
import "../styles/PostCard.css";

export default function PostCard() {
  const pet = {
    id: '1',
    name: 'مکس',
    species: 'سگ',
    breed: 'شیواوا',
    age: 2,
    gender: 'نر',
    city: 'تهران، نوفراپارس',
    category: 'سرپرستی',
    vaccinated: true,
    sterilized: false,
    hasIdCard: false,
    diseases: 'مشکلات گوارشی و آلرژی فصلی',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=800&fit=crop',
    imageAlt: 'سگ شیواوا',
    description: 'مکس یک سگ شیواوای دوست‌داشتنی و پرانرژی است که عاشق بازی و گردش است.',
    contactName: 'محمد رضایی',
    contactPhone: '09123456789'
  };

  const handleStartChat = () => {
    alert(`گفتگو با صاحب ${pet.name} آغاز شد!`);
  };

  const ArrowIcon = ({ className }) => (
    <svg 
      className={`arrow-icon ${className}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );

  const CategoryBadge = ({ category }) => {
    const getBadgeColor = (cat) => {
      switch(cat) {
        case 'سرپرستی':
          return 'adoption-badge';
        case 'پیدا شده':
          return 'found-badge';
        case 'گم شده':
          return 'lost-badge';
        default:
          return 'adoption-badge';
      }
    };

    const getBadgeText = (cat) => {
      switch(cat) {
        case 'سرپرستی':
          return 'سپردنیستی';
        case 'پیدا شده':
          return 'پیدا شده';
        case 'گم شده':
          return 'گم شده';
        default:
          return 'سپردنیستی';
      }
    };

    return (
      <span className={`badge ${getBadgeColor(category)}`}>
        {getBadgeText(category)}
      </span>
    );
  };

  const InfoBox = ({ label, value }) => (
    <div className="info-box">
      <div className="info-box-label">{label}</div>
      <div className="info-box-value">{value}</div>
    </div>
  );

  // Toggle Switch component
  const ToggleSwitch = ({ label, active }) => (
    <div className="toggle-switch-container">
      <span className="toggle-label">{label}</span>
      <div className={`toggle-switch ${active ? 'toggle-active' : 'toggle-inactive'}`}>
        <div className="toggle-slider"></div>
      </div>
    </div>
  );

  return (
    <div className="view-details-page rtl-layout">
      <div className="main-container">
        {/* Back button outside the image card - moved to LEFT side */}
        <button
          onClick={() => window.history.back()}
          className="back-button"
        >
          <ArrowIcon className="back-arrow" />
          <span className="back-text">بازگشت به لیست آگهی ها</span>
        </button>

        <div className="pet-card">
          <div className="pet-image-container">
            <img
              src={pet.image}
              alt={pet.imageAlt}
              className="pet-image"
            />
            {/* Category badge on the LEFT side */}
            <CategoryBadge category={pet.category} />
          </div>

          <div className="pet-content">
            <div className="pet-header">
              <h1 className="pet-name">{pet.name}</h1>
            </div>

            <div className="info-grid">
              <InfoBox label="نوع حیوان" value={pet.breed} />
              <InfoBox label="نژاد" value={pet.species} />
              <InfoBox label="جنسیت" value={pet.gender} />
              <InfoBox label="سن" value={`${pet.age} سال`} />
              <InfoBox label="مکان" value={pet.city} />
              <InfoBox label="دسته‌بندی" value={pet.category} />
            </div>

            {/* Diseases Section */}
            <div className="diseases-section">
              <h2 className="section-title">بیماری ها</h2>
              <div className="diseases-box">
                <div className="diseases-content">
                  {pet.diseases || 'هیچ بیماری خاصی گزارش نشده است'}
                </div>
              </div>
              
              <div className="health-grid">
                <ToggleSwitch 
                  label="واکسینه شده" 
                  active={pet.vaccinated} 
                />
                <ToggleSwitch 
                  label="عقیم شده" 
                  active={pet.sterilized} 
                />
                <ToggleSwitch 
                  label="دارای شناسنامه" 
                  active={pet.hasIdCard} 
                />
              </div>
            </div>

            {pet.description && (
              <div className="description-section">
                <h2 className="section-title">توضیحات</h2>
                <p className="description-text">{pet.description}</p>
              </div>
            )}

            {/* Contact Section - Name and Phone side by side */}
            <div className="contact-section">
              <h2 className="section-title">اطلاعات تماس</h2>
              
              <div className="contact-info-side">
                <div className="contact-field-side">
                  <div className="contact-field-side-label">نام و نام خانوادگی</div>
                  <div className="contact-field-side-value">{pet.contactName}</div>
                </div>
                
                <div className="contact-field-side">
                  <div className="contact-field-side-label">شماره تلفن</div>
                  <div className="contact-field-side-value phone-number">{pet.contactPhone}</div>
                </div>
              </div>

              <button
                onClick={handleStartChat}
                className="chat-button"
              >
                شروع گفتگو
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}