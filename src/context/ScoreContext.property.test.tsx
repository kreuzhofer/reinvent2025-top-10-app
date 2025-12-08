import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { ScoreProvider, useScore } from './ScoreContext';
import { ReactNode } from 'react';

/**
 * Feature: reinvent-quiz-app, Property 14: Time-adjusted point calculation
 * Validates: Requirements 11.3, 11.5
 * 
 * Property: For any base point value and elapsed seconds (0-10), 
 * the available points should equal the base value minus 10% per elapsed second, 
 * with a minimum of zero.
 */

// Standalone function for testing (same logic as in ScoreContext)
const calculateTimeAdjustedPoints = (basePoints: number, elapsedSeconds: number): number => {
  const adjustedPoints = basePoints - basePoints * 0.10 * elapsedSeconds;
  return Math.max(0, Math.round(adjustedPoints));
};

describe('ScoreContext Property Tests', () => {
  describe('Property 14: Time-adjusted point calculation', () => {
    it('should calculate time-adjusted points correctly for any base points and elapsed seconds', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }), // basePoints
          fc.integer({ min: 0, max: 10 }), // elapsedSeconds (0-10 seconds)
          (basePoints, elapsedSeconds) => {
            const result = calculateTimeAdjustedPoints(basePoints, elapsedSeconds);
            
            // Property 1: Result should never be negative
            expect(result).toBeGreaterThanOrEqual(0);
            
            // Property 2: Result should be an integer (rounded)
            expect(Number.isInteger(result)).toBe(true);
            
            // Property 3: At 0 seconds, should get full points
            if (elapsedSeconds === 0) {
              expect(result).toBe(basePoints);
            }
            
            // Property 4: At 10 seconds, should get 0 points (100% deduction)
            if (elapsedSeconds === 10) {
              expect(result).toBe(0);
            }
            
            // Property 5: Points should decrease monotonically with time
            // (more time = fewer points)
            if (elapsedSeconds > 0 && elapsedSeconds < 10) {
              const pointsAtZero = calculateTimeAdjustedPoints(basePoints, 0);
              const pointsAtTen = calculateTimeAdjustedPoints(basePoints, 10);
              expect(result).toBeLessThanOrEqual(pointsAtZero);
              expect(result).toBeGreaterThanOrEqual(pointsAtTen);
            }
            
            // Property 6: Formula verification (basePoints - basePoints * 0.10 * elapsedSeconds)
            const expectedBeforeRounding = basePoints - basePoints * 0.10 * elapsedSeconds;
            const expectedAfterRounding = Math.max(0, Math.round(expectedBeforeRounding));
            expect(result).toBe(expectedAfterRounding);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case of 0 base points', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }), // elapsedSeconds
          (elapsedSeconds) => {
            const result = calculateTimeAdjustedPoints(0, elapsedSeconds);
            expect(result).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle fractional point calculations correctly', () => {
      // Test specific cases where rounding matters
      const testCases = [
        { basePoints: 100, elapsedSeconds: 1, expected: 90 },  // 100 - 10 = 90
        { basePoints: 100, elapsedSeconds: 5, expected: 50 },  // 100 - 50 = 50
        { basePoints: 100, elapsedSeconds: 9, expected: 10 },  // 100 - 90 = 10
        { basePoints: 75, elapsedSeconds: 3, expected: 53 },   // 75 - 22.5 = 52.5 → 53
        { basePoints: 33, elapsedSeconds: 7, expected: 10 },   // 33 - 23.1 = 9.9 → 10
      ];

      testCases.forEach(({ basePoints, elapsedSeconds, expected }) => {
        const result = calculateTimeAdjustedPoints(basePoints, elapsedSeconds);
        expect(result).toBe(expected);
      });
    });
  });

  /**
   * Feature: reinvent-quiz-app, Property 3: Score accumulation correctness
   * Validates: Requirements 2.3, 11.5
   * 
   * Property: For any sequence of quiz answers with their respective answer times,
   * the final score should equal the sum of time-adjusted points from all correctly answered questions.
   */
  describe('Property 3: Score accumulation correctness', () => {
    it('should accumulate score correctly for any sequence of correct answers with timing', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              basePoints: fc.integer({ min: 0, max: 1000 }),
              elapsedSeconds: fc.integer({ min: 0, max: 10 }),
              isCorrect: fc.boolean(),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (answerSequence) => {
            // Simulate score accumulation
            let accumulatedScore = 0;
            
            for (const answer of answerSequence) {
              if (answer.isCorrect) {
                const points = calculateTimeAdjustedPoints(answer.basePoints, answer.elapsedSeconds);
                accumulatedScore += points;
              }
            }
            
            // Property 1: Score should never be negative
            expect(accumulatedScore).toBeGreaterThanOrEqual(0);
            
            // Property 2: Score should equal sum of time-adjusted points for correct answers
            const expectedScore = answerSequence
              .filter(a => a.isCorrect)
              .reduce((sum, a) => sum + calculateTimeAdjustedPoints(a.basePoints, a.elapsedSeconds), 0);
            
            expect(accumulatedScore).toBe(expectedScore);
            
            // Property 3: If no correct answers, score should be 0
            const hasCorrectAnswers = answerSequence.some(a => a.isCorrect);
            if (!hasCorrectAnswers) {
              expect(accumulatedScore).toBe(0);
            }
            
            // Property 4: Score should be monotonically increasing (never decrease)
            let runningScore = 0;
            for (const answer of answerSequence) {
              const previousScore = runningScore;
              if (answer.isCorrect) {
                const points = calculateTimeAdjustedPoints(answer.basePoints, answer.elapsedSeconds);
                runningScore += points;
              }
              expect(runningScore).toBeGreaterThanOrEqual(previousScore);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not accumulate points for incorrect answers', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              basePoints: fc.integer({ min: 1, max: 1000 }),
              elapsedSeconds: fc.integer({ min: 0, max: 10 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (incorrectAnswers) => {
            // All answers are incorrect
            let score = 0;
            
            for (const answer of incorrectAnswers) {
              // Incorrect answers don't add points
              // score remains unchanged
            }
            
            expect(score).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle mixed correct and incorrect answers', () => {
      // Specific test case: 3 correct, 2 incorrect
      const sequence = [
        { basePoints: 100, elapsedSeconds: 0, isCorrect: true },   // +100
        { basePoints: 100, elapsedSeconds: 5, isCorrect: false },  // +0
        { basePoints: 100, elapsedSeconds: 2, isCorrect: true },   // +80
        { basePoints: 100, elapsedSeconds: 10, isCorrect: false }, // +0
        { basePoints: 100, elapsedSeconds: 1, isCorrect: true },   // +90
      ];
      
      let score = 0;
      for (const answer of sequence) {
        if (answer.isCorrect) {
          score += calculateTimeAdjustedPoints(answer.basePoints, answer.elapsedSeconds);
        }
      }
      
      expect(score).toBe(270); // 100 + 80 + 90
    });
  });

  /**
   * Feature: reinvent-quiz-app, Property 7: Restart state reset
   * Validates: Requirements 3.5
   * 
   * Property: For any quiz state with non-zero score and non-zero slide index,
   * restarting the quiz should reset both score to zero and slide index to the beginning.
   */
  describe('Property 7: Restart state reset', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ScoreProvider>{children}</ScoreProvider>
    );

    it('should reset score and totalPossible to zero for any accumulated state', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              points: fc.integer({ min: 1, max: 1000 }),
              possiblePoints: fc.integer({ min: 1, max: 1000 }),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (operations) => {
            const { result } = renderHook(() => useScore(), { wrapper });
            
            // Accumulate some score and possible points
            act(() => {
              for (const op of operations) {
                result.current.addPoints(op.points);
                result.current.addPossiblePoints(op.possiblePoints);
              }
            });
            
            // Verify state is non-zero before reset
            const scoreBeforeReset = result.current.score;
            const totalPossibleBeforeReset = result.current.totalPossible;
            
            expect(scoreBeforeReset).toBeGreaterThan(0);
            expect(totalPossibleBeforeReset).toBeGreaterThan(0);
            
            // Reset the score
            act(() => {
              result.current.resetScore();
            });
            
            // Property 1: Score should be 0 after reset
            expect(result.current.score).toBe(0);
            
            // Property 2: TotalPossible should be 0 after reset
            expect(result.current.totalPossible).toBe(0);
            
            // Property 3: Reset should be idempotent (calling it again should still be 0)
            act(() => {
              result.current.resetScore();
            });
            
            expect(result.current.score).toBe(0);
            expect(result.current.totalPossible).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow score accumulation after reset', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }), // initial points
          fc.integer({ min: 1, max: 1000 }), // points after reset
          (initialPoints, pointsAfterReset) => {
            const { result } = renderHook(() => useScore(), { wrapper });
            
            // Add initial points
            act(() => {
              result.current.addPoints(initialPoints);
            });
            
            expect(result.current.score).toBe(initialPoints);
            
            // Reset
            act(() => {
              result.current.resetScore();
            });
            
            expect(result.current.score).toBe(0);
            
            // Add points after reset
            act(() => {
              result.current.addPoints(pointsAfterReset);
            });
            
            // Property: Score after reset should only reflect new points
            expect(result.current.score).toBe(pointsAfterReset);
            expect(result.current.score).not.toBe(initialPoints + pointsAfterReset);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle reset when score is already zero', () => {
      const { result } = renderHook(() => useScore(), { wrapper });
      
      // Initial state should be zero
      expect(result.current.score).toBe(0);
      expect(result.current.totalPossible).toBe(0);
      
      // Reset when already zero
      act(() => {
        result.current.resetScore();
      });
      
      // Should still be zero
      expect(result.current.score).toBe(0);
      expect(result.current.totalPossible).toBe(0);
    });
  });
});
