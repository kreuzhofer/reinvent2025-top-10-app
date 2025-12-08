import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import CalloutBox from './CalloutBox';

/**
 * Property-Based Tests for CalloutBox Component
 * 
 * Feature: reinvent-quiz-app, Property 18: Callout block rendering
 * Validates: Requirements 13.1
 * 
 * Property 18: Callout block rendering
 * For any content slide containing a callout block, the rendered output should
 * display a visually distinct highlighted box with the specified style.
 */

describe('CalloutBox Property-Based Tests', () => {
  /**
   * Property 18: Callout block rendering
   * 
   * For any callout block with text and style (info, success, warning),
   * the component should render a highlighted box with:
   * - The callout text displayed
   * - The correct style applied (data-style attribute)
   * - An icon appropriate to the style
   * - A visually distinct container
   */
  it('Property 18: Callout block rendering - renders highlighted box with specified style', () => {
    // Generator for callout styles
    const calloutStyleArb = fc.constantFrom('info', 'success', 'warning') as fc.Arbitrary<'info' | 'success' | 'warning'>;
    
    // Generator for callout text
    const calloutTextArb = fc.string({ minLength: 1, maxLength: 200 });

    fc.assert(
      fc.property(
        calloutTextArb,
        calloutStyleArb,
        (text, style) => {
          const { unmount } = render(<CalloutBox text={text} style={style} />);

          // Property 1: Callout box container should be present
          const calloutBox = screen.getByTestId('callout-box');
          expect(calloutBox).toBeInTheDocument();

          // Property 2: The style should be correctly applied
          expect(calloutBox).toHaveAttribute('data-style', style);

          // Property 3: The text should be displayed
          const calloutText = screen.getByTestId('callout-text');
          expect(calloutText).toBeInTheDocument();
          expect(calloutText.textContent).toBe(text);

          // Property 4: An icon should be present
          const icon = screen.getByTestId('callout-icon');
          expect(icon).toBeInTheDocument();

          // Property 5: The container should have visual styling (border and background)
          expect(calloutBox.className).toMatch(/border/);
          expect(calloutBox.className).toMatch(/bg-/);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Each callout style renders with distinct visual characteristics
   * 
   * For any text, when rendered with different styles (info, success, warning),
   * each style should produce different visual styling classes.
   */
  it('Property: Different styles produce different visual characteristics', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (text) => {
          const styles: Array<'info' | 'success' | 'warning'> = ['info', 'success', 'warning'];
          const renderedStyles = new Set<string>();

          for (const style of styles) {
            const { unmount } = render(<CalloutBox text={text} style={style} />);
            
            const calloutBox = screen.getByTestId('callout-box');
            const className = calloutBox.className;
            
            // Property: Each style should have unique class combinations
            renderedStyles.add(className);
            
            unmount();
          }

          // Property: All three styles should produce different class combinations
          expect(renderedStyles.size).toBe(3);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Callout box structure is consistent
   * 
   * For any valid callout configuration, the component should maintain
   * a consistent structure with container, icon, and text elements.
   */
  it('Property: Callout box maintains consistent structure', () => {
    const calloutStyleArb = fc.constantFrom('info', 'success', 'warning') as fc.Arbitrary<'info' | 'success' | 'warning'>;
    const calloutTextArb = fc.string({ minLength: 1, maxLength: 200 });

    fc.assert(
      fc.property(
        calloutTextArb,
        calloutStyleArb,
        (text, style) => {
          const { unmount } = render(<CalloutBox text={text} style={style} />);

          // Property 1: Container exists with correct test id
          expect(screen.queryByTestId('callout-box')).toBeInTheDocument();

          // Property 2: Icon exists with correct test id
          expect(screen.queryByTestId('callout-icon')).toBeInTheDocument();

          // Property 3: Text exists with correct test id
          expect(screen.queryByTestId('callout-text')).toBeInTheDocument();

          // Property 4: All three elements are present simultaneously
          const container = screen.getByTestId('callout-box');
          const icon = screen.getByTestId('callout-icon');
          const textElement = screen.getByTestId('callout-text');
          
          expect(container).toBeInTheDocument();
          expect(icon).toBeInTheDocument();
          expect(textElement).toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
