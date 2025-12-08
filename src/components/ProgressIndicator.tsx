import React from 'react';
import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

/**
 * ProgressIndicator Component
 * 
 * Displays the current slide position (e.g., "5 / 20") and a visual progress bar.
 * Styled with re:Invent colors for consistency with the brand.
 * 
 * Requirements:
 * - Display current slide position as "X / Y"
 * - Show visual progress bar
 * - Style with re:Invent colors
 */
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ current, total }) => {
  const progressPercentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div
      className="fixed top-2 left-2 sm:top-4 sm:left-4 bg-black/60 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2 sm:px-6 sm:py-3 shadow-lg z-10"
      data-testid="progress-indicator"
    >
      <div className="flex flex-col gap-2 min-w-[100px] sm:min-w-[120px]">
        {/* Slide Position Text */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm text-gray-300 uppercase tracking-wide font-semibold">
            Progress
          </span>
          <span className="text-base sm:text-lg font-bold text-white" data-testid="progress-text">
            {current} / {total}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div
          className="w-full h-2 bg-gray-800 rounded-full overflow-hidden"
          data-testid="progress-bar-container"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-reinvent-purple via-reinvent-blue to-reinvent-purple rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            data-testid="progress-bar-fill"
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
