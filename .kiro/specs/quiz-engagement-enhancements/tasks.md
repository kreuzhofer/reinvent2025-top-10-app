# Implementation Plan: Quiz Engagement Enhancements

- [x] 1. Set up audio file structure and documentation
  - Create public/data/sfx directory structure with background/ and effects/ subdirectories
  - Create README.md documenting required audio files and specifications
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 2. Extend quiz data types for audio support
  - Add backgroundMusic optional property to ContentSlide type
  - Add backgroundMusic optional property to QuizSlide type
  - Add AudioConfig interface to QuizData type
  - Create audio.types.ts with audio-related type definitions
  - _Requirements: 9.1, 9.2, 3.1_

- [x] 2.1 Write property test for data structure support
  - **Property 28: Background music data structure support**
  - **Validates: Requirements 9.1, 9.2**

- [x] 3. Implement core audio system classes
  - [x] 3.1 Implement SFXPlayer class
    - Create SFXPlayer with Web Audio API support
    - Implement audio buffer caching
    - Implement concurrent sound playback
    - Implement volume control
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 3.2 Write property tests for SFXPlayer
    - **Property 22: Concurrent sound effect playback**
    - **Validates: Requirements 4.5**

  - [x] 3.3 Implement MusicPlayer class
    - Create MusicPlayer with HTML5 Audio support
    - Implement fade in/out functionality
    - Implement track transition with fade
    - Implement volume control and looping
    - _Requirements: 3.3, 3.4, 3.6_

  - [x] 3.4 Write property tests for MusicPlayer
    - **Property 15: Background music fade transition**
    - **Validates: Requirements 3.3**
    - **Property 16: Background music continuity**
    - **Validates: Requirements 3.4, 9.5**
    - **Property 17: Background music default behavior**
    - **Validates: Requirements 3.6**

  - [x] 3.5 Implement AudioManager class
    - Create AudioManager coordinating MusicPlayer and SFXPlayer
    - Implement audio context initialization
    - Implement mute/unmute functionality
    - Implement background music management with track comparison
    - Implement error handling for missing files
    - _Requirements: 3.2, 5.1, 5.5, 6.1, 6.3, 6.4, 9.3, 9.4_

  - [x] 3.6 Write property tests for AudioManager
    - **Property 14: Background music property reading**
    - **Validates: Requirements 3.2**
    - **Property 23: Audio file path construction**
    - **Validates: Requirements 5.1**
    - **Property 24: Missing audio file handling**
    - **Validates: Requirements 5.5**
    - **Property 25: Mute functionality**
    - **Validates: Requirements 6.3**
    - **Property 26: Unmute functionality**
    - **Validates: Requirements 6.4**
    - **Property 27: Mute state persistence**
    - **Validates: Requirements 6.5**
    - **Property 29: Background music file loading**
    - **Validates: Requirements 9.3**
    - **Property 30: Background music comparison**
    - **Validates: Requirements 9.4**

- [x] 4. Implement audio React integration
  - [x] 4.1 Create AudioContext provider
    - Implement AudioContext with AudioManager instance
    - Implement AudioProvider component
    - Handle audio context initialization on user interaction
    - _Requirements: 6.1_

  - [x] 4.2 Create useAudioManager hook
    - Implement hook to access AudioContext
    - Provide playBackgroundMusic and playSFX functions
    - Provide mute state and toggleMute function
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 4.3 Create AudioControls component
    - Implement mute/unmute button UI
    - Integrate with useAudioManager hook
    - Add keyboard accessibility
    - Add ARIA labels
    - _Requirements: 6.2_

  - [x] 4.4 Write unit tests for audio React components
    - Test AudioProvider initialization
    - Test useAudioManager hook
    - Test AudioControls component rendering and interaction
    - _Requirements: 6.1, 6.2_

- [x] 5. Implement emoji feedback system
  - [x] 5.1 Implement EmojiManager class
    - Create EmojiManager with emoji pools (success and miss)
    - Implement emoji configuration generation with randomization
    - Implement overlap detection and prevention
    - Implement concurrent emoji limit (max 3)
    - Implement cleanup functionality
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 7.2, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 5.2 Write property tests for EmojiManager
    - **Property 1: Success emoji selection**
    - **Validates: Requirements 1.1**
    - **Property 2: Miss emoji selection**
    - **Validates: Requirements 2.1**
    - **Property 4: Emoji variety**
    - **Validates: Requirements 1.4, 2.4**
    - **Property 6: Concurrent emoji limit**
    - **Validates: Requirements 7.2**
    - **Property 8: Emoji position randomization**
    - **Validates: Requirements 8.1, 8.2**
    - **Property 9: Emoji rotation range**
    - **Validates: Requirements 8.3**
    - **Property 10: Emoji scale range**
    - **Validates: Requirements 8.4**
    - **Property 11: Emoji overlap prevention**
    - **Validates: Requirements 8.5**

  - [x] 5.3 Implement EmojiAnimation component
    - Create EmojiAnimation component with Framer Motion
    - Implement fly-in animation using CSS transforms
    - Implement smash effect with rotation and scale
    - Implement display duration (1500ms minimum)
    - Implement cleanup on animation complete
    - _Requirements: 1.2, 1.3, 1.5, 2.2, 2.3, 2.5, 7.1, 7.3_

  - [x] 5.4 Write property tests for EmojiAnimation
    - **Property 3: Emoji animation properties**
    - **Validates: Requirements 1.2, 1.3, 2.2, 2.3**
    - **Property 5: Emoji display duration**
    - **Validates: Requirements 1.5, 2.5**
    - **Property 12: Emoji DOM cleanup**
    - **Validates: Requirements 7.3**
    - **Property 13: CSS transform usage**
    - **Validates: Requirements 7.1**

  - [x] 5.4 Implement EmojiContainer component
    - Create EmojiContainer to manage multiple emoji animations
    - Integrate with EmojiManager
    - Implement cleanup on unmount
    - _Requirements: 7.5_

  - [x] 5.5 Write property test for EmojiContainer
    - **Property 7: Emoji cleanup on navigation**
    - **Validates: Requirements 7.5**

  - [x] 5.6 Create useEmojiManager hook
    - Implement hook to trigger emoji animations
    - Provide showSuccessEmoji and showMissEmoji functions
    - Integrate with AudioManager to trigger emoji-fly.mp3 sound
    - _Requirements: 1.1, 2.1, 4.3_

  - [x] 5.7 Write property test for emoji sound coordination
    - **Property 20: Emoji fly-in sound effect**
    - **Validates: Requirements 4.3**

- [x] 6. Integrate audio system into application
  - [x] 6.1 Update App.tsx with AudioProvider
    - Wrap application with AudioProvider
    - Add AudioControls component to UI
    - _Requirements: 6.1, 6.2_

  - [x] 6.2 Update WelcomeScreen with background music
    - Integrate useAudioManager hook
    - Play welcome background music on mount
    - Handle audio initialization on user interaction
    - _Requirements: 3.1_

  - [x] 6.3 Update SummaryScreen with victory music
    - Integrate useAudioManager hook
    - Play victory music on mount
    - _Requirements: 3.5_

  - [x] 6.4 Update ContentSlide with background music support
    - Integrate useAudioManager hook
    - Read backgroundMusic property from slide data
    - Play background music with fade transitions
    - Play slide transition sound effect
    - _Requirements: 3.2, 3.3, 3.4, 3.6, 4.4, 9.1, 9.3, 9.4, 9.5_

  - [x] 6.5 Write property test for slide transition sound
    - **Property 21: Slide transition sound effect**
    - **Validates: Requirements 4.4**

  - [x] 6.6 Update QuizSlide with background music support
    - Integrate useAudioManager hook
    - Read backgroundMusic property from slide data
    - Play background music with fade transitions
    - _Requirements: 3.2, 3.3, 3.4, 3.6, 9.2, 9.3, 9.4, 9.5_

- [x] 7. Integrate emoji feedback into QuizSlide
  - [x] 7.1 Add EmojiContainer to QuizSlide
    - Import and render EmojiContainer component
    - Position container to overlay quiz content
    - _Requirements: 1.1, 2.1_

  - [x] 7.2 Trigger emoji animations on answer selection
    - Integrate useEmojiManager hook
    - Call showSuccessEmoji on correct answer
    - Call showMissEmoji on incorrect answer
    - _Requirements: 1.1, 2.1_

  - [x] 7.3 Trigger sound effects on answer selection
    - Call playSFX with correct-answer.mp3 on correct answer
    - Call playSFX with wrong-answer.mp3 on incorrect answer
    - _Requirements: 4.1, 4.2_

  - [x] 7.4 Write property tests for answer feedback
    - **Property 18: Correct answer sound effect**
    - **Validates: Requirements 4.1**
    - **Property 19: Incorrect answer sound effect**
    - **Validates: Requirements 4.2**

- [x] 8. Add accessibility and reduced motion support
  - [x] 8.1 Implement reduced motion detection for emojis
    - Check prefers-reduced-motion media query
    - Disable or simplify emoji animations when enabled
    - Maintain visual feedback without animation
    - _Requirements: 1.1, 2.1_

  - [x] 8.2 Ensure audio controls are accessible
    - Verify keyboard navigation works for mute button
    - Verify ARIA labels are present
    - Test with screen reader
    - _Requirements: 6.2_

  - [x] 8.3 Write unit tests for accessibility features
    - Test reduced motion behavior
    - Test keyboard accessibility
    - Test ARIA attributes
    - _Requirements: 6.2_

- [x] 9. Final integration and testing
  - Ensure all tests pass
  - Verify Docker build succeeds
  - Test complete quiz flow with audio and emojis
  - Verify mute/unmute functionality
  - Verify background music transitions
  - Test with missing audio files
  - Ask the user if questions arise
