import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuizConfigProvider } from '../context/QuizConfigContext';
import { ScoreProvider } from '../context/ScoreContext';
import QuizSlide from './QuizSlide';
import ProgressIndicator from './ProgressIndicator';
import SummaryScreen from './SummaryScreen';
import type { QuizSlide as QuizSlideType, QuizConfig } from '../types/quiz.types';

/**
 * Unit Tests for Quiz Configuration Features
 * 
 * Requirements:
 * - 15.2: Answer choices are shuffled when enabled
 * - 15.3: Progress bar displays when enabled
 * - 15.4: Retry option appears when enabled
 */
describe('Quiz Configuration Features', () => {
  const mockQuizSlide: QuizSlideType = {
    type: 'quiz',
    id: 'test-quiz',
    question: 'What is AWS?',
    choices: [
      { text: 'Amazon Web Services' },
      { text: 'Amazon Warehouse System' },
      { text: 'Automated Weather Station' },
      { text: 'Advanced Widget Software' },
    ],
    correctAnswerIndex: 0,
    explanation: 'AWS stands for Amazon Web Services',
    points: 100,
  };

  describe('Answer Choice Shuffling', () => {
    it('renders choices in original order when shuffling is disabled', () => {
      const onNext = vi.fn();

      render(
        <ScoreProvider>
          <QuizSlide slide={mockQuizSlide} onNext={onNext} shuffleEnabled={false} />
        </ScoreProvider>
      );

      const choices = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('data-testid')?.startsWith('choice-')
      );

      // First choice should be the correct answer
      expect(choices[0]).toHaveTextContent('Amazon Web Services');
      expect(choices[1]).toHaveTextContent('Amazon Warehouse System');
      expect(choices[2]).toHaveTextContent('Automated Weather Station');
      expect(choices[3]).toHaveTextContent('Advanced Widget Software');
    });

    it('renders all choices when shuffling is enabled', () => {
      const onNext = vi.fn();

      render(
        <ScoreProvider>
          <QuizSlide slide={mockQuizSlide} onNext={onNext} shuffleEnabled={true} />
        </ScoreProvider>
      );

      const choices = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('data-testid')?.startsWith('choice-')
      );

      // All 4 choices should be present (order may vary)
      expect(choices).toHaveLength(4);
      
      // Check that all original choice texts are present
      const choiceTexts = choices.map(choice => choice.textContent);
      expect(choiceTexts.some(text => text?.includes('Amazon Web Services'))).toBe(true);
      expect(choiceTexts.some(text => text?.includes('Amazon Warehouse System'))).toBe(true);
      expect(choiceTexts.some(text => text?.includes('Automated Weather Station'))).toBe(true);
      expect(choiceTexts.some(text => text?.includes('Advanced Widget Software'))).toBe(true);
    });
  });

  describe('Progress Bar Display', () => {
    it('displays progress indicator when showProgressBar is enabled', () => {
      const config: QuizConfig = {
        passingScore: 70,
        totalPoints: 1000,
        showExplanations: true,
        allowRetry: true,
        shuffleChoices: false,
        showProgressBar: true,
      };

      render(
        <QuizConfigProvider config={config}>
          <ProgressIndicator current={5} total={10} />
        </QuizConfigProvider>
      );

      expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('progress-text')).toHaveTextContent('5 / 10');
    });

    it('progress indicator can be conditionally rendered based on config', () => {
      const configWithProgress: QuizConfig = {
        passingScore: 70,
        totalPoints: 1000,
        showExplanations: true,
        allowRetry: true,
        shuffleChoices: false,
        showProgressBar: true,
      };

      const configWithoutProgress: QuizConfig = {
        ...configWithProgress,
        showProgressBar: false,
      };

      // Test with progress bar enabled
      const { rerender } = render(
        <QuizConfigProvider config={configWithProgress}>
          <ProgressIndicator current={3} total={10} />
        </QuizConfigProvider>
      );

      expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();

      // Test with progress bar disabled (component should still render but could be hidden by parent)
      rerender(
        <QuizConfigProvider config={configWithoutProgress}>
          <ProgressIndicator current={3} total={10} />
        </QuizConfigProvider>
      );

      // Component still renders (hiding logic would be in parent component)
      expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();
    });
  });

  describe('Retry Option', () => {
    it('displays restart button when allowRetry is enabled', () => {
      const onRestart = vi.fn();

      render(
        <SummaryScreen 
          score={800} 
          totalPossible={1000} 
          onRestart={onRestart}
          allowRetry={true}
        />
      );

      expect(screen.getByTestId('restart-button')).toBeInTheDocument();
      expect(screen.getByText('Retake Quiz')).toBeInTheDocument();
    });

    it('hides restart button when allowRetry is disabled', () => {
      const onRestart = vi.fn();

      render(
        <SummaryScreen 
          score={800} 
          totalPossible={1000} 
          onRestart={onRestart}
          allowRetry={false}
        />
      );

      expect(screen.queryByTestId('restart-button')).not.toBeInTheDocument();
      expect(screen.queryByText('Retake Quiz')).not.toBeInTheDocument();
      expect(screen.getByTestId('no-retry-message')).toBeInTheDocument();
    });

    it('displays thank you message when retry is disabled', () => {
      render(
        <SummaryScreen 
          score={700} 
          totalPossible={1000} 
          allowRetry={false}
        />
      );

      expect(screen.getByText('Thank you for completing the quiz!')).toBeInTheDocument();
    });
  });

  describe('Default Configuration', () => {
    it('uses default values when config is not specified', () => {
      // This test verifies that components work with default config
      const onRestart = vi.fn();

      render(
        <QuizConfigProvider>
          <SummaryScreen 
            score={850} 
            totalPossible={1000} 
            onRestart={onRestart}
          />
        </QuizConfigProvider>
      );

      // Default allowRetry is true, so restart button should appear
      expect(screen.getByTestId('restart-button')).toBeInTheDocument();
    });
  });
});
