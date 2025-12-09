import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { TickSoundPlayer } from './TickSoundPlayer';

/**
 * Property-Based Tests for TickSoundPlayer
 * 
 * Feature: quiz-timing-scoring-improvements
 * Tests properties related to tick sound playback and cleanup
 */
describe('TickSoundPlayer Property-Based Tests', () => {
  let mockAudioInstances: Array<{
    src: string;
    loop: boolean;
    volume: number;
    paused: boolean;
    currentTime: number;
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
  }>;

  beforeEach(() => {
    mockAudioInstances = [];

    // Mock Audio constructor
    const MockAudioClass = class MockAudio {
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

      constructor(src: string) {
        this.src = src;
        mockAudioInstances.push(this);
      }
    };

    (global as { Audio: typeof Audio }).Audio = MockAudioClass as unknown as typeof Audio;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockAudioInstances = [];
  });

  /**
   * Property 8: Tick sound audio isolation
   * Feature: quiz-timing-scoring-improvements, Property 8: Tick sound audio isolation
   * Validates: Requirements 4.2, 4.3
   * 
   * For any time when the tick sound is playing, background music and other 
   * sound effects should continue playing unaffected
   */
  it('Property 8: Tick sound audio isolation - tick sound does not affect other audio', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // Number of other audio instances
        async (numOtherAudio) => {
          // Create other audio instances (simulating background music and SFX)
          const otherAudioInstances = Array.from({ length: numOtherAudio }, (_, i) => {
            const audio = new Audio(`/data/sfx/other/sound${i}.mp3`);
            audio.play();
            return audio;
          });

          // Verify other audio is playing
          otherAudioInstances.forEach(audio => {
            expect(audio.paused).toBe(false);
          });

          // Create and start tick sound player
          const tickPlayer = new TickSoundPlayer();
          tickPlayer.start();

          // Property: Other audio instances should still be playing (not paused)
          otherAudioInstances.forEach(audio => {
            expect(audio.paused).toBe(false);
          });

          // Property: Other audio instances should not have been stopped or reset
          otherAudioInstances.forEach(audio => {
            expect(audio.pause).not.toHaveBeenCalled();
          });

          tickPlayer.stop();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: Tick sound cleanup isolation
   * Feature: quiz-timing-scoring-improvements, Property 12: Tick sound cleanup isolation
   * Validates: Requirements 5.4, 5.5
   * 
   * For any tick sound stop event, other audio playback should continue unaffected
   */
  it('Property 12: Tick sound cleanup isolation - stopping tick does not affect other audio', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // Number of other audio instances
        async (numOtherAudio) => {
          // Create other audio instances (simulating background music and SFX)
          const otherAudioInstances = Array.from({ length: numOtherAudio }, (_, i) => {
            const audio = new Audio(`/data/sfx/other/sound${i}.mp3`);
            audio.play();
            return audio;
          });

          // Create and start tick sound player
          const tickPlayer = new TickSoundPlayer();
          tickPlayer.start();

          // Verify all audio is playing
          otherAudioInstances.forEach(audio => {
            expect(audio.paused).toBe(false);
          });

          // Stop tick sound
          tickPlayer.stop();

          // Property: Other audio instances should still be playing after tick stops
          otherAudioInstances.forEach(audio => {
            expect(audio.paused).toBe(false);
          });

          // Property: Other audio instances should not have been affected by tick cleanup
          otherAudioInstances.forEach(audio => {
            // The pause method should only have been called once (during initial play setup)
            // or not at all, but not as a result of tick cleanup
            const pauseCallCount = audio.pause.mock.calls.length;
            expect(pauseCallCount).toBe(0); // Should not be paused
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
