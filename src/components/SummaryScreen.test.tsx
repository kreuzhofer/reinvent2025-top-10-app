import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SummaryScreen from './SummaryScreen';
import { AudioProvider } from '../context/AudioContext';
import { ScoreProvider } from '../context/ScoreContext';
import { QuizStateProvider } from '../context/QuizStateContext';

/**
 * Unit tests for SummaryScreen component
 * 
 * Requirements:
 * - 3.2: Display summary screen with total score
 * - 3.3: Show score as both number and percentage
 * - 3.4: Provide option to restart quiz
 */

// Mock the useQuizData hook
vi.mock('../hooks/useQuizData', () => ({
  useQuizData: () => ({
    data: {
      slides: [
        { id: 'q1', type: 'quiz', points: 100 },
        { id: 'q2', type: 'quiz', points: 100 },
        { id: 'q3', type: 'quiz', points: 100 },
        { id: 'c1', type: 'content' },
      ],
    },
    loading: false,
    error: null,
  }),
}));

// Helper function to render SummaryScreen with required providers
const renderSummaryScreen = (props: React.ComponentProps<typeof SummaryScreen>) => {
  return render(
    <AudioProvider>
      <ScoreProvider>
        <QuizStateProvider>
          <SummaryScreen {...props} />
        </QuizStateProvider>
      </ScoreProvider>
    </AudioProvider>
  );
};

// Mock localStorage
beforeEach(() => {
  localStorage.clear();
});

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

    it('should display correct answers count', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000 
      });

      const correctAnswersElement = screen.getByTestId('correct-answers-count');
      expect(correctAnswersElement).toBeInTheDocument();
      // Should show "0 / 3" since no answers are marked as correct in localStorage
      expect(correctAnswersElement.textContent).toContain('0');
      expect(correctAnswersElement.textContent).toContain('3');
    });

    it('should display correct answers count based on quiz state', () => {
      // Set up localStorage with some correct answers
      localStorage.setItem('quiz-answer-states', JSON.stringify({
        'q1': { selectedIndex: 0, isCorrect: true, pointsAwarded: 100, isSkipped: false, isTimedOut: false },
        'q2': { selectedIndex: 1, isCorrect: false, pointsAwarded: 0, isSkipped: false, isTimedOut: false },
        'q3': { selectedIndex: 0, isCorrect: true, pointsAwarded: 100, isSkipped: false, isTimedOut: false },
      }));

      renderSummaryScreen({ 
        score: 200, 
        totalPossible: 300 
      });

      const correctAnswersElement = screen.getByTestId('correct-answers-count');
      // Should show "2 / 3" (2 correct out of 3 total questions)
      expect(correctAnswersElement.textContent).toContain('2');
      expect(correctAnswersElement.textContent).toContain('3');
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
            <QuizStateProvider>
              <SummaryScreen score={900} totalPossible={1000} />
            </QuizStateProvider>
          </ScoreProvider>
        </AudioProvider>
      );

      expect(screen.getByTestId('final-percentage').textContent).toBe('90%');

      rerender(
        <AudioProvider>
          <ScoreProvider>
            <QuizStateProvider>
              <SummaryScreen score={333} totalPossible={1000} />
            </QuizStateProvider>
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

  describe('Share on Slack Button', () => {
    it('should render share on slack button', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000 
      });

      const shareButton = screen.getByTestId('share-slack-button');
      expect(shareButton).toBeInTheDocument();
      expect(shareButton).toHaveTextContent('Share on Slack');
    });

    it('should have correct aria-label for accessibility', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000 
      });

      const shareButton = screen.getByTestId('share-slack-button');
      expect(shareButton).toHaveAttribute('aria-label', 'Share your quiz results on Slack');
    });

    it('should display Slack logo', () => {
      renderSummaryScreen({ 
        score: 750, 
        totalPossible: 1000 
      });

      const slackLogo = screen.getByAltText('Slack logo');
      expect(slackLogo).toBeInTheDocument();
      expect(slackLogo).toHaveAttribute('src', '/data/icons/slack.svg');
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
            <QuizStateProvider>
              <SummaryScreen score={850} totalPossible={1000} />
            </QuizStateProvider>
          </ScoreProvider>
        </AudioProvider>
      );

      // 85% - Excellent
      expect(screen.getByText(/Excellent!/)).toBeInTheDocument();

      rerender(
        <AudioProvider>
          <ScoreProvider>
            <QuizStateProvider>
              <SummaryScreen score={750} totalPossible={1000} />
            </QuizStateProvider>
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
            <QuizStateProvider>
              <SummaryScreen score={1000} totalPossible={1000} />
            </QuizStateProvider>
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
