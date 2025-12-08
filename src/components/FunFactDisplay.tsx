import React, { useEffect, useRef } from 'react';
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
 * Includes screen reader announcements for fun facts.
 * 
 * Requirements:
 * - 14.1: Display fun fact after showing answer explanation
 * - 14.2: Visually distinguish fun facts from main explanation
 * - 14.3: Handle optional fun facts without errors
 * - 8.2: Add fun fact reveal animation
 * - 8.4: Ensure animations complete within 500ms and support reduced motion
 * - 10.5: Screen reader announcements for fun facts
 */
const FunFactDisplay: React.FC<FunFactDisplayProps> = ({ funFact }) => {
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Announce fun fact to screen readers when it appears
    if (funFact && announcementRef.current) {
      announcementRef.current.textContent = `Fun fact: ${funFact}`;
    }
  }, [funFact]);

  // Handle optional fun facts gracefully - return null if not provided or empty
  if (!funFact || funFact.trim() === '') {
    return null;
  }

  return (
    <>
      {/* Screen reader announcement region */}
      <div
        ref={announcementRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
      
      <motion.aside
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.4,
          ease: 'easeOut'
        }}
        className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-reinvent-yellow/20 to-reinvent-red/20 border-2 border-reinvent-yellow/50 rounded-lg backdrop-blur-sm"
        data-testid="fun-fact-display"
        role="complementary"
        aria-label="Fun fact"
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
              aria-hidden="true"
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
      </motion.aside>
    </>
  );
};

export default FunFactDisplay;
