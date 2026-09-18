import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import styles
import './App.css';

// Import layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Import UI components
import CursorFollower from './components/ui/CursorFollower';
import ProgressBar from './components/ui/ProgressBar';
import FloatingFavorites from './components/ui/FloatingFavorites';

// Import Auth Context
import { AuthProvider } from './contexts/AuthContext';

// Import Dashboard
import UserDashboard from './components/dashboard/UserDashboard';

// Import Home sections
import Hero from './components/home/Hero';
import InteractiveFinder from './components/home/InteractiveFinder';
import MapCTA from './components/home/MapCTA';
import CafeDiscoveryMap from './components/home/CafeDiscoveryMap';
import SmartFinderCTA from './components/home/SmartFinderCTA';
import Testimonials from './components/home/Testimonials';
import './components/home/HomePage.css';

// Import Catalog components
import CatalogPage from './components/catalog/CatalogPage';
import './components/catalog/CatalogPage.css';

// Import Cafe Page components
import SimpleCafePage from './components/cafe/SimpleCafePage';
import './components/cafe/SimpleCafePage.css';

// Import Map components
import CafeMapPage from './components/map/CafeMapPage';

// Import About components
import TentangKamiPage from './components/about/TentangKamiPage';

// Import Smart Finder components
import SmartFinderPage from './components/smartfinder/SmartFinderPage';

// Import Recommendations components
import CategoryRecommendationsPage from './components/recommendations/CategoryRecommendationsPage';
import NeedBasedRecommendations from './components/recommendations/NeedBasedRecommendations';
import RegionalExplorationPage from './components/recommendations/RegionalExplorationPage';

// Import cleaned cafes data utilities
import { fetchCafeById } from './data/cleanedCafesData';

// Import data adapter utilities
import { adaptCafeDataForSinglePage } from './utils/cafeDataAdapter';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const PAGE_TITLES = {
  home: 'Cafinder - Temukan Spot Nongkrong Cepat',
  catalog: 'Katalog Cafe Surabaya - Cafinder',
  map: 'Peta Cafe Surabaya - Cafinder',
  'tentang-kami': 'Tentang Kami - Cafinder',
  'smart-finder': 'Smart Finder - Cafinder',
  recommendations: 'Rekomendasi Cafe - Cafinder',
  'need-based-recommendations': 'Rekomendasi Berdasarkan Kebutuhan - Cafinder',
  'regional-exploration': 'Jelajahi Cafe per Wilayah - Cafinder',
  'not-found': 'Halaman Tidak Ditemukan - Cafinder',
};

// Resolve a pathname to a page. Exact matches only; anything else is a 404.
const resolveRoute = (path) => {
  const cleanPath = path.split('?')[0].replace(/\/+$/, '') || '/';
  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length === 0) return { page: 'home' };
  if (segments[0] === 'catalog' && segments.length === 1) return { page: 'catalog' };
  if (segments[0] === 'catalog' && segments[1] === 'cafe' && segments[2]) {
    return { page: 'cafe', cafeId: decodeURIComponent(segments[2]) };
  }
  if (segments[0] === 'map') return { page: 'map' };
  if (segments[0] === 'tentang-kami' || segments[0] === 'about') return { page: 'tentang-kami' };
  if (segments[0] === 'finder' || segments[0] === 'smart-finder') return { page: 'smart-finder' };
  if (segments[0] === 'rekomendasi' || segments[0] === 'recommendations') return { page: 'recommendations' };
  if (segments[0] === 'need-based-recommendations') return { page: 'need-based-recommendations' };
  if (segments[0] === 'regional-exploration') return { page: 'regional-exploration' };
  return { page: 'not-found' };
};

const setPageTitle = (page, cafe) => {
  document.title = page === 'cafe' && cafe
    ? `${cafe.name} - Cafinder`
    : PAGE_TITLES[page] || PAGE_TITLES.home;
};

const NotFoundPage = ({ navigateTo }) => (
  <div className="not-found-page">
    <div className="container">
      <h1>404</h1>
      <h2>Halaman tidak ditemukan</h2>
      <p>Alamat yang kamu tuju tidak ada atau sudah dipindahkan.</p>
      <div className="not-found-actions">
        <a href="/" className="not-found-link">Beranda</a>
        <a href="/catalog" className="not-found-link">Lihat Katalog Cafe</a>
      </div>
    </div>
  </div>
);

function App() {
  // Resolve the initial route synchronously so a deep link never flashes the homepage first
  const [initialRoute] = useState(() => resolveRoute(window.location.pathname));
  const [currentPage, setCurrentPage] = useState(initialRoute.page);
  const [selectedCafe, setSelectedCafe] = useState(null);
  // State for dashboard
  const [showDashboard, setShowDashboard] = useState(false);

  // Set the initial document title
  useEffect(() => {
    setPageTitle(initialRoute.page);
  }, [initialRoute]);

  // Load a cafe by id (used by both direct URLs and in-app navigation)
  const loadCafe = async (cafeId) => {
    try {
      const fetchedCafe = await fetchCafeById(cafeId);
      if (fetchedCafe) {
        const cafeData = adaptCafeDataForSinglePage(fetchedCafe);
        cafeData.google_maps_direction = fetchedCafe.google_maps_direction;
        setSelectedCafe(cafeData);
        setPageTitle('cafe', cafeData);
      } else {
        // Unknown cafe id -> honest 404, never a blank page or sample data
        setSelectedCafe(null);
        setCurrentPage('not-found');
        setPageTitle('not-found');
      }
    } catch (error) {
      setSelectedCafe(null);
      setCurrentPage('not-found');
      setPageTitle('not-found');
    }
  };

  // Listen for URL changes (initial load + back/forward)
  useEffect(() => {
    const handleUrlChange = () => {
      const route = resolveRoute(window.location.pathname);
      setCurrentPage(route.page);
      setPageTitle(route.page);

      if (route.page === 'cafe') {
        setSelectedCafe(null);
        loadCafe(route.cafeId);
      } else {
        setSelectedCafe(null);
      }

      window.scrollTo({ top: 0 });
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);

    // Clean up ScrollTriggers on component unmount
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Custom navigation function
  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const route = resolveRoute(path);
    setCurrentPage(route.page);
    setPageTitle(route.page);

    if (route.page === 'cafe') {
      // Cafe selection is handled in viewCafe / loadCafe
      loadCafe(route.cafeId);
    } else {
      setSelectedCafe(null);
    }
  };

  // Function to view a specific cafe
  const viewCafe = (cafeId) => {
    navigateTo(`/catalog/cafe/${cafeId}`);
  };

  // Function to go back to catalog
  const backToCatalog = () => {
    navigateTo('/catalog');
  };

  // Override Header and Footer link clicks with custom navigation
  useEffect(() => {
    const handleLinkClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('/')) {
        e.preventDefault();
        navigateTo(link.getAttribute('href'));
      }
    };

    document.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  // HomePage component
  const HomePage = () => (
    <>
      <Hero navigateTo={navigateTo} />
      <InteractiveFinder navigateTo={navigateTo} />
      <MapCTA navigateTo={navigateTo} />
      <CafeDiscoveryMap navigateTo={navigateTo} />
      <SmartFinderCTA navigateTo={navigateTo} />
      <Testimonials />
    </>
  );

  return (
    <AuthProvider>
      <div className="App">
        {/* Cursor follower */}
        <CursorFollower />

        {/* Progress Bar */}
        <ProgressBar />

        {/* Header */}
        <Header />

        {/* Floating Favorites Button */}
        <FloatingFavorites onOpen={() => setShowDashboard(true)} />

        {/* User Dashboard */}
        {showDashboard && (
          <UserDashboard
            onClose={() => setShowDashboard(false)}
            onViewCafe={viewCafe}
          />
        )}

        {/* Main content */}
        <main>
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'catalog' && (
            <CatalogPage
              onViewCafe={viewCafe}
            />
          )}
          {currentPage === 'cafe' && selectedCafe && (
            <SimpleCafePage cafeData={selectedCafe} onBackToCatalog={backToCatalog} />
          )}
          {currentPage === 'map' && (
            <CafeMapPage />
          )}
          {currentPage === 'tentang-kami' && (
            <TentangKamiPage />
          )}
          {currentPage === 'smart-finder' && (
            <SmartFinderPage />
          )}
          {currentPage === 'recommendations' && (
            <CategoryRecommendationsPage />
          )}
          {currentPage === 'need-based-recommendations' && (
            <NeedBasedRecommendations />
          )}
          {currentPage === 'regional-exploration' && (
            <RegionalExplorationPage />
          )}
          {currentPage === 'not-found' && (
            <NotFoundPage navigateTo={navigateTo} />
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
