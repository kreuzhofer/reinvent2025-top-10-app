import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByText(/AWS re:Invent 2025 Quiz App/i)).toBeInTheDocument();
  });

  it('renders the success message', () => {
    render(<App />);
    expect(screen.getByText(/Project structure initialized successfully!/i)).toBeInTheDocument();
  });
});
