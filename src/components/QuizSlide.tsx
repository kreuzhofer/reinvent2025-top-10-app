import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, SkipForward, ChevronRight } from 'lucide-react';
import type { QuizSlide as QuizSlideType } from '../types/quiz.types';
import { useScore } from '../context/ScoreContext';
import { useQuizState } from '../context/QuizStateContext';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { useAudioManager } from '../hooks/useAudioManager';
import { useEmojiManager } from '../hooks/useEmojiManager';
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
 * - 3.2: Read backgroundMusic property from slide data
 * - 3.3: Play background music with fade transitions
 * - 3.4: Continue playing if backgroundMusic matches current track
 * - 3.6: Continue current music if no backgroundMusic specified
 * - 9.2: Support backgroundMusic property on questions
 * - 9.3: Load audio from backgroundMusic property
 * - 9.4: Compare backgroundMusic with current track
 * - 9.5: Maintain continuous playback when tracks match
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
  currentSlide: _currentSlide,
  totalSlides: _totalSlides,
  showProgress: _showProgress = false,
  showScore = false
}) => {
  const { addPoints, calculateTimeAdjustedPoints } = useScore();
  const { getAnswerState, setAnswerState, getShuffleOrder, setShuffleOrder } = useQuizState();
  const { playBackgroundMusic, playSFX } = useAudioManager();
  const { showSuccessEmoji, showMissEmoji } = useEmojiManager();
  
  // Check if this question was already answered
  const savedState = getAnswerState(slide.id);
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(savedState?.selectedIndex ?? null);
  const [isAnswered, setIsAnswered] = useState(!!savedState);
  const [isTimedOut, setIsTimedOut] = useState(savedState?.isTimedOut ?? false);
  const [isSkipped, setIsSkipped] = useState(savedState?.isSkipped ?? false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showExplanation, setShowExplanation] = useState(!!savedState);

  // Shuffle choices if enabled, but use saved shuffle order if it exists
  const { displayChoices, correctIndex } = useMemo(() => {
    if (shuffleEnabled) {
      // Check if we have a saved shuffle order for this slide
      const savedOrder = getShuffleOrder(slide.id);
      
      if (savedOrder) {
        // Use the saved shuffle order
        const shuffledChoices = savedOrder.choiceIndices.map(i => slide.choices[i]);
        return { displayChoices: shuffledChoices, correctIndex: savedOrder.correctIndex };
      } else {
        // Generate new shuffle and save it
        const { shuffledChoices, newCorrectIndex } = shuffleChoices(
          slide.choices,
          slide.correctAnswerIndex
        );
        
        // Save the shuffle order for consistency across reloads
        const choiceIndices = shuffledChoices.map(choice => 
          slide.choices.findIndex(c => c.text === choice.text)
        );
        setShuffleOrder(slide.id, {
          choiceIndices,
          correctIndex: newCorrectIndex,
        });
        
        return { displayChoices: shuffledChoices, correctIndex: newCorrectIndex };
      }
    }
    return { displayChoices: slide.choices, correctIndex: slide.correctAnswerIndex };
  }, [slide.id, slide.choices, slide.correctAnswerIndex, shuffleEnabled, getShuffleOrder, setShuffleOrder]);

  // Scroll to top when slide changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slide.id]);

  // Handle background music for this slide
  useEffect(() => {
    // Play background music if specified on the slide
    if (slide.backgroundMusic) {
      playBackgroundMusic(slide.backgroundMusic);
    } else {
      // For quiz slides without specific background music, play default quiz music
      playBackgroundMusic('quiz-bg.mp3');
    }
  }, [slide.id, slide.backgroundMusic, playBackgroundMusic]);

  const handleAnswerSelect = (index: number) => {
    // Prevent selection if already answered, timed out, or skipped
    if (isAnswered || isTimedOut || isSkipped || savedState) {
      return;
    }

    setSelectedIndex(index);
    setIsAnswered(true);

    // Check if answer is correct (use correctIndex which accounts for shuffling)
    const isCorrect = index === correctIndex;

    let pointsAwarded = 0;
    if (isCorrect) {
      // Calculate time-adjusted points
      pointsAwarded = calculateTimeAdjustedPoints(slide.points, elapsedSeconds);
      addPoints(pointsAwarded);
      
      // Trigger success emoji animation and sound effect
      showSuccessEmoji();
      playSFX('correct-answer.mp3').catch(() => {
        // Silently fail if audio doesn't play
      });
    } else {
      // Trigger miss emoji animation and sound effect
      showMissEmoji();
      playSFX('wrong-answer.mp3').catch(() => {
        // Silently fail if audio doesn't play
      });
    }

    // Save answer state to localStorage
    setAnswerState(slide.id, {
      selectedIndex: index,
      isCorrect,
      pointsAwarded,
      isSkipped: false,
      isTimedOut: false,
    });

    // Show explanation after a brief delay
    setTimeout(() => {
      setShowExplanation(true);
    }, 500);
  };

  const handleTimeout = () => {
    if (savedState) return; // Don't process if already answered
    
    setIsTimedOut(true);
    setShowExplanation(true);
    
    // Save timeout state
    setAnswerState(slide.id, {
      selectedIndex: null,
      isCorrect: false,
      pointsAwarded: 0,
      isSkipped: false,
      isTimedOut: true,
    });
  };

  const handleTick = (elapsed: number) => {
    setElapsedSeconds(elapsed);
  };

  const handleSkip = () => {
    if (savedState) return; // Don't process if already answered
    
    setIsSkipped(true);
    setShowExplanation(true);
    
    // Save skip state
    setAnswerState(slide.id, {
      selectedIndex: null,
      isCorrect: false,
      pointsAwarded: 0,
      isSkipped: true,
      isTimedOut: false,
    });
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
        showScore={showScore}
        showAudioControls={true}
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3,
          delay: 0.2,
          ease: 'easeOut'
        }}
        className="mt-6 sm:mt-8 flex justify-end gap-3"
      >
        {/* Skip Button - only show if not answered, timed out, or skipped */}
        {!isAnswered && !isTimedOut && !isSkipped && (
          <motion.button
            onClick={handleSkip}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg transition-colors duration-200"
            data-testid="skip-button"
            aria-label="Skip this question and move to the next slide"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            Skip
          </motion.button>
        )}

        {/* Next Button - show after answer, timeout, or skip */}
        {shouldShowNextButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={onNext}
            className="flex items-center gap-2 bg-reinvent-purple hover:bg-purple-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg transition-colors duration-200"
            data-testid="next-button"
            aria-label="Continue to next slide"
          >
            Next
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </motion.button>
        )}
      </motion.div>
    </motion.main>
    </>
  );
};

export default QuizSlide;
