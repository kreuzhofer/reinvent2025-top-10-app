import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CalloutBox from './CalloutBox';

/**
 * Unit Tests for CalloutBox Component
 * 
 * Requirements: 13.1
 * - Test CalloutBox renders with correct style
 */

describe('CalloutBox', () => {
  it('renders with info style', () => {
    render(<CalloutBox text="This is an info message" style="info" />);
    
    const calloutBox = screen.getByTestId('callout-box');
    expect(calloutBox).toBeInTheDocument();
    expect(calloutBox).toHaveAttribute('data-style', 'info');
    
    const text = screen.getByTestId('callout-text');
    expect(text).toHaveTextContent('This is an info message');
  });

  it('renders with success style', () => {
    render(<CalloutBox text="Operation successful!" style="success" />);
    
    const calloutBox = screen.getByTestId('callout-box');
    expect(calloutBox).toHaveAttribute('data-style', 'success');
    
    const text = screen.getByTestId('callout-text');
    expect(text).toHaveTextContent('Operation successful!');
  });

  it('renders with warning style', () => {
    render(<CalloutBox text="Warning: Please be careful" style="warning" />);
    
    const calloutBox = screen.getByTestId('callout-box');
    expect(calloutBox).toHaveAttribute('data-style', 'warning');
    
    const text = screen.getByTestId('callout-text');
    expect(text).toHaveTextContent('Warning: Please be careful');
  });

  it('renders an icon for each style', () => {
    const { unmount: unmount1 } = render(<CalloutBox text="Test" style="info" />);
    expect(screen.getByTestId('callout-icon')).toBeInTheDocument();
    unmount1();

    const { unmount: unmount2 } = render(<CalloutBox text="Test" style="success" />);
    expect(screen.getByTestId('callout-icon')).toBeInTheDocument();
    unmount2();

    const { unmount: unmount3 } = render(<CalloutBox text="Test" style="warning" />);
    expect(screen.getByTestId('callout-icon')).toBeInTheDocument();
    unmount3();
  });

  it('applies correct styling classes for info style', () => {
    render(<CalloutBox text="Info message" style="info" />);
    
    const calloutBox = screen.getByTestId('callout-box');
    expect(calloutBox.className).toMatch(/bg-reinvent-blue/);
    expect(calloutBox.className).toMatch(/border-reinvent-blue/);
  });

  it('applies correct styling classes for success style', () => {
    render(<CalloutBox text="Success message" style="success" />);
    
    const calloutBox = screen.getByTestId('callout-box');
    expect(calloutBox.className).toMatch(/bg-green/);
    expect(calloutBox.className).toMatch(/border-green/);
  });

  it('applies correct styling classes for warning style', () => {
    render(<CalloutBox text="Warning message" style="warning" />);
    
    const calloutBox = screen.getByTestId('callout-box');
    expect(calloutBox.className).toMatch(/bg-reinvent-yellow/);
    expect(calloutBox.className).toMatch(/border-reinvent-yellow/);
  });
});
