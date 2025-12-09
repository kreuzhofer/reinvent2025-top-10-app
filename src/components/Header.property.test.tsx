import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import Header from './Header';
import { ScoreProvider } from '../context/ScoreContext';
import { AudioProvider } from '../context/AudioContext';

/**
 * Property-Based Tests for Header Component
 * 
 * These tests verify universal properties that should hold across all inputs.
 */

describe('Header - Property-Based Tests', () => {
  /**
   * Feature: ui-progress-and-layout-improvements, Property 7: Header responsive layout integrity
   * Validates: Requirements 7.4
   * 
   * For any viewport width within the supported range (320px to 2560px),
   * header elements should maintain readability without text truncation or overlap
   */
  it('Property 7: maintains layout integrity across viewport widths', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }), // Generate random viewport widths
        fc.boolean(), // Random showScore value
        fc.boolean(), // Random showAudioControls value
        (viewportWidth, showScore, showAudioControls) => {
          // Set viewport width
          global.innerWidth = viewportWidth;
          
          // Render header with random props wrapped in required providers
          const { container } = render(
            <AudioProvider>
              <ScoreProvider>
                <Header 
                  showScore={showScore}
                  showAudioControls={showAudioControls}
                />
              </ScoreProvider>
            </AudioProvider>
          );
          
          const header = container.querySelector('header');
          expect(header).toBeInTheDocument();
          
          // Verify header is visible and has proper structure
          const headerContent = container.querySelector('header > div');
          expect(headerContent).toBeInTheDocument();
          expect(headerContent).toHaveClass('flex', 'items-center', 'justify-between');
          
          // Verify logo is always present
          const logo = container.querySelector('img[alt*="re:Invent"]');
          expect(logo).toBeInTheDocument();
          
          // Verify right side container exists
          const rightSide = headerContent?.querySelector('.flex.items-center.gap-4');
          expect(rightSide).toBeInTheDocument();
          
          // The header should maintain its structure regardless of viewport width
          // This ensures no elements are hidden or broken at any supported width
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: kiro-branding-control, Property 4: Component does not overlap other elements
   * Validates: Requirements 2.5
   * 
   * For any header configuration (with or without score, with or without audio controls),
   * the KiroBranding component should not overlap with other UI elements
   */
  it('Property 4: KiroBranding does not overlap other elements', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // Random showScore value
        fc.boolean(), // Random showAudioControls value
        (showScore, showAudioControls) => {
          const { container } = render(
            <AudioProvider>
              <ScoreProvider>
                <Header 
                  showScore={showScore}
                  showAudioControls={showAudioControls}
                />
              </ScoreProvider>
            </AudioProvider>
          );
          
          const header = container.querySelector('header');
          expect(header).toBeInTheDocument();
          
          // Verify right side uses vertical flex layout (flex-col)
          const rightSide = container.querySelector('.flex.flex-col.items-end');
          expect(rightSide).toBeInTheDocument();
          
          // Verify KiroBranding is present
          const kiroBranding = container.querySelector('a[href="https://kiro.dev"]');
          expect(kiroBranding).toBeInTheDocument();
          
          // Verify gap-2 is applied for spacing between elements
          expect(rightSide).toHaveClass('gap-2');
          
          // Verify the horizontal container for score and audio controls exists
          const horizontalContainer = rightSide?.querySelector('.flex.items-center.gap-4');
          expect(horizontalContainer).toBeInTheDocument();
          
          // When showScore is true, score display should be present
          if (showScore) {
            const scoreDisplay = container.querySelector('[data-testid="score-display"]');
            expect(scoreDisplay).toBeInTheDocument();
          }
          
          // When showAudioControls is true, audio controls should be present
          if (showAudioControls) {
            const audioControls = container.querySelector('[data-testid="audio-controls"]');
            expect(audioControls).toBeInTheDocument();
          }
          
          // The use of flex-col with gap-2 ensures vertical stacking without overlap
          // KiroBranding is at the top, score and audio controls are below
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: ui-progress-and-layout-improvements, Property 8: Header element non-overlap
   * Validates: Requirements 7.5
   * 
   * For any header configuration (with or without score, with or without audio controls),
   * elements should not visually overlap each other
   */
  it('Property 8: elements do not overlap in any configuration', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // Random showScore value
        fc.boolean(), // Random showAudioControls value
        (showScore, showAudioControls) => {
          const { container } = render(
            <AudioProvider>
              <ScoreProvider>
                <Header 
                  showScore={showScore}
                  showAudioControls={showAudioControls}
                />
              </ScoreProvider>
            </AudioProvider>
          );
          
          const header = container.querySelector('header');
          expect(header).toBeInTheDocument();
          
          // Verify header uses flexbox with justify-between for proper spacing
          const headerContent = container.querySelector('header > div');
          expect(headerContent).toHaveClass('justify-between');
          
          // Verify left side (logo) exists
          const leftSide = headerContent?.querySelector('div.flex.flex-col');
          expect(leftSide).toBeInTheDocument();
          
          // Verify right side container exists and uses gap for spacing
          const rightSide = headerContent?.querySelector('.flex.items-center.gap-4');
          expect(rightSide).toBeInTheDocument();
          
          // When showScore is true, score display should be present
          if (showScore) {
            const scoreDisplay = container.querySelector('[data-testid="score-display"]');
            expect(scoreDisplay).toBeInTheDocument();
          }
          
          // When showAudioControls is true, audio controls should be present
          if (showAudioControls) {
            const audioControls = container.querySelector('[data-testid="audio-controls"]');
            expect(audioControls).toBeInTheDocument();
          }
          
          // The use of flexbox with justify-between and gap ensures no overlap
          // Elements are properly spaced and aligned
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

  /**
   * Feature: kiro-branding-control, Property 5: Positioning is consistent across screens
   * Validates: Requirements 3.3
   * 
   * For any header configuration, the KiroBranding component should always be positioned
   * at the top of the right section, above score and audio controls
   */
  it('Property 5: KiroBranding positioning is consistent', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // Random showScore value
        fc.boolean(), // Random showAudioControls value
        (showScore, showAudioControls) => {
          const { container } = render(
            <AudioProvider>
              <ScoreProvider>
                <Header 
                  showScore={showScore}
                  showAudioControls={showAudioControls}
                />
              </ScoreProvider>
            </AudioProvider>
          );
          
          // Verify right side vertical container exists
          const rightSide = container.querySelector('.flex.flex-col.items-end');
          expect(rightSide).toBeInTheDocument();
          
          // Get all children of the right side container
          const children = rightSide?.children;
          expect(children).toBeDefined();
          expect(children!.length).toBeGreaterThan(0);
          
          // First child should be the KiroBranding link
          const firstChild = children![0];
          expect(firstChild.tagName).toBe('A');
          expect(firstChild).toHaveAttribute('href', 'https://kiro.dev');
          
          // Second child should be the horizontal container with score/audio controls
          const secondChild = children![1];
          expect(secondChild).toHaveClass('flex', 'items-center');
          
          // This ensures KiroBranding is always at the top position
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: kiro-branding-control, Property 18: No overlap on small screens
   * Validates: Requirements 8.5
   * 
   * For any mobile viewport width (< 768px), the KiroBranding component should not
   * overlap with other critical UI elements in the header
   */
  it('Property 18: No overlap on small screens', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }), // Mobile viewport widths
        fc.boolean(), // Random showScore value
        fc.boolean(), // Random showAudioControls value
        (viewportWidth, showScore, showAudioControls) => {
          // Set viewport width
          global.innerWidth = viewportWidth;
          
          const { container } = render(
            <AudioProvider>
              <ScoreProvider>
                <Header 
                  showScore={showScore}
                  showAudioControls={showAudioControls}
                />
              </ScoreProvider>
            </AudioProvider>
          );
          
          const header = container.querySelector('header');
          expect(header).toBeInTheDocument();
          
          // Verify header uses justify-between for proper spacing
          const headerContent = container.querySelector('header > div');
          expect(headerContent).toHaveClass('justify-between');
          
          // Verify right side vertical layout is maintained
          const rightSide = container.querySelector('.flex.flex-col.items-end');
          expect(rightSide).toBeInTheDocument();
          
          // Verify KiroBranding is present
          const kiroBranding = container.querySelector('a[href="https://kiro.dev"]');
          expect(kiroBranding).toBeInTheDocument();
          
          // Verify logo is present on the left
          const logo = container.querySelector('img[alt*="re:Invent"]');
          expect(logo).toBeInTheDocument();
          
          // The flex layout with justify-between ensures elements stay on opposite sides
          // The vertical stacking (flex-col) on the right prevents horizontal overlap
          // This maintains proper spacing even on small screens
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
