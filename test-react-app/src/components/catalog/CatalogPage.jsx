import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import RegionNavigation from './RegionNavigation';
import CafeList from './CafeList';
import { fetchAllCafesData } from '../../data/cleanedCafesData';
import { filterCafesByRegion } from '../../utils/regionFilter';

const CatalogPage = ({ onViewCafe }) => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [allCafes, setAllCafes] = useState([]); // Complete dataset
  const [selectedRegion, setSelectedRegion] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filtered and displayed data
  const [filteredCafes, setFilteredCafes] = useState([]); // All cafes matching current filter + search
  const [displayedCafes, setDisplayedCafes] = useState([]); // Currently shown cafes (paginated)
  const [displayLimit, setDisplayLimit] = useState(30); // How many to show
  
  // Refs for animations
  const headerRef = useRef(null);
  const subheaderRef = useRef(null);
  const searchRef = useRef(null);
  
  // Load all cafe data once on component mount
  useEffect(() => {
    const loadAllCafes = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllCafesData();
        setAllCafes(data);
      } catch (error) {
        console.error('Error loading cafes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllCafes();
  }, []);
  
  // Filter and sort cafes when region or search changes
  useEffect(() => {
    if (allCafes.length === 0) return;
    
    // First apply region filter
    let filtered = filterCafesByRegion(allCafes, selectedRegion);
    
    // Then apply search filter if there's a search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cafe => 
        cafe.name.toLowerCase().includes(term) || 
        (cafe.tags && cafe.tags.some(tag => tag.toLowerCase().includes(term))) ||
        (cafe.description && cafe.description.toLowerCase().includes(term))
      );
    }
    
    // Sort by highest Google review count (highest first)
    filtered = filtered.sort((a, b) => {
      const reviewCountA = parseInt(a.reviewCount) || 0;
      const reviewCountB = parseInt(b.reviewCount) || 0;
      return reviewCountB - reviewCountA; // Descending order (highest to lowest)
    });
    
    setFilteredCafes(filtered);
    setDisplayLimit(30); // Reset to show first 30 when filter changes
  }, [allCafes, selectedRegion, searchTerm]);
  
  // Update displayed cafes when filtered cafes or display limit changes
  useEffect(() => {
    setDisplayedCafes(filteredCafes.slice(0, displayLimit));
  }, [filteredCafes, displayLimit]);
  
  // Handle region change from navigation
  const handleRegionChange = (region) => {
    setSelectedRegion(region);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle load more cafes
  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 30);
  };
  
  // Check if there are more cafes to load
  const hasMore = filteredCafes.length > displayLimit;
  
  // Animation for page elements on load
  useEffect(() => {
    // Headers animation
    gsap.fromTo(
      headerRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
    
    gsap.fromTo(
      subheaderRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" }
    );
    
    // Search input animation
    gsap.fromTo(
      searchRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 0.4, ease: "power3.out" }
    );
  }, []);
  
  return (
    <div className="catalog-page">
      <div className="catalog-hero">
        <div className="container">
          <h1 ref={headerRef}>Katalog Cafe</h1>
          <p ref={subheaderRef}>Temukan cafe favoritmu di Surabaya berdasarkan wilayah dan kebutuhanmu</p>
          
          <div className="search-container" ref={searchRef}>
            <div className="search-input-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#6C757D"/>
              </svg>
              <input
                type="text"
                placeholder="Cari nama cafe, tag, atau deskripsi..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button 
                  className="clear-search-btn" 
                  onClick={() => setSearchTerm("")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#6C757D"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container">
        <RegionNavigation 
          currentRegion={selectedRegion} 
          onRegionChange={handleRegionChange}
          cafes={allCafes}
        />
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Memuat cafe...</p>
          </div>
        ) : (
          <>
            <CafeList
              cafes={displayedCafes}
              totalCount={filteredCafes.length}
              region={selectedRegion}
              onViewCafe={onViewCafe}
            />
            
            {/* Load More Button */}
            {hasMore && (
              <div className="load-more-container">
                <button 
                  className="load-more-btn"
                  onClick={handleLoadMore}
                >
                  Muat Lebih Banyak
                </button>
              </div>
            )}
            
            {/* Results info */}
            <div className="results-info">
              <p>
                Menampilkan {displayedCafes.length} dari {filteredCafes.length} cafe
                {searchTerm && ` untuk "${searchTerm}"`}
                {selectedRegion !== "Semua" && ` di ${selectedRegion}`}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;