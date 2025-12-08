import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FunFactDisplay from './FunFactDisplay';

/**
 * Unit Tests for FunFactDisplay Component
 * 
 * Requirements: 14.1, 14.3
 * - Test fun fact displays when present
 * - Test component works without fun fact
 */

describe('FunFactDisplay', () => {
  it('displays fun fact when present', () => {
    const funFact = 'S3 Express One Zone uses a new bucket type optimized for single-digit millisecond latency!';
    
    render(<FunFactDisplay funFact={funFact} />);
    
    // Check that the fun fact container is rendered
    const funFactDisplay = screen.getByTestId('fun-fact-display');
    expect(funFactDisplay).toBeInTheDocument();
    
    // Check that the fun fact text is displayed
    const funFactText = screen.getByTestId('fun-fact-text');
    expect(funFactText).toHaveTextContent(funFact);
    
    // Check that the label is present
    const label = screen.getByTestId('fun-fact-label');
    expect(label).toHaveTextContent('Fun Fact');
    
    // Check that the icon is present
    const icon = screen.getByTestId('fun-fact-icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders nothing when fun fact is undefined', () => {
    const { container } = render(<FunFactDisplay funFact={undefined} />);
    
    // Check that nothing is rendered
    expect(container.firstChild).toBeNull();
    
    // Check that no fun fact elements are present
    expect(screen.queryByTestId('fun-fact-display')).not.toBeInTheDocument();
    expect(screen.queryByTestId('fun-fact-text')).not.toBeInTheDocument();
    expect(screen.queryByTestId('fun-fact-label')).not.toBeInTheDocument();
    expect(screen.queryByTestId('fun-fact-icon')).not.toBeInTheDocument();
  });

  it('renders nothing when fun fact is not provided', () => {
    const { container } = render(<FunFactDisplay />);
    
    // Check that nothing is rendered
    expect(container.firstChild).toBeNull();
    
    // Check that no fun fact elements are present
    expect(screen.queryByTestId('fun-fact-display')).not.toBeInTheDocument();
  });

  it('applies correct styling for visual distinction', () => {
    render(<FunFactDisplay funFact="Test fun fact" />);
    
    const funFactDisplay = screen.getByTestId('fun-fact-display');
    
    // Check for gradient background
    expect(funFactDisplay.className).toMatch(/bg-gradient/);
    
    // Check for border styling
    expect(funFactDisplay.className).toMatch(/border-2/);
    
    // Check for yellow accent color
    expect(funFactDisplay.className).toMatch(/reinvent-yellow/);
  });

  it('displays label in uppercase for emphasis', () => {
    render(<FunFactDisplay funFact="Test fun fact" />);
    
    const label = screen.getByTestId('fun-fact-label');
    expect(label.className).toMatch(/uppercase/);
  });

  it('displays lightbulb icon', () => {
    render(<FunFactDisplay funFact="Test fun fact" />);
    
    const icon = screen.getByTestId('fun-fact-icon');
    expect(icon).toBeInTheDocument();
  });

  it('handles long fun fact text', () => {
    const longFunFact = 'This is a very long fun fact that contains a lot of information about AWS services and their capabilities. It should wrap properly and maintain readability even with extensive content.';
    
    render(<FunFactDisplay funFact={longFunFact} />);
    
    const funFactText = screen.getByTestId('fun-fact-text');
    expect(funFactText).toHaveTextContent(longFunFact);
    expect(funFactText).toBeInTheDocument();
  });

  it('handles empty string fun fact', () => {
    const { container } = render(<FunFactDisplay funFact="" />);
    
    // Empty string should be treated as no fun fact and render nothing
    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('fun-fact-display')).not.toBeInTheDocument();
  });
});
