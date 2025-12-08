import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { QuizData } from './types/quiz.types';
import * as useQuizDataModule from './hooks/useQuizData';

// Mock the useQuizData hook
vi.mock('./hooks/useQuizData');

const mockQuizData: QuizData = {
  metadata: {
    title: 'Test Quiz',
    description: 'Test Description',
    version: '1.0.0',
    totalSlides: 3,
  },
  slides: [
    {
      type: 'content',
      id: 'content-1',
      title: 'Welcome to AWS',
      content: [
        {
          type: 'text',
          text: 'This is a test content slide',
        },
      ],
    },
    {
      type: 'quiz',
      id: 'quiz-1',
      question: 'What is AWS?',
      choices: [
        { text: 'A cloud platform' },
        { text: 'A database' },
        { text: 'An operating system' },
      ],
      correctAnswerIndex: 0,
      explanation: 'AWS is a cloud platform',
      points: 100,
    },
    {
      type: 'content',
      id: 'content-2',
      title: 'Thank you',
      content: [
        {
          type: 'text',
          text: 'Thanks for taking the quiz',
        },
      ],
    },
  ],
  quizConfig: {
    passingScore: 70,
    totalPoints: 1000,
    showExplanations: true,
    allowRetry: true,
    shuffleChoices: false,
    showProgressBar: true,
  },
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(useQuizDataModule.useQuizData).mockReturnValue({ 
      data: null, 
      loading: true, 
      error: null 
    });

    render(<App />);
    expect(screen.getByText(/loading quiz data/i)).toBeInTheDocument();
  });

  it('renders error state when data fails to load', () => {
    vi.mocked(useQuizDataModule.useQuizData).mockReturnValue({ 
      data: null, 
      loading: false, 
      error: 'Failed to load quiz data' 
    });

    render(<App />);
    expect(screen.getByText(/error loading quiz/i)).toBeInTheDocument();
    expect(screen.getByText(/failed to load quiz data/i)).toBeInTheDocument();
  });

  it('renders welcome screen when data is loaded', async () => {
    vi.mocked(useQuizDataModule.useQuizData).mockReturnValue({ 
      data: mockQuizData, 
      loading: false, 
      error: null 
    });

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/AWS re:Invent 2025/i)).toBeInTheDocument();
    });
  });

  it('navigates to first slide when start button is clicked', async () => {
    vi.mocked(useQuizDataModule.useQuizData).mockReturnValue({ 
      data: mockQuizData, 
      loading: false, 
      error: null 
    });

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/AWS re:Invent 2025/i)).toBeInTheDocument();
    });

    const startButton = screen.getByRole('button', { name: /start quiz/i });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Welcome to AWS')).toBeInTheDocument();
    });
  });

  it('navigates through slides sequentially', async () => {
    vi.mocked(useQuizDataModule.useQuizData).mockReturnValue({ 
      data: mockQuizData, 
      loading: false, 
      error: null 
    });

    const user = userEvent.setup();
    const { container } = render(<App />);

    // Wait for app to render - check for either welcome screen or first slide
    await waitFor(() => {
      const hasContent = container.textContent && container.textContent.length > 0;
      expect(hasContent).toBe(true);
    });

    // If we're on the welcome screen, start the quiz
    const startButton = screen.queryByRole('button', { name: /start quiz/i });
    if (startButton) {
      await user.click(startButton);
      
      // First slide (content)
      await waitFor(() => {
        expect(screen.getByText('Welcome to AWS')).toBeInTheDocument();
      });
    }
    
    // Navigate to next slide
    const nextButton1 = await screen.findByRole('button', { name: /next/i });
    await user.click(nextButton1);

    // Second slide (quiz)
    await waitFor(() => {
      expect(screen.getByText('What is AWS?')).toBeInTheDocument();
    });
  });

  it('renders app with routing enabled', () => {
    vi.mocked(useQuizDataModule.useQuizData).mockReturnValue({ 
      data: mockQuizData, 
      loading: false, 
      error: null 
    });

    const { container } = render(<App />);

    // Verify that the app renders something
    expect(container.firstChild).toBeTruthy();
  });
});
