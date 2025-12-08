import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import GridLayout from './GridLayout';
import type { GridItem } from '../types/quiz.types';

/**
 * Property-Based Tests for GridLayout Component
 * 
 * Feature: reinvent-quiz-app, Property 20: Grid layout rendering
 * Validates: Requirements 13.3
 * 
 * Property 20: Grid layout rendering
 * For any content slide containing a grid block with N columns, the rendered
 * output should display items in an N-column layout.
 */

describe('GridLayout Property-Based Tests', () => {
  /**
   * Property 20: Grid layout rendering
   * 
   * For any grid block with N columns and a set of items, the component should:
   * - Render a grid container with the correct column count
   * - Display all grid items
   * - Apply appropriate responsive grid classes
   */
  it('Property 20: Grid layout rendering - renders items in N-column layout', () => {
    // Generator for column count (1-4 columns)
    const columnsArb = fc.integer({ min: 1, max: 4 });
    
    // Generator for grid items
    const gridItemArb: fc.Arbitrary<GridItem> = fc.record({
      title: fc.string({ minLength: 1, maxLength: 50 }),
      description: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
      icon: fc.option(fc.constantFrom('check-circle', 'star', 'zap', 'database')),
      stat: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
      stats: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 5 })),
      features: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 })),
      color: fc.option(fc.constantFrom('purple', 'blue', 'red', 'yellow', 'orange', 'green')),
    });

    const gridItemsArb = fc.array(gridItemArb, { minLength: 1, maxLength: 12 });

    fc.assert(
      fc.property(
        columnsArb,
        gridItemsArb,
        (columns, items) => {
          const { unmount } = render(<GridLayout columns={columns} items={items} />);

          // Property 1: Grid layout container should be present
          const gridLayout = screen.getByTestId('grid-layout');
          expect(gridLayout).toBeInTheDocument();

          // Property 2: The column count should be stored in data attribute
          expect(gridLayout).toHaveAttribute('data-columns', columns.toString());

          // Property 3: All grid items should be rendered
          const gridItems = screen.getAllByTestId('grid-item');
          expect(gridItems).toHaveLength(items.length);

          // Property 4: Each item should have a title
          const titles = screen.getAllByTestId('grid-item-title');
          expect(titles).toHaveLength(items.length);

          // Property 5: Grid should have grid display class
          expect(gridLayout.className).toMatch(/grid/);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Grid items with icons render icons
   * 
   * For any grid item that includes an icon, the icon should be rendered
   * alongside the item content.
   */
  it('Property: Grid items with icons render icons alongside content', () => {
    const gridItemWithIconArb: fc.Arbitrary<GridItem> = fc.record({
      title: fc.string({ minLength: 1, maxLength: 50 }),
      icon: fc.constantFrom('check-circle', 'star', 'zap', 'database'),
    });

    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }),
        fc.array(gridItemWithIconArb, { minLength: 1, maxLength: 6 }),
        (columns, items) => {
          const { unmount } = render(<GridLayout columns={columns} items={items} />);

          // Property: Each item with an icon should render an icon element
          const icons = screen.getAllByTestId('grid-item-icon');
          expect(icons.length).toBeGreaterThan(0);
          expect(icons.length).toBeLessThanOrEqual(items.length);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Grid items with descriptions render descriptions
   * 
   * For any grid item that includes a description, the description should
   * be rendered in the grid item.
   */
  it('Property: Grid items with descriptions render descriptions', () => {
    const gridItemWithDescArb: fc.Arbitrary<GridItem> = fc.record({
      title: fc.string({ minLength: 1, maxLength: 50 }),
      description: fc.string({ minLength: 1, maxLength: 100 }),
    });

    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }),
        fc.array(gridItemWithDescArb, { minLength: 1, maxLength: 6 }),
        (columns, items) => {
          const { unmount } = render(<GridLayout columns={columns} items={items} />);

          // Property: Each item with a description should render a description element
          const descriptions = screen.getAllByTestId('grid-item-description');
          expect(descriptions).toHaveLength(items.length);

          // Property: Each description should contain the correct text
          descriptions.forEach((desc, index) => {
            expect(desc.textContent).toBe(items[index].description);
          });

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Grid layout structure is consistent
   * 
   * For any valid grid configuration, the component should maintain
   * a consistent structure with proper nesting and test ids.
   */
  it('Property: Grid layout maintains consistent structure', () => {
    const columnsArb = fc.integer({ min: 1, max: 4 });
    const gridItemArb: fc.Arbitrary<GridItem> = fc.record({
      title: fc.string({ minLength: 1, maxLength: 50 }),
    });
    const gridItemsArb = fc.array(gridItemArb, { minLength: 1, maxLength: 8 });

    fc.assert(
      fc.property(
        columnsArb,
        gridItemsArb,
        (columns, items) => {
          const { unmount } = render(<GridLayout columns={columns} items={items} />);

          // Property 1: Container exists with correct test id
          expect(screen.queryByTestId('grid-layout')).toBeInTheDocument();

          // Property 2: All items exist with correct test id
          const gridItems = screen.queryAllByTestId('grid-item');
          expect(gridItems).toHaveLength(items.length);

          // Property 3: All titles exist with correct test id
          const titles = screen.queryAllByTestId('grid-item-title');
          expect(titles).toHaveLength(items.length);

          // Property 4: Each title contains the correct text
          titles.forEach((title, index) => {
            expect(title.textContent).toBe(items[index].title);
          });

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Grid items with stats render stats correctly
   * 
   * For any grid item that includes stats (either single stat or array),
   * the stats should be rendered appropriately.
   */
  it('Property: Grid items with stats render stats correctly', () => {
    const gridItemWithStatsArb: fc.Arbitrary<GridItem> = fc.record({
      title: fc.string({ minLength: 1, maxLength: 50 }),
      stats: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
    });

    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }),
        fc.array(gridItemWithStatsArb, { minLength: 1, maxLength: 4 }),
        (columns, items) => {
          const { unmount } = render(<GridLayout columns={columns} items={items} />);

          // Property: Stats elements should be present
          const statsElements = screen.getAllByTestId('grid-item-stats');
          expect(statsElements.length).toBeGreaterThan(0);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Grid items with features render features correctly
   * 
   * For any grid item that includes features array, the features should
   * be rendered as a list.
   */
  it('Property: Grid items with features render features correctly', () => {
    const gridItemWithFeaturesArb: fc.Arbitrary<GridItem> = fc.record({
      title: fc.string({ minLength: 1, maxLength: 50 }),
      features: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
    });

    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }),
        fc.array(gridItemWithFeaturesArb, { minLength: 1, maxLength: 4 }),
        (columns, items) => {
          const { unmount } = render(<GridLayout columns={columns} items={items} />);

          // Property: Features elements should be present
          const featuresElements = screen.getAllByTestId('grid-item-features');
          expect(featuresElements.length).toBeGreaterThan(0);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
