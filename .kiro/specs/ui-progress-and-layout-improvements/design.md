# Design Document

## Overview

This design document outlines the implementation of user interface improvements to the AWS re:Invent quiz application. The changes focus on three main areas: replacing the numeric slide counter with a visual progress bar, simplifying the score display during gameplay, and reorganizing the header layout to integrate audio controls. These improvements will enhance the visual feedback system and create a cleaner, more focused user experience.

The implementation will modify existing React components (Header, ScoreDisplay, AudioControls) and introduce a new ProgressBar component. The changes maintain backward compatibility with the existing quiz data structure and do not require modifications to the quiz JSON format.

## Architecture

### Component Hierarchy

The current component hierarchy will be modified as follows:

```
App
├── QuizRoute
│   ├── ContentSlide
│   │   ├── ProgressBar (NEW)
│   │   └── Header (MODIFIED)
│   │       ├── Logo
│   │       ├── ScoreDisplay (MODIFIED - inline mode)
│   │       └── AudioControls (MOVED from fixed position)
│   └── QuizSlide
│       ├── ProgressBar (NEW)
│       └── Header (MODIFIED)
│           ├── Logo
│           ├── ScoreDisplay (MODIFIED - inline mode)
│           └── AudioControls (MOVED from fixed position)
├── WelcomeRoute
│   └── WelcomeScreen (NO CHANGES)
└── SummaryRoute
    └── SummaryScreen (MODIFIED - show max points)
```

### Key Architectural Changes

1. **New ProgressBar Component**: A standalone component that renders a thin horizontal bar at the top of the viewport
2. **Modified Header Component**: Remove slide counter display, integrate AudioControls into the header layout
3. **Modified ScoreDisplay Component**: Add logic to conditionally hide max points during gameplay
4. **Modified AudioControls Component**: Remove fixed positioning, make it suitable for inline header placement
5. **Modified SummaryScreen Component**: Ensure max points are displayed prominently

## Components and Interfaces

### ProgressBar Component (NEW)

A new component that displays quiz progress as a visual bar.

```typescript
interface ProgressBarProps {
  current: number;      // Current slide index (1-based)
  total: number;        // Total number of slides
  className?: string;   // Optional additional CSS classes
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, className }) => {
  const progressPercentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div 
      className={`fixed top-0 left-0 right-0 h-1 bg-gray-800 z-50 ${className}`}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Quiz progress: ${current} of ${total} slides`}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-reinvent-purple via-reinvent-blue to-reinvent-purple"
        initial={{ width: 0 }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  );
};
```

**Design Decisions:**
- Fixed positioning at the very top of the viewport (top: 0)
- Height of 3-4 pixels for subtle visual presence
- Uses Framer Motion for smooth width transitions
- Gradient color scheme matching re:Invent brand colors
- ARIA attributes for accessibility

### Header Component (MODIFIED)

The Header component will be refactored to remove the slide counter and integrate audio controls.

```typescript
interface HeaderProps {
  showScore?: boolean;      // Whether to show score display
  showAudioControls?: boolean; // Whether to show audio controls (default: true)
}

const Header: React.FC<HeaderProps> = ({ 
  showScore = false,
  showAudioControls = true
}) => {
  return (
    <header 
      className="fixed top-1 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-gray-800"
      role="banner"
    >
      <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
        {/* Logo with Date/Location */}
        <div className="flex flex-col">
          <img
            src="/reinvent-white.png"
            alt="AWS re:Invent Logo"
            className="h-8 sm:h-10 md:h-12"
          />
          <p className="text-[0.5rem] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 tracking-wide whitespace-nowrap">
            December 1-5, 2025 | Las Vegas
          </p>
        </div>

        {/* Right side: Score and Audio Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
          {showScore && <ScoreDisplay inline showMaxPoints={false} showTrophy={true} />}
          {showAudioControls && <AudioControls inline />}
        </div>
      </div>
    </header>
  );
};
```

**Design Decisions:**
- Remove `showProgress`, `currentSlide`, and `totalSlides` props (no longer needed)
- Add `showAudioControls` prop for flexibility
- Position header slightly below progress bar (top-1 instead of top-0)
- Maintain responsive design with gap spacing
- Keep logo and branding on the left
- Group score and audio controls on the right

### ScoreDisplay Component (MODIFIED)

The ScoreDisplay component will be enhanced to conditionally show/hide max points.

```typescript
interface ScoreDisplayProps {
  inline?: boolean;         // Whether to render in inline mode (for header)
  showMaxPoints?: boolean;  // Whether to show "/ totalPossible" (default: true)
  showTrophy?: boolean;     // Whether to show trophy icon with border (default: false)
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  inline = false,
  showMaxPoints = true,
  showTrophy = false
}) => {
  const { score, totalPossible } = useScore();
  const previousScoreRef = useRef(score);
  const announcementRef = useRef<HTMLDivElement>(null);

  // ... existing announcement logic ...

  if (inline) {
    const content = (
      <>
        {showTrophy && (
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-reinvent-yellow" aria-hidden="true" />
        )}
        <span className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide font-semibold">
          Score
        </span>
        <motion.span
          key={score}
          className="text-lg sm:text-xl font-bold text-white"
          initial={{ scale: 1.2, color: '#8B5CF6' }}
          animate={{ scale: 1, color: '#FFFFFF' }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
          data-testid="score-value"
        >
          {score}
        </motion.span>
        {showMaxPoints && totalPossible > 0 && (
          <span className="text-xs text-gray-400" data-testid="score-total">
            / {totalPossible}
          </span>
        )}
      </>
    );

    return (
      <>
        <div ref={announcementRef} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />
        
        {showTrophy ? (
          <div 
            className="flex items-center gap-2 px-3 py-2 border-2 border-gray-700 rounded-lg bg-gray-900/50"
            data-testid="score-display" 
            aria-label="Current quiz score"
          >
            {content}
          </div>
        ) : (
          <div className="flex items-center gap-2" data-testid="score-display" aria-label="Current quiz score">
            {content}
          </div>
        )}
      </>
    );
  }

  // ... existing fixed version ...
};
```

**Design Decisions:**
- Add `showMaxPoints` prop to control visibility of max points
- Default to `true` to maintain backward compatibility
- During gameplay (ContentSlide, QuizSlide), pass `showMaxPoints={false}`
- On SummaryScreen, ensure max points are displayed prominently
- Maintain existing animation and accessibility features

### AudioControls Component (MODIFIED)

The AudioControls component will be refactored to support inline placement in the header.

```typescript
interface AudioControlsProps {
  inline?: boolean;  // Whether to render in inline mode (for header)
}

export const AudioControls: React.FC<AudioControlsProps> = ({ inline = false }) => {
  const { isMuted, toggleMute } = useAudioManager();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMute();
    }
  };

  const buttonClasses = inline
    ? "p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors duration-200"
    : "audio-toggle-button";

  return (
    <button
      onClick={toggleMute}
      onKeyDown={handleKeyDown}
      className={buttonClasses}
      aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
      aria-pressed={isMuted}
      title={isMuted ? 'Unmute audio' : 'Mute audio'}
      type="button"
      data-testid="audio-controls"
    >
      {/* ... existing SVG icons ... */}
    </button>
  );
};
```

**Design Decisions:**
- Add `inline` prop to control styling mode
- When `inline={true}`, use header-appropriate styling
- When `inline={false}`, maintain existing fixed positioning styles
- Remove fixed positioning from App.tsx when using inline mode
- Maintain keyboard accessibility and ARIA attributes

### ContentSlide Component (MODIFIED)

```typescript
const ContentSlide: React.FC<ContentSlideProps> = ({ 
  slide, 
  onNext,
  currentSlide,
  totalSlides,
  showProgress = false,
  showScore = false
}) => {
  // ... existing logic ...

  return (
    <>
      {showProgress && currentSlide && totalSlides && (
        <ProgressBar current={currentSlide} total={totalSlides} />
      )}
      <Header showScore={showScore} showAudioControls={true} />
      <motion.main className="min-h-screen bg-black text-white px-4 sm:px-6 py-8 sm:py-12 flex flex-col pt-20 sm:pt-24">
        {/* ... existing content ... */}
      </motion.main>
    </>
  );
};
```

**Design Decisions:**
- Add ProgressBar component before Header
- Pass `showAudioControls={true}` to Header
- ScoreDisplay in Header will automatically hide max points (via `showMaxPoints={false}`)
- Maintain existing padding to account for fixed header

### QuizSlide Component (MODIFIED)

Similar modifications to ContentSlide:

```typescript
const QuizSlide: React.FC<QuizSlideProps> = ({ 
  slide, 
  onNext,
  currentSlide,
  totalSlides,
  showProgress = false,
  showScore = false,
  // ... other props
}) => {
  // ... existing logic ...

  return (
    <>
      {showProgress && currentSlide && totalSlides && (
        <ProgressBar current={currentSlide} total={totalSlides} />
      )}
      <Header showScore={showScore} showAudioControls={true} />
      <motion.main className="max-w-4xl mx-auto px-4 py-6 sm:p-8 pt-20 sm:pt-24">
        {/* ... existing content ... */}
      </motion.main>
    </>
  );
};
```

### SummaryScreen Component (MODIFIED)

```typescript
const SummaryScreen: React.FC<SummaryScreenProps> = ({ 
  score, 
  totalPossible, 
  onRestart,
  allowRetry = true 
}) => {
  // ... existing logic ...

  return (
    <>
      <Header showScore={false} showAudioControls={true} />
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8 pt-20 sm:pt-24">
        <motion.div className="text-center max-w-2xl w-full">
          {/* ... existing trophy and title ... */}

          {/* Score Display - ENSURE MAX POINTS ARE SHOWN */}
          <motion.div className="bg-gray-900 border-2 border-gray-700 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6">
              <p className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide mb-2">
                Your Score
              </p>
              <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-white" data-testid="final-score">
                {score}
                <span className="text-xl sm:text-2xl text-gray-500"> / {totalPossible}</span>
              </p>
            </div>
            {/* ... existing percentage display ... */}
          </motion.div>

          {/* ... existing restart button ... */}
        </motion.div>
      </div>
    </>
  );
};
```

**Design Decisions:**
- Do NOT show ProgressBar on summary screen
- Ensure max points are prominently displayed in the score section
- Maintain existing layout and animations
- Keep Header with audio controls but no score display

### App Component (MODIFIED)

Remove the fixed AudioControls from App.tsx since they're now integrated into the Header:

```typescript
function QuizApp() {
  // ... existing logic ...

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'never'}>
      <Routes>
        <Route path="/" element={<WelcomeRoute />} />
        <Route path="/quiz/:slideIndex" element={<QuizRoute />} />
        <Route path="/summary" element={<SummaryRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* REMOVE: Global Audio Controls - now integrated into Header */}
      
      {/* Global Keyboard Help Overlay */}
      <KeyboardHelpOverlay isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </MotionConfig>
  );
}
```

## Data Models

### Video Content Block (NEW)

A new content block type will be added to support video embedding in slides.

```typescript
interface VideoBlock {
  type: 'video';
  videoFile: string;      // Filename in public/data/video/ directory
  preview?: string;       // Optional preview image filename from public/data/images/
  autoplay?: boolean;     // Whether to autoplay video (default: false)
  loop?: boolean;         // Whether to loop video (default: false)
  size?: 'small' | 'medium' | 'large' | 'full';  // Size class (default: 'medium')
  caption?: string;       // Optional caption text
}
```

**Example JSON:**

```json
{
  "type": "video",
  "videoFile": "demo.mp4",
  "preview": "demo-preview.jpg",
  "autoplay": true,
  "loop": false,
  "size": "large",
  "caption": "Product demonstration video"
}
```

### Link Content Block (NEW)

A new content block type will be added to support clickable links in slides.

```typescript
interface LinkBlock {
  type: 'link';
  url: string;                           // Target URL
  text: string;                          // Display text for the link
  newTab?: boolean;                      // Open in new tab (default: true)
  style?: 'button' | 'text';            // Visual style (default: 'button')
}
```

**Example JSON:**

```json
{
  "type": "link",
  "url": "https://aws.amazon.com/reinvent/",
  "text": "Learn more about re:Invent",
  "newTab": true,
  "style": "button"
}
```

### ContentBlock Type Update

The existing `ContentBlock` union type will be extended to include `VideoBlock` and `LinkBlock`:

```typescript
type ContentBlock = 
  | TextBlock 
  | ImageBlock 
  | IconBlock 
  | IconListBlock
  | ListBlock 
  | StatBlock 
  | CalloutBlock 
  | QuoteBlock 
  | GridBlock
  | VideoBlock   // NEW
  | LinkBlock;   // NEW
```

### Video Utility Functions

```typescript
/**
 * Resolves video file path relative to public/data/video directory
 */
export function resolveVideoPath(filename: string): string {
  return `/data/video/${filename}`;
}

/**
 * Returns a placeholder video path for error states
 */
export function getPlaceholderVideo(): string {
  return '/data/video/placeholder.mp4';
}
```

### VideoBlock Component

A new component will be created to render video content blocks:

```typescript
interface VideoBlockComponentProps {
  block: VideoBlock;
}

const VideoBlockComponent: React.FC<VideoBlockComponentProps> = ({ block }) => {
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    full: 'w-full',
  };

  const sizeClass = sizeClasses[block.size || 'medium'];
  const videoSrc = resolveVideoPath(block.videoFile);
  const previewSrc = block.preview ? resolveImagePath(block.preview) : undefined;

  useEffect(() => {
    // Handle autoplay with user interaction requirement
    if (block.autoplay && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked by browser, silently fail
      });
    }
  }, [block.autoplay]);

  return (
    <figure className={`${sizeClass} mx-auto my-4 sm:my-6`} data-testid="video-block">
      <div className="relative rounded-lg overflow-hidden bg-gray-900">
        {!videoLoaded && !videoError && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        )}
        
        {videoError && previewSrc ? (
          <img
            src={previewSrc}
            alt={block.caption || 'Video preview'}
            className="w-full h-auto"
            data-testid="video-fallback-image"
          />
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={previewSrc}
            controls
            loop={block.loop}
            onError={() => setVideoError(true)}
            onLoadedData={() => setVideoLoaded(true)}
            className="w-full h-auto"
            data-testid="video-element"
            aria-label={block.caption || 'Video content'}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      
      {block.caption && (
        <figcaption 
          className="text-xs sm:text-sm text-gray-400 text-center mt-2 sm:mt-3 italic" 
          data-testid="video-caption"
        >
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
};
```

**Design Decisions:**
- Use HTML5 `<video>` element with native controls
- Support `poster` attribute for preview images
- Handle autoplay gracefully (browsers may block it)
- Fallback to preview image if video fails to load
- Apply same size classes as ImageBlock for consistency
- Wrap in `<figure>` with optional `<figcaption>` for semantic HTML

### LinkBlock Component

A new component will be created to render link content blocks:

```typescript
interface LinkBlockComponentProps {
  block: LinkBlock;
}

const LinkBlockComponent: React.FC<LinkBlockComponentProps> = ({ block }) => {
  const style = block.style || 'button';
  const newTab = block.newTab !== false; // Default to true

  const linkProps = {
    href: block.url,
    target: newTab ? '_blank' : '_self',
    rel: newTab ? 'noopener noreferrer' : undefined,
    'data-testid': 'link-block',
  };

  if (style === 'button') {
    return (
      <div className="my-4 sm:my-6 flex justify-center">
        <motion.a
          {...linkProps}
          className="inline-flex items-center gap-2 bg-reinvent-purple hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 no-underline"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          {block.text}
          {newTab && (
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          )}
        </motion.a>
      </div>
    );
  }

  // Text style
  return (
    <div className="my-2 sm:my-3">
      <a
        {...linkProps}
        className="text-reinvent-blue hover:text-reinvent-purple underline-offset-2 hover:underline transition-colors duration-200"
      >
        {block.text}
        {newTab && (
          <ExternalLink className="w-3 h-3 inline ml-1" aria-hidden="true" />
        )}
      </a>
    </div>
  );
};
```

**Design Decisions:**
- Default to opening in new tab (`newTab: true`) for external links
- Add `rel="noopener noreferrer"` for security when opening new tabs
- Button style uses re:Invent purple with hover effects
- Text style uses inline link with underline on hover
- Show external link icon when opening in new tab
- Use Framer Motion for button hover/tap animations
- Maintain accessibility with proper ARIA attributes

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the acceptance criteria analysis, the following correctness properties have been identified:

### Property 1: Progress bar width reflects slide position

*For any* current slide number and total number of slides, the progress bar fill width percentage should equal (current / total) × 100%

**Validates: Requirements 1.5**

### Property 2: Progress bar visibility maintained across slide types

*For any* navigation between Content Slides and Quiz Slides, the progress bar should remain visible throughout the transition

**Validates: Requirements 3.5**

### Property 3: Score display updates with score changes

*For any* score change during gameplay, the displayed current points value should immediately reflect the new score value

**Validates: Requirements 4.3**

### Property 4: Summary percentage calculation accuracy

*For any* final score and maximum possible points (where max > 0), the displayed percentage should equal Math.round((score / maxPoints) × 100)

**Validates: Requirements 5.4**

### Property 5: Audio control state toggle

*For any* initial mute state (true or false), clicking the audio control button should toggle the state to its opposite value

**Validates: Requirements 6.4**

### Property 6: Audio icon synchronization

*For any* audio mute state, the displayed icon should visually represent that state (muted icon when muted, unmuted icon when not muted)

**Validates: Requirements 6.5**

### Property 7: Header responsive layout integrity

*For any* viewport width within the supported range (320px to 2560px), header elements should maintain readability without text truncation or overlap

**Validates: Requirements 7.4**

### Property 8: Header element non-overlap

*For any* header configuration (with or without score, with or without audio controls), elements should not visually overlap each other

**Validates: Requirements 7.5**

### Property 9: Video autoplay behavior

*For any* video block with autoplay set to true, the video should attempt to play automatically when the slide loads (subject to browser autoplay policies)

**Validates: Requirements 10.2**

### Property 10: Video loop behavior

*For any* video block with loop set to true, the video should restart from the beginning when playback completes

**Validates: Requirements 10.3**

### Property 11: Video size consistency

*For any* video block with a specified size property, the rendered video should use the same size classes as image blocks with the same size value

**Validates: Requirements 10.6**

### Property 12: Link new tab behavior

*For any* link block with newTab set to true, the rendered anchor element should have target="_blank" and rel="noopener noreferrer" attributes

**Validates: Requirements 11.4**

### Property 13: Link style consistency

*For any* link block with style property set to "button" or "text", the rendered element should apply the corresponding CSS classes for that style

**Validates: Requirements 11.6, 11.7**

## Error Handling

### Progress Bar Edge Cases

1. **Zero Total Slides**: If `total` is 0, the progress bar should render with 0% width and not throw errors
2. **Invalid Slide Numbers**: If `current` exceeds `total`, the progress bar should cap at 100%
3. **Negative Values**: If `current` or `total` are negative, default to 0

### Score Display Edge Cases

1. **Zero Max Points**: If `totalPossible` is 0, avoid division by zero in percentage calculation
2. **Negative Scores**: Handle negative scores gracefully (though not expected in normal flow)
3. **Score Exceeds Max**: If score somehow exceeds totalPossible, display actual values without capping

### Audio Controls Edge Cases

1. **Audio Context Not Initialized**: If Web Audio API is not available, disable the button gracefully
2. **Rapid Toggling**: Debounce or handle rapid clicks to prevent audio glitches
3. **Browser Autoplay Restrictions**: Handle cases where audio cannot play due to browser policies

### Responsive Layout Edge Cases

1. **Very Small Screens**: On screens < 320px, ensure critical elements remain accessible
2. **Very Large Screens**: On screens > 2560px, prevent excessive spacing
3. **Orientation Changes**: Handle device orientation changes smoothly

## Testing Strategy

### Unit Testing

Unit tests will verify specific component behaviors and edge cases:

1. **ProgressBar Component**:
   - Renders with correct ARIA attributes
   - Handles zero total slides gracefully
   - Caps progress at 100% when current exceeds total
   - Applies correct CSS classes for positioning

2. **Header Component**:
   - Renders logo correctly
   - Conditionally renders score display based on `showScore` prop
   - Conditionally renders audio controls based on `showAudioControls` prop
   - Maintains correct layout structure

3. **ScoreDisplay Component**:
   - Shows only current points when `showMaxPoints={false}`
   - Shows both current and max points when `showMaxPoints={true}`
   - Handles zero totalPossible without errors
   - Animates score changes correctly

4. **AudioControls Component**:
   - Renders correct icon based on mute state
   - Calls toggleMute when clicked
   - Handles keyboard events (Enter and Space)
   - Applies correct styling in inline mode

5. **VideoBlock Component**:
   - Renders video element with correct src
   - Applies correct size classes
   - Shows preview image as poster
   - Handles video load errors gracefully
   - Falls back to preview image on error
   - Respects autoplay and loop properties

6. **LinkBlock Component**:
   - Renders anchor element with correct href
   - Applies button or text styling based on style prop
   - Sets target and rel attributes correctly for new tab
   - Shows external link icon when newTab is true
   - Handles keyboard navigation (Enter key)

7. **Integration Tests**:
   - ContentSlide renders ProgressBar when showProgress is true
   - QuizSlide renders ProgressBar when showProgress is true
   - WelcomeScreen does not render ProgressBar
   - SummaryScreen does not render ProgressBar and shows max points
   - ContentSlide renders VideoBlock correctly
   - ContentSlide renders LinkBlock correctly
   - VideoBlock and LinkBlock integrate with existing content blocks

### Property-Based Testing

Property-based tests will use **fast-check** library to verify universal properties across many inputs. Each test will run a minimum of 100 iterations.

1. **Property 1: Progress bar width calculation**
   - Generate random current (1-100) and total (1-100) values
   - Verify width percentage equals (current/total) * 100
   - **Feature: ui-progress-and-layout-improvements, Property 1: Progress bar width reflects slide position**

2. **Property 3: Score display synchronization**
   - Generate random score values (0-1000)
   - Update score and verify displayed value matches
   - **Feature: ui-progress-and-layout-improvements, Property 3: Score display updates with score changes**

3. **Property 4: Percentage calculation**
   - Generate random score (0-1000) and maxPoints (1-1000) pairs
   - Verify percentage equals Math.round((score/maxPoints) * 100)
   - **Feature: ui-progress-and-layout-improvements, Property 4: Summary percentage calculation accuracy**

4. **Property 5: Audio toggle behavior**
   - Generate random initial mute states (true/false)
   - Verify clicking toggles to opposite state
   - **Feature: ui-progress-and-layout-improvements, Property 5: Audio control state toggle**

5. **Property 6: Audio icon consistency**
   - Generate random mute states (true/false)
   - Verify icon matches state (muted icon when true, unmuted when false)
   - **Feature: ui-progress-and-layout-improvements, Property 6: Audio icon synchronization**

6. **Property 7: Responsive layout**
   - Generate random viewport widths (320-2560)
   - Verify header elements remain readable and non-overlapping
   - **Feature: ui-progress-and-layout-improvements, Property 7: Header responsive layout integrity**

7. **Property 11: Video size consistency**
   - Generate random size values ('small', 'medium', 'large', 'full')
   - Verify video block applies same CSS classes as image block with same size
   - **Feature: ui-progress-and-layout-improvements, Property 11: Video size consistency**

8. **Property 12: Link new tab attributes**
   - Generate random newTab values (true/false)
   - Verify anchor element has correct target and rel attributes
   - **Feature: ui-progress-and-layout-improvements, Property 12: Link new tab behavior**

9. **Property 13: Link style application**
   - Generate random style values ('button', 'text')
   - Verify rendered element has correct CSS classes for the style
   - **Feature: ui-progress-and-layout-improvements, Property 13: Link style consistency**

### Testing Configuration

- **Framework**: Vitest (already configured in the project)
- **Property Testing Library**: fast-check
- **Minimum Iterations**: 100 per property test
- **Component Testing**: @testing-library/react
- **Accessibility Testing**: jest-axe for ARIA compliance

### Test Organization

```
src/
├── components/
│   ├── ProgressBar.tsx
│   ├── ProgressBar.test.tsx              # Unit tests
│   ├── ProgressBar.property.test.tsx     # Property tests
│   ├── VideoBlock.tsx                    # New component
│   ├── VideoBlock.test.tsx               # Unit tests (new)
│   ├── VideoBlock.property.test.tsx      # Property tests (new)
│   ├── LinkBlock.tsx                     # New component
│   ├── LinkBlock.test.tsx                # Unit tests (new)
│   ├── LinkBlock.property.test.tsx       # Property tests (new)
│   ├── Header.tsx
│   ├── Header.test.tsx                   # Unit tests (updated)
│   ├── ScoreDisplay.tsx
│   ├── ScoreDisplay.test.tsx             # Unit tests (updated)
│   ├── ScoreDisplay.property.test.tsx    # Property tests (updated)
│   ├── AudioControls.tsx
│   ├── AudioControls.test.tsx            # Unit tests (updated)
│   ├── AudioControls.property.test.tsx   # Property tests (new)
│   ├── ContentSlide.test.tsx             # Integration tests (updated)
│   ├── QuizSlide.test.tsx                # Integration tests (updated)
│   └── SummaryScreen.test.tsx            # Integration tests (updated)
├── utils/
│   ├── videoLoader.ts                    # New utility (new)
│   ├── videoLoader.test.ts               # Unit tests (new)
├── types/
│   └── quiz.types.ts                     # Updated with VideoBlock and LinkBlock types
```

## Implementation Notes

### CSS Considerations

1. **Z-Index Management**:
   - ProgressBar: z-50 (highest, at very top)
   - Header: z-40 (below progress bar)
   - Other fixed elements: z-30 or lower

2. **Positioning**:
   - ProgressBar: `fixed top-0 left-0 right-0`
   - Header: `fixed top-1 left-0 right-0` (1 unit below progress bar)

3. **Responsive Breakpoints**:
   - Mobile: < 640px (sm)
   - Tablet: 640px - 1024px (sm to lg)
   - Desktop: > 1024px (lg+)

### Animation Considerations

1. **Progress Bar Animation**:
   - Use Framer Motion's `animate` prop
   - Duration: 300ms
   - Easing: easeOut
   - Animate only width property for performance

2. **Score Update Animation**:
   - Maintain existing scale and color animations
   - Duration: 300ms
   - Spring physics for natural feel

### Accessibility Considerations

1. **Progress Bar**:
   - Use `role="progressbar"`
   - Include `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
   - Provide descriptive `aria-label`

2. **Audio Controls**:
   - Use `aria-pressed` to indicate toggle state
   - Provide clear `aria-label` for screen readers
   - Support keyboard navigation (Enter and Space keys)

3. **Score Display**:
   - Use `role="status"` for live score updates
   - Include `aria-live="polite"` for screen reader announcements
   - Provide context in aria-label

### Performance Considerations

1. **Avoid Unnecessary Re-renders**:
   - Memoize ProgressBar component if parent re-renders frequently
   - Use React.memo for AudioControls if needed

2. **Animation Performance**:
   - Use CSS transforms for animations (GPU-accelerated)
   - Avoid animating layout properties (width is acceptable for progress bar)
   - Use `will-change` sparingly

3. **Responsive Images**:
   - Ensure logo images are optimized
   - Use appropriate image sizes for different screen sizes

## Migration Strategy

### Phase 1: Create New Components

1. Create ProgressBar component with tests
2. Add `inline` prop to AudioControls component
3. Add `showMaxPoints` prop to ScoreDisplay component

### Phase 2: Update Existing Components

1. Modify Header component to remove slide counter and integrate audio controls
2. Update ContentSlide to use ProgressBar and new Header
3. Update QuizSlide to use ProgressBar and new Header
4. Update SummaryScreen to ensure max points are displayed

### Phase 3: Remove Old Code

1. Remove fixed AudioControls from App.tsx
2. Remove slide counter props from Header interface
3. Remove slide counter rendering logic from Header component
4. Update all tests to reflect new structure

### Phase 4: Verification

1. Run all unit tests
2. Run all property-based tests
3. Verify Docker build succeeds
4. Manual testing across different screen sizes
5. Accessibility audit with screen readers

## Backward Compatibility

### Breaking Changes

1. **Header Component Props**:
   - Removed: `showProgress`, `currentSlide`, `totalSlides`
   - Added: `showAudioControls`
   - Migration: Remove these props from all Header usages

2. **AudioControls Component**:
   - Changed: No longer uses fixed positioning by default
   - Added: `inline` prop
   - Migration: Pass `inline={true}` when using in Header

3. **ScoreDisplay Component**:
   - Added: `showMaxPoints` prop
   - Migration: Pass `showMaxPoints={false}` during gameplay

### Non-Breaking Changes

1. **ProgressBar Component**: New component, no existing dependencies
2. **App.tsx**: Removal of fixed AudioControls doesn't affect other components

## Future Enhancements

1. **Customizable Progress Bar Colors**: Allow theme customization via props
2. **Progress Bar Animations**: Add milestone celebrations (e.g., at 50%, 100%)
3. **Audio Visualizer**: Show audio waveform or volume indicator
4. **Keyboard Shortcuts**: Add keyboard shortcut to toggle audio (e.g., 'M' key)
5. **Progress Persistence**: Save progress to localStorage for resume functionality
