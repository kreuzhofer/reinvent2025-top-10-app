import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import ContentSlide from './ContentSlide';
import type { ContentSlide as ContentSlideType, ContentBlock } from '../types/quiz.types';

/**
 * Property-Based Tests for ContentSlide Component
 * 
 * Feature: reinvent-quiz-app
 * 
 * These tests verify universal properties that should hold across all valid inputs.
 */

describe('ContentSlide Property-Based Tests', () => {
  // Clean up after each test to prevent DOM pollution
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 2: Content block rendering completeness
   * 
   * For any content slide with a set of content blocks, the rendered output should 
   * contain elements corresponding to each content block specified in the slide data.
   * 
   * **Feature: reinvent-quiz-app, Property 2: Content block rendering completeness**
   * **Validates: Requirements 1.3**
   */
  it('Property 2: renders all content blocks specified in slide data', () => {
    fc.assert(
      fc.property(
        arbitraryContentSlide(),
        (slide) => {
          const mockOnNext = () => {};
          const { container, unmount } = render(<ContentSlide slide={slide} onNext={mockOnNext} />);

          try {
            // Verify that each content block type is rendered
            slide.content.forEach((block) => {
            switch (block.type) {
              case 'text':
                // Text blocks should render with the text content
                expect(container.textContent).toContain(block.text);
                break;
              case 'image':
                // Image blocks should render an img element
                const images = screen.queryAllByTestId('image-block-img');
                expect(images.length).toBeGreaterThan(0);
                break;
              case 'icon':
                // Icon blocks should render
                const icons = screen.queryAllByTestId('icon-block');
                expect(icons.length).toBeGreaterThan(0);
                break;
              case 'list':
                // List blocks should render list items
                const lists = screen.queryAllByTestId('list-block-items');
                expect(lists.length).toBeGreaterThan(0);
                break;
              case 'stat':
                // Stat blocks should render with value and label
                expect(container.textContent).toContain(block.value);
                expect(container.textContent).toContain(block.label);
                break;
              case 'callout':
                // Callout blocks should render
                const callouts = screen.queryAllByTestId('callout-box');
                expect(callouts.length).toBeGreaterThan(0);
                break;
              case 'quote':
                // Quote blocks should render
                const quotes = screen.queryAllByTestId('quote-block');
                expect(quotes.length).toBeGreaterThan(0);
                break;
              case 'grid':
                // Grid blocks should render
                const grids = screen.queryAllByTestId('grid-layout');
                expect(grids.length).toBeGreaterThan(0);
                break;
            }
          });

            // Verify the slide title is rendered (trim for whitespace normalization)
            const titleElement = screen.getByTestId('content-slide-title');
            expect(titleElement.textContent?.trim()).toBe(slide.title.trim());

            // Verify navigation button is present
            expect(screen.getByTestId('next-button')).toBeInTheDocument();
          } finally {
            // Clean up after each property test iteration
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 21: List title rendering
   * 
   * For any list block with a title field, the rendered output should display 
   * the title above the list items.
   * 
   * **Feature: reinvent-quiz-app, Property 21: List title rendering**
   * **Validates: Requirements 13.4**
   */
  it('Property 21: renders list title above list items when title is present', () => {
    fc.assert(
      fc.property(
        arbitraryListBlockWithTitle(),
        (listBlock) => {
          const slide: ContentSlideType = {
            type: 'content',
            id: 'test-slide',
            title: 'Test Slide',
            content: [listBlock],
          };

          const mockOnNext = () => {};
          const { unmount } = render(<ContentSlide slide={slide} onNext={mockOnNext} />);

          try {
            // Verify the title is rendered (trim for whitespace normalization)
            const titleElement = screen.getByTestId('list-block-title');
            expect(titleElement.textContent?.trim()).toBe(listBlock.title!.trim());

            // Verify the list items are rendered
            const listItems = screen.getByTestId('list-block-items');
            expect(listItems).toBeInTheDocument();

            // Verify all items are present
            listBlock.items.forEach((item) => {
              expect(listItems.textContent).toContain(item);
            });
          } finally {
            // Clean up after each property test iteration
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Arbitrary Generators for Property-Based Testing
// ============================================================================

/**
 * Generates arbitrary ContentSlide data with various content blocks
 */
function arbitraryContentSlide(): fc.Arbitrary<ContentSlideType> {
  return fc.record({
    type: fc.constant('content' as const),
    id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
    title: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
    content: fc.array(arbitraryContentBlock(), { minLength: 1, maxLength: 8 }),
  });
}

/**
 * Generates arbitrary ContentBlock (union of all block types)
 */
function arbitraryContentBlock(): fc.Arbitrary<ContentBlock> {
  return fc.oneof(
    arbitraryTextBlock(),
    arbitraryImageBlock(),
    arbitraryIconBlock(),
    arbitraryListBlock(),
    arbitraryStatBlock(),
    arbitraryCalloutBlock(),
    arbitraryQuoteBlock(),
    arbitraryGridBlock()
  );
}

/**
 * Generates arbitrary TextBlock
 */
function arbitraryTextBlock(): fc.Arbitrary<ContentBlock> {
  return fc.record({
    type: fc.constant('text' as const),
    text: fc.string({ minLength: 10, maxLength: 200 }),
    style: fc.option(fc.constantFrom('heading', 'subheading', 'body', 'caption'), { nil: undefined }),
    emphasis: fc.option(fc.constantFrom('bold', 'italic', 'highlight'), { nil: undefined }),
  });
}

/**
 * Generates arbitrary ImageBlock
 */
function arbitraryImageBlock(): fc.Arbitrary<ContentBlock> {
  return fc.record({
    type: fc.constant('image' as const),
    src: fc.constantFrom('test-image.png', 'diagram.jpg', 'chart.svg'),
    alt: fc.string({ minLength: 5, maxLength: 100 }),
    caption: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined }),
    size: fc.option(fc.constantFrom('small', 'medium', 'large', 'full'), { nil: undefined }),
  });
}

/**
 * Generates arbitrary IconBlock
 */
function arbitraryIconBlock(): fc.Arbitrary<ContentBlock> {
  return fc.oneof(
    // AWS icons
    fc.record({
      type: fc.constant('icon' as const),
      iconType: fc.constant('aws' as const),
      iconName: fc.constantFrom('lambda', 's3', 'dynamodb', 'ec2', 'rds'),
      label: fc.option(fc.string({ minLength: 3, maxLength: 50 }), { nil: undefined }),
      size: fc.option(fc.constantFrom('small', 'medium', 'large'), { nil: undefined }),
    }),
    // Lucide icons
    fc.record({
      type: fc.constant('icon' as const),
      iconType: fc.constant('lucide' as const),
      iconName: fc.constantFrom('check-circle', 'star', 'database', 'info', 'alert-triangle'),
      label: fc.option(fc.string({ minLength: 3, maxLength: 50 }), { nil: undefined }),
      size: fc.option(fc.constantFrom('small', 'medium', 'large'), { nil: undefined }),
    })
  );
}

/**
 * Generates arbitrary ListBlock
 */
function arbitraryListBlock(): fc.Arbitrary<ContentBlock> {
  return fc.record({
    type: fc.constant('list' as const),
    title: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
    items: fc.array(fc.string({ minLength: 5, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
    ordered: fc.option(fc.boolean(), { nil: undefined }),
  });
}

/**
 * Generates arbitrary ListBlock WITH a title (for Property 21)
 */
function arbitraryListBlockWithTitle(): fc.Arbitrary<ContentBlock & { type: 'list'; title: string }> {
  return fc.record({
    type: fc.constant('list' as const),
    title: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
    items: fc.array(fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0), { minLength: 1, maxLength: 10 }),
    ordered: fc.option(fc.boolean(), { nil: undefined }),
  });
}

/**
 * Generates arbitrary StatBlock
 */
function arbitraryStatBlock(): fc.Arbitrary<ContentBlock> {
  return fc.record({
    type: fc.constant('stat' as const),
    value: fc.constantFrom('10x', '99.99%', '< 1ms', '1M+', '50%'),
    label: fc.string({ minLength: 5, maxLength: 50 }),
    color: fc.option(fc.constantFrom('purple', 'blue', 'red', 'yellow', 'orange', 'green'), { nil: undefined }),
  });
}

/**
 * Generates arbitrary CalloutBlock
 */
function arbitraryCalloutBlock(): fc.Arbitrary<ContentBlock> {
  return fc.record({
    type: fc.constant('callout' as const),
    text: fc.string({ minLength: 10, maxLength: 200 }),
    style: fc.constantFrom('info' as const, 'success' as const, 'warning' as const),
  });
}

/**
 * Generates arbitrary QuoteBlock
 */
function arbitraryQuoteBlock(): fc.Arbitrary<ContentBlock> {
  return fc.record({
    type: fc.constant('quote' as const),
    text: fc.string({ minLength: 20, maxLength: 200 }),
    author: fc.string({ minLength: 3, maxLength: 50 }),
  });
}

/**
 * Generates arbitrary GridBlock
 */
function arbitraryGridBlock(): fc.Arbitrary<ContentBlock> {
  return fc.record({
    type: fc.constant('grid' as const),
    columns: fc.integer({ min: 1, max: 4 }),
    items: fc.array(
      fc.record({
        icon: fc.option(fc.constantFrom('check-circle', 'star', 'database'), { nil: undefined }),
        title: fc.string({ minLength: 5, maxLength: 50 }),
        description: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined }),
        stats: fc.option(fc.array(fc.string({ minLength: 3, maxLength: 20 }), { maxLength: 3 }), { nil: undefined }),
        features: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 50 }), { maxLength: 5 }), { nil: undefined }),
        stat: fc.option(fc.string({ minLength: 2, maxLength: 20 }), { nil: undefined }),
        color: fc.option(fc.string({ minLength: 3, maxLength: 20 }), { nil: undefined }),
      }),
      { minLength: 1, maxLength: 6 }
    ),
  });
}
