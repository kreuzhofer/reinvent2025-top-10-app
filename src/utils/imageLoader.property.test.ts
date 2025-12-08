/**
 * Property-based tests for image path resolution
 * 
 * Feature: reinvent-quiz-app, Property 9: Image path resolution
 * Validates: Requirements 4.4, 5.1
 * 
 * Property 9: Image path resolution
 * For any image block with a filename, the resolved path should point to the 
 * data/images directory with the correct filename.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { resolveImagePath, getPlaceholderImage, preloadImage } from './imageLoader';

describe('Image Path Resolution - Property-Based Tests', () => {
  /**
   * Feature: reinvent-quiz-app, Property 9: Image path resolution
   * Validates: Requirements 4.4, 5.1
   */
  it('should resolve any valid filename to the data/images directory', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary filenames with various extensions
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
          extension: fc.constantFrom('png', 'jpg', 'jpeg', 'svg', 'gif', 'webp')
        }),
        ({ name, extension }) => {
          const filename = `${name}.${extension}`;
          const resolvedPath = resolveImagePath(filename);

          // Property: The resolved path should always point to /data/images/
          expect(resolvedPath).toContain('/data/images/');
          
          // Property: The resolved path should end with the original filename
          expect(resolvedPath).toContain(filename);
          
          // Property: The resolved path should be a valid path format
          expect(resolvedPath).toMatch(/^\/data\/images\/.+\.(png|jpg|jpeg|svg|gif|webp)$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle filenames with leading slashes consistently', () => {
    fc.assert(
      fc.property(
        fc.record({
          leadingSlashes: fc.array(fc.constant('/'), { maxLength: 5 }).map(arr => arr.join('')),
          filename: fc.string({ minLength: 1, maxLength: 30 })
            .filter(s => s.trim().length > 0 && !s.startsWith('/'))
            .map(s => `${s}.png`)
        }),
        ({ leadingSlashes, filename }) => {
          const filenameWithSlashes = `${leadingSlashes}${filename}`;
          const resolvedPath = resolveImagePath(filenameWithSlashes);

          // Property: Leading slashes should be removed, resulting in consistent paths
          expect(resolvedPath).toBe(`/data/images/${filename}`);
          
          // Property: No double slashes should appear in the path
          expect(resolvedPath).not.toContain('//');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return empty string for invalid inputs', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.constant(null),
          fc.constant(undefined)
        ),
        (invalidInput) => {
          // @ts-expect-error - Testing invalid inputs
          const resolvedPath = resolveImagePath(invalidInput);

          // Property: Invalid inputs should return empty string
          expect(resolvedPath).toBe('');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve filename structure in resolved path', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          fc.constantFrom('png', 'jpg', 'svg')
        ),
        ([prefix, suffix, ext]) => {
          const filename = `${prefix}-${suffix}.${ext}`;
          const resolvedPath = resolveImagePath(filename);

          // Property: The filename structure should be preserved in the path
          expect(resolvedPath).toContain(prefix);
          expect(resolvedPath).toContain(suffix);
          expect(resolvedPath).toContain(ext);
          
          // Property: The path should end with the complete filename
          expect(resolvedPath.endsWith(filename)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always return a placeholder image path', () => {
    // Property: getPlaceholderImage should always return a non-empty string
    const placeholder = getPlaceholderImage();
    expect(placeholder).toBeTruthy();
    expect(typeof placeholder).toBe('string');
    expect(placeholder.length).toBeGreaterThan(0);
    
    // Property: Placeholder should be a valid data URL or image path
    expect(placeholder).toMatch(/^(data:image\/|\/|http)/);
  });

  it('should handle preload for any valid filename', async () => {
    // Note: This test validates the function structure, not actual image loading
    // since we're in a test environment without real images
    
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0).map(s => `test-${s}.png`),
        async (filename) => {
          // Property: preloadImage should return a Promise
          const result = preloadImage(filename);
          expect(result).toBeInstanceOf(Promise);
          
          // The promise will reject in test environment (no real images)
          // but the function should handle it gracefully
          try {
            await Promise.race([
              result,
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 100))
            ]);
            // If it succeeds (unlikely in test env), that's fine
            return true;
          } catch (error) {
            // Property: Errors should be Error instances
            expect(error).toBeInstanceOf(Error);
            // Either it's our timeout or the actual image load error
            return true;
          }
        }
      ),
      { numRuns: 10 } // Fewer runs for async tests
    );
  }, 10000); // Increase test timeout
});
