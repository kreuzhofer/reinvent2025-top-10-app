import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { QuizData, ContentSlide, QuizSlide } from './quiz.types';
import type { AudioConfig } from './audio.types';

/**
 * Property-Based Tests for Quiz Data Types with Audio Support
 * 
 * **Feature: quiz-engagement-enhancements, Property 28: Background music data structure support**
 * **Validates: Requirements 9.1, 9.2**
 * 
 * Property: For any slide or question in the quiz data with a backgroundMusic property,
 * the property value should be parsed and accessible. The audioConfig should be accessible
 * from QuizData when present.
 */
describe('Quiz Data Types - Audio Support Property Tests', () => {
  /**
   * Property 28: Background music data structure support
   * 
   * For any ContentSlide with a backgroundMusic property, the property should be:
   * 1. Optional (can be undefined)
   * 2. When present, should be a string
   * 3. Should be accessible from the slide object
   */
  it('Property 28a: ContentSlide supports optional backgroundMusic property', () => {
    fc.assert(
      fc.property(
        // Generate ContentSlide with optional backgroundMusic
        fc.record({
          type: fc.constant('content' as const),
          id: fc.string({ minLength: 1, maxLength: 50 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          content: fc.constant([]) as fc.Arbitrary<[]>, // Simplified for testing
          backgroundMusic: fc.option(
            fc.string({ minLength: 1, maxLength: 100 }),
            { nil: undefined }
          )
        }),
        (slide: ContentSlide) => {
          // Property 1: backgroundMusic is optional
          expect(slide).toHaveProperty('type', 'content');
          expect(slide).toHaveProperty('id');
          expect(slide).toHaveProperty('title');
          expect(slide).toHaveProperty('content');
          
          // Property 2 & 3: When backgroundMusic is present, it should be a string and accessible
          if (slide.backgroundMusic !== undefined) {
            expect(typeof slide.backgroundMusic).toBe('string');
            expect(slide.backgroundMusic.length).toBeGreaterThan(0);
          }
          
          // Verify the property is accessible
          const bgMusic = slide.backgroundMusic;
          if (bgMusic !== undefined) {
            expect(bgMusic).toBe(slide.backgroundMusic);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 28b: QuizSlide supports optional backgroundMusic property
   * 
   * For any QuizSlide with a backgroundMusic property, the property should be:
   * 1. Optional (can be undefined)
   * 2. When present, should be a string
   * 3. Should be accessible from the slide object
   */
  it('Property 28b: QuizSlide supports optional backgroundMusic property', () => {
    fc.assert(
      fc.property(
        // Generate QuizSlide with optional backgroundMusic
        fc.record({
          type: fc.constant('quiz' as const),
          id: fc.string({ minLength: 1, maxLength: 50 }),
          question: fc.string({ minLength: 1, maxLength: 200 }),
          choices: fc.array(
            fc.record({
              text: fc.string({ minLength: 1, maxLength: 100 })
            }),
            { minLength: 2, maxLength: 6 }
          ),
          correctAnswerIndex: fc.nat(),
          points: fc.integer({ min: 1, max: 100 }),
          backgroundMusic: fc.option(
            fc.string({ minLength: 1, maxLength: 100 }),
            { nil: undefined }
          )
        }),
        (slide) => {
          // Ensure correctAnswerIndex is valid
          const validSlide: QuizSlide = {
            ...slide,
            correctAnswerIndex: slide.correctAnswerIndex % slide.choices.length
          };
          
          // Property 1: backgroundMusic is optional
          expect(validSlide).toHaveProperty('type', 'quiz');
          expect(validSlide).toHaveProperty('id');
          expect(validSlide).toHaveProperty('question');
          expect(validSlide).toHaveProperty('choices');
          
          // Property 2 & 3: When backgroundMusic is present, it should be a string and accessible
          if (validSlide.backgroundMusic !== undefined) {
            expect(typeof validSlide.backgroundMusic).toBe('string');
            expect(validSlide.backgroundMusic.length).toBeGreaterThan(0);
          }
          
          // Verify the property is accessible
          const bgMusic = validSlide.backgroundMusic;
          if (bgMusic !== undefined) {
            expect(bgMusic).toBe(validSlide.backgroundMusic);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 28c: QuizData supports optional audioConfig property
   * 
   * For any QuizData with an audioConfig property, the property should be:
   * 1. Optional (can be undefined)
   * 2. When present, should be an AudioConfig object
   * 3. Should be accessible from the QuizData object
   * 4. AudioConfig properties should be accessible when present
   */
  it('Property 28c: QuizData supports optional audioConfig property', () => {
    fc.assert(
      fc.property(
        // Generate QuizData with optional audioConfig
        fc.record({
          metadata: fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 200 }),
            version: fc.string({ minLength: 1, maxLength: 20 }),
            totalSlides: fc.integer({ min: 1, max: 100 })
          }),
          slides: fc.constant([]) as fc.Arbitrary<[]>, // Simplified for testing
          audioConfig: fc.option(
            fc.record({
              welcomeMusic: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
              defaultQuizMusic: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
              victoryMusic: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
              musicVolume: fc.option(fc.float({ min: 0, max: 1 }), { nil: undefined }),
              sfxVolume: fc.option(fc.float({ min: 0, max: 1 }), { nil: undefined })
            }),
            { nil: undefined }
          )
        }),
        (quizData: QuizData) => {
          // Property 1: audioConfig is optional
          expect(quizData).toHaveProperty('metadata');
          expect(quizData).toHaveProperty('slides');
          
          // Property 2 & 3: When audioConfig is present, it should be an object and accessible
          if (quizData.audioConfig !== undefined) {
            expect(typeof quizData.audioConfig).toBe('object');
            expect(quizData.audioConfig).not.toBeNull();
            
            // Property 4: AudioConfig properties should be accessible when present
            const config: AudioConfig = quizData.audioConfig;
            
            if (config.welcomeMusic !== undefined) {
              expect(typeof config.welcomeMusic).toBe('string');
              expect(config.welcomeMusic.length).toBeGreaterThan(0);
            }
            
            if (config.defaultQuizMusic !== undefined) {
              expect(typeof config.defaultQuizMusic).toBe('string');
              expect(config.defaultQuizMusic.length).toBeGreaterThan(0);
            }
            
            if (config.victoryMusic !== undefined) {
              expect(typeof config.victoryMusic).toBe('string');
              expect(config.victoryMusic.length).toBeGreaterThan(0);
            }
            
            if (config.musicVolume !== undefined) {
              expect(typeof config.musicVolume).toBe('number');
              expect(config.musicVolume).toBeGreaterThanOrEqual(0);
              expect(config.musicVolume).toBeLessThanOrEqual(1);
            }
            
            if (config.sfxVolume !== undefined) {
              expect(typeof config.sfxVolume).toBe('number');
              expect(config.sfxVolume).toBeGreaterThanOrEqual(0);
              expect(config.sfxVolume).toBeLessThanOrEqual(1);
            }
          }
          
          // Verify the property is accessible
          const audioConfig = quizData.audioConfig;
          if (audioConfig !== undefined) {
            expect(audioConfig).toBe(quizData.audioConfig);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 28d: Slides with backgroundMusic can be part of QuizData
   * 
   * For any QuizData containing slides with backgroundMusic properties,
   * the backgroundMusic values should be accessible through the slides array.
   */
  it('Property 28d: backgroundMusic properties are accessible through QuizData slides', () => {
    fc.assert(
      fc.property(
        // Generate QuizData with slides that have backgroundMusic
        fc.record({
          metadata: fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 200 }),
            version: fc.string({ minLength: 1, maxLength: 20 }),
            totalSlides: fc.nat()
          }),
          slides: fc.array(
            fc.oneof(
              // ContentSlide with backgroundMusic
              fc.record({
                type: fc.constant('content' as const),
                id: fc.string({ minLength: 1, maxLength: 50 }),
                title: fc.string({ minLength: 1, maxLength: 100 }),
                content: fc.constant([]) as fc.Arbitrary<[]>,
                backgroundMusic: fc.option(
                  fc.string({ minLength: 1, maxLength: 100 }),
                  { nil: undefined }
                )
              }),
              // QuizSlide with backgroundMusic
              fc.record({
                type: fc.constant('quiz' as const),
                id: fc.string({ minLength: 1, maxLength: 50 }),
                question: fc.string({ minLength: 1, maxLength: 200 }),
                choices: fc.array(
                  fc.record({
                    text: fc.string({ minLength: 1, maxLength: 100 })
                  }),
                  { minLength: 2, maxLength: 6 }
                ),
                correctAnswerIndex: fc.nat(),
                points: fc.integer({ min: 1, max: 100 }),
                backgroundMusic: fc.option(
                  fc.string({ minLength: 1, maxLength: 100 }),
                  { nil: undefined }
                )
              })
            ),
            { minLength: 1, maxLength: 10 }
          )
        }),
        (quizData) => {
          // Fix correctAnswerIndex for quiz slides
          const validQuizData: QuizData = {
            ...quizData,
            metadata: {
              ...quizData.metadata,
              totalSlides: quizData.slides.length
            },
            slides: quizData.slides.map(slide => {
              if (slide.type === 'quiz') {
                return {
                  ...slide,
                  correctAnswerIndex: slide.correctAnswerIndex % slide.choices.length
                };
              }
              return slide;
            })
          };
          
          // Verify slides are accessible
          expect(validQuizData.slides).toBeDefined();
          expect(Array.isArray(validQuizData.slides)).toBe(true);
          
          // For each slide, verify backgroundMusic is accessible if present
          validQuizData.slides.forEach(slide => {
            if ('backgroundMusic' in slide && slide.backgroundMusic !== undefined) {
              expect(typeof slide.backgroundMusic).toBe('string');
              expect(slide.backgroundMusic.length).toBeGreaterThan(0);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
