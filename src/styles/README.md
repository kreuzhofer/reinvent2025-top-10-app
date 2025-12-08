# Theme Configuration

This directory contains the theme configuration for the AWS re:Invent 2025 Quiz App.

## Files

### `theme.ts`
TypeScript configuration file that exports theme constants including:
- **colors**: re:Invent brand colors and UI state colors
- **fonts**: Amazon Ember font family with fallbacks
- **spacing**: Consistent spacing scale
- **borderRadius**: Border radius values
- **transitions**: Animation timing values
- **breakpoints**: Responsive design breakpoints

### Usage in Components

```typescript
import { colors, fonts, spacing } from '@/styles/theme';

// Use in styled components or inline styles
const buttonStyle = {
  backgroundColor: colors.purple,
  fontFamily: fonts.body,
  padding: spacing.md,
};
```

### Usage with Tailwind CSS

The theme is also configured in `src/index.css` using Tailwind CSS v4's `@theme` directive. You can use the custom colors in your Tailwind classes:

```tsx
<div className="bg-black text-white">
  <button className="bg-[--color-reinvent-purple] hover:bg-[--color-reinvent-blue]">
    Click me
  </button>
</div>
```

## re:Invent Brand Colors

- **Purple** (#8B5CF6): Primary accent color
- **Blue** (#3B82F6): Secondary accent color
- **Red** (#EF4444): Tertiary accent color
- **Yellow** (#F59E0B): Quaternary accent color
- **Orange** (#F97316): Additional accent color
- **Green** (#10B981): Success/correct answer color

## Typography

The app uses **Amazon Ember** font with fallbacks to Helvetica Neue, Arial, and sans-serif. The font is configured with `font-display: swap` for optimal loading performance.

## Accessibility

The theme includes:
- High contrast colors (white on black)
- Focus indicators with 3:1 contrast ratio
- Reduced motion support for animations
- Custom scrollbar styling

## Logo Assets

Logo files are located in the `public/` directory:
- `reinvent-logo.svg`: Colorful gradient version
- `reinvent-logo-white.svg`: White version for dark backgrounds
- `aws.svg`: Generic AWS logo

## Requirements Satisfied

This theme configuration satisfies the following requirements:
- **6.1**: Black background and white text
- **6.2**: re:Invent-approved fonts (Amazon Ember with fallbacks)
- **6.3**: re:Invent logo display
- **6.4**: re:Invent color palette (purple, blue, red, yellow)
- **6.5**: Brand-consistent interactive states
