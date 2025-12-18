import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';

const Header = () => {
  const { user, loading, openAuthModal, closeAuthModal, authModalOpen, signOut, signIn } = useAuth();

  useEffect(() => {
    console.log('Header render - User:', user, 'Loading:', loading);
    // Debug: Check localStorage directly
    const storedUser = localStorage.getItem('cafinder_user');
    console.log('Direct localStorage check:', storedUser);
  }, [user, loading]);

  const handleSignInClick = () => {
    openAuthModal();
  };

  const handleGoogleSignIn = () => {
    signIn();
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="desktop-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <a href="/">
                <img 
                  src="/images/cafinder-logo.png" 
                  alt="Cafinder Logo" 
                  style={{ height: '40px', width: 'auto' }}
                />
              </a>
            </div>
            
            <ul className="nav-links">
              <li><a href="/map">Cafe Map</a></li>
              <li><a href="/catalog">Katalog Cafe</a></li>
              <li><a href="/finder">Smart Finder</a></li>
              <li><a href="/tentang-kami">Tentang Kami</a></li>
              <li><a href="/buat-cafe">🚀Buat Cafe</a></li>
            </ul>
            
            <div className="auth-btns">
              {user ? (
                <div className="user-menu">
                  <div className="user-info">
                    <img 
                      src={user.picture} 
                      alt={user.name}
                      className="user-avatar"
                    />
                    <span className="user-name">{user.given_name}</span>
                  </div>
                  <button className="signout-btn" onClick={handleSignOut}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <button className="login-btn" onClick={handleSignInClick}>
                    Login
                  </button>
                  <button className="signup-btn" onClick={handleSignInClick}>
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="container">
          <div className="mobile-header-content">
            <div className="mobile-logo">
              <a href="/">
                <img 
                  src="/images/cafinder-logo.png" 
                  alt="Cafinder Logo" 
                  style={{ height: '28px', width: 'auto' }}
                />
              </a>
            </div>
            
            <div className="mobile-auth">
              {user ? (
                <div className="mobile-user-menu">
                  <img 
                    src={user.picture} 
                    alt={user.name}
                    className="mobile-user-avatar"
                    onClick={handleSignOut}
                  />
                </div>
              ) : (
                <button className="mobile-signin-btn" onClick={handleSignInClick}>
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <a href="/map" className="nav-item">
          <div className="nav-icon">🗺️</div>
          <span className="nav-label">Cafe Map</span>
        </a>
        <a href="/catalog" className="nav-item">
          <div className="nav-icon">☕</div>
          <span className="nav-label">Katalog</span>
        </a>
        <a href="/finder" className="nav-item">
          <div className="nav-icon">🤖</div>
          <span className="nav-label">Smart Finder</span>
        </a>
        <a href="/tentang-kami" className="nav-item">
          <div className="nav-icon">👥</div>
          <span className="nav-label">Tentang Kami</span>
        </a>
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        onGoogleSignIn={handleGoogleSignIn}
      />
    </>
  );
};

export default Header;