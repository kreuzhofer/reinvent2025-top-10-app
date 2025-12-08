/**
 * AWS re:Invent 2025 Theme Configuration
 * 
 * This file defines the color palette, typography, and design tokens
 * for the re:Invent Quiz App, based on the official re:Invent branding.
 */

export const colors = {
  // Base colors
  background: '#000000',      // Black background
  text: '#FFFFFF',            // White text
  
  // Accent colors (from re:Invent palette)
  purple: '#8B5CF6',          // Primary accent
  blue: '#3B82F6',            // Secondary accent
  red: '#EF4444',             // Tertiary accent
  yellow: '#F59E0B',          // Quaternary accent
  orange: '#F97316',          // Additional accent
  green: '#10B981',           // Success/correct color
  
  // UI colors
  correct: '#10B981',         // Green for correct answers
  incorrect: '#EF4444',       // Red for incorrect answers
  hover: '#1F1F1F',           // Subtle hover state
  border: '#333333',          // Border color
  muted: '#6B7280',           // Muted text color
} as const;

export const fonts = {
  heading: '"Amazon Ember", "Helvetica Neue", Arial, sans-serif',
  body: '"Amazon Ember", "Helvetica Neue", Arial, sans-serif',
  mono: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
} as const;

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const;

export const borderRadius = {
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  full: '9999px',   // Fully rounded
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',
  slow: '500ms ease-in-out',
} as const;

export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
} as const;

// Export type for TypeScript autocomplete
export type ThemeColors = typeof colors;
export type ThemeFonts = typeof fonts;
export type ThemeSpacing = typeof spacing;
export type ThemeBorderRadius = typeof borderRadius;
export type ThemeTransitions = typeof transitions;
export type ThemeBreakpoints = typeof breakpoints;
