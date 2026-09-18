const LOCAL_USER_ID_KEY = 'cafinder_local_user_id';

class FavoritesService {
  constructor() {
    this.storageKey = 'cafinder_favorites';
    this.achievementsKey = 'cafinder_achievements';
  }

  getFavoritesKey(userId) {
    return `${this.storageKey}_${userId}`;
  }

  getAchievementsKey(userId) {
    return `${this.achievementsKey}_${userId}`;
  }

  // Stable anonymous id used when no signed-in user exists,
  // so favorites saved while signed out still persist locally.
  getLocalUserId() {
    try {
      let localId = localStorage.getItem(LOCAL_USER_ID_KEY);
      if (!localId) {
        localId = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(LOCAL_USER_ID_KEY, localId);
      }
      return localId;
    } catch (error) {
      return 'local-guest';
    }
  }

  // Resolve the id favorites should be stored under. Cafinder has no account
  // system yet, so this is always the stable anonymous local id.
  getCurrentUserId() {
    return this.getLocalUserId();
  }

  // Merge favorites saved under the anonymous local id into the signed-in
  // user's list, then clean up the anonymous data. Safe to call repeatedly.
  migrateLocalFavorites(userId) {
    try {
      const localId = localStorage.getItem(LOCAL_USER_ID_KEY);
      if (!localId || localId === userId) return;

      const localFavorites = this.getFavorites(localId);
      if (localFavorites.length > 0) {
        const favorites = this.getFavorites(userId);
        const existingIds = new Set(favorites.map(fav => fav.cafeId));
        localFavorites.forEach(fav => {
          if (!existingIds.has(fav.cafeId)) {
            favorites.push(fav);
          }
        });
        localStorage.setItem(this.getFavoritesKey(userId), JSON.stringify(favorites));
        this.dispatchFavoriteEvent(favorites.length);
      }

      localStorage.removeItem(this.getFavoritesKey(localId));
      localStorage.removeItem(this.getAchievementsKey(localId));
      localStorage.removeItem(LOCAL_USER_ID_KEY);
    } catch (error) {
      // Migration is best-effort; never block the caller on it
    }
  }

  // Get all favorites for a user
  getFavorites(userId) {
    if (!userId) return [];
    const favorites = localStorage.getItem(this.getFavoritesKey(userId));
    return favorites ? JSON.parse(favorites) : [];
  }

  // Check if a cafe is favorited
  isFavorite(userId, cafeId) {
    const favorites = this.getFavorites(userId);
    return favorites.some(fav => fav.cafeId === cafeId);
  }

  // Add a favorite
  addFavorite(userId, cafe) {
    if (!userId) return false;
    
    const favorites = this.getFavorites(userId);
    const timestamp = new Date().toISOString();
    
    // Check if already favorited
    if (favorites.some(fav => fav.cafeId === cafe.id)) {
      return false;
    }

    // Add to favorites with metadata
    favorites.push({
      cafeId: cafe.id,
      cafeName: cafe.name,
      cafeImage: cafe.image,
      cafeCategory: cafe.category,
      cafeAddress: cafe.address,
      addedAt: timestamp,
      visitCount: 0,
      notes: ''
    });

    localStorage.setItem(this.getFavoritesKey(userId), JSON.stringify(favorites));
    
    // Dispatch event for UI updates
    this.dispatchFavoriteEvent(favorites.length);
    
    // Check for achievements
    this.checkAchievements(userId, favorites.length);
    
    // Trigger heart animation
    this.triggerHeartAnimation();
    
    return true;
  }

  // Remove a favorite
  removeFavorite(userId, cafeId) {
    if (!userId) return false;
    
    let favorites = this.getFavorites(userId);
    const initialLength = favorites.length;
    
    favorites = favorites.filter(fav => fav.cafeId !== cafeId);
    
    if (favorites.length < initialLength) {
      localStorage.setItem(this.getFavoritesKey(userId), JSON.stringify(favorites));
      this.dispatchFavoriteEvent(favorites.length);
      return true;
    }
    
    return false;
  }

  // Toggle favorite status
  toggleFavorite(userId, cafe) {
    if (this.isFavorite(userId, cafe.id)) {
      return this.removeFavorite(userId, cafe.id);
    } else {
      return this.addFavorite(userId, cafe);
    }
  }

  // Update visit count for a favorite
  incrementVisitCount(userId, cafeId) {
    const favorites = this.getFavorites(userId);
    const favorite = favorites.find(fav => fav.cafeId === cafeId);
    
    if (favorite) {
      favorite.visitCount++;
      favorite.lastVisited = new Date().toISOString();
      localStorage.setItem(this.getFavoritesKey(userId), JSON.stringify(favorites));
    }
  }

  // Add notes to a favorite
  updateNotes(userId, cafeId, notes) {
    const favorites = this.getFavorites(userId);
    const favorite = favorites.find(fav => fav.cafeId === cafeId);
    
    if (favorite) {
      favorite.notes = notes;
      favorite.notesUpdatedAt = new Date().toISOString();
      localStorage.setItem(this.getFavoritesKey(userId), JSON.stringify(favorites));
    }
  }

  // Get favorites with filters
  getFilteredFavorites(userId, filters = {}) {
    let favorites = this.getFavorites(userId);
    
    if (filters.category) {
      favorites = favorites.filter(fav => fav.cafeCategory === filters.category);
    }
    
    if (filters.sortBy === 'recent') {
      favorites.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    } else if (filters.sortBy === 'mostVisited') {
      favorites.sort((a, b) => b.visitCount - a.visitCount);
    } else if (filters.sortBy === 'alphabetical') {
      favorites.sort((a, b) => a.cafeName.localeCompare(b.cafeName));
    }
    
    return favorites;
  }

  // Get favorite statistics
  getFavoriteStats(userId) {
    const favorites = this.getFavorites(userId);
    const categories = {};
    let totalVisits = 0;
    
    favorites.forEach(fav => {
      categories[fav.cafeCategory] = (categories[fav.cafeCategory] || 0) + 1;
      totalVisits += fav.visitCount;
    });
    
    return {
      totalFavorites: favorites.length,
      totalVisits,
      categoriesBreakdown: categories,
      mostVisited: favorites.sort((a, b) => b.visitCount - a.visitCount)[0],
      recentlyAdded: favorites.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)).slice(0, 5)
    };
  }

  // Achievement system
  checkAchievements(userId, favoriteCount) {
    const achievements = JSON.parse(localStorage.getItem(this.getAchievementsKey(userId)) || '[]');
    const newAchievements = [];

    // Define achievement milestones
    const milestones = [
      { count: 1, id: 'first_favorite', title: 'Pecinta Kopi Pemula', icon: '☕' },
      { count: 5, id: 'cafe_explorer', title: 'Penjelajah Cafe', icon: '🗺️' },
      { count: 10, id: 'cafe_enthusiast', title: 'Cafe Enthusiast', icon: '🌟' },
      { count: 25, id: 'cafe_master', title: 'Master Cafe Hunter', icon: '👑' },
      { count: 50, id: 'cafe_legend', title: 'Legenda Cafe Surabaya', icon: '🏆' }
    ];

    milestones.forEach(milestone => {
      if (favoriteCount >= milestone.count && !achievements.includes(milestone.id)) {
        achievements.push(milestone.id);
        newAchievements.push(milestone);
      }
    });

    if (newAchievements.length > 0) {
      localStorage.setItem(this.getAchievementsKey(userId), JSON.stringify(achievements));
      this.showAchievementNotification(newAchievements[0]);
    }
  }

  // Show achievement notification
  showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-content">
        <div class="achievement-title">Achievement Unlocked!</div>
        <div class="achievement-name">${achievement.title}</div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Dispatch custom event for UI updates
  dispatchFavoriteEvent(count) {
    window.dispatchEvent(new CustomEvent('favoriteUpdated', { 
      detail: { count } 
    }));
  }

  // Trigger heart animation
  triggerHeartAnimation() {
    const heartsContainer = document.getElementById('floating-hearts');
    if (!heartsContainer) return;

    const heart = document.createElement('div');
    heart.className = 'heart-float';
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + 'px';
    heart.style.fontSize = (Math.random() * 20 + 20) + 'px';
    
    heartsContainer.appendChild(heart);
    
    setTimeout(() => heart.remove(), 3000);
  }

  // Get personalized recommendations based on favorites
  getRecommendations(userId, allCafes) {
    const favorites = this.getFavorites(userId);
    if (favorites.length === 0) return [];

    // Count favorite categories
    const categoryCount = {};
    favorites.forEach(fav => {
      categoryCount[fav.cafeCategory] = (categoryCount[fav.cafeCategory] || 0) + 1;
    });

    // Get top 2 favorite categories
    const topCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([category]) => category);

    // Find similar cafes not in favorites
    const favoriteIds = favorites.map(fav => fav.cafeId);
    const recommendations = allCafes
      .filter(cafe => 
        !favoriteIds.includes(cafe.id) && 
        topCategories.includes(cafe.category)
      )
      .slice(0, 6);

    return recommendations;
  }
}

// Export singleton instance
export default new FavoritesService();