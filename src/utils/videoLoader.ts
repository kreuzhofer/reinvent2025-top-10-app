/**
 * Video loader utility for resolving video paths from data/video directory
 * 
 * Requirements: 10.5
 * - 10.5: WHEN the videoFile property is specified THEN the Quiz Application SHALL load the video from the public/data/video directory
 */

/**
 * Resolves a video filename to its full path in the data/video directory
 * 
 * @param filename - The video filename from the JSON data (e.g., "demo.mp4")
 * @returns The resolved path to the video (e.g., "/data/video/demo.mp4")
 * 
 * @example
 * ```typescript
 * const videoPath = resolveVideoPath("demo.mp4");
 * // Returns: "/data/video/demo.mp4"
 * ```
 */
export function resolveVideoPath(filename: string): string {
  // Handle empty or invalid filenames
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  // Remove any leading slashes to ensure consistent path resolution
  const cleanFilename = filename.replace(/^\/+/, '');

  // Resolve relative to the data/video directory
  // Files in public/ are served from the root in production
  return `/data/video/${cleanFilename}`;
}

/**
 * Gets a placeholder video path for when a video fails to load
 * 
 * @returns The path to a placeholder video
 */
export function getPlaceholderVideo(): string {
  return '/data/video/placeholder.mp4';
}
