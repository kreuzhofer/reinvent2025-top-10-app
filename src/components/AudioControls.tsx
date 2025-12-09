import React from 'react';
import { useAudioManager } from '../hooks/useAudioManager';

/**
 * AudioControls component provides a mute/unmute button for controlling
 * audio playback in the quiz application.
 * 
 * Features:
 * - Visual mute/unmute button
 * - Keyboard accessible (Space and Enter keys)
 * - ARIA labels for screen readers
 * - Integrates with useAudioManager hook
 * - Supports inline mode for header placement
 */

interface AudioControlsProps {
  inline?: boolean;  // Whether to render in inline mode (for header)
}

export const AudioControls: React.FC<AudioControlsProps> = ({ inline = false }) => {
  const { isMuted, toggleMute } = useAudioManager();

  /**
   * Handle keyboard events for accessibility
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMute();
    }
  };

  const buttonClasses = inline
    ? "p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors duration-200 flex items-center justify-center"
    : "audio-toggle-button";

  return (
    <div className="audio-controls" data-testid="audio-controls">
      <button
        onClick={toggleMute}
        onKeyDown={handleKeyDown}
        className={buttonClasses}
        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        aria-pressed={isMuted}
        title={isMuted ? 'Unmute audio' : 'Mute audio'}
        type="button"
      >
        {isMuted ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* Muted speaker icon */}
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* Unmuted speaker icon with sound waves */}
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>
    </div>
  );
};
