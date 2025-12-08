import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface FunFactDisplayProps {
  funFact?: string;
}

/**
 * FunFactDisplay Component
 * 
 * Displays fun facts after quiz answers, visually distinguished from main explanation.
 * Handles optional fun facts gracefully - renders nothing if no fun fact is provided.
 * Features animated reveal with reduced motion support.
 * 
 * Requirements:
 * - 14.1: Display fun fact after showing answer explanation
 * - 14.2: Visually distinguish fun facts from main explanation
 * - 14.3: Handle optional fun facts without errors
 * - 8.2: Add fun fact reveal animation
 * - 8.4: Ensure animations complete within 500ms and support reduced motion
 */
const FunFactDisplay: React.FC<FunFactDisplayProps> = ({ funFact }) => {
  // Handle optional fun facts gracefully - return null if not provided or empty
  if (!funFact || funFact.trim() === '') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4,
        ease: 'easeOut'
      }}
      className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-reinvent-yellow/20 to-reinvent-red/20 border-2 border-reinvent-yellow/50 rounded-lg backdrop-blur-sm"
      data-testid="fun-fact-display"
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <motion.div
          initial={{ rotate: -10, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ 
            duration: 0.3,
            delay: 0.1,
            type: 'spring',
            stiffness: 200
          }}
        >
          <Lightbulb
            className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 text-reinvent-yellow mt-0.5"
            data-testid="fun-fact-icon"
          />
        </motion.div>
        <div>
          <motion.h4 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="text-xs sm:text-sm font-bold text-reinvent-yellow uppercase tracking-wide mb-1" 
            data-testid="fun-fact-label"
          >
            Fun Fact
          </motion.h4>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-sm sm:text-base text-gray-200 leading-relaxed" 
            data-testid="fun-fact-text"
          >
            {funFact}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default FunFactDisplay;
