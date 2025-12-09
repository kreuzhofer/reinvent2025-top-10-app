import React from 'react';
import ScoreDisplay from './ScoreDisplay';
import { AudioControls } from './AudioControls';

interface HeaderProps {
  showScore?: boolean;
  showAudioControls?: boolean;
}

/**
 * Header Component
 * 
 * Displays the AWS re:Invent logo in the upper left corner.
 * Optionally displays score with trophy icon and audio controls in the header.
 * Used across all quiz pages for consistent branding.
 * 
 * Requirements:
 * - 6.1, 6.2: Integrate audio controls into header
 * - 7.1, 7.2, 7.3: Clean, organized header layout
 * - 8.1, 8.2, 8.3: Remove slide counter display
 */
const Header: React.FC<HeaderProps> = ({ 
  showScore = false,
  showAudioControls = true
}) => {
  return (
    <header 
      className="fixed top-1 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-gray-800"
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

        {/* Right side: Score and Audio Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
          {showScore && (
            <ScoreDisplay inline showMaxPoints={false} showTrophy={true} />
          )}
          {showAudioControls && (
            <AudioControls inline />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
