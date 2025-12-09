import type { MusicPlayerOptions } from '../../types/audio.types';

/**
 * MusicPlayer manages background music playback using HTML5 Audio.
 * Supports fade in/out transitions and track switching.
 */
export class MusicPlayer {
  private audioContext: AudioContext;
  private currentTrack: HTMLAudioElement | null;
  private currentSource: MediaElementAudioSourceNode | null;
  private gainNode: GainNode;
  private options: MusicPlayerOptions;
  private currentFilename: string | null;
  private fadeTimeoutId: number | null;

  constructor(audioContext: AudioContext, options: MusicPlayerOptions) {
    this.audioContext = audioContext;
    this.currentTrack = null;
    this.currentSource = null;
    this.currentFilename = null;
    this.fadeTimeoutId = null;
    this.options = options;

    // Create a gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = this.options.volume;
  }

  /**
   * Play a music track
   * @param filename - The music filename (e.g., 'welcome-bg.mp3')
   */
  async play(filename: string): Promise<void> {
    try {
      // If already playing this track, do nothing
      if (this.currentFilename === filename && this.currentTrack && !this.currentTrack.paused) {
        return;
      }

      const path = `/data/sfx/background/${filename}`;
      
      // Create new audio element
      const audio = new Audio(path);
      audio.loop = this.options.loop;
      // Don't set volume on the audio element - use Web Audio API gain node instead
      // This is important for iOS compatibility where HTMLAudioElement.volume is ignored

      // Wait for audio to be ready
      await new Promise<void>((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', (e) => {
          console.warn(`[MusicPlayer] Failed to load audio file: ${filename}`, e);
          reject(e);
        });
        audio.load();
      });

      // Stop current track if playing
      if (this.currentTrack) {
        this.currentTrack.pause();
        this.currentTrack = null;
        this.currentSource = null;
      }

      // Connect audio element to Web Audio API for volume control
      // This works on iOS where HTMLAudioElement.volume doesn't
      // Note: createMediaElementSource can only be called once per audio element
      try {
        this.currentSource = this.audioContext.createMediaElementSource(audio);
        this.currentSource.connect(this.gainNode);
      } catch (error) {
        // Fallback for test environments or browsers that don't support this
        console.warn('[MusicPlayer] Could not create MediaElementSource, using HTMLAudioElement.volume instead');
        audio.volume = this.options.volume;
      }

      // Start playing new track
      this.currentTrack = audio;
      this.currentFilename = filename;
      await audio.play();
    } catch (error) {
      console.error(`[MusicPlayer] Error playing music ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Stop the currently playing track
   */
  async stop(): Promise<void> {
    if (this.currentTrack) {
      this.currentTrack.pause();
      this.currentTrack.currentTime = 0;
      this.currentTrack = null;
      this.currentFilename = null;
    }

    // Clear any pending fade timeout
    if (this.fadeTimeoutId !== null) {
      clearTimeout(this.fadeTimeoutId);
      this.fadeTimeoutId = null;
    }
  }

  /**
   * Fade out the current track
   * @param duration - Fade duration in milliseconds
   */
  async fadeOut(duration: number): Promise<void> {
    if (!this.currentTrack) {
      return;
    }

    const startVolume = this.currentSource ? this.gainNode.gain.value : this.currentTrack.volume;
    const startTime = Date.now();

    return new Promise<void>((resolve) => {
      const fade = () => {
        if (!this.currentTrack) {
          resolve();
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use Web Audio API gain node for volume control (works on iOS)
        // Fall back to HTMLAudioElement.volume for test environments
        if (this.currentSource) {
          this.gainNode.gain.value = startVolume * (1 - progress);
        } else {
          this.currentTrack.volume = startVolume * (1 - progress);
        }

        if (progress >= 1) {
          this.currentTrack.pause();
          resolve();
        } else {
          this.fadeTimeoutId = window.setTimeout(fade, 16); // ~60fps
        }
      };

      fade();
    });
  }

  /**
   * Fade in the current track
   * @param duration - Fade duration in milliseconds
   */
  async fadeIn(duration: number): Promise<void> {
    if (!this.currentTrack) {
      return;
    }

    const targetVolume = this.options.volume;
    const startTime = Date.now();
    
    // Use Web Audio API gain node for volume control (works on iOS)
    // Fall back to HTMLAudioElement.volume for test environments
    if (this.currentSource) {
      this.gainNode.gain.value = 0;
    } else {
      this.currentTrack.volume = 0;
    }

    // Ensure track is playing
    if (this.currentTrack.paused) {
      await this.currentTrack.play();
    }

    return new Promise<void>((resolve) => {
      const fade = () => {
        if (!this.currentTrack) {
          resolve();
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use Web Audio API gain node for volume control (works on iOS)
        // Fall back to HTMLAudioElement.volume for test environments
        if (this.currentSource) {
          this.gainNode.gain.value = targetVolume * progress;
        } else {
          this.currentTrack.volume = targetVolume * progress;
        }

        if (progress >= 1) {
          resolve();
        } else {
          this.fadeTimeoutId = window.setTimeout(fade, 16); // ~60fps
        }
      };

      fade();
    });
  }

  /**
   * Transition to a new track with fade
   * @param newFilename - The new music filename
   */
  async transition(newFilename: string): Promise<void> {
    try {
      // If already playing this track, do nothing
      if (this.currentFilename === newFilename && this.currentTrack && !this.currentTrack.paused) {
        return;
      }

      // Fade out current track
      if (this.currentTrack) {
        await this.fadeOut(this.options.fadeDuration);
        this.currentTrack = null;
        this.currentFilename = null;
      }

      // Load and fade in new track
      await this.play(newFilename);
      await this.fadeIn(this.options.fadeDuration);
    } catch (error) {
      console.error(`[MusicPlayer] Error transitioning to ${newFilename}:`, error);
    }
  }

  /**
   * Set the volume for background music
   * @param volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.options.volume = Math.max(0, Math.min(1, volume));
    
    // Use Web Audio API gain node for volume control (works on iOS)
    // Fall back to HTMLAudioElement.volume for test environments
    if (this.currentSource) {
      this.gainNode.gain.value = this.options.volume;
    } else if (this.currentTrack) {
      this.currentTrack.volume = this.options.volume;
    }
  }

  /**
   * Get the currently playing filename
   */
  getCurrentFilename(): string | null {
    return this.currentFilename;
  }

  /**
   * Check if music is currently playing
   */
  isPlaying(): boolean {
    return this.currentTrack !== null && !this.currentTrack.paused;
  }
}
