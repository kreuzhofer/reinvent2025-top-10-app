import React from 'react';
import { Quote } from 'lucide-react';

interface QuoteBlockProps {
  text: string;
  author: string;
}

/**
 * QuoteBlock Component
 * 
 * Displays a quote with author attribution, styled with quotation marks and emphasis.
 * Uses re:Invent branding colors for visual consistency.
 * 
 * Requirements:
 * - 13.2: Render quote text with author attribution
 */
const QuoteBlock: React.FC<QuoteBlockProps> = ({ text, author }) => {
  return (
    <figure
      className="relative p-4 sm:p-6 my-3 sm:my-4 bg-gradient-to-br from-reinvent-purple/10 to-reinvent-blue/10 border-l-4 border-reinvent-purple rounded-r-lg"
      data-testid="quote-block"
      role="figure"
      aria-label={`Quote from ${author}`}
    >
      <Quote
        className="absolute top-3 sm:top-4 left-3 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 text-reinvent-purple/30"
        data-testid="quote-icon"
        aria-hidden="true"
      />
      <div className="pl-6 sm:pl-8">
        <blockquote className="text-base sm:text-lg italic text-gray-200 leading-relaxed mb-2 sm:mb-3" data-testid="quote-text">
          "{text}"
        </blockquote>
        <figcaption>
          <cite className="text-xs sm:text-sm text-reinvent-purple font-semibold not-italic" data-testid="quote-author">
            — {author}
          </cite>
        </figcaption>
      </div>
    </figure>
  );
};

export default QuoteBlock;
