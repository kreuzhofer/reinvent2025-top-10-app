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
      className="fixed top-4 right-4 bg-reinvent-purple/20 backdrop-blur-sm border border-reinvent-purple/50 rounded-lg px-6 py-3 shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="score-display"
    >
      <div className="flex flex-col items-end">
        <span className="text-sm text-gray-300 uppercase tracking-wide font-semibold">
          Score
        </span>
        <motion.span
          key={score}
          className="text-3xl font-bold text-white"
          initial={{ scale: 1.2, color: '#8B5CF6' }}
          animate={{ scale: 1, color: '#FFFFFF' }}
          transition={{ duration: 0.3 }}
          data-testid="score-value"
        >
          {score}
        </motion.span>
        {totalPossible > 0 && (
          <span className="text-xs text-gray-400 mt-1" data-testid="score-total">
            of {totalPossible} possible
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default ScoreDisplay;
