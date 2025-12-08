import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuizConfigProvider, useQuizConfig } from './QuizConfigContext';
import type { QuizConfig } from '../types/quiz.types';

/**
 * Unit Tests for QuizConfigContext
 * 
 * Requirements:
 * - 15.1: Load quizConfig from quiz data file
 * - 15.5: Apply default configuration when quizConfig is not specified
 */
describe('QuizConfigContext', () => {
  // Test component that uses the hook
  const TestComponent = () => {
    const { config } = useQuizConfig();
    return (
      <div>
        <div data-testid="passing-score">{config.passingScore}</div>
        <div data-testid="total-points">{config.totalPoints}</div>
        <div data-testid="show-explanations">{config.showExplanations.toString()}</div>
        <div data-testid="allow-retry">{config.allowRetry.toString()}</div>
        <div data-testid="shuffle-choices">{config.shuffleChoices.toString()}</div>
        <div data-testid="show-progress-bar">{config.showProgressBar.toString()}</div>
      </div>
    );
  };

  it('applies default configuration when no config is provided', () => {
    render(
      <QuizConfigProvider>
        <TestComponent />
      </QuizConfigProvider>
    );

    // Verify default values
    expect(screen.getByTestId('passing-score')).toHaveTextContent('70');
    expect(screen.getByTestId('total-points')).toHaveTextContent('1000');
    expect(screen.getByTestId('show-explanations')).toHaveTextContent('true');
    expect(screen.getByTestId('allow-retry')).toHaveTextContent('true');
    expect(screen.getByTestId('shuffle-choices')).toHaveTextContent('false');
    expect(screen.getByTestId('show-progress-bar')).toHaveTextContent('true');
  });

  it('uses provided configuration values', () => {
    const customConfig: QuizConfig = {
      passingScore: 80,
      totalPoints: 1500,
      showExplanations: false,
      allowRetry: false,
      shuffleChoices: true,
      showProgressBar: false,
    };

    render(
      <QuizConfigProvider config={customConfig}>
        <TestComponent />
      </QuizConfigProvider>
    );

    // Verify custom values
    expect(screen.getByTestId('passing-score')).toHaveTextContent('80');
    expect(screen.getByTestId('total-points')).toHaveTextContent('1500');
    expect(screen.getByTestId('show-explanations')).toHaveTextContent('false');
    expect(screen.getByTestId('allow-retry')).toHaveTextContent('false');
    expect(screen.getByTestId('shuffle-choices')).toHaveTextContent('true');
    expect(screen.getByTestId('show-progress-bar')).toHaveTextContent('false');
  });

  it('merges partial configuration with defaults', () => {
    const partialConfig: Partial<QuizConfig> = {
      shuffleChoices: true,
      allowRetry: false,
    };

    render(
      <QuizConfigProvider config={partialConfig as QuizConfig}>
        <TestComponent />
      </QuizConfigProvider>
    );

    // Verify merged values (custom + defaults)
    expect(screen.getByTestId('passing-score')).toHaveTextContent('70'); // default
    expect(screen.getByTestId('total-points')).toHaveTextContent('1000'); // default
    expect(screen.getByTestId('show-explanations')).toHaveTextContent('true'); // default
    expect(screen.getByTestId('allow-retry')).toHaveTextContent('false'); // custom
    expect(screen.getByTestId('shuffle-choices')).toHaveTextContent('true'); // custom
    expect(screen.getByTestId('show-progress-bar')).toHaveTextContent('true'); // default
  });

  it('throws error when useQuizConfig is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useQuizConfig must be used within a QuizConfigProvider');

    console.error = originalError;
  });
});
