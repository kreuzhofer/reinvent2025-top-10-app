import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, SkipForward } from 'lucide-react';
import type { QuizSlide as QuizSlideType } from '../types/quiz.types';
import { useScore } from '../context/ScoreContext';
import QuizTimer from './QuizTimer';
import FunFactDisplay from './FunFactDisplay';

interface QuizSlideProps {
  slide: QuizSlideType;
  onNext: () => void;
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
 * - 11.4: Handle timer timeout (highlight correct answer, award 0 points)
 * - 11.5: Calculate time-adjusted points based on elapsed time
 * - 11.6: Award zero points on skip
 * - 14.1: Display fun fact after explanation (if present)
 * - 14.2: Visually distinguish fun facts
 * - 14.3: Handle optional fun facts gracefully
 */
const QuizSlide: React.FC<QuizSlideProps> = ({ slide, onNext }) => {
  const { addPoints, addPossiblePoints, calculateTimeAdjustedPoints } = useScore();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

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

    // Check if answer is correct
    const isCorrect = index === slide.correctAnswerIndex;

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

  const getChoiceClassName = (index: number): string => {
    const baseClasses = 'w-full p-4 text-left rounded-lg border-2 transition-all duration-200';
    
    // If not answered, timed out, or skipped - show default state
    if (!isAnswered && !isTimedOut && !isSkipped) {
      return `${baseClasses} border-gray-700 bg-gray-800 hover:border-reinvent-purple hover:bg-gray-700 cursor-pointer`;
    }

    // Show correct answer in green
    if (index === slide.correctAnswerIndex) {
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
    return index === slide.correctAnswerIndex;
  };

  const getChoiceIcon = (index: number) => {
    if (!isAnswered && !isTimedOut && !isSkipped) {
      return null;
    }

    if (index === slide.correctAnswerIndex) {
      return <CheckCircle className="w-6 h-6 text-green-500" data-testid={`correct-icon-${index}`} />;
    }

    if (index === selectedIndex && !isCorrect(index)) {
      return <XCircle className="w-6 h-6 text-red-500" data-testid={`incorrect-icon-${index}`} />;
    }

    return null;
  };

  const shouldShowNextButton = isAnswered || isTimedOut || isSkipped;

  return (
    <motion.div
      className="max-w-4xl mx-auto p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      data-testid="quiz-slide"
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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2" data-testid="quiz-question">
          {slide.question}
        </h2>
        {slide.relatedAnnouncementId && (
          <p className="text-sm text-gray-400">
            Related to: {slide.relatedAnnouncementId}
          </p>
        )}
      </div>

      {/* Answer Choices */}
      <div className="space-y-4 mb-6" data-testid="quiz-choices">
        {slide.choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            className={getChoiceClassName(index)}
            disabled={isAnswered || isTimedOut || isSkipped}
            data-testid={`choice-${index}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-reinvent-purple">
                  {index + 1}
                </span>
                <span className="text-lg text-white">{choice.text}</span>
              </div>
              {getChoiceIcon(index)}
            </div>
          </button>
        ))}
      </div>

      {/* Feedback Message */}
      {isAnswered && !isTimedOut && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-lg mb-6 ${
            isCorrect(selectedIndex!)
              ? 'bg-green-500/20 border-2 border-green-500'
              : 'bg-red-500/20 border-2 border-red-500'
          }`}
          data-testid="quiz-feedback"
        >
          <p className={`text-lg font-semibold ${
            isCorrect(selectedIndex!)
              ? 'text-green-400'
              : 'text-red-400'
          }`}>
            {isCorrect(selectedIndex!)
              ? '✓ Correct!'
              : '✗ Incorrect'}
          </p>
        </motion.div>
      )}

      {/* Timeout Message */}
      {isTimedOut && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg mb-6 bg-red-500/20 border-2 border-red-500"
          data-testid="timeout-message"
        >
          <p className="text-lg font-semibold text-red-400">
            ⏱ Time's up! No points awarded.
          </p>
        </motion.div>
      )}

      {/* Skip Message */}
      {isSkipped && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg mb-6 bg-gray-700/50 border-2 border-gray-600"
          data-testid="skip-message"
        >
          <p className="text-lg font-semibold text-gray-400">
            ⏭ Question skipped. No points awarded.
          </p>
        </motion.div>
      )}

      {/* Explanation */}
      {showExplanation && slide.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 bg-gray-800/50 rounded-lg border border-gray-700"
          data-testid="quiz-explanation"
        >
          <h3 className="text-xl font-bold text-white mb-3">Explanation</h3>
          <p className="text-gray-300 leading-relaxed">{slide.explanation}</p>
        </motion.div>
      )}

      {/* Fun Fact */}
      {showExplanation && slide.funFact && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FunFactDisplay funFact={slide.funFact} />
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        {/* Skip Button - only show if not answered, timed out, or skipped */}
        {!isAnswered && !isTimedOut && !isSkipped && (
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            data-testid="skip-button"
          >
            <SkipForward className="w-5 h-5" />
            Skip Question
          </button>
        )}

        {/* Next Button - show after answer, timeout, or skip */}
        {shouldShowNextButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onNext}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-reinvent-purple to-reinvent-blue hover:from-reinvent-purple/80 hover:to-reinvent-blue/80 text-white text-lg font-semibold rounded-lg transition-all"
            data-testid="next-button"
          >
            Next →
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default QuizSlide;
