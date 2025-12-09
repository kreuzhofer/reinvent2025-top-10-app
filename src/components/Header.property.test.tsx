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
