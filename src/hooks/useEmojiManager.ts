import { useEmojiContext } from '../context/EmojiContext';
import { useAudioContext } from '../context/AudioContext';
import { useCallback } from 'react';

/**
 * Return type for useEmojiManager hook
 */
export interface UseEmojiManagerReturn {
  showSuccessEmoji: () => void;
  showMissEmoji: () => void;
}

/**
 * Hook to access emoji manager functionality
 * Integrates with audio manager to play sound effects
 */
export function useEmojiManager(): UseEmojiManagerReturn {
  const emojiContext = useEmojiContext();
  const audioContext = useAudioContext();

  /**
   * Show success emoji with sound effect
   */
  const showSuccessEmoji = useCallback(() => {
    emojiContext.showSuccessEmoji();
    
    // Play emoji fly-in sound effect
    if (audioContext.audioManager && audioContext.isInitialized) {
      audioContext.audioManager.playSFX('emoji-fly.mp3').catch(() => {
        // Silently fail if audio doesn't play
      });
    }
  }, [emojiContext, audioContext]);

  /**
   * Show miss emoji with sound effect
   */
  const showMissEmoji = useCallback(() => {
    emojiContext.showMissEmoji();
    
    // Play emoji fly-in sound effect
    if (audioContext.audioManager && audioContext.isInitialized) {
      audioContext.audioManager.playSFX('emoji-fly.mp3').catch(() => {
        // Silently fail if audio doesn't play
      });
    }
  }, [emojiContext, audioContext]);

  return {
    showSuccessEmoji,
    showMissEmoji,
  };
}
