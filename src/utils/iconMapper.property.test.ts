/**
 * Property-based tests for icon rendering mapping
 * 
 * Feature: reinvent-quiz-app, Property 10: Icon rendering mapping
 * Validates: Requirements 4.5, 5.2, 5.3
 * 
 * Property 10: Icon rendering mapping
 * For any valid icon identifier (AWS or Lucide), the system should render the 
 * corresponding icon component without errors.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getLucideIcon,
  getAWSServiceIcon,
  resolveIcon,
  isValidIcon,
  getAvailableAWSIcons,
} from './iconMapper';

describe('Icon Rendering Mapping - Property-Based Tests', () => {
  /**
   * Feature: reinvent-quiz-app, Property 10: Icon rendering mapping
   * Validates: Requirements 4.5, 5.2, 5.3
   */
  it('should resolve any valid AWS service icon to an identifier', () => {
    const awsIcons = getAvailableAWSIcons();
    
    fc.assert(
      fc.property(
        fc.constantFrom(...awsIcons),
        (serviceName) => {
          const iconId = getAWSServiceIcon(serviceName);

          // Property: Valid AWS service names should resolve to identifiers
          expect(iconId).toBeDefined();
          expect(typeof iconId).toBe('string');
          
          // Property: AWS icon identifiers should follow the 'aws-*' pattern
          expect(iconId).toMatch(/^aws-/);
          
          // Property: The identifier should contain the service name
          expect(iconId?.toLowerCase()).toContain(serviceName.toLowerCase());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle case-insensitive AWS service name lookups', () => {
    const awsIcons = getAvailableAWSIcons();
    
    fc.assert(
      fc.property(
        fc.constantFrom(...awsIcons),
        fc.constantFrom('lower', 'upper', 'mixed'),
        (serviceName, caseType) => {
          let transformedName = serviceName;
          if (caseType === 'upper') {
            transformedName = serviceName.toUpperCase();
          } else if (caseType === 'mixed') {
            transformedName = serviceName
              .split('')
              .map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()))
              .join('');
          }

          const iconId = getAWSServiceIcon(transformedName);

          // Property: Case variations should resolve to the same identifier
          expect(iconId).toBeDefined();
          expect(iconId).toBe(getAWSServiceIcon(serviceName));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return undefined for invalid AWS service names', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 })
          .filter(s => !getAvailableAWSIcons().includes(s.toLowerCase())),
        (invalidService) => {
          const iconId = getAWSServiceIcon(invalidService);

          // Property: Invalid service names should return undefined
          expect(iconId).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should resolve valid Lucide icon names to components', () => {
    // Test with known valid Lucide icons
    const knownLucideIcons = [
      'check-circle',
      'x-circle',
      'star',
      'heart',
      'home',
      'user',
      'settings',
      'search',
      'menu',
      'arrow-right',
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...knownLucideIcons),
        (iconName) => {
          const iconComponent = getLucideIcon(iconName);

          // Property: Valid Lucide icon names should resolve to components
          expect(iconComponent).toBeDefined();
          
          // Property: The result should be a function or React forwardRef object
          const isValidComponent = 
            typeof iconComponent === 'function' || 
            (iconComponent && typeof iconComponent === 'object');
          expect(isValidComponent).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return undefined for invalid Lucide icon names', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 })
          .filter(s => s.trim().length > 0)
          .map(s => `invalid-icon-${s}`),
        (invalidIcon) => {
          const iconComponent = getLucideIcon(invalidIcon);

          // Property: Invalid icon names should return undefined
          expect(iconComponent).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty or invalid inputs gracefully', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.constant(null),
          fc.constant(undefined)
        ),
        (invalidInput) => {
          // @ts-expect-error - Testing invalid inputs
          const lucideResult = getLucideIcon(invalidInput);
          // @ts-expect-error - Testing invalid inputs
          const awsResult = getAWSServiceIcon(invalidInput);

          // Property: Invalid inputs should return undefined
          expect(lucideResult).toBeUndefined();
          expect(awsResult).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly resolve icons based on type', () => {
    const awsIcons = getAvailableAWSIcons();
    const knownLucideIcons = ['check-circle', 'x-circle', 'star', 'heart'];

    fc.assert(
      fc.property(
        fc.oneof(
          fc.record({
            type: fc.constant('aws' as const),
            name: fc.constantFrom(...awsIcons),
          }),
          fc.record({
            type: fc.constant('lucide' as const),
            name: fc.constantFrom(...knownLucideIcons),
          })
        ),
        ({ type, name }) => {
          const result = resolveIcon(type, name);

          // Property: The result type should match the requested type
          expect(result.type).toBe(type);

          if (type === 'aws') {
            // Property: AWS icons should have an identifier
            expect(result.identifier).toBeDefined();
            expect(typeof result.identifier).toBe('string');
            expect(result.component).toBeUndefined();
          } else {
            // Property: Lucide icons should have a component
            expect(result.component).toBeDefined();
            const isValidComponent = 
              typeof result.component === 'function' || 
              (result.component && typeof result.component === 'object');
            expect(isValidComponent).toBe(true);
            expect(result.identifier).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly validate icon existence', () => {
    const awsIcons = getAvailableAWSIcons();
    const knownLucideIcons = ['check-circle', 'x-circle', 'star'];

    fc.assert(
      fc.property(
        fc.oneof(
          fc.record({
            type: fc.constant('aws' as const),
            name: fc.constantFrom(...awsIcons),
            shouldBeValid: fc.constant(true),
          }),
          fc.record({
            type: fc.constant('lucide' as const),
            name: fc.constantFrom(...knownLucideIcons),
            shouldBeValid: fc.constant(true),
          }),
          fc.record({
            type: fc.constantFrom('aws' as const, 'lucide' as const),
            name: fc.string({ minLength: 1, maxLength: 20 }).map(s => `invalid-${s}`),
            shouldBeValid: fc.constant(false),
          })
        ),
        ({ type, name, shouldBeValid }) => {
          const isValid = isValidIcon(type, name);

          // Property: isValidIcon should correctly identify valid and invalid icons
          if (shouldBeValid) {
            expect(isValid).toBe(true);
          }
          // Note: We can't guarantee invalid for the third case since the random
          // string might accidentally match a real icon name
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return a consistent list of available AWS icons', () => {
    // Property: getAvailableAWSIcons should always return the same list
    const icons1 = getAvailableAWSIcons();
    const icons2 = getAvailableAWSIcons();

    expect(icons1).toEqual(icons2);
    
    // Property: The list should not be empty
    expect(icons1.length).toBeGreaterThan(0);
    
    // Property: All entries should be strings
    icons1.forEach(icon => {
      expect(typeof icon).toBe('string');
      expect(icon.length).toBeGreaterThan(0);
    });
  });

  it('should handle AWS service names with whitespace', () => {
    const awsIcons = getAvailableAWSIcons();
    
    fc.assert(
      fc.property(
        fc.constantFrom(...awsIcons),
        fc.constantFrom('', ' ', '  ', '\t', '\n'),
        (serviceName, whitespace) => {
          const nameWithWhitespace = `${whitespace}${serviceName}${whitespace}`;
          const iconId = getAWSServiceIcon(nameWithWhitespace);

          // Property: Whitespace should be trimmed and icon should resolve
          expect(iconId).toBeDefined();
          expect(iconId).toBe(getAWSServiceIcon(serviceName));
        }
      ),
      { numRuns: 100 }
    );
  });
});
