import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';
import Header from './Header';

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
 * 
 * Requirements:
 * - 3.2: Display summary screen with total score
 * - 3.3: Show score as both number and percentage
 * - 3.4: Provide option to restart quiz
 * - 15.4: Enable/disable retry option based on allowRetry setting
 */
const SummaryScreen: React.FC<SummaryScreenProps> = ({ 
  score, 
  totalPossible, 
  onRestart,
  allowRetry = true 
}) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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

  return (
    <>
      <Header />
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
          className="mb-6 sm:mb-8"
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
              Percentage
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
        </motion.div>

        {/* Restart Button - Conditional based on allowRetry */}
        {allowRetry && onRestart && (
          <motion.button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 sm:gap-3 mx-auto bg-reinvent-purple hover:bg-purple-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg md:text-xl transition-colors duration-200"
            aria-label="Restart the quiz and try again"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.3,
              delay: 0.6,
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

        {/* Message when retry is disabled */}
        {!allowRetry && (
          <motion.p
            className="text-gray-500 text-base sm:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.3,
              delay: 0.6,
              ease: 'easeOut'
            }}
            data-testid="no-retry-message"
          >
            Thank you for completing the quiz!
          </motion.p>
        )}
      </motion.div>
    </div>
    </>
  );
};

export default SummaryScreen;
