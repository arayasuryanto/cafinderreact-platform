import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MapCTA = ({ navigateTo }) => {
  const sectionRef = useRef(null);
  const mapRef = useRef(null);
  const [activeFeature, setActiveFeature] = useState(0);

  const mapFeatures = [
    {
      icon: '🗺️',
      title: 'Peta Interaktif',
      description: 'Lihat semua cafe di satu peta',
      color: '#F05438'
    },
    {
      icon: '🧭',
      title: 'Jelajahi Kota',
      description: 'Telusuri cafe dari Barat sampai Timur Surabaya',
      color: '#3B82F6'
    },
    {
      icon: '🔍',
      title: 'Cari & Filter',
      description: 'Cari nama cafe, pilih wilayah, urutkan sesukamu',
      color: '#10B981'
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate background gradient
      gsap.fromTo('.creative-bg',
        { background: 'linear-gradient(135deg, #FFF5F3 0%, #FEF3F5 100%)' },
        {
          background: 'linear-gradient(135deg, #FEF3F5 0%, #FFF5F3 100%)',
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        }
      );

      // Animate section entrance with cascade effect
      gsap.fromTo('.creative-badge',
        { opacity: 0, y: 30, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)',
          scrollTrigger: {
            trigger: '.creative-map-cta',
            start: 'top 80%',
          }
        }
      );

      gsap.fromTo('.creative-title',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.creative-map-cta',
            start: 'top 75%',
          },
          delay: 0.2
        }
      );

      gsap.fromTo('.creative-description',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.creative-map-cta',
            start: 'top 70%',
          },
          delay: 0.4
        }
      );

      // Feature cards animation
      gsap.fromTo('.feature-showcase .feature-card',
        { opacity: 0, x: -50, rotateY: 15 },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.feature-showcase',
            start: 'top 80%',
          }
        }
      );

      // Interactive map animation
      gsap.fromTo('.interactive-visual',
        { opacity: 0, scale: 0.8, rotateY: 20 },
        {
          opacity: 1,
          scale: 1,
          rotateY: 0,
          duration: 1.2,
          ease: 'elastic.out(1, 0.3)',
          scrollTrigger: {
            trigger: '.interactive-visual',
            start: 'top 80%',
          }
        }
      );

      // Floating elements
      gsap.to('.floating-element', {
        y: -15,
        x: 5,
        rotation: 2,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        stagger: {
          each: 0.3,
          from: 'random'
        }
      });

      // Buttons animation
      gsap.fromTo('.cta-actions .creative-btn',
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: '.cta-actions',
            start: 'top 90%',
          }
        }
      );


    }, sectionRef);

    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % mapFeatures.length);
    }, 3000);

    return () => {
      ctx.revert();
      clearInterval(interval);
    };
  }, [mapFeatures.length]);

  return (
    <section className="creative-map-cta" ref={sectionRef}>
      <div className="creative-bg"></div>
      
      <div className="creative-container">
        <div className="creative-content">
          
          {/* Left Content */}
          <div className="creative-text-section">
            <div className="creative-badge">
              <div className="badge-glow"></div>
              <span className="badge-icon">🗺️</span>
              <span className="badge-text">Peta Cafe</span>
              <div className="badge-pulse"></div>
            </div>
            
            <h2 className="creative-title">
              <span className="title-line">Temukan Cafe Favoritmu</span>
              <span className="title-highlight">di Peta Interaktif</span>
            </h2>
            
            <p className="creative-description">
              Lihat semua cafe Surabaya dalam satu peta. Cari berdasarkan nama,
              filter wilayah, dan langsung dapatkan arah ke lokasinya.
            </p>

            {/* Feature Showcase */}
            <div className="feature-showcase">
              {mapFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className={`feature-card ${index === activeFeature ? 'active' : ''}`}
                  style={{'--accent-color': feature.color}}
                >
                  <div className="feature-icon-wrapper">
                    <span className="feature-icon">{feature.icon}</span>
                  </div>
                  <div className="feature-content">
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                  </div>
                  <div className="feature-glow"></div>
                </div>
              ))}
            </div>

            {/* CTA Actions */}
            <div className="cta-actions">
              <button onClick={() => navigateTo('/map')} className="creative-btn primary-creative">
                <div className="btn-glow"></div>
                <span className="btn-icon">🗺️</span>
                <span className="btn-text">Buka Peta</span>
                <div className="btn-trail"></div>
              </button>
            </div>

          </div>

          {/* Right Visual */}
          <div className="creative-visual-section">
            <div className="interactive-visual" ref={mapRef}>
              {/* Main Map Container */}
              <div className="visual-map-container">
                <div className="map-screen">
                  <svg viewBox="0 0 320 240" className="mini-map">
                    {/* Background */}
                    <defs>
                      <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F3F4F6"/>
                        <stop offset="100%" stopColor="#E5E7EB"/>
                      </linearGradient>
                    </defs>
                    <rect x="0" y="0" width="320" height="240" fill="url(#mapGradient)" rx="12"/>
                    
                    {/* Roads */}
                    <path d="M40 120 L280 120" stroke="#D1D5DB" strokeWidth="2"/>
                    <path d="M160 40 L160 200" stroke="#D1D5DB" strokeWidth="2"/>
                    <path d="M80 80 L240 160" stroke="#D1D5DB" strokeWidth="1"/>
                    
                    {/* Animated Cafe Pins */}
                    <g className="floating-element">
                      <circle cx="100" cy="90" r="6" fill="#F05438"/>
                      <circle cx="100" cy="90" r="2" fill="white"/>
                    </g>
                    <g className="floating-element">
                      <circle cx="220" cy="140" r="6" fill="#3B82F6"/>
                      <circle cx="220" cy="140" r="2" fill="white"/>
                    </g>
                    <g className="floating-element">
                      <circle cx="160" cy="80" r="6" fill="#10B981"/>
                      <circle cx="160" cy="80" r="2" fill="white"/>
                    </g>
                    <g className="floating-element">
                      <circle cx="120" cy="160" r="6" fill="#8B5CF6"/>
                      <circle cx="120" cy="160" r="2" fill="white"/>
                    </g>
                    
                    {/* User Location */}
                    <g>
                      <circle cx="160" cy="120" r="8" fill="#F05438" opacity="0.3"/>
                      <circle cx="160" cy="120" r="5" fill="#F05438"/>
                      <circle cx="160" cy="120" r="2" fill="white"/>
                    </g>
                  </svg>
                </div>
                
                {/* Floating UI Elements */}
                <div className="floating-stats">
                  <div className="floating-element ui-bubble top-left">
                    <span className="bubble-icon">☕</span>
                    <span className="bubble-text">Ratusan pilihan cafe</span>
                  </div>

                  <div className="floating-element ui-bubble top-right">
                    <span className="bubble-icon">⭐</span>
                    <span className="bubble-text">Rating & ulasan</span>
                  </div>

                  <div className="floating-element ui-bubble bottom-left">
                    <span className="bubble-icon">🕒</span>
                    <span className="bubble-text">Info jam buka</span>
                  </div>

                  <div className="floating-element ui-bubble bottom-right">
                    <span className="bubble-icon">📍</span>
                    <span className="bubble-text">Rute sekali klik</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="visual-decorations">
                <div className="floating-element deco-circle circle-1"></div>
                <div className="floating-element deco-circle circle-2"></div>
                <div className="floating-element deco-circle circle-3"></div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default MapCTA;