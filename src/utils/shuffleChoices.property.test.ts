import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { shuffleChoices } from './shuffleChoices';
import type { QuizChoice } from '../types/quiz.types';

/**
 * Property-Based Tests for shuffleChoices utility
 * 
 * **Feature: reinvent-quiz-app, Property 23: Quiz choice shuffling**
 * **Validates: Requirements 15.2**
 * 
 * Property: For any quiz with shuffleChoices enabled in quizConfig, 
 * the order of answer choices should be randomized while maintaining 
 * correctness validation.
 */
describe('shuffleChoices - Property-Based Tests', () => {
  /**
   * Property 23: Quiz choice shuffling
   * 
   * For any array of quiz choices and a valid correct answer index,
   * shuffling should:
   * 1. Return the same number of choices
   * 2. Contain all original choices (no additions or removals)
   * 3. Return a valid new correct answer index
   * 4. The choice at the new correct index should be the same as the original correct choice
   */
  it('Property 23: shuffled choices maintain correctness and completeness', () => {
    fc.assert(
      fc.property(
        // Generate array of 2-6 choices with text
        fc.array(
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 100 }),
            icon: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined })
          }),
          { minLength: 2, maxLength: 6 }
        ),
        // Generate valid correct answer index based on array length
        (choices: QuizChoice[]) => {
          const correctAnswerIndex = Math.floor(Math.random() * choices.length);
          
          const { shuffledChoices, newCorrectIndex } = shuffleChoices(
            choices,
            correctAnswerIndex
          );

          // Property 1: Same number of choices
          expect(shuffledChoices).toHaveLength(choices.length);

          // Property 2: All original choices are present (check by text content)
          const originalTexts = choices.map(c => c.text).sort();
          const shuffledTexts = shuffledChoices.map(c => c.text).sort();
          expect(shuffledTexts).toEqual(originalTexts);

          // Property 3: New correct index is valid
          expect(newCorrectIndex).toBeGreaterThanOrEqual(0);
          expect(newCorrectIndex).toBeLessThan(shuffledChoices.length);

          // Property 4: The choice at new correct index matches original correct choice
          expect(shuffledChoices[newCorrectIndex].text).toBe(
            choices[correctAnswerIndex].text
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Shuffling is deterministic for the same random seed
   * (This tests that the function doesn't lose data during shuffling)
   */
  it('Property: shuffling preserves all choice properties including icons', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 50 }),
            icon: fc.option(fc.constantFrom('check', 'x', 'star', 'trophy'), { nil: undefined })
          }),
          { minLength: 2, maxLength: 5 }
        ),
        (choices: QuizChoice[]) => {
          const correctAnswerIndex = Math.floor(Math.random() * choices.length);
          
          const { shuffledChoices } = shuffleChoices(choices, correctAnswerIndex);

          // Check that all original choices (with their icons) are present
          for (const originalChoice of choices) {
            const found = shuffledChoices.some(
              shuffled => 
                shuffled.text === originalChoice.text && 
                shuffled.icon === originalChoice.icon
            );
            expect(found).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case property: Single choice "shuffling" returns unchanged
   */
  it('Property: shuffling single choice returns same choice at index 0', () => {
    const singleChoice: QuizChoice[] = [{ text: 'Only choice' }];
    const { shuffledChoices, newCorrectIndex } = shuffleChoices(singleChoice, 0);

    expect(shuffledChoices).toHaveLength(1);
    expect(shuffledChoices[0].text).toBe('Only choice');
    expect(newCorrectIndex).toBe(0);
  });

  /**
   * Edge case property: Two choices can be in either order
   */
  it('Property: shuffling two choices maintains both choices', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 })
        ).filter(([a, b]) => a !== b), // Ensure different texts
        ([text1, text2]) => {
          const choices: QuizChoice[] = [{ text: text1 }, { text: text2 }];
          const correctAnswerIndex = Math.random() < 0.5 ? 0 : 1;
          
          const { shuffledChoices, newCorrectIndex } = shuffleChoices(
            choices,
            correctAnswerIndex
          );

          expect(shuffledChoices).toHaveLength(2);
          
          // Both original texts should be present
          const texts = shuffledChoices.map(c => c.text);
          expect(texts).toContain(text1);
          expect(texts).toContain(text2);
          
          // Correct answer should be preserved
          expect(shuffledChoices[newCorrectIndex].text).toBe(
            choices[correctAnswerIndex].text
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
