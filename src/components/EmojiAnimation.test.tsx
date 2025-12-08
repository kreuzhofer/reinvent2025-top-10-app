import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { EmojiAnimation } from './EmojiAnimation';
import type { EmojiConfig } from '../services/emoji/EmojiManager';

describe('EmojiAnimation Accessibility Tests', () => {
  let matchMediaMock: any;

  beforeEach(() => {
    // Mock matchMedia
    matchMediaMock = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return matchMediaMock;
        }
        return matchMediaMock;
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createTestConfig = (): EmojiConfig => ({
    id: 'test-emoji',
    emoji: '💪',
    startPosition: { x: 100, y: 100, z: -200 },
    endPosition: { x: 500, y: 500 },
    rotation: 10,
    scale: 1.0,
    duration: 800
  });

  describe('Reduced Motion Support', () => {
    it('should render animated emoji when reduced motion is not preferred', () => {
      matchMediaMock.matches = false;
      const config = createTestConfig();
      const onComplete = vi.fn();

      const { container } = render(<EmojiAnimation config={config} onComplete={onComplete} />);

      const emojiElement = container.querySelector('div');
      expect(emojiElement).toBeTruthy();
      expect(emojiElement?.textContent).toBe('💪');
      
      // Check for animation properties (willChange indicates animation)
      const style = window.getComputedStyle(emojiElement!);
      expect(style.willChange).toBe('transform');
    });

    it('should render static emoji when reduced motion is preferred', () => {
      matchMediaMock.matches = true;
      const config = createTestConfig();
      const onComplete = vi.fn();

      const { container } = render(<EmojiAnimation config={config} onComplete={onComplete} />);

      const emojiElement = container.querySelector('div');
      expect(emojiElement).toBeTruthy();
      expect(emojiElement?.textContent).toBe('💪');
      
      // Check that it's positioned at the end position (no animation)
      const style = emojiElement!.style;
      expect(style.position).toBe('fixed');
      expect(style.left).toBe('500px');
      expect(style.top).toBe('500px');
    });

    it('should apply rotation and scale even with reduced motion', () => {
      matchMediaMock.matches = true;
      const config = createTestConfig();
      const onComplete = vi.fn();

      const { container } = render(<EmojiAnimation config={config} onComplete={onComplete} />);

      const emojiElement = container.querySelector('div');
      const style = emojiElement!.style;
      
      // Should still have rotation and scale for visual feedback
      expect(style.transform).toContain('rotate(10deg)');
      expect(style.transform).toContain('scale(1)');
    });

    it('should maintain visual feedback without animation', () => {
      matchMediaMock.matches = true;
      const config = createTestConfig();
      const onComplete = vi.fn();

      const { container } = render(<EmojiAnimation config={config} onComplete={onComplete} />);

      const emojiElement = container.querySelector('div');
      
      // Should be visible
      expect(emojiElement!.style.opacity).toBe('1');
      
      // Should display the emoji
      expect(emojiElement?.textContent).toBe('💪');
    });

    it('should call onComplete callback even with reduced motion', () => {
      vi.useFakeTimers();
      matchMediaMock.matches = true;
      const config = createTestConfig();
      const onComplete = vi.fn();

      render(<EmojiAnimation config={config} onComplete={onComplete} />);

      // Fast forward past the display duration
      vi.advanceTimersByTime(config.duration + 1500);

      expect(onComplete).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('Accessibility Properties', () => {
    it('should have pointer-events: none to not interfere with interactions', () => {
      const config = createTestConfig();
      const onComplete = vi.fn();

      const { container } = render(<EmojiAnimation config={config} onComplete={onComplete} />);

      const emojiElement = container.querySelector('div');
      const style = window.getComputedStyle(emojiElement!);
      
      expect(style.pointerEvents).toBe('none');
    });

    it('should have high z-index to appear above content', () => {
      const config = createTestConfig();
      const onComplete = vi.fn();

      const { container } = render(<EmojiAnimation config={config} onComplete={onComplete} />);

      const emojiElement = container.querySelector('div');
      const style = window.getComputedStyle(emojiElement!);
      
      expect(style.zIndex).toBe('9999');
    });

    it('should use fixed positioning to not affect layout', () => {
      const config = createTestConfig();
      const onComplete = vi.fn();

      const { container } = render(<EmojiAnimation config={config} onComplete={onComplete} />);

      const emojiElement = container.querySelector('div');
      const style = window.getComputedStyle(emojiElement!);
      
      expect(style.position).toBe('fixed');
    });
  });
});
