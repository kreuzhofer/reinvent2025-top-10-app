import type { SFXPlayerOptions } from '../../types/audio.types';

/**
 * SFXPlayer manages sound effect playback using the Web Audio API.
 * Supports concurrent sound playback and audio buffer caching for performance.
 */
export class SFXPlayer {
  private audioContext: AudioContext;
  private audioBuffers: Map<string, AudioBuffer>;
  private activeSources: Set<AudioBufferSourceNode>;
  private options: SFXPlayerOptions;
  private gainNode: GainNode;

  constructor(audioContext: AudioContext, options: SFXPlayerOptions) {
    this.audioContext = audioContext;
    this.audioBuffers = new Map();
    this.activeSources = new Set();
    this.options = options;

    // Create a gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = this.options.volume;
  }

  /**
   * Preload an audio file and cache its buffer
   * @param filename - The audio filename (e.g., 'correct-answer.mp3')
   */
  async preload(filename: string): Promise<void> {
    try {
      // Check if already cached
      if (this.audioBuffers.has(filename)) {
        return;
      }

      const path = `/data/sfx/effects/${filename}`;
      const response = await fetch(path);
      
      if (!response.ok) {
        console.warn(`[SFXPlayer] Failed to load audio file: ${filename}`);
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.audioBuffers.set(filename, audioBuffer);
    } catch (error) {
      console.error(`[SFXPlayer] Error preloading audio file ${filename}:`, error);
    }
  }

  /**
   * Play a sound effect
   * @param filename - The audio filename (e.g., 'correct-answer.mp3')
   */
  async play(filename: string): Promise<void> {
    try {
      // Preload if not already cached
      if (!this.audioBuffers.has(filename)) {
        await this.preload(filename);
      }

      const audioBuffer = this.audioBuffers.get(filename);
      if (!audioBuffer) {
        console.warn(`[SFXPlayer] Audio buffer not available for: ${filename}`);
        return;
      }

      // Create a new source for this playback
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode);

      // Track active source
      this.activeSources.add(source);

      // Remove from active sources when playback ends
      source.onended = () => {
        this.activeSources.delete(source);
      };

      // Start playback
      source.start(0);

      // Enforce concurrent sound limit
      if (this.activeSources.size > this.options.maxConcurrentSounds) {
        // Stop the oldest source
        const oldestSource = this.activeSources.values().next().value;
        if (oldestSource) {
          try {
            oldestSource.stop();
          } catch (error) {
            // Source may have already stopped
          }
          this.activeSources.delete(oldestSource);
        }
      }
    } catch (error) {
      console.error(`[SFXPlayer] Error playing sound effect ${filename}:`, error);
    }
  }

  /**
   * Set the volume for all sound effects
   * @param volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.options.volume = Math.max(0, Math.min(1, volume));
    this.gainNode.gain.value = this.options.volume;
  }

  /**
   * Clean up all active sound sources
   */
  cleanup(): void {
    // Stop all active sources
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (error) {
        // Source may have already stopped
      }
    });
    this.activeSources.clear();
    this.audioBuffers.clear();
  }
}
