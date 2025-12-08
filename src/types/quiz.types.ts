// Quiz Data Types

export interface QuizData {
  metadata: {
    title: string;
    description: string;
    version: string;
    totalSlides: number;
  };
  slides: Slide[];
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
  | ListBlock 
  | StatBlock;

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
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export interface ListBlock {
  type: 'list';
  items: string[];
  ordered?: boolean;
}

export interface StatBlock {
  type: 'stat';
  value: string; // e.g., "10x", "99.99%", "< 1ms"
  label: string;
  color?: 'purple' | 'blue' | 'red' | 'yellow';
}

export interface QuizSlide {
  type: 'quiz';
  id: string;
  question: string;
  relatedAnnouncementId?: string; // Reference to previous content slide
  choices: QuizChoice[];
  correctAnswerIndex: number;
  explanation?: string;
  points: number; // Base points (before time adjustment)
  timeLimit?: number; // Optional, defaults to 10 seconds
}

export interface QuizChoice {
  text: string;
  icon?: string; // Optional icon name
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
