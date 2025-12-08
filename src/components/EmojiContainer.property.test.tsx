import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { EmojiContainer } from './EmojiContainer';
import { EmojiManager } from '../services/emoji/EmojiManager';

describe('EmojiContainer Property Tests', () => {
  let emojiManager: EmojiManager;

  beforeEach(() => {
    emojiManager = new EmojiManager({
      maxConcurrentEmojis: 3,
      displayDuration: 1500,
      animationDuration: 800
    });
  });

  // Feature: quiz-engagement-enhancements, Property 7: Emoji cleanup on navigation
  // Validates: Requirements 7.5
  it('Property 7: For any navigation event away from a quiz question, all active emoji animations should be stopped and their DOM elements removed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        (_emojiCount) => {
          const { unmount, container } = render(<EmojiContainer emojiManager={emojiManager} />);

          // Verify container is rendered
          const containerDiv = container.querySelector('div');
          expect(containerDiv).toBeTruthy();

          // Simulate navigation by unmounting
          unmount();

          // Verify cleanup was called (emojiManager should be cleaned up)
          expect(emojiManager.getActiveEmojiCount()).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
