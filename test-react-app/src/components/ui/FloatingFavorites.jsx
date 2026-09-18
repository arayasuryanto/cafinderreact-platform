import React, { useState, useEffect } from 'react';
import favoritesService from '../../services/favoritesService';
import './FloatingFavorites.css';

const FloatingFavorites = ({ onOpen }) => {
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Favorites are stored under the anonymous local id (no account system yet)
    const favorites = favoritesService.getFavorites(favoritesService.getCurrentUserId());
    setFavoriteCount(favorites.length);
  }, []);

  useEffect(() => {
    // Listen for favorite updates
    const handleFavoriteUpdate = (e) => {
      if (e.detail && e.detail.count !== undefined) {
        setFavoriteCount(e.detail.count);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
      }
    };

    window.addEventListener('favoriteUpdated', handleFavoriteUpdate);
    return () => window.removeEventListener('favoriteUpdated', handleFavoriteUpdate);
  }, []);

  const handleClick = () => {
    onOpen();
    setShowTooltip(false);
  };

  return (
    <div className="floating-favorites-container">
      <button 
        className={`floating-favorites-btn ${isAnimating ? 'animating' : ''}`}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="favorites-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        {favoriteCount > 0 && (
          <span className="favorites-count">{favoriteCount}</span>
        )}
        
        <div className="pulse-ring"></div>
        <div className="pulse-ring delay"></div>
      </button>

      {showTooltip && (
        <div className="favorites-tooltip">
          {favoriteCount === 0 
            ? 'Simpan cafe favoritmu!' 
            : `${favoriteCount} cafe tersimpan`
          }
        </div>
      )}

      {/* Floating hearts animation when favoriting */}
      <div className="floating-hearts" id="floating-hearts"></div>
    </div>
  );
};

export default FloatingFavorites;