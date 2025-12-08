import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import QuoteBlock from './QuoteBlock';

/**
 * Property-Based Tests for QuoteBlock Component
 * 
 * Feature: reinvent-quiz-app, Property 19: Quote block rendering
 * Validates: Requirements 13.2
 * 
 * Property 19: Quote block rendering
 * For any content slide containing a quote block, the rendered output should
 * display the quote text with author attribution.
 */

describe('QuoteBlock Property-Based Tests', () => {
  /**
   * Property 19: Quote block rendering
   * 
   * For any quote block with text and author, the component should render:
   * - The quote text displayed with quotation marks
   * - The author attribution
   * - A visually distinct quote container
   * - A quote icon for visual emphasis
   */
  it('Property 19: Quote block rendering - renders quote text with author attribution', () => {
    // Generator for quote text
    const quoteTextArb = fc.string({ minLength: 1, maxLength: 300 });
    
    // Generator for author names
    const authorArb = fc.string({ minLength: 1, maxLength: 100 });

    fc.assert(
      fc.property(
        quoteTextArb,
        authorArb,
        (text, author) => {
          const { unmount } = render(<QuoteBlock text={text} author={author} />);

          // Property 1: Quote block container should be present
          const quoteBlock = screen.getByTestId('quote-block');
          expect(quoteBlock).toBeInTheDocument();

          // Property 2: The quote text should be displayed
          const quoteText = screen.getByTestId('quote-text');
          expect(quoteText).toBeInTheDocument();
          // Quote text should contain the text with quotation marks
          expect(quoteText.textContent).toContain(text);
          expect(quoteText.textContent).toMatch(/^"/); // Starts with quote
          expect(quoteText.textContent).toMatch(/"$/); // Ends with quote

          // Property 3: The author should be displayed with attribution
          const quoteAuthor = screen.getByTestId('quote-author');
          expect(quoteAuthor).toBeInTheDocument();
          expect(quoteAuthor.textContent).toContain(author);
          expect(quoteAuthor.textContent).toMatch(/^—/); // Attribution dash

          // Property 4: A quote icon should be present
          const icon = screen.getByTestId('quote-icon');
          expect(icon).toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Quote block structure is consistent
   * 
   * For any valid quote configuration, the component should maintain
   * a consistent structure with container, icon, text, and author elements.
   */
  it('Property: Quote block maintains consistent structure', () => {
    const quoteTextArb = fc.string({ minLength: 1, maxLength: 200 });
    const authorArb = fc.string({ minLength: 1, maxLength: 100 });

    fc.assert(
      fc.property(
        quoteTextArb,
        authorArb,
        (text, author) => {
          const { unmount } = render(<QuoteBlock text={text} author={author} />);

          // Property 1: Container exists with correct test id
          expect(screen.queryByTestId('quote-block')).toBeInTheDocument();

          // Property 2: Icon exists with correct test id
          expect(screen.queryByTestId('quote-icon')).toBeInTheDocument();

          // Property 3: Text exists with correct test id
          expect(screen.queryByTestId('quote-text')).toBeInTheDocument();

          // Property 4: Author exists with correct test id
          expect(screen.queryByTestId('quote-author')).toBeInTheDocument();

          // Property 5: All four elements are present simultaneously
          const container = screen.getByTestId('quote-block');
          const icon = screen.getByTestId('quote-icon');
          const textElement = screen.getByTestId('quote-text');
          const authorElement = screen.getByTestId('quote-author');
          
          expect(container).toBeInTheDocument();
          expect(icon).toBeInTheDocument();
          expect(textElement).toBeInTheDocument();
          expect(authorElement).toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Quote text and author are always distinct
   * 
   * For any quote, the text and author should be rendered in separate
   * elements and should not be mixed together.
   */
  it('Property: Quote text and author are rendered separately', () => {
    const quoteTextArb = fc.string({ minLength: 10, maxLength: 100 });
    const authorArb = fc.string({ minLength: 5, maxLength: 50 });

    fc.assert(
      fc.property(
        quoteTextArb,
        authorArb,
        (text, author) => {
          const { unmount } = render(<QuoteBlock text={text} author={author} />);

          const quoteText = screen.getByTestId('quote-text');
          const quoteAuthor = screen.getByTestId('quote-author');

          // Property 1: Quote text element should not contain author
          expect(quoteText.textContent).not.toContain(`— ${author}`);

          // Property 2: Author element should not contain the full quote text
          expect(quoteAuthor.textContent).not.toContain(`"${text}"`);

          // Property 3: Quote text should be in blockquote element
          expect(quoteText.tagName.toLowerCase()).toBe('blockquote');

          // Property 4: Author should be in cite element
          expect(quoteAuthor.tagName.toLowerCase()).toBe('cite');

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
