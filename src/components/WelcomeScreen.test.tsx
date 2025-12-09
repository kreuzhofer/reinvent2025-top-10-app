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

  // KiroBranding integration tests - Requirements 1.1, 1.4
  describe('KiroBranding Integration', () => {
    it('renders KiroBranding component below start prompt', () => {
      const onStart = vi.fn();
      renderWelcomeScreen({ onStart });
      
      // Verify KiroBranding appears (using aria-label)
      const kiroBranding = screen.getByRole('link', { name: /visit kiro website/i });
      expect(kiroBranding).toBeInTheDocument();
      
      // Verify it appears after the "Press Enter to start" text
      const startPrompt = screen.getByText(/press enter to start/i);
      const startPromptPosition = startPrompt.compareDocumentPosition(kiroBranding);
      
      // DOCUMENT_POSITION_FOLLOWING (4) means kiroBranding comes after startPrompt
      expect(startPromptPosition & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('uses welcome variant for KiroBranding', () => {
      const onStart = vi.fn();
      renderWelcomeScreen({ onStart });
      
      const kiroBranding = screen.getByRole('link', { name: /visit kiro website/i });
      
      // Welcome variant uses larger text and padding
      // Check for welcome-specific classes (text-base, p-3)
      expect(kiroBranding).toHaveClass('text-base');
      expect(kiroBranding).toHaveClass('p-3');
    });

    it('centers KiroBranding horizontally', () => {
      const onStart = vi.fn();
      renderWelcomeScreen({ onStart });
      
      const kiroBranding = screen.getByRole('link', { name: /visit kiro website/i });
      const wrapper = kiroBranding.parentElement;
      
      // Verify the wrapper has centering classes
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('justify-center');
    });
  });
});
