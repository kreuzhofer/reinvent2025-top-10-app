# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Initialize Vite + React + TypeScript project
  - Install dependencies: react-router-dom, tailwindcss, framer-motion, lucide-react, fast-check, vitest, @testing-library/react
  - Configure Tailwind with re:Invent brand colors
  - Set up directory structure (components, context, hooks, types, utils, data)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 2. Define TypeScript interfaces and types
  - Create quiz.types.ts with all data model interfaces (QuizData, Slide, ContentSlide, QuizSlide, ContentBlock types, QuizChoice)
  - Add new content block interfaces: CalloutBlock, QuoteBlock, GridBlock, GridItem
  - Add QuizConfig and ResourcesConfig interfaces
  - Update QuizSlide to include optional funFact field
  - Update ListBlock to include optional title field
  - Update metadata to include optional author, date, tags fields
  - Define context types (ScoreContextType, QuizState)
  - Export all types for use across the application
  - _Requirements: 9.1, 13.1, 13.2, 13.3, 13.4, 14.1, 15.1_

- [x] 2.1 Write property test for JSON schema validation
  - **Property 8: JSON schema validation**
  - **Validates: Requirements 4.2**

- [x] 3. Create theme configuration and branding assets
  - Create theme.ts with re:Invent colors and fonts
  - Update tailwind.config.js with custom re:Invent color palette
  - Download and add re:Invent logo to public directory
  - Create CSS for Amazon Ember font fallback
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 4. Implement data loading and validation
  - Create useQuizData hook to load quiz-data.json
  - Implement JSON schema validation function
  - Handle loading states and errors
  - Create sample quiz-data.json with 2-3 slides for testing
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 4.1 Write unit test for data loading
  - Test successful JSON loading
  - Test error handling for missing file
  - _Requirements: 4.1, 4.3_

- [x] 5. Implement ScoreContext and state management
  - Create ScoreContext with score state and methods
  - Implement addPoints, addPossiblePoints, resetScore functions
  - Implement calculateTimeAdjustedPoints function (basePoints - basePoints * 0.10 * elapsedSeconds)
  - Provide context at App level
  - _Requirements: 3.1, 3.5, 11.3, 11.5_

- [x] 5.1 Write property test for time-adjusted point calculation
  - **Property 14: Time-adjusted point calculation**
  - **Validates: Requirements 11.3, 11.5**

- [x] 5.2 Write property test for score accumulation
  - **Property 3: Score accumulation correctness**
  - **Validates: Requirements 2.3, 11.5**

- [x] 5.3 Write property test for restart state reset
  - **Property 7: Restart state reset**
  - **Validates: Requirements 3.5**

- [x] 6. Create utility functions
  - Implement imageLoader.ts for resolving image paths from data/images
  - Implement iconMapper.ts for mapping icon names to components
  - Create helper for AWS service icon mapping
  - _Requirements: 4.4, 4.5, 5.1, 5.2, 5.3_

- [x] 6.1 Write property test for image path resolution
  - **Property 9: Image path resolution**
  - **Validates: Requirements 4.4, 5.1**

- [x] 6.2 Write property test for icon rendering mapping
  - **Property 10: Icon rendering mapping**
  - **Validates: Requirements 4.5, 5.2, 5.3**

- [x] 7. Build WelcomeScreen component
  - Create WelcomeScreen component with re:Invent logo
  - Add welcome message and start button
  - Implement keyboard shortcut (Enter key) to start
  - Style with re:Invent branding
  - _Requirements: 1.1, 6.3, 10.3_

- [x] 7.1 Write unit test for WelcomeScreen
  - Test logo and start button render
  - Test Enter key starts quiz
  - _Requirements: 1.1, 6.3, 10.3_

- [x] 8. Build ScoreDisplay component
  - Create persistent score indicator
  - Add animated score updates using Framer Motion
  - Position prominently in UI
  - _Requirements: 3.1, 8.3_

- [x] 8.1 Write property test for score visibility
  - **Property 6: Score visibility persistence**
  - **Validates: Requirements 3.1**

- [x] 9. Build ProgressIndicator component
  - Create component showing "X / Y" slide position
  - Add visual progress bar
  - Style with re:Invent colors
  - _Requirements: (implicit from design)_

- [x] 10. Build QuizTimer component
  - Create countdown timer component (10 seconds)
  - Display remaining time prominently
  - Show current point value based on elapsed time
  - Implement visual indicator (progress bar or circular timer)
  - Call onTimeout when timer reaches zero
  - Call onTick every second with elapsed time
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 10.1 Write property test for timer initialization
  - **Property 13: Timer initialization**
  - **Validates: Requirements 11.1**

- [x] 10.2 Write unit test for timer display
  - Test timer displays remaining time
  - _Requirements: 11.2_

- [x] 11. Build basic content block components
  - Create CalloutBox component for info/success/warning callouts
  - Create QuoteBlock component with quote text and author attribution
  - Create GridLayout component for multi-column layouts
  - Style components with re:Invent branding
  - _Requirements: 13.1, 13.2, 13.3_

- [x] 11.1 Write property test for callout block rendering
  - **Property 18: Callout block rendering**
  - **Validates: Requirements 13.1**

- [x] 11.2 Write property test for quote block rendering
  - **Property 19: Quote block rendering**
  - **Validates: Requirements 13.2**

- [x] 11.3 Write property test for grid layout rendering
  - **Property 20: Grid layout rendering**
  - **Validates: Requirements 13.3**

- [x] 11.4 Write unit tests for new content blocks
  - Test CalloutBox renders with correct style
  - Test QuoteBlock displays quote and author
  - Test GridLayout renders with specified columns
  - _Requirements: 13.1, 13.2, 13.3_

- [x] 12. Build ContentSlide component
  - Create component to render content slides
  - Implement rendering for all ContentBlock types (text, image, icon, list, stat, callout, quote, grid)
  - Handle list blocks with optional title
  - Add navigation button to proceed
  - Apply Framer Motion transitions
  - Handle image loading errors with placeholders
  - _Requirements: 1.3, 1.4, 1.5, 5.4, 8.1, 13.1, 13.2, 13.3, 13.4_

- [x] 12.1 Write property test for content block rendering
  - **Property 2: Content block rendering completeness**
  - **Validates: Requirements 1.3**

- [x] 12.2 Write property test for list title rendering
  - **Property 21: List title rendering**
  - **Validates: Requirements 13.4**

- [x] 12.3 Write unit test for image placeholder
  - Test placeholder displays when image fails to load
  - _Requirements: 5.4_

- [x] 13. Build FunFactDisplay component
  - Create component to display fun facts after quiz answers
  - Style to visually distinguish from main explanation
  - Handle optional fun facts gracefully
  - _Requirements: 14.1, 14.2, 14.3_

- [x] 13.1 Write property test for fun fact display
  - **Property 22: Fun fact display**
  - **Validates: Requirements 14.1**

- [x] 13.2 Write unit tests for fun fact component
  - Test fun fact displays when present
  - Test component works without fun fact
  - _Requirements: 14.1, 14.3_

- [x] 14. Build QuizSlide component
  - Create component to display quiz questions and choices
  - Integrate QuizTimer component
  - Integrate FunFactDisplay component
  - Implement answer selection with immediate feedback
  - Add skip button
  - Calculate time-adjusted points on answer
  - Handle timer timeout (highlight correct answer, award 0 points)
  - Disable choices after answer or timeout
  - Show explanation after answer
  - Show fun fact after explanation (if present)
  - Add next button after answer/timeout/skip
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 11.4, 11.5, 11.6, 14.1, 14.2, 14.3_

- [x] 14.1 Write property test for quiz slide rendering
  - **Property 1: Sequential slide progression** (Note: Actually testing quiz question and choices render)
  - **Validates: Requirements 2.1**

- [x] 14.2 Write property test for quiz feedback
  - **Property 5: Quiz feedback presence**
  - **Validates: Requirements 2.2**

- [x] 14.3 Write property test for incorrect answer scoring
  - **Property 4: Incorrect answer score invariance**
  - **Validates: Requirements 2.4**

- [x] 14.4 Write property test for timer expiration
  - **Property 15: Timer expiration behavior**
  - **Validates: Requirements 11.4**

- [x] 14.5 Write property test for skip button presence
  - **Property 16: Skip button presence**
  - **Validates: Requirements 2.6**

- [x] 14.6 Write property test for skip action scoring
  - **Property 17: Skip action scoring**
  - **Validates: Requirements 11.6**

- [x] 14.7 Write unit test for quiz slide components
  - Test question and choices render
  - Test skip button renders
  - Test next button appears after answer
  - _Requirements: 2.1, 2.5, 2.6_

- [ ] 15. Implement quiz configuration support
  - Load quizConfig from quiz data file
  - Implement answer choice shuffling when shuffleChoices is enabled
  - Show/hide progress bar based on showProgressBar setting
  - Enable/disable retry option based on allowRetry setting
  - Apply default configuration when quizConfig is not specified
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 15.1 Write property test for quiz choice shuffling
  - **Property 23: Quiz choice shuffling**
  - **Validates: Requirements 15.2**

- [ ] 15.2 Write unit tests for quiz configuration
  - Test progress bar displays when enabled
  - Test answer choices are shuffled when enabled
  - Test retry option appears when enabled
  - Test default config applies when not specified
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 16. Build SummaryScreen component
  - Create summary screen with final score display
  - Show score as number and percentage
  - Add restart button (conditional on allowRetry config)
  - Style with re:Invent branding and celebratory design
  - _Requirements: 3.2, 3.3, 3.4, 15.4_

- [ ] 16.1 Write unit tests for SummaryScreen
  - Test score displays as number and percentage
  - Test restart button renders
  - _Requirements: 3.2, 3.3, 3.4_

- [ ] 17. Implement quiz navigation and routing
  - Set up React Router with routes for welcome, quiz, and summary
  - Create quiz navigation state (currentSlideIndex, goToNext, restart)
  - Implement sequential slide progression logic
  - Handle transition from last slide to summary
  - _Requirements: 1.2, 9.3_

- [ ] 17.1 Write property test for sequential slide progression
  - **Property 1: Sequential slide progression**
  - **Validates: Requirements 1.2**

- [ ] 18. Implement keyboard navigation
  - Create useKeyboardNav hook
  - Implement right arrow key to advance slides
  - Implement number keys (1-N) to select quiz answers
  - Implement Enter key on welcome screen
  - Add keyboard shortcut help overlay (toggle with '?' key)
  - Ensure proper focus management
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 18.1 Write property test for keyboard navigation
  - **Property 11: Keyboard navigation advancement**
  - **Validates: Requirements 10.1**

- [ ] 18.2 Write property test for keyboard answer selection
  - **Property 12: Quiz keyboard answer selection**
  - **Validates: Requirements 10.2**

- [ ] 18.3 Write unit tests for keyboard shortcuts
  - Test Enter key on welcome screen
  - Test help overlay toggle
  - _Requirements: 10.3, 10.4_

- [ ] 19. Build main App component and integrate all pieces
  - Create App component with routing
  - Integrate ScoreContext provider
  - Load quiz data with useQuizData hook
  - Load and apply quizConfig settings
  - Handle loading and error states
  - Wire up all components (WelcomeScreen, ContentSlide, QuizSlide, SummaryScreen)
  - Add ScoreDisplay and ProgressIndicator to quiz layout (conditional on config)
  - _Requirements: 1.1, 4.1, 4.3, 15.1, 15.3_

- [ ] 20. Create comprehensive quiz data file
  - Use reinvent-2025-quiz-deck.json as the primary quiz data
  - Verify all content blocks are supported (text, images, icons, lists, stats, callouts, quotes, grids)
  - Ensure quizConfig section is present with all settings
  - Add any missing sample images to data/images directory
  - _Requirements: 4.1, 4.4, 13.1, 13.2, 13.3, 14.1, 15.1_

- [ ] 21. Implement responsive design
  - Add responsive Tailwind classes to all components including new content blocks
  - Test layouts at mobile (320px), tablet (768px), and desktop (1024px+) breakpoints
  - Ensure images and grids scale appropriately
  - Adjust font sizes and spacing for different screens
  - Test callouts, quotes, and grids on mobile devices
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 22. Add animations and polish
  - Implement slide transitions with Framer Motion
  - Add answer feedback animations
  - Add score update animations
  - Add fun fact reveal animation
  - Ensure animations complete within 500ms
  - Add reduced motion support
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 23. Accessibility improvements
  - Add ARIA labels to interactive elements including new content blocks
  - Ensure semantic HTML throughout (callouts, quotes, grids)
  - Add alt text to all images
  - Implement focus indicators with proper contrast
  - Add screen reader announcements for score changes and fun facts
  - Test with keyboard-only navigation
  - _Requirements: 10.5_

- [ ] 24. Final testing and bug fixes
  - Run all unit tests and property-based tests (now 23 properties)
  - Test all new content blocks (callouts, quotes, grids)
  - Test quiz configuration options (shuffle, progress bar, retry)
  - Test fun facts display
  - Perform manual testing of complete quiz flow with reinvent-2025-quiz-deck.json
  - Test on different browsers (Chrome, Firefox, Safari, Edge)
  - Fix any discovered bugs
  - Ensure all tests pass
  - _Requirements: All_

- [ ] 25. Build and deployment preparation
  - Run production build with Vite
  - Verify all assets are bundled correctly including new content blocks
  - Test production build locally with reinvent-2025-quiz-deck.json
  - Create deployment documentation
  - _Requirements: 9.5_

- [ ] 26. Create Docker deployment configuration
  - Create multi-stage Dockerfile with Node.js build stage and Nginx production stage
  - Create docker-compose.yml with frontend service configuration
  - Create Nginx configuration file for SPA routing and static file serving
  - Add .dockerignore file to exclude unnecessary files from build context
  - Test Docker build and container startup locally with full reinvent quiz data
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
