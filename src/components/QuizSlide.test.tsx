import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuizSlide from './QuizSlide';
import { AudioProvider } from '../context/AudioContext';
import { EmojiProvider } from '../context/EmojiContext';
import { ScoreProvider } from '../context/ScoreContext';
import { QuizStateProvider } from '../context/QuizStateContext';
import type { QuizSlide as QuizSlideType } from '../types/quiz.types';

// Mock the QuizTimer component to avoid timer complexity in tests
vi.mock('./QuizTimer', () => ({
  default: ({ basePoints, onTimeout, onTick }: any) => (
    <div data-testid="quiz-timer">
      <div data-testid="timer-base-points">{basePoints}</div>
      <button data-testid="mock-timeout" onClick={onTimeout}>Trigger Timeout</button>
      <button data-testid="mock-tick" onClick={() => onTick(1)}>Trigger Tick</button>
    </div>
  ),
}));

// Mock the FunFactDisplay component for simpler tests
vi.mock('./FunFactDisplay', () => ({
  default: ({ funFact }: any) => 
    funFact ? <div data-testid="fun-fact-display">{funFact}</div> : null,
}));

/**
 * Unit Tests for QuizSlide Component
 * 
 * Requirements:
 * - 2.1: Test question and choices render
 * - 2.5: Test next button appears after answer
 * - 2.6: Test skip button renders
 */

// Helper function to render QuizSlide with required providers
const renderQuizSlide = (props: React.ComponentProps<typeof QuizSlide>) => {
  return render(
    <AudioProvider>
      <EmojiProvider>
        <ScoreProvider>
          <QuizStateProvider>
            <QuizSlide {...props} />
          </QuizStateProvider>
        </ScoreProvider>
      </EmojiProvider>
    </AudioProvider>
  );
};

const mockQuizSlide: QuizSlideType = {
  type: 'quiz',
  id: 'test-quiz-1',
  question: 'What is the performance improvement of S3 Express One Zone?',
  choices: [
    { text: '2x faster' },
    { text: '5x faster' },
    { text: '10x faster' },
    { text: '20x faster' },
  ],
  correctAnswerIndex: 2,
  explanation: 'S3 Express One Zone delivers up to 10x better performance.',
  funFact: 'S3 Express uses a new bucket type!',
  points: 100,
  timeLimit: 10,
};

describe('QuizSlide Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders question and all choices', () => {
    const onNext = vi.fn();

    renderQuizSlide({ slide: mockQuizSlide, onNext });

    // Question should be visible
    expect(screen.getByTestId('quiz-question')).toHaveTextContent(
      'What is the performance improvement of S3 Express One Zone?'
    );

    // All choices should be visible
    expect(screen.getByText('2x faster')).toBeInTheDocument();
    expect(screen.getByText('5x faster')).toBeInTheDocument();
    expect(screen.getByText('10x faster')).toBeInTheDocument();
    expect(screen.getByText('20x faster')).toBeInTheDocument();
  });

  it('renders skip button initially', () => {
    const onNext = vi.fn();

    renderQuizSlide({ slide: mockQuizSlide, onNext });

    // Skip button should be present
    const skipButton = screen.getByTestId('skip-button');
    expect(skipButton).toBeInTheDocument();
    expect(skipButton).toHaveTextContent(/skip/i);
  });

  it('shows next button after skipping', async () => {
    const onNext = vi.fn();
    const user = userEvent.setup();

    renderQuizSlide({ slide: mockQuizSlide, onNext });

    // Click skip button
    const skipButton = screen.getByTestId('skip-button');
    await user.click(skipButton);

    // Next button should be visible
    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeInTheDocument();
  });

  it('shows next button after timeout', async () => {
    const onNext = vi.fn();
    const user = userEvent.setup();

    renderQuizSlide({ slide: mockQuizSlide, onNext });

    // Trigger timeout using the mocked timer
    const timeoutButton = screen.getByTestId('mock-timeout');
    await user.click(timeoutButton);

    // Next button should be visible
    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeInTheDocument();
  });

  it('displays correct answer feedback for correct selection', async () => {
    const onNext = vi.fn();
    const user = userEvent.setup();

    renderQuizSlide({ slide: mockQuizSlide, onNext });

    // Click correct answer (index 2)
    const correctChoice = screen.getByTestId('choice-2');
    await user.click(correctChoice);

    // Wait for feedback to appear
    await waitFor(() => {
      const feedback = screen.getByTestId('quiz-feedback');
      expect(feedback).toHaveTextContent(/correct/i);
    });
  });

  it('displays incorrect answer feedback for wrong selection', async () => {
    const onNext = vi.fn();
    const user = userEvent.setup();

    renderQuizSlide({ slide: mockQuizSlide, onNext });

    // Click incorrect answer (index 0)
    const incorrectChoice = screen.getByTestId('choice-0');
    await user.click(incorrectChoice);

    // Wait for feedback to appear
    await waitFor(() => {
      const feedback = screen.getByTestId('quiz-feedback');
      expect(feedback).toHaveTextContent(/incorrect/i);
    });
  });

  it('displays explanation after answering', async () => {
    const onNext = vi.fn();
    const user = userEvent.setup();

    renderQuizSlide({ slide: mockQuizSlide, onNext });

    // Click an answer
    const choice = screen.getByTestId('choice-0');
    await user.click(choice);

    // Wait for explanation to appear
    await waitFor(() => {
      const explanation = screen.getByTestId('quiz-explanation');
      expect(explanation).toBeInTheDocument();
      expect(explanation).toHaveTextContent('S3 Express One Zone delivers up to 10x better performance.');
    });
  });

  it('displays fun fact after answering when present', async () => {
    const onNext = vi.fn();
    const user = userEvent.setup();

    renderQuizSlide({ slide: mockQuizSlide, onNext });

    // Click an answer
    const choice = screen.getByTestId('choice-0');
    await user.click(choice);

    // Wait for fun fact to appear
    await waitFor(() => {
      const funFact = screen.getByTestId('fun-fact-display');
      expect(funFact).toBeInTheDocument();
      expect(funFact).toHaveTextContent('S3 Express uses a new bucket type!');
    });
  });

  it('works without fun fact', async () => {
    const slideWithoutFunFact: QuizSlideType = {
      ...mockQuizSlide,
      funFact: undefined,
    };

    const onNext = vi.fn();
    const user = userEvent.setup();

    renderQuizSlide({ slide: slideWithoutFunFact, onNext });

    // Click an answer
    const choice = screen.getByTestId('choice-0');
    await user.click(choice);

    // Wait for explanation to appear
    await waitFor(() => {
      expect(screen.getByTestId('quiz-explanation')).toBeInTheDocument();
    });

    // Fun fact should not be present
    expect(screen.queryByTestId('fun-fact-display')).not.toBeInTheDocument();
  });

  it('disables choices after answering', async () => {
    const onNext = vi.fn();
    const user = userEvent.setup();

    renderQuizSlide({ slide: mockQuizSlide, onNext });

    // Click first answer
    const firstChoice = screen.getByTestId('choice-0');
    await user.click(firstChoice);

    // All choices should be disabled
    mockQuizSlide.choices.forEach((_, index) => {
      const choice = screen.getByTestId(`choice-${index}`);
      expect(choice).toBeDisabled();
    });
  });

  it('calls onNext when next button is clicked', async () => {
    const onNext = vi.fn();
    const user = userEvent.setup();

    renderQuizSlide({ slide: mockQuizSlide, onNext });

    // Answer the question
    const choice = screen.getByTestId('choice-0');
    await user.click(choice);

    // Wait for next button to appear
    await waitFor(() => {
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
    });

    // Click next button
    const nextButton = screen.getByTestId('next-button');
    await user.click(nextButton);

    // onNext should have been called
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('highlights correct answer after timeout', async () => {
    const onNext = vi.fn();
    const user = userEvent.setup();

    renderQuizSlide({ slide: mockQuizSlide, onNext });

    // Trigger timeout using the mocked timer
    const timeoutButton = screen.getByTestId('mock-timeout');
    await user.click(timeoutButton);

    // Correct answer should be highlighted with check icon
    const correctIcon = screen.getByTestId(`correct-icon-${mockQuizSlide.correctAnswerIndex}`);
    expect(correctIcon).toBeInTheDocument();
  });

  it('shows timer initially', () => {
    const onNext = vi.fn();

    renderQuizSlide({ slide: mockQuizSlide, onNext });

    // Timer should be visible
    expect(screen.getByTestId('quiz-timer')).toBeInTheDocument();
  });

  it('hides timer after answering', async () => {
    const onNext = vi.fn();
    const user = userEvent.setup();

    renderQuizSlide({ slide: mockQuizSlide, onNext });

    // Click an answer
    const choice = screen.getByTestId('choice-0');
    await user.click(choice);

    // Timer should no longer be visible
    expect(screen.queryByTestId('quiz-timer')).not.toBeInTheDocument();
  });

  // Integration tests for ProgressBar and Header
  describe('ProgressBar Integration', () => {
    it('renders ProgressBar when showProgress is true', () => {
      const onNext = vi.fn();

      renderQuizSlide({
        slide: mockQuizSlide,
        onNext,
        showProgress: true,
        currentSlide: 3,
        totalSlides: 10,
      });

      // ProgressBar should be visible
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '3');
      expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    });

    it('does not render ProgressBar when showProgress is false', () => {
      const onNext = vi.fn();

      renderQuizSlide({
        slide: mockQuizSlide,
        onNext,
        showProgress: false,
        currentSlide: 3,
        totalSlides: 10,
      });

      // ProgressBar should not be visible
      expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
    });

    it('does not render ProgressBar when currentSlide is missing', () => {
      const onNext = vi.fn();

      renderQuizSlide({
        slide: mockQuizSlide,
        onNext,
        showProgress: true,
        totalSlides: 10,
      });

      // ProgressBar should not be visible
      expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
    });

    it('does not render ProgressBar when totalSlides is missing', () => {
      const onNext = vi.fn();

      renderQuizSlide({
        slide: mockQuizSlide,
        onNext,
        showProgress: true,
        currentSlide: 3,
      });

      // ProgressBar should not be visible
      expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
    });
  });

  describe('Header Integration', () => {
    it('renders Header with score when showScore is true', () => {
      const onNext = vi.fn();

      renderQuizSlide({
        slide: mockQuizSlide,
        onNext,
        showScore: true,
      });

      // Header should be visible
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      
      // Score display should be visible
      const scoreDisplay = screen.getByTestId('score-display');
      expect(scoreDisplay).toBeInTheDocument();
    });

    it('renders Header without score when showScore is false', () => {
      const onNext = vi.fn();

      renderQuizSlide({
        slide: mockQuizSlide,
        onNext,
        showScore: false,
      });

      // Header should be visible
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      
      // Score display should not be visible
      expect(screen.queryByTestId('score-display')).not.toBeInTheDocument();
    });
  });
});
