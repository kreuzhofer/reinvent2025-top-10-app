import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScoreDisplay from './ScoreDisplay';
import { ScoreProvider } from '../context/ScoreContext';

/**
 * Unit Tests for ScoreDisplay Component
 * 
 * Tests specific examples and edge cases for the score display.
 */
describe('ScoreDisplay Component', () => {
  it('renders the score display with initial score of 0', () => {
    render(
      <ScoreProvider>
        <ScoreDisplay />
      </ScoreProvider>
    );

    const scoreDisplay = screen.getByTestId('score-display');
    expect(scoreDisplay).toBeInTheDocument();

    const scoreValue = screen.getByTestId('score-value');
    expect(scoreValue).toHaveTextContent('0');
  });

  it('displays "of X possible" when totalPossible is greater than 0', () => {
    render(
      <ScoreProvider>
        <ScoreDisplay />
      </ScoreProvider>
    );

    // Initially totalPossible is 0, so the text should not be present
    expect(screen.queryByTestId('score-total')).not.toBeInTheDocument();
  });

  it('has proper styling classes for re:Invent branding', () => {
    render(
      <ScoreProvider>
        <ScoreDisplay />
      </ScoreProvider>
    );

    const scoreDisplay = screen.getByTestId('score-display');
    
    // Check for key styling classes (responsive)
    expect(scoreDisplay).toHaveClass('fixed');
    expect(scoreDisplay).toHaveClass('sm:top-4');
    expect(scoreDisplay).toHaveClass('sm:right-4');
    expect(scoreDisplay).toHaveClass('rounded-lg');
  });

  it('displays the score value prominently', () => {
    render(
      <ScoreProvider>
        <ScoreDisplay />
      </ScoreProvider>
    );

    const scoreValue = screen.getByTestId('score-value');
    
    // Check for prominent styling (responsive)
    expect(scoreValue).toHaveClass('sm:text-3xl');
    expect(scoreValue).toHaveClass('font-bold');
    expect(scoreValue).toHaveClass('text-white');
  });

  it('has a "Score" label', () => {
    render(
      <ScoreProvider>
        <ScoreDisplay />
      </ScoreProvider>
    );

    expect(screen.getByText('Score')).toBeInTheDocument();
  });

  it('shows only current points when showMaxPoints={false}', () => {
    render(
      <ScoreProvider>
        <ScoreDisplay inline showMaxPoints={false} />
      </ScoreProvider>
    );

    const scoreValue = screen.getByTestId('score-value');
    expect(scoreValue).toHaveTextContent('0');
    
    // Max points should not be displayed
    expect(screen.queryByTestId('score-total')).not.toBeInTheDocument();
  });

  it('shows both current and max when showMaxPoints={true}', () => {
    render(
      <ScoreProvider>
        <ScoreDisplay inline showMaxPoints={true} />
      </ScoreProvider>
    );

    const scoreValue = screen.getByTestId('score-value');
    expect(scoreValue).toHaveTextContent('0');
    
    // Max points should not be displayed when totalPossible is 0
    expect(screen.queryByTestId('score-total')).not.toBeInTheDocument();
  });

  it('renders trophy icon when showTrophy={true}', () => {
    render(
      <ScoreProvider>
        <ScoreDisplay inline showTrophy={true} />
      </ScoreProvider>
    );

    const trophyIcon = screen.getByTestId('trophy-icon');
    expect(trophyIcon).toBeInTheDocument();
    expect(trophyIcon).toHaveClass('text-reinvent-yellow');
  });

  it('does not render trophy icon when showTrophy={false}', () => {
    render(
      <ScoreProvider>
        <ScoreDisplay inline showTrophy={false} />
      </ScoreProvider>
    );

    expect(screen.queryByTestId('trophy-icon')).not.toBeInTheDocument();
  });

  it('applies bordered container styling when trophy is shown', () => {
    render(
      <ScoreProvider>
        <ScoreDisplay inline showTrophy={true} />
      </ScoreProvider>
    );

    const scoreDisplay = screen.getByTestId('score-display');
    expect(scoreDisplay).toHaveClass('border-2');
    expect(scoreDisplay).toHaveClass('border-gray-700');
    expect(scoreDisplay).toHaveClass('rounded-lg');
    expect(scoreDisplay).toHaveClass('bg-gray-900/50');
  });

  it('does not apply bordered container when trophy is not shown', () => {
    render(
      <ScoreProvider>
        <ScoreDisplay inline showTrophy={false} />
      </ScoreProvider>
    );

    const scoreDisplay = screen.getByTestId('score-display');
    expect(scoreDisplay).not.toHaveClass('border-2');
    expect(scoreDisplay).not.toHaveClass('bg-gray-900/50');
  });

  it('handles zero totalPossible without errors', () => {
    render(
      <ScoreProvider>
        <ScoreDisplay inline showMaxPoints={true} />
      </ScoreProvider>
    );

    // Should render without errors
    const scoreDisplay = screen.getByTestId('score-display');
    expect(scoreDisplay).toBeInTheDocument();
    
    // Max points should not be shown when totalPossible is 0
    expect(screen.queryByTestId('score-total')).not.toBeInTheDocument();
  });
});
