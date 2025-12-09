# Implementation Plan

- [x] 1. Update scoring calculation in ScoreContext
  - Modify the `calculateTimeAdjustedPoints` function to accept three parameters: basePoints, elapsedSeconds, and timeLimit
  - Implement dynamic deduction rate calculation: `Math.floor(basePoints / timeLimit)`
  - Apply minimum 10-point threshold during countdown (when elapsed < timeLimit)
  - Return 0 points when elapsed >= timeLimit
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 6.2, 6.3, 6.4_

- [x] 1.1 Write property test for minimum points threshold
  - **Property 1: Minimum points threshold during countdown**
  - **Validates: Requirements 1.1, 1.3, 6.3**

- [x] 1.2 Write property test for dynamic deduction rate
  - **Property 2: Dynamic deduction rate calculation**
  - **Validates: Requirements 2.1, 2.2**

- [x] 1.3 Write property test for points decrease rate
  - **Property 3: Points decrease by deduction rate**
  - **Validates: Requirements 2.3, 6.4**

- [x] 1.4 Write unit tests for scoring edge cases
  - Test last second answer (elapsed = timeLimit - 1, should return 10 points)
  - Test expired timer (elapsed >= timeLimit, should return 0 points)
  - Test specific examples: 100 points / 15 seconds = 6 deduction rate
  - Test specific examples: 50 points / 10 seconds = 5 deduction rate
  - _Requirements: 1.2, 1.4, 2.4, 2.5_

- [ ] 2. Create TickSoundPlayer service
  - Create new file `src/services/audio/TickSoundPlayer.ts`
  - Implement using HTML Audio Element with loop property
  - Add `start()` method to begin playing tick.mp3
  - Add `stop()` method to pause and reset audio
  - Set volume to 0.3 to not overpower other audio
  - Handle audio loading errors gracefully
  - _Requirements: 4.1, 4.2, 4.3, 5.4, 5.5_

- [ ] 2.1 Write property test for tick sound audio isolation
  - **Property 8: Tick sound audio isolation**
  - **Validates: Requirements 4.2, 4.3**

- [ ] 2.2 Write property test for tick sound cleanup isolation
  - **Property 12: Tick sound cleanup isolation**
  - **Validates: Requirements 5.4, 5.5**

- [ ] 2.3 Write unit tests for TickSoundPlayer
  - Test start() method initializes and plays audio
  - Test stop() method pauses and resets audio
  - Test error handling for missing audio file
  - Test volume is set correctly

- [ ] 3. Update QuizTimer component with pre-countdown delay
  - Add phase state: 'pre-countdown' | 'countdown' | 'expired'
  - Add preCountdownRemaining state initialized to 1
  - Implement pre-countdown interval that counts down from 1 to 0
  - Transition to 'countdown' phase when pre-countdown completes
  - Display base points during pre-countdown (no deduction)
  - Do not play tick sound during pre-countdown
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3.1 Write property test for pre-countdown delay duration
  - **Property 4: Pre-countdown delay duration**
  - **Validates: Requirements 3.1, 3.5**

- [ ] 3.2 Write property test for pre-countdown points display
  - **Property 5: Pre-countdown points display**
  - **Validates: Requirements 3.2, 3.3**

- [ ] 3.3 Write property test for pre-countdown tick sound silence
  - **Property 6: Pre-countdown tick sound silence**
  - **Validates: Requirements 3.4**

- [ ] 4. Integrate TickSoundPlayer into QuizTimer
  - Import TickSoundPlayer service
  - Create tickSoundPlayer instance ref
  - Start tick sound when countdown phase begins
  - Stop tick sound when timer expires
  - Stop tick sound on component unmount
  - Expose stopTick method via ref for parent component
  - _Requirements: 4.1, 4.4, 5.3_

- [ ] 4.1 Write property test for countdown tick sound playback
  - **Property 7: Countdown tick sound playback**
  - **Validates: Requirements 4.1**

- [ ] 4.2 Write property test for tick sound stops on timeout
  - **Property 9: Tick sound stops on timeout**
  - **Validates: Requirements 4.4**

- [ ] 4.3 Write unit tests for QuizTimer tick sound integration
  - Test tick sound starts when countdown begins
  - Test tick sound does not play during pre-countdown
  - Test tick sound stops on timeout
  - Test tick sound cleanup on unmount

- [ ] 5. Update QuizSlide component to use new scoring calculation
  - Update handleAnswerSelect to pass timeLimit to calculateTimeAdjustedPoints
  - Add ref to QuizTimer to access stopTick method
  - Call stopTick when user selects an answer
  - Call stopTick on component unmount (navigation cleanup)
  - Update onTick handler to work with new timing
  - _Requirements: 4.5, 5.1, 5.2, 5.3_

- [ ] 5.1 Write property test for tick sound stops on answer
  - **Property 10: Tick sound stops on answer**
  - **Validates: Requirements 4.5**

- [ ] 5.2 Write property test for tick sound stops on navigation
  - **Property 11: Tick sound stops on navigation**
  - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 5.3 Write unit tests for QuizSlide scoring integration
  - Test scoring calculation uses timeLimit parameter
  - Test tick sound stops when answer is selected
  - Test tick sound stops on navigation
  - Test integration with new scoring function

- [ ] 6. Add tick.mp3 audio file
  - Create or obtain tick sound effect file
  - Place file at `public/data/sfx/effects/tick.mp3`
  - Ensure file is loopable without audible gaps
  - Optimize file size (target < 50KB)
  - Test audio file loads and plays correctly
  - _Requirements: 4.1_

- [ ] 7. Update ScoreContext property tests
  - Update existing property tests to use new function signature
  - Ensure tests pass timeLimit parameter
  - Verify minimum threshold is tested
  - Verify dynamic deduction rate is tested
  - _Requirements: 1.1, 2.1, 2.3_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Manual testing and verification
  - Test quiz with various point values and time limits
  - Verify minimum 10 points is awarded during countdown
  - Verify 0 points after timeout
  - Verify 1-second pre-countdown delay works correctly
  - Verify tick sound plays during countdown
  - Verify tick sound stops on answer/timeout/navigation
  - Verify tick sound doesn't interfere with background music
  - Test with mute enabled/disabled
  - _Requirements: All_
