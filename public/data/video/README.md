# Quiz Video Files

This directory contains video files referenced in the quiz data file.

## Supported Video Formats

- **MP4** (H.264 codec) - Recommended for best browser compatibility
- **WebM** (VP8/VP9 codec) - Alternative format with good compression

## Video Guidelines

### File Specifications

- **Formats**: MP4 (H.264) or WebM (VP8/VP9)
- **Naming**: Use kebab-case (e.g., `product-demo.mp4`)
- **Recommended dimensions**:
  - Small: 640x360 (360p)
  - Medium: 1280x720 (720p)
  - Large: 1920x1080 (1080p)
  - Full: Responsive to container width
- **Bitrate**: 1-5 Mbps for web delivery
- **Frame Rate**: 24-30 fps
- **Audio**: AAC codec, 128 kbps (if applicable)

### File Size Considerations

- Keep video files under 50MB when possible for faster loading
- Consider providing preview images for better initial load experience
- Use appropriate compression settings to balance quality and file size

## Adding Videos to Quiz

To add videos to the quiz:

1. Place video files in this directory
2. (Optional) Add a preview image to `public/data/images/`
3. Reference the video in the quiz data JSON using a VideoBlock

### Example VideoBlock in Quiz Data

```json
{
  "type": "video",
  "videoFile": "product-demo.mp4",
  "preview": "product-demo-preview.jpg",
  "autoplay": true,
  "loop": false,
  "size": "large",
  "caption": "Product demonstration video"
}
```

### VideoBlock Properties

- **videoFile** (required): Filename of the video in this directory
- **preview** (optional): Preview image filename from `public/data/images/`
- **autoplay** (optional): Whether to autoplay video when slide loads (default: false)
- **loop** (optional): Whether to loop video playback (default: false)
- **size** (optional): Display size - `small`, `medium`, `large`, or `full` (default: medium)
- **caption** (optional): Caption text displayed below the video

## Video Behavior

### Autoplay

- When `autoplay: true`, the video will attempt to play automatically when the slide loads
- **Note**: Modern browsers may block autoplay with sound. Consider muting videos that autoplay or be prepared for autoplay to fail
- If autoplay is blocked, users can manually start playback using the video controls

### Loop

- When `loop: true`, the video will restart from the beginning when playback completes
- Useful for background videos or continuous demonstrations

### Preview Images

- Preview images (poster) are displayed before video playback starts
- If video fails to load, the preview image is shown as a fallback
- Recommended to always provide a preview image for better user experience

### Controls

- All videos include native HTML5 video controls (play, pause, volume, fullscreen)
- Users can interact with videos using standard browser controls
- Videos are keyboard accessible

## Size Classes

The size property controls the maximum width of the video:

- **small**: Max width 640px (24rem)
- **medium**: Max width 896px (56rem) - Default
- **large**: Max width 1024px (64rem)
- **full**: Full width of container

Videos maintain their aspect ratio and are responsive within these constraints.

## Error Handling

The application handles video loading errors gracefully:

- If a video file fails to load and a preview image is provided, the preview image is displayed
- If no preview image is provided, a loading placeholder is shown
- The quiz continues functioning normally even if videos fail to load
- Errors are logged to the console for debugging

## Browser Compatibility

### MP4 (H.264)
- Chrome: Full support
- Firefox: Full support
- Safari: Full support
- Edge: Full support

### WebM (VP8/VP9)
- Chrome: Full support
- Firefox: Full support
- Safari: Limited support (Safari 14.1+)
- Edge: Full support

**Recommendation**: Use MP4 (H.264) for maximum compatibility across all browsers.

## Performance Considerations

- Videos are loaded on-demand when slides are displayed
- Large video files may take time to buffer
- Consider providing preview images to improve perceived performance
- Videos are not preloaded to minimize initial page load time

## Accessibility

- Always provide meaningful captions for videos
- Preview images should have descriptive alt text
- Video controls are keyboard accessible
- Consider providing transcripts for videos with important information

## Example Usage

### Simple Video

```json
{
  "type": "video",
  "videoFile": "announcement.mp4",
  "size": "medium"
}
```

### Autoplay Looping Background Video

```json
{
  "type": "video",
  "videoFile": "background-animation.mp4",
  "preview": "background-preview.jpg",
  "autoplay": true,
  "loop": true,
  "size": "full"
}
```

### Video with Caption

```json
{
  "type": "video",
  "videoFile": "keynote-highlight.mp4",
  "preview": "keynote-preview.jpg",
  "size": "large",
  "caption": "Werner Vogels keynote highlights from re:Invent 2025"
}
```

## Development vs Production

- **Development**: Videos are served from `http://localhost:5173/data/video/`
- **Production**: Videos are served from `/data/video/` (root of the deployed app)

The paths in the code use `/data/video/` which works in both environments.

## Why in public/?

Files in the `public/` directory are:
- Copied as-is to the build output by Vite
- Served from the root path in production (e.g., `/data/video/demo.mp4`)
- Not processed or bundled by Vite
- Accessible via standard HTML5 video elements at runtime

This is the correct location for video files that need to be loaded dynamically at runtime.

## License and Attribution

Ensure all video files used in the application:
- Are properly licensed for use in your project
- Include appropriate attribution if required
- Comply with copyright and usage restrictions
- Have necessary rights for web distribution

---

For technical implementation details, refer to the design document at `.kiro/specs/ui-progress-and-layout-improvements/design.md`.
