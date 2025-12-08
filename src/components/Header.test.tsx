import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('renders the re:Invent logo', () => {
    render(<Header />);
    
    const logo = screen.getByAltText(/re:Invent/i);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/reinvent-white.png');
  });

  it('has proper semantic HTML structure', () => {
    render(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('is positioned fixed at the top', () => {
    const { container } = render(<Header />);
    
    const header = container.querySelector('header');
    expect(header).toHaveClass('fixed', 'top-0', 'left-0', 'right-0');
  });
});
