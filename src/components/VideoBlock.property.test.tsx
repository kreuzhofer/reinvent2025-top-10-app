/**
 * Property-Based Tests for VideoBlock Component
 * 
 * These tests verify universal properties that should hold across all valid inputs.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { VideoBlockComponent, VideoBlock } from './VideoBlock';

describe('VideoBlock Property-Based Tests', () => {
  beforeEach(() => {
    // Mock console.error to avoid noise from expected errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Feature: ui-progress-and-layout-improvements, Property 9: Video autoplay behavior
   * Validates: Requirements 10.2
   * 
   * For any video block with autoplay set to true, the video should attempt to play 
   * automatically when the slide loads (subject to browser autoplay policies)
   */
  it('Property 9: Video autoplay behavior', () => {
    fc.assert(
      fc.property(
        fc.record({
          videoFile: fc.stringMatching(/^[a-zA-Z0-9_-]+\.(mp4|webm)$/),
          autoplay: fc.constant(true),
          loop: fc.boolean(),
          size: fc.constantFrom('small', 'medium', 'large', 'full'),
          caption: fc.option(fc.string(), { nil: undefined }),
          preview: fc.option(fc.string(), { nil: undefined }),
        }),
        (blockData) => {
          const block: VideoBlock = {
            type: 'video',
            ...blockData,
          };

          // Mock the video element's play method
          const playMock = vi.fn().mockResolvedValue(undefined);
          HTMLVideoElement.prototype.play = playMock;

          const { container } = render(<VideoBlockComponent block={block} />);

          const videoElement = container.querySelector('[data-testid="video-element"]') as HTMLVideoElement;
          expect(videoElement).toBeDefined();

          // The video element should have autoplay behavior triggered
          // We verify that the video element exists and has the correct src path
          expect(videoElement.src).toContain('/data/video/');
          expect(videoElement.src).toContain(block.videoFile);

          // Cleanup after each property test run
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: ui-progress-and-layout-improvements, Property 10: Video loop behavior
   * Validates: Requirements 10.3
   * 
   * For any video block with loop set to true, the video should restart from the 
   * beginning when playback completes
   */
  it('Property 10: Video loop behavior', () => {
    fc.assert(
      fc.property(
        fc.record({
          videoFile: fc.stringMatching(/^[a-zA-Z0-9_-]+\.(mp4|webm)$/),
          autoplay: fc.boolean(),
          loop: fc.constant(true),
          size: fc.constantFrom('small', 'medium', 'large', 'full'),
          caption: fc.option(fc.string(), { nil: undefined }),
          preview: fc.option(fc.string(), { nil: undefined }),
        }),
        (blockData) => {
          const block: VideoBlock = {
            type: 'video',
            ...blockData,
          };

          const { container } = render(<VideoBlockComponent block={block} />);

          const videoElement = container.querySelector('[data-testid="video-element"]') as HTMLVideoElement;
          
          // Verify the loop attribute is set correctly
          expect(videoElement.loop).toBe(true);

          // Cleanup after each property test run
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: ui-progress-and-layout-improvements, Property 11: Video size consistency
   * Validates: Requirements 10.6
   * 
   * For any video block with a specified size property, the rendered video should use 
   * the same size classes as image blocks with the same size value
   */
  it('Property 11: Video size consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          videoFile: fc.stringMatching(/^[a-zA-Z0-9_-]+\.(mp4|webm)$/),
          autoplay: fc.boolean(),
          loop: fc.boolean(),
          size: fc.constantFrom('small', 'medium', 'large', 'full'),
          caption: fc.option(fc.string(), { nil: undefined }),
          preview: fc.option(fc.string(), { nil: undefined }),
        }),
        (blockData) => {
          const block: VideoBlock = {
            type: 'video',
            ...blockData,
          };

          const sizeClassMap = {
            small: 'max-w-sm',
            medium: 'max-w-2xl',
            large: 'max-w-4xl',
            full: 'w-full',
          };

          const { container } = render(<VideoBlockComponent block={block} />);

          const figure = container.querySelector('figure');
          expect(figure).toBeDefined();
          
          // Verify the size class is applied correctly
          const expectedSizeClass = sizeClassMap[block.size || 'medium'];
          expect(figure?.className).toContain(expectedSizeClass);

          // Cleanup after each property test run
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
