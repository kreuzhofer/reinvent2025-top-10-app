import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useScore } from '../context/ScoreContext';
import { TickSoundPlayer } from '../services/audio/TickSoundPlayer';

interface QuizTimerProps {
  basePoints: number;
  onTimeout: () => void;
  onTick: (elapsedSeconds: number) => void;
  timeLimit?: number; // Optional, defaults to 10 seconds
}

export interface QuizTimerRef {
  stopTick: () => void;
}

type TimerPhase = 'pre-countdown' | 'countdown' | 'expired';

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
 * - 3.1: Wait 1 second before starting the countdown (pre-countdown delay)
 * - 3.2: Display full base points during pre-countdown
 * - 3.3: Do not deduct points during pre-countdown
 * - 3.4: Do not play tick sound during pre-countdown
 */
const QuizTimer = forwardRef<QuizTimerRef, QuizTimerProps>(({ 
  basePoints, 
  onTimeout, 
  onTick,
  timeLimit = 10 
}, ref) => {
  const [phase, setPhase] = useState<TimerPhase>('pre-countdown');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const preCountdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickSoundPlayerRef = useRef<TickSoundPlayer | null>(null);
  const { calculateTimeAdjustedPoints } = useScore();

  const remainingTime = timeLimit - elapsedSeconds;
  const progressPercentage = (remainingTime / timeLimit) * 100;
  
  // Calculate current point value based on phase
  // During pre-countdown: show full base points
  // During countdown: use dynamic deduction calculation
  const currentPoints = phase === 'pre-countdown' 
    ? basePoints 
    : calculateTimeAdjustedPoints(basePoints, elapsedSeconds, timeLimit);

  // Expose stopTick method via ref
  useImperativeHandle(ref, () => ({
    stopTick: () => {
      if (tickSoundPlayerRef.current) {
        tickSoundPlayerRef.current.stop();
      }
    }
  }));

  // Pre-countdown delay logic
  useEffect(() => {
    if (phase === 'pre-countdown') {
      preCountdownIntervalRef.current = setInterval(() => {
        setPhase('countdown');
      }, 1000);
      
      return () => {
        if (preCountdownIntervalRef.current) {
          clearInterval(preCountdownIntervalRef.current);
        }
      };
    }
  }, [phase]);

  // Countdown logic
  useEffect(() => {
    if (phase === 'countdown') {
      // Start tick sound when countdown phase begins
      tickSoundPlayerRef.current = new TickSoundPlayer();
      tickSoundPlayerRef.current.start();
      
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const newElapsed = prev + 1;
          
          // Call onTick with the new elapsed time
          onTick(newElapsed);
          
          // Check if time is up
          if (newElapsed >= timeLimit) {
            setPhase('expired');
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            // Stop tick sound when timer expires
            if (tickSoundPlayerRef.current) {
              tickSoundPlayerRef.current.stop();
            }
            onTimeout();
          }
          
          return newElapsed;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        // Stop tick sound on cleanup
        if (tickSoundPlayerRef.current) {
          tickSoundPlayerRef.current.stop();
        }
      };
    }
  }, [phase, timeLimit, onTimeout, onTick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (preCountdownIntervalRef.current) {
        clearInterval(preCountdownIntervalRef.current);
      }
      // Stop tick sound on component unmount
      if (tickSoundPlayerRef.current) {
        tickSoundPlayerRef.current.stop();
      }
    };
  }, []);

  return (
    <div
      className="flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-6"
      data-testid="quiz-timer"
    >
      {/* Timer Display */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="text-center">
          <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide font-semibold mb-1">
            Time Remaining
          </div>
          <motion.div
            key={remainingTime}
            className={`text-3xl sm:text-4xl md:text-5xl font-bold ${
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

        <div className="hidden sm:block h-16 w-px bg-gray-700" />
        <div className="block sm:hidden h-px w-16 bg-gray-700" />

        <div className="text-center">
          <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide font-semibold mb-1">
            Current Points
          </div>
          <motion.div
            key={currentPoints}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-reinvent-purple"
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
        className="w-full max-w-xs sm:max-w-md h-2 sm:h-3 bg-gray-800 rounded-full overflow-hidden"
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
      {phase === 'expired' && (
        <div 
          className="text-xs sm:text-sm text-reinvent-red font-semibold"
          data-testid="timer-expired"
        >
          Time's Up!
        </div>
      )}
      
      {/* Pre-countdown indicator (for testing) */}
      {phase === 'pre-countdown' && (
        <div 
          className="hidden"
          data-testid="timer-pre-countdown"
          data-phase={phase}
        />
      )}
      
      {/* Countdown indicator (for testing) */}
      {phase === 'countdown' && (
        <div 
          className="hidden"
          data-testid="timer-countdown"
          data-phase={phase}
        />
      )}
    </div>
  );
});

QuizTimer.displayName = 'QuizTimer';

export default QuizTimer;
