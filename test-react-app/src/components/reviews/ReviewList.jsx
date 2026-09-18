import React, { useState, useEffect } from 'react';
import reviewService from '../../services/reviewService';
import './ReviewList.css';

const ReviewList = ({ cafeId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });

  useEffect(() => {
    if (cafeId) {
      loadReviews();
      loadStats();
    }
  }, [cafeId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const fetchedReviews = await reviewService.getCafeReviews(cafeId);
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const cafeStats = await reviewService.getCafeStats(cafeId);
      setStats(cafeStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="loader"></div>
        <p>Memuat review...</p>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h3>Review Pengunjung</h3>
        <div className="reviews-summary">
          <div className="average-rating">
            <span className="rating-number">{stats.averageRating || 0}</span>
            <div className="rating-stars">{renderStars(Math.round(stats.averageRating || 0))}</div>
          </div>
          <p className="total-reviews">{stats.totalReviews || 0} review</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>Belum ada review untuk cafe ini.</p>
          <p className="hint">Jadilah yang pertama memberikan review!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <img 
                    src={review.userPhoto || '/images/default-avatar.svg'} 
                    alt={review.userName}
                    className="reviewer-avatar"
                  />
                  <div>
                    <h4 className="reviewer-name">{review.userName}</h4>
                    <div className="review-meta">
                      <span className="review-rating">{renderStars(review.rating)}</span>
                      <span className="review-date">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="review-comment">{review.comment}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="review-images">
                  {review.images.map((image, index) => (
                    <img key={index} src={image} alt={`Review ${index + 1}`} />
                  ))}
                </div>
              )}
              
              <div className="review-actions">
                <button className="helpful-btn">
                  👍 Membantu ({review.helpful || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;