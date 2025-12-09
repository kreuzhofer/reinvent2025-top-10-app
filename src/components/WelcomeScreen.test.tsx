import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WelcomeScreen from './WelcomeScreen';
import { AudioProvider } from '../context/AudioContext';

// Helper function to render WelcomeScreen with required providers
const renderWelcomeScreen = (props: React.ComponentProps<typeof WelcomeScreen>) => {
  return render(
    <AudioProvider>
      <WelcomeScreen {...props} />
    </AudioProvider>
  );
};

describe('WelcomeScreen', () => {
  it('renders the re:Invent logo', () => {
    const onStart = vi.fn();
    renderWelcomeScreen({ onStart });
    
    const logo = screen.getByAltText(/re:Invent/i);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/reinvent-white.png');
  });

  it('renders the welcome message', () => {
    const onStart = vi.fn();
    renderWelcomeScreen({ onStart });
    
    expect(screen.getByText(/AWS re:Invent 2025 Quiz/i)).toBeInTheDocument();
  });

  it('renders the start button', () => {
    const onStart = vi.fn();
    renderWelcomeScreen({ onStart });
    
    const startButton = screen.getByRole('button', { name: /start quiz/i });
    expect(startButton).toBeInTheDocument();
  });

  it('calls onStart when start button is clicked', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    renderWelcomeScreen({ onStart });
    
    const startButton = screen.getByRole('button', { name: /start quiz/i });
    await user.click(startButton);
    
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('calls onStart when Enter key is pressed', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    renderWelcomeScreen({ onStart });
    
    await user.keyboard('{Enter}');
    
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('displays keyboard shortcut hint', () => {
    const onStart = vi.fn();
    renderWelcomeScreen({ onStart });
    
    expect(screen.getByText(/press enter to start/i)).toBeInTheDocument();
  });

  // Integration tests for Requirements 3.1, 4.4
  describe('Integration Tests', () => {
    it('does not render ProgressBar component', () => {
      const onStart = vi.fn();
      const { container } = renderWelcomeScreen({ onStart });
      
      // ProgressBar has role="progressbar"
      const progressBar = screen.queryByRole('progressbar');
      expect(progressBar).not.toBeInTheDocument();
      
      // Also verify no element with progress bar styling
      const progressBarElement = container.querySelector('[aria-label*="Quiz progress"]');
      expect(progressBarElement).not.toBeInTheDocument();
    });

    it('does not display score information', () => {
      const onStart = vi.fn();
      renderWelcomeScreen({ onStart });
      
      // Score display has aria-label "Current quiz score"
      const scoreDisplay = screen.queryByLabelText(/current quiz score/i);
      expect(scoreDisplay).not.toBeInTheDocument();
      
      // Also check for score-related text
      const scoreText = screen.queryByText(/score/i);
      expect(scoreText).not.toBeInTheDocument();
      
      // Verify no score value is displayed
      const scoreValue = screen.queryByTestId('score-value');
      expect(scoreValue).not.toBeInTheDocument();
    });
  });
});
