import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { QuizConfig } from '../types/quiz.types';

/**
 * Default quiz configuration values
 * Requirements: 15.5 - Apply default configuration when quizConfig is not specified
 */
const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  passingScore: 70,
  totalPoints: 1000,
  showExplanations: true,
  allowRetry: true,
  shuffleChoices: false,
  showProgressBar: true,
};

interface QuizConfigContextType {
  config: QuizConfig;
}

const QuizConfigContext = createContext<QuizConfigContextType | undefined>(undefined);

interface QuizConfigProviderProps {
  children: ReactNode;
  config?: QuizConfig;
}

/**
 * QuizConfigProvider Component
 * 
 * Provides quiz configuration to all child components.
 * Uses default values if no configuration is provided.
 * 
 * Requirements:
 * - 15.1: Load quizConfig from quiz data file
 * - 15.5: Apply default configuration when quizConfig is not specified
 */
export const QuizConfigProvider: React.FC<QuizConfigProviderProps> = ({ 
  children, 
  config 
}) => {
  // Merge provided config with defaults
  const mergedConfig: QuizConfig = {
    ...DEFAULT_QUIZ_CONFIG,
    ...config,
  };

  return (
    <QuizConfigContext.Provider value={{ config: mergedConfig }}>
      {children}
    </QuizConfigContext.Provider>
  );
};

/**
 * Hook to access quiz configuration
 * 
 * @throws Error if used outside of QuizConfigProvider
 */
export const useQuizConfig = (): QuizConfigContextType => {
  const context = useContext(QuizConfigContext);
  if (!context) {
    throw new Error('useQuizConfig must be used within a QuizConfigProvider');
  }
  return context;
};
