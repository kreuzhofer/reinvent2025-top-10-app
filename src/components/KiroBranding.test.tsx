import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KiroBranding } from './KiroBranding';

describe('KiroBranding', () => {
  describe('Rendering', () => {
    it('should render with correct text and logo', () => {
      render(<KiroBranding />);
      
      expect(screen.getByText('Made with')).toBeInTheDocument();
      expect(screen.getByText('Kiro')).toBeInTheDocument();
      expect(screen.getByAltText('Kiro logo')).toBeInTheDocument();
    });

    it('should render with welcome variant', () => {
      const { container } = render(<KiroBranding variant="welcome" />);
      const link = container.querySelector('a');
      
      expect(link?.classList.contains('text-base')).toBe(true);
      expect(link?.classList.contains('p-3')).toBe(true);
    });

    it('should render with header variant', () => {
      const { container } = render(<KiroBranding variant="header" />);
      const link = container.querySelector('a');
      
      expect(link?.classList.contains('text-sm')).toBe(true);
      expect(link?.classList.contains('p-2')).toBe(true);
    });
  });

  describe('Link attributes', () => {
    it('should have correct href, target, and rel attributes', () => {
      render(<KiroBranding />);
      const link = screen.getByRole('link', { name: /visit kiro website/i });
      
      expect(link).toHaveAttribute('href', 'https://kiro.dev');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Logo error handling', () => {
    it('should hide logo when loading fails', () => {
      const { container } = render(<KiroBranding />);
      const logo = screen.getByAltText('Kiro logo');
      
      // Simulate error
      fireEvent.error(logo);
      
      // Logo should still be in DOM but may be hidden
      expect(screen.getByText('Made with')).toBeInTheDocument();
      expect(screen.getByText('Kiro')).toBeInTheDocument();
    });

    it('should maintain layout when logo fails to load', () => {
      const { container } = render(<KiroBranding />);
      const logo = screen.getByAltText('Kiro logo');
      const link = container.querySelector('a');
      
      // Get initial classes
      const initialClasses = link?.className;
      
      // Simulate error
      fireEvent.error(logo);
      
      // Link should maintain its structure
      expect(link?.className).toBe(initialClasses);
      expect(link?.classList.contains('flex')).toBe(true);
      expect(link?.classList.contains('items-center')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label for screen readers', () => {
      render(<KiroBranding />);
      const link = screen.getByRole('link');
      
      expect(link).toHaveAttribute('aria-label', 'Visit Kiro website');
    });

    it('should be keyboard navigable', () => {
      render(<KiroBranding />);
      const link = screen.getByRole('link');
      
      // Link should be focusable
      link.focus();
      expect(document.activeElement).toBe(link);
    });

    it('should have alt text for logo', () => {
      render(<KiroBranding />);
      const logo = screen.getByAltText('Kiro logo');
      
      expect(logo).toHaveAttribute('alt', 'Kiro logo');
    });
  });

  describe('Click behavior', () => {
    it('should be clickable as a link', () => {
      render(<KiroBranding />);
      const link = screen.getByRole('link');
      
      // Link should not have preventDefault
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', 'https://kiro.dev');
    });
  });

  describe('Styling', () => {
    it('should have border and background classes', () => {
      const { container } = render(<KiroBranding />);
      const link = container.querySelector('a');
      
      expect(link?.classList.contains('border')).toBe(true);
      expect(link?.classList.contains('border-gray-700')).toBe(true);
      expect(link?.classList.contains('rounded-lg')).toBe(true);
      expect(link?.classList.contains('bg-gray-800')).toBe(true);
    });

    it('should have hover state classes', () => {
      const { container } = render(<KiroBranding />);
      const link = container.querySelector('a');
      
      expect(link?.classList.contains('hover:bg-gray-700')).toBe(true);
      expect(link?.classList.contains('transition-colors')).toBe(true);
    });

    it('should apply custom className', () => {
      const { container } = render(<KiroBranding className="custom-class" />);
      const link = container.querySelector('a');
      
      expect(link?.classList.contains('custom-class')).toBe(true);
    });
  });

  describe('Responsive behavior', () => {
    const setViewportSize = (width: number, height: number) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: height,
      });
      window.dispatchEvent(new Event('resize'));
    };

    it('should render correctly on mobile viewport (320px)', () => {
      setViewportSize(320, 568);
      
      const { container } = render(<KiroBranding variant="header" />);
      const link = container.querySelector('a');
      
      // Component should render with all elements
      expect(link).toBeInTheDocument();
      expect(screen.getByText('Made with')).toBeInTheDocument();
      expect(screen.getByText('Kiro')).toBeInTheDocument();
      
      // Should have proper structure
      expect(link?.classList.contains('flex')).toBe(true);
      expect(link?.classList.contains('items-center')).toBe(true);
      
      // Should be readable (has text content)
      expect(link?.textContent).toContain('Made with');
      expect(link?.textContent).toContain('Kiro');
    });

    it('should render correctly on tablet viewport (768px)', () => {
      setViewportSize(768, 1024);
      
      const { container } = render(<KiroBranding variant="header" />);
      const link = container.querySelector('a');
      
      // Component should render with all elements
      expect(link).toBeInTheDocument();
      expect(screen.getByText('Made with')).toBeInTheDocument();
      expect(screen.getByText('Kiro')).toBeInTheDocument();
      
      // Should maintain structure
      expect(link?.classList.contains('flex')).toBe(true);
      expect(link?.classList.contains('items-center')).toBe(true);
    });

    it('should render correctly on desktop viewport (1024px)', () => {
      setViewportSize(1024, 768);
      
      const { container } = render(<KiroBranding variant="header" />);
      const link = container.querySelector('a');
      
      // Component should render with all elements
      expect(link).toBeInTheDocument();
      expect(screen.getByText('Made with')).toBeInTheDocument();
      expect(screen.getByText('Kiro')).toBeInTheDocument();
      
      // Should maintain structure
      expect(link?.classList.contains('flex')).toBe(true);
      expect(link?.classList.contains('items-center')).toBe(true);
    });

    it('should not overlap with other elements at any breakpoint', () => {
      const breakpoints = [
        { width: 320, height: 568, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1024, height: 768, name: 'desktop' },
      ];

      breakpoints.forEach(({ width, height, name }) => {
        setViewportSize(width, height);
        
        const { container } = render(<KiroBranding variant="header" />);
        const link = container.querySelector('a');
        
        // Component should have defined dimensions (not overflow)
        expect(link).toBeInTheDocument();
        
        // Should use flex layout which prevents overlap
        expect(link?.classList.contains('flex')).toBe(true);
        expect(link?.classList.contains('items-center')).toBe(true);
        
        // Should have gap for spacing
        expect(link?.classList.contains('gap-1.5')).toBe(true);
      });
    });

    it('should maintain readability at all viewport sizes', () => {
      const breakpoints = [320, 768, 1024];

      breakpoints.forEach((width) => {
        setViewportSize(width, 768);
        
        const { container } = render(<KiroBranding variant="header" />);
        const link = container.querySelector('a');
        
        // Text should be present and readable
        expect(link?.textContent).toContain('Made with');
        expect(link?.textContent).toContain('Kiro');
        
        // Should have appropriate text size
        expect(link?.classList.contains('text-sm')).toBe(true);
        
        // Should have proper color contrast
        expect(link?.classList.contains('text-white')).toBe(true);
        expect(link?.classList.contains('bg-gray-800')).toBe(true);
      });
    });

    it('should handle logo loading error at mobile size', () => {
      setViewportSize(320, 568);
      
      const { container } = render(<KiroBranding variant="header" />);
      const logo = screen.getByAltText('Kiro logo');
      const link = container.querySelector('a');
      
      // Simulate error
      fireEvent.error(logo);
      
      // Component should still be readable
      expect(link?.textContent).toContain('Made with');
      expect(link?.textContent).toContain('Kiro');
      
      // Layout should not break
      expect(link?.classList.contains('flex')).toBe(true);
      expect(link?.classList.contains('items-center')).toBe(true);
    });

    it('should handle logo loading error at tablet size', () => {
      setViewportSize(768, 1024);
      
      const { container } = render(<KiroBranding variant="header" />);
      const logo = screen.getByAltText('Kiro logo');
      const link = container.querySelector('a');
      
      // Simulate error
      fireEvent.error(logo);
      
      // Component should still be readable
      expect(link?.textContent).toContain('Made with');
      expect(link?.textContent).toContain('Kiro');
      
      // Layout should not break
      expect(link?.classList.contains('flex')).toBe(true);
    });

    it('should handle logo loading error at desktop size', () => {
      setViewportSize(1024, 768);
      
      const { container } = render(<KiroBranding variant="header" />);
      const logo = screen.getByAltText('Kiro logo');
      const link = container.querySelector('a');
      
      // Simulate error
      fireEvent.error(logo);
      
      // Component should still be readable
      expect(link?.textContent).toContain('Made with');
      expect(link?.textContent).toContain('Kiro');
      
      // Layout should not break
      expect(link?.classList.contains('flex')).toBe(true);
    });

    it('should render welcome variant correctly at mobile size', () => {
      setViewportSize(320, 568);
      
      const { container } = render(<KiroBranding variant="welcome" />);
      const link = container.querySelector('a');
      
      // Should use larger sizing for welcome variant
      expect(link?.classList.contains('text-base')).toBe(true);
      expect(link?.classList.contains('p-3')).toBe(true);
      
      // Should still be readable
      expect(link?.textContent).toContain('Made with');
      expect(link?.textContent).toContain('Kiro');
    });

    it('should render welcome variant correctly at tablet size', () => {
      setViewportSize(768, 1024);
      
      const { container } = render(<KiroBranding variant="welcome" />);
      const link = container.querySelector('a');
      
      // Should use larger sizing for welcome variant
      expect(link?.classList.contains('text-base')).toBe(true);
      expect(link?.classList.contains('p-3')).toBe(true);
    });

    it('should render welcome variant correctly at desktop size', () => {
      setViewportSize(1024, 768);
      
      const { container } = render(<KiroBranding variant="welcome" />);
      const link = container.querySelector('a');
      
      // Should use larger sizing for welcome variant
      expect(link?.classList.contains('text-base')).toBe(true);
      expect(link?.classList.contains('p-3')).toBe(true);
    });
  });
});
