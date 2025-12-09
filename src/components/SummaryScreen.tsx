import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';
import Header from './Header';
import { KiroBranding } from './KiroBranding';
import { useAudioManager } from '../hooks/useAudioManager';
import { useQuizData } from '../hooks/useQuizData';
import { useQuizState } from '../context/QuizStateContext';

interface SummaryScreenProps {
  score: number;
  totalPossible: number;
  onRestart?: () => void;
  allowRetry?: boolean;
}

/**
 * SummaryScreen Component
 * 
 * Displays the final score and statistics at the end of the quiz.
 * Shows score as both a number and percentage.
 * Conditionally displays restart button based on allowRetry configuration.
 * Displays Kiro branding at the bottom of the screen.
 * 
 * Requirements:
 * - 3.1, 3.2, 3.4, 3.5: Display Kiro branding on summary screen
 * - 3.2: Display summary screen with total score
 * - 3.3: Show score as both number and percentage
 * - 3.4: Provide option to restart quiz
 * - 3.5: Play victory music on mount
 * - 15.4: Enable/disable retry option based on allowRetry setting
 */
const SummaryScreen: React.FC<SummaryScreenProps> = ({ 
  score, 
  totalPossible, 
  onRestart,
  allowRetry = true 
}) => {
  const { playBackgroundMusic } = useAudioManager();
  const { data } = useQuizData('/data/reinvent-2025-quiz-deck.json');
  const { getAnswerState } = useQuizState();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Play victory music on mount
  useEffect(() => {
    playBackgroundMusic('victory-bg.mp3');
  }, [playBackgroundMusic]);

  // Calculate the number of correctly answered questions
  const correctAnswersCount = useMemo(() => {
    if (!data || !data.slides) return 0;
    
    return data.slides
      .filter(slide => slide.type === 'quiz')
      .reduce((count, slide) => {
        if (slide.type === 'quiz') {
          const answerState = getAnswerState(slide.id);
          return count + (answerState?.isCorrect ? 1 : 0);
        }
        return count;
      }, 0);
  }, [data, getAnswerState]);

  // Calculate total number of quiz questions
  const totalQuestions = useMemo(() => {
    if (!data || !data.slides) return 0;
    return data.slides.filter(slide => slide.type === 'quiz').length;
  }, [data]);

  const percentage = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
  
  // Determine performance level
  const getPerformanceMessage = () => {
    if (percentage >= 90) return { text: 'Outstanding!', color: 'text-green-400', emoji: '🌟' };
    if (percentage >= 80) return { text: 'Excellent!', color: 'text-blue-400', emoji: '🎉' };
    if (percentage >= 70) return { text: 'Great Job!', color: 'text-reinvent-purple', emoji: '👏' };
    if (percentage >= 60) return { text: 'Good Effort!', color: 'text-yellow-400', emoji: '👍' };
    return { text: 'Keep Learning!', color: 'text-orange-400', emoji: '📚' };
  };

  const performance = getPerformanceMessage();

  // Handle Share on Slack
  const handleShareOnSlack = async () => {
    // Get the base URL from the current browser location
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    
    // Create an engaging message
    const message = `🎉 I just completed the AWS re:Invent 2025 Quiz!\n\n` +
      `📊 My Results:\n` +
      `✅ Correct Answers: ${correctAnswersCount}/${totalQuestions}\n` +
      `🎯 Score: ${score}/${totalPossible} points (${percentage}%)\n` +
      `${performance.emoji} ${performance.text}\n\n` +
      `Try it yourself: ${baseUrl}`;
    
    try {
      // Copy message to clipboard
      await navigator.clipboard.writeText(message);
      
      // Show success message
      alert('✅ Message copied to clipboard!\n\nNow open Slack and paste (Cmd+V or Ctrl+V) to share your results.');
    } catch (err) {
      // Fallback if clipboard API fails
      console.error('Failed to copy message:', err);
      prompt('Copy this message to share on Slack:', message);
    }
  };

  return (
    <>
      <Header showScore={false} showAudioControls={true} />
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8 pt-20 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.4,
            ease: 'easeOut'
          }}
          className="text-center max-w-2xl w-full"
          data-testid="summary-screen"
        >
        {/* Trophy Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.5,
            delay: 0.1,
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
          className="mb-6 sm:mb-8 mt-8 sm:mt-12"
        >
          <Trophy className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto text-reinvent-yellow" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            delay: 0.2,
            ease: 'easeOut'
          }}
        >
          Quiz Complete!
        </motion.h1>

        {/* Performance Message */}
        <motion.p
          className={`text-xl sm:text-2xl md:text-3xl font-semibold mb-6 sm:mb-8 ${performance.color}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            delay: 0.25,
            ease: 'easeOut'
          }}
        >
          {performance.emoji} {performance.text}
        </motion.p>

        {/* Score Display */}
        <motion.div
          className="bg-gray-900 border-2 border-gray-700 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            delay: 0.3,
            ease: 'easeOut'
          }}
        >
          {/* Points Score */}
          <div className="mb-4 sm:mb-6">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.4 }}
              className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide mb-2"
            >
              Your Score
            </motion.p>
            <motion.p 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.4,
                delay: 0.45,
                type: 'spring',
                stiffness: 200
              }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white" 
              data-testid="final-score"
            >
              {score}
              <span className="text-xl sm:text-2xl text-gray-500"> / {totalPossible}</span>
            </motion.p>
          </div>

          {/* Percentage Score */}
          <div className="pt-4 sm:pt-6 border-t border-gray-700">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.5 }}
              className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide mb-2"
            >
              Percentage of achievable score
            </motion.p>
            <motion.p 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.4,
                delay: 0.55,
                type: 'spring',
                stiffness: 200
              }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-reinvent-purple"
              data-testid="final-percentage"
            >
              {percentage}%
            </motion.p>
          </div>

          {/* Correct Answers Count */}
          <div className="pt-4 sm:pt-6 border-t border-gray-700">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.6 }}
              className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide mb-2"
            >
              Correct Answers
            </motion.p>
            <motion.p 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.4,
                delay: 0.65,
                type: 'spring',
                stiffness: 200
              }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-400"
              data-testid="correct-answers-count"
            >
              {correctAnswersCount}
              <span className="text-xl sm:text-2xl text-gray-500"> / {totalQuestions}</span>
            </motion.p>
          </div>
        </motion.div>

        {/* Action Buttons Container */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            delay: 0.7,
            ease: 'easeOut'
          }}
        >
          {/* Restart Button - Conditional based on allowRetry */}
          {allowRetry && onRestart && (
            <motion.button
              onClick={onRestart}
              className="flex items-center justify-center gap-2 sm:gap-3 bg-reinvent-purple hover:bg-purple-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg md:text-xl transition-colors duration-200"
              aria-label="Restart the quiz and try again"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.3,
                delay: 0.75,
                ease: 'easeOut'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid="restart-button"
            >
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
              Retake Quiz
            </motion.button>
          )}

          {/* Share on Slack Button */}
          <motion.button
            onClick={handleShareOnSlack}
            className="flex items-center justify-center gap-2 sm:gap-3 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg md:text-xl transition-colors duration-200 border border-gray-600"
            aria-label="Share your quiz results on Slack"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.3,
              delay: 0.8,
              ease: 'easeOut'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid="share-slack-button"
          >
            <img 
              src="/data/icons/slack.svg" 
              alt="Slack logo" 
              className="w-5 h-5 sm:w-6 sm:h-6" 
              aria-hidden="true"
            />
            Share on Slack
          </motion.button>
        </motion.div>

        {/* Message when retry is disabled */}
        {!allowRetry && (
          <motion.p
            className="text-gray-500 text-base sm:text-lg mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.3,
              delay: 0.7,
              ease: 'easeOut'
            }}
            data-testid="no-retry-message"
          >
            Thank you for completing the quiz!
          </motion.p>
        )}

        {/* Kiro Branding */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            delay: 0.8,
            ease: 'easeOut'
          }}
          className="mt-8 sm:mt-12 flex justify-center"
        >
          <KiroBranding variant="welcome" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            delay: 0.9,
            ease: 'easeOut'
          }}
          className="mt-8 sm:mt-12 flex justify-center"
        >by dkreuz@
        </motion.div>
      </motion.div>
    </div>
    </>
  );
};

export default SummaryScreen;
