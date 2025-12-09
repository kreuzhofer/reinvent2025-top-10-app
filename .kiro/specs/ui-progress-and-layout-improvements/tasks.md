# Implementation Plan

- [x] 1. Create ProgressBar component
  - Create new ProgressBar component with fixed positioning at top of viewport
  - Implement progress calculation based on current/total slides
  - Add smooth width animation using Framer Motion
  - Apply thin height (3-4px) and full-width styling
  - Include ARIA attributes for accessibility
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.4, 2.5_

- [x] 1.1 Write property test for progress bar width calculation
  - **Property 1: Progress bar width reflects slide position**
  - **Validates: Requirements 1.5**

- [x] 1.2 Write unit tests for ProgressBar component
  - Test rendering with correct ARIA attributes
  - Test handling of zero total slides
  - Test capping progress at 100%
  - Test CSS classes and positioning
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.5_

- [x] 2. Update ScoreDisplay component to support trophy icon and conditional max points
  - Add `showTrophy` prop to ScoreDisplay component
  - Add `showMaxPoints` prop to control visibility of max points
  - Import Trophy icon from lucide-react
  - Render trophy icon when `showTrophy={true}`
  - Wrap trophy and score in bordered container when trophy is shown
  - Apply rounded border and padding styling
  - Update inline mode to conditionally show/hide max points
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 2.1 Write property test for score display updates
  - **Property 3: Score display updates with score changes**
  - **Validates: Requirements 4.3**

- [x] 2.2 Write property test for summary percentage calculation
  - **Property 4: Summary percentage calculation accuracy**
  - **Validates: Requirements 5.4**

- [x] 2.3 Write unit tests for ScoreDisplay updates
  - Test showing only current points when showMaxPoints={false}
  - Test showing both current and max when showMaxPoints={true}
  - Test trophy icon rendering when showTrophy={true}
  - Test bordered container styling with trophy
  - Test handling zero totalPossible
  - _Requirements: 4.1, 4.2, 5.1, 5.2, 9.1, 9.2, 9.3_

- [x] 3. Update AudioControls component for inline header placement
  - Add `inline` prop to AudioControls component
  - Create conditional styling based on inline mode
  - Apply header-appropriate button styling when inline={true}
  - Maintain existing fixed positioning styles when inline={false}
  - Ensure keyboard accessibility is preserved
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 3.1 Write property test for audio toggle behavior
  - **Property 5: Audio control state toggle**
  - **Validates: Requirements 6.4**

- [x] 3.2 Write property test for audio icon synchronization
  - **Property 6: Audio icon synchronization**
  - **Validates: Requirements 6.5**

- [x] 3.3 Write unit tests for AudioControls inline mode
  - Test inline styling application
  - Test toggle functionality
  - Test keyboard events
  - Test icon rendering based on mute state
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 4. Refactor Header component to integrate audio controls and remove slide counter
  - Remove `showProgress`, `currentSlide`, and `totalSlides` props
  - Add `showAudioControls` prop (default: true)
  - Remove slide counter rendering logic
  - Update right-side layout to show: Score (with trophy) | Audio Controls
  - Pass `showTrophy={true}` to ScoreDisplay
  - Pass `showMaxPoints={false}` to ScoreDisplay
  - Pass `inline={true}` to AudioControls
  - Adjust header positioning to top-1 (below progress bar)
  - Maintain responsive gap spacing
  - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3_

- [x] 4.1 Write property test for header responsive layout
  - **Property 7: Header responsive layout integrity**
  - **Validates: Requirements 7.4**

- [x] 4.2 Write property test for header element non-overlap
  - **Property 8: Header element non-overlap**
  - **Validates: Requirements 7.5**

- [x] 4.3 Write unit tests for Header refactoring
  - Test conditional rendering of score and audio controls
  - Test removal of slide counter
  - Test layout structure
  - Test responsive spacing
  - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3, 8.3_

- [x] 5. Update ContentSlide to use ProgressBar and new Header
  - Add ProgressBar component before Header
  - Conditionally render ProgressBar based on showProgress prop
  - Update Header usage to remove slide counter props
  - Pass showScore and showAudioControls to Header
  - Ensure proper z-index layering (ProgressBar z-50, Header z-40)
  - _Requirements: 1.1, 3.3, 3.5_

- [x] 5.1 Write property test for progress bar visibility across slide types
  - **Property 2: Progress bar visibility maintained across slide types**
  - **Validates: Requirements 3.5**

- [x] 5.2 Write integration tests for ContentSlide updates
  - Test ProgressBar renders when showProgress={true}
  - Test ProgressBar doesn't render when showProgress={false}
  - Test Header integration
  - _Requirements: 1.1, 3.3, 3.5_

- [x] 6. Update QuizSlide to use ProgressBar and new Header
  - Add ProgressBar component before Header
  - Conditionally render ProgressBar based on showProgress prop
  - Update Header usage to remove slide counter props
  - Pass showScore and showAudioControls to Header
  - Ensure proper z-index layering
  - _Requirements: 1.2, 3.3, 3.5_

- [x] 6.1 Write integration tests for QuizSlide updates
  - Test ProgressBar renders when showProgress={true}
  - Test ProgressBar doesn't render when showProgress={false}
  - Test Header integration
  - _Requirements: 1.2, 3.3, 3.5_

- [x] 7. Update WelcomeScreen to ensure no ProgressBar
  - Verify WelcomeScreen does not render ProgressBar
  - Ensure Header is rendered without score display
  - _Requirements: 3.1, 4.4_

- [x] 7.1 Write integration tests for WelcomeScreen
  - Test ProgressBar is not rendered
  - Test score is not displayed
  - _Requirements: 3.1, 4.4_

- [x] 8. Update SummaryScreen to show max points and ensure no ProgressBar
  - Verify SummaryScreen does not render ProgressBar
  - Ensure final score display shows both current and max points
  - Verify percentage calculation is displayed
  - Update Header to not show score in header (score shown in main content)
  - _Requirements: 3.2, 3.4, 5.1, 5.2, 5.3, 5.4_

- [x] 8.1 Write integration tests for SummaryScreen
  - Test ProgressBar is not rendered
  - Test max points are displayed
  - Test percentage is calculated correctly
  - _Requirements: 3.2, 5.1, 5.2, 5.3, 5.4_

- [x] 9. Remove fixed AudioControls from App.tsx
  - Remove the fixed AudioControls component from App.tsx
  - Verify AudioControls are now only rendered via Header component
  - Clean up any related imports if no longer needed
  - _Requirements: 6.1, 8.1_

- [x] 10. Checkpoint - Ensure all tests pass for progress bar and header changes
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Create VideoBlock component and utility functions
  - Create new VideoBlock component
  - Implement video rendering with HTML5 video element
  - Add support for autoplay, loop, and poster (preview) attributes
  - Apply size classes (small, medium, large, full) matching ImageBlock
  - Create resolveVideoPath utility function
  - Handle video load errors with fallback to preview image
  - Add optional caption support
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 11.1 Write property test for video autoplay behavior
  - **Property 9: Video autoplay behavior**
  - **Validates: Requirements 10.2**

- [ ] 11.2 Write property test for video loop behavior
  - **Property 10: Video loop behavior**
  - **Validates: Requirements 10.3**

- [ ] 11.3 Write property test for video size consistency
  - **Property 11: Video size consistency**
  - **Validates: Requirements 10.6**

- [ ] 11.4 Write unit tests for VideoBlock component
  - Test video element rendering with correct src
  - Test size class application
  - Test preview image as poster
  - Test error handling and fallback
  - Test autoplay and loop attributes
  - Test caption rendering
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 12. Create LinkBlock component
  - Create new LinkBlock component
  - Implement anchor element with href from url prop
  - Add support for button and text styles
  - Handle newTab prop (target and rel attributes)
  - Show external link icon when opening in new tab
  - Apply re:Invent brand styling for button style
  - Apply inline text styling with hover underline for text style
  - Add Framer Motion animations for button style
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [ ] 12.1 Write property test for link new tab behavior
  - **Property 12: Link new tab behavior**
  - **Validates: Requirements 11.4**

- [ ] 12.2 Write property test for link style consistency
  - **Property 13: Link style consistency**
  - **Validates: Requirements 11.6, 11.7**

- [ ] 12.3 Write unit tests for LinkBlock component
  - Test anchor element with correct href
  - Test button and text styling
  - Test target and rel attributes for new tab
  - Test external link icon rendering
  - Test keyboard navigation
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [ ] 13. Update quiz.types.ts to include VideoBlock and LinkBlock types
  - Add VideoBlock interface definition
  - Add LinkBlock interface definition
  - Update ContentBlock union type to include VideoBlock and LinkBlock
  - _Requirements: 10.1, 11.1_

- [ ] 14. Update ContentSlide to render VideoBlock and LinkBlock
  - Add VideoBlock case to ContentBlockRenderer switch statement
  - Add LinkBlock case to ContentBlockRenderer switch statement
  - Import VideoBlock and LinkBlock components
  - _Requirements: 10.1, 11.1_

- [ ] 14.1 Write integration tests for new content blocks
  - Test ContentSlide renders VideoBlock correctly
  - Test ContentSlide renders LinkBlock correctly
  - Test integration with existing content blocks
  - _Requirements: 10.1, 11.1_

- [ ] 15. Create public/data/video directory and README
  - Create public/data/video directory for video files
  - Add README.md explaining video file requirements and usage
  - Document supported video formats (mp4, webm)
  - _Requirements: 10.5_

- [ ] 16. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
