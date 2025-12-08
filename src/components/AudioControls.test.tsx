import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioControls } from './AudioControls';
import { AudioProvider } from '../context/AudioContext';

// Mock AudioManager
vi.mock('../services/audio/AudioManager', () => {
  const MockAudioManager = vi.fn(function(this: any) {
    this.initialize = vi.fn().mockResolvedValue(undefined);
    this.isMuted = vi.fn().mockReturnValue(false);
    this.setMuted = vi.fn();
    this.cleanup = vi.fn();
    this.playBackgroundMusic = vi.fn().mockResolvedValue(undefined);
    this.playSFX = vi.fn().mockResolvedValue(undefined);
  });
  
  return {
    AudioManager: MockAudioManager,
  };
});

describe('AudioControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  const renderWithProvider = () => {
    return render(
      <AudioProvider>
        <AudioControls />
      </AudioProvider>
    );
  };

  it('renders mute/unmute button', () => {
    renderWithProvider();

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has proper ARIA label when unmuted', () => {
    renderWithProvider();

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Mute audio');
  });

  it('has proper ARIA pressed state', () => {
    renderWithProvider();

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed');
  });

  it('has proper title attribute', () => {
    renderWithProvider();

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title');
  });

  it('toggles mute state when clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByRole('button');
    const initialLabel = button.getAttribute('aria-label');

    await user.click(button);

    // After click, the label should change
    const newLabel = button.getAttribute('aria-label');
    expect(newLabel).not.toBe(initialLabel);
  });

  it('responds to Enter key press', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByRole('button');
    button.focus();

    const initialLabel = button.getAttribute('aria-label');

    await user.keyboard('{Enter}');

    const newLabel = button.getAttribute('aria-label');
    expect(newLabel).not.toBe(initialLabel);
  });

  it('responds to Space key press', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByRole('button');
    button.focus();

    const initialLabel = button.getAttribute('aria-label');

    await user.keyboard(' ');

    const newLabel = button.getAttribute('aria-label');
    expect(newLabel).not.toBe(initialLabel);
  });

  it('displays unmuted icon when not muted', () => {
    renderWithProvider();

    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    
    expect(svg).toBeInTheDocument();
    // Unmuted icon has sound wave paths
    const soundWaves = button.querySelector('path');
    expect(soundWaves).toBeInTheDocument();
  });

  it('is keyboard accessible', () => {
    renderWithProvider();

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('has proper button type', () => {
    renderWithProvider();

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });
});
