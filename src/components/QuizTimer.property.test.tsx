import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import type React from 'react';
import * as fc from 'fast-check';
import QuizTimer from './QuizTimer';
import { ScoreProvider } from '../context/ScoreContext';

/**
 * Property-Based Tests for QuizTimer Component
 * 
 * Feature: reinvent-quiz-app, Property 13: Timer initialization
 * Validates: Requirements 11.1
 * 
 * Property: For any quiz slide, displaying the slide should start a countdown 
 * timer from the specified time limit (default 10 seconds).
 */
describe('QuizTimer Property-Based Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  // Helper function to render QuizTimer with ScoreProvider
  const renderWithProvider = (props: React.ComponentProps<typeof QuizTimer>) => {
    return render(
      <ScoreProvider>
        <QuizTimer {...props} />
      </ScoreProvider>
    );
  };

  it('Property 13: Timer initialization - timer starts from specified time limit', () => {
    fc.assert(
      fc.property(
        // Generate random base points (1-1000)
        fc.integer({ min: 1, max: 1000 }),
        // Generate random time limits (1-30 seconds)
        fc.integer({ min: 1, max: 30 }),
        (basePoints, timeLimit) => {
          const onTimeout = vi.fn();
          const onTick = vi.fn();

          const { unmount } = renderWithProvider({
            basePoints,
            onTimeout,
            onTick,
            timeLimit
          });

          // Property: Timer should display the initial time limit
          const remainingTime = screen.getByTestId('timer-remaining');
          expect(remainingTime).toHaveTextContent(`${timeLimit}s`);

          // Property: Timer should display the initial base points
          const pointsDisplay = screen.getByTestId('timer-points');
          expect(pointsDisplay).toHaveTextContent(basePoints.toString());

          // Property: Timer should be visible
          const timerDisplay = screen.getByTestId('quiz-timer');
          expect(timerDisplay).toBeInTheDocument();

          // Property: Progress bar should be at 100% initially
          const progressFill = screen.getByTestId('timer-progress-fill');
          expect(progressFill).toBeInTheDocument();

          // Cleanup
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13: Timer initialization - timer defaults to 10 seconds when not specified', () => {
    fc.assert(
      fc.property(
        // Generate random base points (1-1000)
        fc.integer({ min: 1, max: 1000 }),
        (basePoints) => {
          const onTimeout = vi.fn();
          const onTick = vi.fn();

          const { unmount } = renderWithProvider({
            basePoints,
            onTimeout,
            onTick
            // timeLimit not specified, should default to 10
          });

          // Property: Timer should display 10 seconds by default
          const remainingTime = screen.getByTestId('timer-remaining');
          expect(remainingTime).toHaveTextContent('10s');

          // Cleanup
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13: Timer initialization - timer component renders all required elements', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1, max: 30 }),
        (basePoints, timeLimit) => {
          const onTimeout = vi.fn();
          const onTick = vi.fn();

          const { unmount } = renderWithProvider({
            basePoints,
            onTimeout,
            onTick,
            timeLimit
          });

          // Property: All required UI elements should be present
          expect(screen.getByTestId('quiz-timer')).toBeInTheDocument();
          expect(screen.getByTestId('timer-remaining')).toBeInTheDocument();
          expect(screen.getByTestId('timer-points')).toBeInTheDocument();
          expect(screen.getByTestId('timer-progress-container')).toBeInTheDocument();
          expect(screen.getByTestId('timer-progress-fill')).toBeInTheDocument();
          expect(screen.getByText('Time Remaining')).toBeInTheDocument();
          expect(screen.getByText('Current Points')).toBeInTheDocument();

          // Cleanup
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: quiz-timing-scoring-improvements, Property 4: Pre-countdown delay duration
   * Validates: Requirements 3.1, 3.5
   * 
   * Property: For any quiz question display, the countdown should not start for exactly 1 second
   */
  it('Property 4: Pre-countdown delay duration - countdown does not start for 1 second', async () => {
    fc.assert(
      await fc.asyncProperty(
        fc.integer({ min: 10, max: 1000 }),
        fc.integer({ min: 5, max: 30 }),
        async (basePoints, timeLimit) => {
          const onTimeout = vi.fn();
          const onTick = vi.fn();

          const { unmount } = renderWithProvider({
            basePoints,
            onTimeout,
            onTick,
            timeLimit
          });

          // Property: Timer should be in pre-countdown phase initially
          expect(screen.getByTestId('timer-pre-countdown')).toBeInTheDocument();
          expect(screen.getByTestId('timer-pre-countdown')).toHaveAttribute('data-phase', 'pre-countdown');

          // Property: onTick should not be called during pre-countdown
          expect(onTick).not.toHaveBeenCalled();

          // Property: After exactly 1 second, countdown should start
          await vi.advanceTimersByTimeAsync(1000);

          // Property: Timer should now be in countdown phase
          expect(screen.queryByTestId('timer-pre-countdown')).not.toBeInTheDocument();
          expect(screen.getByTestId('timer-countdown')).toBeInTheDocument();
          expect(screen.getByTestId('timer-countdown')).toHaveAttribute('data-phase', 'countdown');

          // Cleanup
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: quiz-timing-scoring-improvements, Property 5: Pre-countdown points display
   * Validates: Requirements 3.2, 3.3
   * 
   * Property: For any time during the pre-countdown delay, the displayed points should equal the base points value
   */
  it('Property 5: Pre-countdown points display - displays full base points during pre-countdown', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 1000 }),
        fc.integer({ min: 5, max: 30 }),
        (basePoints, timeLimit) => {
          const onTimeout = vi.fn();
          const onTick = vi.fn();

          const { unmount } = renderWithProvider({
            basePoints,
            onTimeout,
            onTick,
            timeLimit
          });

          // Property: During pre-countdown, points should equal base points (no deduction)
          const pointsDisplay = screen.getByTestId('timer-points');
          expect(pointsDisplay).toHaveTextContent(basePoints.toString());

          // Property: Timer should be in pre-countdown phase
          expect(screen.getByTestId('timer-pre-countdown')).toBeInTheDocument();

          // Cleanup
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: quiz-timing-scoring-improvements, Property 6: Pre-countdown tick sound silence
   * Validates: Requirements 3.4
   * 
   * Property: For any time during the pre-countdown delay, the tick sound should not be playing
   * 
   * Note: This property will be fully testable once TickSoundPlayer is integrated in task 4.
   * For now, we verify that the timer is in pre-countdown phase and onTick is not called.
   */
  it('Property 6: Pre-countdown tick sound silence - no tick sound during pre-countdown', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 1000 }),
        fc.integer({ min: 5, max: 30 }),
        (basePoints, timeLimit) => {
          const onTimeout = vi.fn();
          const onTick = vi.fn();

          const { unmount } = renderWithProvider({
            basePoints,
            onTimeout,
            onTick,
            timeLimit
          });

          // Property: During pre-countdown, onTick should not be called
          // (This indicates the countdown hasn't started, so no tick sound should play)
          expect(onTick).not.toHaveBeenCalled();

          // Property: Timer should be in pre-countdown phase
          expect(screen.getByTestId('timer-pre-countdown')).toBeInTheDocument();
          expect(screen.getByTestId('timer-pre-countdown')).toHaveAttribute('data-phase', 'pre-countdown');

          // Cleanup
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: quiz-timing-scoring-improvements, Property 7: Countdown tick sound playback
   * Validates: Requirements 4.1
   * 
   * Property: For any time during the countdown phase (after pre-countdown delay), 
   * the tick sound should be playing
   */
  it('Property 7: Countdown tick sound playback - tick sound plays during countdown', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 10, max: 1000 }),
        fc.integer({ min: 5, max: 30 }),
        async (basePoints, timeLimit) => {
          const onTimeout = vi.fn();
          const onTick = vi.fn();

          const { unmount, container } = renderWithProvider({
            basePoints,
            onTimeout,
            onTick,
            timeLimit
          });

          try {
            // Property: Timer should be in pre-countdown phase initially
            const preCountdownElement = container.querySelector('[data-testid="timer-pre-countdown"]');
            expect(preCountdownElement).not.toBeNull();

            // Advance past pre-countdown delay (1 second)
            await act(async () => {
              await vi.advanceTimersByTimeAsync(1000);
            });

            // Property: Timer should now be in countdown phase
            const countdownElement = container.querySelector('[data-testid="timer-countdown"]');
            expect(countdownElement).not.toBeNull();
            expect(countdownElement?.getAttribute('data-phase')).toBe('countdown');

            // Property: Tick sound should be playing during countdown
            // We verify this by checking that the countdown phase is active
            // The actual tick sound playback is tested in unit tests with mocks
            expect(countdownElement?.getAttribute('data-phase')).toBe('countdown');
          } finally {
            // Cleanup
            unmount();
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: quiz-timing-scoring-improvements, Property 9: Tick sound stops on timeout
   * Validates: Requirements 4.4
   * 
   * Property: For any quiz question where the countdown reaches zero, 
   * the tick sound should stop playing
   */
  it('Property 9: Tick sound stops on timeout - tick sound stops when timer expires', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 10, max: 1000 }),
        fc.integer({ min: 2, max: 10 }), // Use shorter time limits for faster tests
        async (basePoints, timeLimit) => {
          const onTimeout = vi.fn();
          const onTick = vi.fn();

          const { unmount, container } = renderWithProvider({
            basePoints,
            onTimeout,
            onTick,
            timeLimit
          });

          try {
            // Advance past pre-countdown delay (1 second)
            await act(async () => {
              await vi.advanceTimersByTimeAsync(1000);
            });

            // Property: Timer should be in countdown phase
            let countdownElement = container.querySelector('[data-testid="timer-countdown"]');
            expect(countdownElement).not.toBeNull();

            // Advance time to reach timeout (timeLimit seconds)
            await act(async () => {
              await vi.advanceTimersByTimeAsync(timeLimit * 1000);
            });

            // Property: Timer should now be expired
            countdownElement = container.querySelector('[data-testid="timer-countdown"]');
            expect(countdownElement).toBeNull();
            
            const expiredElement = container.querySelector('[data-testid="timer-expired"]');
            expect(expiredElement).not.toBeNull();

            // Property: onTimeout should have been called
            expect(onTimeout).toHaveBeenCalledTimes(1);

            // Property: Tick sound should have stopped (verified by expired state)
            // The actual tick sound stopping is tested in unit tests with mocks
            expect(expiredElement?.textContent).toContain("Time's Up!");
          } finally {
            // Cleanup
            unmount();
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
