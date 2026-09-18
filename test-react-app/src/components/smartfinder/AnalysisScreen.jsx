import React, { useEffect } from 'react';
import { gsap } from 'gsap';

const AnalysisScreen = ({ analysis, onContinue }) => {
  // Parse personality type from analysis text
  const getPersonalityInfo = (analysisText) => {
    const personalityTypes = {
      'The Productivity Hunter': {
        icon: '⚡',
        description: 'Kerja/belajar intensif dengan WiFi kencang dan suasana fokus',
        color: '#3b82f6',
        traits: ['Berorientasi pada produktivitas', 'Butuh koneksi internet stabil', 'Menyukai lingkungan yang mendukung fokus']
      },
      'The Social Connector': {
        icon: '🌟',
        description: 'Hangout seru, meeting bisnis, dan networking di spot ramai',
        color: '#ef4444',
        traits: ['Senang bersosialisasi dan networking', 'Menyukai suasana ramai dan energik', 'Cocok untuk meeting dan diskusi']
      },
      'The Coffee Connoisseur': {
        icon: '☕',
        description: 'Menikmati kopi berkualitas dalam suasana tenang dan cozy',
        color: '#8b5cf6',
        traits: ['Mengutamakan kualitas kopi', 'Menyukai suasana cozy dan intimate', 'Menghargai craftsmanship barista']
      },
      'The Aesthetic Seeker': {
        icon: '📸',
        description: 'Mencari spot Instagram-worthy dengan interior yang memukau',
        color: '#ec4899',
        traits: ['Visual-oriented dan kreatif', 'Mencari spot foto yang menarik', 'Menyukai desain interior yang unik']
      },
      'The Comfort Lover': {
        icon: '🛋️',
        description: 'Prioritas kenyamanan dan relaksasi untuk me-time berkualitas',
        color: '#10b981',
        traits: ['Mengutamakan kenyamanan fisik', 'Mencari tempat untuk relaksasi', 'Menyukai area duduk yang empuk']
      },
      'The Night Owl': {
        icon: '🌙',
        description: 'Aktif malam hari, suka tempat yang buka larut dengan vibe santai',
        color: '#f59e0b',
        traits: ['Aktif di malam hari', 'Menyukai vibe santai dan chill', 'Butuh tempat yang buka larut']
      }
    };

    for (const [type, info] of Object.entries(personalityTypes)) {
      if (analysisText.includes(type)) {
        return { type, ...info };
      }
    }

    // Default fallback
    return {
      type: 'The Comfort Lover',
      ...personalityTypes['The Comfort Lover']
    };
  };

  const personalityInfo = analysis ? getPersonalityInfo(analysis) : null;

  useEffect(() => {
    // Animate loading dots
    gsap.to('.loading-dot', {
      scale: 0.5,
      opacity: 0.3,
      duration: 0.6,
      stagger: 0.2,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });

    // Animate brain icon
    gsap.to('.brain-icon', {
      rotation: 360,
      duration: 3,
      repeat: -1,
      ease: 'none'
    });

    // Show analysis text after loading
    if (analysis) {
      gsap.fromTo('.analysis-result',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.5 }
      );
    }
  }, [analysis]);

  const handleScreenClick = () => {
    if (analysis) {
      onContinue();
    }
  };

  return (
    <div className="analysis-screen phase-content" onClick={handleScreenClick}>
      <div className="analysis-content">
        <div className="brain-icon">
          <svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#F05438" strokeWidth="2" opacity="0.2"/>
            <path d="M30 50 Q30 20 50 20 T70 50 Q70 80 50 80 T30 50" 
                  fill="#F05438" opacity="0.1"/>
            <g transform="translate(50, 50)">
              <circle cx="-15" cy="-10" r="8" fill="#F05438" opacity="0.6"/>
              <circle cx="15" cy="-10" r="8" fill="#F05438" opacity="0.6"/>
              <circle cx="0" cy="10" r="8" fill="#F05438" opacity="0.6"/>
              <circle cx="-10" cy="5" r="6" fill="#F05438" opacity="0.4"/>
              <circle cx="10" cy="5" r="6" fill="#F05438" opacity="0.4"/>
            </g>
          </svg>
        </div>
        
        {!analysis ? (
          <>
            <h2 className="analysis-title">Menganalisis jawaban Anda...</h2>
            <div className="loading-dots">
              <span className="loading-dot">•</span>
              <span className="loading-dot">•</span>
              <span className="loading-dot">•</span>
            </div>
            <p className="analysis-subtitle">Menyimpulkan tipe kafe yang cocok dari 6 jawaban Anda</p>
          </>
        ) : (
          <div className="analysis-result">
            <h2 className="analysis-title">Tipe Kepribadian Kafe Anda</h2>
            
            <div className="personality-result-card" style={{ '--personality-color': personalityInfo.color }}>
              <div className="personality-header">
                <div className="personality-icon-large">{personalityInfo.icon}</div>
                <div className="personality-info">
                  <h3 className="personality-type-name">{personalityInfo.type}</h3>
                  <p className="personality-description">{personalityInfo.description}</p>
                </div>
              </div>

              <div className="personality-traits">
                <h4 className="traits-title">Karakteristik Utama:</h4>
                <ul className="traits-list">
                  {personalityInfo.traits.map((trait, index) => (
                    <li key={index} className="trait-item">{trait}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-text">
                <p>{analysis}</p>
              </div>
            </div>

            <div className="next-steps">
              <h4 className="next-title">Langkah Selanjutnya</h4>
              <p className="next-description">
                Berdasarkan jawaban Anda, kami punya beberapa saran kafe yang mungkin Anda suka. Coba eksplorasi!
              </p>
            </div>

            <button className="continue-button" onClick={onContinue}>
              Lihat Rekomendasi Saya
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <p className="click-hint">atau klik dimana saja untuk melanjutkan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisScreen;