import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useScore } from '../context/ScoreContext';

interface ScoreDisplayProps {
  inline?: boolean;
  showMaxPoints?: boolean;
  showTrophy?: boolean;
}

/**
 * ScoreDisplay Component
 * 
 * Displays the current score persistently throughout the quiz.
 * Features animated score updates using Framer Motion.
 * Includes screen reader announcements for score changes.
 * Can be displayed inline (in header) or as a fixed overlay.
 * 
 * Requirements:
 * - 3.1: Display score prominently while viewing any slide
 * - 8.3: Animate score updates
 * - 10.5: Screen reader announcements for score changes
 * - 4.1, 4.2: Show only current points during gameplay
 * - 5.1, 5.2, 5.3: Show both current and max points on summary
 * - 9.1, 9.2, 9.3, 9.4, 9.5: Trophy icon with bordered container
 */
const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  inline = false,
  showMaxPoints = true,
  showTrophy = false
}) => {
  const { score, totalPossible } = useScore();
  const previousScoreRef = useRef(score);
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Announce score changes to screen readers
    if (score !== previousScoreRef.current && announcementRef.current) {
      const scoreDiff = score - previousScoreRef.current;
      if (scoreDiff > 0) {
        announcementRef.current.textContent = `Score increased by ${scoreDiff} points. Current score: ${score} of ${totalPossible}`;
      }
      previousScoreRef.current = score;
    }
  }, [score, totalPossible]);

  if (inline) {
    // Inline version for header
    const content = (
      <>
        {showTrophy && (
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-reinvent-yellow" aria-hidden="true" data-testid="trophy-icon" />
        )}
        <span className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide font-semibold">
          Score
        </span>
        <motion.span
          key={score}
          className="text-lg sm:text-xl font-bold text-white"
          initial={{ scale: 1.2, color: '#8B5CF6' }}
          animate={{ scale: 1, color: '#FFFFFF' }}
          transition={{ 
            duration: 0.3,
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
          data-testid="score-value"
        >
          {score}
        </motion.span>
        {showMaxPoints && totalPossible > 0 && (
          <span className="text-xs text-gray-400" data-testid="score-total">
            / {totalPossible}
          </span>
        )}
      </>
    );

    return (
      <>
        {/* Screen reader announcement region */}
        <div
          ref={announcementRef}
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        />
        
        {showTrophy ? (
          <div 
            className="flex items-center gap-2 px-3 py-2 border-2 border-gray-700 rounded-lg bg-gray-900/50"
            data-testid="score-display" 
            aria-label="Current quiz score"
          >
            {content}
          </div>
        ) : (
          <div className="flex items-center gap-2" data-testid="score-display" aria-label="Current quiz score">
            {content}
          </div>
        )}
      </>
    );
  }

  // Original fixed version (kept for backward compatibility if needed)
  return (
    <>
      {/* Screen reader announcement region */}
      <div
        ref={announcementRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
      
      <motion.aside
        className="fixed top-2 right-2 sm:top-4 sm:right-4 bg-reinvent-purple/20 backdrop-blur-sm border border-reinvent-purple/50 rounded-lg px-3 py-2 sm:px-6 sm:py-3 shadow-lg z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.4,
          ease: 'easeOut'
        }}
        data-testid="score-display"
        aria-label="Current quiz score"
        role="complementary"
      >
        <div className="flex flex-col items-end">
          <span className="text-xs sm:text-sm text-gray-300 uppercase tracking-wide font-semibold" id="score-label">
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
            aria-labelledby="score-label"
          >
            {score}
          </motion.span>
          {showMaxPoints && totalPossible > 0 && (
            <span className="text-xs text-gray-400 mt-1" data-testid="score-total" aria-label={`out of ${totalPossible} total points`}>
              of {totalPossible}
            </span>
          )}
        </div>
      </motion.aside>
    </>
  );
};

export default ScoreDisplay;
