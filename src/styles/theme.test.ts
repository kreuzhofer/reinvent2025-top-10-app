import { describe, it, expect } from 'vitest';
import { colors, fonts, spacing, borderRadius, transitions, breakpoints } from './theme';

describe('Theme Configuration', () => {
  describe('colors', () => {
    it('should have all required base colors', () => {
      expect(colors.background).toBe('#000000');
      expect(colors.text).toBe('#FFFFFF');
    });

    it('should have all re:Invent accent colors', () => {
      expect(colors.purple).toBe('#8B5CF6');
      expect(colors.blue).toBe('#3B82F6');
      expect(colors.red).toBe('#EF4444');
      expect(colors.yellow).toBe('#F59E0B');
      expect(colors.orange).toBe('#F97316');
      expect(colors.green).toBe('#10B981');
    });

    it('should have UI state colors', () => {
      expect(colors.correct).toBe('#10B981');
      expect(colors.incorrect).toBe('#EF4444');
      expect(colors.hover).toBe('#1F1F1F');
      expect(colors.border).toBe('#333333');
      expect(colors.muted).toBe('#6B7280');
    });
  });

  describe('fonts', () => {
    it('should have Amazon Ember font family', () => {
      expect(fonts.heading).toContain('Amazon Ember');
      expect(fonts.body).toContain('Amazon Ember');
    });

    it('should have fallback fonts', () => {
      expect(fonts.heading).toContain('Helvetica Neue');
      expect(fonts.heading).toContain('Arial');
      expect(fonts.heading).toContain('sans-serif');
    });

    it('should have monospace font', () => {
      expect(fonts.mono).toContain('Menlo');
      expect(fonts.mono).toContain('Monaco');
    });
  });

  describe('spacing', () => {
    it('should have all spacing values', () => {
      expect(spacing.xs).toBe('0.25rem');
      expect(spacing.sm).toBe('0.5rem');
      expect(spacing.md).toBe('1rem');
      expect(spacing.lg).toBe('1.5rem');
      expect(spacing.xl).toBe('2rem');
      expect(spacing['2xl']).toBe('3rem');
      expect(spacing['3xl']).toBe('4rem');
    });
  });

  describe('borderRadius', () => {
    it('should have all border radius values', () => {
      expect(borderRadius.sm).toBe('0.25rem');
      expect(borderRadius.md).toBe('0.5rem');
      expect(borderRadius.lg).toBe('0.75rem');
      expect(borderRadius.xl).toBe('1rem');
      expect(borderRadius.full).toBe('9999px');
    });
  });

  describe('transitions', () => {
    it('should have all transition durations', () => {
      expect(transitions.fast).toBe('150ms ease-in-out');
      expect(transitions.normal).toBe('300ms ease-in-out');
      expect(transitions.slow).toBe('500ms ease-in-out');
    });
  });

  describe('breakpoints', () => {
    it('should have all responsive breakpoints', () => {
      expect(breakpoints.mobile).toBe('320px');
      expect(breakpoints.tablet).toBe('768px');
      expect(breakpoints.desktop).toBe('1024px');
      expect(breakpoints.wide).toBe('1280px');
    });
  });
});
