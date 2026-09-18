import React from 'react';
import { gsap } from 'gsap';
import { useRef, useEffect } from 'react';
import FavoriteButton from '../ui/FavoriteButton';

const CafeCard = ({ cafe, onViewCafe }) => {
  const cardRef = useRef(null);
  
  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { 
        y: 50, 
        opacity: 0 
      },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.6,
        delay: 0.1,
        ease: "power3.out"
      }
    );
  }, []);
  
  const handleViewCafe = () => {
    // Call the onViewCafe function with the cafe's ID
    if (onViewCafe) {
      onViewCafe(cafe.id);
    }
  };
  
  // Get the right image source - cafe data structure might differ
  const PLACEHOLDER_IMAGE = '/images/placeholder-cafe.svg';

  const getImageSource = () => {
    let url = null;
    if (cafe.images && cafe.images.length > 0) {
      url = cafe.images[0].url;
    } else if (cafe.image) {
      url = cafe.image;
    } else if (cafe.imageUrl) {
      url = cafe.imageUrl;
    }
    if (!url) return PLACEHOLDER_IMAGE;
    // Request a thumbnail-sized version from Google's image CDN
    return url.includes('googleusercontent')
      ? url.replace(/=w\d+-h\d+.*$/, '=w400-h300-k-no')
      : url;
  };

  const handleImageError = (e) => {
    const img = e.currentTarget;
    if (img.src !== PLACEHOLDER_IMAGE) {
      img.src = PLACEHOLDER_IMAGE;
    }
    img.onerror = null;
  };

  // Get address - different formats might be available
  const getAddress = () => {
    if (cafe.fullAddress) {
      return cafe.fullAddress;
    } else if (cafe.address) {
      return cafe.address;
    }
    return `${cafe.neighborhood || ''}, ${cafe.city || 'Surabaya'}`;
  };

  // Convert "4 PM to 10 PM" style hours to "16.00–22.00" (Indonesian convention)
  const formatHours = (hoursText) => {
    if (!hoursText) return null;
    const match = hoursText.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*(?:to|-|–)\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
    if (!match) return hoursText;
    const to24 = (h, ap) => {
      let hour = parseInt(h, 10) % 12;
      if (ap.toUpperCase() === 'PM') hour += 12;
      return `${String(hour).padStart(2, '0')}.00`;
    };
    return `${to24(match[1], match[3])}–${to24(match[4], match[6])}`;
  };

  // Get current opening hours (data nests hours as {day, hours: {day, hours: "..."}})
  const getCurrentHours = () => {
    if (!cafe.openingHours || cafe.openingHours.length === 0) {
      return null;
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = cafe.openingHours.find(day => day.day === today);

    if (todayHours && todayHours.hours) {
      const raw = typeof todayHours.hours === 'string'
        ? todayHours.hours
        : todayHours.hours.hours;
      return formatHours(raw);
    }
    return null;
  };


  return (
    <div className="cafe-catalog-card" ref={cardRef}>
      <div
        className="cafe-catalog-img"
        onClick={handleViewCafe}
      >
        <img
          className="cafe-catalog-img-el"
          src={getImageSource()}
          alt={cafe.name}
          loading="lazy"
          onError={handleImageError}
        />
        <FavoriteButton cafe={cafe} size="medium" />
        {cafe.rating && (
          <div className="cafe-rating">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFC107"/>
            </svg>
            <span>{cafe.rating}</span>
            {(cafe.totalReviews || cafe.reviewCount) > 0 && (
              <small className="review-count">({cafe.totalReviews || cafe.reviewCount})</small>
            )}
          </div>
        )}
      </div>
      <div className="cafe-catalog-details">
        <h3 className="cafe-catalog-name" onClick={handleViewCafe}>{cafe.name}</h3>
        
        <p className="cafe-catalog-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#6C757D"/>
          </svg>
          <span>{getAddress()}</span>
        </p>

        {/* Opening Hours */}
        <div className="cafe-catalog-hours">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="#6C757D"/>
          </svg>
          <span>{getCurrentHours() || "Jam belum tersedia"}</span>
        </div>

        {/* Contact Info */}
        <div className="cafe-catalog-contact">
          {cafe.phone && (
            <div className="contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" fill="#6C757D"/>
              </svg>
              <span>{cafe.phone}</span>
            </div>
          )}
          
          {cafe.website && (
            <div className="contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM18.92 8H15.97C15.65 6.75 15.19 5.55 14.59 4.44C16.43 5.07 17.96 6.35 18.92 8ZM12 4.04C12.83 5.24 13.48 6.57 13.91 8H10.09C10.52 6.57 11.17 5.24 12 4.04ZM4.26 14C4.1 13.36 4 12.69 4 12C4 11.31 4.1 10.64 4.26 10H7.64C7.56 10.66 7.5 11.32 7.5 12C7.5 12.68 7.56 13.34 7.64 14H4.26ZM5.08 16H8.03C8.35 17.25 8.81 18.45 9.41 19.56C7.57 18.93 6.04 17.66 5.08 16ZM8.03 8H5.08C6.04 6.34 7.57 5.07 9.41 4.44C8.81 5.55 8.35 6.75 8.03 8ZM12 19.96C11.17 18.76 10.52 17.43 10.09 16H13.91C13.48 17.43 12.83 18.76 12 19.96ZM14.34 14H9.66C9.57 13.34 9.5 12.68 9.5 12C9.5 11.32 9.57 10.65 9.66 10H14.34C14.43 10.65 14.5 11.32 14.5 12C14.5 12.68 14.43 13.34 14.34 14ZM14.59 19.56C15.19 18.45 15.65 17.25 15.97 16H18.92C17.96 17.65 16.43 18.93 14.59 19.56ZM16.36 14C16.44 13.34 16.5 12.68 16.5 12C16.5 11.32 16.44 10.66 16.36 10H19.74C19.9 10.64 20 11.31 20 12C20 12.69 19.9 13.36 19.74 14H16.36Z" fill="#6C757D"/>
              </svg>
              <span>{cafe.website.includes('instagram.com') ? 'Instagram' : 'Website'}</span>
            </div>
          )}
          
          {!cafe.phone && !cafe.website && (
            <div className="contact-item">
              <span>Kontak belum tersedia</span>
            </div>
          )}
        </div>


        {/* Fixed height container for description and button */}
        <div className="cafe-content-container">
          {cafe.description && (
            <p className="cafe-catalog-desc">{cafe.description}</p>
          )}
          <button className="view-cafe-btn" onClick={handleViewCafe}>Lihat Detail</button>
        </div>
      </div>
    </div>
  );
};

export default CafeCard;