import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ScoreContextType } from '../types/quiz.types';

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

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
  const [score, setScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);

  const addPoints = (points: number) => {
    setScore((prevScore) => prevScore + points);
  };

  const addPossiblePoints = (points: number) => {
    setTotalPossible((prevTotal) => prevTotal + points);
  };

  const resetScore = () => {
    setScore(0);
    setTotalPossible(0);
  };

  const calculateTimeAdjustedPoints = (basePoints: number, elapsedSeconds: number): number => {
    // Formula: basePoints - basePoints * 0.10 * elapsedSeconds
    // Ensure result is not negative
    const adjustedPoints = basePoints - basePoints * 0.10 * elapsedSeconds;
    return Math.max(0, Math.round(adjustedPoints));
  };

  const value: ScoreContextType = {
    score,
    totalPossible,
    addPoints,
    addPossiblePoints,
    resetScore,
    calculateTimeAdjustedPoints,
  };

  return <ScoreContext.Provider value={value}>{children}</ScoreContext.Provider>;
};
