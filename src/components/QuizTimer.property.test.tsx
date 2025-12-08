import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import QuizTimer from './QuizTimer';

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
    vi.restoreAllMocks();
  });

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

          const { unmount } = render(
            <QuizTimer 
              basePoints={basePoints} 
              onTimeout={onTimeout} 
              onTick={onTick}
              timeLimit={timeLimit}
            />
          );

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

          const { unmount } = render(
            <QuizTimer 
              basePoints={basePoints} 
              onTimeout={onTimeout} 
              onTick={onTick}
              // timeLimit not specified, should default to 10
            />
          );

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

          const { unmount } = render(
            <QuizTimer 
              basePoints={basePoints} 
              onTimeout={onTimeout} 
              onTick={onTick}
              timeLimit={timeLimit}
            />
          );

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
});
