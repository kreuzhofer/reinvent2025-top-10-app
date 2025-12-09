import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import LinkBlock from './LinkBlock';

/**
 * Property-Based Tests for LinkBlock Component
 * 
 * These tests verify universal properties that should hold across all inputs.
 */

describe('LinkBlock Property-Based Tests', () => {
  /**
   * Feature: ui-progress-and-layout-improvements, Property 12: Link new tab behavior
   * Validates: Requirements 11.4
   * 
   * For any link block with newTab set to true, the rendered anchor element should have
   * target="_blank" and rel="noopener noreferrer" attributes
   */
  it('Property 12: should set correct attributes when newTab is true', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('button', 'text'),
        (url, text, style) => {
          const { container } = render(
            <LinkBlock url={url} text={text} newTab={true} style={style as 'button' | 'text'} />
          );

          const link = container.querySelector('a');
          expect(link).toBeTruthy();
          expect(link?.getAttribute('target')).toBe('_blank');
          expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: ui-progress-and-layout-improvements, Property 12: Link new tab behavior
   * Validates: Requirements 11.4, 11.5
   * 
   * For any link block with newTab set to false, the rendered anchor element should have
   * target="_self" and no rel attribute
   */
  it('Property 12: should set correct attributes when newTab is false', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('button', 'text'),
        (url, text, style) => {
          const { container } = render(
            <LinkBlock url={url} text={text} newTab={false} style={style as 'button' | 'text'} />
          );

          const link = container.querySelector('a');
          expect(link).toBeTruthy();
          expect(link?.getAttribute('target')).toBe('_self');
          expect(link?.getAttribute('rel')).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: ui-progress-and-layout-improvements, Property 13: Link style consistency
   * Validates: Requirements 11.6
   * 
   * For any link block with style property set to "button", the rendered element should
   * apply the corresponding CSS classes for button style
   */
  it('Property 13: should apply button styling when style is "button"', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.boolean(),
        (url, text, newTab) => {
          const { container } = render(
            <LinkBlock url={url} text={text} newTab={newTab} style="button" />
          );

          const link = container.querySelector('a');
          expect(link).toBeTruthy();
          expect(link?.getAttribute('data-style')).toBe('button');
          expect(link?.className).toContain('bg-reinvent-purple');
          expect(link?.className).toContain('font-semibold');
          expect(link?.className).toContain('py-3');
          expect(link?.className).toContain('px-6');
          expect(link?.className).toContain('rounded-lg');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: ui-progress-and-layout-improvements, Property 13: Link style consistency
   * Validates: Requirements 11.7
   * 
   * For any link block with style property set to "text", the rendered element should
   * apply the corresponding CSS classes for text style
   */
  it('Property 13: should apply text styling when style is "text"', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.boolean(),
        (url, text, newTab) => {
          const { container } = render(
            <LinkBlock url={url} text={text} newTab={newTab} style="text" />
          );

          const link = container.querySelector('a');
          expect(link).toBeTruthy();
          expect(link?.getAttribute('data-style')).toBe('text');
          expect(link?.className).toContain('text-reinvent-blue');
          expect(link?.className).toContain('hover:text-reinvent-purple');
          expect(link?.className).toContain('hover:underline');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: External link icon should only appear when newTab is true
   */
  it('should show external link icon only when newTab is true', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('button', 'text'),
        (url, text, style) => {
          // Test with newTab=true
          const { container: containerTrue } = render(
            <LinkBlock url={url} text={text} newTab={true} style={style as 'button' | 'text'} />
          );
          const iconTrue = containerTrue.querySelector('[data-testid="external-link-icon"]');
          expect(iconTrue).toBeTruthy();

          // Test with newTab=false
          const { container: containerFalse } = render(
            <LinkBlock url={url} text={text} newTab={false} style={style as 'button' | 'text'} />
          );
          const iconFalse = containerFalse.querySelector('[data-testid="external-link-icon"]');
          expect(iconFalse).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
