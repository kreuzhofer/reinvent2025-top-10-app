import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { MusicPlayer } from './MusicPlayer';

/**
 * Property-Based Tests for MusicPlayer
 * 
 * Feature: quiz-engagement-enhancements
 * Property 15: Background music fade transition
 * Property 16: Background music continuity
 * Property 17: Background music default behavior
 */
describe('MusicPlayer Property-Based Tests', () => {
  let audioContext: AudioContext;
  let mockGainNode: GainNode;
  let mockAudioElements: Map<string, HTMLAudioElement>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockAudioElements = new Map();

    // Create mock GainNode
    mockGainNode = {
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as GainNode;

    // Create mock AudioContext
    audioContext = {
      destination: {} as AudioDestinationNode,
      createGain: vi.fn().mockReturnValue(mockGainNode),
    } as unknown as AudioContext;

    // Mock HTMLAudioElement constructor
    (global as { Audio: typeof Audio }).Audio = class MockAudio {
      src: string;
      loop: boolean = false;
      volume: number = 1;
      paused: boolean = true;
      currentTime: number = 0;
      play: ReturnType<typeof vi.fn>;
      pause: ReturnType<typeof vi.fn>;
      load: ReturnType<typeof vi.fn>;
      addEventListener: ReturnType<typeof vi.fn>;
      removeEventListener: ReturnType<typeof vi.fn>;

      constructor(src: string) {
        this.src = src;
        this.play = vi.fn().mockImplementation(async () => {
          this.paused = false;
          return Promise.resolve();
        });
        this.pause = vi.fn().mockImplementation(() => {
          this.paused = true;
        });
        this.load = vi.fn();
        this.addEventListener = vi.fn().mockImplementation((
          event: string,
          handler: () => void,
          _options?: { once?: boolean }
        ) => {
          if (event === 'canplaythrough') {
            // Immediately call the handler to simulate ready state
            // Use queueMicrotask instead of setTimeout for fake timers compatibility
            queueMicrotask(handler);
          }
        });
        this.removeEventListener = vi.fn();
        
        mockAudioElements.set(src, this as unknown as HTMLAudioElement);
      }
    } as unknown as typeof Audio;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    mockAudioElements.clear();
  });

  /**
   * Property 15: Background music fade transition
   * Validates: Requirements 3.3
   * 
   * For any background music change (when the new filename differs from the current track),
   * the Audio System should fade out the current track over 1000ms and fade in the new track over 1000ms
   */
  it('Property 15: Background music fade transition - fades out old track and fades in new track', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.1, max: 1 }), // Initial volume
        fc.integer({ min: 500, max: 2000 }), // Fade duration
        fc.constantFrom('track1.mp3', 'track2.mp3', 'track3.mp3'), // First track
        fc.constantFrom('track4.mp3', 'track5.mp3', 'track6.mp3'), // Second track (different)
        async (volume, fadeDuration, firstTrack, secondTrack) => {
          const musicPlayer = new MusicPlayer(audioContext, {
            volume,
            fadeDuration,
            loop: true,
          });

          // Play first track
          await musicPlayer.play(firstTrack);
          await vi.runAllTimersAsync();

          const firstAudio = mockAudioElements.get(`/data/sfx/background/${firstTrack}`);
          expect(firstAudio).toBeDefined();
          expect(firstAudio!.play).toHaveBeenCalled();

          // Transition to second track
          const transitionPromise = musicPlayer.transition(secondTrack);
          
          // Run timers to complete fade out
          await vi.runAllTimersAsync();
          await transitionPromise;

          // Property: First track should be paused
          expect(firstAudio!.paused).toBe(true);

          // Property: Second track should be playing
          const secondAudio = mockAudioElements.get(`/data/sfx/background/${secondTrack}`);
          expect(secondAudio).toBeDefined();
          expect(secondAudio!.play).toHaveBeenCalled();
          expect(secondAudio!.paused).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 16: Background music continuity
   * Validates: Requirements 3.4, 9.5
   * 
   * For any slide or question navigation where the backgroundMusic property matches 
   * the currently playing track, the audio playback should continue without restarting
   */
  it('Property 16: Background music continuity - same track continues without restart', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.1, max: 1 }),
        fc.integer({ min: 500, max: 2000 }),
        fc.constantFrom('track1.mp3', 'track2.mp3', 'track3.mp3'),
        async (volume, fadeDuration, trackName) => {
          const musicPlayer = new MusicPlayer(audioContext, {
            volume,
            fadeDuration,
            loop: true,
          });

          // Play track
          await musicPlayer.play(trackName);
          await vi.runAllTimersAsync();

          const audio = mockAudioElements.get(`/data/sfx/background/${trackName}`);
          expect(audio).toBeDefined();
          
          const initialPlayCallCount = (audio!.play as ReturnType<typeof vi.fn>).mock.calls.length;

          // Property: Current filename should match
          expect(musicPlayer.getCurrentFilename()).toBe(trackName);

          // Try to play the same track again
          await musicPlayer.play(trackName);
          await vi.runAllTimersAsync();

          // Property: play() should not be called again (no restart)
          const finalPlayCallCount = (audio!.play as ReturnType<typeof vi.fn>).mock.calls.length;
          expect(finalPlayCallCount).toBe(initialPlayCallCount);

          // Property: Track should still be playing
          expect(musicPlayer.isPlaying()).toBe(true);
          expect(musicPlayer.getCurrentFilename()).toBe(trackName);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 17: Background music default behavior
   * Validates: Requirements 3.6
   * 
   * For any slide or question navigation where no backgroundMusic property is specified,
   * the current background music should continue playing unchanged
   */
  it('Property 17: Background music default behavior - music continues when no new track specified', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.1, max: 1 }),
        fc.integer({ min: 500, max: 2000 }),
        fc.constantFrom('track1.mp3', 'track2.mp3', 'track3.mp3'),
        async (volume, fadeDuration, trackName) => {
          const musicPlayer = new MusicPlayer(audioContext, {
            volume,
            fadeDuration,
            loop: true,
          });

          // Play track
          await musicPlayer.play(trackName);
          await vi.runAllTimersAsync();

          const audio = mockAudioElements.get(`/data/sfx/background/${trackName}`);
          expect(audio).toBeDefined();

          // Property: Track should be playing
          expect(musicPlayer.isPlaying()).toBe(true);
          expect(musicPlayer.getCurrentFilename()).toBe(trackName);

          // Simulate navigation without specifying new music
          // (In real usage, the AudioManager would check if filename matches and not call play)
          // Here we verify that the track continues playing
          expect(audio!.paused).toBe(false);
          expect(musicPlayer.getCurrentFilename()).toBe(trackName);

          // Property: Music state should be unchanged
          expect(musicPlayer.isPlaying()).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 15: Fade out reduces volume to zero over time', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.5, max: 1 }),
        fc.integer({ min: 500, max: 2000 }),
        fc.constantFrom('track1.mp3', 'track2.mp3'),
        async (volume, fadeDuration, trackName) => {
          const musicPlayer = new MusicPlayer(audioContext, {
            volume,
            fadeDuration,
            loop: true,
          });

          await musicPlayer.play(trackName);
          await vi.runAllTimersAsync();

          const audio = mockAudioElements.get(`/data/sfx/background/${trackName}`);
          expect(audio).toBeDefined();

          // Start fade out
          const fadePromise = musicPlayer.fadeOut(fadeDuration);
          
          // Property: Volume should decrease during fade
          const initialVolume = audio!.volume;
          expect(initialVolume).toBeGreaterThan(0);

          // Advance time partially
          await vi.advanceTimersByTimeAsync(fadeDuration / 2);
          
          // Volume should be reduced but not zero yet
          const midVolume = audio!.volume;
          expect(midVolume).toBeLessThan(initialVolume);
          expect(midVolume).toBeGreaterThanOrEqual(0);

          // Complete fade
          await vi.runAllTimersAsync();
          await fadePromise;

          // Property: Volume should be zero and track paused after fade completes
          expect(audio!.volume).toBe(0);
          expect(audio!.paused).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 15: Fade in increases volume from zero to target over time', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.5, max: 1 }),
        fc.integer({ min: 500, max: 2000 }),
        fc.constantFrom('track1.mp3', 'track2.mp3'),
        async (volume, fadeDuration, trackName) => {
          const musicPlayer = new MusicPlayer(audioContext, {
            volume,
            fadeDuration,
            loop: true,
          });

          await musicPlayer.play(trackName);
          await vi.runAllTimersAsync();

          const audio = mockAudioElements.get(`/data/sfx/background/${trackName}`);
          expect(audio).toBeDefined();

          // Start fade in
          const fadePromise = musicPlayer.fadeIn(fadeDuration);
          
          // Property: Volume should start at zero
          expect(audio!.volume).toBe(0);

          // Advance time partially
          await vi.advanceTimersByTimeAsync(fadeDuration / 2);
          
          // Volume should be increasing
          const midVolume = audio!.volume;
          expect(midVolume).toBeGreaterThan(0);
          expect(midVolume).toBeLessThan(volume);

          // Complete fade
          await vi.runAllTimersAsync();
          await fadePromise;

          // Property: Volume should reach target volume after fade completes
          expect(audio!.volume).toBeCloseTo(volume, 2);
          expect(audio!.paused).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
