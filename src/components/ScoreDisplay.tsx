import React from 'react';
import { motion } from 'framer-motion';
import { useScore } from '../context/ScoreContext';

/**
 * ScoreDisplay Component
 * 
 * Displays the current score persistently throughout the quiz.
 * Features animated score updates using Framer Motion.
 * 
 * Requirements:
 * - 3.1: Display score prominently while viewing any slide
 * - 8.3: Animate score updates
 */
const ScoreDisplay: React.FC = () => {
  const { score, totalPossible } = useScore();

  return (
    <motion.div
      className="fixed top-2 right-2 sm:top-4 sm:right-4 bg-reinvent-purple/20 backdrop-blur-sm border border-reinvent-purple/50 rounded-lg px-3 py-2 sm:px-6 sm:py-3 shadow-lg z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4,
        ease: 'easeOut'
      }}
      data-testid="score-display"
    >
      <div className="flex flex-col items-end">
        <span className="text-xs sm:text-sm text-gray-300 uppercase tracking-wide font-semibold">
          Score
        </span>
        <motion.span
          key={score}
          className="text-2xl sm:text-3xl font-bold text-white"
          initial={{ scale: 1.3, color: '#8B5CF6' }}
          animate={{ scale: 1, color: '#FFFFFF' }}
          transition={{ 
            duration: 0.4,
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
          data-testid="score-value"
        >
          {score}
        </motion.span>
        {totalPossible > 0 && (
          <span className="text-xs text-gray-400 mt-1" data-testid="score-total">
            of {totalPossible}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default ScoreDisplay;
