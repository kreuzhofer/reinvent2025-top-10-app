import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import FunFactDisplay from './FunFactDisplay';

/**
 * Property-Based Tests for FunFactDisplay Component
 * 
 * Feature: reinvent-quiz-app, Property 22: Fun fact display
 * Validates: Requirements 14.1
 * 
 * Property 22: Fun fact display
 * For any quiz slide with a funFact field, after answering the question,
 * the system should display both the explanation and the fun fact.
 */

describe('FunFactDisplay Property-Based Tests', () => {
  /**
   * Property 22: Fun fact display
   * 
   * For any quiz slide with a funFact field, the component should:
   * - Display the fun fact text
   * - Show a visual indicator (icon and label)
   * - Be visually distinct from main explanation
   * - Render all required elements
   */
  it('Property 22: Fun fact display - displays fun fact with visual distinction', () => {
    // Generator for non-empty fun fact text (excluding whitespace-only strings)
    const funFactTextArb = fc.string({ minLength: 1, maxLength: 300 })
      .filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        funFactTextArb,
        (funFact) => {
          const { unmount } = render(<FunFactDisplay funFact={funFact} />);

          // Property 1: Fun fact container should be present
          const funFactDisplay = screen.getByTestId('fun-fact-display');
          expect(funFactDisplay).toBeInTheDocument();

          // Property 2: The fun fact text should be displayed
          const funFactText = screen.getByTestId('fun-fact-text');
          expect(funFactText).toBeInTheDocument();
          expect(funFactText.textContent).toBe(funFact);

          // Property 3: A visual indicator (icon) should be present
          const icon = screen.getByTestId('fun-fact-icon');
          expect(icon).toBeInTheDocument();

          // Property 4: A label should be present to distinguish from explanation
          const label = screen.getByTestId('fun-fact-label');
          expect(label).toBeInTheDocument();
          expect(label.textContent).toMatch(/fun fact/i);

          // Property 5: The container should have visual styling (border and background)
          expect(funFactDisplay.className).toMatch(/border/);
          expect(funFactDisplay.className).toMatch(/bg-/);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Fun fact component handles optional fun facts gracefully
   * 
   * For any quiz slide without a funFact field (undefined),
   * the component should render nothing (null) without errors.
   */
  it('Property: Handles optional fun facts gracefully - renders nothing when undefined', () => {
    fc.assert(
      fc.property(
        fc.constant(undefined),
        (_funFact) => {
          const { container, unmount } = render(<FunFactDisplay funFact={undefined} />);

          // Property 1: Component should render nothing (empty container)
          expect(container.firstChild).toBeNull();

          // Property 2: No fun fact display element should be present
          expect(screen.queryByTestId('fun-fact-display')).not.toBeInTheDocument();

          // Property 3: No fun fact text should be present
          expect(screen.queryByTestId('fun-fact-text')).not.toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Fun fact component structure is consistent
   * 
   * For any valid fun fact text, the component should maintain
   * a consistent structure with container, icon, label, and text elements.
   */
  it('Property: Fun fact maintains consistent structure when present', () => {
    // Generator for non-empty fun fact text (excluding whitespace-only strings)
    const funFactTextArb = fc.string({ minLength: 1, maxLength: 300 })
      .filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        funFactTextArb,
        (funFact) => {
          const { unmount } = render(<FunFactDisplay funFact={funFact} />);

          // Property 1: Container exists with correct test id
          expect(screen.queryByTestId('fun-fact-display')).toBeInTheDocument();

          // Property 2: Icon exists with correct test id
          expect(screen.queryByTestId('fun-fact-icon')).toBeInTheDocument();

          // Property 3: Label exists with correct test id
          expect(screen.queryByTestId('fun-fact-label')).toBeInTheDocument();

          // Property 4: Text exists with correct test id
          expect(screen.queryByTestId('fun-fact-text')).toBeInTheDocument();

          // Property 5: All four elements are present simultaneously
          const container = screen.getByTestId('fun-fact-display');
          const icon = screen.getByTestId('fun-fact-icon');
          const label = screen.getByTestId('fun-fact-label');
          const textElement = screen.getByTestId('fun-fact-text');
          
          expect(container).toBeInTheDocument();
          expect(icon).toBeInTheDocument();
          expect(label).toBeInTheDocument();
          expect(textElement).toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Fun fact visual distinction
   * 
   * For any fun fact, the component should have distinct visual styling
   * that differentiates it from regular explanation text.
   */
  it('Property: Fun fact has distinct visual styling', () => {
    // Generator for non-empty fun fact text (excluding whitespace-only strings)
    const funFactTextArb = fc.string({ minLength: 1, maxLength: 200 })
      .filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        funFactTextArb,
        (funFact) => {
          const { unmount } = render(<FunFactDisplay funFact={funFact} />);

          const funFactDisplay = screen.getByTestId('fun-fact-display');

          // Property 1: Should have gradient background
          expect(funFactDisplay.className).toMatch(/bg-gradient/);

          // Property 2: Should have border styling
          expect(funFactDisplay.className).toMatch(/border-2/);

          // Property 3: Should have yellow accent color (reinvent-yellow)
          expect(funFactDisplay.className).toMatch(/reinvent-yellow/);

          // Property 4: Label should be uppercase for emphasis
          const label = screen.getByTestId('fun-fact-label');
          expect(label.className).toMatch(/uppercase/);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
