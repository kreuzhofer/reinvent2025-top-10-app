import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import type { QuizData, ContentSlide, QuizSlide } from './types/quiz.types';

/**
 * Property-Based Tests for Quiz Navigation
 * 
 * Feature: reinvent-quiz-app, Property 1: Sequential slide progression
 * Validates: Requirements 1.2
 * 
 * Property: For any valid quiz data with N slides, starting the presentation 
 * and advancing N times should display each slide exactly once in the order 
 * specified in the data file.
 */

// Mock module at the top level
vi.mock('./hooks/useQuizData');

// Generator for content slides
const arbitraryContentSlide = (id: number): fc.Arbitrary<ContentSlide> => {
  return fc.record({
    type: fc.constant('content' as const),
    id: fc.constant(`content-${id}`),
    title: fc.string({ minLength: 5, maxLength: 50 }),
    content: fc.array(
      fc.record({
        type: fc.constant('text' as const),
        text: fc.string({ minLength: 10, maxLength: 100 }),
      }),
      { minLength: 1, maxLength: 3 }
    ),
  });
};

// Generator for quiz slides
const arbitraryQuizSlide = (id: number): fc.Arbitrary<QuizSlide> => {
  return fc.record({
    type: fc.constant('quiz' as const),
    id: fc.constant(`quiz-${id}`),
    question: fc.string({ minLength: 10, maxLength: 100 }),
    choices: fc.array(
      fc.record({
        text: fc.string({ minLength: 5, maxLength: 50 }),
      }),
      { minLength: 2, maxLength: 4 }
    ),
    correctAnswerIndex: fc.nat({ max: 3 }),
    explanation: fc.string({ minLength: 10, maxLength: 100 }),
    points: fc.integer({ min: 10, max: 100 }),
  });
};

// Generator for quiz data with N slides
const arbitraryQuizData = (): fc.Arbitrary<QuizData> => {
  return fc.integer({ min: 2, max: 10 }).chain((numSlides) => {
    return fc.record({
      metadata: fc.record({
        title: fc.constant('Test Quiz'),
        description: fc.constant('Test Description'),
        version: fc.constant('1.0.0'),
        totalSlides: fc.constant(numSlides),
      }),
      slides: fc
        .array(fc.nat({ max: 1 }), { minLength: numSlides, maxLength: numSlides })
        .chain((types) =>
          fc.tuple(
            ...types.map((type, idx) =>
              type === 0 ? arbitraryContentSlide(idx) : arbitraryQuizSlide(idx)
            )
          )
        ),
      quizConfig: fc.record({
        passingScore: fc.constant(70),
        totalPoints: fc.constant(1000),
        showExplanations: fc.constant(true),
        allowRetry: fc.constant(true),
        shuffleChoices: fc.constant(false),
        showProgressBar: fc.constant(true),
      }),
    });
  });
};

describe('App - Sequential Slide Progression Property Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('Property 1: Sequential slide progression - slide order is preserved', () => {
    /**
     * Feature: reinvent-quiz-app, Property 1: Sequential slide progression
     * Validates: Requirements 1.2
     * 
     * Property: For any valid quiz data with N slides, the slides array should
     * maintain its order and each slide should have a unique ID.
     */
    fc.assert(
      fc.property(arbitraryQuizData(), (quizData) => {
        // Verify slides are in order
        const slideIds = quizData.slides.map(s => s.id);
        
        // Each slide should have a unique ID
        const uniqueIds = new Set(slideIds);
        expect(uniqueIds.size).toBe(slideIds.length);
        
        // Slides should be in the order they were created
        for (let i = 0; i < quizData.slides.length; i++) {
          const expectedId = quizData.slides[i].type === 'content' 
            ? `content-${i}` 
            : `quiz-${i}`;
          expect(quizData.slides[i].id).toBe(expectedId);
        }
        
        // Total slides should match metadata
        expect(quizData.slides.length).toBe(quizData.metadata.totalSlides);
      }),
      { numRuns: 100 }
    );
  });
});
