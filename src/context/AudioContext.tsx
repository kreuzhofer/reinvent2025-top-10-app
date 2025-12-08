import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AudioManager } from '../services/audio/AudioManager';

/**
 * Context type for audio management
 */
interface AudioContextType {
  audioManager: AudioManager | null;
  isInitialized: boolean;
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
}

/**
 * Audio context for providing audio manager to the application
 */
const AudioContext = createContext<AudioContextType | undefined>(undefined);

/**
 * Props for AudioProvider component
 */
interface AudioProviderProps {
  children: React.ReactNode;
}

/**
 * AudioProvider component that manages the AudioManager instance
 * and provides it to the application through context.
 * 
 * Handles audio context initialization on user interaction due to
 * browser autoplay policies.
 */
export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [audioManager] = useState<AudioManager>(() => {
    // Create AudioManager instance with default options
    return new AudioManager({
      musicVolume: 0.5,
      sfxVolume: 0.7,
      fadeDuration: 1000,
    });
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [isMuted, setIsMutedState] = useState(() => audioManager.isMuted());

  /**
   * Initialize audio context on first user interaction
   */
  const initializeAudio = useCallback(async () => {
    if (!isInitialized) {
      await audioManager.initialize();
      setIsInitialized(true);
      
      // After initialization, check if there's pending background music to play
      const pendingMusic = audioManager.getCurrentBackgroundMusic();
      if (pendingMusic && !audioManager.isMuted()) {
        await audioManager.playBackgroundMusic(pendingMusic);
      }
    }
  }, [audioManager, isInitialized]);

  /**
   * Set mute state
   */
  const setMuted = useCallback((muted: boolean) => {
    audioManager.setMuted(muted);
    setIsMutedState(muted);
  }, [audioManager]);

  /**
   * Set up event listeners for user interaction to initialize audio
   */
  useEffect(() => {
    const handleUserInteraction = () => {
      initializeAudio();
    };

    // Listen for various user interaction events
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [initializeAudio]);

  /**
   * Clean up audio resources on unmount
   */
  useEffect(() => {
    return () => {
      audioManager.cleanup();
    };
  }, [audioManager]);

  const value: AudioContextType = {
    audioManager,
    isInitialized,
    isMuted,
    setMuted,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

/**
 * Hook to access the audio context
 * @throws Error if used outside of AudioProvider
 */
export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};
