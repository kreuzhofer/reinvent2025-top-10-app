import React from 'react';
import { vi } from 'vitest';

/**
 * Mock AudioManager for testing
 * Provides all the methods that components expect without requiring browser APIs
 */
export class MockAudioManager {
  private muted = false;
  private currentMusic: string | null = null;

  async initialize(): Promise<void> {
    // Mock initialization - no-op in tests
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
    // Mock SFX playback - no-op in tests
  }

  cleanup(): void {
    // Mock cleanup - no-op in tests
  }
}

/**
 * Mock AudioContext for testing
 */
interface MockAudioContextType {
  audioManager: MockAudioManager;
  isInitialized: boolean;
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
}

const MockAudioContext = React.createContext<MockAudioContextType | undefined>(undefined);

/**
 * Mock AudioProvider for testing
 * Provides a mock audio context that doesn't require browser APIs
 */
export const MockAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioManager] = React.useState(() => new MockAudioManager());
  const [isMuted, setIsMutedState] = React.useState(false);

  const setMuted = React.useCallback((muted: boolean) => {
    audioManager.setMuted(muted);
    setIsMutedState(muted);
  }, [audioManager]);

  const value: MockAudioContextType = {
    audioManager: audioManager as any, // Cast to match AudioManager type
    isInitialized: true,
    isMuted,
    setMuted,
  };

  return (
    <MockAudioContext.Provider value={value}>
      {children}
    </MockAudioContext.Provider>
  );
};

/**
 * Mock useAudioContext hook for testing
 */
export const useMockAudioContext = () => {
  const context = React.useContext(MockAudioContext);
  if (context === undefined) {
    throw new Error('useMockAudioContext must be used within a MockAudioProvider');
  }
  return context;
};

/**
 * Helper to render components with AudioProvider in tests
 */
export const renderWithAudio = (ui: React.ReactElement) => {
  return {
    ...ui,
    wrapper: MockAudioProvider,
  };
};

/**
 * Mock the AudioContext module for tests
 * Call this in your test setup to replace the real AudioContext with the mock
 */
export const mockAudioContext = () => {
  vi.mock('../context/AudioContext', () => ({
    AudioProvider: MockAudioProvider,
    useAudioContext: useMockAudioContext,
  }));
};
