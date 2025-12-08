import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { EmojiManager } from './EmojiManager';

describe('EmojiManager Property Tests', () => {
  let emojiManager: EmojiManager;

  beforeEach(() => {
    emojiManager = new EmojiManager({
      maxConcurrentEmojis: 3,
      displayDuration: 1500,
      animationDuration: 800
    });
  });

  // Feature: quiz-engagement-enhancements, Property 1: Success emoji selection
  // Validates: Requirements 1.1
  it('Property 1: For any correct answer selection, the displayed emoji should be one of {💪, 🔥, ⭐, 🎯, ✨}', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (_iterations) => {
          const config = emojiManager.showSuccessEmoji();
          expect(config).not.toBeNull();
          
          const successEmojis = ['💪', '🔥', '⭐', '🎯', '✨'];
          expect(successEmojis).toContain(config!.emoji);
          
          // Cleanup for next iteration
          emojiManager.removeEmoji(config!.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: quiz-engagement-enhancements, Property 2: Miss emoji selection
  // Validates: Requirements 2.1
  it('Property 2: For any incorrect answer selection, the displayed emoji should be one of {💔, 🔨, 💥, 🌟, 🎪}', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (_iterations) => {
          const config = emojiManager.showMissEmoji();
          expect(config).not.toBeNull();
          
          const missEmojis = ['💔', '🔨', '💥', '🌟', '🎪'];
          expect(missEmojis).toContain(config!.emoji);
          
          // Cleanup for next iteration
          emojiManager.removeEmoji(config!.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: quiz-engagement-enhancements, Property 4: Emoji variety
  // Validates: Requirements 1.4, 2.4
  it('Property 4: For any sequence of 3 or more consecutive emoji displays of the same type, at least 2 different emojis should be selected', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('success', 'miss'),
        (type) => {
          const emojis: string[] = [];
          
          // Generate 3 emojis
          for (let i = 0; i < 3; i++) {
            const config = type === 'success' 
              ? emojiManager.showSuccessEmoji()
              : emojiManager.showMissEmoji();
            
            if (config) {
              emojis.push(config.emoji);
              emojiManager.removeEmoji(config.id);
            }
          }
          
          // Check that we have at least 2 different emojis
          const uniqueEmojis = new Set(emojis);
          expect(uniqueEmojis.size).toBeGreaterThanOrEqual(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: quiz-engagement-enhancements, Property 6: Concurrent emoji limit
  // Validates: Requirements 7.2
  it('Property 6: For any point in time, the number of active emoji animations should not exceed 3', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (attempts) => {
          const configs = [];
          
          // Try to create more emojis than the limit
          for (let i = 0; i < attempts; i++) {
            const config = emojiManager.showSuccessEmoji();
            if (config) {
              configs.push(config);
            }
          }
          
          // Should never exceed max concurrent
          expect(emojiManager.getActiveEmojiCount()).toBeLessThanOrEqual(3);
          
          // Cleanup
          configs.forEach(c => emojiManager.removeEmoji(c.id));
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: quiz-engagement-enhancements, Property 8: Emoji position randomization
  // Validates: Requirements 8.1, 8.2
  it('Property 8: For any sequence of emoji displays, the starting z-axis positions should vary, and the landing x and y positions should vary while remaining within viewport bounds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 10 }),
        (count) => {
          const configs = [];
          
          for (let i = 0; i < count; i++) {
            const config = emojiManager.showSuccessEmoji();
            if (config) {
              configs.push(config);
              emojiManager.removeEmoji(config.id);
            }
          }
          
          // Check z-axis variation
          const zPositions = configs.map(c => c.startPosition.z);
          const uniqueZ = new Set(zPositions);
          expect(uniqueZ.size).toBeGreaterThan(1);
          
          // Check all z positions are in range -500 to -100
          zPositions.forEach(z => {
            expect(z).toBeGreaterThanOrEqual(-500);
            expect(z).toBeLessThanOrEqual(-100);
          });
          
          // Check x and y variation
          const xPositions = configs.map(c => c.endPosition.x);
          const yPositions = configs.map(c => c.endPosition.y);
          const uniqueX = new Set(xPositions);
          const uniqueY = new Set(yPositions);
          
          expect(uniqueX.size).toBeGreaterThan(1);
          expect(uniqueY.size).toBeGreaterThan(1);
          
          // Check positions are within viewport bounds
          configs.forEach(config => {
            expect(config.endPosition.x).toBeGreaterThanOrEqual(0);
            expect(config.endPosition.x).toBeLessThanOrEqual(window.innerWidth);
            expect(config.endPosition.y).toBeGreaterThanOrEqual(0);
            expect(config.endPosition.y).toBeLessThanOrEqual(window.innerHeight);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: quiz-engagement-enhancements, Property 9: Emoji rotation range
  // Validates: Requirements 8.3
  it('Property 9: For any emoji smash animation, the applied rotation should be between -15 and 15 degrees', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (_iterations) => {
          const config = emojiManager.showSuccessEmoji();
          expect(config).not.toBeNull();
          
          expect(config!.rotation).toBeGreaterThanOrEqual(-15);
          expect(config!.rotation).toBeLessThanOrEqual(15);
          
          emojiManager.removeEmoji(config!.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: quiz-engagement-enhancements, Property 10: Emoji scale range
  // Validates: Requirements 8.4
  it('Property 10: For any emoji smash animation, the applied scale should be between 0.8 and 1.2', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (_iterations) => {
          const config = emojiManager.showSuccessEmoji();
          expect(config).not.toBeNull();
          
          expect(config!.scale).toBeGreaterThanOrEqual(0.8);
          expect(config!.scale).toBeLessThanOrEqual(1.2);
          
          emojiManager.removeEmoji(config!.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: quiz-engagement-enhancements, Property 11: Emoji overlap prevention
  // Validates: Requirements 8.5
  it('Property 11: For any set of simultaneously displayed emojis, no two emojis should overlap by more than 30% of their area', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 3 }),
        (count) => {
          const configs = [];
          
          for (let i = 0; i < count; i++) {
            const config = emojiManager.showSuccessEmoji();
            if (config) {
              configs.push(config);
            }
          }
          
          // Check overlap between all pairs
          for (let i = 0; i < configs.length; i++) {
            for (let j = i + 1; j < configs.length; j++) {
              const config1 = configs[i];
              const config2 = configs[j];
              
              const size1 = 80 * config1.scale;
              const size2 = 80 * config2.scale;
              
              const dx = Math.abs(config1.endPosition.x - config2.endPosition.x);
              const dy = Math.abs(config1.endPosition.y - config2.endPosition.y);
              
              // Calculate overlap percentage
              const overlapX = Math.max(0, (size1 + size2) / 2 - dx);
              const overlapY = Math.max(0, (size1 + size2) / 2 - dy);
              const overlapArea = overlapX * overlapY;
              const minArea = Math.min(size1 * size1, size2 * size2);
              const overlapPercentage = minArea > 0 ? overlapArea / minArea : 0;
              
              expect(overlapPercentage).toBeLessThanOrEqual(0.3);
            }
          }
          
          // Cleanup
          configs.forEach(c => emojiManager.removeEmoji(c.id));
        }
      ),
      { numRuns: 100 }
    );
  });
});
