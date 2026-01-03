import React from 'react';
import "../../styles/AnimalTypes.css";

import dogType from "../../assets/images/dog_type.png";
import catType from "../../assets/images/cat_type.png";
import rabbitType from "../../assets/images/rabbit_type.png";
import hamsterType from "../../assets/images/hamster_type.png";
import birdType from "../../assets/images/bird_type.png";
import otherType from "../../assets/images/other_type.png";

export default function AnimalTypes() {
  const animalTypes = [
    { id: 1, name: "سگ", image: dogType, alt: "سگ", color: "#4A90E2" },
    { id: 2, name: "گربه", image: catType, alt: "گربه", color: "#FF6B8B" },
    { id: 3, name: "خرگوش", image: rabbitType, alt: "خرگوش", color: "#87CEEB" },
    { id: 4, name: "همستر", image: hamsterType, alt: "همستر", color: "#FF9EAD" },
    { id: 5, name: "پرنده", image: birdType, alt: "پرنده", color: "#A6D8FF" },
    { id: 6, name: "سایر", image: otherType, alt: "حیوانات دیگر", color: "#FFD1DC" }
  ];

  return (
    <div className="animal-types-section">
      <div className="animal-types-container">
        <div className="animal-types-header">
          <h2 className="animal-types-title">
            انواع حیوانات در <span className="highlight">پتوریا</span>
          </h2>
          <p className="animal-types-subtitle">
            با انواع حیوانات خانگی که می‌توانید در سایت پیدا کنید آشنا شوید
          </p>
        </div>
        
        <div className="animal-types-wave-container">
          <div className="wave-line"></div>
          
          <div className="animal-types-wave-line">
            {animalTypes.map((animal, index) => (
              <div 
                key={animal.id} 
                className={`animal-type-item ${index % 2 === 0 ? 'wave-up' : 'wave-down'}`}
                style={{ 
                  animationDelay: `${index * 0.15}s`,
                  '--animal-color': animal.color
                }}
              >
                <div className="animal-type-circle">
                  <div className="circle-outer-glow"></div>
                  <div className="circle-inner-glow"></div>
                  
                  <div className="animal-type-image-wrapper">
                    <img 
                      src={animal.image} 
                      alt={animal.alt}
                      className="animal-type-image"
                    />
                    <div className="image-overlay"></div>
                  </div>
                  
                  <div className="circle-pulse"></div>
                </div>
                
                <div className="animal-type-name">
                  <span className="name-text">{animal.name}</span>
                  <div className="name-underline"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}