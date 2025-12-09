/**
 * TickSoundPlayer - Manages the countdown tick sound effect
 * 
 * This service plays a looping tick sound during quiz countdowns.
 * It uses HTML Audio Element for simplicity and to avoid conflicts
 * with the existing Web Audio API usage in AudioManager.
 */
export class TickSoundPlayer {
  private audio: HTMLAudioElement | null = null;
  private readonly tickSoundPath = '/data/sfx/effects/tick.mp3';
  private readonly volume = 0.3; // 30% volume to not overpower other audio

  /**
   * Start playing the tick sound in a loop
   */
  start(): void {
    try {
      // Create new audio element
      this.audio = new Audio(this.tickSoundPath);
      this.audio.loop = true;
      this.audio.volume = this.volume;
      
      // Play the audio
      this.audio.play().catch(err => {
        console.warn('[TickSoundPlayer] Failed to play tick sound:', err);
      });
    } catch (error) {
      console.warn('[TickSoundPlayer] Error initializing tick sound:', error);
    }
  }

  /**
   * Stop playing the tick sound and clean up resources
   */
  stop(): void {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio = null;
      } catch (error) {
        console.warn('[TickSoundPlayer] Error stopping tick sound:', error);
      }
    }
  }

  /**
   * Check if the tick sound is currently playing
   */
  isPlaying(): boolean {
    return this.audio !== null && !this.audio.paused;
  }
}
