# Design Document: Kiro Branding Control

## Overview

The Kiro Branding Control is a reusable React component that displays "Made with Kiro" attribution with the Kiro logo. The component will be integrated into multiple screens (Welcome, Content/Quiz slides, and Summary) with consistent styling that matches the existing audio controls design. The control acts as a clickable link that opens https://kiro.dev in a new tab, providing brand visibility while maintaining the application's visual coherence.

## Architecture

### Component Structure

```
KiroBranding (New Component)
├── Renders as clickable link/button
├── Contains three inline elements:
│   ├── "Made with" text
│   ├── Kiro logo SVG
│   └── "Kiro" text
└── Styled with rounded border matching AudioControls

Integration Points:
├── WelcomeScreen (below "Press enter to start")
├── Header (top right, above score/audio controls)
└── SummaryScreen (via Header component)
```

### Component Hierarchy

The component will be integrated into the existing component tree as follows:

**Welcome Screen:**
```
WelcomeScreen
└── KiroBranding (positioned below start prompt)
```

**Content/Quiz Slides:**
```
Header
├── Logo section (left)
└── Right section
    ├── KiroBranding (new, top position)
    ├── ScoreDisplay (middle position)
    └── AudioControls (bottom position)
```

**Summary Screen:**
```
SummaryScreen
└── Header
    ├── Logo section (left)
    └── Right section
        ├── KiroBranding (new, top position)
        └── AudioControls (bottom position)
```

## Components and Interfaces

### KiroBranding Component

**File:** `src/components/KiroBranding.tsx`

**Props Interface:**
```typescript
interface KiroBrandingProps {
  variant?: 'welcome' | 'header';  // Controls sizing and spacing
  className?: string;               // Optional additional classes
}
```

**Component Signature:**
```typescript
export const KiroBranding: React.FC<KiroBrandingProps> = ({ 
  variant = 'header',
  className = ''
}) => { ... }
```

### Styling Approach

The component will use Tailwind CSS utility classes consistent with the existing design system:

**Border and Background:**
- Border: `border border-gray-700` (matches AudioControls)
- Border radius: `rounded-lg` (matches AudioControls)
- Background: `bg-gray-800` with `hover:bg-gray-700` (matches AudioControls)
- Padding: `p-2` for header variant, `p-3` for welcome variant

**Typography:**
- Font: Inherits from body font (Amazon Ember)
- Color: `text-white` for main text, `text-gray-300` for subtle variation
- Size: `text-sm` for header variant, `text-base` for welcome variant

**Logo:**
- Height: `h-5` for header variant, `h-6` for welcome variant
- Width: `w-auto` to maintain aspect ratio
- Margin: `mx-1.5` for spacing between text elements

**Layout:**
- Display: `flex items-center gap-1.5`
- Transition: `transition-colors duration-200` for hover effect

### Header Component Updates

**File:** `src/components/Header.tsx`

The Header component will be updated to include the KiroBranding component in the right section, positioned above the existing score and audio controls.

**Updated Layout Structure:**
```typescript
<header>
  <div className="flex items-center justify-between">
    {/* Left: Logo */}
    <div>...</div>
    
    {/* Right: Vertical stack */}
    <div className="flex flex-col items-end gap-2">
      <KiroBranding variant="header" />
      <div className="flex items-center gap-4">
        {showScore && <ScoreDisplay />}
        {showAudioControls && <AudioControls />}
      </div>
    </div>
  </div>
</header>
```

### WelcomeScreen Component Updates

**File:** `src/components/WelcomeScreen.tsx`

The WelcomeScreen will include the KiroBranding component below the "Press Enter to start" text.

**Updated Structure:**
```typescript
<motion.div className="text-center">
  {/* Existing content: logo, title, button */}
  
  {/* Keyboard hint */}
  <motion.p>Press Enter to start</motion.p>
  
  {/* New: Kiro Branding */}
  <motion.div className="mt-6">
    <KiroBranding variant="welcome" />
  </motion.div>
</motion.div>
```

## Data Models

### Logo Asset

**File Path:** `public/data/icons/aws/kiro.svg`

The SVG will be loaded as an image element with the following attributes:
- `src`: `/data/icons/aws/kiro.svg`
- `alt`: `Kiro logo`
- `className`: Responsive height classes based on variant
- `loading`: `lazy` for performance

### Link Configuration

**URL:** `https://kiro.dev`
**Target:** `_blank` (new tab)
**Security:** `rel="noopener noreferrer"`

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Component structure is consistent

*For any* variant of the KiroBranding component, the rendered output should contain exactly three elements in order: "Made with" text, Kiro logo image, and "Kiro" text.

**Validates: Requirements 1.2**

### Property 2: Logo source path is correct

*For any* rendered KiroBranding component, the logo image src attribute should be set to "/data/icons/aws/kiro.svg".

**Validates: Requirements 1.3**

### Property 3: Border styling matches audio controls

*For any* rendered KiroBranding component, the border radius and border color classes should match those applied to the AudioControls component.

**Validates: Requirements 1.5, 5.1, 5.2**

### Property 4: Component does not overlap other elements

*For any* screen size and header configuration, the KiroBranding component should not overlap with other UI elements (score display, audio controls, or content).

**Validates: Requirements 2.5**

### Property 5: Positioning is consistent across screens

*For any* screen that includes a header (Content Slide, Quiz Slide, Summary Screen), the KiroBranding component should be positioned in the same location within the header structure.

**Validates: Requirements 3.3**

### Property 6: Link behavior is correct

*For any* rendered KiroBranding component, it should be rendered as a clickable element with href="https://kiro.dev", target="_blank", and rel="noopener noreferrer".

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 7: Hover state provides visual feedback

*For any* rendered KiroBranding component, hover classes should be applied to provide visual feedback indicating the element is clickable.

**Validates: Requirements 4.4**

### Property 8: Clicking does not interrupt quiz state

*For any* quiz state (current slide index, score value, timer state), clicking the KiroBranding component should not modify any quiz state values.

**Validates: Requirements 4.5**

### Property 9: Typography is consistent

*For any* rendered KiroBranding component, the text styling (font family, color) should be consistent with other UI elements in the application.

**Validates: Requirements 5.3**

### Property 10: Logo is sized proportionally

*For any* variant of the KiroBranding component, the logo height should be proportional to the text size for that variant.

**Validates: Requirements 5.4**

### Property 11: Padding matches button controls

*For any* rendered KiroBranding component, the padding classes should be consistent with other button-like controls (AudioControls).

**Validates: Requirements 5.5**

### Property 12: Variant prop affects rendering

*For any* variant value ('welcome' or 'header'), the component should render with different sizing and spacing classes appropriate to that variant.

**Validates: Requirements 6.2**

### Property 13: Logo is positioned between text

*For any* rendered KiroBranding component, the logo element should appear in the DOM between the "Made with" text element and the "Kiro" text element.

**Validates: Requirements 7.1**

### Property 14: Logo maintains aspect ratio

*For any* rendered KiroBranding component, the logo image should have width set to "auto" to maintain aspect ratio when height is constrained.

**Validates: Requirements 7.2**

### Property 15: Logo is vertically centered

*For any* rendered KiroBranding component, the container should use flex alignment to vertically center the logo with the surrounding text.

**Validates: Requirements 7.4**

### Property 16: Logo error handling preserves layout

*For any* logo load error, the component should hide the logo image without breaking the layout or causing layout shift.

**Validates: Requirements 7.5**

### Property 17: Component is responsive

*For any* viewport width (mobile, tablet, desktop), the KiroBranding component should apply appropriate responsive classes for text size, logo size, and padding.

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 18: No overlap on small screens

*For any* mobile viewport width (< 768px), the KiroBranding component should not overlap with other critical UI elements in the header.

**Validates: Requirements 8.5**

## Error Handling

### Logo Loading Failure

**Scenario:** The kiro.svg file fails to load or is missing.

**Handling:**
- Display text-only version: "Made with Kiro"
- Use `onError` handler on the `<img>` element
- Set a fallback state that hides the image element
- Maintain layout integrity without the logo

**Implementation:**
```typescript
const [logoError, setLogoError] = useState(false);

<img 
  src="/data/icons/aws/kiro.svg"
  alt="Kiro logo"
  onError={() => setLogoError(true)}
  className={logoError ? 'hidden' : 'h-5 w-auto'}
/>
```

### Link Navigation Failure

**Scenario:** Browser blocks popup or new tab opening.

**Handling:**
- Use standard `<a>` element with `href` attribute as fallback
- Browser will handle popup blocking with native UI
- No custom error handling needed (browser responsibility)

### Responsive Layout Issues

**Scenario:** Component overlaps with other elements on small screens.

**Handling:**
- Use responsive Tailwind classes: `text-xs sm:text-sm`
- Adjust logo size: `h-4 sm:h-5`
- Reduce padding on mobile: `p-1.5 sm:p-2`
- Test on breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)

## Testing Strategy

### Unit Tests

**File:** `src/components/KiroBranding.test.tsx`

**Test Cases:**
1. **Rendering:** Component renders with correct text and logo
2. **Link attributes:** Verify href, target, and rel attributes
3. **Variants:** Test both 'welcome' and 'header' variants apply correct classes
4. **Logo error handling:** Verify fallback behavior when logo fails to load
5. **Accessibility:** Verify ARIA attributes and keyboard navigation
6. **Click handler:** Verify link is clickable (no preventDefault)

**Example Test:**
```typescript
describe('KiroBranding', () => {
  it('should render with correct link attributes', () => {
    render(<KiroBranding />);
    const link = screen.getByRole('link', { name: /made with kiro/i });
    expect(link).toHaveAttribute('href', 'https://kiro.dev');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should display logo between text elements', () => {
    render(<KiroBranding />);
    const logo = screen.getByAltText('Kiro logo');
    expect(logo).toBeInTheDocument();
  });

  it('should handle logo loading error gracefully', () => {
    render(<KiroBranding />);
    const logo = screen.getByAltText('Kiro logo');
    fireEvent.error(logo);
    expect(logo).toHaveClass('hidden');
  });
});
```

### Property-Based Tests

**File:** `src/components/KiroBranding.property.test.tsx`

**Property Tests:**

1. **Property 1: Link security attributes**
   - Generate random variant values
   - Verify all rendered instances have correct security attributes
   - Validates: Requirements 4.2, 4.3

2. **Property 2: Logo positioning**
   - Generate random variant values
   - Verify logo is always between text elements in DOM order
   - Validates: Requirements 7.1

3. **Property 3: Styling consistency**
   - Generate random variant values
   - Verify border and background classes match AudioControls pattern
   - Validates: Requirements 5.1, 5.2

**Example Property Test:**
```typescript
import fc from 'fast-check';

describe('KiroBranding Property Tests', () => {
  it('Property 1: should always have security attributes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcome', 'header'),
        (variant) => {
          const { container } = render(<KiroBranding variant={variant} />);
          const link = container.querySelector('a');
          
          expect(link?.getAttribute('target')).toBe('_blank');
          expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
          expect(link?.getAttribute('href')).toBe('https://kiro.dev');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Tests

**File:** `src/components/Header.test.tsx` (update existing)

**Test Cases:**
1. Verify KiroBranding appears in Header when rendered
2. Verify correct positioning relative to score and audio controls
3. Verify no overlap with other header elements

**File:** `src/components/WelcomeScreen.test.tsx` (update existing)

**Test Cases:**
1. Verify KiroBranding appears below "Press Enter to start" text
2. Verify correct spacing and centering

**File:** `src/components/SummaryScreen.test.tsx` (update existing)

**Test Cases:**
1. Verify KiroBranding appears in header via Header component
2. Verify positioning above audio controls

### Visual Regression Tests

**Manual Testing Checklist:**
1. Welcome screen: Verify centered positioning below start prompt
2. Content slides: Verify top-right header positioning
3. Quiz slides: Verify top-right header positioning
4. Summary screen: Verify top-right header positioning
5. Hover state: Verify background color change
6. Click behavior: Verify new tab opens with correct URL
7. Responsive: Test on mobile (320px), tablet (768px), desktop (1024px)
8. Logo loading: Test with and without kiro.svg file

## Implementation Notes

### Accessibility

- Use semantic `<a>` element for proper link semantics
- Include descriptive text for screen readers
- Ensure sufficient color contrast (white text on gray-800 background)
- Support keyboard navigation (Tab to focus, Enter to activate)
- Add `aria-label` if needed: "Visit Kiro website"

### Performance

- Use `loading="lazy"` for logo image
- SVG is small (~2KB), minimal impact
- No JavaScript required for link functionality
- CSS transitions are GPU-accelerated

### Browser Compatibility

- Standard HTML `<a>` element with `target="_blank"` is universally supported
- Tailwind CSS classes are compatible with all modern browsers
- SVG support is universal in modern browsers
- Fallback for logo loading error ensures graceful degradation

### Responsive Design

**Breakpoint Behavior:**

**Mobile (< 768px):**
- Header variant: `text-xs`, `h-4` logo, `p-1.5` padding
- Welcome variant: `text-sm`, `h-5` logo, `p-2` padding

**Tablet (768px - 1024px):**
- Header variant: `text-sm`, `h-5` logo, `p-2` padding
- Welcome variant: `text-base`, `h-6` logo, `p-3` padding

**Desktop (> 1024px):**
- Same as tablet (optimal size achieved)

### Animation

The component will use Framer Motion for entrance animations on the Welcome Screen to match existing animation patterns:

```typescript
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: 0.5, ease: 'easeOut' }}
>
  <KiroBranding variant="welcome" />
</motion.div>
```

No animation needed for header variant (static positioning).

## Dependencies

### Existing Dependencies (No New Additions)
- React 18.x
- TypeScript 5.x
- Tailwind CSS 3.x
- Framer Motion 11.x (for Welcome Screen animation)

### Assets Required
- `public/data/icons/aws/kiro.svg` (already exists per requirements)

## Future Enhancements

### Potential Improvements (Out of Scope)
1. Add tooltip on hover with additional information
2. Track analytics when link is clicked
3. Support custom link URLs via props
4. Add animation on click (scale effect)
5. Support dark/light theme variants
6. Add keyboard shortcut (e.g., Ctrl+K) to open Kiro website
