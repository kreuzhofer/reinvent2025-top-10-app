import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuoteBlock from './QuoteBlock';

/**
 * Unit Tests for QuoteBlock Component
 * 
 * Requirements: 13.2
 * - Test QuoteBlock displays quote and author
 */

describe('QuoteBlock', () => {
  it('renders the quote text', () => {
    render(<QuoteBlock text="This is a great quote" author="John Doe" />);
    
    const quoteText = screen.getByTestId('quote-text');
    expect(quoteText).toBeInTheDocument();
    expect(quoteText).toHaveTextContent('This is a great quote');
  });

  it('renders the author attribution', () => {
    render(<QuoteBlock text="This is a great quote" author="John Doe" />);
    
    const quoteAuthor = screen.getByTestId('quote-author');
    expect(quoteAuthor).toBeInTheDocument();
    expect(quoteAuthor).toHaveTextContent('John Doe');
  });

  it('wraps quote text in quotation marks', () => {
    render(<QuoteBlock text="Amazing insight" author="Jane Smith" />);
    
    const quoteText = screen.getByTestId('quote-text');
    expect(quoteText.textContent).toMatch(/^"/);
    expect(quoteText.textContent).toMatch(/"$/);
  });

  it('prefixes author with attribution dash', () => {
    render(<QuoteBlock text="Great wisdom" author="Wise Person" />);
    
    const quoteAuthor = screen.getByTestId('quote-author');
    expect(quoteAuthor.textContent).toMatch(/^—/);
  });

  it('renders a quote icon', () => {
    render(<QuoteBlock text="Test quote" author="Test Author" />);
    
    const icon = screen.getByTestId('quote-icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders the quote block container', () => {
    render(<QuoteBlock text="Test quote" author="Test Author" />);
    
    const quoteBlock = screen.getByTestId('quote-block');
    expect(quoteBlock).toBeInTheDocument();
  });

  it('uses blockquote element for quote text', () => {
    render(<QuoteBlock text="Semantic HTML" author="Developer" />);
    
    const quoteText = screen.getByTestId('quote-text');
    expect(quoteText.tagName.toLowerCase()).toBe('blockquote');
  });

  it('uses cite element for author', () => {
    render(<QuoteBlock text="Semantic HTML" author="Developer" />);
    
    const quoteAuthor = screen.getByTestId('quote-author');
    expect(quoteAuthor.tagName.toLowerCase()).toBe('cite');
  });

  it('applies italic styling to quote text', () => {
    render(<QuoteBlock text="Styled quote" author="Stylist" />);
    
    const quoteText = screen.getByTestId('quote-text');
    expect(quoteText.className).toMatch(/italic/);
  });

  it('applies re:Invent purple color to author', () => {
    render(<QuoteBlock text="Branded quote" author="Brand Manager" />);
    
    const quoteAuthor = screen.getByTestId('quote-author');
    expect(quoteAuthor.className).toMatch(/text-reinvent-purple/);
  });
});
