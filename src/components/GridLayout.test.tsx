import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GridLayout from './GridLayout';
import type { GridItem } from '../types/quiz.types';

/**
 * Unit Tests for GridLayout Component
 * 
 * Requirements: 13.3
 * - Test GridLayout renders with specified columns
 */

describe('GridLayout', () => {
  it('renders with 2 columns', () => {
    const items: GridItem[] = [
      { title: 'Item 1' },
      { title: 'Item 2' },
    ];
    
    render(<GridLayout columns={2} items={items} />);
    
    const gridLayout = screen.getByTestId('grid-layout');
    expect(gridLayout).toBeInTheDocument();
    expect(gridLayout).toHaveAttribute('data-columns', '2');
  });

  it('renders with 3 columns', () => {
    const items: GridItem[] = [
      { title: 'Item 1' },
      { title: 'Item 2' },
      { title: 'Item 3' },
    ];
    
    render(<GridLayout columns={3} items={items} />);
    
    const gridLayout = screen.getByTestId('grid-layout');
    expect(gridLayout).toHaveAttribute('data-columns', '3');
  });

  it('renders all grid items', () => {
    const items: GridItem[] = [
      { title: 'First Item' },
      { title: 'Second Item' },
      { title: 'Third Item' },
    ];
    
    render(<GridLayout columns={2} items={items} />);
    
    const gridItems = screen.getAllByTestId('grid-item');
    expect(gridItems).toHaveLength(3);
  });

  it('renders item titles', () => {
    const items: GridItem[] = [
      { title: 'Feature A' },
      { title: 'Feature B' },
    ];
    
    render(<GridLayout columns={2} items={items} />);
    
    expect(screen.getByText('Feature A')).toBeInTheDocument();
    expect(screen.getByText('Feature B')).toBeInTheDocument();
  });

  it('renders item descriptions when provided', () => {
    const items: GridItem[] = [
      { title: 'Item 1', description: 'Description for item 1' },
      { title: 'Item 2', description: 'Description for item 2' },
    ];
    
    render(<GridLayout columns={2} items={items} />);
    
    expect(screen.getByText('Description for item 1')).toBeInTheDocument();
    expect(screen.getByText('Description for item 2')).toBeInTheDocument();
  });

  it('renders icons when provided', () => {
    const items: GridItem[] = [
      { title: 'Item 1', icon: 'check-circle' },
      { title: 'Item 2', icon: 'star' },
    ];
    
    render(<GridLayout columns={2} items={items} />);
    
    const icons = screen.getAllByTestId('grid-item-icon');
    expect(icons).toHaveLength(2);
  });

  it('renders single stat when provided', () => {
    const items: GridItem[] = [
      { title: 'Performance', stat: '10x faster' },
    ];
    
    render(<GridLayout columns={1} items={items} />);
    
    const stat = screen.getByTestId('grid-item-stat');
    expect(stat).toHaveTextContent('10x faster');
  });

  it('renders stats array when provided', () => {
    const items: GridItem[] = [
      { title: 'Metrics', stats: ['99.99% uptime', '< 1ms latency', '1M requests/sec'] },
    ];
    
    render(<GridLayout columns={1} items={items} />);
    
    const statsElement = screen.getByTestId('grid-item-stats');
    expect(statsElement).toBeInTheDocument();
    expect(screen.getByText('99.99% uptime')).toBeInTheDocument();
    expect(screen.getByText('< 1ms latency')).toBeInTheDocument();
    expect(screen.getByText('1M requests/sec')).toBeInTheDocument();
  });

  it('renders features array when provided', () => {
    const items: GridItem[] = [
      { title: 'Service', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
    ];
    
    render(<GridLayout columns={1} items={items} />);
    
    const featuresElement = screen.getByTestId('grid-item-features');
    expect(featuresElement).toBeInTheDocument();
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
    expect(screen.getByText('Feature 3')).toBeInTheDocument();
  });

  it('applies grid display class', () => {
    const items: GridItem[] = [{ title: 'Item' }];
    
    render(<GridLayout columns={2} items={items} />);
    
    const gridLayout = screen.getByTestId('grid-layout');
    expect(gridLayout.className).toMatch(/grid/);
  });

  it('handles items without optional fields', () => {
    const items: GridItem[] = [
      { title: 'Minimal Item' },
    ];
    
    render(<GridLayout columns={1} items={items} />);
    
    expect(screen.getByText('Minimal Item')).toBeInTheDocument();
    expect(screen.queryByTestId('grid-item-description')).not.toBeInTheDocument();
    expect(screen.queryByTestId('grid-item-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('grid-item-stat')).not.toBeInTheDocument();
  });

  it('renders complex grid item with all fields', () => {
    const items: GridItem[] = [
      {
        title: 'Complete Item',
        description: 'Full description',
        icon: 'zap',
        stat: '100%',
        stats: ['Stat 1', 'Stat 2'],
        features: ['Feature 1', 'Feature 2'],
        color: 'purple',
      },
    ];
    
    render(<GridLayout columns={1} items={items} />);
    
    expect(screen.getByText('Complete Item')).toBeInTheDocument();
    expect(screen.getByText('Full description')).toBeInTheDocument();
    expect(screen.getByTestId('grid-item-icon')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Stat 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
  });
});
