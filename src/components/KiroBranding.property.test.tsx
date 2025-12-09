import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import fc from 'fast-check';
import { KiroBranding } from './KiroBranding';

/**
 * Property-Based Tests for KiroBranding Component
 * Feature: kiro-branding-control
 */

describe('KiroBranding Property Tests', () => {
  /**
   * Property 1: Component structure is consistent
   * Validates: Requirements 1.2
   */
  it('Property 1: should always render with "Made with", logo, and "Kiro" text in order', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcome' as const, 'header' as const),
        (variant) => {
          const { container } = render(<KiroBranding variant={variant} />);
          const link = container.querySelector('a');
          
          expect(link).toBeTruthy();
          
          // Check for "Made with" text
          const madeWithSpan = link?.querySelector('span.text-gray-300');
          expect(madeWithSpan?.textContent).toBe('Made with');
          
          // Check for logo (may be hidden if error occurred)
          const logo = link?.querySelector('img[alt="Kiro logo"]');
          
          // Check for "Kiro" text
          const spans = link?.querySelectorAll('span');
          const kiroSpan = Array.from(spans || []).find(span => 
            span.textContent === 'Kiro' && !span.classList.contains('text-gray-300')
          );
          expect(kiroSpan).toBeTruthy();
          
          // Verify order: "Made with" comes before logo, logo comes before "Kiro"
          if (logo && madeWithSpan && kiroSpan) {
            const children = Array.from(link?.children || []);
            const madeWithIndex = children.indexOf(madeWithSpan);
            const logoIndex = children.indexOf(logo);
            const kiroIndex = children.indexOf(kiroSpan);
            
            expect(madeWithIndex).toBeLessThan(logoIndex);
            expect(logoIndex).toBeLessThan(kiroIndex);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Logo source path is correct
   * Validates: Requirements 1.3
   */
  it('Property 2: should always use correct logo source path', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcome' as const, 'header' as const),
        (variant) => {
          const { container } = render(<KiroBranding variant={variant} />);
          const logo = container.querySelector('img[alt="Kiro logo"]');
          
          if (logo) {
            expect(logo.getAttribute('src')).toBe('/data/icons/aws/kiro.svg');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Border styling matches audio controls
   * Validates: Requirements 1.5, 5.1, 5.2
   */
  it('Property 3: should have border styling consistent with audio controls', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcome' as const, 'header' as const),
        (variant) => {
          const { container } = render(<KiroBranding variant={variant} />);
          const link = container.querySelector('a');
          
          expect(link?.classList.contains('border')).toBe(true);
          expect(link?.classList.contains('border-gray-700')).toBe(true);
          expect(link?.classList.contains('rounded-lg')).toBe(true);
          expect(link?.classList.contains('bg-gray-800')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Link behavior is correct
   * Validates: Requirements 4.1, 4.2, 4.3
   */
  it('Property 6: should always have correct link attributes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcome' as const, 'header' as const),
        (variant) => {
          const { container } = render(<KiroBranding variant={variant} />);
          const link = container.querySelector('a');
          
          expect(link?.getAttribute('href')).toBe('https://kiro.dev');
          expect(link?.getAttribute('target')).toBe('_blank');
          expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Hover state provides visual feedback
   * Validates: Requirements 4.4
   */
  it('Property 7: should have hover state classes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcome' as const, 'header' as const),
        (variant) => {
          const { container } = render(<KiroBranding variant={variant} />);
          const link = container.querySelector('a');
          
          expect(link?.classList.contains('hover:bg-gray-700')).toBe(true);
          expect(link?.classList.contains('transition-colors')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Typography is consistent
   * Validates: Requirements 5.3
   */
  it('Property 9: should have consistent typography', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcome' as const, 'header' as const),
        (variant) => {
          const { container } = render(<KiroBranding variant={variant} />);
          const link = container.querySelector('a');
          
          expect(link?.classList.contains('text-white')).toBe(true);
          
          const madeWithSpan = link?.querySelector('span.text-gray-300');
          expect(madeWithSpan).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10: Logo is sized proportionally
   * Validates: Requirements 5.4
   */
  it('Property 10: should size logo proportionally to variant', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcome' as const, 'header' as const),
        (variant) => {
          const { container } = render(<KiroBranding variant={variant} />);
          const logo = container.querySelector('img[alt="Kiro logo"]');
          
          if (logo) {
            if (variant === 'welcome') {
              expect(logo.classList.contains('h-6')).toBe(true);
            } else {
              expect(logo.classList.contains('h-5')).toBe(true);
            }
            expect(logo.classList.contains('w-auto')).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11: Padding matches button controls
   * Validates: Requirements 5.5
   */
  it('Property 11: should have padding consistent with button controls', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcome' as const, 'header' as const),
        (variant) => {
          const { container } = render(<KiroBranding variant={variant} />);
          const link = container.querySelector('a');
          
          if (variant === 'welcome') {
            expect(link?.classList.contains('p-3')).toBe(true);
          } else {
            expect(link?.classList.contains('p-2')).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: Variant prop affects rendering
   * Validates: Requirements 6.2
   */
  it('Property 12: should render differently based on variant prop', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcome' as const, 'header' as const),
        (variant) => {
          const { container } = render(<KiroBranding variant={variant} />);
          const link = container.querySelector('a');
          const logo = container.querySelector('img[alt="Kiro logo"]');
          
          if (variant === 'welcome') {
            expect(link?.classList.contains('text-base')).toBe(true);
            expect(link?.classList.contains('p-3')).toBe(true);
            if (logo) {
              expect(logo.classList.contains('h-6')).toBe(true);
            }
          } else {
            expect(link?.classList.contains('text-sm')).toBe(true);
            expect(link?.classList.contains('p-2')).toBe(true);
            if (logo) {
              expect(logo.classList.contains('h-5')).toBe(true);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13: Logo is positioned between text
   * Validates: Requirements 7.1
   */
  it('Property 13: should position logo between "Made with" and "Kiro" text', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcome' as const, 'header' as const),
        (variant) => {
          const { container } = render(<KiroBranding variant={variant} />);
          const link = container.querySelector('a');
          const logo = link?.querySelector('img[alt="Kiro logo"]');
          
          if (logo) {
            const children = Array.from(link?.children || []);
            const logoIndex = children.indexOf(logo);
            
            // Logo should not be first or last
            expect(logoIndex).toBeGreaterThan(0);
            expect(logoIndex).toBeLessThan(children.length - 1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 14: Logo maintains aspect ratio
   * Validates: Requirements 7.2
   */
  it('Property 14: should maintain logo aspect ratio with w-auto', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcome' as const, 'header' as const),
        (variant) => {
          const { container } = render(<KiroBranding variant={variant} />);
          const logo = container.querySelector('img[alt="Kiro logo"]');
          
          if (logo) {
            expect(logo.classList.contains('w-auto')).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 15: Logo is vertically centered
   * Validates: Requirements 7.4
   */
  it('Property 15: should vertically center logo with flex alignment', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcome' as const, 'header' as const),
        (variant) => {
          const { container } = render(<KiroBranding variant={variant} />);
          const link = container.querySelector('a');
          
          expect(link?.classList.contains('flex')).toBe(true);
          expect(link?.classList.contains('items-center')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 16: Logo error handling preserves layout
   * Validates: Requirements 7.5
   */
  it('Property 16: should handle logo error without breaking layout', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcome' as const, 'header' as const),
        (variant) => {
          const { container } = render(<KiroBranding variant={variant} />);
          const link = container.querySelector('a');
          const logo = container.querySelector('img[alt="Kiro logo"]');
          
          // Simulate error
          if (logo) {
            const errorEvent = new Event('error');
            logo.dispatchEvent(errorEvent);
          }
          
          // Component should still render with text
          expect(link).toBeTruthy();
          expect(link?.textContent).toContain('Made with');
          expect(link?.textContent).toContain('Kiro');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 17: Component is responsive
   * Validates: Requirements 8.1, 8.2, 8.3
   */
  it('Property 17: should have responsive classes for different variants', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcome' as const, 'header' as const),
        (variant) => {
          const { container } = render(<KiroBranding variant={variant} />);
          const link = container.querySelector('a');
          const logo = container.querySelector('img[alt="Kiro logo"]');
          
          // Verify variant-specific sizing
          if (variant === 'welcome') {
            expect(link?.classList.contains('text-base')).toBe(true);
            if (logo) {
              expect(logo.classList.contains('h-6')).toBe(true);
            }
          } else {
            expect(link?.classList.contains('text-sm')).toBe(true);
            if (logo) {
              expect(logo.classList.contains('h-5')).toBe(true);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
