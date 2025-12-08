import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, SkipForward } from 'lucide-react';
import type { QuizSlide as QuizSlideType } from '../types/quiz.types';
import { useScore } from '../context/ScoreContext';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import QuizTimer from './QuizTimer';
import FunFactDisplay from './FunFactDisplay';
import Header from './Header';
import { shuffleChoices } from '../utils/shuffleChoices';

interface QuizSlideProps {
  slide: QuizSlideType;
  onNext: () => void;
  shuffleEnabled?: boolean;
  currentSlide?: number;
  totalSlides?: number;
  showProgress?: boolean;
  showScore?: boolean;
}

/**
 * QuizSlide Component
 * 
 * Displays quiz questions with multiple choice answers, timer, and feedback.
 * Handles answer selection, skip functionality, and time-adjusted scoring.
 * 
 * Requirements:
 * - 2.1: Display question with multiple answer choices
 * - 2.2: Provide immediate visual feedback on answer selection
 * - 2.3: Award time-adjusted points for correct answers
 * - 2.4: Display correct answer for incorrect selections
 * - 2.5: Provide next button after answer/timeout/skip
 * - 2.6: Provide skip button
 * - 10.1: Right arrow key to advance slides (when answered)
 * - 10.2: Number keys (1-N) to select quiz answers
 * - 11.4: Handle timer timeout (highlight correct answer, award 0 points)
 * - 11.5: Calculate time-adjusted points based on elapsed time
 * - 11.6: Award zero points on skip
 * - 14.1: Display fun fact after explanation (if present)
 * - 14.2: Visually distinguish fun facts
 * - 14.3: Handle optional fun facts gracefully
 */
const QuizSlide: React.FC<QuizSlideProps> = ({ 
  slide, 
  onNext, 
  shuffleEnabled = false,
  currentSlide,
  totalSlides,
  showProgress = false,
  showScore = false
}) => {
  const { addPoints, addPossiblePoints, calculateTimeAdjustedPoints } = useScore();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  // Shuffle choices if enabled (memoized to prevent re-shuffling on re-renders)
  const { displayChoices, correctIndex } = useMemo(() => {
    if (shuffleEnabled) {
      const { shuffledChoices, newCorrectIndex } = shuffleChoices(
        slide.choices,
        slide.correctAnswerIndex
      );
      return { displayChoices: shuffledChoices, correctIndex: newCorrectIndex };
    }
    return { displayChoices: slide.choices, correctIndex: slide.correctAnswerIndex };
  }, [slide.choices, slide.correctAnswerIndex, shuffleEnabled]);

  // Add possible points when component mounts
  useEffect(() => {
    addPossiblePoints(slide.points);
  }, [slide.points, addPossiblePoints]);

  const handleAnswerSelect = (index: number) => {
    // Prevent selection if already answered, timed out, or skipped
    if (isAnswered || isTimedOut || isSkipped) {
      return;
    }

    setSelectedIndex(index);
    setIsAnswered(true);

    // Check if answer is correct (use correctIndex which accounts for shuffling)
    const isCorrect = index === correctIndex;

    if (isCorrect) {
      // Calculate time-adjusted points
      const points = calculateTimeAdjustedPoints(slide.points, elapsedSeconds);
      addPoints(points);
    }

    // Show explanation after a brief delay
    setTimeout(() => {
      setShowExplanation(true);
    }, 500);
  };

  const handleTimeout = () => {
    setIsTimedOut(true);
    setShowExplanation(true);
    // Award 0 points (no need to call addPoints)
  };

  const handleTick = (elapsed: number) => {
    setElapsedSeconds(elapsed);
  };

  const handleSkip = () => {
    setIsSkipped(true);
    setShowExplanation(true);
    // Award 0 points (no need to call addPoints)
  };

  // Enable keyboard navigation for quiz slides
  const shouldShowNextButton = isAnswered || isTimedOut || isSkipped;
  useKeyboardNav({
    onNext: shouldShowNextButton ? onNext : undefined,
    onSelectAnswer: !isAnswered && !isTimedOut && !isSkipped ? handleAnswerSelect : undefined,
    answerCount: displayChoices.length,
    enabled: true,
  });

  const getChoiceClassName = (index: number): string => {
    const baseClasses = 'w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all duration-200';
    
    // If not answered, timed out, or skipped - show default state
    if (!isAnswered && !isTimedOut && !isSkipped) {
      return `${baseClasses} border-gray-700 bg-gray-800 hover:border-reinvent-purple hover:bg-gray-700 cursor-pointer`;
    }

    // Show correct answer in green (use correctIndex which accounts for shuffling)
    if (index === correctIndex) {
      return `${baseClasses} border-green-500 bg-green-500/20 cursor-not-allowed`;
    }

    // Show selected incorrect answer in red
    if (index === selectedIndex && !isCorrect(index)) {
      return `${baseClasses} border-red-500 bg-red-500/20 cursor-not-allowed`;
    }

    // Other choices - disabled state
    return `${baseClasses} border-gray-700 bg-gray-800 opacity-50 cursor-not-allowed`;
  };

  const isCorrect = (index: number): boolean => {
    return index === correctIndex;
  };

  const getChoiceIcon = (index: number) => {
    if (!isAnswered && !isTimedOut && !isSkipped) {
      return null;
    }

    if (index === correctIndex) {
      return <CheckCircle className="w-6 h-6 text-green-500" data-testid={`correct-icon-${index}`} />;
    }

    if (index === selectedIndex && !isCorrect(index)) {
      return <XCircle className="w-6 h-6 text-red-500" data-testid={`incorrect-icon-${index}`} />;
    }

    return null;
  };

  return (
    <>
      <Header 
        showProgress={showProgress}
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        showScore={showScore}
      />
      <motion.main
        className="max-w-4xl mx-auto px-4 py-6 sm:p-8 pt-20 sm:pt-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.4,
          ease: 'easeOut'
        }}
        data-testid="quiz-slide"
        role="main"
        aria-label="Quiz question"
      >
      {/* Timer - only show if not answered, timed out, or skipped */}
      {!isAnswered && !isTimedOut && !isSkipped && (
        <QuizTimer
          basePoints={slide.points}
          onTimeout={handleTimeout}
          onTick={handleTick}
          timeLimit={slide.timeLimit}
        />
      )}

      {/* Question */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2" data-testid="quiz-question">
          {slide.question}
        </h2>
        {slide.relatedAnnouncementId && (
          <p className="text-xs sm:text-sm text-gray-400">
            Related to: {slide.relatedAnnouncementId}
          </p>
        )}
      </div>

      {/* Answer Choices */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6" data-testid="quiz-choices" role="radiogroup" aria-label="Answer choices">
        {displayChoices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            className={getChoiceClassName(index)}
            disabled={isAnswered || isTimedOut || isSkipped}
            data-testid={`choice-${index}`}
            role="radio"
            aria-checked={selectedIndex === index}
            aria-label={`Choice ${index + 1}: ${choice.text}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-base sm:text-lg font-semibold text-reinvent-purple" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="text-sm sm:text-base md:text-lg text-white">{choice.text}</span>
              </div>
              <span aria-hidden="true">{getChoiceIcon(index)}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Feedback Message */}
      {isAnswered && !isTimedOut && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
          className={`p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 ${
            isCorrect(selectedIndex!)
              ? 'bg-green-500/20 border-2 border-green-500'
              : 'bg-red-500/20 border-2 border-red-500'
          }`}
          data-testid="quiz-feedback"
        >
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className={`text-base sm:text-lg font-semibold ${
              isCorrect(selectedIndex!)
                ? 'text-green-400'
                : 'text-red-400'
            }`}
          >
            {isCorrect(selectedIndex!)
              ? '✓ Correct!'
              : '✗ Incorrect'}
          </motion.p>
        </motion.div>
      )}

      {/* Timeout Message */}
      {isTimedOut && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
          className="p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 bg-red-500/20 border-2 border-red-500"
          data-testid="timeout-message"
        >
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-base sm:text-lg font-semibold text-red-400"
          >
            ⏱ Time's up! No points awarded.
          </motion.p>
        </motion.div>
      )}

      {/* Skip Message */}
      {isSkipped && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
          className="p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 bg-gray-700/50 border-2 border-gray-600"
          data-testid="skip-message"
        >
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-base sm:text-lg font-semibold text-gray-400"
          >
            ⏭ Question skipped. No points awarded.
          </motion.p>
        </motion.div>
      )}

      {/* Explanation */}
      {showExplanation && slide.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            ease: 'easeOut'
          }}
          className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gray-800/50 rounded-lg border border-gray-700"
          data-testid="quiz-explanation"
        >
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3"
          >
            Explanation
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="text-sm sm:text-base text-gray-300 leading-relaxed"
          >
            {slide.explanation}
          </motion.p>
        </motion.div>
      )}

      {/* Fun Fact */}
      {showExplanation && slide.funFact && (
        <FunFactDisplay funFact={slide.funFact} />
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
        {/* Skip Button - only show if not answered, timed out, or skipped */}
        {!isAnswered && !isTimedOut && !isSkipped && (
          <button
            onClick={handleSkip}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white text-sm sm:text-base rounded-lg transition-colors"
            data-testid="skip-button"
            aria-label="Skip this question and move to the next slide"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            Skip Question
          </button>
        )}

        {/* Next Button - show after answer, timeout, or skip */}
        {shouldShowNextButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ 
              duration: 0.3,
              ease: 'easeOut'
            }}
            onClick={onNext}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-reinvent-purple to-reinvent-blue hover:from-reinvent-purple/80 hover:to-reinvent-blue/80 text-white text-base sm:text-lg font-semibold rounded-lg transition-all"
            data-testid="next-button"
            aria-label="Continue to next slide"
          >
            Next →
          </motion.button>
        )}
      </div>
    </motion.main>
    </>
  );
};

export default QuizSlide;
