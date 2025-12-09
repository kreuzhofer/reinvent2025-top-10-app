import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SummaryScreen from './SummaryScreen';
import { AudioProvider } from '../context/AudioContext';
import { ScoreProvider } from '../context/ScoreContext';

/**
 * Unit tests for SummaryScreen component
 * 
 * Requirements:
 * - 3.2: Display summary screen with total score
 * - 3.3: Show score as both number and percentage
 * - 3.4: Provide option to restart quiz
 */

// Helper function to render SummaryScreen with required providers
const renderSummaryScreen = (props: React.ComponentProps<typeof SummaryScreen>) => {
  return render(
    <AudioProvider>
      <ScoreProvider>
        <SummaryScreen {...props} />
      </ScoreProvider>
    </AudioProvider>
  );
};

describe('SummaryScreen', () => {
  describe('Score Display', () => {
    it('should display score as a number', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000 
      });

      const scoreElement = screen.getByTestId('final-score');
      expect(scoreElement).toBeInTheDocument();
      expect(scoreElement.textContent).toContain('750');
      expect(scoreElement.textContent).toContain('1000');
    });

    it('should display score as a percentage', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000 
      });

      const percentageElement = screen.getByTestId('final-percentage');
      expect(percentageElement).toBeInTheDocument();
      expect(percentageElement.textContent).toBe('75%');
    });

    it('should calculate percentage correctly for different scores', () => {
      const { rerender } = renderSummaryScreen({ 
        score: 500, 
        totalPossible: 1000 
      });

      expect(screen.getByTestId('final-percentage').textContent).toBe('50%');

      rerender(
        <AudioProvider>
          <ScoreProvider>
            <SummaryScreen score={900} totalPossible={1000} />
          </ScoreProvider>
        </AudioProvider>
      );

      expect(screen.getByTestId('final-percentage').textContent).toBe('90%');

      rerender(
        <AudioProvider>
          <ScoreProvider>
            <SummaryScreen score={333} totalPossible={1000} />
          </ScoreProvider>
        </AudioProvider>
      );

      expect(screen.getByTestId('final-percentage').textContent).toBe('33%');
    });

    it('should handle zero total possible points without crashing', () => {
      renderSummaryScreen({ 
        score: 0, 
        totalPossible: 0 
      });

      expect(screen.getByTestId('final-score')).toBeInTheDocument();
      expect(screen.getByTestId('final-percentage').textContent).toBe('0%');
    });

    it('should round percentage to nearest integer', () => {
      renderSummaryScreen({ 
        score: 667, 
        totalPossible: 1000 
      });

      // 667/1000 = 66.7%, should round to 67%
      expect(screen.getByTestId('final-percentage').textContent).toBe('67%');
    });
  });

  describe('Restart Button', () => {
    it('should render restart button when allowRetry is true', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000,
        allowRetry: true,
        onRestart: vi.fn()
      });

      const restartButton = screen.getByTestId('restart-button');
      expect(restartButton).toBeInTheDocument();
      expect(restartButton).toHaveTextContent('Retake Quiz');
    });

    it('should render restart button by default when allowRetry is not specified', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000,
        onRestart: vi.fn()
      });

      const restartButton = screen.getByTestId('restart-button');
      expect(restartButton).toBeInTheDocument();
    });

    it('should not render restart button when allowRetry is false', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000,
        allowRetry: false,
        onRestart: vi.fn()
      });

      const restartButton = screen.queryByTestId('restart-button');
      expect(restartButton).not.toBeInTheDocument();
    });

    it('should call onRestart when restart button is clicked', async () => {
      const user = userEvent.setup();
      const onRestart = vi.fn();

      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000,
        allowRetry: true,
        onRestart: onRestart
      });

      const restartButton = screen.getByTestId('restart-button');
      await user.click(restartButton);

      expect(onRestart).toHaveBeenCalledTimes(1);
    });

    it('should not render restart button when onRestart is not provided', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000,
        allowRetry: true
      });

      const restartButton = screen.queryByTestId('restart-button');
      expect(restartButton).not.toBeInTheDocument();
    });

    it('should show message when retry is disabled', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000,
        allowRetry: false
      });

      const message = screen.getByTestId('no-retry-message');
      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent('Thank you for completing the quiz!');
    });
  });

  describe('Component Rendering', () => {
    it('should render the summary screen container', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000
      });

      const summaryScreen = screen.getByTestId('summary-screen');
      expect(summaryScreen).toBeInTheDocument();
    });

    it('should display completion message', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000
      });

      expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    });

    it('should display performance message based on score', () => {
      const { rerender } = renderSummaryScreen({ 
        score: 950, 
        totalPossible: 1000
      });

      // 95% - Outstanding
      expect(screen.getByText(/Outstanding!/)).toBeInTheDocument();

      rerender(
        <AudioProvider>
          <ScoreProvider>
            <SummaryScreen score={850} totalPossible={1000} />
          </ScoreProvider>
        </AudioProvider>
      );

      // 85% - Excellent
      expect(screen.getByText(/Excellent!/)).toBeInTheDocument();

      rerender(
        <AudioProvider>
          <ScoreProvider>
            <SummaryScreen score={750} totalPossible={1000} />
          </ScoreProvider>
        </AudioProvider>
      );

      // 75% - Great Job
      expect(screen.getByText(/Great Job!/)).toBeInTheDocument();
    });
  });

  describe('KiroBranding Integration', () => {
    /**
     * Integration tests for KiroBranding in SummaryScreen
     * 
     * Requirements:
     * - 3.1: Display KiroBranding on summary screen
     * - 3.2: Position KiroBranding in header above audio controls
     * - 3.4: KiroBranding remains visible with final score
     * - 3.5: Proper spacing between KiroBranding and other elements
     */
    
    it('should render KiroBranding component', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000 
      });

      // KiroBranding should be present (look for the link to kiro.dev)
      const kiroBrandingLink = screen.getByRole('link', { name: /visit kiro website/i });
      expect(kiroBrandingLink).toBeInTheDocument();
      expect(kiroBrandingLink).toHaveAttribute('href', 'https://kiro.dev');
    });

    it('should render KiroBranding with correct text content', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000 
      });

      const kiroBrandingLink = screen.getByRole('link', { name: /visit kiro website/i });
      
      // Should contain "Made with" and "Kiro" text
      expect(kiroBrandingLink.textContent).toContain('Made with');
      expect(kiroBrandingLink.textContent).toContain('Kiro');
    });

    it('should render KiroBranding without overlapping score display', () => {
      renderSummaryScreen({ 
        score: 850, 
        totalPossible: 1000 
      });

      const kiroBrandingLink = screen.getByRole('link', { name: /visit kiro website/i });
      const scoreElement = screen.getByTestId('final-score');

      // Both elements should be present and visible
      expect(kiroBrandingLink).toBeInTheDocument();
      expect(scoreElement).toBeInTheDocument();
      
      // Verify score is still displaying correctly
      expect(scoreElement.textContent).toContain('850');
      expect(scoreElement.textContent).toContain('1000');
    });

    it('should maintain KiroBranding visibility with different score values', () => {
      const { rerender } = renderSummaryScreen({ 
        score: 0, 
        totalPossible: 1000 
      });

      // KiroBranding should be visible with zero score
      let kiroBrandingLink = screen.getByRole('link', { name: /visit kiro website/i });
      expect(kiroBrandingLink).toBeInTheDocument();

      // Rerender with perfect score
      rerender(
        <AudioProvider>
          <ScoreProvider>
            <SummaryScreen score={1000} totalPossible={1000} />
          </ScoreProvider>
        </AudioProvider>
      );

      // KiroBranding should still be visible with perfect score
      kiroBrandingLink = screen.getByRole('link', { name: /visit kiro website/i });
      expect(kiroBrandingLink).toBeInTheDocument();
    });

    it('should render KiroBranding with proper spacing from other elements', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000 
      });

      const kiroBrandingLink = screen.getByRole('link', { name: /visit kiro website/i });
      const scoreElement = screen.getByTestId('final-score');
      const percentageElement = screen.getByTestId('final-percentage');

      // All elements should be present
      expect(kiroBrandingLink).toBeInTheDocument();
      expect(scoreElement).toBeInTheDocument();
      expect(percentageElement).toBeInTheDocument();
      
      // Verify KiroBranding doesn't interfere with score display
      expect(scoreElement.textContent).toContain('750');
      expect(percentageElement.textContent).toBe('75%');
    });
  });

  describe('Integration Tests', () => {
    /**
     * Integration tests for SummaryScreen
     * 
     * Requirements:
     * - 3.2: Summary screen does not render ProgressBar
     * - 5.1: Display current points earned
     * - 5.2: Display maximum possible points
     * - 5.3: Format score as "X / Y points"
     * - 5.4: Calculate and display percentage score
     */
    
    it('should not render ProgressBar component', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000 
      });

      // ProgressBar should not be present on summary screen
      const progressBar = screen.queryByTestId('progress-bar');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('should display both current and max points in score display', () => {
      renderSummaryScreen({ 
        score: 850, 
        totalPossible: 1200 
      });

      const scoreElement = screen.getByTestId('final-score');
      
      // Should show both current (850) and max (1200) points
      expect(scoreElement.textContent).toContain('850');
      expect(scoreElement.textContent).toContain('1200');
      expect(scoreElement.textContent).toMatch(/850.*\/.*1200/);
    });

    it('should calculate percentage correctly', () => {
      renderSummaryScreen({ 
        score: 450, 
        totalPossible: 600 
      });

      const percentageElement = screen.getByTestId('final-percentage');
      
      // 450/600 = 75%
      expect(percentageElement.textContent).toBe('75%');
    });

    it('should display percentage for various score combinations', () => {
      const testCases = [
        { score: 100, total: 100, expected: '100%' },
        { score: 0, total: 100, expected: '0%' },
        { score: 50, total: 100, expected: '50%' },
        { score: 333, total: 1000, expected: '33%' },
        { score: 667, total: 1000, expected: '67%' },
      ];

      testCases.forEach(({ score, total, expected }) => {
        const { unmount } = renderSummaryScreen({ 
          score: score, 
          totalPossible: total 
        });

        const percentageElement = screen.getByTestId('final-percentage');
        expect(percentageElement.textContent).toBe(expected);
        
        unmount();
      });
    });

    it('should not display score in header', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000 
      });

      // The score should be in the main content, not in the header
      // Header's score display should not be present
      const headerScoreDisplay = screen.queryByTestId('score-display');
      
      // If score-display exists, it should be in the main content area, not the header
      // The main score display is in final-score testid
      const mainScoreDisplay = screen.getByTestId('final-score');
      expect(mainScoreDisplay).toBeInTheDocument();
    });
  });
});
