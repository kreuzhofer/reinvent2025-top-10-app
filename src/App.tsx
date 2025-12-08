import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import { ScoreProvider, useScore } from './context/ScoreContext';
import { QuizConfigProvider } from './context/QuizConfigContext';
import { useQuizData } from './hooks/useQuizData';
import WelcomeScreen from './components/WelcomeScreen';
import ContentSlide from './components/ContentSlide';
import QuizSlide from './components/QuizSlide';
import SummaryScreen from './components/SummaryScreen';
import ScoreDisplay from './components/ScoreDisplay';
import ProgressIndicator from './components/ProgressIndicator';
import KeyboardHelpOverlay from './components/KeyboardHelpOverlay';

/**
 * Welcome Route Component
 * 
 * Requirements:
 * - 1.1: Display welcome screen
 */
function WelcomeRoute() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/quiz/0');
  };

  return <WelcomeScreen onStart={handleStart} />;
}

/**
 * Quiz Slide Route Component
 * 
 * Requirements:
 * - 1.2: Sequential slide progression
 * - 9.3: React Router for navigation
 */
function QuizRoute() {
  const { slideIndex } = useParams<{ slideIndex: string }>();
  const navigate = useNavigate();
  const { data } = useQuizData('/data/reinvent-2025-quiz-deck.json');

  const currentSlideIndex = parseInt(slideIndex || '0', 10);

  // Validate slide index
  if (isNaN(currentSlideIndex) || currentSlideIndex < 0) {
    return <Navigate to="/" replace />;
  }

  // Wait for data to load
  if (!data || !data.slides) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-300">Loading slide...</p>
        </div>
      </div>
    );
  }

  const slides = data.slides;

  // If we've reached the end, go to summary
  if (currentSlideIndex >= slides.length) {
    return <Navigate to="/summary" replace />;
  }

  const quizConfig = data?.quizConfig;
  const showProgressBar = quizConfig?.showProgressBar ?? true;
  const shuffleChoices = quizConfig?.shuffleChoices ?? false;

  const handleNext = () => {
    const nextIndex = currentSlideIndex + 1;
    if (nextIndex < slides.length) {
      navigate(`/quiz/${nextIndex}`);
    } else {
      navigate('/summary');
    }
  };

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Score Display - always visible during quiz */}
      <ScoreDisplay />

      {/* Progress Indicator - conditional based on config */}
      {showProgressBar && (
        <ProgressIndicator current={currentSlideIndex + 1} total={slides.length} />
      )}

      {/* Current Slide */}
      <div className="container mx-auto px-4 py-8">
        {currentSlide.type === 'content' ? (
          <ContentSlide slide={currentSlide} onNext={handleNext} />
        ) : (
          <QuizSlide 
            slide={currentSlide} 
            onNext={handleNext}
            shuffleEnabled={shuffleChoices}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Summary Route Component
 * 
 * Requirements:
 * - 3.2: Display summary screen with total score
 * - 15.4: Enable/disable retry option based on config
 */
function SummaryRoute() {
  const navigate = useNavigate();
  const { score, totalPossible, resetScore } = useScore();
  const { data } = useQuizData('/data/reinvent-2025-quiz-deck.json');

  const quizConfig = data?.quizConfig;
  const allowRetry = quizConfig?.allowRetry ?? true;

  const handleRestart = () => {
    resetScore();
    navigate('/');
  };

  return (
    <SummaryScreen
      score={score}
      totalPossible={totalPossible}
      onRestart={handleRestart}
      allowRetry={allowRetry}
    />
  );
}

/**
 * Main Quiz Application Component with Routing
 * 
 * Manages quiz state, navigation, and configuration.
 * Integrates all components and provides quiz configuration context.
 * 
 * Requirements:
 * - 1.1: Display welcome screen
 * - 1.2: Sequential slide progression
 * - 4.1: Load quiz data from JSON file
 * - 4.3: Handle loading and error states
 * - 9.3: React Router for navigation
 * - 10.4: Keyboard shortcut help overlay
 * - 15.1: Load and apply quizConfig settings
 * - 15.2: Implement answer choice shuffling when enabled
 * - 15.3: Show/hide progress bar based on config
 * - 15.4: Enable/disable retry option based on config
 * - 15.5: Apply default configuration when not specified
 */
function QuizApp() {
  const { data, loading, error } = useQuizData('/data/reinvent-2025-quiz-deck.json');
  const [showHelp, setShowHelp] = useState(false);

  // Global keyboard shortcut for help overlay (? key)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault();
        setShowHelp((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-reinvent-purple mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading quiz data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-4xl font-bold mb-4 text-red-500">Error Loading Quiz</h1>
          <p className="text-xl text-gray-300 mb-4">{error}</p>
          <p className="text-sm text-gray-400">
            Please ensure quiz-data.json exists in the data directory.
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || !data.slides || data.slides.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-300">No quiz data available.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomeRoute />} />
        <Route path="/quiz/:slideIndex" element={<QuizRoute />} />
        <Route path="/summary" element={<SummaryRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Global Keyboard Help Overlay */}
      <KeyboardHelpOverlay isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}

/**
 * Root App Component with Providers and Router
 * 
 * Requirements:
 * - 9.3: React Router for navigation
 */
function App() {
  return (
    <BrowserRouter>
      <ScoreProvider>
        <QuizConfigProvider>
          <QuizApp />
        </QuizConfigProvider>
      </ScoreProvider>
    </BrowserRouter>
  );
}

export default App;
