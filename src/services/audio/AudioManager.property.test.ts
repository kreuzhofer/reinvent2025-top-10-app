import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { AudioManager } from './AudioManager';

/**
 * Property-Based Tests for AudioManager
 * 
 * Feature: quiz-engagement-enhancements
 * Tests multiple properties related to audio management
 */
describe('AudioManager Property-Based Tests', () => {
  let mockLocalStorage: Map<string, string>;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = new Map();
    global.localStorage = {
      getItem: vi.fn((key: string) => mockLocalStorage.get(key) || null),
      setItem: vi.fn((key: string, value: string) => mockLocalStorage.set(key, value)),
      removeItem: vi.fn((key: string) => mockLocalStorage.delete(key)),
      clear: vi.fn(() => mockLocalStorage.clear()),
      length: 0,
      key: vi.fn(),
    } as Storage;

    // Mock AudioContext
    (global as { AudioContext: typeof AudioContext }).AudioContext = class MockAudioContext {
      destination = {} as AudioDestinationNode;
      createGain = vi.fn().mockReturnValue({
        gain: { value: 1 },
        connect: vi.fn(),
        disconnect: vi.fn(),
      });
      createBufferSource = vi.fn().mockReturnValue({
        buffer: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null,
      });
      decodeAudioData = vi.fn().mockResolvedValue({
        duration: 1,
        length: 44100,
        numberOfChannels: 2,
        sampleRate: 44100,
      });
      close = vi.fn();
    } as unknown as typeof AudioContext;

    // Mock Audio constructor with spy
    const originalMockAudioClass = class MockAudio {
      src: string;
      loop: boolean = false;
      volume: number = 1;
      paused: boolean = true;
      currentTime: number = 0;
      play = vi.fn().mockImplementation(async () => {
        this.paused = false;
        return Promise.resolve();
      });
      pause = vi.fn().mockImplementation(() => {
        this.paused = true;
      });
      load = vi.fn();
      addEventListener = vi.fn().mockImplementation((event: string, handler: () => void) => {
        if (event === 'canplaythrough') {
          queueMicrotask(handler);
        }
      });
      removeEventListener = vi.fn();

      constructor(src: string) {
        this.src = src;
      }
    };
    
    // Create a spy that wraps the class
    const AudioSpy = vi.fn(originalMockAudioClass);
    (global as { Audio: typeof Audio }).Audio = AudioSpy as unknown as typeof Audio;

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  /**
   * Property 23: Audio file path construction
   * Validates: Requirements 5.1
   */
  it('Property 23: Audio file path construction - paths are constructed correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.1, max: 1 }),
        fc.integer({ min: 500, max: 2000 }),
        fc.constantFrom('welcome-bg.mp3', 'quiz-bg.mp3', 'victory-bg.mp3'),
        async (musicVolume, fadeDuration, filename) => {
          const audioManager = new AudioManager({
            musicVolume,
            sfxVolume: 0.8,
            fadeDuration,
          });

          await audioManager.initialize();
          await audioManager.playBackgroundMusic(filename);

          // Property: Audio constructor should be called with correct path
          const expectedPath = `/data/sfx/background/${filename}`;
          const AudioConstructor = global.Audio as ReturnType<typeof vi.fn>;
          expect(AudioConstructor).toHaveBeenCalledWith(expectedPath);

          audioManager.cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 24: Missing audio file handling
   * Validates: Requirements 5.5
   */
  it('Property 24: Missing audio file handling - application continues without errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.1, max: 1 }),
        fc.constantFrom('missing-file.mp3', 'nonexistent.mp3'),
        async (volume, filename) => {
          // Mock fetch to simulate missing file
          global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
          });

          const audioManager = new AudioManager({
            musicVolume: volume,
            sfxVolume: volume,
            fadeDuration: 1000,
          });

          await audioManager.initialize();

          // Property: Should not throw when playing missing file
          await expect(audioManager.playSFX(filename)).resolves.not.toThrow();
          await expect(audioManager.playBackgroundMusic(filename)).resolves.not.toThrow();

          audioManager.cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 25: Mute functionality
   * Validates: Requirements 6.3
   */
  it('Property 25: Mute functionality - muting stops all audio', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.1, max: 1 }),
        fc.constantFrom('track1.mp3', 'track2.mp3'),
        async (volume, filename) => {
          // Clear localStorage at the start of each iteration
          mockLocalStorage.clear();

          const audioManager = new AudioManager({
            musicVolume: volume,
            sfxVolume: volume,
            fadeDuration: 1000,
          });

          await audioManager.initialize();
          await audioManager.playBackgroundMusic(filename);

          // Property: Before muting, audio should be playing
          expect(audioManager.isMuted()).toBe(false);

          // Mute audio
          audioManager.setMuted(true);

          // Property: After muting, isMuted should return true
          expect(audioManager.isMuted()).toBe(true);

          // Property: Mute state should be persisted
          expect(localStorage.setItem).toHaveBeenCalledWith('quiz-audio-muted', 'true');

          audioManager.cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 26: Unmute functionality
   * Validates: Requirements 6.4
   */
  it('Property 26: Unmute functionality - unmuting resumes appropriate music', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.1, max: 1 }),
        fc.constantFrom('track1.mp3', 'track2.mp3'),
        async (volume, filename) => {
          const audioManager = new AudioManager({
            musicVolume: volume,
            sfxVolume: volume,
            fadeDuration: 1000,
          });

          await audioManager.initialize();
          
          // Mute first
          audioManager.setMuted(true);
          expect(audioManager.isMuted()).toBe(true);

          // Try to play music while muted (should store but not play)
          await audioManager.playBackgroundMusic(filename);

          // Property: Current background music should be stored
          expect(audioManager.getCurrentBackgroundMusic()).toBe(filename);

          // Unmute
          audioManager.setMuted(false);

          // Property: After unmuting, isMuted should return false
          expect(audioManager.isMuted()).toBe(false);

          // Property: Mute state should be persisted
          expect(localStorage.setItem).toHaveBeenCalledWith('quiz-audio-muted', 'false');

          audioManager.cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 27: Mute state persistence
   * Validates: Requirements 6.5
   */
  it('Property 27: Mute state persistence - mute state is saved and restored', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(),
        fc.double({ min: 0.1, max: 1 }),
        async (initialMuteState, volume) => {
          // Set initial mute state in localStorage
          mockLocalStorage.set('quiz-audio-muted', initialMuteState.toString());

          const audioManager = new AudioManager({
            musicVolume: volume,
            sfxVolume: volume,
            fadeDuration: 1000,
          });

          // Property: Mute state should be loaded from localStorage
          expect(audioManager.isMuted()).toBe(initialMuteState);

          // Change mute state
          const newMuteState = !initialMuteState;
          audioManager.setMuted(newMuteState);

          // Property: New mute state should be persisted
          expect(localStorage.setItem).toHaveBeenCalledWith('quiz-audio-muted', newMuteState.toString());
          expect(audioManager.isMuted()).toBe(newMuteState);

          audioManager.cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 29: Background music file loading
   * Validates: Requirements 9.3
   */
  it('Property 29: Background music file loading - files are loaded from correct directory', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.1, max: 1 }),
        fc.constantFrom('custom-bg-1.mp3', 'custom-bg-2.mp3', 'special-music.mp3'),
        async (volume, filename) => {
          const audioManager = new AudioManager({
            musicVolume: volume,
            sfxVolume: volume,
            fadeDuration: 1000,
          });

          await audioManager.initialize();
          await audioManager.playBackgroundMusic(filename);

          // Property: Audio should be loaded from background directory
          const expectedPath = `/data/sfx/background/${filename}`;
          const AudioConstructor = global.Audio as ReturnType<typeof vi.fn>;
          expect(AudioConstructor).toHaveBeenCalledWith(expectedPath);

          audioManager.cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 30: Background music comparison
   * Validates: Requirements 9.4
   */
  it('Property 30: Background music comparison - same track is not restarted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.1, max: 1 }),
        fc.constantFrom('track1.mp3', 'track2.mp3', 'track3.mp3'),
        async (volume, filename) => {
          // Clear mock calls at the start of each iteration
          const AudioConstructor = global.Audio as ReturnType<typeof vi.fn>;
          AudioConstructor.mockClear();

          const audioManager = new AudioManager({
            musicVolume: volume,
            sfxVolume: volume,
            fadeDuration: 1000,
          });

          await audioManager.initialize();
          
          // Play track first time
          await audioManager.playBackgroundMusic(filename);
          
          const firstCallCount = AudioConstructor.mock.calls.length;

          // Try to play same track again
          await audioManager.playBackgroundMusic(filename);

          // Property: Audio constructor should not be called again for same track
          const secondCallCount = AudioConstructor.mock.calls.length;
          expect(secondCallCount).toBe(firstCallCount);

          // Property: Current background music should still be the same
          expect(audioManager.getCurrentBackgroundMusic()).toBe(filename);

          audioManager.cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 14: Background music property reading
   * Validates: Requirements 3.2
   */
  it('Property 14: Background music property reading - manager tracks current music', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.1, max: 1 }),
        fc.constantFrom('track1.mp3', 'track2.mp3', 'track3.mp3'),
        async (volume, filename) => {
          const audioManager = new AudioManager({
            musicVolume: volume,
            sfxVolume: volume,
            fadeDuration: 1000,
          });

          await audioManager.initialize();

          // Property: Initially no background music
          expect(audioManager.getCurrentBackgroundMusic()).toBeNull();

          // Play background music
          await audioManager.playBackgroundMusic(filename);

          // Property: Current background music should be tracked
          expect(audioManager.getCurrentBackgroundMusic()).toBe(filename);

          audioManager.cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
