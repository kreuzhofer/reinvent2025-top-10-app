// Audio System Types

/**
 * Configuration for audio playback in the quiz application
 */
export interface AudioConfig {
  welcomeMusic?: string; // Background music for welcome screen
  defaultQuizMusic?: string; // Default background music for quiz slides
  victoryMusic?: string; // Background music for summary/victory screen
  musicVolume?: number; // Volume for background music (0.0 to 1.0)
  sfxVolume?: number; // Volume for sound effects (0.0 to 1.0)
}

/**
 * Options for configuring the AudioManager
 */
export interface AudioManagerOptions {
  musicVolume: number; // Volume for background music (0.0 to 1.0)
  sfxVolume: number; // Volume for sound effects (0.0 to 1.0)
  fadeDuration: number; // Duration of fade transitions in milliseconds
}

/**
 * Current state of the audio system
 */
export interface AudioState {
  isMuted: boolean; // Whether audio is currently muted
  currentBackgroundMusic: string | null; // Currently playing background music filename
  isPlaying: boolean; // Whether audio is currently playing
}

/**
 * Options for configuring the MusicPlayer
 */
export interface MusicPlayerOptions {
  volume: number; // Volume level (0.0 to 1.0)
  fadeDuration: number; // Duration of fade transitions in milliseconds
  loop: boolean; // Whether to loop the music
}

/**
 * Options for configuring the SFXPlayer
 */
export interface SFXPlayerOptions {
  volume: number; // Volume level (0.0 to 1.0)
  maxConcurrentSounds: number; // Maximum number of sounds that can play simultaneously
}

/**
 * Configuration for emoji animations
 */
export interface EmojiConfig {
  emoji: string; // The emoji character to display
  startPosition: { x: number; y: number; z: number }; // Starting position (z is depth)
  endPosition: { x: number; y: number }; // Ending position on screen
  rotation: number; // Rotation angle in degrees
  scale: number; // Scale factor
  duration: number; // Animation duration in milliseconds
}

/**
 * Options for configuring the EmojiManager
 */
export interface EmojiManagerOptions {
  maxConcurrentEmojis: number; // Maximum number of emojis that can be displayed simultaneously
  displayDuration: number; // How long to display the emoji after animation completes (milliseconds)
  animationDuration: number; // Duration of the fly-in animation (milliseconds)
}
