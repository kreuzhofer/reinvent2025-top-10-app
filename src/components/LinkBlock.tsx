import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

interface LinkBlockProps {
  url: string;
  text: string;
  newTab?: boolean;
  style?: 'button' | 'text';
}

/**
 * LinkBlock Component
 * 
 * Renders a clickable link with support for button and text styles.
 * Styled with re:Invent branding colors.
 * 
 * Requirements:
 * - 11.1: Render clickable hyperlink element
 * - 11.2: Set href attribute to provided URL
 * - 11.3: Display text as link label
 * - 11.4: Open in new tab with security attributes when newTab is true
 * - 11.5: Open in same tab when newTab is false
 * - 11.6: Render with button styling when style is "button"
 * - 11.7: Render as inline text with hover underline when style is "text"
 */
const LinkBlock: React.FC<LinkBlockProps> = ({ url, text, newTab = true, style = 'button' }) => {
  const linkProps = {
    href: url,
    target: newTab ? '_blank' : '_self',
    rel: newTab ? 'noopener noreferrer' : undefined,
    'data-testid': 'link-block',
  };

  if (style === 'button') {
    return (
      <div className="my-4 sm:my-6 flex justify-center">
        <motion.a
          {...linkProps}
          className="inline-flex items-center gap-2 bg-reinvent-purple hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 no-underline"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
          data-style="button"
        >
          {text}
          {newTab && (
            <ExternalLink className="w-4 h-4" aria-hidden="true" data-testid="external-link-icon" />
          )}
        </motion.a>
      </div>
    );
  }

  // Text style
  return (
    <div className="my-2 sm:my-3">
      <a
        {...linkProps}
        className="text-reinvent-blue hover:text-reinvent-purple underline-offset-2 hover:underline transition-colors duration-200"
        data-style="text"
      >
        {text}
        {newTab && (
          <ExternalLink className="w-3 h-3 inline ml-1" aria-hidden="true" data-testid="external-link-icon" />
        )}
      </a>
    </div>
  );
};

export default LinkBlock;
