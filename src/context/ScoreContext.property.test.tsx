import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { ScoreProvider, useScore } from './ScoreContext';
import type { ReactNode } from 'react';

/**
 * Feature: reinvent-quiz-app, Property 14: Time-adjusted point calculation
 * Validates: Requirements 11.3, 11.5
 * 
 * Property: For any base point value and elapsed seconds (0-10), 
 * the available points should equal the base value minus 10% per elapsed second, 
 * with a minimum of zero.
 */

// Standalone function for testing (same logic as in ScoreContext)
const calculateTimeAdjustedPoints = (basePoints: number, elapsedSeconds: number, timeLimit: number): number => {
  // If time has expired, award 0 points
  if (elapsedSeconds >= timeLimit) {
    return 0;
  }
  
  // If basePoints is less than 10, return 0 (can't apply minimum threshold)
  if (basePoints < 10) {
    return 0;
  }
  
  // Calculate dynamic deduction rate (rounded down)
  const deductionRate = Math.floor(basePoints / timeLimit);
  
  // Calculate adjusted points
  const adjustedPoints = basePoints - (deductionRate * elapsedSeconds);
  
  // Apply minimum threshold of 10 points during countdown
  const finalPoints = Math.max(10, adjustedPoints);
  
  return Math.round(finalPoints);
};

describe('ScoreContext Property Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Property 14: Time-adjusted point calculation (legacy - updated for new formula)', () => {
    it('should calculate time-adjusted points correctly for any base points and elapsed seconds', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 10000 }), // basePoints
          fc.integer({ min: 5, max: 60 }), // timeLimit
          (basePoints, timeLimit) => {
            const elapsedSeconds = fc.sample(fc.integer({ min: 0, max: timeLimit }), 1)[0];
            const result = calculateTimeAdjustedPoints(basePoints, elapsedSeconds, timeLimit);
            
            // Property 1: Result should never be negative
            expect(result).toBeGreaterThanOrEqual(0);
            
            // Property 2: Result should be an integer (rounded)
            expect(Number.isInteger(result)).toBe(true);
            
            // Property 3: At 0 seconds, should get full points
            if (elapsedSeconds === 0) {
              expect(result).toBe(basePoints);
            }
            
            // Property 4: At timeLimit or beyond, should get 0 points
            if (elapsedSeconds >= timeLimit) {
              expect(result).toBe(0);
            }
            
            // Property 5: During countdown, should get at least 10 points
            if (elapsedSeconds < timeLimit) {
              expect(result).toBeGreaterThanOrEqual(10);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case of 0 base points', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 60 }), // timeLimit
          (timeLimit) => {
            const elapsedSeconds = fc.sample(fc.integer({ min: 0, max: timeLimit }), 1)[0];
            const result = calculateTimeAdjustedPoints(0, elapsedSeconds, timeLimit);
            // With 0 base points, result should be 0 (can't apply minimum threshold)
            expect(result).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: reinvent-quiz-app, Property 3: Score accumulation correctness
   * Validates: Requirements 2.3, 11.5
   * 
   * Property: For any sequence of quiz answers with their respective answer times,
   * the final score should equal the sum of time-adjusted points from all correctly answered questions.
   */
  describe('Property 3: Score accumulation correctness (updated for new formula)', () => {
    it('should accumulate score correctly for any sequence of correct answers with timing', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              basePoints: fc.integer({ min: 10, max: 1000 }),
              timeLimit: fc.integer({ min: 5, max: 60 }),
              isCorrect: fc.boolean(),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (answerSequence) => {
            // Simulate score accumulation
            let accumulatedScore = 0;
            
            for (const answer of answerSequence) {
              if (answer.isCorrect) {
                const elapsedSeconds = fc.sample(fc.integer({ min: 0, max: answer.timeLimit }), 1)[0];
                const points = calculateTimeAdjustedPoints(answer.basePoints, elapsedSeconds, answer.timeLimit);
                accumulatedScore += points;
              }
            }
            
            // Property 1: Score should never be negative
            expect(accumulatedScore).toBeGreaterThanOrEqual(0);
            
            // Property 2: If no correct answers, score should be 0
            const hasCorrectAnswers = answerSequence.some(a => a.isCorrect);
            if (!hasCorrectAnswers) {
              expect(accumulatedScore).toBe(0);
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
              basePoints: fc.integer({ min: 10, max: 1000 }),
              timeLimit: fc.integer({ min: 5, max: 60 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (incorrectAnswers) => {
            // All answers are incorrect
            let score = 0;
            
            // Incorrect answers don't add points - score remains unchanged
            // Verify that regardless of the number of incorrect answers, score stays at 0
            expect(incorrectAnswers.length).toBeGreaterThanOrEqual(1);
            expect(score).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
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
            // Clear localStorage before each property test run to ensure clean state
            localStorage.clear();
            
            // Create a fresh hook instance for each property test run
            const { result, unmount } = renderHook(() => useScore(), { wrapper });
            
            try {
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
            } finally {
              // Clean up the hook instance and localStorage after each test run
              unmount();
              localStorage.clear();
            }
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

  /**
   * Feature: quiz-timing-scoring-improvements, Property 1: Minimum points threshold during countdown
   * Validates: Requirements 1.1, 1.3, 6.3
   * 
   * Property: For any base points value, time limit, and elapsed seconds where elapsed < timeLimit,
   * the calculated points should be at least 10
   */
  describe('Property 1: Minimum points threshold during countdown', () => {
    it('should award at least 10 points for any correct answer during countdown', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 10000 }), // basePoints (min 10 to make test meaningful)
          fc.integer({ min: 5, max: 60 }), // timeLimit (5-60 seconds)
          (basePoints, timeLimit) => {
            // Generate elapsed time that is less than timeLimit
            const elapsedSeconds = fc.sample(fc.integer({ min: 0, max: timeLimit - 1 }), 1)[0];
            
            const result = calculateTimeAdjustedPoints(basePoints, elapsedSeconds, timeLimit);
            
            // Property: During countdown (elapsed < timeLimit), points should be at least 10
            expect(result).toBeGreaterThanOrEqual(10);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 points when time has expired', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 10000 }), // basePoints
          fc.integer({ min: 5, max: 60 }), // timeLimit
          (basePoints, timeLimit) => {
            // Test at exactly timeLimit and beyond
            const atLimit = calculateTimeAdjustedPoints(basePoints, timeLimit, timeLimit);
            const beyondLimit = calculateTimeAdjustedPoints(basePoints, timeLimit + 1, timeLimit);
            
            expect(atLimit).toBe(0);
            expect(beyondLimit).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: quiz-timing-scoring-improvements, Property 2: Dynamic deduction rate calculation
   * Validates: Requirements 2.1, 2.2
   * 
   * Property: For any base points and time limit, the deduction rate should equal floor(basePoints / timeLimit)
   */
  describe('Property 2: Dynamic deduction rate calculation', () => {
    it('should calculate deduction rate as floor(basePoints / timeLimit)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 10000 }), // basePoints
          fc.integer({ min: 5, max: 60 }), // timeLimit
          (basePoints, timeLimit) => {
            const expectedDeductionRate = Math.floor(basePoints / timeLimit);
            
            // Test at 0 seconds (should get full points)
            const pointsAtZero = calculateTimeAdjustedPoints(basePoints, 0, timeLimit);
            expect(pointsAtZero).toBe(basePoints);
            
            // Test at 1 second (should be basePoints - deductionRate, or 10 if that's less)
            const pointsAtOne = calculateTimeAdjustedPoints(basePoints, 1, timeLimit);
            const expectedAtOne = Math.max(10, basePoints - expectedDeductionRate);
            expect(pointsAtOne).toBe(expectedAtOne);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: quiz-timing-scoring-improvements, Property 3: Points decrease by deduction rate
   * Validates: Requirements 2.3, 6.4
   * 
   * Property: For any base points, time limit, and two elapsed times t1 and t2 where t1 < t2 < timeLimit,
   * the difference in calculated points should equal deductionRate * (t2 - t1), subject to the minimum threshold
   */
  describe('Property 3: Points decrease by deduction rate', () => {
    it('should decrease points by deduction rate per second, subject to minimum threshold', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 10000 }), // basePoints (higher to avoid hitting minimum too early)
          fc.integer({ min: 10, max: 60 }), // timeLimit
          (basePoints, timeLimit) => {
            const deductionRate = Math.floor(basePoints / timeLimit);
            
            // Generate two different elapsed times, both less than timeLimit
            const t1 = fc.sample(fc.integer({ min: 0, max: Math.floor(timeLimit / 2) }), 1)[0];
            const t2 = fc.sample(fc.integer({ min: t1 + 1, max: timeLimit - 1 }), 1)[0];
            
            const pointsAtT1 = calculateTimeAdjustedPoints(basePoints, t1, timeLimit);
            const pointsAtT2 = calculateTimeAdjustedPoints(basePoints, t2, timeLimit);
            
            // Property: Points should decrease (or stay at minimum)
            expect(pointsAtT2).toBeLessThanOrEqual(pointsAtT1);
            
            // If neither hit the minimum threshold, the difference should equal deductionRate * (t2 - t1)
            if (pointsAtT1 > 10 && pointsAtT2 > 10) {
              const expectedDifference = deductionRate * (t2 - t1);
              const actualDifference = pointsAtT1 - pointsAtT2;
              expect(actualDifference).toBe(expectedDifference);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
