import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ScoreProvider, useScore } from './ScoreContext';
import type { ReactNode } from 'react';

describe('ScoreContext Unit Tests', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ScoreProvider>{children}</ScoreProvider>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  describe('calculateTimeAdjustedPoints edge cases', () => {
    it('should return at least 10 points for last second answer (elapsed = timeLimit - 1)', () => {
      const { result } = renderHook(() => useScore(), { wrapper });
      
      // Test with 100 points, 15 second limit, answered at 14 seconds
      // 100 / 15 = 6 (floor), so 100 - (6 * 14) = 100 - 84 = 16 points
      const points = result.current.calculateTimeAdjustedPoints(100, 14, 15);
      expect(points).toBe(16);
      expect(points).toBeGreaterThanOrEqual(10);
      
      // Test with 50 points, 10 second limit, answered at 9 seconds
      // 50 / 10 = 5, so 50 - (5 * 9) = 50 - 45 = 5, clamped to 10
      const points2 = result.current.calculateTimeAdjustedPoints(50, 9, 10);
      expect(points2).toBe(10);
    });

    it('should return 0 points when elapsed >= timeLimit', () => {
      const { result } = renderHook(() => useScore(), { wrapper });
      
      // Test at exactly timeLimit
      const pointsAtLimit = result.current.calculateTimeAdjustedPoints(100, 15, 15);
      expect(pointsAtLimit).toBe(0);
      
      // Test beyond timeLimit
      const pointsBeyondLimit = result.current.calculateTimeAdjustedPoints(100, 20, 15);
      expect(pointsBeyondLimit).toBe(0);
    });

    it('should calculate deduction rate as 6 for 100 points / 15 seconds', () => {
      const { result } = renderHook(() => useScore(), { wrapper });
      
      // 100 / 15 = 6.66... → floor = 6
      // At 0 seconds: 100 points
      const pointsAt0 = result.current.calculateTimeAdjustedPoints(100, 0, 15);
      expect(pointsAt0).toBe(100);
      
      // At 1 second: 100 - 6 = 94 points
      const pointsAt1 = result.current.calculateTimeAdjustedPoints(100, 1, 15);
      expect(pointsAt1).toBe(94);
      
      // At 2 seconds: 100 - 12 = 88 points
      const pointsAt2 = result.current.calculateTimeAdjustedPoints(100, 2, 15);
      expect(pointsAt2).toBe(88);
    });

    it('should calculate deduction rate as 5 for 50 points / 10 seconds', () => {
      const { result } = renderHook(() => useScore(), { wrapper });
      
      // 50 / 10 = 5
      // At 0 seconds: 50 points
      const pointsAt0 = result.current.calculateTimeAdjustedPoints(50, 0, 10);
      expect(pointsAt0).toBe(50);
      
      // At 1 second: 50 - 5 = 45 points
      const pointsAt1 = result.current.calculateTimeAdjustedPoints(50, 1, 10);
      expect(pointsAt1).toBe(45);
      
      // At 5 seconds: 50 - 25 = 25 points
      const pointsAt5 = result.current.calculateTimeAdjustedPoints(50, 5, 10);
      expect(pointsAt5).toBe(25);
      
      // At 8 seconds: 50 - 40 = 10 points (minimum threshold)
      const pointsAt8 = result.current.calculateTimeAdjustedPoints(50, 8, 10);
      expect(pointsAt8).toBe(10);
    });
  });
});
