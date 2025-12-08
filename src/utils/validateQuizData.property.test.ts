import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateQuizData } from './validateQuizData';
import type { ContentBlock } from '../types/quiz.types';

/**
 * Feature: reinvent-quiz-app, Property 8: JSON schema validation
 * Validates: Requirements 4.2
 * 
 * Property: For any JSON input, the validation function should accept valid quiz data 
 * conforming to the schema and reject invalid data with appropriate error messages.
 */

// Arbitraries for generating valid quiz data

const arbMetadata = fc.record({
  title: fc.string({ minLength: 1 }),
  description: fc.string({ minLength: 1 }),
  version: fc.string({ minLength: 1 }),
  totalSlides: fc.nat({ max: 100 }),
  author: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  date: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  tags: fc.option(fc.array(fc.string({ minLength: 1 })), { nil: undefined }),
});

const arbTextBlock = fc.record({
  type: fc.constant('text' as const),
  text: fc.string({ minLength: 1 }),
  style: fc.option(fc.constantFrom('heading', 'subheading', 'body', 'caption'), { nil: undefined }),
  emphasis: fc.option(fc.constantFrom('bold', 'italic', 'highlight'), { nil: undefined }),
});

const arbImageBlock = fc.record({
  type: fc.constant('image' as const),
  src: fc.string({ minLength: 1 }),
  alt: fc.string({ minLength: 1 }),
  caption: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  size: fc.option(fc.constantFrom('small', 'medium', 'large', 'full'), { nil: undefined }),
});

const arbIconBlock = fc.record({
  type: fc.constant('icon' as const),
  iconType: fc.constantFrom('aws', 'lucide'),
  iconName: fc.string({ minLength: 1 }),
  label: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  size: fc.option(fc.constantFrom('small', 'medium', 'large'), { nil: undefined }),
});

const arbListBlock = fc.record({
  type: fc.constant('list' as const),
  title: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  items: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
  ordered: fc.option(fc.boolean(), { nil: undefined }),
});

const arbStatBlock = fc.record({
  type: fc.constant('stat' as const),
  value: fc.string({ minLength: 1 }),
  label: fc.string({ minLength: 1 }),
  color: fc.option(fc.constantFrom('purple', 'blue', 'red', 'yellow', 'orange', 'green'), { nil: undefined }),
});

const arbCalloutBlock = fc.record({
  type: fc.constant('callout' as const),
  text: fc.string({ minLength: 1 }),
  style: fc.constantFrom('info', 'success', 'warning'),
});

const arbQuoteBlock = fc.record({
  type: fc.constant('quote' as const),
  text: fc.string({ minLength: 1 }),
  author: fc.string({ minLength: 1 }),
});

const arbGridItem = fc.record({
  icon: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  title: fc.string({ minLength: 1 }),
  description: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  stats: fc.option(fc.array(fc.string({ minLength: 1 })), { nil: undefined }),
  features: fc.option(fc.array(fc.string({ minLength: 1 })), { nil: undefined }),
  stat: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  color: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
});

const arbGridBlock = fc.record({
  type: fc.constant('grid' as const),
  columns: fc.integer({ min: 1, max: 4 }),
  items: fc.array(arbGridItem, { minLength: 1 }),
});

const arbContentBlock: fc.Arbitrary<ContentBlock> = fc.oneof(
  arbTextBlock,
  arbImageBlock,
  arbIconBlock,
  arbListBlock,
  arbStatBlock,
  arbCalloutBlock,
  arbQuoteBlock,
  arbGridBlock
);

const arbContentSlide = fc.record({
  type: fc.constant('content' as const),
  id: fc.string({ minLength: 1 }),
  title: fc.string({ minLength: 1 }),
  content: fc.array(arbContentBlock, { minLength: 1 }),
});

const arbQuizChoice = fc.record({
  text: fc.string({ minLength: 1 }),
  icon: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
});

const arbQuizSlide = fc.record({
  type: fc.constant('quiz' as const),
  id: fc.string({ minLength: 1 }),
  question: fc.string({ minLength: 1 }),
  relatedAnnouncementId: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  choices: fc.array(arbQuizChoice, { minLength: 2, maxLength: 6 }),
  correctAnswerIndex: fc.nat({ max: 5 }),
  explanation: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  funFact: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  points: fc.integer({ min: 1, max: 1000 }),
  timeLimit: fc.option(fc.integer({ min: 5, max: 60 }), { nil: undefined }),
});

const arbSlide = fc.oneof(arbContentSlide, arbQuizSlide);

const arbQuizConfig = fc.record({
  passingScore: fc.integer({ min: 0, max: 100 }),
  totalPoints: fc.integer({ min: 1, max: 10000 }),
  showExplanations: fc.boolean(),
  allowRetry: fc.boolean(),
  shuffleChoices: fc.boolean(),
  showProgressBar: fc.boolean(),
});

const arbResourcesConfig = fc.record({
  images: fc.array(
    fc.record({
      id: fc.string({ minLength: 1 }),
      filename: fc.string({ minLength: 1 }),
      description: fc.string({ minLength: 1 }),
    })
  ),
  icons: fc.record({
    aws: fc.array(fc.string({ minLength: 1 })),
    custom: fc.array(fc.string({ minLength: 1 })),
  }),
});

const arbValidQuizData = fc.record({
  metadata: arbMetadata,
  slides: fc.array(arbSlide, { minLength: 1 }),
  resources: fc.option(arbResourcesConfig, { nil: undefined }),
  quizConfig: fc.option(arbQuizConfig, { nil: undefined }),
});

describe('Property 8: JSON schema validation', () => {
  it('should accept all valid quiz data conforming to the schema', () => {
    fc.assert(
      fc.property(arbValidQuizData, (quizData) => {
        const result = validateQuizData(quizData);
        
        // Valid data should pass validation
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject data with missing required metadata fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          metadata: fc.record({
            // Missing required fields
            title: fc.option(fc.string(), { nil: undefined }),
          }),
          slides: fc.array(arbSlide, { minLength: 1 }),
        }),
        (invalidData) => {
          const result = validateQuizData(invalidData);
          
          // Should have validation errors
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject data with invalid slide types', () => {
    fc.assert(
      fc.property(
        arbMetadata,
        fc.array(
          fc.record({
            type: fc.constantFrom('invalid', 'wrong', 'bad'),
            id: fc.string({ minLength: 1 }),
          }),
          { minLength: 1 }
        ),
        (metadata, invalidSlides) => {
          const invalidData = {
            metadata,
            slides: invalidSlides,
          };
          
          const result = validateQuizData(invalidData);
          
          // Should reject invalid slide types
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.message.includes('slide type'))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject quiz slides with missing required fields', () => {
    fc.assert(
      fc.property(
        arbMetadata,
        fc.string({ minLength: 1 }),
        (metadata, id) => {
          const invalidData = {
            metadata,
            slides: [
              {
                type: 'quiz',
                id,
                // Missing question, choices, correctAnswerIndex, points
              },
            ],
          };
          
          const result = validateQuizData(invalidData);
          
          // Should have validation errors for missing fields
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject content blocks with invalid types', () => {
    fc.assert(
      fc.property(
        arbMetadata,
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (metadata, id, title) => {
          const invalidData = {
            metadata,
            slides: [
              {
                type: 'content',
                id,
                title,
                content: [
                  {
                    type: 'invalid-block-type',
                    data: 'some data',
                  },
                ],
              },
            ],
          };
          
          const result = validateQuizData(invalidData);
          
          // Should reject invalid content block types
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.message.includes('content block type'))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept quiz data with optional fields', () => {
    fc.assert(
      fc.property(
        arbValidQuizData,
        (quizData) => {
          // Ensure some optional fields are present
          const dataWithOptionals = {
            ...quizData,
            metadata: {
              ...quizData.metadata,
              author: 'Test Author',
              date: '2025-12-08',
              tags: ['aws', 'reinvent'],
            },
            resources: {
              images: [{ id: 'img1', filename: 'test.png', description: 'Test image' }],
              icons: { aws: ['s3', 'lambda'], custom: ['custom-icon'] },
            },
            quizConfig: {
              passingScore: 70,
              totalPoints: 1000,
              showExplanations: true,
              allowRetry: true,
              shuffleChoices: true,
              showProgressBar: true,
            },
          };
          
          const result = validateQuizData(dataWithOptionals);
          
          // Should accept data with optional fields
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject data that is not an object', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string(),
          fc.integer(),
          fc.boolean(),
          fc.constant(null),
          fc.array(fc.anything())
        ),
        (invalidData) => {
          const result = validateQuizData(invalidData);
          
          // Should reject non-object data
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate callout blocks correctly', () => {
    fc.assert(
      fc.property(
        arbMetadata,
        arbCalloutBlock,
        (metadata, calloutBlock) => {
          const quizData = {
            metadata,
            slides: [
              {
                type: 'content' as const,
                id: 'test-slide',
                title: 'Test Slide',
                content: [calloutBlock],
              },
            ],
          };
          
          const result = validateQuizData(quizData);
          
          // Should accept valid callout blocks
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate quote blocks correctly', () => {
    fc.assert(
      fc.property(
        arbMetadata,
        arbQuoteBlock,
        (metadata, quoteBlock) => {
          const quizData = {
            metadata,
            slides: [
              {
                type: 'content' as const,
                id: 'test-slide',
                title: 'Test Slide',
                content: [quoteBlock],
              },
            ],
          };
          
          const result = validateQuizData(quizData);
          
          // Should accept valid quote blocks
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate grid blocks correctly', () => {
    fc.assert(
      fc.property(
        arbMetadata,
        arbGridBlock,
        (metadata, gridBlock) => {
          const quizData = {
            metadata,
            slides: [
              {
                type: 'content' as const,
                id: 'test-slide',
                title: 'Test Slide',
                content: [gridBlock],
              },
            ],
          };
          
          const result = validateQuizData(quizData);
          
          // Should accept valid grid blocks
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate list blocks with optional title', () => {
    fc.assert(
      fc.property(
        arbMetadata,
        arbListBlock,
        (metadata, listBlock) => {
          const quizData = {
            metadata,
            slides: [
              {
                type: 'content' as const,
                id: 'test-slide',
                title: 'Test Slide',
                content: [listBlock],
              },
            ],
          };
          
          const result = validateQuizData(quizData);
          
          // Should accept valid list blocks with or without title
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate quiz slides with optional funFact', () => {
    fc.assert(
      fc.property(
        arbMetadata,
        arbQuizSlide,
        (metadata, quizSlide) => {
          const quizData = {
            metadata,
            slides: [quizSlide],
          };
          
          const result = validateQuizData(quizData);
          
          // Should accept valid quiz slides with or without funFact
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
