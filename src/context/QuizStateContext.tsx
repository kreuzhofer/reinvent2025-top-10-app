import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

interface QuizAnswerState {
  selectedIndex: number | null;
  isCorrect: boolean;
  pointsAwarded: number;
  isSkipped: boolean;
  isTimedOut: boolean;
}

interface ShuffleOrder {
  choiceIndices: number[]; // The shuffled order of choice indices
  correctIndex: number; // The new index of the correct answer after shuffling
}

interface QuizStateContextType {
  getAnswerState: (slideId: string) => QuizAnswerState | null;
  setAnswerState: (slideId: string, state: QuizAnswerState) => void;
  getShuffleOrder: (slideId: string) => ShuffleOrder | null;
  setShuffleOrder: (slideId: string, order: ShuffleOrder) => void;
  clearAllAnswers: () => void;
}

const QuizStateContext = createContext<QuizStateContextType | undefined>(undefined);

const QUIZ_STATE_STORAGE_KEY = 'quiz-answer-states';
const SHUFFLE_ORDER_STORAGE_KEY = 'quiz-shuffle-orders';

export const useQuizState = (): QuizStateContextType => {
  const context = useContext(QuizStateContext);
  if (!context) {
    throw new Error('useQuizState must be used within a QuizStateProvider');
  }
  return context;
};

interface QuizStateProviderProps {
  children: ReactNode;
}

export const QuizStateProvider: React.FC<QuizStateProviderProps> = ({ children }) => {
  // Initialize from localStorage if available
  const [answerStates, setAnswerStates] = useState<Record<string, QuizAnswerState>>(() => {
    const saved = localStorage.getItem(QUIZ_STATE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const [shuffleOrders, setShuffleOrders] = useState<Record<string, ShuffleOrder>>(() => {
    const saved = localStorage.getItem(SHUFFLE_ORDER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  // Persist answer states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(QUIZ_STATE_STORAGE_KEY, JSON.stringify(answerStates));
  }, [answerStates]);

  // Persist shuffle orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SHUFFLE_ORDER_STORAGE_KEY, JSON.stringify(shuffleOrders));
  }, [shuffleOrders]);

  const getAnswerState = useCallback((slideId: string): QuizAnswerState | null => {
    return answerStates[slideId] || null;
  }, [answerStates]);

  const setAnswerState = useCallback((slideId: string, state: QuizAnswerState) => {
    setAnswerStates((prev) => ({
      ...prev,
      [slideId]: state,
    }));
  }, []);

  const getShuffleOrder = useCallback((slideId: string): ShuffleOrder | null => {
    return shuffleOrders[slideId] || null;
  }, [shuffleOrders]);

  const setShuffleOrder = useCallback((slideId: string, order: ShuffleOrder) => {
    setShuffleOrders((prev) => ({
      ...prev,
      [slideId]: order,
    }));
  }, []);

  const clearAllAnswers = useCallback(() => {
    setAnswerStates({});
    setShuffleOrders({});
    localStorage.removeItem(QUIZ_STATE_STORAGE_KEY);
    localStorage.removeItem(SHUFFLE_ORDER_STORAGE_KEY);
  }, []);

  const value: QuizStateContextType = {
    getAnswerState,
    setAnswerState,
    getShuffleOrder,
    setShuffleOrder,
    clearAllAnswers,
  };

  return <QuizStateContext.Provider value={value}>{children}</QuizStateContext.Provider>;
};
