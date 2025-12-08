# Quiz Data Files

This directory contains the quiz data files that are served as static assets.

## Files

- `reinvent-2025-quiz-deck.json` - The primary quiz data file with all announcements and questions
- `quiz-data.json` - Legacy quiz data file (kept for compatibility)

## Images

The `images/` subdirectory contains all images referenced in the quiz data.

## Why in public/?

Files in the `public/` directory are:
- Copied as-is to the build output by Vite
- Served from the root path in production (e.g., `/data/quiz.json`)
- Not processed or bundled by Vite
- Accessible via fetch() at runtime

This is the correct location for JSON data files that need to be loaded dynamically at runtime.

## Development vs Production

- **Development**: Files are served from `http://localhost:5173/data/`
- **Production**: Files are served from `/data/` (root of the deployed app)

The paths in the code use `/data/` which works in both environments.
