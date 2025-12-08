/**
 * Image loader utility for resolving image paths from data/images directory
 * 
 * Requirements: 4.4, 5.1
 * - 4.4: WHEN the Data File specifies image paths THEN the system SHALL resolve paths relative to the data directory
 * - 5.1: WHEN an image path is specified in the Data File THEN the system SHALL load the image from the data/images directory
 */

/**
 * Resolves an image filename to its full path in the data/images directory
 * 
 * @param filename - The image filename from the JSON data (e.g., "s3-express-diagram.png")
 * @returns The resolved path to the image (e.g., "/src/data/images/s3-express-diagram.png")
 * 
 * @example
 * ```typescript
 * const imagePath = resolveImagePath("announcement-1.png");
 * // Returns: "/src/data/images/announcement-1.png"
 * ```
 */
export function resolveImagePath(filename: string): string {
  // Handle empty or invalid filenames
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  // Remove any leading slashes to ensure consistent path resolution
  const cleanFilename = filename.replace(/^\/+/, '');

  // Resolve relative to the data/images directory
  // Files in public/ are served from the root in production
  return `/data/images/${cleanFilename}`;
}

/**
 * Preloads an image to improve performance when it's displayed
 * 
 * @param filename - The image filename to preload
 * @returns Promise that resolves when the image is loaded, or rejects on error
 * 
 * @example
 * ```typescript
 * await preloadImage("announcement-1.png");
 * // Image is now cached and will load instantly when displayed
 * ```
 */
export function preloadImage(filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const path = resolveImagePath(filename);

    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${filename}`));
    
    img.src = path;
  });
}

/**
 * Gets a placeholder image path for when an image fails to load
 * 
 * @returns The path to a placeholder image or data URL
 */
export function getPlaceholderImage(): string {
  // Return a simple SVG data URL as placeholder
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23333333"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="%23999999"%3EImage not available%3C/text%3E%3C/svg%3E';
}
