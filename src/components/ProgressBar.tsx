import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;      // Current slide index (1-based)
  total: number;        // Total number of slides
  className?: string;   // Optional additional CSS classes
}

/**
 * ProgressBar Component
 * 
 * Displays quiz progress as a thin horizontal bar at the top of the viewport.
 * Features smooth width transitions using Framer Motion.
 * 
 * Requirements:
 * - 1.1: Render progress bar on Content Slides
 * - 1.2: Render progress bar on Quiz Slides
 * - 1.3: Position spanning full width from left to right edge
 * - 1.4: Set height to 3-4 pixels
 * - 1.5: Update fill percentage based on current/total slides
 * - 2.1: Position at absolute top with zero margin
 * - 2.2: Use thin height (3px)
 * - 2.4: Animate width changes smoothly over 300ms
 * - 2.5: Ensure no overlap with other UI elements
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, className = '' }) => {
  // Calculate progress percentage, handling edge cases
  const progressPercentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  
  return (
    <div 
      className={`fixed top-0 left-0 right-0 h-1.5 bg-gray-900 z-50 ${className}`}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Quiz progress: ${current} of ${total} slides`}
      data-testid="progress-bar"
    >
      <motion.div
        className="h-full bg-gradient-to-r from-reinvent-purple via-reinvent-blue to-reinvent-purple"
        initial={{ width: 0 }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        data-testid="progress-bar-fill"
      />
    </div>
  );
};

export default ProgressBar;
