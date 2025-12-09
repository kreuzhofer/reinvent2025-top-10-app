# Design Document: Quiz Timing and Scoring Improvements

## Overview

This design document outlines improvements to the quiz timing and scoring system for the AWS re:Invent quiz application. The enhancements create a more balanced and fair scoring mechanism through:

1. **Minimum Point Threshold**: Ensuring correct answers during countdown receive at least 10 points
2. **Dynamic Point Deduction**: Calculating deduction rate proportionally based on question parameters
3. **Pre-Countdown Delay**: Providing a 1-second reading period before the countdown begins
4. **Countdown Audio Feedback**: Playing a tick sound during the countdown without interfering with other audio

These improvements will make the quiz experience more engaging and fair while maintaining the time-pressure element that makes the quiz challenging.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Quiz Application                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  QuizTimer       │         │  ScoreContext    │          │
│  │  Component       │────────▶│                  │          │
│  ├──────────────────┤         ├──────────────────┤          │
│  │ - Pre-countdown  │         │ - Score calc     │          │
│  │   delay (3s)     │         │ - Min threshold  │          │
│  │ - Countdown      │         │ - Dynamic rate   │          │
│  │ - Tick audio     │         │                  │          │
│  └────────┬─────────┘         └──────────────────┘          │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  AudioManager    │         │  QuizSlide       │          │
│  │                  │◀────────│  Component       │          │
│  ├──────────────────┤         ├──────────────────┤          │
│  │ - Tick SFX       │         │ - Answer logic   │          │
│  │ - Concurrent     │         │ - Timer control  │          │
│  │   playback       │         │                  │          │
│  └──────────────────┘         └──────────────────┘          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
Quiz Question Displayed
        │
        ▼
┌───────────────────┐
│   QuizTimer       │
│   Mounted         │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Pre-Countdown     │
│ Delay (1s)        │
│ - Show base pts   │
│ - No tick sound   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Countdown Starts  │
│ - Play tick.mp3   │
│ - Deduct points   │
└────────┬──────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌────────────────┐    ┌─────────────────┐
│ User Answers   │    │  Timer Expires  │
│ - Stop tick    │    │  - Stop tick    │
│ - Calc points  │    │  - Award 0 pts  │
└────────────────┘    └─────────────────┘
```

## Components and Interfaces

### 1. Enhanced ScoreContext

The ScoreContext will be updated with a new scoring calculation function that implements the minimum threshold and dynamic deduction rate.

```typescript
interface ScoreContextType {
  score: number;
  totalPossible: number;
  addPoints: (points: number) => void;
  addPossiblePoints: (points: number) => void;
  setTotalPossible: (points: number) => void;
  resetScore: () => void;
  
  // NEW: Enhanced scoring calculation
  calculateTimeAdjustedPoints: (
    basePoints: number,
    elapsedSeconds: number,
    timeLimit: number
  ) => number;
}
```

#### Scoring Calculation Logic

```typescript
function calculateTimeAdjustedPoints(
  basePoints: number,
  elapsedSeconds: number,
  timeLimit: number
): number {
  // If time has expired, award 0 points
  if (elapsedSeconds >= timeLimit) {
    return 0;
  }
  
  // Calculate dynamic deduction rate (rounded down)
  const deductionRate = Math.floor(basePoints / timeLimit);
  
  // Calculate adjusted points
  const adjustedPoints = basePoints - (deductionRate * elapsedSeconds);
  
  // Apply minimum threshold of 10 points during countdown
  const finalPoints = Math.max(10, adjustedPoints);
  
  return Math.round(finalPoints);
}
```

### 2. Enhanced QuizTimer Component

The QuizTimer component will be updated to implement the pre-countdown delay and tick sound playback.

```typescript
interface QuizTimerProps {
  basePoints: number;
  onTimeout: () => void;
  onTick: (elapsedSeconds: number) => void;
  timeLimit?: number;
}

interface QuizTimerState {
  phase: 'pre-countdown' | 'countdown' | 'expired';
  elapsedSeconds: number;
  preCountdownRemaining: number;
}

const QuizTimer: React.FC<QuizTimerProps> = ({
  basePoints,
  onTimeout,
  onTick,
  timeLimit = 10
}) => {
  const [phase, setPhase] = useState<'pre-countdown' | 'countdown' | 'expired'>('pre-countdown');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [preCountdownRemaining, setPreCountdownRemaining] = useState(1);
  const { playSFX, audioManager } = useAudioManager();
  const tickSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Pre-countdown delay logic
  useEffect(() => {
    if (phase === 'pre-countdown') {
      const preCountdownInterval = setInterval(() => {
        setPreCountdownRemaining(prev => {
          if (prev <= 1) {
            setPhase('countdown');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(preCountdownInterval);
    }
  }, [phase]);
  
  // Countdown logic
  useEffect(() => {
    if (phase === 'countdown') {
      // Start tick sound
      startTickSound();
      
      const countdownInterval = setInterval(() => {
        setElapsedSeconds(prev => {
          const newElapsed = prev + 1;
          onTick(newElapsed);
          
          if (newElapsed >= timeLimit) {
            setPhase('expired');
            stopTickSound();
            onTimeout();
          }
          
          return newElapsed;
        });
      }, 1000);
      
      return () => {
        clearInterval(countdownInterval);
        stopTickSound();
      };
    }
  }, [phase, timeLimit, onTimeout, onTick]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTickSound();
    };
  }, []);
  
  const startTickSound = () => {
    // Play tick sound using audio manager
    // Implementation will use looping audio or repeated playback
  };
  
  const stopTickSound = () => {
    // Stop tick sound playback
  };
  
  // ... render logic
};
```

### 3. Tick Sound Playback Strategy

The tick sound will be implemented using one of two approaches:

**Option A: Looping Audio Element**
```typescript
class TickSoundPlayer {
  private audio: HTMLAudioElement | null = null;
  
  start(): void {
    this.audio = new Audio('/data/sfx/effects/tick.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.3; // Lower volume to not overpower other audio
    this.audio.play().catch(err => console.warn('Tick sound failed:', err));
  }
  
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
  }
}
```

**Option B: Web Audio API with Looping Buffer**
```typescript
class TickSoundPlayer {
  private audioContext: AudioContext;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode;
  
  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 0.3;
    this.gainNode.connect(audioContext.destination);
  }
  
  async start(): Promise<void> {
    const response = await fetch('/data/sfx/effects/tick.mp3');
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = audioBuffer;
    this.source.loop = true;
    this.source.connect(this.gainNode);
    this.source.start(0);
  }
  
  stop(): void {
    if (this.source) {
      this.source.stop();
      this.source.disconnect();
      this.source = null;
    }
  }
}
```

**Recommendation**: Use Option A (HTML Audio Element) for simplicity and to avoid conflicts with the existing Web Audio API usage in AudioManager. The tick sound will run independently and won't interfere with background music or sound effects.

### 4. Enhanced QuizSlide Component

The QuizSlide component will be updated to:
- Pass the timeLimit to the scoring calculation
- Stop the tick sound when user answers or navigates away
- Handle the new scoring calculation parameters

```typescript
const QuizSlide: React.FC<QuizSlideProps> = ({ slide, onNext, ... }) => {
  const { calculateTimeAdjustedPoints } = useScore();
  const timerRef = useRef<{ stopTick: () => void } | null>(null);
  
  const handleAnswerSelect = (index: number) => {
    // Stop tick sound immediately
    if (timerRef.current) {
      timerRef.current.stopTick();
    }
    
    const isCorrect = index === correctIndex;
    
    if (isCorrect) {
      // Use new scoring calculation with timeLimit
      const pointsAwarded = calculateTimeAdjustedPoints(
        slide.points,
        elapsedSeconds,
        slide.timeLimit || 10
      );
      addPoints(pointsAwarded);
    }
    
    // ... rest of answer handling
  };
  
  // Cleanup on navigation
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        timerRef.current.stopTick();
      }
    };
  }, []);
  
  // ... rest of component
};
```

## Data Models

### Extended Quiz Types

```typescript
// No changes needed to existing types
// The timeLimit property already exists on QuizSlide
interface QuizSlide {
  type: 'quiz';
  id: string;
  question: string;
  choices: QuizChoice[];
  correctAnswerIndex: number;
  explanation?: string;
  funFact?: string;
  points: number;
  timeLimit?: number; // Already exists, defaults to 10
  backgroundMusic?: string;
}
```

### Scoring Constants

```typescript
const SCORING_CONFIG = {
  MIN_POINTS_THRESHOLD: 10,
  PRE_COUNTDOWN_DELAY: 1, // seconds
  DEFAULT_TIME_LIMIT: 10, // seconds
  TICK_SOUND_VOLUME: 0.3, // 30% volume to not overpower other audio
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties are redundant and can be consolidated:
- Properties 1.1 and 1.3 test the same minimum threshold behavior
- Properties 2.1 and 2.2 test the same deduction rate calculation
- Properties 3.2 and 3.3 test the same pre-countdown behavior
- Properties 5.1 and 5.2 test the same navigation cleanup
- Properties 1.1, 1.3, 6.3 all test minimum threshold (redundant)
- Properties 2.3 and 6.4 test deduction rate usage (redundant)

### Scoring Calculation Properties

**Property 1: Minimum points threshold during countdown**
*For any* base points value, time limit, and elapsed seconds where elapsed < timeLimit, the calculated points should be at least 10
**Validates: Requirements 1.1, 1.3, 6.3**

**Property 2: Dynamic deduction rate calculation**
*For any* base points and time limit, the deduction rate should equal floor(basePoints / timeLimit)
**Validates: Requirements 2.1, 2.2**

**Property 3: Points decrease by deduction rate**
*For any* base points, time limit, and two elapsed times t1 and t2 where t1 < t2 < timeLimit, the difference in calculated points should equal deductionRate * (t2 - t1), subject to the minimum threshold
**Validates: Requirements 2.3, 6.4**

### Timer Behavior Properties

**Property 4: Pre-countdown delay duration**
*For any* quiz question display, the countdown should not start for exactly 1 second
**Validates: Requirements 3.1, 3.5**

**Property 5: Pre-countdown points display**
*For any* time during the pre-countdown delay, the displayed points should equal the base points value
**Validates: Requirements 3.2, 3.3**

**Property 6: Pre-countdown tick sound silence**
*For any* time during the pre-countdown delay, the tick sound should not be playing
**Validates: Requirements 3.4**

**Property 7: Countdown tick sound playback**
*For any* time during the countdown phase (after pre-countdown delay), the tick sound should be playing
**Validates: Requirements 4.1**

**Property 8: Tick sound audio isolation**
*For any* time when the tick sound is playing, background music and other sound effects should continue playing unaffected
**Validates: Requirements 4.2, 4.3**

### Cleanup Properties

**Property 9: Tick sound stops on timeout**
*For any* quiz question where the countdown reaches zero, the tick sound should stop playing
**Validates: Requirements 4.4**

**Property 10: Tick sound stops on answer**
*For any* quiz question where the user selects an answer, the tick sound should stop playing immediately
**Validates: Requirements 4.5**

**Property 11: Tick sound stops on navigation**
*For any* navigation event (next slide, previous slide, or component unmount), the tick sound should stop playing
**Validates: Requirements 5.1, 5.2, 5.3**

**Property 12: Tick sound cleanup isolation**
*For any* tick sound stop event, other audio playback should continue unaffected
**Validates: Requirements 5.4, 5.5**

### Edge Cases and Examples

**Example 1: Last second answer**
When elapsed = timeLimit - 1, calculated points should equal exactly 10
**Validates: Requirements 1.4**

**Example 2: Expired timer**
When elapsed >= timeLimit, calculated points should equal 0
**Validates: Requirements 1.2**

**Example 3: 100 points, 15 seconds**
When basePoints = 100 and timeLimit = 15, deduction rate should equal 6 (floor(100/15) = floor(6.66) = 6)
**Validates: Requirements 2.4**

**Example 4: 50 points, 10 seconds**
When basePoints = 50 and timeLimit = 10, deduction rate should equal 5 (floor(50/10) = 5)
**Validates: Requirements 2.5**

**Example 5: Function signature**
The calculateTimeAdjustedPoints function should accept three parameters: basePoints, elapsedSeconds, and timeLimit
**Validates: Requirements 6.2**

## Error Handling

### Timer Errors

1. **Pre-Countdown Interval Failure**: If the pre-countdown interval fails, immediately start the countdown to avoid blocking the quiz
2. **Countdown Interval Failure**: If the countdown interval fails, trigger timeout immediately to prevent the quiz from hanging
3. **Tick Sound Playback Failure**: Log the error but continue the quiz without audio feedback

### Scoring Errors

1. **Invalid Parameters**: If basePoints, elapsedSeconds, or timeLimit are invalid (negative, NaN, etc.), return 0 points and log an error
2. **Calculation Overflow**: Ensure all calculations use safe integer operations to prevent overflow
3. **Division by Zero**: If timeLimit is 0, return basePoints (no deduction)

### Audio Errors

1. **Tick Sound Load Failure**: If tick.mp3 fails to load, continue the quiz without the tick sound
2. **Audio Context Issues**: If audio playback fails, log the error but don't block the quiz
3. **Concurrent Playback Conflicts**: Ensure tick sound uses a separate audio channel to avoid conflicts

### Error Logging

All errors should be logged with descriptive messages:
- `[QuizTimer] Pre-countdown interval failed: ${error.message}`
- `[ScoreContext] Invalid scoring parameters: basePoints=${basePoints}, elapsed=${elapsedSeconds}, limit=${timeLimit}`
- `[TickSound] Failed to play tick sound: ${error.message}`

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

1. **Scoring Calculation Tests**
   - Test minimum threshold enforcement (10 points)
   - Test zero points after timeout
   - Test specific examples (100/15, 50/10)
   - Test edge cases (last second, first second)
   - Test invalid inputs (negative values, NaN)

2. **Timer Component Tests**
   - Test pre-countdown delay (1 second)
   - Test countdown start after delay
   - Test tick sound starts with countdown
   - Test tick sound stops on answer/timeout/navigation
   - Test cleanup on unmount

3. **Integration Tests**
   - Test QuizSlide with new scoring calculation
   - Test timer and scoring interaction
   - Test audio isolation (tick + background music)

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using the **fast-check** library. Each test will run a minimum of 100 iterations.

1. **Scoring Properties**
   - Property 1: Minimum threshold (Requirements 1.1, 1.3, 6.3)
   - Property 2: Deduction rate calculation (Requirements 2.1, 2.2)
   - Property 3: Points decrease rate (Requirements 2.3, 6.4)

2. **Timer Properties**
   - Property 4: Pre-countdown delay (Requirements 3.1, 3.5)
   - Property 5: Pre-countdown points (Requirements 3.2, 3.3)
   - Property 6: Pre-countdown silence (Requirements 3.4)
   - Property 7: Countdown tick sound (Requirements 4.1)
   - Property 8: Audio isolation (Requirements 4.2, 4.3)

3. **Cleanup Properties**
   - Property 9: Timeout cleanup (Requirements 4.4)
   - Property 10: Answer cleanup (Requirements 4.5)
   - Property 11: Navigation cleanup (Requirements 5.1, 5.2, 5.3)
   - Property 12: Cleanup isolation (Requirements 5.4, 5.5)

### Testing Requirements

- All property-based tests MUST be tagged with: `// Feature: quiz-timing-scoring-improvements, Property {number}: {property_text}`
- Each correctness property MUST be implemented by a SINGLE property-based test
- Tests MUST run a minimum of 100 iterations
- Tests SHOULD NOT use mocks where possible
- Tests MUST validate real functionality

## Implementation Notes

### Performance Considerations

1. **Timer Precision**: Use `setInterval` with 1-second intervals for simplicity; sub-second precision is not required
2. **Audio Performance**: Use HTML Audio Element for tick sound to avoid Web Audio API overhead
3. **State Updates**: Minimize re-renders by batching state updates where possible
4. **Memory Management**: Clean up intervals and audio resources on unmount

### Browser Compatibility

1. **Audio Playback**: HTML Audio Element is universally supported
2. **Timer APIs**: `setInterval` and `clearInterval` are universally supported
3. **Math Operations**: `Math.floor` and `Math.max` are universally supported

### Accessibility Considerations

1. **Visual Feedback**: Maintain visual countdown display for users who can't hear the tick sound
2. **Screen Readers**: Announce countdown milestones (e.g., "5 seconds remaining")
3. **Reduced Motion**: Respect `prefers-reduced-motion` for any visual countdown animations
4. **Audio Controls**: Ensure mute button affects tick sound as well

### Migration Strategy

1. **Backward Compatibility**: The new scoring calculation is backward compatible; existing quiz data doesn't need changes
2. **Default Values**: Use sensible defaults (timeLimit = 10) for questions without explicit time limits
3. **Gradual Rollout**: The tick sound can be disabled via a feature flag if needed
4. **Testing**: Thoroughly test with existing quiz data to ensure no regressions

### File Organization

```
src/
├── components/
│   ├── QuizTimer.tsx (UPDATE)
│   ├── QuizTimer.test.tsx (UPDATE)
│   ├── QuizTimer.property.test.tsx (NEW)
│   ├── QuizSlide.tsx (UPDATE)
│   ├── QuizSlide.test.tsx (UPDATE)
│   └── QuizSlide.property.test.tsx (UPDATE)
├── context/
│   ├── ScoreContext.tsx (UPDATE)
│   ├── ScoreContext.test.tsx (UPDATE)
│   └── ScoreContext.property.test.tsx (UPDATE)
├── services/
│   └── audio/
│       ├── TickSoundPlayer.ts (NEW)
│       ├── TickSoundPlayer.test.ts (NEW)
│       └── TickSoundPlayer.property.test.tsx (NEW)
└── types/
    └── quiz.types.ts (no changes needed)
```

## Dependencies

### Existing Dependencies

- `react`: Core framework
- `framer-motion`: For animations (already used)
- `fast-check`: Property-based testing (already in project)

### New Dependencies

- None required; all functionality uses native browser APIs

### Audio File Requirements

The implementation requires one new audio file:

**Sound Effect** (public/data/sfx/effects/):
- tick.mp3 (looping tick sound for countdown)

The tick sound should be:
- Short duration (0.5-1 second)
- Subtle and not overpowering
- Loopable without audible gaps
- Compressed for fast loading (< 50KB)
