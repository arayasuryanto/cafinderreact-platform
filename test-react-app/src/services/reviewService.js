import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  limit,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../config/firebase';

class ReviewService {
  constructor() {
    this.reviewsCollection = 'reviews';
    this.cafesCollection = 'cafes';
  }

  // Add a new review
  async addReview(cafeId, userId, reviewData) {
    try {
      // Ensure Firebase authentication
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const review = {
        cafeId,
        userId,
        userName: reviewData.userName,
        userPhoto: reviewData.userPhoto,
        rating: reviewData.rating,
        comment: reviewData.comment,
        visitDate: reviewData.visitDate || new Date().toISOString(),
        helpful: 0,
        images: reviewData.images || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.reviewsCollection), review);

      // Update cafe rating
      await this.updateCafeRating(cafeId);

      return docRef.id;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  // Get reviews for a specific cafe
  async getCafeReviews(cafeId, limitCount = 50) {
    try {
      const q = query(
        collection(db, this.reviewsCollection),
        where('cafeId', '==', cafeId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const reviews = [];
      
      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  // Get user's reviews
  async getUserReviews(userId) {
    try {
      const q = query(
        collection(db, this.reviewsCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const reviews = [];
      
      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return reviews;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  }

  // Update a review
  async updateReview(reviewId, updates) {
    try {
      const reviewRef = doc(db, this.reviewsCollection, reviewId);
      await updateDoc(reviewRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Delete a review
  async deleteReview(reviewId, cafeId) {
    try {
      await deleteDoc(doc(db, this.reviewsCollection, reviewId));

      // Update cafe rating after deletion
      await this.updateCafeRating(cafeId);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // Mark review as helpful
  async markHelpful(reviewId) {
    try {
      const reviewRef = doc(db, this.reviewsCollection, reviewId);
      const reviewDoc = await getDoc(reviewRef);
      
      if (reviewDoc.exists()) {
        const currentHelpful = reviewDoc.data().helpful || 0;
        await updateDoc(reviewRef, {
          helpful: currentHelpful + 1
        });
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw error;
    }
  }

  // Update cafe rating based on reviews
  async updateCafeRating(cafeId) {
    try {
      const reviews = await this.getCafeReviews(cafeId, 1000);
      
      if (reviews.length === 0) {
        return;
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      // Store cafe stats in Firestore
      const cafeRef = doc(db, this.cafesCollection, cafeId);
      await setDoc(cafeRef, {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      console.log(`Updated cafe ${cafeId} rating: ${averageRating} (${reviews.length} reviews)`);
    } catch (error) {
      console.error('Error updating cafe rating:', error);
    }
  }

  // Get cafe statistics
  async getCafeStats(cafeId) {
    try {
      const cafeRef = doc(db, this.cafesCollection, cafeId);
      const cafeDoc = await getDoc(cafeRef);
      
      if (cafeDoc.exists()) {
        return cafeDoc.data();
      }
      
      return {
        averageRating: 0,
        totalReviews: 0
      };
    } catch (error) {
      console.error('Error fetching cafe stats:', error);
      return {
        averageRating: 0,
        totalReviews: 0
      };
    }
  }

  // Check if user has reviewed a cafe
  async hasUserReviewed(cafeId, userId) {
    try {
      const q = query(
        collection(db, this.reviewsCollection),
        where('cafeId', '==', cafeId),
        where('userId', '==', userId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking user review:', error);
      return false;
    }
  }
}

export default new ReviewService();