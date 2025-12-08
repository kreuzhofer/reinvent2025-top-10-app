# AWS re:Invent 2025 Quiz App - Project Setup

## Overview

This project is a browser-based, interactive quiz application for AWS re:Invent 2025 announcements, built with React, TypeScript, and Vite.

## Technology Stack

- **React 19.2.0**: UI framework with functional components and hooks
- **TypeScript 5.9.3**: Type safety and developer experience
- **Vite 7.2.6**: Fast build tool and development server
- **React Router 7.10.1**: Client-side routing
- **Tailwind CSS 4.1.17**: Utility-first styling framework with re:Invent brand colors
- **Lucide React 0.556.0**: Icon library for general UI icons
- **Framer Motion 12.23.25**: Animation library for smooth transitions
- **Vitest 4.0.15**: Testing framework
- **@testing-library/react 16.3.0**: Component testing utilities
- **fast-check 4.4.0**: Property-based testing library

## Project Structure

```
src/
├── components/       # React components (WelcomeScreen, ContentSlide, QuizSlide, etc.)
├── context/          # React context providers (ScoreContext)
├── hooks/            # Custom React hooks (useQuizData, useKeyboardNav)
├── types/            # TypeScript type definitions (quiz.types.ts)
├── utils/            # Utility functions (imageLoader, iconMapper)
├── data/             # Quiz data and images
│   ├── quiz-data.json
│   └── images/       # Image assets
├── styles/           # Theme configuration (theme.ts)
├── test/             # Test setup files
├── App.tsx           # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles with Tailwind

public/
└── reinvent-logo.png # re:Invent logo (to be added)
```

## Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint

## re:Invent Branding

### Color Palette

The application uses the official re:Invent color scheme:

- **Background**: Black (#000000)
- **Text**: White (#FFFFFF)
- **Accent Colors**:
  - Purple: #8B5CF6 (Primary)
  - Blue: #3B82F6 (Secondary)
  - Red: #EF4444 (Tertiary)
  - Yellow: #F59E0B (Quaternary)

### Typography

- **Font Family**: Amazon Ember, Helvetica Neue, Arial, sans-serif

### Custom Tailwind Classes

Use these custom color classes in your components:
- `text-reinvent-purple`
- `text-reinvent-blue`
- `text-reinvent-red`
- `text-reinvent-yellow`
- `bg-reinvent-purple`
- etc.

## TypeScript Types

All quiz-related types are defined in `src/types/quiz.types.ts`:

- `QuizData` - Main quiz data structure
- `Slide` - Union type for ContentSlide | QuizSlide
- `ContentSlide` - Announcement/information slides
- `QuizSlide` - Interactive quiz questions
- `ContentBlock` - Union type for various content types (text, image, icon, list, stat)
- `ScoreContextType` - Score management context
- `QuizState` - Quiz navigation state

## Quiz Data Format

Quiz content is defined in `src/data/quiz-data.json`. See the design document for the complete schema.

Example structure:
```json
{
  "metadata": {
    "title": "AWS re:Invent 2025 Quiz",
    "description": "Test your knowledge",
    "version": "1.0.0",
    "totalSlides": 3
  },
  "slides": [
    {
      "type": "content",
      "id": "announcement-1",
      "title": "Service Name",
      "content": [...]
    },
    {
      "type": "quiz",
      "id": "quiz-1",
      "question": "Question text?",
      "choices": [...],
      "correctAnswerIndex": 2,
      "points": 100
    }
  ]
}
```

## Testing

### Unit Tests

- Located alongside components (e.g., `Component.test.tsx`)
- Use `@testing-library/react` for component testing
- Run with `npm test`

### Property-Based Tests

- Use `fast-check` library
- Minimum 100 iterations per property
- Tagged with format: `**Feature: reinvent-quiz-app, Property {number}: {property_text}**`

## Development Workflow

1. Start the development server: `npm run dev`
2. Make changes to components in `src/components/`
3. Tests run automatically in watch mode: `npm run test:watch`
4. Build for production: `npm run build`

## Next Steps

Refer to `.kiro/specs/reinvent-quiz-app/tasks.md` for the implementation plan.

The next tasks involve:
1. Defining TypeScript interfaces (✓ Complete)
2. Creating theme configuration (✓ Complete)
3. Implementing data loading and validation
4. Building core components
5. Adding animations and polish

## Requirements

- Node.js 18+ recommended
- npm 9+ recommended

## Notes

- The application runs entirely in the browser with no backend
- All quiz data is loaded from the JSON file at startup
- Images should be placed in `src/data/images/`
- The re:Invent logo should be added to `public/reinvent-logo.png`
