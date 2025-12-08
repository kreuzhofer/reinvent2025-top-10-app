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
import type { Slide } from './types/quiz.types';

/**
 * Main Quiz Application Component
 * 
 * Manages quiz state, navigation, and configuration.
 * Integrates all components and provides quiz configuration context.
 * 
 * Requirements:
 * - 1.1: Display welcome screen
 * - 4.1: Load quiz data from JSON file
 * - 4.3: Handle loading and error states
 * - 15.1: Load and apply quizConfig settings
 * - 15.2: Implement answer choice shuffling when enabled
 * - 15.3: Show/hide progress bar based on config
 * - 15.4: Enable/disable retry option based on config
 * - 15.5: Apply default configuration when not specified
 */
function QuizApp() {
  const { data, loading, error } = useQuizData('/src/data/reinvent-2025-quiz-deck.json');
  const { score, totalPossible, resetScore } = useScore();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(-1); // -1 = welcome screen
  const [slides, setSlides] = useState<Slide[]>([]);

  // Load slides when data is available
  useEffect(() => {
    if (data?.slides) {
      setSlides(data.slides);
    }
  }, [data]);

  const handleStart = () => {
    setCurrentSlideIndex(0);
  };

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      // Move to summary screen
      setCurrentSlideIndex(slides.length);
    }
  };

  const handleRestart = () => {
    resetScore();
    setCurrentSlideIndex(-1);
  };

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
  if (!data || !slides.length) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-300">No quiz data available.</p>
        </div>
      </div>
    );
  }

  const quizConfig = data.quizConfig;
  const showProgressBar = quizConfig?.showProgressBar ?? true;
  const shuffleChoices = quizConfig?.shuffleChoices ?? false;
  const allowRetry = quizConfig?.allowRetry ?? true;

  // Welcome screen
  if (currentSlideIndex === -1) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  // Summary screen
  if (currentSlideIndex >= slides.length) {
    return (
      <SummaryScreen
        score={score}
        totalPossible={totalPossible}
        onRestart={handleRestart}
        allowRetry={allowRetry}
      />
    );
  }

  // Quiz slides
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
 * Root App Component with Providers
 */
function App() {
  return (
    <ScoreProvider>
      <QuizConfigProvider>
        <QuizApp />
      </QuizConfigProvider>
    </ScoreProvider>
  );
}

export default App;
