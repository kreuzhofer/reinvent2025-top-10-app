import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface QuizTimerProps {
  basePoints: number;
  onTimeout: () => void;
  onTick: (elapsedSeconds: number) => void;
  timeLimit?: number; // Optional, defaults to 10 seconds
}

/**
 * QuizTimer Component
 * 
 * Displays a countdown timer for quiz questions with visual indicators.
 * Shows remaining time and current point value based on elapsed time.
 * 
 * Requirements:
 * - 11.1: Start 10-second countdown timer when quiz slide is displayed
 * - 11.2: Display remaining time prominently
 * - 11.3: Show current point value based on elapsed time (10% deduction per second)
 */
const QuizTimer: React.FC<QuizTimerProps> = ({ 
  basePoints, 
  onTimeout, 
  onTick,
  timeLimit = 10 
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const remainingTime = timeLimit - elapsedSeconds;
  const progressPercentage = (remainingTime / timeLimit) * 100;
  
  // Calculate current point value (10% deduction per elapsed second)
  const currentPoints = Math.max(0, Math.round(basePoints - (basePoints * 0.10 * elapsedSeconds)));

  useEffect(() => {
    // Start the timer
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const newElapsed = prev + 1;
        
        // Call onTick with the new elapsed time
        onTick(newElapsed);
        
        // Check if time is up
        if (newElapsed >= timeLimit) {
          setIsActive(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onTimeout();
        }
        
        return newElapsed;
      });
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeLimit, onTimeout, onTick]);

  return (
    <div
      className="flex flex-col items-center gap-4 mb-6"
      data-testid="quiz-timer"
    >
      {/* Timer Display */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-sm text-gray-400 uppercase tracking-wide font-semibold mb-1">
            Time Remaining
          </div>
          <motion.div
            key={remainingTime}
            className={`text-5xl font-bold ${
              remainingTime <= 3 ? 'text-reinvent-red' : 'text-white'
            }`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            data-testid="timer-remaining"
          >
            {remainingTime}s
          </motion.div>
        </div>

        <div className="h-16 w-px bg-gray-700" />

        <div className="text-center">
          <div className="text-sm text-gray-400 uppercase tracking-wide font-semibold mb-1">
            Current Points
          </div>
          <motion.div
            key={currentPoints}
            className="text-5xl font-bold text-reinvent-purple"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            data-testid="timer-points"
          >
            {currentPoints}
          </motion.div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div
        className="w-full max-w-md h-3 bg-gray-800 rounded-full overflow-hidden"
        data-testid="timer-progress-container"
      >
        <motion.div
          className={`h-full rounded-full ${
            remainingTime <= 3 
              ? 'bg-reinvent-red' 
              : 'bg-gradient-to-r from-reinvent-purple to-reinvent-blue'
          }`}
          initial={{ width: '100%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3, ease: 'linear' }}
          data-testid="timer-progress-fill"
        />
      </div>

      {/* Status Indicator */}
      {!isActive && (
        <div 
          className="text-sm text-reinvent-red font-semibold"
          data-testid="timer-expired"
        >
          Time's Up!
        </div>
      )}
    </div>
  );
};

export default QuizTimer;
