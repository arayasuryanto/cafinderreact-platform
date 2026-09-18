import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import CafeCard from './CafeCard';

const CafeList = ({ cafes, totalCount, region, onViewCafe }) => {
  const listRef = useRef(null);
  
  useEffect(() => {
    // Reset scroll position when region changes
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
    
    // Animate the heading
    gsap.fromTo(
      ".cafe-list-heading",
      { 
        y: 20, 
        opacity: 0 
      },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.5,
        ease: "power3.out"
      }
    );
  }, [region]);
  
  const getRegionDisplayName = (region) => {
    if (region === "all" || region === "Semua") return "Semua Wilayah";
    return region;
  };

  const total = totalCount || cafes.length;

  return (
    <div className="cafe-list-container" ref={listRef}>
      <h2 className="cafe-list-heading">
        {cafes.length < total
          ? `Menampilkan ${cafes.length} dari ${total} Cafe di ${getRegionDisplayName(region)}`
          : `${total} Cafe di ${getRegionDisplayName(region)}`}
      </h2>
      
      {cafes.length === 0 ? (
        <div className="no-cafes-message">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#e0e0e0"/>
          </svg>
          <p>Tidak ada cafe yang tersedia untuk region ini saat ini.</p>
        </div>
      ) : (
        <div className="cafe-cards-grid">
          {cafes.map(cafe => (
            <CafeCard 
              key={cafe.id} 
              cafe={cafe} 
              onViewCafe={onViewCafe}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CafeList;