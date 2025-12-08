import { useCallback } from 'react';
import { useAudioContext } from '../context/AudioContext';
import type { AudioManager } from '../services/audio/AudioManager';

/**
 * Return type for useAudioManager hook
 */
export interface UseAudioManagerReturn {
  audioManager: AudioManager | null;
  isInitialized: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  playBackgroundMusic: (filename: string) => Promise<void>;
  playSFX: (filename: string) => Promise<void>;
}

/**
 * Custom hook for accessing the audio manager in React components.
 * Provides convenient methods for playing background music and sound effects,
 * as well as managing mute state.
 * 
 * @returns Audio manager interface with playback and mute controls
 * 
 * @example
 * ```tsx
 * const { playBackgroundMusic, playSFX, isMuted, toggleMute } = useAudioManager();
 * 
 * // Play background music
 * await playBackgroundMusic('welcome-bg.mp3');
 * 
 * // Play sound effect
 * await playSFX('correct-answer.mp3');
 * 
 * // Toggle mute
 * toggleMute();
 * ```
 */
export function useAudioManager(): UseAudioManagerReturn {
  const { audioManager, isInitialized, isMuted, setMuted } = useAudioContext();

  /**
   * Toggle mute state
   */
  const toggleMute = useCallback(() => {
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  /**
   * Play background music with fade transitions
   * @param filename - The music filename (e.g., 'welcome-bg.mp3')
   */
  const playBackgroundMusic = useCallback(async (filename: string) => {
    if (audioManager) {
      await audioManager.playBackgroundMusic(filename);
    }
  }, [audioManager]);

  /**
   * Play a sound effect
   * @param filename - The sound effect filename (e.g., 'correct-answer.mp3')
   */
  const playSFX = useCallback(async (filename: string) => {
    if (audioManager) {
      await audioManager.playSFX(filename);
    }
  }, [audioManager]);

  return {
    audioManager,
    isInitialized,
    isMuted,
    toggleMute,
    playBackgroundMusic,
    playSFX,
  };
}
