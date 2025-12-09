import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TickSoundPlayer } from './TickSoundPlayer';

/**
 * Unit Tests for TickSoundPlayer
 * 
 * Tests specific examples and edge cases for tick sound playback
 */
describe('TickSoundPlayer', () => {
  let mockAudio: {
    src: string;
    loop: boolean;
    volume: number;
    paused: boolean;
    currentTime: number;
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
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
        mockAudio = this;
      }
    };

    (global as { Audio: typeof Audio }).Audio = MockAudioClass as unknown as typeof Audio;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('start()', () => {
    it('should initialize and play audio with correct settings', () => {
      const tickPlayer = new TickSoundPlayer();
      tickPlayer.start();

      // Verify audio was created with correct path
      expect(mockAudio.src).toBe('/data/sfx/effects/tick.mp3');

      // Verify loop is enabled
      expect(mockAudio.loop).toBe(true);

      // Verify volume is set to 0.3
      expect(mockAudio.volume).toBe(0.3);

      // Verify play was called
      expect(mockAudio.play).toHaveBeenCalledOnce();
    });

    it('should handle play errors gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock play to reject
      const MockAudioClass = class MockAudio {
        src: string;
        loop: boolean = false;
        volume: number = 1;
        paused: boolean = true;
        currentTime: number = 0;
        play = vi.fn().mockRejectedValue(new Error('Play failed'));
        pause = vi.fn();

        constructor(src: string) {
          this.src = src;
        }
      };

      (global as { Audio: typeof Audio }).Audio = MockAudioClass as unknown as typeof Audio;

      const tickPlayer = new TickSoundPlayer();
      
      // Should not throw
      expect(() => tickPlayer.start()).not.toThrow();

      // Wait for promise rejection to be handled
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TickSoundPlayer] Failed to play tick sound:'),
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle audio initialization errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock Audio constructor to throw
      (global as { Audio: typeof Audio }).Audio = (() => {
        throw new Error('Audio initialization failed');
      }) as unknown as typeof Audio;

      const tickPlayer = new TickSoundPlayer();
      
      // Should not throw
      expect(() => tickPlayer.start()).not.toThrow();

      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TickSoundPlayer] Error initializing tick sound:'),
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('stop()', () => {
    it('should pause and reset audio', () => {
      const tickPlayer = new TickSoundPlayer();
      tickPlayer.start();

      // Verify audio is playing
      expect(mockAudio.paused).toBe(false);

      // Stop the audio
      tickPlayer.stop();

      // Verify pause was called
      expect(mockAudio.pause).toHaveBeenCalledOnce();

      // Verify currentTime was reset
      expect(mockAudio.currentTime).toBe(0);
    });

    it('should handle stop when audio is not playing', () => {
      const tickPlayer = new TickSoundPlayer();
      
      // Should not throw when stopping without starting
      expect(() => tickPlayer.stop()).not.toThrow();
    });

    it('should handle stop errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const tickPlayer = new TickSoundPlayer();
      tickPlayer.start();

      // Mock pause to throw
      mockAudio.pause = vi.fn().mockImplementation(() => {
        throw new Error('Pause failed');
      });

      // Should not throw
      expect(() => tickPlayer.stop()).not.toThrow();

      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TickSoundPlayer] Error stopping tick sound:'),
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });

    it('should clean up audio reference after stopping', () => {
      const tickPlayer = new TickSoundPlayer();
      tickPlayer.start();

      expect(tickPlayer.isPlaying()).toBe(true);

      tickPlayer.stop();

      expect(tickPlayer.isPlaying()).toBe(false);
    });
  });

  describe('isPlaying()', () => {
    it('should return false initially', () => {
      const tickPlayer = new TickSoundPlayer();
      expect(tickPlayer.isPlaying()).toBe(false);
    });

    it('should return true when playing', () => {
      const tickPlayer = new TickSoundPlayer();
      tickPlayer.start();
      expect(tickPlayer.isPlaying()).toBe(true);
    });

    it('should return false after stopping', () => {
      const tickPlayer = new TickSoundPlayer();
      tickPlayer.start();
      tickPlayer.stop();
      expect(tickPlayer.isPlaying()).toBe(false);
    });
  });

  describe('volume setting', () => {
    it('should set volume to 0.3 to not overpower other audio', () => {
      const tickPlayer = new TickSoundPlayer();
      tickPlayer.start();

      // Verify volume is set correctly
      expect(mockAudio.volume).toBe(0.3);
    });
  });
});
