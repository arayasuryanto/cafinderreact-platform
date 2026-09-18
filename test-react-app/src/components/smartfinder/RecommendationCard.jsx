import React, { useEffect, useRef, useState } from 'react';
import { navigateToCafePage } from '../../utils/smartFinderUtils';
import { normalizeOpeningHours } from '../../utils/cafeDataAdapter';

const RecommendationCard = ({ cafe, onSwipe, currentIndex, totalCount, isActive = true }) => {
  const cardRef = useRef(null);
  const contentRef = useRef(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  // Real photos only: the cafe's own image, no stock fallbacks
  const images = React.useMemo(() => {
    if (cafe.imageUrl) return [cafe.imageUrl];

    if (Array.isArray(cafe.images)) {
      const urls = cafe.images
        .map(img => (typeof img === 'string' ? img : img && img.url))
        .filter(Boolean);
      if (urls.length > 0) return urls;
    }

    return [];
  }, [cafe.imageUrl, cafe.images]);

  // Normalized opening hours: [{day, hours}] with plain string values
  const openingHours = React.useMemo(() => normalizeOpeningHours(cafe.openingHours), [cafe.openingHours]);

  useEffect(() => {
    // Only animate if this is the active card
    if (isActive && cardRef.current) {
      cardRef.current.classList.add('recommendation-card-active');

      // Instant reveal using CSS
      cardRef.current.style.opacity = '1';
      cardRef.current.style.transform = 'scale(1)';
    }

    // Reset scroll state for new card
    setIsScrolled(false);
    setCurrentImageIndex(0);
    setImageFailed(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [cafe, isActive]);

  useEffect(() => {
    setImageFailed(false);
  }, [currentImageIndex]);

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    setIsScrolled(scrollTop > 20);
  };

  const handleImageNavigation = (direction) => {
    if (direction === 'next' && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleStart = (e) => {
    if (!isActive) return; // Only active card can be swiped

    isDragging.current = true;
    startX.current = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;

    // Disable transitions for immediate response
    const card = cardRef.current;
    card.style.transition = 'none';
    card.style.willChange = 'transform';
  };

  const handleMove = (e) => {
    if (!isDragging.current || !isActive) return;

    e.preventDefault();
    currentX.current = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    const rotation = deltaX * 0.03; // Even less rotation for smoother feel

    // Direct DOM manipulation for zero lag
    const card = cardRef.current;
    if (!card) return;

    // Use transform3d for hardware acceleration
    card.style.transform = `translate3d(${deltaX}px, 0, 0) rotateZ(${rotation}deg)`;

    // Optimize indicator updates
    const threshold = 80;
    const hasRight = card.classList.contains('swiping-right');
    const hasLeft = card.classList.contains('swiping-left');

    if (deltaX > threshold && !hasRight) {
      card.classList.add('swiping-right');
      card.classList.remove('swiping-left');
    } else if (deltaX < -threshold && !hasLeft) {
      card.classList.add('swiping-left');
      card.classList.remove('swiping-right');
    } else if (Math.abs(deltaX) <= threshold && (hasRight || hasLeft)) {
      card.classList.remove('swiping-right', 'swiping-left');
    }
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const deltaX = currentX.current - startX.current;
    const threshold = 90;
    const card = cardRef.current;
    card.style.willChange = 'auto';

    if (Math.abs(deltaX) > threshold) {
      // Swipe detected - ultra fast animation
      const direction = deltaX > 0 ? 'right' : 'left';

      // Use CSS for smooth GPU-accelerated animation
      card.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1), opacity 0.15s ease-out';
      card.style.transform = `translate3d(${direction === 'right' ? 600 : -600}px, 0, 0) rotateZ(${direction === 'right' ? 20 : -20}deg)`;
      card.style.opacity = '0';

      // Trigger callback quickly
      setTimeout(() => {
        if (onSwipe) onSwipe(direction);
      }, 150);
    } else {
      // Snap back with spring animation
      card.style.transition = 'transform 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      card.style.transform = 'translate3d(0, 0, 0) rotateZ(0deg)';
      card.classList.remove('swiping-right', 'swiping-left');

      // Clean up transition
      setTimeout(() => {
        card.style.transition = '';
      }, 150);
    }
  };

  const handleButtonSwipe = (direction) => {
    if (!isActive) return;

    const card = cardRef.current;

    // Add swipe indicator
    card.classList.add(direction === 'left' ? 'swiping-left' : 'swiping-right');

    // Ultra fast swipe animation
    card.style.willChange = 'transform, opacity';
    card.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1), opacity 0.15s ease-out';
    card.style.transform = `translate3d(${direction === 'right' ? 600 : -600}px, 0, 0) rotateZ(${direction === 'right' ? 20 : -20}deg)`;
    card.style.opacity = '0';

    // Quick callback
    setTimeout(() => {
      if (onSwipe) onSwipe(direction);
    }, 150);
  };

  const hasImage = images.length > 0 && !imageFailed;
  const locationText = cafe.location || cafe.fullAddress || null;

  return (
    <div className="recommendation-screen phase-content">
      <div className="recommendation-header">
        <div className="counter">{currentIndex} / {totalCount}</div>
        <div className="match-badge">Rekomendasi</div>
      </div>

      <div
        className={`recommendation-card bumble-style-full ${isScrolled ? 'scrolled' : ''}`}
        ref={cardRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* Swipe Indicators - Fixed position */}
        <div className="swipe-indicator left">
          <span>SKIP</span>
        </div>
        <div className="swipe-indicator right">
          <span>SAVE</span>
        </div>

        {/* Full Scrollable Content */}
        <div
          className="full-scroll-content"
          ref={contentRef}
          onScroll={handleScroll}
        >
          {/* Image Gallery Section */}
          <div className="image-gallery-section">
            <div className="main-image">
              {hasImage ? (
                <img
                  src={images[currentImageIndex]}
                  alt={cafe.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="image-placeholder">
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
                    <path d="M6 2v2M10 2v2M14 2v2" />
                  </svg>
                  <span>Foto belum tersedia</span>
                </div>
              )}
              <div className="image-overlay-bg" />
              {/* Image Navigation Areas */}
              {images.length > 1 && (
                <>
                  <div
                    className="image-nav-area left"
                    onClick={() => handleImageNavigation('prev')}
                  />
                  <div
                    className="image-nav-area right"
                    onClick={() => handleImageNavigation('next')}
                  />
                </>
              )}

              {/* Image Indicators */}
              {images.length > 1 && (
                <div className="image-indicators">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`image-dot ${index === currentImageIndex ? 'active' : ''}`}
                    />
                  ))}
                </div>
              )}

              {/* Bottom Gradient Overlay */}
              <div className="image-overlay" />

              {/* Key Info Overlay - Bumble Style */}
              <div className="cafe-info-overlay">
                <div className="cafe-name-large">{cafe.name}</div>
                {locationText && (
                  <div className="cafe-location-main">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="white" strokeWidth="2" fill="none"/>
                      <circle cx="12" cy="8.5" r="2.5" stroke="white" strokeWidth="2" fill="none"/>
                    </svg>
                    {locationText}
                  </div>
                )}

                {/* Quick Tags - real facility names only */}
                {cafe.features && cafe.features.length > 0 && (
                  <div className="quick-tags">
                    {cafe.features.slice(0, 2).map((feature, index) => (
                      <span key={index} className="quick-tag">
                        {feature}
                      </span>
                    ))}
                  </div>
                )}

                {/* Rating if available */}
                {cafe.rating && (
                  <div className="rating-display">
                    <span className="star">⭐</span>
                    <span>{cafe.rating}</span>
                    {cafe.totalReviews != null && <span className="review-count">({cafe.totalReviews})</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Details Section */}
          <div className="content-details-section">
            {/* Scroll Indicator */}
            <div className="scroll-indicator-mini">
              <div className="scroll-bar-mini" />
            </div>

            {/* Detailed Content */}
            <div className="detailed-content-full">
              {/* Description - Same as catalog page */}
              {(cafe.description || (cafe.aboutDetails && cafe.aboutDetails.length > 0)) && (
                <div className="detail-block">
                  <h4>Tentang Cafe</h4>
                  {cafe.description && <p>{cafe.description}</p>}
                  {cafe.aboutDetails && cafe.aboutDetails.length > 0 && (
                    <div className="about-details">
                      {cafe.aboutDetails.slice(0, 2).map((detail, index) => (
                        <p key={index} className="about-detail">{detail}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Opening Hours - Same format as catalog page */}
              <div className="detail-block">
                <h4>Jam Buka</h4>
                {openingHours.length > 0 ? (
                  <div className="opening-hours">
                    {openingHours.map((entry, index) => (
                      <div key={index} className="hours-item">
                        {entry.day ? `${entry.day}: ` : ''}{entry.hours}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="hours-item">Jam buka belum tersedia - hubungi langsung</div>
                )}
              </div>

              {/* Features */}
              {cafe.features && cafe.features.length > 0 && (
                <div className="detail-block">
                  <h4>Fasilitas</h4>
                  <div className="features-grid">
                    {cafe.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <span className="feature-text">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Match Reasons */}
              {cafe.matchReasons && cafe.matchReasons.length > 0 && (
                <div className="detail-block">
                  <h4>Mengapa Cocok untuk Anda</h4>
                  <div className="match-reasons-list">
                    {cafe.matchReasons.map((reason, index) => (
                      <div key={index} className="match-reason-item">
                        <span className="check-icon">✓</span>
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Tags */}
              {cafe.tags && cafe.tags.length > 0 && (
                <div className="detail-block">
                  <h4>Tags</h4>
                  <div className="all-tags">
                    {cafe.tags.map((tag, index) => (
                      <span key={index} className="detail-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Detail page action */}
              <div className="detail-block view-detail-block">
                <button
                  className="view-detail-btn"
                  onClick={() => navigateToCafePage(cafe.id)}
                >
                  Lihat Detail
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Spacer above the action bar */}
              <div className="bottom-spacer-full" />
            </div>
          </div>
        </div>

        {/* Action Buttons - bottom bar, kept clear of the content */}
        <div className="card-actions-bumble-fixed">
          <button
            className="action-btn-bumble skip"
            onClick={() => handleButtonSwipe('left')}
            title="Skip"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            className="action-btn-bumble save"
            onClick={() => handleButtonSwipe('right')}
            title="Save to Favorites"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20.84 4.61C19.58 3.35 17.56 3.35 16.3 4.61L12 8.91L7.7 4.61C6.44 3.35 4.42 3.35 3.16 4.61C1.9 5.87 1.9 7.89 3.16 9.15L12 18L20.84 9.15C22.1 7.89 22.1 5.87 20.84 4.61Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
