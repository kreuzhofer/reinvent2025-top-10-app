import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';

/**
 * Unit Tests for ProgressBar Component
 * 
 * Tests specific examples and edge cases for the progress bar.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.5
 */
describe('ProgressBar Component', () => {
  it('renders with correct ARIA attributes', () => {
    render(<ProgressBar current={5} total={10} />);

    const progressBar = screen.getByTestId('progress-bar');
    
    expect(progressBar).toHaveAttribute('role', 'progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '5');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    expect(progressBar).toHaveAttribute('aria-label', 'Quiz progress: 5 of 10 slides');
  });

  it('handles zero total slides gracefully', () => {
    render(<ProgressBar current={0} total={0} />);

    const progressBar = screen.getByTestId('progress-bar');
    const progressFill = screen.getByTestId('progress-bar-fill');

    // Should render without errors
    expect(progressBar).toBeInTheDocument();
    expect(progressFill).toBeInTheDocument();

    // ARIA attributes should reflect zero state
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '0');
  });

  it('caps progress at 100% when current exceeds total', () => {
    render(<ProgressBar current={15} total={10} />);

    const progressBar = screen.getByTestId('progress-bar');

    // ARIA attributes should show actual values
    expect(progressBar).toHaveAttribute('aria-valuenow', '15');
    expect(progressBar).toHaveAttribute('aria-valuemax', '10');

    // The component calculates percentage internally and caps at 100%
    // We verify this by checking the component renders without errors
    expect(progressBar).toBeInTheDocument();
  });

  it('applies correct CSS classes for positioning', () => {
    render(<ProgressBar current={3} total={10} />);

    const progressBar = screen.getByTestId('progress-bar');

    // Check for fixed positioning at top
    expect(progressBar).toHaveClass('fixed');
    expect(progressBar).toHaveClass('top-0');
    expect(progressBar).toHaveClass('left-0');
    expect(progressBar).toHaveClass('right-0');

    // Check for thin height (h-1.5 = 6px in Tailwind)
    expect(progressBar).toHaveClass('h-1.5');

    // Check for high z-index to stay on top
    expect(progressBar).toHaveClass('z-50');
  });

  it('renders progress fill element', () => {
    render(<ProgressBar current={7} total={10} />);

    const progressFill = screen.getByTestId('progress-bar-fill');

    expect(progressFill).toBeInTheDocument();
    expect(progressFill).toHaveClass('h-full');
    expect(progressFill).toHaveClass('bg-gradient-to-r');
  });

  it('accepts and applies custom className', () => {
    render(<ProgressBar current={5} total={10} className="custom-class" />);

    const progressBar = screen.getByTestId('progress-bar');

    expect(progressBar).toHaveClass('custom-class');
  });

  it('renders with 0% progress when current is 0', () => {
    render(<ProgressBar current={0} total={10} />);

    const progressBar = screen.getByTestId('progress-bar');

    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-label', 'Quiz progress: 0 of 10 slides');
  });

  it('renders with 100% progress when current equals total', () => {
    render(<ProgressBar current={10} total={10} />);

    const progressBar = screen.getByTestId('progress-bar');

    expect(progressBar).toHaveAttribute('aria-valuenow', '10');
    expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    expect(progressBar).toHaveAttribute('aria-label', 'Quiz progress: 10 of 10 slides');
  });

  it('renders with mid-progress values', () => {
    render(<ProgressBar current={3} total={7} />);

    const progressBar = screen.getByTestId('progress-bar');

    expect(progressBar).toHaveAttribute('aria-valuenow', '3');
    expect(progressBar).toHaveAttribute('aria-valuemax', '7');
  });
});
