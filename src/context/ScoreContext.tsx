import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ScoreContextType } from '../types/quiz.types';

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

const SCORE_STORAGE_KEY = 'quiz-score';
const TOTAL_POSSIBLE_STORAGE_KEY = 'quiz-total-possible';

export const useScore = (): ScoreContextType => {
  const context = useContext(ScoreContext);
  if (!context) {
    throw new Error('useScore must be used within a ScoreProvider');
  }
  return context;
};

interface ScoreProviderProps {
  children: ReactNode;
}

export const ScoreProvider: React.FC<ScoreProviderProps> = ({ children }) => {
  // Initialize from localStorage if available
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem(SCORE_STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [totalPossible, setTotalPossible] = useState(() => {
    const saved = localStorage.getItem(TOTAL_POSSIBLE_STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  // Persist score to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SCORE_STORAGE_KEY, score.toString());
  }, [score]);

  // Persist totalPossible to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(TOTAL_POSSIBLE_STORAGE_KEY, totalPossible.toString());
  }, [totalPossible]);

  const addPoints = useCallback((points: number) => {
    setScore((prevScore) => prevScore + points);
  }, []);

  const addPossiblePoints = useCallback((points: number) => {
    setTotalPossible((prevTotal) => prevTotal + points);
  }, []);

  const setTotalPossiblePoints = useCallback((points: number) => {
    setTotalPossible(points);
  }, []);

  const resetScore = useCallback(() => {
    setScore(0);
    setTotalPossible(0);
    localStorage.removeItem(SCORE_STORAGE_KEY);
    localStorage.removeItem(TOTAL_POSSIBLE_STORAGE_KEY);
  }, []);

  const calculateTimeAdjustedPoints = useCallback((basePoints: number, elapsedSeconds: number, timeLimit: number): number => {
    // If time has expired, award 0 points
    if (elapsedSeconds >= timeLimit) {
      return 0;
    }
    
    // If basePoints is less than 10, return 0 (can't apply minimum threshold)
    if (basePoints < 10) {
      return 0;
    }
    
    // Calculate dynamic deduction rate (rounded down)
    const deductionRate = Math.floor(basePoints / timeLimit);
    
    // Calculate adjusted points
    const adjustedPoints = basePoints - (deductionRate * elapsedSeconds);
    
    // Apply minimum threshold of 10 points during countdown
    const finalPoints = Math.max(10, adjustedPoints);
    
    return Math.round(finalPoints);
  }, []);

  const value: ScoreContextType = {
    score,
    totalPossible,
    addPoints,
    addPossiblePoints,
    setTotalPossible: setTotalPossiblePoints,
    resetScore,
    calculateTimeAdjustedPoints,
  };

  return <ScoreContext.Provider value={value}>{children}</ScoreContext.Provider>;
};
