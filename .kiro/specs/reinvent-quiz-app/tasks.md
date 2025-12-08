# Implementation Plan

- [ ] 1. Set up project structure and dependencies
  - Initialize Vite + React + TypeScript project
  - Install dependencies: react-router-dom, tailwindcss, framer-motion, lucide-react, fast-check, vitest, @testing-library/react
  - Configure Tailwind with re:Invent brand colors
  - Set up directory structure (components, context, hooks, types, utils, data)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 2. Define TypeScript interfaces and types
  - Create quiz.types.ts with all data model interfaces (QuizData, Slide, ContentSlide, QuizSlide, ContentBlock types, QuizChoice)
  - Define context types (ScoreContextType, QuizState)
  - Export all types for use across the application
  - _Requirements: 9.1_

- [ ] 2.1 Write property test for JSON schema validation
  - **Property 8: JSON schema validation**
  - **Validates: Requirements 4.2**

- [ ] 3. Create theme configuration and branding assets
  - Create theme.ts with re:Invent colors and fonts
  - Update tailwind.config.js with custom re:Invent color palette
  - Download and add re:Invent logo to public directory
  - Create CSS for Amazon Ember font fallback
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 4. Implement data loading and validation
  - Create useQuizData hook to load quiz-data.json
  - Implement JSON schema validation function
  - Handle loading states and errors
  - Create sample quiz-data.json with 2-3 slides for testing
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 4.1 Write unit test for data loading
  - Test successful JSON loading
  - Test error handling for missing file
  - _Requirements: 4.1, 4.3_

- [ ] 5. Implement ScoreContext and state management
  - Create ScoreContext with score state and methods
  - Implement addPoints, addPossiblePoints, resetScore functions
  - Implement calculateTimeAdjustedPoints function (basePoints - basePoints * 0.10 * elapsedSeconds)
  - Provide context at App level
  - _Requirements: 3.1, 3.5, 11.3, 11.5_

- [ ] 5.1 Write property test for time-adjusted point calculation
  - **Property 14: Time-adjusted point calculation**
  - **Validates: Requirements 11.3, 11.5**

- [ ] 5.2 Write property test for score accumulation
  - **Property 3: Score accumulation correctness**
  - **Validates: Requirements 2.3, 11.5**

- [ ] 5.3 Write property test for restart state reset
  - **Property 7: Restart state reset**
  - **Validates: Requirements 3.5**

- [ ] 6. Create utility functions
  - Implement imageLoader.ts for resolving image paths from data/images
  - Implement iconMapper.ts for mapping icon names to components
  - Create helper for AWS service icon mapping
  - _Requirements: 4.4, 4.5, 5.1, 5.2, 5.3_

- [ ] 6.1 Write property test for image path resolution
  - **Property 9: Image path resolution**
  - **Validates: Requirements 4.4, 5.1**

- [ ] 6.2 Write property test for icon rendering mapping
  - **Property 10: Icon rendering mapping**
  - **Validates: Requirements 4.5, 5.2, 5.3**

- [ ] 7. Build WelcomeScreen component
  - Create WelcomeScreen component with re:Invent logo
  - Add welcome message and start button
  - Implement keyboard shortcut (Enter key) to start
  - Style with re:Invent branding
  - _Requirements: 1.1, 6.3, 10.3_

- [ ] 7.1 Write unit test for WelcomeScreen
  - Test logo and start button render
  - Test Enter key starts quiz
  - _Requirements: 1.1, 6.3, 10.3_

- [ ] 8. Build ScoreDisplay component
  - Create persistent score indicator
  - Add animated score updates using Framer Motion
  - Position prominently in UI
  - _Requirements: 3.1, 8.3_

- [ ] 8.1 Write property test for score visibility
  - **Property 6: Score visibility persistence**
  - **Validates: Requirements 3.1**

- [ ] 9. Build ProgressIndicator component
  - Create component showing "X / Y" slide position
  - Add visual progress bar
  - Style with re:Invent colors
  - _Requirements: (implicit from design)_

- [ ] 10. Build QuizTimer component
  - Create countdown timer component (10 seconds)
  - Display remaining time prominently
  - Show current point value based on elapsed time
  - Implement visual indicator (progress bar or circular timer)
  - Call onTimeout when timer reaches zero
  - Call onTick every second with elapsed time
  - _Requirements: 11.1, 11.2, 11.3_

- [ ] 10.1 Write property test for timer initialization
  - **Property 13: Timer initialization**
  - **Validates: Requirements 11.1**

- [ ] 10.2 Write unit test for timer display
  - Test timer displays remaining time
  - _Requirements: 11.2_

- [ ] 11. Build ContentSlide component
  - Create component to render content slides
  - Implement rendering for all ContentBlock types (text, image, icon, list, stat)
  - Add navigation button to proceed
  - Apply Framer Motion transitions
  - Handle image loading errors with placeholders
  - _Requirements: 1.3, 1.4, 1.5, 5.4, 8.1_

- [ ] 11.1 Write property test for content block rendering
  - **Property 2: Content block rendering completeness**
  - **Validates: Requirements 1.3**

- [ ] 11.2 Write property test for navigation control presence
  - **Property 4: Incorrect answer score invariance** (Note: This should be Property 4 from design - navigation control presence)
  - **Validates: Requirements 1.4**

- [ ] 11.3 Write unit test for image placeholder
  - Test placeholder displays when image fails to load
  - _Requirements: 5.4_

- [ ] 12. Build QuizSlide component
  - Create component to display quiz questions and choices
  - Integrate QuizTimer component
  - Implement answer selection with immediate feedback
  - Add skip button
  - Calculate time-adjusted points on answer
  - Handle timer timeout (highlight correct answer, award 0 points)
  - Disable choices after answer or timeout
  - Show explanation after answer
  - Add next button after answer/timeout/skip
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 11.4, 11.5, 11.6_

- [ ] 12.1 Write property test for quiz slide rendering
  - **Property 1: Sequential slide progression** (Note: Actually testing quiz question and choices render)
  - **Validates: Requirements 2.1**

- [ ] 12.2 Write property test for quiz feedback
  - **Property 5: Quiz feedback presence**
  - **Validates: Requirements 2.2**

- [ ] 12.3 Write property test for incorrect answer scoring
  - **Property 4: Incorrect answer score invariance**
  - **Validates: Requirements 2.4**

- [ ] 12.4 Write property test for timer expiration
  - **Property 15: Timer expiration behavior**
  - **Validates: Requirements 11.4**

- [ ] 12.5 Write property test for skip button presence
  - **Property 16: Skip button presence**
  - **Validates: Requirements 2.6**

- [ ] 12.6 Write property test for skip action scoring
  - **Property 17: Skip action scoring**
  - **Validates: Requirements 11.6**

- [ ] 12.7 Write unit test for quiz slide components
  - Test question and choices render
  - Test skip button renders
  - Test next button appears after answer
  - _Requirements: 2.1, 2.5, 2.6_

- [ ] 13. Build SummaryScreen component
  - Create summary screen with final score display
  - Show score as number and percentage
  - Add restart button
  - Style with re:Invent branding and celebratory design
  - _Requirements: 3.2, 3.3, 3.4_

- [ ] 13.1 Write unit tests for SummaryScreen
  - Test score displays as number and percentage
  - Test restart button renders
  - _Requirements: 3.2, 3.3, 3.4_

- [ ] 14. Implement quiz navigation and routing
  - Set up React Router with routes for welcome, quiz, and summary
  - Create quiz navigation state (currentSlideIndex, goToNext, restart)
  - Implement sequential slide progression logic
  - Handle transition from last slide to summary
  - _Requirements: 1.2, 9.3_

- [ ] 14.1 Write property test for sequential slide progression
  - **Property 1: Sequential slide progression**
  - **Validates: Requirements 1.2**

- [ ] 15. Implement keyboard navigation
  - Create useKeyboardNav hook
  - Implement right arrow key to advance slides
  - Implement number keys (1-N) to select quiz answers
  - Implement Enter key on welcome screen
  - Add keyboard shortcut help overlay (toggle with '?' key)
  - Ensure proper focus management
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 15.1 Write property test for keyboard navigation
  - **Property 11: Keyboard navigation advancement**
  - **Validates: Requirements 10.1**

- [ ] 15.2 Write property test for keyboard answer selection
  - **Property 12: Quiz keyboard answer selection**
  - **Validates: Requirements 10.2**

- [ ] 15.3 Write unit tests for keyboard shortcuts
  - Test Enter key on welcome screen
  - Test help overlay toggle
  - _Requirements: 10.3, 10.4_

- [ ] 16. Build main App component and integrate all pieces
  - Create App component with routing
  - Integrate ScoreContext provider
  - Load quiz data with useQuizData hook
  - Handle loading and error states
  - Wire up all components (WelcomeScreen, ContentSlide, QuizSlide, SummaryScreen)
  - Add ScoreDisplay and ProgressIndicator to quiz layout
  - _Requirements: 1.1, 4.1, 4.3_

- [ ] 17. Create comprehensive quiz data file
  - Create detailed quiz-data.json with multiple announcements and questions
  - Add variety of content blocks (text, images, icons, lists, stats)
  - Include at least 10-15 slides total
  - Add sample images to data/images directory
  - _Requirements: 4.1, 4.4_

- [ ] 18. Implement responsive design
  - Add responsive Tailwind classes to all components
  - Test layouts at mobile (320px), tablet (768px), and desktop (1024px+) breakpoints
  - Ensure images scale appropriately
  - Adjust font sizes and spacing for different screens
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 19. Add animations and polish
  - Implement slide transitions with Framer Motion
  - Add answer feedback animations
  - Add score update animations
  - Ensure animations complete within 500ms
  - Add reduced motion support
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 20. Accessibility improvements
  - Add ARIA labels to interactive elements
  - Ensure semantic HTML throughout
  - Add alt text to all images
  - Implement focus indicators with proper contrast
  - Add screen reader announcements for score changes
  - Test with keyboard-only navigation
  - _Requirements: 10.5_

- [ ] 21. Final testing and bug fixes
  - Run all unit tests and property-based tests
  - Perform manual testing of complete quiz flow
  - Test on different browsers (Chrome, Firefox, Safari, Edge)
  - Fix any discovered bugs
  - Ensure all tests pass
  - _Requirements: All_

- [ ] 22. Build and deployment preparation
  - Run production build with Vite
  - Verify all assets are bundled correctly
  - Test production build locally
  - Create deployment documentation
  - _Requirements: 9.5_

- [ ] 23. Create Docker deployment configuration
  - Create multi-stage Dockerfile with Node.js build stage and Nginx production stage
  - Create docker-compose.yml with frontend service configuration
  - Create Nginx configuration file for SPA routing and static file serving
  - Add .dockerignore file to exclude unnecessary files from build context
  - Test Docker build and container startup locally
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
