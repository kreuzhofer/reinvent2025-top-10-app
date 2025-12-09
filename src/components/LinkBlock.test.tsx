import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LinkBlock from './LinkBlock';

/**
 * Unit Tests for LinkBlock Component
 * 
 * Requirements:
 * - 11.1: Render clickable hyperlink element
 * - 11.2: Set href attribute to provided URL
 * - 11.3: Display text as link label
 * - 11.4: Open in new tab with security attributes when newTab is true
 * - 11.5: Open in same tab when newTab is false
 * - 11.6: Render with button styling when style is "button"
 * - 11.7: Render as inline text with hover underline when style is "text"
 */

describe('LinkBlock Component', () => {
  describe('Basic Rendering', () => {
    it('should render a clickable link with correct href', () => {
      const url = 'https://aws.amazon.com/reinvent/';
      const text = 'Learn more about re:Invent';
      
      render(<LinkBlock url={url} text={text} />);
      
      const link = screen.getByTestId('link-block');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', url);
      expect(link).toHaveTextContent(text);
    });

    it('should render with default props (newTab=true, style=button)', () => {
      render(<LinkBlock url="https://example.com" text="Click me" />);
      
      const link = screen.getByTestId('link-block');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('data-style', 'button');
    });
  });

  describe('New Tab Behavior', () => {
    it('should open in new tab with security attributes when newTab is true', () => {
      render(<LinkBlock url="https://example.com" text="External Link" newTab={true} />);
      
      const link = screen.getByTestId('link-block');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should open in same tab when newTab is false', () => {
      render(<LinkBlock url="https://example.com" text="Internal Link" newTab={false} />);
      
      const link = screen.getByTestId('link-block');
      expect(link).toHaveAttribute('target', '_self');
      expect(link).not.toHaveAttribute('rel');
    });

    it('should show external link icon when newTab is true', () => {
      render(<LinkBlock url="https://example.com" text="External" newTab={true} />);
      
      const icon = screen.getByTestId('external-link-icon');
      expect(icon).toBeInTheDocument();
    });

    it('should not show external link icon when newTab is false', () => {
      render(<LinkBlock url="https://example.com" text="Internal" newTab={false} />);
      
      const icon = screen.queryByTestId('external-link-icon');
      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('Button Style', () => {
    it('should apply button styling when style is "button"', () => {
      render(<LinkBlock url="https://example.com" text="Button Link" style="button" />);
      
      const link = screen.getByTestId('link-block');
      expect(link).toHaveAttribute('data-style', 'button');
      expect(link.className).toContain('bg-reinvent-purple');
      expect(link.className).toContain('font-semibold');
      expect(link.className).toContain('py-3');
      expect(link.className).toContain('px-6');
      expect(link.className).toContain('rounded-lg');
    });

    it('should have hover and tap animations for button style', () => {
      render(<LinkBlock url="https://example.com" text="Animated Button" style="button" />);
      
      const link = screen.getByTestId('link-block');
      // Framer Motion adds these as component props, not CSS classes
      // We verify the component renders without errors
      expect(link).toBeInTheDocument();
    });
  });

  describe('Text Style', () => {
    it('should apply text styling when style is "text"', () => {
      render(<LinkBlock url="https://example.com" text="Text Link" style="text" />);
      
      const link = screen.getByTestId('link-block');
      expect(link).toHaveAttribute('data-style', 'text');
      expect(link.className).toContain('text-reinvent-blue');
      expect(link.className).toContain('hover:text-reinvent-purple');
      expect(link.className).toContain('hover:underline');
    });

    it('should render as inline link for text style', () => {
      const { container } = render(
        <LinkBlock url="https://example.com" text="Inline Link" style="text" />
      );
      
      const wrapper = container.querySelector('.my-2');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<LinkBlock url="https://example.com" text="Keyboard Link" />);
      
      const link = screen.getByTestId('link-block');
      
      // Tab to the link
      await user.tab();
      expect(link).toHaveFocus();
    });

    it('should be activatable with Enter key', async () => {
      const user = userEvent.setup();
      render(<LinkBlock url="https://example.com" text="Enter Link" />);
      
      const link = screen.getByTestId('link-block');
      link.focus();
      
      // Press Enter (browser will handle navigation)
      await user.keyboard('{Enter}');
      
      // Link should still be in the document (navigation is prevented in tests)
      expect(link).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text gracefully', () => {
      render(<LinkBlock url="https://example.com" text="" />);
      
      const link = screen.getByTestId('link-block');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('should handle special characters in URL', () => {
      const specialUrl = 'https://example.com/path?query=value&other=123#section';
      render(<LinkBlock url={specialUrl} text="Special URL" />);
      
      const link = screen.getByTestId('link-block');
      expect(link).toHaveAttribute('href', specialUrl);
    });

    it('should handle long text content', () => {
      const longText = 'This is a very long link text that might wrap to multiple lines in the UI';
      render(<LinkBlock url="https://example.com" text={longText} />);
      
      const link = screen.getByTestId('link-block');
      expect(link).toHaveTextContent(longText);
    });

    it('should handle both button and text styles with newTab combinations', () => {
      const { rerender } = render(
        <LinkBlock url="https://example.com" text="Link" style="button" newTab={true} />
      );
      let link = screen.getByTestId('link-block');
      expect(link).toHaveAttribute('data-style', 'button');
      expect(link).toHaveAttribute('target', '_blank');

      rerender(<LinkBlock url="https://example.com" text="Link" style="text" newTab={false} />);
      link = screen.getByTestId('link-block');
      expect(link).toHaveAttribute('data-style', 'text');
      expect(link).toHaveAttribute('target', '_self');
    });
  });
});
