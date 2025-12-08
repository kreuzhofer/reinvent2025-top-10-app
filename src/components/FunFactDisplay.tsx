import React from 'react';
import { Lightbulb } from 'lucide-react';

interface FunFactDisplayProps {
  funFact?: string;
}

/**
 * FunFactDisplay Component
 * 
 * Displays fun facts after quiz answers, visually distinguished from main explanation.
 * Handles optional fun facts gracefully - renders nothing if no fun fact is provided.
 * 
 * Requirements:
 * - 14.1: Display fun fact after showing answer explanation
 * - 14.2: Visually distinguish fun facts from main explanation
 * - 14.3: Handle optional fun facts without errors
 */
const FunFactDisplay: React.FC<FunFactDisplayProps> = ({ funFact }) => {
  // Handle optional fun facts gracefully - return null if not provided or empty
  if (!funFact || funFact.trim() === '') {
    return null;
  }

  return (
    <div
      className="mt-4 p-4 bg-gradient-to-r from-reinvent-yellow/20 to-reinvent-red/20 border-2 border-reinvent-yellow/50 rounded-lg backdrop-blur-sm"
      data-testid="fun-fact-display"
    >
      <div className="flex items-start gap-3">
        <Lightbulb
          className="flex-shrink-0 w-6 h-6 text-reinvent-yellow mt-0.5"
          data-testid="fun-fact-icon"
        />
        <div>
          <h4 className="text-sm font-bold text-reinvent-yellow uppercase tracking-wide mb-1" data-testid="fun-fact-label">
            Fun Fact
          </h4>
          <p className="text-base text-gray-200 leading-relaxed" data-testid="fun-fact-text">
            {funFact}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FunFactDisplay;
