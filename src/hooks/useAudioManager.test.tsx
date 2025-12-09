import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';

// Unmock AudioContext for this test file since we need the real implementation
vi.unmock('../context/AudioContext');

// Import after unmocking
import { useAudioManager } from './useAudioManager';
import { AudioProvider } from '../context/AudioContext';

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

describe('useAudioManager', () => {
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

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AudioProvider>{children}</AudioProvider>
  );

  it('returns audio manager instance', () => {
    const { result } = renderHook(() => useAudioManager(), { wrapper });

    expect(result.current.audioManager).toBeTruthy();
  });

  it('returns isInitialized state', () => {
    const { result } = renderHook(() => useAudioManager(), { wrapper });

    expect(typeof result.current.isInitialized).toBe('boolean');
  });

  it('returns isMuted state', () => {
    const { result } = renderHook(() => useAudioManager(), { wrapper });

    expect(typeof result.current.isMuted).toBe('boolean');
  });

  it('provides toggleMute function', () => {
    const { result } = renderHook(() => useAudioManager(), { wrapper });

    expect(typeof result.current.toggleMute).toBe('function');
  });

  it('toggles mute state when toggleMute is called', () => {
    const { result } = renderHook(() => useAudioManager(), { wrapper });

    const initialMuteState = result.current.isMuted;

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(!initialMuteState);
  });

  it('provides playBackgroundMusic function', () => {
    const { result } = renderHook(() => useAudioManager(), { wrapper });

    expect(typeof result.current.playBackgroundMusic).toBe('function');
  });

  it('calls audioManager.playBackgroundMusic when playBackgroundMusic is called', async () => {
    const { result } = renderHook(() => useAudioManager(), { wrapper });

    await act(async () => {
      await result.current.playBackgroundMusic('test-music.mp3');
    });

    expect(result.current.audioManager?.playBackgroundMusic).toHaveBeenCalledWith('test-music.mp3');
  });

  it('provides playSFX function', () => {
    const { result } = renderHook(() => useAudioManager(), { wrapper });

    expect(typeof result.current.playSFX).toBe('function');
  });

  it('calls audioManager.playSFX when playSFX is called', async () => {
    const { result } = renderHook(() => useAudioManager(), { wrapper });

    await act(async () => {
      await result.current.playSFX('test-sfx.mp3');
    });

    expect(result.current.audioManager?.playSFX).toHaveBeenCalledWith('test-sfx.mp3');
  });
});
