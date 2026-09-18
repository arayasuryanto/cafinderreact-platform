import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './SmartFinderPage.css';
import SmartFinderStart from './SmartFinderStart';
import QuestionCard from './QuestionCard';
import AnalysisScreen from './AnalysisScreen';
import RecommendationCard from './RecommendationCard';
import { generateAnalysis, generateRecommendations, navigateToCafePage } from '../../utils/smartFinderUtils';
import favoritesService from '../../services/favoritesService';

const SmartFinderPage = () => {
  const [currentPhase, setCurrentPhase] = useState('start'); // start, questions, analysis, recommendations, end
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [analysis, setAnalysis] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [sessionSaved, setSessionSaved] = useState([]);
  const [currentRecommendation, setCurrentRecommendation] = useState(0);

  // Guards against stale timers/promises writing state after a restart
  const runIdRef = useRef(0);
  const analysisTimerRef = useRef(null);

  const questions = [
    {
      id: 'purpose',
      question: "Apa tujuan utama Anda mengunjungi kafe?",
      options: [
        { value: 'work', label: 'Bekerja/Belajar', icon: '💼' },
        { value: 'social', label: 'Hangout dengan teman', icon: '👥' },
        { value: 'business', label: 'Meeting bisnis', icon: '🤝' },
        { value: 'solo', label: 'Bersantai sendiri', icon: '☕' }
      ]
    },
    {
      id: 'time',
      question: "Kapan biasanya Anda mengunjungi kafe?",
      options: [
        { value: 'morning', label: 'Pagi (7-11am)', icon: '🌅' },
        { value: 'afternoon', label: 'Siang (11am-5pm)', icon: '☀️' },
        { value: 'evening', label: 'Sore (5-9pm)', icon: '🌆' },
        { value: 'night', label: 'Malam (9pm+)', icon: '🌙' }
      ]
    },
    {
      id: 'atmosphere',
      question: "Suasana kafe ideal Anda?",
      options: [
        { value: 'quiet', label: 'Tenang & minimalis', icon: '🤫' },
        { value: 'bustling', label: 'Ramai & energik', icon: '🎉' },
        { value: 'cozy', label: 'Hangat & intim', icon: '🛋️' },
        { value: 'modern', label: 'Modern & trendy', icon: '✨' }
      ]
    },
    {
      id: 'priority',
      question: "Apa yang paling penting bagi Anda?",
      options: [
        { value: 'wifi', label: 'WiFi kencang', icon: '📶' },
        { value: 'coffee', label: 'Kopi berkualitas', icon: '☕' },
        { value: 'instagram', label: 'Interior Instagramable', icon: '📸' }
      ]
    },
    {
      id: 'seating',
      question: "Bagaimana Anda suka duduk?",
      options: [
        { value: 'solo_table', label: 'Meja sendiri', icon: '🪑' },
        { value: 'counter', label: 'Counter/bar', icon: '🍸' },
        { value: 'sofa', label: 'Sofa/lounge', icon: '🛋️' },
        { value: 'outdoor', label: 'Outdoor terrace', icon: '🌿' }
      ]
    },
    {
      id: 'vibe',
      question: "Apa mood Anda hari ini?",
      options: [
        { value: 'productive', label: 'Fokus produktif', icon: '💪' },
        { value: 'creative', label: 'Inspirasi kreatif', icon: '🎨' },
        { value: 'social', label: 'Koneksi sosial', icon: '💬' },
        { value: 'relaxation', label: 'Relaksasi total', icon: '😌' }
      ]
    }
  ];

  useEffect(() => {
    return () => {
      if (analysisTimerRef.current) {
        clearTimeout(analysisTimerRef.current);
      }
    };
  }, []);

  const handleStart = () => {
    runIdRef.current += 1;
    setCurrentPhase('questions');
    animatePhaseTransition();
  };

  const handleAnswer = (questionId, answer) => {
    setUserResponses({ ...userResponses, [questionId]: answer });

    if (currentQuestion < questions.length - 1) {
      animateQuestionTransition(() => {
        setCurrentQuestion(currentQuestion + 1);
      });
    } else {
      // All questions answered, move to analysis
      const newResponses = { ...userResponses, [questionId]: answer };
      setCurrentPhase('analysis');

      const runId = runIdRef.current;

      // Generate analysis after a short delay
      analysisTimerRef.current = setTimeout(() => {
        if (runId !== runIdRef.current) return;

        const analysisText = generateAnalysis(newResponses);
        setAnalysis(analysisText);

        // Generate recommendations asynchronously
        generateRecommendations(newResponses).then(recs => {
          if (runId !== runIdRef.current) return;
          setRecommendations(recs);
        });
      }, 2000);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      animateQuestionTransition(() => {
        setCurrentQuestion(currentQuestion - 1);
      });
    }
  };

  const handleSwipe = (direction) => {
    const currentCafe = recommendations[currentRecommendation];

    if (direction === 'right' && currentCafe) {
      // Save through the shared favorites service so the cafe shows up in
      // the same favorites surface as the rest of the app
      const userId = favoritesService.getCurrentUserId();
      favoritesService.addFavorite(userId, {
        id: currentCafe.id,
        name: currentCafe.name,
        image: currentCafe.imageUrl || null,
        category: currentCafe.category || 'Cafe',
        address: currentCafe.address || currentCafe.fullAddress || null
      });
      setSessionSaved(prev => [
        ...prev,
        { id: currentCafe.id, name: currentCafe.name, imageUrl: currentCafe.imageUrl }
      ]);
    }

    // Move to next recommendation immediately (no additional animation needed)
    if (currentRecommendation < recommendations.length - 1) {
      setCurrentRecommendation(currentRecommendation + 1);
    } else {
      // End of recommendations
      setCurrentPhase('end');
    }
  };

  const handleRestart = () => {
    runIdRef.current += 1;
    if (analysisTimerRef.current) {
      clearTimeout(analysisTimerRef.current);
    }
    setCurrentPhase('start');
    setCurrentQuestion(0);
    setUserResponses({});
    setCurrentRecommendation(0);
    setAnalysis('');
    setRecommendations([]);
    setSessionSaved([]);
  };

  const handleOpenFavorites = () => {
    // Open the same favorites dashboard the floating heart button opens
    const floatingButton = document.querySelector('.floating-favorites-btn');
    if (floatingButton) {
      floatingButton.click();
    }
  };

  const animatePhaseTransition = () => {
    gsap.fromTo('.phase-content',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  };

  const animateQuestionTransition = (callback) => {
    gsap.to('.question-content', {
      opacity: 0,
      x: -20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        callback();
        gsap.fromTo('.question-content',
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
        );
      }
    });
  };

  const renderEndScreen = () => {
    // All favorites stored for the current user (signed in or local),
    // so saved cafes are visible here even while signed out
    const allFavorites = favoritesService.getFilteredFavorites(
      favoritesService.getCurrentUserId(),
      { sortBy: 'recent' }
    );
    const shownFavorites = allFavorites.slice(0, 8);
    const remainingCount = allFavorites.length - shownFavorites.length;

    return (
      <div className="end-screen phase-content">
        <div className="end-content">
          <h2>Selesai! 🎉</h2>
          <p>
            {sessionSaved.length > 0
              ? `Anda menyimpan ${sessionSaved.length} kafe di sesi ini`
              : 'Belum ada kafe yang Anda simpan di sesi ini'}
          </p>

          {shownFavorites.length > 0 && (
            <div className="session-favorites">
              <h3 className="session-favorites-title">Kafe favorit Anda</h3>
              <div className="session-favorites-list">
                {shownFavorites.map(fav => (
                  <button
                    key={fav.cafeId}
                    className="session-cafe-chip"
                    onClick={() => navigateToCafePage(fav.cafeId)}
                    title={fav.cafeName}
                  >
                    {fav.cafeImage ? (
                      <img src={fav.cafeImage} alt={fav.cafeName} />
                    ) : (
                      <span className="session-cafe-initial">
                        {fav.cafeName ? fav.cafeName.charAt(0) : '?'}
                      </span>
                    )}
                    <span className="session-cafe-name">{fav.cafeName}</span>
                  </button>
                ))}
              </div>
              {remainingCount > 0 && (
                <p className="session-favorites-more">+{remainingCount} kafe lainnya</p>
              )}
            </div>
          )}

          <button
            className="view-favorites-btn"
            onClick={handleOpenFavorites}
          >
            Lihat Semua Favorit
          </button>
          <button
            className="restart-btn"
            onClick={handleRestart}
          >
            Mulai Lagi
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentPhase) {
      case 'start':
        return <SmartFinderStart onStart={handleStart} />;

      case 'questions':
        return (
          <QuestionCard
            question={questions[currentQuestion]}
            questionNumber={currentQuestion + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
            onBack={handleBack}
            currentAnswer={userResponses[questions[currentQuestion].id]}
          />
        );

      case 'analysis':
        return (
          <AnalysisScreen
            analysis={analysis}
            onContinue={() => setCurrentPhase('recommendations')}
          />
        );

      case 'recommendations':
        return (
          <div className="card-stack-container">
            {/* Render stack of cards */}
            {recommendations.slice(currentRecommendation, currentRecommendation + 3).map((cafe, index) => (
              <div
                key={`${cafe.id}-${currentRecommendation}`}
                className={`stacked-card ${index === 0 ? 'active' : ''}`}
                style={{
                  zIndex: 10 - index,
                  transform: `scale(${1 - index * 0.03}) translateY(${index * 8}px)`,
                  opacity: index === 0 ? 1 : 0.9
                }}
              >
                <RecommendationCard
                  cafe={cafe}
                  onSwipe={index === 0 ? handleSwipe : undefined}
                  currentIndex={currentRecommendation + index + 1}
                  totalCount={recommendations.length}
                  isActive={index === 0}
                />
              </div>
            ))}
          </div>
        );

      case 'end':
        return renderEndScreen();

      default:
        return null;
    }
  };

  return (
    <div className="smart-finder-page">
      {renderContent()}
    </div>
  );
};

export default SmartFinderPage;
