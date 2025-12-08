import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressIndicator from './ProgressIndicator';

describe('ProgressIndicator', () => {
  it('should render the progress indicator with current and total slides', () => {
    render(<ProgressIndicator current={5} total={20} />);
    
    const progressText = screen.getByTestId('progress-text');
    expect(progressText).toBeInTheDocument();
    expect(progressText.textContent).toBe('5 / 20');
  });

  it('should render the progress bar container', () => {
    render(<ProgressIndicator current={10} total={20} />);
    
    const progressBarContainer = screen.getByTestId('progress-bar-container');
    expect(progressBarContainer).toBeInTheDocument();
  });

  it('should render the progress bar fill', () => {
    render(<ProgressIndicator current={10} total={20} />);
    
    const progressBarFill = screen.getByTestId('progress-bar-fill');
    expect(progressBarFill).toBeInTheDocument();
  });

  it('should display correct progress text for first slide', () => {
    render(<ProgressIndicator current={1} total={15} />);
    
    const progressText = screen.getByTestId('progress-text');
    expect(progressText.textContent).toBe('1 / 15');
  });

  it('should display correct progress text for last slide', () => {
    render(<ProgressIndicator current={15} total={15} />);
    
    const progressText = screen.getByTestId('progress-text');
    expect(progressText.textContent).toBe('15 / 15');
  });

  it('should handle zero total slides gracefully', () => {
    render(<ProgressIndicator current={0} total={0} />);
    
    const progressText = screen.getByTestId('progress-text');
    expect(progressText.textContent).toBe('0 / 0');
  });

  it('should render the "Progress" label', () => {
    render(<ProgressIndicator current={5} total={10} />);
    
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });
});
