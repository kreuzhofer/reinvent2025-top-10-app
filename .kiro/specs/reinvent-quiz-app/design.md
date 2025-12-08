# Design Document

## Overview

The AWS re:Invent 2025 Quiz App is a single-page React application that delivers an interactive, gamified presentation experience. The application loads all content from a JSON data file and manages state entirely in the browser without any backend services. The architecture emphasizes simplicity, maintainability, and engaging user experience through smooth animations and responsive design.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Application                         │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │   Router    │  │  Quiz Engine │  │ Score State │  │  │
│  │  │  (Routes)   │  │  (Logic)     │  │  (Context)  │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────┘  │  │
│  │         │                 │                 │          │  │
│  │  ┌──────▼─────────────────▼─────────────────▼──────┐  │  │
│  │  │           Presentation Components               │  │  │
│  │  │  (Welcome, ContentSlide, QuizSlide, Summary)   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Static Assets                             │  │
│  │  • data/quiz-data.json                                │  │
│  │  • data/images/*.{png,jpg,svg}                        │  │
│  │  • public/reinvent-logo.png                           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **React 18+**: UI framework with functional components and hooks
- **TypeScript**: Type safety and developer experience
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for general UI icons
- **Framer Motion**: Animation library for smooth transitions

## Components and Interfaces

### Core Components

#### 1. App Component
- Root component managing routing and global state
- Provides ScoreContext to all child components
- Handles data loading and error states

#### 2. WelcomeScreen Component
- Displays re:Invent logo and welcome message
- Start button to begin the quiz
- Keyboard shortcut hint (Press Enter)

#### 3. ContentSlide Component
- Renders announcement content from JSON
- Supports text, images, icons, and rich formatting
- Navigation button to proceed
- Props: `slide: ContentSlideData, onNext: () => void`

#### 4. QuizSlide Component
- Displays question and answer choices
- Manages 10-second countdown timer
- Calculates time-adjusted points (10% deduction per second)
- Handles answer selection, skip, and timeout
- Updates score based on time taken
- Props: `slide: QuizSlideData, onNext: () => void, onAnswer: (correct: boolean, points: number) => void, onSkip: () => void`

#### 5. SummaryScreen Component
- Shows final score and statistics
- Displays score as number and percentage
- Restart button to reset quiz
- Props: `score: number, totalPossible: number`

#### 6. ScoreDisplay Component
- Persistent score indicator visible on all slides
- Animated score updates
- Props: `score: number`

#### 7. ProgressIndicator Component
- Shows current slide position (e.g., "5 / 20")
- Visual progress bar
- Props: `current: number, total: number`

#### 8. QuizTimer Component
- Displays countdown timer (10 seconds)
- Visual indicator of time remaining (progress bar or circular timer)
- Shows current point value based on elapsed time
- Props: `basePoints: number, onTimeout: () => void, onTick: (elapsedSeconds: number) => void`

#### 9. CalloutBox Component
- Renders highlighted callout boxes with different styles
- Supports info, success, and warning styles
- Props: `text: string, style: 'info' | 'success' | 'warning'`

#### 10. QuoteBlock Component
- Displays quotes with author attribution
- Styled with quotation marks and emphasis
- Props: `text: string, author: string`

#### 11. GridLayout Component
- Renders items in multi-column grid layout
- Responsive column count
- Props: `columns: number, items: GridItem[]`

#### 12. FunFactDisplay Component
- Shows fun facts after quiz answers
- Visually distinct from main explanation
- Props: `funFact: string`

### Data Models

#### QuizData Interface
```typescript
interface QuizData {
  metadata: {
    title: string;
    description: string;
    version: string;
    totalSlides: number;
    author?: string; // Optional author name
    date?: string; // Optional date
    tags?: string[]; // Optional tags for categorization
  };
  slides: Slide[];
  resources?: ResourcesConfig; // Optional resources configuration
  quizConfig?: QuizConfig; // Optional quiz configuration
}
```

#### ResourcesConfig Interface
```typescript
interface ResourcesConfig {
  images: ImageResource[];
  icons: IconResources;
}

interface ImageResource {
  id: string;
  filename: string;
  description: string;
}

interface IconResources {
  aws: string[]; // List of AWS service icon names
  custom: string[]; // List of custom icon names
}
```

#### QuizConfig Interface
```typescript
interface QuizConfig {
  passingScore: number; // Percentage required to pass (e.g., 70)
  totalPoints: number; // Total possible points across all questions
  showExplanations: boolean; // Whether to show explanations after answers
  allowRetry: boolean; // Whether users can retake the quiz
  shuffleChoices: boolean; // Whether to randomize answer order
  showProgressBar: boolean; // Whether to display progress indicator
}
```

#### Slide Type (Union Type)
```typescript
type Slide = ContentSlide | QuizSlide;
```

#### ContentSlide Interface
```typescript
interface ContentSlide {
  type: 'content';
  id: string;
  title: string;
  content: ContentBlock[];
}
```

#### ContentBlock Type (Union Type)
```typescript
type ContentBlock = 
  | TextBlock 
  | ImageBlock 
  | IconBlock 
  | ListBlock 
  | StatBlock
  | CalloutBlock
  | QuoteBlock
  | GridBlock;
```

#### TextBlock Interface
```typescript
interface TextBlock {
  type: 'text';
  text: string;
  style?: 'heading' | 'subheading' | 'body' | 'caption';
  emphasis?: 'bold' | 'italic' | 'highlight';
}
```

#### ImageBlock Interface
```typescript
interface ImageBlock {
  type: 'image';
  src: string; // Relative path from data/images/
  alt: string;
  caption?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
}
```

#### IconBlock Interface
```typescript
interface IconBlock {
  type: 'icon';
  iconType: 'aws' | 'lucide';
  iconName: string; // e.g., 'lambda', 'database', 'check-circle'
  label?: string;
  size?: 'small' | 'medium' | 'large';
}
```

#### ListBlock Interface
```typescript
interface ListBlock {
  type: 'list';
  title?: string; // Optional title displayed above the list
  items: string[];
  ordered?: boolean;
}
```

#### StatBlock Interface
```typescript
interface StatBlock {
  type: 'stat';
  value: string; // e.g., "10x", "99.99%", "< 1ms"
  label: string;
  color?: 'purple' | 'blue' | 'red' | 'yellow' | 'orange' | 'green';
}
```

#### CalloutBlock Interface
```typescript
interface CalloutBlock {
  type: 'callout';
  text: string;
  style: 'info' | 'success' | 'warning';
}
```

#### QuoteBlock Interface
```typescript
interface QuoteBlock {
  type: 'quote';
  text: string;
  author: string;
}
```

#### GridBlock Interface
```typescript
interface GridBlock {
  type: 'grid';
  columns: number; // Number of columns (e.g., 2, 3)
  items: GridItem[];
}
```

#### GridItem Interface
```typescript
interface GridItem {
  icon?: string; // Optional icon name
  title: string;
  description?: string;
  stats?: string[]; // Array of stat strings
  features?: string[]; // Array of feature strings
  stat?: string; // Single stat value
  color?: string; // Color for the item
}
```

#### QuizSlide Interface
```typescript
interface QuizSlide {
  type: 'quiz';
  id: string;
  question: string;
  relatedAnnouncementId?: string; // Reference to previous content slide
  choices: QuizChoice[];
  correctAnswerIndex: number;
  explanation?: string;
  funFact?: string; // Optional fun fact displayed after explanation
  points: number; // Base points (before time adjustment)
  timeLimit?: number; // Optional, defaults to 10 seconds
}
```

#### QuizChoice Interface
```typescript
interface QuizChoice {
  text: string;
  icon?: string; // Optional icon name
}
```

### State Management

#### ScoreContext
```typescript
interface ScoreContextType {
  score: number;
  totalPossible: number;
  addPoints: (points: number) => void;
  addPossiblePoints: (points: number) => void;
  resetScore: () => void;
  calculateTimeAdjustedPoints: (basePoints: number, elapsedSeconds: number) => number;
}
```

#### Quiz Navigation State
```typescript
interface QuizState {
  currentSlideIndex: number;
  slides: Slide[];
  isComplete: boolean;
  goToNext: () => void;
  restart: () => void;
}
```

## Data Structure and File Organization

### Directory Structure
```
public/
  reinvent-logo.png          # re:Invent logo from official website

src/
  components/
    WelcomeScreen.tsx
    ContentSlide.tsx
    QuizSlide.tsx
    SummaryScreen.tsx
    ScoreDisplay.tsx
    ProgressIndicator.tsx
    QuizTimer.tsx
    CalloutBox.tsx
    QuoteBlock.tsx
    GridLayout.tsx
    FunFactDisplay.tsx
  context/
    ScoreContext.tsx
  hooks/
    useQuizData.ts           # Hook to load and parse JSON
    useKeyboardNav.ts        # Hook for keyboard shortcuts
  types/
    quiz.types.ts            # All TypeScript interfaces
  utils/
    imageLoader.ts           # Image path resolution
    iconMapper.ts            # AWS icon mapping
  data/
    quiz-data.json           # Main quiz content
    images/                  # All images referenced in JSON
      announcement-1.png
      service-diagram.jpg
      ...
  styles/
    theme.ts                 # re:Invent colors and fonts
  App.tsx
  main.tsx

tailwind.config.js           # Tailwind configuration with custom colors
```

### JSON Data File Structure

The `data/quiz-data.json` file will follow this structure:

```json
{
  "metadata": {
    "title": "AWS re:Invent 2025 Quiz",
    "description": "Test your knowledge of AWS re:Invent 2025 announcements",
    "version": "1.0.0",
    "totalSlides": 15,
    "author": "AWS Solutions Architect",
    "date": "December 2025",
    "tags": ["AWS", "re:Invent", "2025"]
  },
  "slides": [
    {
      "type": "content",
      "id": "announcement-1",
      "title": "Amazon S3 Express One Zone",
      "content": [
        {
          "type": "text",
          "text": "Introducing Amazon S3 Express One Zone",
          "style": "heading"
        },
        {
          "type": "icon",
          "iconType": "aws",
          "iconName": "s3",
          "size": "large"
        },
        {
          "type": "text",
          "text": "Single-digit millisecond latency for your most frequently accessed data",
          "style": "body"
        },
        {
          "type": "stat",
          "value": "10x",
          "label": "Faster than S3 Standard",
          "color": "purple"
        },
        {
          "type": "callout",
          "text": "💡 Key Insight: Perfect for high-performance workloads",
          "style": "info"
        },
        {
          "type": "grid",
          "columns": 2,
          "items": [
            {
              "title": "Use Case 1",
              "description": "Real-time analytics"
            },
            {
              "title": "Use Case 2",
              "description": "Machine learning training"
            }
          ]
        },
        {
          "type": "quote",
          "text": "S3 Express One Zone changes the game for latency-sensitive applications",
          "author": "AWS Storage Team"
        },
        {
          "type": "image",
          "src": "s3-express-diagram.png",
          "alt": "S3 Express One Zone architecture",
          "size": "large"
        }
      ]
    },
    {
      "type": "quiz",
      "id": "quiz-1",
      "question": "What is the performance improvement of S3 Express One Zone compared to S3 Standard?",
      "relatedAnnouncementId": "announcement-1",
      "choices": [
        { "text": "2x faster" },
        { "text": "5x faster" },
        { "text": "10x faster" },
        { "text": "20x faster" }
      ],
      "correctAnswerIndex": 2,
      "explanation": "S3 Express One Zone delivers up to 10x better performance than S3 Standard.",
      "funFact": "S3 Express One Zone uses a new bucket type optimized for single-digit millisecond latency!",
      "points": 100,
      "timeLimit": 10
    }
  ],
  "resources": {
    "images": [
      {
        "id": "s3-express-diagram",
        "filename": "s3-express-diagram.png",
        "description": "S3 Express One Zone architecture diagram"
      }
    ],
    "icons": {
      "aws": ["s3", "lambda", "ec2", "dynamodb"],
      "custom": ["aws-logo", "chip", "factory"]
    }
  },
  "quizConfig": {
    "passingScore": 70,
    "totalPoints": 1000,
    "showExplanations": true,
    "allowRetry": true,
    "shuffleChoices": true,
    "showProgressBar": true
  }
}
```

### Image and Icon Guidelines

#### Images
- **Location**: Place all images in `src/data/images/`
- **Formats**: PNG, JPG, or SVG
- **Naming**: Use kebab-case (e.g., `s3-express-diagram.png`)
- **Reference in JSON**: Use filename only (e.g., `"src": "s3-express-diagram.png"`)
- **Recommended sizes**: 
  - Small: 200-400px width
  - Medium: 400-800px width
  - Large: 800-1200px width
  - Full: 1200px+ width

#### Icons
Two icon sources are supported:

1. **AWS Service Icons**
   - Use `"iconType": "aws"`
   - Icon names: `s3`, `lambda`, `ec2`, `dynamodb`, `rds`, etc.
   - The app will map these to official AWS service icons
   - If you need specific AWS icons, provide them as SVG files in `src/data/images/aws-icons/`

2. **Lucide Icons** (General UI icons)
   - Use `"iconType": "lucide"`
   - Icon names from Lucide library: `check-circle`, `x-circle`, `star`, `trophy`, etc.
   - Full list: https://lucide.dev/icons/

## re:Invent Branding

### Color Palette

Based on the re:Invent website, the color scheme is:

```typescript
// theme.ts
export const colors = {
  // Base colors
  background: '#000000',      // Black background
  text: '#FFFFFF',            // White text
  
  // Accent colors (from re:Invent palette)
  purple: '#8B5CF6',          // Primary accent
  blue: '#3B82F6',            // Secondary accent
  red: '#EF4444',             // Tertiary accent
  yellow: '#F59E0B',          // Quaternary accent
  
  // UI colors
  correct: '#10B981',         // Green for correct answers
  incorrect: '#EF4444',       // Red for incorrect answers
  hover: '#1F1F1F',           // Subtle hover state
  border: '#333333',          // Border color
};
```

### Typography

```typescript
// theme.ts
export const fonts = {
  heading: '"Amazon Ember", "Helvetica Neue", Arial, sans-serif',
  body: '"Amazon Ember", "Helvetica Neue", Arial, sans-serif',
};
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'reinvent-purple': '#8B5CF6',
        'reinvent-blue': '#3B82F6',
        'reinvent-red': '#EF4444',
        'reinvent-yellow': '#F59E0B',
      },
      fontFamily: {
        'amazon': ['"Amazon Ember"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
};
```

### Logo Usage
- **Source**: https://reinvent.awsevents.com/content/dam/reinvent/2022/media/logo/reinvent-white.png
- **Placement**: Top center on welcome screen, smaller version in header during quiz
- **Size**: 200-300px width on welcome, 100-150px in header

## Error Handling

### Data Loading Errors
- **Missing JSON file**: Display error screen with message "Quiz data not found. Please ensure quiz-data.json exists in the data directory."
- **Invalid JSON**: Display error with validation details
- **Network errors**: Retry mechanism with user feedback

### Image Loading Errors
- **Missing images**: Display placeholder with alt text
- **Failed loads**: Log warning, continue presentation
- **Invalid paths**: Fallback to default placeholder

### Runtime Errors
- **Invalid slide data**: Skip slide and log error
- **State corruption**: Provide reset button
- **Unexpected errors**: Error boundary with friendly message and restart option

## Testing Strategy

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Correctness Properties

The following properties define the core correctness guarantees of the Quiz App. Each property is universally quantified and should hold across all valid inputs and states.

**Additional Prework for Timer Requirements:**

11.1 WHEN a Quiz Slide is displayed THEN the system SHALL start a 10-second countdown timer
Thoughts: This is about timer initialization. For any quiz slide, a timer should start. This is a property.
Testable: yes - property

11.2 WHILE the timer is running THEN the system SHALL display the remaining time prominently
Thoughts: This is about UI display during timer countdown. For any active timer, the time should be visible. This is a property.
Testable: yes - property

11.3 WHEN each second elapses THEN the system SHALL reduce the available points by 10 percent of the base point value
Thoughts: This is about point calculation over time. For any base point value and elapsed time, the calculation should follow the formula. This is a property about arithmetic correctness.
Testable: yes - property

11.4 WHEN the timer reaches zero THEN the system SHALL highlight the correct answer and award zero points
Thoughts: This is about timeout behavior. When timer expires, specific actions should occur. This is a property.
Testable: yes - property

11.5 WHEN a user answers before the timer expires THEN the system SHALL award points equal to the base value minus 10 percent per elapsed second
Thoughts: This is the core time-adjusted scoring formula. For any answer time and base points, the awarded points should match the formula. This is a property about arithmetic correctness.
Testable: yes - property

11.6 WHEN a user skips a question THEN the system SHALL award zero points and proceed to the next slide
Thoughts: This is about skip behavior. Skipping should not award points and should advance. This is a property.
Testable: yes - property

2.6 WHEN a Quiz Slide is displayed THEN the system SHALL provide a skip button to proceed without answering
Thoughts: This is about UI presence. For any quiz slide, a skip button should be present. This is a property.
Testable: yes - property

13.1 WHEN a callout block is specified in the Data File THEN the system SHALL render a highlighted box with the specified style
Thoughts: This is about rendering any callout block. For any callout with a style, it should render as a highlighted box. This is a property.
Testable: yes - property

13.2 WHEN a quote block is specified in the Data File THEN the system SHALL render the quote text with author attribution
Thoughts: This is about rendering any quote block. For any quote, it should display text and author. This is a property.
Testable: yes - property

13.3 WHEN a grid block is specified in the Data File THEN the system SHALL render items in a multi-column layout with the specified number of columns
Thoughts: This is about layout. For any grid with N columns, items should be arranged in N columns. This is a property.
Testable: yes - property

13.4 WHEN a list block includes a title field THEN the system SHALL render the title above the list items
Thoughts: This is about conditional rendering. For any list with a title, the title should appear above items. This is a property.
Testable: yes - property

13.5 WHERE grid items include icons THEN the system SHALL render the icons alongside the item content
Thoughts: This is about conditional rendering within grids. For any grid item with an icon, the icon should be visible. This is a property.
Testable: yes - property

14.1 WHEN a quiz slide includes a funFact field THEN the system SHALL display the fun fact after showing the answer explanation
Thoughts: This is about conditional display. For any quiz with a funFact, it should appear after the explanation. This is a property.
Testable: yes - property

14.2 WHEN displaying fun facts THEN the system SHALL visually distinguish them from the main explanation
Thoughts: This is about visual styling. For any fun fact, it should be visually distinct. This is a property about UI rendering.
Testable: yes - property

14.3 WHEN a quiz slide does not include a funFact field THEN the system SHALL display only the explanation without errors
Thoughts: This is about handling missing optional fields. For any quiz without funFact, it should work normally. This is a property.
Testable: yes - property

15.1 WHEN the Data File includes a quizConfig section THEN the system SHALL apply the configuration settings to the quiz
Thoughts: This is about configuration loading. For any valid quizConfig, settings should be applied. This is a property.
Testable: yes - property

15.2 WHERE shuffleChoices is enabled in quizConfig THEN the system SHALL randomize the order of answer choices for each quiz question
Thoughts: This is about answer randomization. For any quiz with shuffle enabled, choices should be in random order. This is a property.
Testable: yes - property

15.3 WHERE showProgressBar is enabled in quizConfig THEN the system SHALL display a visual progress indicator throughout the quiz
Thoughts: This is about conditional UI display. For any quiz with progress bar enabled, it should be visible. This is a property.
Testable: yes - property

15.4 WHERE allowRetry is enabled in quizConfig THEN the system SHALL provide an option to retake the quiz after completion
Thoughts: This is about conditional functionality. For any quiz with retry enabled, a retry option should appear. This is a property.
Testable: yes - property

15.5 WHEN quizConfig is not specified THEN the system SHALL use default configuration values
Thoughts: This is about default behavior. For any quiz without config, defaults should apply. This is a property.
Testable: yes - property

#### Property 1: Sequential slide progression
*For any* valid quiz data with N slides, starting the presentation and advancing N times should display each slide exactly once in the order specified in the data file.
**Validates: Requirements 1.2**

#### Property 2: Content block rendering completeness
*For any* content slide with a set of content blocks, the rendered output should contain elements corresponding to each content block specified in the slide data.
**Validates: Requirements 1.3**

#### Property 3: Score accumulation correctness
*For any* sequence of quiz answers with their respective answer times, the final score should equal the sum of time-adjusted points from all correctly answered questions.
**Validates: Requirements 2.3, 11.5**

#### Property 4: Incorrect answer score invariance
*For any* quiz slide, selecting an incorrect answer should not change the current score.
**Validates: Requirements 2.4**

#### Property 5: Quiz feedback presence
*For any* quiz slide and any answer selection, the system should display feedback indicating whether the answer was correct or incorrect.
**Validates: Requirements 2.2**

#### Property 6: Score visibility persistence
*For any* slide during an active quiz session (excluding the welcome screen), the current score should be visible in the UI.
**Validates: Requirements 3.1**

#### Property 7: Restart state reset
*For any* quiz state with non-zero score and non-zero slide index, restarting the quiz should reset both score to zero and slide index to the beginning.
**Validates: Requirements 3.5**

#### Property 8: JSON schema validation
*For any* JSON input, the validation function should accept valid quiz data conforming to the schema and reject invalid data with appropriate error messages.
**Validates: Requirements 4.2**

#### Property 9: Image path resolution
*For any* image block with a filename, the resolved path should point to the data/images directory with the correct filename.
**Validates: Requirements 4.4, 5.1**

#### Property 10: Icon rendering mapping
*For any* valid icon identifier (AWS or Lucide), the system should render the corresponding icon component without errors.
**Validates: Requirements 4.5, 5.2, 5.3**

#### Property 11: Keyboard navigation advancement
*For any* slide (content or quiz), pressing the right arrow key should advance to the next slide when navigation is enabled.
**Validates: Requirements 10.1**

#### Property 12: Quiz keyboard answer selection
*For any* quiz slide with N choices, pressing number keys 1 through N should select the corresponding answer choice.
**Validates: Requirements 10.2**

#### Property 13: Timer initialization
*For any* quiz slide, displaying the slide should start a countdown timer from the specified time limit (default 10 seconds).
**Validates: Requirements 11.1**

#### Property 14: Time-adjusted point calculation
*For any* base point value and elapsed seconds (0-10), the available points should equal the base value minus 10% per elapsed second, with a minimum of zero.
**Validates: Requirements 11.3, 11.5**

#### Property 15: Timer expiration behavior
*For any* quiz slide, when the timer reaches zero without user input, the system should highlight the correct answer and award zero points.
**Validates: Requirements 11.4**

#### Property 16: Skip button presence
*For any* quiz slide, a skip button should be present and functional in the UI.
**Validates: Requirements 2.6**

#### Property 17: Skip action scoring
*For any* quiz slide, activating the skip button should award zero points and advance to the next slide.
**Validates: Requirements 11.6**

#### Property 18: Callout block rendering
*For any* content slide containing a callout block, the rendered output should display a visually distinct highlighted box with the specified style.
**Validates: Requirements 13.1**

#### Property 19: Quote block rendering
*For any* content slide containing a quote block, the rendered output should display the quote text with author attribution.
**Validates: Requirements 13.2**

#### Property 20: Grid layout rendering
*For any* content slide containing a grid block with N columns, the rendered output should display items in an N-column layout.
**Validates: Requirements 13.3**

#### Property 21: List title rendering
*For any* list block with a title field, the rendered output should display the title above the list items.
**Validates: Requirements 13.4**

#### Property 22: Fun fact display
*For any* quiz slide with a funFact field, after answering the question, the system should display both the explanation and the fun fact.
**Validates: Requirements 14.1**

#### Property 23: Quiz choice shuffling
*For any* quiz with shuffleChoices enabled in quizConfig, the order of answer choices should be randomized while maintaining correctness validation.
**Validates: Requirements 15.2**

### Unit Testing Strategy

Unit tests will cover specific examples and edge cases:

**Component Tests:**
- WelcomeScreen renders with logo and start button (Requirements 1.1, 6.3)
- SummaryScreen displays score as number and percentage (Requirements 3.2, 3.3)
- SummaryScreen provides restart button (Requirements 3.4)
- Error screen displays when JSON is missing (Requirements 4.3)
- Image placeholder displays when image fails to load (Requirements 5.4)
- Welcome screen responds to Enter key (Requirements 10.3)
- Help overlay shows keyboard shortcuts (Requirements 10.4)
- QuizTimer displays remaining time (Requirements 11.2)
- QuizSlide renders skip button (Requirements 2.6)
- CalloutBlock renders with correct style class (Requirements 13.1)
- QuoteBlock displays quote and author (Requirements 13.2)
- GridBlock renders with specified column count (Requirements 13.3)
- ListBlock with title displays title above items (Requirements 13.4)
- QuizSlide displays fun fact when present (Requirements 14.1)
- QuizSlide works without fun fact (Requirements 14.3)
- Answer choices are shuffled when config enabled (Requirements 15.2)
- Progress bar displays when config enabled (Requirements 15.3)

**Data Loading Tests:**
- Quiz data loads successfully from JSON file (Requirements 4.1)
- Navigation controls are present on content slides (Requirements 1.4)
- Next button appears after answering quiz question (Requirements 2.5)
- Quiz slide renders question and all choices (Requirements 2.1)

**Edge Cases:**
- Empty quiz data
- Single slide quiz
- Quiz with no questions (only content)
- Missing image files
- Invalid icon names
- Rapid navigation (animation stacking prevention - Requirements 8.5)

### Property-Based Testing Strategy

Property-based tests will verify universal properties using **fast-check** library for TypeScript:

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with format: `**Feature: reinvent-quiz-app, Property {number}: {property_text}**`
- Custom generators for quiz data structures

**Test Generators:**
- `arbitraryQuizData()`: Generates valid quiz data with random slides and optional quizConfig
- `arbitraryContentSlide()`: Generates content slides with various content blocks including callouts, quotes, and grids
- `arbitraryQuizSlide()`: Generates quiz slides with random questions, choices, and optional funFacts
- `arbitraryAnswerSequence()`: Generates sequences of answer selections
- `arbitraryCalloutBlock()`: Generates callout blocks with random styles
- `arbitraryQuoteBlock()`: Generates quote blocks with random text and authors
- `arbitraryGridBlock()`: Generates grid blocks with random column counts and items
- `arbitraryQuizConfig()`: Generates quiz configuration with random settings

**Property Test Coverage:**
- All 23 correctness properties listed above
- Each property implemented as a single property-based test
- Tests validate behavior across randomly generated valid inputs
- Timer-based scoring properties test various elapsed times (0-10 seconds)
- Content block rendering properties test all block types (text, image, icon, list, stat, callout, quote, grid)
- Quiz configuration properties test various config combinations

### Integration Testing

Integration tests will verify:
- Complete quiz flow from welcome to summary
- Score persistence across slide navigation
- Keyboard and mouse navigation working together
- Responsive layout at different viewport sizes (Requirements 7.1-7.5)
- Animation timing and smoothness (Requirements 8.1-8.4)
- Brand styling application (Requirements 6.1, 6.2, 6.4, 6.5)

### Testing Tools

- **Vitest**: Unit and property-based test runner
- **React Testing Library**: Component testing
- **fast-check**: Property-based testing library
- **@testing-library/user-event**: User interaction simulation

## Performance Considerations

### Data Loading
- Quiz data loaded once on app initialization
- Images lazy-loaded as slides are displayed
- Preload next slide's images during current slide display

### Rendering Optimization
- React.memo for slide components to prevent unnecessary re-renders
- Virtual scrolling not needed (single slide displayed at a time)
- Debounce keyboard events to prevent rapid navigation issues

### Animation Performance
- Use CSS transforms for slide transitions (GPU-accelerated)
- Framer Motion with reduced motion support
- Animation duration: 300-500ms for optimal UX

## Accessibility

### Keyboard Navigation
- Full keyboard support as specified in Requirements 10
- Focus management for interactive elements
- Escape key to show/hide help overlay

### Screen Readers
- Semantic HTML elements
- ARIA labels for interactive components
- Alt text for all images
- Announcement of score changes

### Visual Accessibility
- High contrast (white on black)
- Minimum font size: 16px
- Focus indicators with 3:1 contrast ratio
- Reduced motion support for animations

## Deployment

### Build Process
- `npm run build` creates optimized production bundle
- Static assets bundled with Vite
- Output in `dist/` directory

### Docker Deployment

The application is deployed using Docker Compose with the following architecture:

```
┌─────────────────────────────────────────┐
│         Docker Host (Web Server)        │
│  ┌───────────────────────────────────┐  │
│  │     Nginx Container (Port 80)     │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   Static Files (dist/)      │  │  │
│  │  │   - index.html              │  │  │
│  │  │   - JS bundles              │  │  │
│  │  │   - CSS                     │  │  │
│  │  │   - Images & Assets         │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

#### Docker Configuration

**Multi-stage Dockerfile:**
1. **Build stage**: Node.js container to build the Vite application
2. **Production stage**: Nginx container to serve static files

**Docker Compose:**
- Single service for the frontend application
- Port mapping: 80:80 (host:container)
- Volume mounts for development (optional)
- Restart policy: always

**Nginx Configuration:**
- Serve static files from `/usr/share/nginx/html`
- SPA routing: fallback to `index.html` for client-side routes
- Gzip compression enabled
- Cache headers for static assets

#### Deployment Workflow

1. **Build**: `docker compose build`
2. **Start**: `docker compose up -d`
3. **Update**: After code changes, rebuild with `docker compose up -d --build`
4. **Logs**: `docker compose logs -f`
5. **Stop**: `docker compose down`

#### Container Rebuild Requirement

**CRITICAL**: After making code changes, the Docker container MUST be rebuilt to pick up changes:
```bash
docker compose up -d --build
```

Simply restarting the container will NOT pick up code changes because the container uses a compiled version from the build step.

### Hosting
- Docker-based deployment on any web server
- Alternative: Static site hosting (Netlify, Vercel, S3 + CloudFront)
- No server-side requirements
- All data bundled with application

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ JavaScript features
- No IE11 support needed

## Future Enhancements

Potential features for future iterations:
- Timer for quiz questions (countdown mode)
- Leaderboard with local storage
- Share score on social media
- Multiple quiz sets (different re:Invent years)
- Dark/light theme toggle
- Audio feedback for correct/incorrect answers
- Confetti animation for high scores
- Export results as PDF
