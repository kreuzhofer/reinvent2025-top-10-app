import '@testing-library/jest-dom';
import { vi } from 'vitest';

/**
 * Mock AudioContext for all tests
 * This prevents "AudioContext is not defined" errors in jsdom environment
 */
vi.mock('../context/AudioContext', async () => {
  const React = await import('react');
  
  // Mock AudioManager
  class MockAudioManager {
    private muted = false;
    private currentMusic: string | null = null;

    async initialize(): Promise<void> {
      // Mock initialization
    }

    setMuted(muted: boolean): void {
      this.muted = muted;
    }

    isMuted(): boolean {
      return this.muted;
    }

    async playBackgroundMusic(filename: string): Promise<void> {
      this.currentMusic = filename;
    }

    async stopBackgroundMusic(): Promise<void> {
      this.currentMusic = null;
    }

    getCurrentBackgroundMusic(): string | null {
      return this.currentMusic;
    }

    async playSFX(_filename: string): Promise<void> {
      // Mock SFX playback
    }

    cleanup(): void {
      // Mock cleanup
    }
  }

  // Mock AudioContext type
  interface MockAudioContextType {
    audioManager: MockAudioManager;
    isInitialized: boolean;
    isMuted: boolean;
    setMuted: (muted: boolean) => void;
  }

  const MockAudioContext = React.createContext<MockAudioContextType | undefined>(undefined);

  // Mock AudioProvider
  const MockAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [audioManager] = React.useState(() => new MockAudioManager());
    const [isMuted, setIsMutedState] = React.useState(false);

    const setMuted = React.useCallback((muted: boolean) => {
      audioManager.setMuted(muted);
      setIsMutedState(muted);
    }, [audioManager]);

    const value: MockAudioContextType = {
      audioManager: audioManager as any,
      isInitialized: true,
      isMuted,
      setMuted,
    };

    return React.createElement(
      MockAudioContext.Provider,
      { value },
      children
    );
  };

  // Mock useAudioContext hook
  const useAudioContext = () => {
    const context = React.useContext(MockAudioContext);
    if (context === undefined) {
      throw new Error('useAudioContext must be used within an AudioProvider');
    }
    return context;
  };

  return {
    AudioProvider: MockAudioProvider,
    useAudioContext,
  };
});

/**
 * Mock EmojiContext for all tests
 * This prevents emoji animation issues in test environment
 */
vi.mock('../context/EmojiContext', async () => {
  const React = await import('react');
  
  // Mock EmojiContext type
  interface MockEmojiContextType {
    showSuccessEmoji: () => void;
    showMissEmoji: () => void;
  }

  const MockEmojiContext = React.createContext<MockEmojiContextType | undefined>(undefined);

  // Mock EmojiProvider
  const MockEmojiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const showSuccessEmoji = React.useCallback(() => {
      // Mock success emoji - no-op in tests
    }, []);

    const showMissEmoji = React.useCallback(() => {
      // Mock miss emoji - no-op in tests
    }, []);

    const value: MockEmojiContextType = {
      showSuccessEmoji,
      showMissEmoji,
    };

    return React.createElement(
      MockEmojiContext.Provider,
      { value },
      children
    );
  };

  // Mock useEmojiContext hook
  const useEmojiContext = () => {
    const context = React.useContext(MockEmojiContext);
    if (context === undefined) {
      throw new Error('useEmojiContext must be used within an EmojiProvider');
    }
    return context;
  };

  return {
    EmojiProvider: MockEmojiProvider,
    useEmojiContext,
  };
});
