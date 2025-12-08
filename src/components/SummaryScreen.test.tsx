import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SummaryScreen from './SummaryScreen';

/**
 * Unit tests for SummaryScreen component
 * 
 * Requirements:
 * - 3.2: Display summary screen with total score
 * - 3.3: Show score as both number and percentage
 * - 3.4: Provide option to restart quiz
 */
describe('SummaryScreen', () => {
  describe('Score Display', () => {
    it('should display score as a number', () => {
      render(
        <SummaryScreen 
          score={750} 
          totalPossible={1000} 
        />
      );

      const scoreElement = screen.getByTestId('final-score');
      expect(scoreElement).toBeInTheDocument();
      expect(scoreElement.textContent).toContain('750');
      expect(scoreElement.textContent).toContain('1000');
    });

    it('should display score as a percentage', () => {
      render(
        <SummaryScreen 
          score={750} 
          totalPossible={1000} 
        />
      );

      const percentageElement = screen.getByTestId('final-percentage');
      expect(percentageElement).toBeInTheDocument();
      expect(percentageElement.textContent).toBe('75%');
    });

    it('should calculate percentage correctly for different scores', () => {
      const { rerender } = render(
        <SummaryScreen 
          score={500} 
          totalPossible={1000} 
        />
      );

      expect(screen.getByTestId('final-percentage').textContent).toBe('50%');

      rerender(
        <SummaryScreen 
          score={900} 
          totalPossible={1000} 
        />
      );

      expect(screen.getByTestId('final-percentage').textContent).toBe('90%');

      rerender(
        <SummaryScreen 
          score={333} 
          totalPossible={1000} 
        />
      );

      expect(screen.getByTestId('final-percentage').textContent).toBe('33%');
    });

    it('should handle zero total possible points without crashing', () => {
      render(
        <SummaryScreen 
          score={0} 
          totalPossible={0} 
        />
      );

      expect(screen.getByTestId('final-score')).toBeInTheDocument();
      expect(screen.getByTestId('final-percentage').textContent).toBe('0%');
    });

    it('should round percentage to nearest integer', () => {
      render(
        <SummaryScreen 
          score={667} 
          totalPossible={1000} 
        />
      );

      // 667/1000 = 66.7%, should round to 67%
      expect(screen.getByTestId('final-percentage').textContent).toBe('67%');
    });
  });

  describe('Restart Button', () => {
    it('should render restart button when allowRetry is true', () => {
      render(
        <SummaryScreen 
          score={750} 
          totalPossible={1000}
          allowRetry={true}
          onRestart={vi.fn()}
        />
      );

      const restartButton = screen.getByTestId('restart-button');
      expect(restartButton).toBeInTheDocument();
      expect(restartButton).toHaveTextContent('Retake Quiz');
    });

    it('should render restart button by default when allowRetry is not specified', () => {
      render(
        <SummaryScreen 
          score={750} 
          totalPossible={1000}
          onRestart={vi.fn()}
        />
      );

      const restartButton = screen.getByTestId('restart-button');
      expect(restartButton).toBeInTheDocument();
    });

    it('should not render restart button when allowRetry is false', () => {
      render(
        <SummaryScreen 
          score={750} 
          totalPossible={1000}
          allowRetry={false}
          onRestart={vi.fn()}
        />
      );

      const restartButton = screen.queryByTestId('restart-button');
      expect(restartButton).not.toBeInTheDocument();
    });

    it('should call onRestart when restart button is clicked', async () => {
      const user = userEvent.setup();
      const onRestart = vi.fn();

      render(
        <SummaryScreen 
          score={750} 
          totalPossible={1000}
          allowRetry={true}
          onRestart={onRestart}
        />
      );

      const restartButton = screen.getByTestId('restart-button');
      await user.click(restartButton);

      expect(onRestart).toHaveBeenCalledTimes(1);
    });

    it('should not render restart button when onRestart is not provided', () => {
      render(
        <SummaryScreen 
          score={750} 
          totalPossible={1000}
          allowRetry={true}
        />
      );

      const restartButton = screen.queryByTestId('restart-button');
      expect(restartButton).not.toBeInTheDocument();
    });

    it('should show message when retry is disabled', () => {
      render(
        <SummaryScreen 
          score={750} 
          totalPossible={1000}
          allowRetry={false}
        />
      );

      const message = screen.getByTestId('no-retry-message');
      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent('Thank you for completing the quiz!');
    });
  });

  describe('Component Rendering', () => {
    it('should render the summary screen container', () => {
      render(
        <SummaryScreen 
          score={750} 
          totalPossible={1000}
        />
      );

      const summaryScreen = screen.getByTestId('summary-screen');
      expect(summaryScreen).toBeInTheDocument();
    });

    it('should display completion message', () => {
      render(
        <SummaryScreen 
          score={750} 
          totalPossible={1000}
        />
      );

      expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    });

    it('should display performance message based on score', () => {
      const { rerender } = render(
        <SummaryScreen 
          score={950} 
          totalPossible={1000}
        />
      );

      // 95% - Outstanding
      expect(screen.getByText(/Outstanding!/)).toBeInTheDocument();

      rerender(
        <SummaryScreen 
          score={850} 
          totalPossible={1000}
        />
      );

      // 85% - Excellent
      expect(screen.getByText(/Excellent!/)).toBeInTheDocument();

      rerender(
        <SummaryScreen 
          score={750} 
          totalPossible={1000}
        />
      );

      // 75% - Great Job
      expect(screen.getByText(/Great Job!/)).toBeInTheDocument();
    });
  });
});
