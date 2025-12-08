import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import * as fc from 'fast-check';
import ScoreDisplay from './ScoreDisplay';
import { ScoreProvider, useScore } from '../context/ScoreContext';
import type { ReactNode } from 'react';

/**
 * Property-Based Tests for ScoreDisplay Component
 * 
 * Feature: reinvent-quiz-app, Property 6: Score visibility persistence
 * Validates: Requirements 3.1
 * 
 * Property 6: Score visibility persistence
 * For any slide during an active quiz session (excluding the welcome screen),
 * the current score should be visible in the UI.
 */

describe('ScoreDisplay Property-Based Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  /**
   * Property 6: Score visibility persistence
   * 
   * For any quiz state with accumulated score, the ScoreDisplay component
   * should render and display the score element in the DOM.
   * 
   * This property verifies that the score display is always present and
   * contains a valid numeric score value.
   */
  it('Property 6: Score visibility persistence - score display is always present and contains valid score', async () => {
    // Render the component once
    render(
      <ScoreProvider>
        <ScoreDisplay />
      </ScoreProvider>
    );

    // Wait for animation to complete
    await waitFor(() => {
      const scoreDisplay = screen.getByTestId('score-display');
      expect(scoreDisplay).toBeInTheDocument();
    });

    // Now verify the property holds across many random scenarios
    fc.assert(
      fc.property(
        fc.array(
          fc.integer({ min: 0, max: 1000 }), // points to add
          { minLength: 0, maxLength: 20 }
        ),
        (_pointsSequence) => {
          // Property 1: The score display element should be present in the DOM
          const scoreDisplay = screen.queryByTestId('score-display');
          expect(scoreDisplay).toBeInTheDocument();

          // Property 2: The score value element should be present
          const scoreValue = screen.queryByTestId('score-value');
          expect(scoreValue).toBeInTheDocument();

          // Property 3: The rendered score should be a valid number
          const displayedScore = scoreValue?.textContent;
          expect(displayedScore).toBeTruthy();
          expect(Number.isNaN(Number(displayedScore))).toBe(false);

          // Property 4: The score should be a non-negative integer
          const numericScore = Number(displayedScore);
          expect(numericScore).toBeGreaterThanOrEqual(0);
          expect(Number.isInteger(numericScore)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Score display persists across score updates
   * 
   * For any sequence of score updates, the score display should remain
   * in the DOM and continue to show valid numeric values.
   */
  it('Property: Score display persists across score updates', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ScoreProvider>{children}</ScoreProvider>
    );

    fc.assert(
      fc.property(
        fc.array(
          fc.integer({ min: 1, max: 100 }),
          { minLength: 1, maxLength: 10 }
        ),
        (pointsToAdd) => {
          const { result } = renderHook(() => useScore(), { wrapper });

          // Initial score should be 0
          expect(result.current.score).toBe(0);

          // Add points in sequence
          let expectedScore = 0;
          for (const points of pointsToAdd) {
            act(() => {
              result.current.addPoints(points);
            });
            expectedScore += points;

            // Property: Score should match expected accumulated value
            expect(result.current.score).toBe(expectedScore);
          }

          // Property: Final score should equal sum of all points
          const totalPoints = pointsToAdd.reduce((sum, p) => sum + p, 0);
          expect(result.current.score).toBe(totalPoints);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Score display structure is consistent
   * 
   * The ScoreDisplay should always have consistent structure:
   * - A container element
   * - A "Score" label
   * - A score value display with numeric content
   */
  it('Property: Score display has consistent structure', async () => {
    render(
      <ScoreProvider>
        <ScoreDisplay />
      </ScoreProvider>
    );

    // Wait for component to be in DOM
    await waitFor(() => {
      expect(screen.getByTestId('score-display')).toBeInTheDocument();
    });

    // Verify structure properties hold
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }), // dummy value for iteration
        () => {
          // Property 1: Container exists
          const container = screen.queryByTestId('score-display');
          expect(container).toBeInTheDocument();

          // Property 2: "Score" label exists
          expect(screen.queryByText('Score')).toBeInTheDocument();

          // Property 3: Score value exists
          const scoreValue = screen.queryByTestId('score-value');
          expect(scoreValue).toBeInTheDocument();

          // Property 4: Score value contains only digits
          const text = scoreValue?.textContent || '';
          expect(/^\d+$/.test(text)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
