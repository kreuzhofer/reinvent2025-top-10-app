import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AudioManager } from '../services/audio/AudioManager';

// Unmock AudioContext for this test file since we're testing it directly
vi.unmock('../context/AudioContext');

// Import after unmocking
import { AudioProvider, useAudioContext } from './AudioContext';

// Mock AudioManager
vi.mock('../services/audio/AudioManager', () => {
  const MockAudioManager = vi.fn(function(this: any) {
    this.initialize = vi.fn().mockResolvedValue(undefined);
    this.isMuted = vi.fn().mockReturnValue(false);
    this.setMuted = vi.fn();
    this.cleanup = vi.fn();
    this.playBackgroundMusic = vi.fn().mockResolvedValue(undefined);
    this.playSFX = vi.fn().mockResolvedValue(undefined);
    this.getCurrentBackgroundMusic = vi.fn().mockReturnValue(null);
  });
  
  return {
    AudioManager: MockAudioManager,
  };
});

// Test component that uses the audio context
const TestComponent = () => {
  const { audioManager, isInitialized, isMuted } = useAudioContext();
  return (
    <div>
      <div data-testid="audio-manager">{audioManager ? 'present' : 'null'}</div>
      <div data-testid="is-initialized">{isInitialized ? 'true' : 'false'}</div>
      <div data-testid="is-muted">{isMuted ? 'true' : 'false'}</div>
    </div>
  );
};

describe('AudioProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides audio manager instance to children', () => {
    render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    expect(screen.getByTestId('audio-manager')).toHaveTextContent('present');
  });

  it('initializes with isInitialized as false', () => {
    render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    expect(screen.getByTestId('is-initialized')).toHaveTextContent('false');
  });

  it('initializes audio on user click interaction', async () => {
    const mockInitialize = vi.fn().mockResolvedValue(undefined);
    
    const MockAudioManager = vi.fn(function(this: any) {
      this.initialize = mockInitialize;
      this.isMuted = vi.fn().mockReturnValue(false);
      this.setMuted = vi.fn();
      this.cleanup = vi.fn();
      this.getCurrentBackgroundMusic = vi.fn().mockReturnValue(null);
    });

    vi.mocked(AudioManager).mockImplementation(MockAudioManager as any);

    render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    // Simulate user click
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalled();
    });
  });

  it('provides mute state from audio manager', () => {
    const MockAudioManager = vi.fn(function(this: any) {
      this.initialize = vi.fn().mockResolvedValue(undefined);
      this.isMuted = vi.fn().mockReturnValue(true);
      this.setMuted = vi.fn();
      this.cleanup = vi.fn();
      this.getCurrentBackgroundMusic = vi.fn().mockReturnValue(null);
    });

    vi.mocked(AudioManager).mockImplementation(MockAudioManager as any);

    render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    expect(screen.getByTestId('is-muted')).toHaveTextContent('true');
  });

  it('throws error when useAudioContext is used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAudioContext must be used within an AudioProvider');

    consoleError.mockRestore();
  });

  it('cleans up audio manager on unmount', () => {
    const mockCleanup = vi.fn();
    
    const MockAudioManager = vi.fn(function(this: any) {
      this.initialize = vi.fn().mockResolvedValue(undefined);
      this.isMuted = vi.fn().mockReturnValue(false);
      this.setMuted = vi.fn();
      this.cleanup = mockCleanup;
      this.getCurrentBackgroundMusic = vi.fn().mockReturnValue(null);
    });

    vi.mocked(AudioManager).mockImplementation(MockAudioManager as any);

    const { unmount } = render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    unmount();

    expect(mockCleanup).toHaveBeenCalled();
  });
});
