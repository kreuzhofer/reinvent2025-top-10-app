import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { SFXPlayer } from './SFXPlayer';

/**
 * Property-Based Tests for SFXPlayer
 * 
 * Feature: quiz-engagement-enhancements, Property 22: Concurrent sound effect playback
 * Validates: Requirements 4.5
 * 
 * Property: For any set of simultaneously triggered sound effects, all sound effects 
 * should be played concurrently without blocking each other.
 */
describe('SFXPlayer Property-Based Tests', () => {
  let audioContext: AudioContext;
  let mockAudioBuffer: AudioBuffer;
  let mockGainNode: GainNode;
  let mockBufferSources: AudioBufferSourceNode[];

  beforeEach(() => {
    mockBufferSources = [];

    // Create mock AudioBuffer
    mockAudioBuffer = {
      duration: 1,
      length: 44100,
      numberOfChannels: 2,
      sampleRate: 44100,
      getChannelData: vi.fn(),
      copyFromChannel: vi.fn(),
      copyToChannel: vi.fn(),
    } as unknown as AudioBuffer;

    // Create mock GainNode
    mockGainNode = {
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as GainNode;

    // Create mock AudioBufferSourceNode factory
    const createMockSource = () => {
      const source = {
        buffer: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null,
      } as unknown as AudioBufferSourceNode;
      mockBufferSources.push(source);
      return source;
    };

    // Create mock AudioContext
    audioContext = {
      destination: {} as AudioDestinationNode,
      createGain: vi.fn().mockReturnValue(mockGainNode),
      createBufferSource: vi.fn().mockImplementation(createMockSource),
      decodeAudioData: vi.fn().mockResolvedValue(mockAudioBuffer),
      close: vi.fn(),
    } as unknown as AudioContext;

    // Mock fetch to return audio data
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockBufferSources = [];
  });

  it('Property 22: Concurrent sound effect playback - multiple sounds can play simultaneously', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a random number of concurrent sounds (2-5)
        fc.integer({ min: 2, max: 5 }),
        // Generate random volume (0.0 to 1.0)
        fc.double({ min: 0, max: 1 }),
        // Generate random max concurrent sounds limit (3-10)
        fc.integer({ min: 3, max: 10 }),
        async (numSounds, volume, maxConcurrent) => {
          // Reset mock buffer sources for this iteration
          mockBufferSources.length = 0;

          const sfxPlayer = new SFXPlayer(audioContext, {
            volume,
            maxConcurrentSounds: maxConcurrent,
          });

          // Play multiple sounds concurrently
          const playPromises = [];
          for (let i = 0; i < numSounds; i++) {
            playPromises.push(sfxPlayer.play(`sound-${i}.mp3`));
          }

          // Wait for all sounds to be initiated
          await Promise.all(playPromises);

          // Property: Multiple sources should be created (one per sound)
          expect(mockBufferSources.length).toBe(numSounds);

          // Property: Each source should have the audio buffer set
          mockBufferSources.forEach(source => {
            expect(source.buffer).toBe(mockAudioBuffer);
          });

          // Property: Each source should be connected to the gain node
          mockBufferSources.forEach(source => {
            expect(source.connect).toHaveBeenCalledWith(mockGainNode);
          });

          // Property: Each source should have start called
          mockBufferSources.forEach(source => {
            expect(source.start).toHaveBeenCalledWith(0);
          });

          // Cleanup
          sfxPlayer.cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 22: Concurrent sound effect playback - sounds do not block each other', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }),
        fc.double({ min: 0, max: 1 }),
        async (numSounds, volume) => {
          // Reset mock buffer sources for this iteration
          mockBufferSources.length = 0;

          const sfxPlayer = new SFXPlayer(audioContext, {
            volume,
            maxConcurrentSounds: 10, // High limit to ensure no blocking
          });

          const startTimes: number[] = [];
          
          // Override the mock to track start times
          const createMockSourceWithTiming = () => {
            const source = {
              buffer: null,
              connect: vi.fn(),
              disconnect: vi.fn(),
              start: vi.fn().mockImplementation(() => {
                startTimes.push(Date.now());
              }),
              stop: vi.fn(),
              onended: null,
            } as unknown as AudioBufferSourceNode;
            mockBufferSources.push(source);
            return source;
          };

          audioContext.createBufferSource = vi.fn().mockImplementation(createMockSourceWithTiming);

          // Play multiple sounds
          const playPromises = [];
          for (let i = 0; i < numSounds; i++) {
            playPromises.push(sfxPlayer.play(`sound-${i}.mp3`));
          }

          await Promise.all(playPromises);

          // Property: All sounds should start within a short time window (non-blocking)
          // If sounds were blocking, there would be significant delays between start times
          if (startTimes.length > 1) {
            const timeSpan = Math.max(...startTimes) - Math.min(...startTimes);
            // All sounds should start within 100ms of each other (generous for async operations)
            expect(timeSpan).toBeLessThan(100);
          }

          sfxPlayer.cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 22: Concurrent sound effect playback - volume control applies to all sounds', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0, max: 1 }),
        fc.integer({ min: 2, max: 5 }),
        async (volume, numSounds) => {
          // Reset mock buffer sources for this iteration
          mockBufferSources.length = 0;

          const sfxPlayer = new SFXPlayer(audioContext, {
            volume,
            maxConcurrentSounds: 10,
          });

          // Property: Initial volume should be set on the gain node
          expect(mockGainNode.gain.value).toBe(volume);

          // Play multiple sounds
          const playPromises = [];
          for (let i = 0; i < numSounds; i++) {
            playPromises.push(sfxPlayer.play(`sound-${i}.mp3`));
          }

          await Promise.all(playPromises);

          // Property: All sources should be connected to the same gain node
          mockBufferSources.forEach(source => {
            expect(source.connect).toHaveBeenCalledWith(mockGainNode);
          });

          // Property: Changing volume should update the gain node
          const newVolume = 0.5;
          sfxPlayer.setVolume(newVolume);
          expect(mockGainNode.gain.value).toBe(newVolume);

          // Property: Volume should be clamped between 0 and 1
          sfxPlayer.setVolume(1.5);
          expect(mockGainNode.gain.value).toBe(1);
          
          sfxPlayer.setVolume(-0.5);
          expect(mockGainNode.gain.value).toBe(0);

          sfxPlayer.cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
