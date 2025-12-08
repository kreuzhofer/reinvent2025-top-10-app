import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WelcomeScreen from './WelcomeScreen';

describe('WelcomeScreen', () => {
  it('renders the re:Invent logo', () => {
    const onStart = vi.fn();
    render(<WelcomeScreen onStart={onStart} />);
    
    const logo = screen.getByAltText(/re:Invent/i);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/reinvent-white.png');
  });

  it('renders the welcome message', () => {
    const onStart = vi.fn();
    render(<WelcomeScreen onStart={onStart} />);
    
    expect(screen.getByText(/AWS re:Invent 2025 Quiz/i)).toBeInTheDocument();
  });

  it('renders the start button', () => {
    const onStart = vi.fn();
    render(<WelcomeScreen onStart={onStart} />);
    
    const startButton = screen.getByRole('button', { name: /start quiz/i });
    expect(startButton).toBeInTheDocument();
  });

  it('calls onStart when start button is clicked', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<WelcomeScreen onStart={onStart} />);
    
    const startButton = screen.getByRole('button', { name: /start quiz/i });
    await user.click(startButton);
    
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('calls onStart when Enter key is pressed', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<WelcomeScreen onStart={onStart} />);
    
    await user.keyboard('{Enter}');
    
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('displays keyboard shortcut hint', () => {
    const onStart = vi.fn();
    render(<WelcomeScreen onStart={onStart} />);
    
    expect(screen.getByText(/press enter to start/i)).toBeInTheDocument();
  });
});
