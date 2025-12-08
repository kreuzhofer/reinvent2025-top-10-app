# Quiz Images

This directory contains images referenced in the quiz data file.

## Referenced Images

1. **werner-keynote.jpg** - Werner Vogels delivering his final keynote at re:Invent 2025
2. **s3-express-diagram.png** - S3 Express One Zone architecture diagram

## Image Guidelines

- **Formats**: PNG, JPG, or SVG
- **Naming**: Use kebab-case (e.g., `s3-express-diagram.png`)
- **Recommended sizes**:
  - Small: 200-400px width
  - Medium: 400-800px width
  - Large: 800-1200px width
  - Full: 1200px+ width

## Adding Images

To add images to the quiz:

1. Place image files in this directory
2. Reference them in the quiz data JSON using just the filename (e.g., `"src": "werner-keynote.jpg"`)
3. The app will automatically resolve paths relative to this directory

## Placeholder Behavior

If an image fails to load, the app will display a placeholder image with the alt text. This ensures the presentation continues smoothly even if images are missing.
