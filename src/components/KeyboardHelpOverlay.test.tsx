import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KeyboardHelpOverlay from './KeyboardHelpOverlay';

/**
 * Unit Tests for KeyboardHelpOverlay Component
 * 
 * Requirements:
 * - 10.4: Help overlay showing available keys
 */

describe('KeyboardHelpOverlay', () => {
  it('renders help overlay when isOpen is true', () => {
    const onClose = vi.fn();
    render(<KeyboardHelpOverlay isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Navigate forward')).toBeInTheDocument();
    expect(screen.getByText('Select answer (Quiz slides)')).toBeInTheDocument();
    expect(screen.getByText('Start quiz (Welcome screen)')).toBeInTheDocument();
    expect(screen.getByText('Show/hide this help')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const onClose = vi.fn();
    render(<KeyboardHelpOverlay isOpen={false} onClose={onClose} />);

    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<KeyboardHelpOverlay isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close help overlay');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when "Got it!" button is clicked', () => {
    const onClose = vi.fn();
    render(<KeyboardHelpOverlay isOpen={true} onClose={onClose} />);

    const gotItButton = screen.getByText('Got it!');
    fireEvent.click(gotItButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<KeyboardHelpOverlay isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside the modal', () => {
    const onClose = vi.fn();
    const { container } = render(<KeyboardHelpOverlay isOpen={true} onClose={onClose} />);

    // Click on the backdrop (the outer div)
    const backdrop = container.querySelector('.fixed.inset-0');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not call onClose when clicking inside the modal content', () => {
    const onClose = vi.fn();
    render(<KeyboardHelpOverlay isOpen={true} onClose={onClose} />);

    const modalContent = screen.getByText('Keyboard Shortcuts').closest('div');
    if (modalContent) {
      fireEvent.click(modalContent);
      expect(onClose).not.toHaveBeenCalled();
    }
  });

  it('displays all keyboard shortcuts', () => {
    const onClose = vi.fn();
    render(<KeyboardHelpOverlay isOpen={true} onClose={onClose} />);

    // Check for arrow key
    expect(screen.getByText('→')).toBeInTheDocument();
    
    // Check for number keys
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Check for Enter key
    expect(screen.getByText('Enter')).toBeInTheDocument();
    
    // Check for ? key
    expect(screen.getByText('?')).toBeInTheDocument();
    
    // Check for Esc key
    expect(screen.getByText('Esc')).toBeInTheDocument();
  });
});
