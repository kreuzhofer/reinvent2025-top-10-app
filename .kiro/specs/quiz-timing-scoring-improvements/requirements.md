# Requirements Document

## Introduction

This specification defines improvements to the quiz timing and scoring system for the AWS re:Invent quiz application. The enhancements will create a more balanced scoring mechanism with a minimum point threshold, dynamic point deduction calculations, a pre-countdown delay, and integrated countdown audio feedback.

## Glossary

- **Quiz Application**: The AWS re:Invent quiz web application
- **Quiz Timer**: Component that displays countdown and manages time-based scoring
- **Base Points**: The maximum points available for a question (configured per question)
- **Minimum Points**: The minimum points awarded for a correct answer during the countdown (10 points)
- **Countdown Period**: The active timing period during which points decrease
- **Pre-Countdown Delay**: A 1-second waiting period before the countdown begins
- **Point Deduction Rate**: The amount of points deducted per second, calculated dynamically
- **Tick Sound**: Audio effect (tick.mp3) that plays during the countdown
- **Time Limit**: The duration of the countdown period in seconds (configured per question)

## Requirements

### Requirement 1

**User Story:** As a quiz taker, I want to receive a minimum of 10 points for correct answers during the countdown, so that I am still rewarded even if I take time to think.

#### Acceptance Criteria

1. WHEN a user answers correctly during the countdown period THEN the Quiz Application SHALL award a minimum of 10 points
2. WHEN the countdown timer reaches zero THEN the Quiz Application SHALL award 0 points for any subsequent answer
3. WHEN calculating time-adjusted points THEN the Quiz Application SHALL ensure the result is never less than 10 points during the countdown
4. WHEN the user answers at the last second of the countdown THEN the Quiz Application SHALL award exactly 10 points
5. WHEN the user skips a question THEN the Quiz Application SHALL award 0 points

### Requirement 2

**User Story:** As a quiz taker, I want the point deduction to be proportional to the question's time limit, so that scoring feels fair across questions with different durations.

#### Acceptance Criteria

1. WHEN calculating point deduction THEN the Quiz Application SHALL divide the base points by the time limit in seconds
2. WHEN the division result is not a whole number THEN the Quiz Application SHALL round down to the nearest integer
3. WHEN deducting points per second THEN the Quiz Application SHALL use the calculated deduction rate
4. WHEN a question has 100 base points and 15 seconds THEN the Quiz Application SHALL deduct 6 points per second (100/15 = 6.66, rounded down to 6)
5. WHEN a question has 50 base points and 10 seconds THEN the Quiz Application SHALL deduct 5 points per second (50/10 = 5)

### Requirement 3

**User Story:** As a quiz taker, I want a brief moment to read the question before the countdown starts, so that I have time to understand what is being asked.

#### Acceptance Criteria

1. WHEN a quiz question is displayed THEN the Quiz Application SHALL wait 1 second before starting the countdown
2. WHEN the pre-countdown delay is active THEN the Quiz Application SHALL display the full base points value
3. WHEN the pre-countdown delay is active THEN the Quiz Application SHALL not deduct any points
4. WHEN the pre-countdown delay is active THEN the Quiz Application SHALL not play the tick sound
5. WHEN the 1-second delay completes THEN the Quiz Application SHALL start the countdown timer

### Requirement 4

**User Story:** As a quiz taker, I want to hear a ticking sound during the countdown, so that I have audio feedback about the passing time.

#### Acceptance Criteria

1. WHEN the countdown timer starts THEN the Quiz Application SHALL play the tick.mp3 audio file
2. WHEN the tick sound plays THEN the Quiz Application SHALL not stop or pause any currently playing background music
3. WHEN the tick sound plays THEN the Quiz Application SHALL not stop or pause any other sound effects
4. WHEN the countdown timer reaches zero THEN the Quiz Application SHALL stop playing the tick sound
5. WHEN the user answers a question THEN the Quiz Application SHALL stop playing the tick sound immediately

### Requirement 5

**User Story:** As a quiz taker, I want the ticking sound to stop when I navigate away from a question, so that the sound doesn't continue playing inappropriately.

#### Acceptance Criteria

1. WHEN the user navigates to the next slide THEN the Quiz Application SHALL stop playing the tick sound
2. WHEN the user navigates to the previous slide THEN the Quiz Application SHALL stop playing the tick sound
3. WHEN the component unmounts THEN the Quiz Application SHALL stop playing the tick sound
4. WHEN the tick sound is stopped THEN the Quiz Application SHALL clean up any audio resources
5. WHEN the tick sound is stopped THEN the Quiz Application SHALL not affect other audio playback

### Requirement 6

**User Story:** As a developer, I want the scoring calculation to be centralized and testable, so that the logic is consistent and maintainable.

#### Acceptance Criteria

1. WHEN calculating time-adjusted points THEN the Quiz Application SHALL use a single centralized function
2. WHEN the centralized function is called THEN the Quiz Application SHALL accept base points, elapsed seconds, and time limit as parameters
3. WHEN the function calculates points THEN the Quiz Application SHALL apply the minimum 10-point threshold
4. WHEN the function calculates points THEN the Quiz Application SHALL use the dynamic deduction rate
5. WHEN the function is tested THEN the Quiz Application SHALL verify correct behavior across various input combinations
