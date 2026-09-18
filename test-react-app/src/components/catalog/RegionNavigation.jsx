import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { SURABAYA_REGIONS, getCafeCountsByRegion } from '../../utils/regionFilter';

const RegionNavigation = ({ currentRegion, onRegionChange, cafes = [] }) => {
  const navRef = useRef(null);
  const [regionCounts, setRegionCounts] = useState({});
  
  // Calculate region counts when cafes change
  useEffect(() => {
    if (cafes.length > 0) {
      const counts = getCafeCountsByRegion(cafes);
      setRegionCounts(counts);
    }
  }, [cafes]);
  
  // Define the regions with official districts
  const regions = SURABAYA_REGIONS.map(region => ({
    id: region.key,
    name: region.label,
    color: region.color,
    count: regionCounts[region.key] || 0,
    description: region.description
  }));
  
  // Icons for each region (using SVG for better quality)
  const regionIcons = {
    "Semua": (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
        <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="currentColor"/>
      </svg>
    ),
    "SBY Utara": (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 9.3V20H20V9.3L12 2ZM18 18H6V10.7L12 5.7L18 10.7V18Z" fill="currentColor"/>
        <path d="M12 7L8 10.5V16H16V10.5L12 7ZM14 14H10V11.5L12 9.8L14 11.5V14Z" fill="currentColor"/>
      </svg>
    ),
    "SBY Selatan": (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 12H7V14H17V12Z" fill="currentColor"/>
        <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
      </svg>
    ),
    "SBY Barat": (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 7L9 12L14 17V7Z" fill="currentColor"/>
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
      </svg>
    ),
    "SBY Timur": (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 17L15 12L10 7V17Z" fill="currentColor"/>
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
      </svg>
    ),
    "SBY Pusat": (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
      </svg>
    ),
    "Lainnya": (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
        <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="currentColor"/>
      </svg>
    )
  };
  
  useEffect(() => {
    // Animate the navigation when it loads
    gsap.fromTo(
      ".region-nav-item",
      { 
        y: 20, 
        opacity: 0 
      },
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.1,
        duration: 0.5,
        ease: "power3.out"
      }
    );
    
    // Animate the active indicator line
    gsap.to(
      ".active-region-indicator",
      {
        left: document.querySelector(`.region-nav-item[data-region="${currentRegion}"]`)?.offsetLeft || 0,
        width: document.querySelector(`.region-nav-item[data-region="${currentRegion}"]`)?.offsetWidth || 0,
        duration: 0.3,
        ease: "power2.out"
      }
    );
  }, [currentRegion]);
  
  const handleRegionClick = (region) => {
    if (region !== currentRegion) {
      onRegionChange(region);
      
      // Animate the active indicator line
      gsap.to(
        ".active-region-indicator",
        {
          left: document.querySelector(`.region-nav-item[data-region="${region}"]`).offsetLeft,
          width: document.querySelector(`.region-nav-item[data-region="${region}"]`).offsetWidth,
          duration: 0.3,
          ease: "power2.out"
        }
      );
    }
  };
  
  return (
    <div className="region-navigation" ref={navRef}>
      <div className="region-nav-inner">
        {regions.map(region => (
          <div 
            key={region.id}
            className={`region-nav-item ${currentRegion === region.id ? 'active' : ''}`}
            data-region={region.id}
            onClick={() => handleRegionClick(region.id)}
          >
            <div className="region-icon" style={{ color: region.color }}>
              {regionIcons[region.id]}
            </div>
            <span>{region.name}</span>
            {region.count > 0 && <span className="region-count">({region.count})</span>}
          </div>
        ))}
        <div className="active-region-indicator"></div>
      </div>
    </div>
  );
};

export default RegionNavigation;