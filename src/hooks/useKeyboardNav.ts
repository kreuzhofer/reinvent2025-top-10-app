import { useEffect, useCallback } from 'react';

/**
 * Keyboard Navigation Hook
 * 
 * Provides keyboard navigation support for the quiz application.
 * 
 * Requirements:
 * - 10.1: Right arrow key to advance slides
 * - 10.2: Number keys (1-N) to select quiz answers
 * - 10.5: Proper focus management
 */

export interface KeyboardNavOptions {
  onNext?: () => void;
  onSelectAnswer?: (index: number) => void;
  answerCount?: number;
  enabled?: boolean;
}

export function useKeyboardNav({
  onNext,
  onSelectAnswer,
  answerCount = 0,
  enabled = true,
}: KeyboardNavOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Right arrow key to advance
      if (event.key === 'ArrowRight' && onNext) {
        event.preventDefault();
        onNext();
      }

      // Number keys (1-N) to select answers
      if (onSelectAnswer && answerCount > 0) {
        const key = event.key;
        const num = parseInt(key, 10);
        
        // Check if it's a valid number key (1 through answerCount)
        if (!isNaN(num) && num >= 1 && num <= answerCount) {
          event.preventDefault();
          onSelectAnswer(num - 1); // Convert to 0-based index
        }
      }
    },
    [enabled, onNext, onSelectAnswer, answerCount]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}
