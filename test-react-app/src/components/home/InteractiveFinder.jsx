import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const InteractiveFinder = ({ navigateTo }) => {
  const [hoveredNeed, setHoveredNeed] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const needs = [
    { 
      id: 'wifi', 
      icon: '📶', 
      label: 'WiFi Kencang', 
      count: 156,
      description: 'Koneksi super cepat untuk kerja',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      sampleCafes: ['Starbucks', 'Excelso', 'Fore Coffee'],
      benefits: ['Speed 100+ Mbps', 'Stable Connection', 'Power Outlets']
    },
    { 
      id: 'aesthetic', 
      icon: '📸', 
      label: 'Aesthetic', 
      count: 89,
      description: 'Spot instagramable & cozy',
      gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
      sampleCafes: ['Common Grounds', 'Blue Doors', 'Monopole'],
      benefits: ['Photo Spots', 'Natural Light', 'Unique Interior']
    },
    { 
      id: 'outdoor', 
      icon: '🌳', 
      label: 'Outdoor Area', 
      count: 67,
      description: 'Suasana terbuka & segar',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      sampleCafes: ['Garden Cafe', 'The Yard', 'Open Space'],
      benefits: ['Fresh Air', 'Garden View', 'Smoking Area']
    },
    { 
      id: 'work', 
      icon: '💼', 
      label: 'Work From Cafe', 
      count: 45,
      description: 'Tempat kerja yang produktif',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      sampleCafes: ['CoHive', 'Block71', 'Workwell'],
      benefits: ['Meeting Room', 'Quiet Zone', 'Fast WiFi']
    },
    { 
      id: 'pet', 
      icon: '🐕', 
      label: 'Pet Friendly', 
      count: 34,
      description: 'Bawa hewan kesayangan',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      sampleCafes: ['Dog Cafe', 'Pet House', 'Furry Friends'],
      benefits: ['Pet Menu', 'Play Area', 'Pet Facilities']
    },
    { 
      id: '24h', 
      icon: '🌙', 
      label: 'Buka 24 Jam', 
      count: 12,
      description: 'Nongkrong tanpa batas waktu',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      sampleCafes: ['Upnormal', 'Rocket Chicken', '24 Coffee'],
      benefits: ['Late Night', 'Always Open', 'Night Menu']
    },
    { 
      id: 'instagramable', 
      icon: '📸', 
      label: 'Most Instagramable', 
      count: 42,
      description: 'Spot foto terbaik untuk feed',
      gradient: 'linear-gradient(135deg, #E11D48 0%, #F97316 100%)',
      sampleCafes: ['Aesthetic Cafe', 'Photo Studio', 'Insta Worthy'],
      benefits: ['Photo Spots', 'Unique Decor', 'Perfect Lighting']
    },
    { 
      id: 'hidden-gems', 
      icon: '💎', 
      label: 'Hidden Gems', 
      count: 18,
      description: 'Cafe tersembunyi yang unik',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
      sampleCafes: ['Secret Garden', 'Hidden Corner', 'Underground'],
      benefits: ['Exclusive', 'Unique Concept', 'Local Favorite']
    },
    { 
      id: 'date-night', 
      icon: '💕', 
      label: 'Perfect for Date', 
      count: 24,
      description: 'Suasana romantis untuk berdua',
      gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
      sampleCafes: ['Romance Cafe', 'Intimate Space', 'Couple Corner'],
      benefits: ['Romantic Ambiance', 'Private Seating', 'Cozy Atmosphere']
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate section entrance
      gsap.fromTo('.needs-finder',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: '.needs-finder',
            start: 'top 80%'
          }
        }
      );

      // Animate need cards with stagger
      gsap.fromTo('.need-card',
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: {
            amount: 0.8,
            from: "random"
          },
          scrollTrigger: {
            trigger: '.needs-grid-container',
            start: 'top 80%'
          }
        }
      );

      // Row 1 animation - Left to Right
      gsap.to('.row-1', {
        x: '-50%',
        duration: 30,
        repeat: -1,
        ease: 'none'
      });
      
      // Row 2 animation - Right to Left
      gsap.to('.row-2', {
        x: '50%',
        duration: 30,
        repeat: -1,
        ease: 'none'
      });

      // Floating animation for icons
      gsap.to('.need-icon', {
        y: -5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        stagger: {
          amount: 1,
          from: "random"
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="needs-finder">
      <div className="container">
        <div className="needs-header">
          <div className="header-badge">
            <span className="badge-icon">✨</span>
            <span className="badge-text">Rekomendasi Cafe</span>
          </div>
          
          <h2 className="needs-title">
            Cari Cafe Sesuai<br />
            <span className="title-gradient">Kebutuhanmu</span>
          </h2>
          
          <p className="needs-subtitle">
            Pilih kategori kebutuhan cafe yang kamu cari. Kami punya rekomendasi terbaik untuk setiap preferensimu!
          </p>
        </div>

        {/* Needs Grid */}
        <div className="needs-grid-container">
          {/* Row 1 - First 5 cards (Left to Right) */}
          <div className="needs-row row-1">
            {[...needs.slice(0, 5), ...needs.slice(0, 5)].map((need, index) => (
              <div
                key={`row1-${need.id}-${index}`}
                onClick={() => navigateTo('/need-based-recommendations')}
                className="need-card"
                onMouseEnter={() => setHoveredNeed(need.id)}
                onMouseLeave={() => setHoveredNeed(null)}
                style={{background: need.gradient, cursor: 'pointer'}}
              >
              <div className="need-content">
                <div className="need-header">
                  <div className="need-icon">{need.icon}</div>
                  <div className="need-count">{need.count} cafe</div>
                </div>
                
                <h3 className="need-label">{need.label}</h3>
                <p className="need-description">{need.description}</p>
                
                {/* Benefits on hover */}
                <div className={`need-details ${hoveredNeed === need.id ? 'show' : ''}`}>
                  <div className="benefits-list">
                    {need.benefits.map((benefit, index) => (
                      <span key={index} className="benefit-tag">{benefit}</span>
                    ))}
                  </div>
                  
                  <div className="sample-cafes">
                    <span className="sample-label">Popular:</span>
                    {need.sampleCafes.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>
              
              
              {/* Decorative elements */}
              <div className="card-decoration">
                <div className="deco-circle circle-1"></div>
                <div className="deco-circle circle-2"></div>
              </div>
              </div>
            ))}
          </div>
          
          {/* Row 2 - Last 4 cards (Right to Left) */}
          <div className="needs-row row-2">
            {[...needs.slice(5), ...needs.slice(5)].map((need, index) => (
              <div
                key={`row2-${need.id}-${index}`}
                onClick={() => navigateTo('/need-based-recommendations')}
                className="need-card"
                onMouseEnter={() => setHoveredNeed(need.id)}
                onMouseLeave={() => setHoveredNeed(null)}
                style={{background: need.gradient, cursor: 'pointer'}}
              >
                <div className="need-content">
                  <div className="need-header">
                    <div className="need-icon">{need.icon}</div>
                    <div className="need-count">{need.count} cafe</div>
                  </div>
                  
                  <h3 className="need-label">{need.label}</h3>
                  <p className="need-description">{need.description}</p>
                  
                  {/* Benefits on hover */}
                  <div className={`need-details ${hoveredNeed === need.id ? 'show' : ''}`}>
                    <div className="benefits-list">
                      {need.benefits.map((benefit, idx) => (
                        <span key={idx} className="benefit-tag">{benefit}</span>
                      ))}
                    </div>
                    
                    <div className="sample-cafes">
                      <span className="sample-label">Popular:</span>
                      {need.sampleCafes.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="card-decoration">
                  <div className="deco-circle circle-1"></div>
                  <div className="deco-circle circle-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Call to Action */}
        <div className="finder-cta">
          <p className="cta-text">Belum menemukan yang kamu cari?</p>
          <div className="cta-buttons">
            <button onClick={() => navigateTo('/catalog')} className="cta-btn secondary">
              <span className="btn-icon">🔍</span>
              <span>Explore Semua Cafe</span>
            </button>
            <button onClick={() => navigateTo('/smart-finder')} className="cta-btn primary">
              <span className="btn-icon">🤖</span>
              <span>Gunakan AI Finder</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveFinder;