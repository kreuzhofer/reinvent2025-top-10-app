import type { AudioManagerOptions, AudioState } from '../../types/audio.types';
import { MusicPlayer } from './MusicPlayer';
import { SFXPlayer } from './SFXPlayer';

/**
 * AudioManager coordinates background music and sound effects playback.
 * Manages audio context initialization, mute state, and track transitions.
 */
export class AudioManager {
  private audioContext: AudioContext | null;
  private musicPlayer: MusicPlayer | null;
  private sfxPlayer: SFXPlayer | null;
  private state: AudioState;
  private options: AudioManagerOptions;
  private readonly MUTE_STATE_KEY = 'quiz-audio-muted';

  constructor(options: AudioManagerOptions) {
    this.audioContext = null;
    this.musicPlayer = null;
    this.sfxPlayer = null;
    this.options = options;

    // Load mute state from localStorage
    const savedMuteState = localStorage.getItem(this.MUTE_STATE_KEY);
    this.state = {
      isMuted: savedMuteState === 'true',
      currentBackgroundMusic: null,
      isPlaying: false,
    };
  }

  /**
   * Initialize the audio context and players.
   * Must be called after user interaction due to browser autoplay policies.
   */
  async initialize(): Promise<void> {
    try {
      if (this.audioContext) {
        return; // Already initialized
      }

      // Create audio context
      this.audioContext = new AudioContext();

      // Create music player
      this.musicPlayer = new MusicPlayer(this.audioContext, {
        volume: this.options.musicVolume,
        fadeDuration: this.options.fadeDuration,
        loop: true,
      });

      // Create SFX player
      this.sfxPlayer = new SFXPlayer(this.audioContext, {
        volume: this.options.sfxVolume,
        maxConcurrentSounds: 5,
      });

      console.log('[AudioManager] Audio system initialized');
    } catch (error) {
      console.error('[AudioManager] Failed to initialize audio system:', error);
    }
  }

  /**
   * Set the mute state
   * @param muted - Whether audio should be muted
   */
  setMuted(muted: boolean): void {
    this.state.isMuted = muted;
    
    // Persist mute state
    localStorage.setItem(this.MUTE_STATE_KEY, muted.toString());

    if (muted) {
      // Stop all audio
      if (this.musicPlayer) {
        this.musicPlayer.stop();
      }
      this.state.isPlaying = false;
    } else {
      // Resume background music if there was one playing
      if (this.state.currentBackgroundMusic && this.musicPlayer) {
        this.playBackgroundMusic(this.state.currentBackgroundMusic);
      }
    }
  }

  /**
   * Check if audio is muted
   */
  isMuted(): boolean {
    return this.state.isMuted;
  }

  /**
   * Play background music with fade transitions
   * @param filename - The music filename (e.g., 'welcome-bg.mp3')
   */
  async playBackgroundMusic(filename: string): Promise<void> {
    try {
      // Initialize if not already done
      if (!this.audioContext) {
        await this.initialize();
      }

      // Don't play if muted
      if (this.state.isMuted) {
        // Store the filename so we can resume when unmuted
        this.state.currentBackgroundMusic = filename;
        return;
      }

      if (!this.musicPlayer) {
        console.warn('[AudioManager] Music player not initialized');
        return;
      }

      // Check if this is the same track that's currently playing
      const currentFilename = this.musicPlayer.getCurrentFilename();
      if (currentFilename === filename && this.musicPlayer.isPlaying()) {
        // Same track is already playing, don't restart
        return;
      }

      // Update state
      this.state.currentBackgroundMusic = filename;
      this.state.isPlaying = true;

      // If there's a different track playing, transition with fade
      if (currentFilename && currentFilename !== filename) {
        await this.musicPlayer.transition(filename);
      } else {
        // No track playing or same track, just play
        await this.musicPlayer.play(filename);
      }
    } catch (error) {
      console.error(`[AudioManager] Error playing background music ${filename}:`, error);
    }
  }

  /**
   * Stop background music
   */
  async stopBackgroundMusic(): Promise<void> {
    if (this.musicPlayer) {
      await this.musicPlayer.stop();
    }
    this.state.currentBackgroundMusic = null;
    this.state.isPlaying = false;
  }

  /**
   * Play a sound effect
   * @param filename - The sound effect filename (e.g., 'correct-answer.mp3')
   */
  async playSFX(filename: string): Promise<void> {
    try {
      // Initialize if not already done
      if (!this.audioContext) {
        await this.initialize();
      }

      // Don't play if muted
      if (this.state.isMuted) {
        return;
      }

      if (!this.sfxPlayer) {
        console.warn('[AudioManager] SFX player not initialized');
        return;
      }

      await this.sfxPlayer.play(filename);
    } catch (error) {
      console.error(`[AudioManager] Error playing sound effect ${filename}:`, error);
    }
  }

  /**
   * Get the current audio state
   */
  getState(): AudioState {
    return { ...this.state };
  }

  /**
   * Get the currently playing background music filename
   */
  getCurrentBackgroundMusic(): string | null {
    return this.state.currentBackgroundMusic;
  }

  /**
   * Clean up audio resources
   */
  cleanup(): void {
    if (this.musicPlayer) {
      this.musicPlayer.stop();
    }
    if (this.sfxPlayer) {
      this.sfxPlayer.cleanup();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.musicPlayer = null;
    this.sfxPlayer = null;
  }
}
