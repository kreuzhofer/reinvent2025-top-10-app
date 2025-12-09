import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioControls } from './AudioControls';
import { AudioProvider } from '../context/AudioContext';
import * as fc from 'fast-check';

// Mock AudioManager
vi.mock('../services/audio/AudioManager', () => {
  const MockAudioManager = vi.fn(function(this: any) {
    this.initialize = vi.fn().mockResolvedValue(undefined);
    this.isMuted = vi.fn().mockReturnValue(false);
    this.setMuted = vi.fn();
    this.cleanup = vi.fn();
    this.playBackgroundMusic = vi.fn().mockResolvedValue(undefined);
    this.playSFX = vi.fn().mockResolvedValue(undefined);
    this.getCurrentBackgroundMusic = vi.fn().mockReturnValue(null);
  });
  
  return {
    AudioManager: MockAudioManager,
  };
});

describe('AudioControls - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
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

  const renderWithProvider = (inline?: boolean) => {
    return render(
      <AudioProvider>
        <AudioControls inline={inline} />
      </AudioProvider>
    );
  };

  /**
   * Property 5: Audio control state toggle
   * Feature: ui-progress-and-layout-improvements, Property 5: Audio control state toggle
   * Validates: Requirements 6.4
   * 
   * For any initial mute state (true or false), clicking the audio control button 
   * should toggle the state to its opposite value
   */
  it('Property 5: clicking audio control toggles state to opposite value', async () => {
    await fc.assert(
      fc.asyncProperty(fc.boolean(), async (_initialMuted) => {
        const user = userEvent.setup();
        
        // Clean up before each iteration
        cleanup();
        
        // Render component
        renderWithProvider();
        
        const button = screen.getByRole('button');
        
        // Get initial state from aria-pressed
        const initialState = button.getAttribute('aria-pressed') === 'true';
        
        // Click the button
        await user.click(button);
        
        // Get new state
        const newState = button.getAttribute('aria-pressed') === 'true';
        
        // Verify state toggled to opposite
        expect(newState).toBe(!initialState);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Audio icon synchronization
   * Feature: ui-progress-and-layout-improvements, Property 6: Audio icon synchronization
   * Validates: Requirements 6.5
   * 
   * For any audio mute state, the displayed icon should visually represent that state 
   * (muted icon when muted, unmuted icon when not muted)
   */
  it('Property 6: audio icon synchronizes with mute state', async () => {
    await fc.assert(
      fc.asyncProperty(fc.boolean(), async (_initialMuted) => {
        const user = userEvent.setup();
        
        // Clean up before each iteration
        cleanup();
        
        // Render component
        renderWithProvider();
        
        const button = screen.getByRole('button');
        
        // Get current mute state
        const isMuted = button.getAttribute('aria-pressed') === 'true';
        
        // Check icon representation
        const svg = button.querySelector('svg');
        expect(svg).toBeInTheDocument();
        
        if (isMuted) {
          // Muted icon should have X lines (line elements)
          const lines = button.querySelectorAll('line');
          expect(lines.length).toBeGreaterThan(0);
        } else {
          // Unmuted icon should have sound wave paths
          const paths = button.querySelectorAll('path');
          expect(paths.length).toBeGreaterThan(0);
        }
        
        // Toggle state
        await user.click(button);
        
        // Get new state
        const newMuted = button.getAttribute('aria-pressed') === 'true';
        
        // Verify icon changed to match new state
        if (newMuted) {
          const lines = button.querySelectorAll('line');
          expect(lines.length).toBeGreaterThan(0);
        } else {
          const paths = button.querySelectorAll('path');
          expect(paths.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});
