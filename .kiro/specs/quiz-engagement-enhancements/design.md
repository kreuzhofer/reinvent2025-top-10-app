# Design Document: Quiz Engagement Enhancements

## Overview

This design document outlines the implementation of visual emoji feedback animations and comprehensive audio integration for the AWS re:Invent quiz application. The enhancements will create a more engaging and immersive user experience through immediate visual and acoustic feedback for user interactions.

The system consists of two primary subsystems:
1. **Emoji Feedback System**: Displays animated emoji reactions when users answer questions
2. **Audio System**: Manages background music and sound effects throughout the quiz experience

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Quiz Application                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Emoji Feedback  │         │  Audio System    │          │
│  │     System       │         │                  │          │
│  ├──────────────────┤         ├──────────────────┤          │
│  │ - EmojiManager   │         │ - AudioManager   │          │
│  │ - Animation      │         │ - MusicPlayer    │          │
│  │   Controller     │         │ - SFXPlayer      │          │
│  │ - Emoji Pool     │         │ - FadeController │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                            │                     │
│           └────────────┬───────────────┘                     │
│                        │                                     │
│              ┌─────────▼─────────┐                          │
│              │   Quiz Components  │                          │
│              │  - QuizSlide       │                          │
│              │  - WelcomeScreen   │                          │
│              │  - SummaryScreen   │                          │
│              │  - ContentSlide    │                          │
│              └────────────────────┘                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Action (Answer Question)
        │
        ▼
┌───────────────────┐
│   QuizSlide       │
│   Component       │
└────────┬──────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌────────────────┐    ┌─────────────────┐
│ EmojiManager   │    │  AudioManager   │
│ .showEmoji()   │    │  .playSFX()     │
└────────┬───────┘    └─────────┬───────┘
         │                      │
         ▼                      ▼
┌────────────────┐    ┌─────────────────┐
│ Animation      │    │  SFXPlayer      │
│ Triggered      │    │  Plays Sound    │
└────────────────┘    └─────────────────┘
```

## Components and Interfaces

### 1. Emoji Feedback System

#### EmojiManager

Manages the lifecycle of emoji animations and maintains the emoji pool.

```typescript
interface EmojiConfig {
  emoji: string;
  startPosition: { x: number; y: number; z: number };
  endPosition: { x: number; y: number };
  rotation: number;
  scale: number;
  duration: number;
}

interface EmojiManagerOptions {
  maxConcurrentEmojis: number;
  displayDuration: number;
  animationDuration: number;
}

class EmojiManager {
  private activeEmojis: Set<string>;
  private successEmojis: string[];
  private missEmojis: string[];
  private options: EmojiManagerOptions;

  constructor(options: EmojiManagerOptions);
  
  showSuccessEmoji(): void;
  showMissEmoji(): void;
  private generateEmojiConfig(emoji: string): EmojiConfig;
  private checkOverlap(config: EmojiConfig): boolean;
  private removeEmoji(id: string): void;
  cleanup(): void;
}
```

#### EmojiAnimation Component

React component that renders and animates individual emojis.

```typescript
interface EmojiAnimationProps {
  config: EmojiConfig;
  onComplete: () => void;
}

const EmojiAnimation: React.FC<EmojiAnimationProps>;
```

#### EmojiContainer Component

Container component that manages multiple emoji animations.

```typescript
interface EmojiContainerProps {
  emojis: EmojiConfig[];
}

const EmojiContainer: React.FC<EmojiContainerProps>;
```

### 2. Audio System

#### AudioManager

Central audio management system that coordinates background music and sound effects.

```typescript
interface AudioManagerOptions {
  musicVolume: number;
  sfxVolume: number;
  fadeDuration: number;
}

interface AudioState {
  isMuted: boolean;
  currentBackgroundMusic: string | null;
  isPlaying: boolean;
}

class AudioManager {
  private audioContext: AudioContext | null;
  private musicPlayer: MusicPlayer;
  private sfxPlayer: SFXPlayer;
  private state: AudioState;
  private options: AudioManagerOptions;

  constructor(options: AudioManagerOptions);
  
  initialize(): Promise<void>;
  setMuted(muted: boolean): void;
  isMuted(): boolean;
  
  // Background music methods
  playBackgroundMusic(filename: string): Promise<void>;
  stopBackgroundMusic(): Promise<void>;
  
  // Sound effect methods
  playSFX(filename: string): Promise<void>;
  
  cleanup(): void;
}
```

#### MusicPlayer

Handles background music playback with fade transitions.

```typescript
interface MusicPlayerOptions {
  volume: number;
  fadeDuration: number;
  loop: boolean;
}

class MusicPlayer {
  private audioContext: AudioContext;
  private currentTrack: HTMLAudioElement | null;
  private gainNode: GainNode;
  private options: MusicPlayerOptions;

  constructor(audioContext: AudioContext, options: MusicPlayerOptions);
  
  async play(filename: string): Promise<void>;
  async stop(): Promise<void>;
  async fadeOut(duration: number): Promise<void>;
  async fadeIn(duration: number): Promise<void>;
  async transition(newFilename: string): Promise<void>;
  setVolume(volume: number): void;
}
```

#### SFXPlayer

Manages sound effect playback with support for concurrent sounds.

```typescript
interface SFXPlayerOptions {
  volume: number;
  maxConcurrentSounds: number;
}

class SFXPlayer {
  private audioContext: AudioContext;
  private audioBuffers: Map<string, AudioBuffer>;
  private activeSources: Set<AudioBufferSourceNode>;
  private options: SFXPlayerOptions;

  constructor(audioContext: AudioContext, options: SFXPlayerOptions);
  
  async preload(filename: string): Promise<void>;
  async play(filename: string): Promise<void>;
  setVolume(volume: number): void;
  cleanup(): void;
}
```

### 3. React Hooks

#### useAudioManager

Custom hook for accessing the audio manager in React components.

```typescript
interface UseAudioManagerReturn {
  audioManager: AudioManager | null;
  isInitialized: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  playBackgroundMusic: (filename: string) => Promise<void>;
  playSFX: (filename: string) => Promise<void>;
}

function useAudioManager(): UseAudioManagerReturn;
```

#### useEmojiManager

Custom hook for triggering emoji animations.

```typescript
interface UseEmojiManagerReturn {
  showSuccessEmoji: () => void;
  showMissEmoji: () => void;
}

function useEmojiManager(): UseEmojiManagerReturn;
```

### 4. Context Providers

#### AudioContext

Provides audio manager instance to the application.

```typescript
interface AudioContextType {
  audioManager: AudioManager | null;
  isInitialized: boolean;
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
}

const AudioContext = React.createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: React.ReactNode;
}

const AudioProvider: React.FC<AudioProviderProps>;
```

## Data Models

### Extended Quiz Data Types

```typescript
// Extension to existing ContentSlide type
interface ContentSlide {
  type: 'content';
  id: string;
  title: string;
  content: ContentBlock[];
  backgroundMusic?: string; // NEW: Optional background music filename
}

// Extension to existing QuizSlide type
interface QuizSlide {
  type: 'quiz';
  id: string;
  question: string;
  relatedAnnouncementId?: string;
  choices: QuizChoice[];
  correctAnswerIndex: number;
  explanation?: string;
  funFact?: string;
  points: number;
  timeLimit?: number;
  backgroundMusic?: string; // NEW: Optional background music filename
}

// Extension to existing QuizData type
interface QuizData {
  metadata: {
    title: string;
    description: string;
    version: string;
    totalSlides: number;
    author?: string;
    date?: string;
    tags?: string[];
  };
  slides: Slide[];
  resources?: ResourcesConfig;
  quizConfig?: QuizConfig;
  audioConfig?: AudioConfig; // NEW: Optional audio configuration
}

// NEW: Audio configuration
interface AudioConfig {
  welcomeMusic?: string;
  defaultQuizMusic?: string;
  victoryMusic?: string;
  musicVolume?: number; // 0.0 to 1.0
  sfxVolume?: number; // 0.0 to 1.0
}
```

### Audio File Structure

```
public/data/sfx/
├── README.md
├── background/
│   ├── welcome-bg.mp3
│   ├── quiz-bg.mp3
│   ├── victory-bg.mp3
│   └── [custom-bg-files].mp3
└── effects/
    ├── correct-answer.mp3
    ├── wrong-answer.mp3
    ├── emoji-fly.mp3
    └── slide-transition.mp3
```

### Emoji Configuration

```typescript
const EMOJI_CONFIG = {
  success: ['💪', '🔥', '⭐', '🎯', '✨'],
  miss: ['💔', '🔨', '💥', '🌟', '🎪'],
  animation: {
    duration: 800, // milliseconds
    displayTime: 1500, // milliseconds
    maxConcurrent: 3,
  },
  randomization: {
    zDepth: { min: -500, max: -100 },
    rotation: { min: -15, max: 15 },
    scale: { min: 0.8, max: 1.2 },
  },
};
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated:
- Properties 1.2, 1.3, 2.2, 2.3 all test animation behavior and can be combined into comprehensive animation properties
- Properties 1.4 and 2.4 test the same randomization pattern and can be combined
- Properties 1.5 and 2.5 test the same timing behavior and can be combined
- Properties 3.4 and 9.5 are identical (continuous playback) and should be one property
- Properties 9.1 and 9.2 test the same data structure support and can be combined

### Emoji Feedback Properties

**Property 1: Success emoji selection**
*For any* correct answer selection, the displayed emoji should be one of {💪, 🔥, ⭐, 🎯, ✨}
**Validates: Requirements 1.1**

**Property 2: Miss emoji selection**
*For any* incorrect answer selection, the displayed emoji should be one of {💔, 🔨, 💥, 🌟, 🎪}
**Validates: Requirements 2.1**

**Property 3: Emoji animation properties**
*For any* emoji display (success or miss), the animation should start from a position with negative z-axis value and end at a position on the screen surface with applied rotation and scale transforms
**Validates: Requirements 1.2, 1.3, 2.2, 2.3**

**Property 4: Emoji variety**
*For any* sequence of 3 or more consecutive emoji displays of the same type (success or miss), at least 2 different emojis should be selected
**Validates: Requirements 1.4, 2.4**

**Property 5: Emoji display duration**
*For any* emoji animation, the emoji element should remain in the DOM for at least 1500 milliseconds after the animation completes
**Validates: Requirements 1.5, 2.5**

**Property 6: Concurrent emoji limit**
*For any* point in time, the number of active emoji animations should not exceed 3
**Validates: Requirements 7.2**

**Property 7: Emoji cleanup on navigation**
*For any* navigation event away from a quiz question, all active emoji animations should be stopped and their DOM elements removed
**Validates: Requirements 7.5**

**Property 8: Emoji position randomization**
*For any* sequence of emoji displays, the starting z-axis positions should vary, and the landing x and y positions should vary while remaining within viewport bounds
**Validates: Requirements 8.1, 8.2**

**Property 9: Emoji rotation range**
*For any* emoji smash animation, the applied rotation should be between -15 and 15 degrees
**Validates: Requirements 8.3**

**Property 10: Emoji scale range**
*For any* emoji smash animation, the applied scale should be between 0.8 and 1.2
**Validates: Requirements 8.4**

**Property 11: Emoji overlap prevention**
*For any* set of simultaneously displayed emojis, no two emojis should overlap by more than 30% of their area
**Validates: Requirements 8.5**

**Property 12: Emoji DOM cleanup**
*For any* completed emoji animation, the emoji element should be removed from the DOM
**Validates: Requirements 7.3**

**Property 13: CSS transform usage**
*For any* emoji animation, the animation should use CSS transform properties (translate3d, rotate, scale) rather than position properties
**Validates: Requirements 7.1**

### Audio System Properties

**Property 14: Background music property reading**
*For any* slide or question navigation, the Audio System should check for and read the backgroundMusic property if present
**Validates: Requirements 3.2**

**Property 15: Background music fade transition**
*For any* background music change (when the new filename differs from the current track), the Audio System should fade out the current track over 1000ms and fade in the new track over 1000ms
**Validates: Requirements 3.3**

**Property 16: Background music continuity**
*For any* slide or question navigation where the backgroundMusic property matches the currently playing track, the audio playback should continue without restarting
**Validates: Requirements 3.4, 9.5**

**Property 17: Background music default behavior**
*For any* slide or question navigation where no backgroundMusic property is specified, the current background music should continue playing unchanged
**Validates: Requirements 3.6**

**Property 18: Correct answer sound effect**
*For any* correct answer selection, the Audio System should play the correct-answer.mp3 sound effect
**Validates: Requirements 4.1**

**Property 19: Incorrect answer sound effect**
*For any* incorrect answer selection, the Audio System should play the wrong-answer.mp3 sound effect
**Validates: Requirements 4.2**

**Property 20: Emoji fly-in sound effect**
*For any* emoji animation start, the Audio System should play the emoji-fly.mp3 sound effect
**Validates: Requirements 4.3**

**Property 21: Slide transition sound effect**
*For any* slide navigation event, the Audio System should play the slide-transition.mp3 sound effect
**Validates: Requirements 4.4**

**Property 22: Concurrent sound effect playback**
*For any* set of simultaneously triggered sound effects, all sound effects should be played concurrently without blocking each other
**Validates: Requirements 4.5**

**Property 23: Audio file path construction**
*For any* audio file reference, the file path should be constructed as public/data/sfx/[category]/[filename]
**Validates: Requirements 5.1**

**Property 24: Missing audio file handling**
*For any* audio file that fails to load, the application should continue functioning without throwing errors or crashing
**Validates: Requirements 5.5**

**Property 25: Mute functionality**
*For any* mute action, all background music and sound effects should stop playing
**Validates: Requirements 6.3**

**Property 26: Unmute functionality**
*For any* unmute action, the appropriate background music for the current screen should resume playing
**Validates: Requirements 6.4**

**Property 27: Mute state persistence**
*For any* mute state change, the new state should be saved to localStorage and restored on application reload
**Validates: Requirements 6.5**

**Property 28: Background music data structure support**
*For any* slide or question in the quiz data with a backgroundMusic property, the property value should be parsed and accessible
**Validates: Requirements 9.1, 9.2**

**Property 29: Background music file loading**
*For any* slide or question with a backgroundMusic property, the Audio System should construct the file path using the property value and attempt to load the audio file
**Validates: Requirements 9.3**

**Property 30: Background music comparison**
*For any* slide or question navigation, the Audio System should compare the new backgroundMusic value with the currently playing track filename
**Validates: Requirements 9.4**

## Error Handling

### Emoji System Error Handling

1. **Animation Failure**: If an emoji animation fails to start, log the error and continue without blocking the quiz
2. **DOM Manipulation Errors**: Wrap all DOM operations in try-catch blocks to prevent crashes
3. **Concurrent Limit Exceeded**: Queue additional emojis and display them when slots become available
4. **Overlap Detection Failure**: If overlap detection fails, allow the emoji to display anyway rather than blocking

### Audio System Error Handling

1. **Audio Context Initialization Failure**: Gracefully degrade to silent mode if AudioContext cannot be created
2. **File Loading Errors**: Log missing audio files but continue quiz functionality
3. **Playback Errors**: Catch and log audio playback errors without interrupting the user experience
4. **Fade Transition Errors**: If fade fails, fall back to immediate audio switch
5. **Browser Compatibility**: Detect and handle browsers that don't support Web Audio API

### Error Logging

All errors should be logged to the console with descriptive messages:
- `[EmojiManager] Failed to display emoji: ${error.message}`
- `[AudioManager] Failed to load audio file: ${filename}`
- `[MusicPlayer] Fade transition failed: ${error.message}`

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

1. **Emoji Manager Tests**
   - Test emoji selection from correct pools (success vs miss)
   - Test emoji configuration generation
   - Test cleanup on component unmount
   - Test concurrent emoji limit enforcement

2. **Audio Manager Tests**
   - Test audio context initialization
   - Test mute/unmute functionality
   - Test file path construction
   - Test error handling for missing files

3. **Music Player Tests**
   - Test fade in/out timing
   - Test track transition logic
   - Test volume control
   - Test loop functionality

4. **SFX Player Tests**
   - Test concurrent sound playback
   - Test audio buffer caching
   - Test cleanup of completed sounds

5. **React Component Tests**
   - Test EmojiAnimation component rendering
   - Test EmojiContainer component with multiple emojis
   - Test integration with QuizSlide component
   - Test mute button functionality

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using the **fast-check** library. Each test will run a minimum of 100 iterations.

1. **Emoji Selection Properties**
   - Property 1: Success emoji selection (Requirements 1.1)
   - Property 2: Miss emoji selection (Requirements 2.1)
   - Property 4: Emoji variety (Requirements 1.4, 2.4)

2. **Emoji Animation Properties**
   - Property 3: Animation properties (Requirements 1.2, 1.3, 2.2, 2.3)
   - Property 5: Display duration (Requirements 1.5, 2.5)
   - Property 8: Position randomization (Requirements 8.1, 8.2)
   - Property 9: Rotation range (Requirements 8.3)
   - Property 10: Scale range (Requirements 8.4)
   - Property 13: CSS transform usage (Requirements 7.1)

3. **Emoji System Constraints**
   - Property 6: Concurrent emoji limit (Requirements 7.2)
   - Property 11: Overlap prevention (Requirements 8.5)
   - Property 12: DOM cleanup (Requirements 7.3)
   - Property 7: Navigation cleanup (Requirements 7.5)

4. **Audio Background Music Properties**
   - Property 14: Property reading (Requirements 3.2)
   - Property 15: Fade transitions (Requirements 3.3)
   - Property 16: Continuity (Requirements 3.4, 9.5)
   - Property 17: Default behavior (Requirements 3.6)
   - Property 28: Data structure support (Requirements 9.1, 9.2)
   - Property 29: File loading (Requirements 9.3)
   - Property 30: Track comparison (Requirements 9.4)

5. **Audio Sound Effect Properties**
   - Property 18: Correct answer SFX (Requirements 4.1)
   - Property 19: Incorrect answer SFX (Requirements 4.2)
   - Property 20: Emoji fly-in SFX (Requirements 4.3)
   - Property 21: Slide transition SFX (Requirements 4.4)
   - Property 22: Concurrent playback (Requirements 4.5)

6. **Audio System Properties**
   - Property 23: File path construction (Requirements 5.1)
   - Property 24: Missing file handling (Requirements 5.5)
   - Property 25: Mute functionality (Requirements 6.3)
   - Property 26: Unmute functionality (Requirements 6.4)
   - Property 27: State persistence (Requirements 6.5)

### Testing Requirements

- All property-based tests MUST be tagged with comments explicitly referencing the correctness property
- Tag format: `// Feature: quiz-engagement-enhancements, Property {number}: {property_text}`
- Each correctness property MUST be implemented by a SINGLE property-based test
- Tests MUST run a minimum of 100 iterations
- Tests SHOULD NOT use mocks where possible to keep tests simple
- Tests MUST validate real functionality, not fake data

### Integration Testing

Integration tests will verify the interaction between components:

1. **Emoji + Audio Integration**
   - Test that emoji animations trigger corresponding sound effects
   - Test that multiple emojis trigger multiple sound effects correctly

2. **Quiz Flow Integration**
   - Test emoji display on answer selection in QuizSlide
   - Test background music transitions between slides
   - Test audio playback on WelcomeScreen and SummaryScreen

3. **State Management Integration**
   - Test mute state persistence across page reloads
   - Test audio state coordination with quiz navigation

## Implementation Notes

### Performance Considerations

1. **Emoji Animations**
   - Use CSS transforms (translate3d, rotate, scale) for GPU acceleration
   - Limit concurrent animations to 3 to prevent performance degradation
   - Remove completed animations from DOM immediately
   - Use `will-change` CSS property sparingly and only during animation

2. **Audio System**
   - Preload frequently used sound effects on application start
   - Use Web Audio API for sound effects (better performance for short sounds)
   - Use HTML5 Audio for background music (better for long tracks)
   - Implement audio buffer caching to avoid repeated file loads

3. **Memory Management**
   - Clean up audio sources after playback completes
   - Remove event listeners on component unmount
   - Clear animation timeouts on navigation

### Browser Compatibility

1. **Web Audio API**: Supported in all modern browsers (Chrome 35+, Firefox 25+, Safari 14.1+, Edge 79+)
2. **CSS Transforms**: Universally supported
3. **Framer Motion**: Already used in the project, compatible with React 16.8+

### Accessibility Considerations

1. **Audio Controls**
   - Provide visible mute/unmute button
   - Ensure button is keyboard accessible
   - Use ARIA labels for screen readers

2. **Animations**
   - Respect `prefers-reduced-motion` media query
   - Provide option to disable emoji animations
   - Ensure animations don't interfere with quiz functionality

3. **Sound Effects**
   - Don't rely solely on audio for feedback
   - Maintain existing visual feedback (checkmarks, colors)
   - Ensure quiz is fully functional without audio

### File Organization

```
src/
├── components/
│   ├── EmojiAnimation.tsx
│   ├── EmojiAnimation.test.tsx
│   ├── EmojiAnimation.property.test.tsx
│   ├── EmojiContainer.tsx
│   ├── EmojiContainer.test.tsx
│   ├── AudioControls.tsx
│   └── AudioControls.test.tsx
├── context/
│   ├── AudioContext.tsx
│   └── AudioContext.test.tsx
├── hooks/
│   ├── useAudioManager.ts
│   ├── useAudioManager.test.ts
│   ├── useEmojiManager.ts
│   └── useEmojiManager.test.ts
├── services/
│   ├── audio/
│   │   ├── AudioManager.ts
│   │   ├── AudioManager.test.ts
│   │   ├── AudioManager.property.test.ts
│   │   ├── MusicPlayer.ts
│   │   ├── MusicPlayer.test.ts
│   │   ├── MusicPlayer.property.test.ts
│   │   ├── SFXPlayer.ts
│   │   ├── SFXPlayer.test.ts
│   │   └── SFXPlayer.property.test.ts
│   └── emoji/
│       ├── EmojiManager.ts
│       ├── EmojiManager.test.ts
│       └── EmojiManager.property.test.ts
└── types/
    └── audio.types.ts
```

## Dependencies

### New Dependencies

- No new dependencies required (Web Audio API is native)
- Existing dependencies used:
  - `framer-motion`: For emoji animations
  - `react`: Core framework
  - `fast-check`: Property-based testing (already in project)

### Audio File Requirements

The implementation requires the following audio files to be provided by the user:

**Background Music** (public/data/sfx/background/):
- welcome-bg.mp3
- quiz-bg.mp3 (or custom files specified in quiz data)
- victory-bg.mp3

**Sound Effects** (public/data/sfx/effects/):
- correct-answer.mp3
- wrong-answer.mp3
- emoji-fly.mp3
- slide-transition.mp3

A README.md file will be created in public/data/sfx/ documenting the required files and their specifications.
