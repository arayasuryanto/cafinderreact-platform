import React, { useState, useEffect } from 'react';
import favoritesService from '../../services/favoritesService';
import './UserDashboard.css';

const UserDashboard = ({ onClose, onViewCafe }) => {
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    loadUserData();
  }, [sortBy]);

  const loadUserData = () => {
    // Favorites live under the anonymous local id (no account system yet)
    const userId = favoritesService.getCurrentUserId();

    // Load favorites with sorting
    const userFavorites = favoritesService.getFilteredFavorites(userId, { sortBy });
    setFavorites(userFavorites);

    // Load stats
    const userStats = favoritesService.getFavoriteStats(userId);
    setStats(userStats);

    // Load achievements
    const userAchievements = JSON.parse(
      localStorage.getItem(`cafinder_achievements_${userId}`) || '[]'
    );
    setAchievements(userAchievements);
  };

  const handleRemoveFavorite = (cafeId) => {
    favoritesService.removeFavorite(favoritesService.getCurrentUserId(), cafeId);
    loadUserData();
  };

  const handleCafeClick = (cafe) => {
    if (onViewCafe) {
      onViewCafe(cafe.cafeId);
      onClose();
    }
  };

  const allAchievements = [
    { id: 'first_favorite', title: 'Pecinta Kopi Pemula', icon: '☕', description: 'Simpan cafe pertamamu' },
    { id: 'cafe_explorer', title: 'Penjelajah Cafe', icon: '🗺️', description: 'Simpan 5 cafe favorit' },
    { id: 'cafe_enthusiast', title: 'Cafe Enthusiast', icon: '🌟', description: 'Simpan 10 cafe favorit' },
    { id: 'cafe_master', title: 'Master Cafe Hunter', icon: '👑', description: 'Simpan 25 cafe favorit' },
    { id: 'cafe_legend', title: 'Legenda Cafe Surabaya', icon: '🏆', description: 'Simpan 50 cafe favorit' }
  ];

  const categoriesData = stats?.categoriesBreakdown || {};
  const topCategory = Object.entries(categoriesData)
    .sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="dashboard-overlay" onClick={onClose}>
      <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
        <button className="dashboard-close" onClick={onClose}>×</button>
        
        <div className="dashboard-header">
          <img src="/images/default-avatar.svg" alt="Pengguna Cafinder" className="dashboard-avatar" />
          <div className="dashboard-user-info">
            <h2>Pengguna Cafinder</h2>
            <p className="user-tagline">Cafe Explorer Level {Math.floor((stats?.totalFavorites || 0) / 5) + 1}</p>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-value">{stats?.totalFavorites || 0}</div>
            <div className="stat-label">Cafe Favorit</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{achievements.length}</div>
            <div className="stat-label">Achievements</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">☕</div>
            <div className="stat-value">{topCategory ? topCategory[0] : '-'}</div>
            <div className="stat-label">Favorit Type</div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Cafe Favorit
          </button>
          <button 
            className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </button>
          <button 
            className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'favorites' && (
            <div className="favorites-section">
              <div className="favorites-controls">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="recent">Terbaru</option>
                  <option value="alphabetical">A-Z</option>
                  <option value="mostVisited">Sering Dikunjungi</option>
                </select>
              </div>

              {favorites.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💔</div>
                  <p>Belum ada cafe favorit</p>
                  <p className="empty-hint">Mulai eksplorasi dan simpan cafe favoritmu!</p>
                </div>
              ) : (
                <div className="favorites-grid">
                  {favorites.map((fav) => (
                    <div key={fav.cafeId} className="favorite-card" onClick={() => handleCafeClick(fav)}>
                      <div 
                        className="favorite-image"
                        style={{ backgroundImage: `url(${fav.cafeImage})` }}
                      >
                        <button 
                          className="remove-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavorite(fav.cafeId);
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <div className="favorite-info">
                        <h4>{fav.cafeName}</h4>
                        <p className="favorite-category">{fav.cafeCategory}</p>
                        <p className="favorite-date">
                          Ditambahkan {new Date(fav.addedAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="achievements-section">
              <div className="achievements-grid">
                {allAchievements.map((achievement) => {
                  const isUnlocked = achievements.includes(achievement.id);
                  return (
                    <div 
                      key={achievement.id} 
                      className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                    >
                      <div className="achievement-icon">{achievement.icon}</div>
                      <h4>{achievement.title}</h4>
                      <p>{achievement.description}</p>
                      {!isUnlocked && <div className="lock-overlay">🔒</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="insights-section">
              <div className="insight-card">
                <h3>🎯 Preferensi Cafe Kamu</h3>
                <div className="category-breakdown">
                  {Object.entries(categoriesData).map(([category, count]) => (
                    <div key={category} className="category-bar">
                      <div className="category-label">
                        <span>{category}</span>
                        <span>{count} cafe</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${(count / stats.totalFavorites) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {stats?.mostVisited && (
                <div className="insight-card">
                  <h3>⭐ Cafe Paling Sering Dikunjungi</h3>
                  <div className="most-visited">
                    <h4>{stats.mostVisited.cafeName}</h4>
                    <p>{stats.mostVisited.visitCount} kali kunjungan</p>
                  </div>
                </div>
              )}

              <div className="insight-card">
                <h3>💡 Fun Fact</h3>
                <p className="fun-fact">
                  Kamu telah menjelajahi {stats?.totalFavorites || 0} dari 100+ cafe di Surabaya! 
                  {stats?.totalFavorites > 20 && ' Wow, kamu benar-benar cafe explorer sejati! 🌟'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;