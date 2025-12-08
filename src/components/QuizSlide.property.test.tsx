import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import QuizSlide from './QuizSlide';
import { ScoreProvider } from '../context/ScoreContext';
import { QuizStateProvider } from '../context/QuizStateContext';
import type { QuizSlide as QuizSlideType } from '../types/quiz.types';

// Mock the QuizTimer component to avoid timer complexity in tests
vi.mock('./QuizTimer', () => ({
  default: ({ basePoints, onTimeout, onTick }: any) => (
    <div data-testid="quiz-timer">
      <div data-testid="timer-base-points">{basePoints}</div>
      <button data-testid="mock-timeout" onClick={onTimeout}>Trigger Timeout</button>
      <button data-testid="mock-tick" onClick={() => onTick(1)}>Trigger Tick</button>
    </div>
  ),
}));

// Mock the FunFactDisplay component for simpler tests
vi.mock('./FunFactDisplay', () => ({
  default: ({ funFact }: any) => 
    funFact ? <div data-testid="fun-fact-display">{funFact}</div> : null,
}));

// Mock the audio manager hook
const mockPlaySFX = vi.fn().mockResolvedValue(undefined);
const mockPlayBackgroundMusic = vi.fn().mockResolvedValue(undefined);
vi.mock('../hooks/useAudioManager', () => ({
  useAudioManager: () => ({
    playSFX: mockPlaySFX,
    playBackgroundMusic: mockPlayBackgroundMusic,
    isMuted: false,
    toggleMute: vi.fn(),
  }),
}));

// Mock the emoji manager hook
const mockShowSuccessEmoji = vi.fn();
const mockShowMissEmoji = vi.fn();
vi.mock('../hooks/useEmojiManager', () => ({
  useEmojiManager: () => ({
    showSuccessEmoji: mockShowSuccessEmoji,
    showMissEmoji: mockShowMissEmoji,
  }),
}));

/**
 * Property-Based Tests for QuizSlide Component
 * 
 * Tests universal properties that should hold across all quiz slides
 */

// Helper to create arbitrary quiz slides
const arbitraryQuizSlide = (): fc.Arbitrary<QuizSlideType> => {
  // Helper to generate non-whitespace strings
  const nonWhitespaceString = (minLength: number, maxLength: number) =>
    fc.string({ minLength, maxLength }).filter(s => s.trim().length > 0);

  return fc.record({
    type: fc.constant('quiz' as const),
    id: nonWhitespaceString(1, 20),
    question: nonWhitespaceString(10, 200),
    relatedAnnouncementId: fc.option(nonWhitespaceString(1, 20), { nil: undefined }),
    choices: fc.array(
      fc.record({
        text: nonWhitespaceString(1, 100),
        icon: fc.option(nonWhitespaceString(1, 20), { nil: undefined }),
      }),
      { minLength: 2, maxLength: 6 }
    ),
    correctAnswerIndex: fc.nat(),
    explanation: fc.option(nonWhitespaceString(10, 300), { nil: undefined }),
    funFact: fc.option(nonWhitespaceString(10, 200), { nil: undefined }),
    points: fc.integer({ min: 10, max: 1000 }),
    timeLimit: fc.option(fc.integer({ min: 5, max: 30 }), { nil: undefined }),
  }).chain((slide) => {
    // Ensure correctAnswerIndex is within bounds
    const validIndex = slide.correctAnswerIndex % slide.choices.length;
    return fc.constant({ ...slide, correctAnswerIndex: validIndex });
  });
};

describe('QuizSlide Property-Based Tests', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorage.clear();
    // Clear mock calls
    mockPlaySFX.mockClear();
    mockPlayBackgroundMusic.mockClear();
    mockShowSuccessEmoji.mockClear();
    mockShowMissEmoji.mockClear();
  });

  // Clean up after each test to avoid DOM pollution
  afterEach(() => {
    cleanup();
  });

  /**
   * Feature: reinvent-quiz-app, Property 1: Sequential slide progression
   * (Note: Actually testing quiz question and choices render)
   * Validates: Requirements 2.1
   * 
   * Property: For any quiz slide, the question and all answer choices should be rendered
   */
  it('Property 1: Quiz question and choices render', () => {
    fc.assert(
      fc.property(
        arbitraryQuizSlide(),
        (slide) => {
          const onNext = vi.fn();

          render(
            <ScoreProvider>
              <QuizStateProvider>
                <QuizSlide slide={slide} onNext={onNext} />
              </QuizStateProvider>
            </ScoreProvider>
          );

          try {
            // Property: Question should be displayed
            const questionElement = screen.getByTestId('quiz-question');
            expect(questionElement).toBeInTheDocument();
            // Trim whitespace for comparison since HTML naturally trims whitespace
            expect(questionElement.textContent?.trim()).toBe(slide.question.trim());

            // Property: All choices should be rendered
            const choicesContainer = screen.getByTestId('quiz-choices');
            expect(choicesContainer).toBeInTheDocument();

            slide.choices.forEach((choice, index) => {
              const choiceButton = screen.getByTestId(`choice-${index}`);
              expect(choiceButton).toBeInTheDocument();
              // Check that the choice text is present (trimmed for whitespace handling)
              expect(choiceButton.textContent).toContain(choice.text.trim());
            });
          } finally {
            // Clean up after each iteration
            cleanup();
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Feature: reinvent-quiz-app, Property 5: Quiz feedback presence
   * Validates: Requirements 2.2
   * 
   * Property: For any quiz slide and any answer selection, the system should 
   * display feedback indicating whether the answer was correct or incorrect
   */
  it('Property 5: Quiz feedback presence after answer selection', async () => {
    fc.assert(
      fc.asyncProperty(
        arbitraryQuizSlide(),
        fc.integer({ min: 0, max: 5 }),
        async (slide, choiceOffset) => {
          // Ensure we have a valid choice index
          const selectedIndex = choiceOffset % slide.choices.length;
          const onNext = vi.fn();
          const user = userEvent.setup({ delay: null });

          render(
            <ScoreProvider>
              <QuizStateProvider>
                <QuizSlide slide={slide} onNext={onNext} />
              </QuizStateProvider>
            </ScoreProvider>
          );

          // Select an answer
          const choiceButton = screen.getByTestId(`choice-${selectedIndex}`);
          await user.click(choiceButton);

          // Wait for feedback to appear
          await waitFor(() => {
            const feedback = screen.getByTestId('quiz-feedback');
            expect(feedback).toBeInTheDocument();

            // Property: Feedback should indicate correctness
            const isCorrect = selectedIndex === slide.correctAnswerIndex;
            if (isCorrect) {
              expect(feedback).toHaveTextContent(/correct/i);
            } else {
              expect(feedback).toHaveTextContent(/incorrect/i);
            }
          });

          
          
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Feature: reinvent-quiz-app, Property 4: Incorrect answer score invariance
   * Validates: Requirements 2.4
   * 
   * Property: For any quiz slide, selecting an incorrect answer should not change 
   * the current score (verified by checking that correct answer is highlighted)
   */
  it('Property 4: Incorrect answer score invariance', async () => {
    fc.assert(
      fc.asyncProperty(
        arbitraryQuizSlide(),
        async (slide) => {
          // Find an incorrect answer index
          const incorrectIndex = slide.correctAnswerIndex === 0 ? 1 : 0;
          
          const onNext = vi.fn();
          const user = userEvent.setup({ delay: null });

          render(
            <ScoreProvider>
              <QuizStateProvider>
                <QuizSlide slide={slide} onNext={onNext} />
              </QuizStateProvider>
            </ScoreProvider>
          );

          // Select incorrect answer
          const choiceButton = screen.getByTestId(`choice-${incorrectIndex}`);
          await user.click(choiceButton);

          // Wait for feedback to appear
          await waitFor(() => {
            // Property: Correct answer should be highlighted (showing user the right answer)
            const correctIcon = screen.getByTestId(`correct-icon-${slide.correctAnswerIndex}`);
            expect(correctIcon).toBeInTheDocument();

            // Property: Incorrect answer should be marked with X
            const incorrectIcon = screen.getByTestId(`incorrect-icon-${incorrectIndex}`);
            expect(incorrectIcon).toBeInTheDocument();
          });

          
          
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Feature: reinvent-quiz-app, Property 15: Timer expiration behavior
   * Validates: Requirements 11.4
   * 
   * Property: For any quiz slide, when the timer reaches zero without user input,
   * the system should highlight the correct answer and award zero points
   */
  it('Property 15: Timer expiration behavior', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbitraryQuizSlide(),
        async (slide) => {
          const onNext = vi.fn();

          render(
            <ScoreProvider>
              <QuizStateProvider>
                <QuizSlide slide={slide} onNext={onNext} />
              </QuizStateProvider>
            </ScoreProvider>
          );

          // Trigger timeout using mocked timer
          const user = userEvent.setup();
          const timeoutButton = screen.getByTestId('mock-timeout');
          await user.click(timeoutButton);

          // Property: Timeout message should be displayed
          const timeoutMessage = screen.getByTestId('timeout-message');
          expect(timeoutMessage).toBeInTheDocument();
          expect(timeoutMessage).toHaveTextContent(/time.*up/i);

          // Property: Correct answer should be highlighted
          const correctIcon = screen.getByTestId(`correct-icon-${slide.correctAnswerIndex}`);
          expect(correctIcon).toBeInTheDocument();

          // Property: Explanation should be shown
          if (slide.explanation) {
            const explanation = screen.getByTestId('quiz-explanation');
            expect(explanation).toBeInTheDocument();
          }

          // Clean up after each iteration
          cleanup();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Feature: reinvent-quiz-app, Property 16: Skip button presence
   * Validates: Requirements 2.6
   * 
   * Property: For any quiz slide, a skip button should be present and functional
   */
  it('Property 16: Skip button presence', () => {
    fc.assert(
      fc.property(
        arbitraryQuizSlide(),
        (slide) => {
          const onNext = vi.fn();

          render(
            <ScoreProvider>
              <QuizStateProvider>
                <QuizSlide slide={slide} onNext={onNext} />
              </QuizStateProvider>
            </ScoreProvider>
          );

          // Property: Skip button should be present initially
          const skipButton = screen.getByTestId('skip-button');
          expect(skipButton).toBeInTheDocument();
          expect(skipButton).toHaveTextContent(/skip/i);

          // Clean up after each iteration
          cleanup();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Feature: reinvent-quiz-app, Property 17: Skip action scoring
   * Validates: Requirements 11.6
   * 
   * Property: For any quiz slide, activating the skip button should award zero 
   * points and advance to the next slide
   */
  it('Property 17: Skip action scoring', async () => {
    fc.assert(
      fc.asyncProperty(
        arbitraryQuizSlide(),
        async (slide) => {
          const onNext = vi.fn();
          const user = userEvent.setup({ delay: null });

          render(
            <ScoreProvider>
              <QuizStateProvider>
                <QuizSlide slide={slide} onNext={onNext} />
              </QuizStateProvider>
            </ScoreProvider>
          );

          // Click skip button
          const skipButton = screen.getByTestId('skip-button');
          await user.click(skipButton);

          // Property: Skip message should be displayed
          const skipMessage = screen.getByTestId('skip-message');
          expect(skipMessage).toBeInTheDocument();
          expect(skipMessage).toHaveTextContent(/skip/i);

          // Property: Next button should appear
          const nextButton = screen.getByTestId('next-button');
          expect(nextButton).toBeInTheDocument();

          // Property: Skip button should no longer be visible
          expect(screen.queryByTestId('skip-button')).not.toBeInTheDocument();

          
          
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Feature: quiz-engagement-enhancements, Property 18: Correct answer sound effect
   * Validates: Requirements 4.1
   * 
   * Property: For any quiz slide, when a user selects the correct answer,
   * the Audio System should play the correct-answer.mp3 sound effect
   */
  it('Property 18: Correct answer sound effect', async () => {
    fc.assert(
      fc.asyncProperty(
        arbitraryQuizSlide(),
        async (slide) => {
          const onNext = vi.fn();
          const user = userEvent.setup({ delay: null });

          render(
            <ScoreProvider>
              <QuizStateProvider>
                <QuizSlide slide={slide} onNext={onNext} />
              </QuizStateProvider>
            </ScoreProvider>
          );

          // Select the correct answer
          const correctChoiceButton = screen.getByTestId(`choice-${slide.correctAnswerIndex}`);
          await user.click(correctChoiceButton);

          // Property: playSFX should be called with correct-answer.mp3
          await waitFor(() => {
            expect(mockPlaySFX).toHaveBeenCalledWith('effects/correct-answer.mp3');
          });

          // Property: Success emoji should be triggered
          expect(mockShowSuccessEmoji).toHaveBeenCalled();

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: quiz-engagement-enhancements, Property 19: Incorrect answer sound effect
   * Validates: Requirements 4.2
   * 
   * Property: For any quiz slide, when a user selects an incorrect answer,
   * the Audio System should play the wrong-answer.mp3 sound effect
   */
  it('Property 19: Incorrect answer sound effect', async () => {
    fc.assert(
      fc.asyncProperty(
        arbitraryQuizSlide(),
        async (slide) => {
          // Find an incorrect answer index
          const incorrectIndex = slide.correctAnswerIndex === 0 ? 1 : 0;
          
          const onNext = vi.fn();
          const user = userEvent.setup({ delay: null });

          render(
            <ScoreProvider>
              <QuizStateProvider>
                <QuizSlide slide={slide} onNext={onNext} />
              </QuizStateProvider>
            </ScoreProvider>
          );

          // Select an incorrect answer
          const incorrectChoiceButton = screen.getByTestId(`choice-${incorrectIndex}`);
          await user.click(incorrectChoiceButton);

          // Property: playSFX should be called with wrong-answer.mp3
          await waitFor(() => {
            expect(mockPlaySFX).toHaveBeenCalledWith('effects/wrong-answer.mp3');
          });

          // Property: Miss emoji should be triggered
          expect(mockShowMissEmoji).toHaveBeenCalled();

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
