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
   * Feature: ui-progress-and-layout-improvements, Property 2: Progress bar visibility maintained across slide types
   * Validates: Requirements 3.5
   * 
   * For any navigation between Content Slides, the progress bar should remain visible throughout the transition
   */
  it('Property 2: should maintain progress bar visibility across content slide transitions', () => {
    fc.assert(
      fc.property(
        // Generate two different content slides to simulate navigation
        fc.tuple(
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
          }),
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
          }),
          fc.integer({ min: 1, max: 100 }), // current slide
          fc.integer({ min: 1, max: 100 })  // total slides
        ),
        ([slide1, slide2, currentSlide, totalSlides]) => {
          // Ensure currentSlide doesn't exceed totalSlides
          const validCurrentSlide = Math.min(currentSlide, totalSlides);
          
          // Render first slide with showProgress=true
          const { container: container1, unmount: unmount1 } = render(
            <ScoreProvider>
              <ContentSlide
                slide={slide1}
                onNext={vi.fn()}
                currentSlide={validCurrentSlide}
                totalSlides={totalSlides}
                showProgress={true}
                showScore={true}
              />
            </ScoreProvider>
          );

          // Verify progress bar is present on first slide
          const progressBar1 = container1.querySelector('[data-testid="progress-bar"]');
          expect(progressBar1).toBeTruthy();

          unmount1();

          // Render second slide with showProgress=true (simulating navigation)
          const { container: container2, unmount: unmount2 } = render(
            <ScoreProvider>
              <ContentSlide
                slide={slide2}
                onNext={vi.fn()}
                currentSlide={validCurrentSlide}
                totalSlides={totalSlides}
                showProgress={true}
                showScore={true}
              />
            </ScoreProvider>
          );

          // Verify progress bar is still present on second slide
          const progressBar2 = container2.querySelector('[data-testid="progress-bar"]');
          expect(progressBar2).toBeTruthy();

          unmount2();
        }
      ),
      { numRuns: 100 }
    );
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
          expect(mockPlaySFX).toHaveBeenCalledWith('slide-transition.mp3');
          expect(mockPlaySFX).toHaveBeenCalledTimes(1);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
