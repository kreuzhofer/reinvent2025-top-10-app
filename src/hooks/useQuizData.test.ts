import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useQuizData } from './useQuizData';

describe('useQuizData', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should successfully load valid quiz data', async () => {
    // Requirements: 4.1 - Test successful JSON loading
    const validQuizData = {
      metadata: {
        title: 'Test Quiz',
        description: 'A test quiz',
        version: '1.0.0',
        totalSlides: 2,
      },
      slides: [
        {
          type: 'content',
          id: 'slide-1',
          title: 'Test Slide',
          content: [
            {
              type: 'text',
              text: 'Test content',
            },
          ],
        },
        {
          type: 'quiz',
          id: 'quiz-1',
          question: 'Test question?',
          choices: [
            { text: 'Answer 1' },
            { text: 'Answer 2' },
          ],
          correctAnswerIndex: 0,
          points: 100,
        },
      ],
    };

    // Mock fetch to return valid data
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => validQuizData,
    }) as any;

    const { result } = renderHook(() => useQuizData('/test-data.json'));

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check final state
    expect(result.current.data).toEqual(validQuizData);
    expect(result.current.error).toBe(null);
  });

  it('should handle missing file error', async () => {
    // Requirements: 4.3 - Test error handling for missing file
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    }) as any;

    const { result } = renderHook(() => useQuizData('/missing-file.json'));

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for error state
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check error state
    expect(result.current.data).toBe(null);
    expect(result.current.error).toContain('Failed to load quiz data');
    expect(result.current.error).toContain('Not Found');
  });

  it('should handle invalid JSON data', async () => {
    // Requirements: 4.2 - Test validation of invalid data
    const invalidQuizData = {
      metadata: {
        // Missing required fields
        title: 'Test Quiz',
      },
      slides: 'not an array', // Invalid type
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => invalidQuizData,
    }) as any;

    const { result } = renderHook(() => useQuizData('/invalid-data.json'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check error state
    expect(result.current.data).toBe(null);
    expect(result.current.error).toContain('Invalid quiz data');
  });

  it('should handle network errors', async () => {
    // Requirements: 4.3 - Test error handling
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as any;

    const { result } = renderHook(() => useQuizData('/test-data.json'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Network error');
  });

  it('should handle malformed JSON', async () => {
    // Requirements: 4.3 - Test error handling
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('Unexpected token in JSON');
      },
    });

    const { result } = renderHook(() => useQuizData('/malformed.json'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toContain('Unexpected token in JSON');
  });
});
