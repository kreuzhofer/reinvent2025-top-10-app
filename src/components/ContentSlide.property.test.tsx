import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import ContentSlide from './ContentSlide';
import type { ContentSlide as ContentSlideType } from '../types/quiz.types';
import * as useAudioManagerModule from '../hooks/useAudioManager';
import { ScoreProvider } from '../context/ScoreContext';

// Mock the hooks
vi.mock('../hooks/useAudioManager');
vi.mock('../hooks/useKeyboardNav', () => ({
  useKeyboardNav: vi.fn(),
}));

describe('ContentSlide Property-Based Tests', () => {
  let mockPlaySFX: ReturnType<typeof vi.fn>;
  let mockPlayBackgroundMusic: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPlaySFX = vi.fn().mockResolvedValue(undefined);
    mockPlayBackgroundMusic = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useAudioManagerModule.useAudioManager).mockReturnValue({
      audioManager: null,
      isInitialized: true,
      isMuted: false,
      toggleMute: vi.fn(),
      playBackgroundMusic: mockPlayBackgroundMusic,
      playSFX: mockPlaySFX,
    });
  });

  /**
   * Feature: quiz-engagement-enhancements, Property 21: Slide transition sound effect
   * Validates: Requirements 4.4
   * 
   * For any slide navigation event, the Audio System should play the slide-transition.mp3 sound effect
   */
  it('Property 21: should play slide transition sound effect on any slide navigation', () => {
    fc.assert(
      fc.property(
        // Generate random content slides
        fc.record({
          type: fc.constant('content' as const),
          id: fc.string({ minLength: 1, maxLength: 20 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          content: fc.array(
            fc.record({
              type: fc.constant('text' as const),
              text: fc.string({ minLength: 1, maxLength: 200 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          backgroundMusic: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
        }),
        (slide: ContentSlideType) => {
          // Reset mocks for each iteration
          mockPlaySFX.mockClear();
          mockPlayBackgroundMusic.mockClear();

          // Render the ContentSlide component with required providers
          const { unmount } = render(
            <ScoreProvider>
              <ContentSlide
                slide={slide}
                onNext={vi.fn()}
                currentSlide={1}
                totalSlides={10}
                showProgress={true}
                showScore={true}
              />
            </ScoreProvider>
          );

          // Verify that slide transition sound effect was played
          expect(mockPlaySFX).toHaveBeenCalledWith('effects/slide-transition.mp3');
          expect(mockPlaySFX).toHaveBeenCalledTimes(1);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
