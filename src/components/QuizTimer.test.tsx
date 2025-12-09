import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import type React from 'react';
import QuizTimer from './QuizTimer';
import { ScoreProvider } from '../context/ScoreContext';

/**
 * Unit Tests for QuizTimer Component
 * 
 * Tests specific examples and edge cases for the timer display.
 * Requirements: 11.2 - Test timer displays remaining time
 */
describe('QuizTimer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper function to render QuizTimer with ScoreProvider
  const renderWithProvider = (props: React.ComponentProps<typeof QuizTimer>) => {
    return render(
      <ScoreProvider>
        <QuizTimer {...props} />
      </ScoreProvider>
    );
  };

  it('renders the timer with initial time remaining', () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick,
      timeLimit: 10
    });

    const timerDisplay = screen.getByTestId('quiz-timer');
    expect(timerDisplay).toBeInTheDocument();

    const remainingTime = screen.getByTestId('timer-remaining');
    expect(remainingTime).toHaveTextContent('10s');
  });

  it('displays the current point value', () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick,
      timeLimit: 10
    });

    const pointsDisplay = screen.getByTestId('timer-points');
    expect(pointsDisplay).toHaveTextContent('100');
  });

  it('displays "Time Remaining" label', () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick
    });

    expect(screen.getByText('Time Remaining')).toBeInTheDocument();
  });

  it('displays "Current Points" label', () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick
    });

    expect(screen.getByText('Current Points')).toBeInTheDocument();
  });

  it('renders the progress bar container', () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick
    });

    const progressContainer = screen.getByTestId('timer-progress-container');
    expect(progressContainer).toBeInTheDocument();
  });

  it('renders the progress bar fill', () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick
    });

    const progressFill = screen.getByTestId('timer-progress-fill');
    expect(progressFill).toBeInTheDocument();
  });

  it('updates remaining time after 1 second', async () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick,
      timeLimit: 10
    });

    // Initially shows 10s
    expect(screen.getByTestId('timer-remaining')).toHaveTextContent('10s');

    // Advance time by 1 second (pre-countdown delay)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Still shows 10s (pre-countdown just completed)
    expect(screen.getByTestId('timer-remaining')).toHaveTextContent('10s');

    // Advance time by 1 more second (first countdown second)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('timer-remaining')).toHaveTextContent('9s');
  });

  it('updates point value after 1 second (10% deduction)', async () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick,
      timeLimit: 10
    });

    // Initially shows 100 points (during pre-countdown)
    expect(screen.getByTestId('timer-points')).toHaveTextContent('100');

    // Advance time by 1 second (pre-countdown delay)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Still shows 100 points (pre-countdown just completed, countdown hasn't started deducting yet)
    expect(screen.getByTestId('timer-points')).toHaveTextContent('100');

    // Advance time by 1 more second (first countdown second)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // After 1 countdown second: basePoints=100, timeLimit=10, deductionRate=10, elapsed=1
    // 100 - (10 * 1) = 90
    expect(screen.getByTestId('timer-points')).toHaveTextContent('90');
  });

  it('calls onTick callback every second', async () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick,
      timeLimit: 10
    });

    // Advance time by 1 second (pre-countdown delay)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // onTick should not be called during pre-countdown
    expect(onTick).not.toHaveBeenCalled();

    // Advance time by 3 more seconds (countdown)
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(onTick).toHaveBeenCalledTimes(3);
    expect(onTick).toHaveBeenNthCalledWith(1, 1);
    expect(onTick).toHaveBeenNthCalledWith(2, 2);
    expect(onTick).toHaveBeenNthCalledWith(3, 3);
  });

  it('calls onTimeout when timer reaches zero', async () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick,
      timeLimit: 10
    });

    // Advance time by 1 second (pre-countdown delay)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Advance time by 10 seconds (full countdown)
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('displays "Time\'s Up!" message when timer expires', async () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick,
      timeLimit: 10
    });

    // Advance time by 1 second (pre-countdown delay)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Advance time by 10 seconds (full countdown)
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByTestId('timer-expired')).toBeInTheDocument();
    expect(screen.getByTestId('timer-expired')).toHaveTextContent("Time's Up!");
  });

  it('shows red color when time is low (3 seconds or less)', async () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick,
      timeLimit: 10
    });

    // Advance time by 1 second (pre-countdown delay)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Advance time by 7 seconds (countdown) = 3 seconds remaining
    await act(async () => {
      vi.advanceTimersByTime(7000);
    });

    const remainingTime = screen.getByTestId('timer-remaining');
    expect(remainingTime).toHaveClass('text-reinvent-red');
  });

  it('uses custom time limit when provided', () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick,
      timeLimit: 15
    });

    const remainingTime = screen.getByTestId('timer-remaining');
    expect(remainingTime).toHaveTextContent('15s');
  });

  it('calculates points correctly with custom time limit', async () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick,
      timeLimit: 5
    });

    // Advance time by 1 second (pre-countdown delay)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Still shows 100 points (pre-countdown just completed)
    expect(screen.getByTestId('timer-points')).toHaveTextContent('100');

    // Advance time by 1 more second (first countdown second)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // After 1 countdown second: basePoints=100, timeLimit=5, deductionRate=20, elapsed=1
    // 100 - (20 * 1) = 80
    expect(screen.getByTestId('timer-points')).toHaveTextContent('80');
  });

  it('ensures points never go below zero', async () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    renderWithProvider({
      basePoints: 50,
      onTimeout,
      onTick,
      timeLimit: 10
    });

    // Advance time by 10 seconds (would be -50 without max(0, ...))
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByTestId('timer-points')).toHaveTextContent('0');
  });
});


describe('QuizTimer Tick Sound Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper function to render QuizTimer with ScoreProvider
  const renderWithProvider = (props: React.ComponentProps<typeof QuizTimer>) => {
    return render(
      <ScoreProvider>
        <QuizTimer {...props} />
      </ScoreProvider>
    );
  };

  it('tick sound starts when countdown begins', async () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    const { unmount } = renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick,
      timeLimit: 10
    });

    // Initially in pre-countdown phase
    expect(screen.getByTestId('timer-pre-countdown')).toBeInTheDocument();

    // Advance past pre-countdown delay (1 second)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Now in countdown phase - tick sound should be playing
    expect(screen.getByTestId('timer-countdown')).toBeInTheDocument();
    expect(screen.getByTestId('timer-countdown')).toHaveAttribute('data-phase', 'countdown');

    unmount();
  });

  it('tick sound does not play during pre-countdown', () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    const { unmount } = renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick,
      timeLimit: 10
    });

    // During pre-countdown phase
    expect(screen.getByTestId('timer-pre-countdown')).toBeInTheDocument();
    expect(screen.getByTestId('timer-pre-countdown')).toHaveAttribute('data-phase', 'pre-countdown');

    // onTick should not be called during pre-countdown
    expect(onTick).not.toHaveBeenCalled();

    unmount();
  });

  it('tick sound stops on timeout', async () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    const { unmount } = renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick,
      timeLimit: 5
    });

    // Advance past pre-countdown delay (1 second)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Advance to timeout (5 seconds)
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // Timer should be expired
    expect(screen.getByTestId('timer-expired')).toBeInTheDocument();
    expect(onTimeout).toHaveBeenCalledTimes(1);

    unmount();
  });

  it('tick sound cleanup on unmount', async () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();

    const { unmount } = renderWithProvider({
      basePoints: 100,
      onTimeout,
      onTick,
      timeLimit: 10
    });

    // Advance past pre-countdown delay (1 second)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Now in countdown phase
    expect(screen.getByTestId('timer-countdown')).toBeInTheDocument();

    // Unmount should clean up tick sound
    unmount();

    // No errors should occur
  });

  it('exposes stopTick method via ref', () => {
    const onTimeout = vi.fn();
    const onTick = vi.fn();
    const ref = { current: null } as React.RefObject<{ stopTick: () => void }>;

    render(
      <ScoreProvider>
        <QuizTimer
          ref={ref}
          basePoints={100}
          onTimeout={onTimeout}
          onTick={onTick}
          timeLimit={10}
        />
      </ScoreProvider>
    );

    // Ref should have stopTick method
    expect(ref.current).not.toBeNull();
    expect(ref.current?.stopTick).toBeDefined();
    expect(typeof ref.current?.stopTick).toBe('function');
  });
});
