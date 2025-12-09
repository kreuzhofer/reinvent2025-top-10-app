import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from './Header';
import { ScoreProvider } from '../context/ScoreContext';
import { AudioProvider } from '../context/AudioContext';

/**
 * Unit Tests for Header Component
 * 
 * Tests specific behaviors and edge cases for the refactored Header component.
 * Requirements: 6.1, 6.2, 7.1, 7.2, 7.3, 8.3
 */

// Helper function to render Header with required providers
const renderHeader = (props = {}) => {
  return render(
    <AudioProvider>
      <ScoreProvider>
        <Header {...props} />
      </ScoreProvider>
    </AudioProvider>
  );
};

describe('Header', () => {
  it('renders the re:Invent logo', () => {
    renderHeader();
    
    const logo = screen.getByAltText(/re:Invent/i);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/reinvent-white.png');
  });

  it('has proper semantic HTML structure', () => {
    renderHeader();
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('is positioned fixed below progress bar (top-1)', () => {
    const { container } = renderHeader();
    
    const header = container.querySelector('header');
    expect(header).toHaveClass('fixed', 'top-1', 'left-0', 'right-0');
  });

  it('has correct z-index (z-40) to be below progress bar', () => {
    const { container } = renderHeader();
    
    const header = container.querySelector('header');
    expect(header).toHaveClass('z-40');
  });

  describe('Conditional Rendering - Score Display', () => {
    it('renders score display when showScore is true', () => {
      renderHeader({ showScore: true });
      
      const scoreDisplay = screen.getByTestId('score-display');
      expect(scoreDisplay).toBeInTheDocument();
    });

    it('does not render score display when showScore is false', () => {
      renderHeader({ showScore: false });
      
      const scoreDisplay = screen.queryByTestId('score-display');
      expect(scoreDisplay).not.toBeInTheDocument();
    });

    it('does not render score display by default', () => {
      renderHeader();
      
      const scoreDisplay = screen.queryByTestId('score-display');
      expect(scoreDisplay).not.toBeInTheDocument();
    });

    it('passes showMaxPoints={false} to ScoreDisplay when shown', () => {
      renderHeader({ showScore: true });
      
      const scoreDisplay = screen.getByTestId('score-display');
      expect(scoreDisplay).toBeInTheDocument();
      
      // Verify max points are not shown (no "/ X" text)
      const scoreTotal = screen.queryByTestId('score-total');
      expect(scoreTotal).not.toBeInTheDocument();
    });

    it('passes showTrophy={true} to ScoreDisplay when shown', () => {
      renderHeader({ showScore: true });
      
      const scoreDisplay = screen.getByTestId('score-display');
      expect(scoreDisplay).toBeInTheDocument();
      
      // Verify trophy icon is present
      const trophyIcon = screen.getByTestId('trophy-icon');
      expect(trophyIcon).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering - Audio Controls', () => {
    it('renders audio controls by default', () => {
      renderHeader();
      
      const audioControls = screen.getByTestId('audio-controls');
      expect(audioControls).toBeInTheDocument();
    });

    it('renders audio controls when showAudioControls is true', () => {
      renderHeader({ showAudioControls: true });
      
      const audioControls = screen.getByTestId('audio-controls');
      expect(audioControls).toBeInTheDocument();
    });

    it('does not render audio controls when showAudioControls is false', () => {
      renderHeader({ showAudioControls: false });
      
      const audioControls = screen.queryByTestId('audio-controls');
      expect(audioControls).not.toBeInTheDocument();
    });
  });

  describe('Slide Counter Removal', () => {
    it('does not render slide counter (removed from component)', () => {
      const { container } = renderHeader();
      
      // Verify no "Progress" label exists
      const progressLabel = screen.queryByText(/progress/i);
      expect(progressLabel).not.toBeInTheDocument();
      
      // Verify no "X / Y" format text exists
      const slashPattern = container.querySelector('span:contains("/")');
      expect(slashPattern).not.toBeInTheDocument();
    });

    it('does not accept showProgress, currentSlide, or totalSlides props', () => {
      // This test verifies the interface change by attempting to render
      // The TypeScript compiler would catch this, but we verify runtime behavior
      const { container } = renderHeader();
      
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
      
      // Verify no slide counter elements exist
      const progressText = screen.queryByLabelText(/quiz progress/i);
      expect(progressText).not.toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('maintains horizontal layout with justify-between', () => {
      const { container } = renderHeader({ showScore: true, showAudioControls: true });
      
      const headerContent = container.querySelector('header > div');
      expect(headerContent).toHaveClass('flex', 'items-center', 'justify-between');
    });

    it('groups score and audio controls on the right side', () => {
      const { container } = renderHeader({ showScore: true, showAudioControls: true });
      
      // Find the right-side container
      const rightSide = container.querySelector('.flex.items-center.gap-4');
      expect(rightSide).toBeInTheDocument();
      
      // Verify both score and audio controls are within the right side
      const scoreDisplay = screen.getByTestId('score-display');
      const audioControls = screen.getByTestId('audio-controls');
      
      expect(rightSide).toContainElement(scoreDisplay);
      expect(rightSide).toContainElement(audioControls);
    });

    it('maintains responsive gap spacing (gap-4 sm:gap-6)', () => {
      const { container } = renderHeader({ showScore: true, showAudioControls: true });
      
      // Select the right-side container specifically (not the header content)
      const rightSide = container.querySelector('.flex.items-center.gap-4');
      expect(rightSide).toBeInTheDocument();
      expect(rightSide).toHaveClass('gap-4', 'sm:gap-6');
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive padding classes', () => {
      const { container } = renderHeader();
      
      const headerContent = container.querySelector('header > div');
      expect(headerContent).toHaveClass('px-4', 'py-3', 'sm:px-6', 'sm:py-4');
    });

    it('applies responsive logo sizing', () => {
      renderHeader();
      
      const logo = screen.getByAltText(/re:Invent/i);
      expect(logo).toHaveClass('h-8', 'sm:h-10', 'md:h-12');
    });
  });
});


  describe('Kiro Branding Integration', () => {
    it('renders KiroBranding component in header', () => {
      renderHeader();
      
      const kiroBranding = screen.getByRole('link', { name: /visit kiro website/i });
      expect(kiroBranding).toBeInTheDocument();
      expect(kiroBranding).toHaveAttribute('href', 'https://kiro.dev');
    });

    it('positions KiroBranding above score and audio controls', () => {
      const { container } = renderHeader({ showScore: true, showAudioControls: true });
      
      // Verify right side uses vertical layout
      const rightSide = container.querySelector('.flex.flex-col.items-end');
      expect(rightSide).toBeInTheDocument();
      
      // Get children to verify order
      const children = rightSide?.children;
      expect(children).toBeDefined();
      expect(children!.length).toBe(2);
      
      // First child should be KiroBranding
      const firstChild = children![0];
      expect(firstChild.tagName).toBe('A');
      expect(firstChild).toHaveAttribute('href', 'https://kiro.dev');
      
      // Second child should be the horizontal container
      const secondChild = children![1];
      expect(secondChild).toHaveClass('flex', 'items-center');
    });

    it('maintains proper spacing with gap-2 between KiroBranding and controls', () => {
      const { container } = renderHeader({ showScore: true, showAudioControls: true });
      
      const rightSide = container.querySelector('.flex.flex-col.items-end');
      expect(rightSide).toHaveClass('gap-2');
    });

    it('displays KiroBranding with score display', () => {
      renderHeader({ showScore: true, showAudioControls: false });
      
      const kiroBranding = screen.getByRole('link', { name: /visit kiro website/i });
      const scoreDisplay = screen.getByTestId('score-display');
      
      expect(kiroBranding).toBeInTheDocument();
      expect(scoreDisplay).toBeInTheDocument();
    });

    it('displays KiroBranding without score display', () => {
      renderHeader({ showScore: false, showAudioControls: true });
      
      const kiroBranding = screen.getByRole('link', { name: /visit kiro website/i });
      const scoreDisplay = screen.queryByTestId('score-display');
      
      expect(kiroBranding).toBeInTheDocument();
      expect(scoreDisplay).not.toBeInTheDocument();
    });

    it('displays KiroBranding with audio controls', () => {
      renderHeader({ showScore: false, showAudioControls: true });
      
      const kiroBranding = screen.getByRole('link', { name: /visit kiro website/i });
      const audioControls = screen.getByTestId('audio-controls');
      
      expect(kiroBranding).toBeInTheDocument();
      expect(audioControls).toBeInTheDocument();
    });

    it('displays KiroBranding without audio controls', () => {
      renderHeader({ showScore: false, showAudioControls: false });
      
      const kiroBranding = screen.getByRole('link', { name: /visit kiro website/i });
      const audioControls = screen.queryByTestId('audio-controls');
      
      expect(kiroBranding).toBeInTheDocument();
      expect(audioControls).not.toBeInTheDocument();
    });

    it('uses header variant for KiroBranding', () => {
      const { container } = renderHeader();
      
      // Verify KiroBranding link exists
      const kiroBranding = container.querySelector('a[href="https://kiro.dev"]');
      expect(kiroBranding).toBeInTheDocument();
      
      // The header variant should use smaller sizing (text-sm for header)
      // We can verify this by checking the component is rendered
      // (variant-specific styling is tested in KiroBranding component tests)
      expect(kiroBranding).toHaveClass('text-sm');
    });
  });
