import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardNav } from './useKeyboardNav';
import * as fc from 'fast-check';

/**
 * Property-Based Tests for useKeyboardNav Hook
 * 
 * **Feature: reinvent-quiz-app, Property 11: Keyboard navigation advancement**
 * **Validates: Requirements 10.1**
 * 
 * Property 11: Keyboard navigation advancement
 * For any slide (content or quiz), pressing the right arrow key should advance 
 * to the next slide when navigation is enabled.
 */

describe('useKeyboardNav - Property-Based Tests', () => {
  beforeEach(() => {
    // Clear any existing event listeners
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    vi.restoreAllMocks();
  });

  it('Property 11: Right arrow key advances when navigation is enabled', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // enabled state
        (enabled) => {
          const onNext = vi.fn();
          
          // Render the hook
          const { unmount } = renderHook(() =>
            useKeyboardNav({
              onNext,
              enabled,
            })
          );

          // Simulate right arrow key press
          const event = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            bubbles: true,
          });
          window.dispatchEvent(event);

          // Property: If enabled is true, onNext should be called
          // If enabled is false, onNext should not be called
          if (enabled) {
            expect(onNext).toHaveBeenCalledTimes(1);
          } else {
            expect(onNext).not.toHaveBeenCalled();
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Right arrow key only triggers onNext when provided', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // whether onNext is provided
        (hasOnNext) => {
          const onNext = hasOnNext ? vi.fn() : undefined;
          
          const { unmount } = renderHook(() =>
            useKeyboardNav({
              onNext,
              enabled: true,
            })
          );

          const event = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            bubbles: true,
          });
          window.dispatchEvent(event);

          if (hasOnNext && onNext) {
            expect(onNext).toHaveBeenCalledTimes(1);
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Non-arrow keys do not trigger navigation', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 1 }).filter(
          (key) => key !== 'ArrowRight' && !/^[0-9]$/.test(key)
        ),
        (key) => {
          const onNext = vi.fn();
          
          const { unmount } = renderHook(() =>
            useKeyboardNav({
              onNext,
              enabled: true,
            })
          );

          const event = new KeyboardEvent('keydown', {
            key,
            bubbles: true,
          });
          window.dispatchEvent(event);

          // Property: Non-arrow keys should not trigger onNext
          expect(onNext).not.toHaveBeenCalled();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property-Based Tests for Keyboard Answer Selection
 * 
 * **Feature: reinvent-quiz-app, Property 12: Quiz keyboard answer selection**
 * **Validates: Requirements 10.2**
 * 
 * Property 12: Quiz keyboard answer selection
 * For any quiz slide with N choices, pressing number keys 1 through N should 
 * select the corresponding answer choice.
 */

describe('useKeyboardNav - Answer Selection Property Tests', () => {
  it('Property 12: Number keys (1-N) select corresponding answers', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 6 }), // answerCount (2-6 choices)
        (answerCount) => {
          const onSelectAnswer = vi.fn();
          
          const { unmount } = renderHook(() =>
            useKeyboardNav({
              onSelectAnswer,
              answerCount,
              enabled: true,
            })
          );

          // Test each valid number key (1 through answerCount)
          for (let i = 1; i <= answerCount; i++) {
            onSelectAnswer.mockClear();
            
            const event = new KeyboardEvent('keydown', {
              key: i.toString(),
              bubbles: true,
            });
            window.dispatchEvent(event);

            // Property: Pressing number key i should call onSelectAnswer with index i-1
            expect(onSelectAnswer).toHaveBeenCalledTimes(1);
            expect(onSelectAnswer).toHaveBeenCalledWith(i - 1);
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Number keys outside valid range do not trigger selection', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 6 }), // answerCount
        fc.integer({ min: 7, max: 9 }), // invalid key number
        (answerCount, invalidKey) => {
          const onSelectAnswer = vi.fn();
          
          const { unmount } = renderHook(() =>
            useKeyboardNav({
              onSelectAnswer,
              answerCount,
              enabled: true,
            })
          );

          const event = new KeyboardEvent('keydown', {
            key: invalidKey.toString(),
            bubbles: true,
          });
          window.dispatchEvent(event);

          // Property: Keys outside the valid range should not trigger selection
          expect(onSelectAnswer).not.toHaveBeenCalled();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Answer selection only works when onSelectAnswer is provided', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 6 }), // answerCount
        fc.integer({ min: 1, max: 6 }), // key to press
        fc.boolean(), // whether onSelectAnswer is provided
        (answerCount, keyNum, hasOnSelectAnswer) => {
          const onSelectAnswer = hasOnSelectAnswer ? vi.fn() : undefined;
          
          const { unmount } = renderHook(() =>
            useKeyboardNav({
              onSelectAnswer,
              answerCount,
              enabled: true,
            })
          );

          const event = new KeyboardEvent('keydown', {
            key: keyNum.toString(),
            bubbles: true,
          });
          window.dispatchEvent(event);

          if (hasOnSelectAnswer && onSelectAnswer && keyNum <= answerCount) {
            expect(onSelectAnswer).toHaveBeenCalledTimes(1);
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Answer selection respects enabled flag', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 6 }), // answerCount
        fc.integer({ min: 1, max: 6 }), // key to press
        fc.boolean(), // enabled state
        (answerCount, keyNum, enabled) => {
          const onSelectAnswer = vi.fn();
          
          const { unmount } = renderHook(() =>
            useKeyboardNav({
              onSelectAnswer,
              answerCount,
              enabled,
            })
          );

          const event = new KeyboardEvent('keydown', {
            key: keyNum.toString(),
            bubbles: true,
          });
          window.dispatchEvent(event);

          if (enabled && keyNum <= answerCount) {
            expect(onSelectAnswer).toHaveBeenCalledTimes(1);
            expect(onSelectAnswer).toHaveBeenCalledWith(keyNum - 1);
          } else {
            expect(onSelectAnswer).not.toHaveBeenCalled();
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
