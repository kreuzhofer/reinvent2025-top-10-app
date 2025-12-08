import React from 'react';
import ScoreDisplay from './ScoreDisplay';

interface HeaderProps {
  showProgress?: boolean;
  currentSlide?: number;
  totalSlides?: number;
  showScore?: boolean;
}

/**
 * Header Component
 * 
 * Displays the AWS re:Invent logo in the upper left corner.
 * Optionally displays progress indicator and score in the header.
 * Used across all quiz pages for consistent branding.
 */
const Header: React.FC<HeaderProps> = ({ 
  showProgress = false, 
  currentSlide = 0, 
  totalSlides = 0,
  showScore = false
}) => {
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800"
      role="banner"
    >
      <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
        {/* Logo with Date/Location */}
        <div className="flex flex-col">
          <img
            src="/reinvent-white.png"
            alt="AWS re:Invent Logo"
            className="h-8 sm:h-10 md:h-12"
          />
          <p className="text-[0.5rem] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 tracking-wide whitespace-nowrap">
            December 1-5, 2025 | Las Vegas
          </p>
        </div>

        {/* Right side: Progress and Score */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Progress Indicator */}
          {showProgress && totalSlides > 0 && (
            <div className="flex items-center gap-2" aria-label="Quiz progress">
              <span className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide font-semibold">
                Progress
              </span>
              <span className="text-sm sm:text-base font-bold text-white">
                {currentSlide} / {totalSlides}
              </span>
            </div>
          )}

          {/* Score Display */}
          {showScore && (
            <ScoreDisplay inline />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
