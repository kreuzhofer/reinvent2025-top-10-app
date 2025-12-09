import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import SummaryScreen from './SummaryScreen';
import { AudioProvider } from '../context/AudioContext';

/**
 * Property-Based Tests for SummaryScreen Component
 * 
 * Feature: ui-progress-and-layout-improvements, Property 4: Summary percentage calculation accuracy
 * Validates: Requirements 5.4
 */

describe('SummaryScreen Property-Based Tests', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 4: Summary percentage calculation accuracy
   * 
   * For any final score and maximum possible points (where max > 0),
   * the displayed percentage should equal Math.round((score / maxPoints) × 100)
   */
  it('Property 4: Summary percentage calculation accuracy', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }), // score
        fc.integer({ min: 1, max: 1000 }), // totalPossible (must be > 0)
        (score, totalPossible) => {
          // Clean up before each iteration
          cleanup();
          
          // Render the SummaryScreen with the generated values
          const { container } = render(
            <AudioProvider>
              <SummaryScreen 
                score={score} 
                totalPossible={totalPossible}
                allowRetry={false}
              />
            </AudioProvider>
          );

          // Calculate expected percentage
          const expectedPercentage = Math.round((score / totalPossible) * 100);

          // Get the displayed percentage from the container
          const percentageElement = container.querySelector('[data-testid="final-percentage"]');
          const displayedPercentage = parseInt(percentageElement?.textContent?.replace('%', '') || '0', 10);

          // Property: The displayed percentage should match the calculated percentage
          expect(displayedPercentage).toBe(expectedPercentage);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Percentage is always between 0 and 100 when score <= totalPossible
   */
  it('Property: Percentage is bounded between 0 and 100 for valid scores', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // totalPossible
        (totalPossible) => {
          // Clean up before each iteration
          cleanup();
          
          // Generate score that doesn't exceed totalPossible
          const score = fc.sample(fc.integer({ min: 0, max: totalPossible }), 1)[0];

          const { container } = render(
            <AudioProvider>
              <SummaryScreen 
                score={score} 
                totalPossible={totalPossible}
                allowRetry={false}
              />
            </AudioProvider>
          );

          const percentageElement = container.querySelector('[data-testid="final-percentage"]');
          const displayedPercentage = parseInt(percentageElement?.textContent?.replace('%', '') || '0', 10);

          // Property: Percentage should be between 0 and 100 (inclusive)
          expect(displayedPercentage).toBeGreaterThanOrEqual(0);
          expect(displayedPercentage).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Zero score always results in 0% percentage
   */
  it('Property: Zero score always results in 0% percentage', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // totalPossible
        (totalPossible) => {
          // Clean up before each iteration
          cleanup();
          
          const { container } = render(
            <AudioProvider>
              <SummaryScreen 
                score={0} 
                totalPossible={totalPossible}
                allowRetry={false}
              />
            </AudioProvider>
          );

          const percentageElement = container.querySelector('[data-testid="final-percentage"]');
          const displayedPercentage = parseInt(percentageElement?.textContent?.replace('%', '') || '0', 10);

          // Property: Zero score should always result in 0%
          expect(displayedPercentage).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Perfect score always results in 100% percentage
   */
  it('Property: Perfect score always results in 100% percentage', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // totalPossible
        (totalPossible) => {
          // Clean up before each iteration
          cleanup();
          
          const { container } = render(
            <AudioProvider>
              <SummaryScreen 
                score={totalPossible} 
                totalPossible={totalPossible}
                allowRetry={false}
              />
            </AudioProvider>
          );

          const percentageElement = container.querySelector('[data-testid="final-percentage"]');
          const displayedPercentage = parseInt(percentageElement?.textContent?.replace('%', '') || '0', 10);

          // Property: Perfect score should always result in 100%
          expect(displayedPercentage).toBe(100);
        }
      ),
      { numRuns: 100 }
    );
  });
});
