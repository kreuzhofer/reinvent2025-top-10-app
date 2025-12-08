import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';

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
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
        data-testid="summary-screen"
      >
        {/* Trophy Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
          className="mb-8"
        >
          <Trophy className="w-24 h-24 mx-auto text-reinvent-yellow" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Quiz Complete!
        </motion.h1>

        {/* Performance Message */}
        <motion.p
          className={`text-2xl md:text-3xl font-semibold mb-8 ${performance.color}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {performance.emoji} {performance.text}
        </motion.p>

        {/* Score Display */}
        <motion.div
          className="bg-gray-900 border-2 border-gray-700 rounded-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {/* Points Score */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">
              Your Score
            </p>
            <p className="text-5xl md:text-6xl font-bold text-white" data-testid="final-score">
              {score}
              <span className="text-2xl text-gray-500"> / {totalPossible}</span>
            </p>
          </div>

          {/* Percentage Score */}
          <div className="pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">
              Percentage
            </p>
            <p 
              className="text-4xl md:text-5xl font-bold text-reinvent-purple"
              data-testid="final-percentage"
            >
              {percentage}%
            </p>
          </div>
        </motion.div>

        {/* Restart Button - Conditional based on allowRetry */}
        {allowRetry && onRestart && (
          <motion.button
            onClick={onRestart}
            className="flex items-center justify-center gap-3 mx-auto bg-reinvent-purple hover:bg-purple-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-300"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid="restart-button"
          >
            <RotateCcw className="w-6 h-6" />
            Retake Quiz
          </motion.button>
        )}

        {/* Message when retry is disabled */}
        {!allowRetry && (
          <motion.p
            className="text-gray-500 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            data-testid="no-retry-message"
          >
            Thank you for completing the quiz!
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default SummaryScreen;
