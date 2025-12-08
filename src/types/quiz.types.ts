// Quiz Data Types

export interface QuizData {
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

export type Slide = ContentSlide | QuizSlide;

export interface ContentSlide {
  type: 'content';
  id: string;
  title: string;
  content: ContentBlock[];
}

export type ContentBlock = 
  | TextBlock 
  | ImageBlock 
  | IconBlock 
  | IconListBlock
  | ListBlock 
  | StatBlock
  | CalloutBlock
  | QuoteBlock
  | GridBlock;

export interface TextBlock {
  type: 'text';
  text: string;
  style?: 'heading' | 'subheading' | 'body' | 'caption';
  emphasis?: 'bold' | 'italic' | 'highlight';
}

export interface ImageBlock {
  type: 'image';
  src: string; // Relative path from data/images/
  alt: string;
  caption?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export interface IconBlock {
  type: 'icon';
  iconType: 'aws' | 'lucide';
  iconName: string; // e.g., 'lambda', 'database', 'check-circle'
  label?: string; // Deprecated: use title instead
  title?: string; // Title displayed centered under the icon
  size?: 'small' | 'medium' | 'large';
}

export interface IconListBlock {
  type: 'iconList';
  icons: Array<{
    iconType: 'aws' | 'lucide';
    iconName: string;
    title?: string;
    size?: 'small' | 'medium' | 'large';
  }>;
  spacing?: 'tight' | 'normal' | 'loose'; // Optional spacing between icons
}

export interface ListBlock {
  type: 'list';
  title?: string; // Optional title displayed above the list
  items: string[];
  ordered?: boolean;
}

export interface StatBlock {
  type: 'stat';
  value: string; // e.g., "10x", "99.99%", "< 1ms"
  label: string;
  color?: 'purple' | 'blue' | 'red' | 'yellow' | 'orange' | 'green';
}

export interface CalloutBlock {
  type: 'callout';
  text: string;
  style: 'info' | 'success' | 'warning';
}

export interface QuoteBlock {
  type: 'quote';
  text: string;
  author: string;
}

export interface GridBlock {
  type: 'grid';
  columns: number; // Number of columns (e.g., 2, 3)
  items: GridItem[];
}

export interface GridItem {
  icon?: string; // Optional icon name (for Lucide icons)
  iconType?: 'aws' | 'lucide'; // Icon type (defaults to 'lucide' if not specified)
  title: string;
  description?: string;
  stats?: string[]; // Array of stat strings
  features?: string[]; // Array of feature strings
  stat?: string; // Single stat value
  color?: string; // Color for the item
}

export interface QuizSlide {
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

export interface QuizChoice {
  text: string;
  icon?: string; // Optional icon name
}

// Resources Configuration

export interface ResourcesConfig {
  images: ImageResource[];
  icons: IconResources;
}

export interface ImageResource {
  id: string;
  filename: string;
  description: string;
}

export interface IconResources {
  aws: string[]; // List of AWS service icon names
  custom: string[]; // List of custom icon names
}

// Quiz Configuration

export interface QuizConfig {
  passingScore: number; // Percentage required to pass (e.g., 70)
  totalPoints: number; // Total possible points across all questions
  showExplanations: boolean; // Whether to show explanations after answers
  allowRetry: boolean; // Whether users can retake the quiz
  shuffleChoices: boolean; // Whether to randomize answer order
  showProgressBar: boolean; // Whether to display progress indicator
}

// Context Types

export interface ScoreContextType {
  score: number;
  totalPossible: number;
  addPoints: (points: number) => void;
  addPossiblePoints: (points: number) => void;
  resetScore: () => void;
  calculateTimeAdjustedPoints: (basePoints: number, elapsedSeconds: number) => number;
}

export interface QuizState {
  currentSlideIndex: number;
  slides: Slide[];
  isComplete: boolean;
  goToNext: () => void;
  restart: () => void;
}
