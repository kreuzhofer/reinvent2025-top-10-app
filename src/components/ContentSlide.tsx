import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { ContentSlide as ContentSlideType, ContentBlock } from '../types/quiz.types';
import { resolveImagePath, getPlaceholderImage } from '../utils/imageLoader';
import { getLucideIcon, getAWSServiceIcon } from '../utils/iconMapper';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import CalloutBox from './CalloutBox';
import QuoteBlock from './QuoteBlock';
import GridLayout from './GridLayout';
import Header from './Header';

interface ContentSlideProps {
  slide: ContentSlideType;
  onNext: () => void;
  currentSlide?: number;
  totalSlides?: number;
  showProgress?: boolean;
  showScore?: boolean;
}

/**
 * ContentSlide Component
 * 
 * Renders content slides with support for all content block types:
 * - Text blocks with various styles and emphasis
 * - Image blocks with captions and error handling
 * - Icon blocks (AWS and Lucide)
 * - List blocks with optional titles
 * - Stat blocks with colors
 * - Callout blocks (info, success, warning)
 * - Quote blocks with author attribution
 * - Grid blocks with multi-column layouts
 * 
 * Requirements:
 * - 1.3: Render text, images, icons, and formatting as specified
 * - 1.4: Provide clear navigation control to proceed
 * - 1.5: Load and display images from designated directory
 * - 5.4: Display placeholder when image fails to load
 * - 8.1: Animate transitions smoothly
 * - 10.1: Right arrow key to advance slides
 * - 13.1: Render callout blocks with specified style
 * - 13.2: Render quote blocks with author attribution
 * - 13.3: Render grid blocks in multi-column layout
 * - 13.4: Render list title when present
 */
const ContentSlide: React.FC<ContentSlideProps> = ({ 
  slide, 
  onNext,
  currentSlide,
  totalSlides,
  showProgress = false,
  showScore = false
}) => {
  // Enable keyboard navigation for content slides
  useKeyboardNav({
    onNext,
    enabled: true,
  });

  return (
    <>
      <Header 
        showProgress={showProgress}
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        showScore={showScore}
      />
      <motion.main
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ 
          duration: 0.4,
          ease: 'easeOut'
        }}
        className="min-h-screen bg-black text-white px-4 sm:px-6 py-8 sm:py-12 flex flex-col pt-20 sm:pt-24"
        data-testid="content-slide"
        role="main"
        aria-label="Content slide"
      >
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {/* Slide Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            delay: 0.1,
            ease: 'easeOut'
          }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-white"
          data-testid="content-slide-title"
        >
          {slide.title}
        </motion.h1>

        {/* Content Blocks */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.3,
            delay: 0.15,
            ease: 'easeOut'
          }}
          className="flex-1 space-y-4 sm:space-y-6"
          data-testid="content-blocks-container"
        >
          {slide.content.map((block, index) => (
            <ContentBlockRenderer key={index} block={block} />
          ))}
        </motion.div>

        {/* Navigation Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            delay: 0.2,
            ease: 'easeOut'
          }}
          className="mt-6 sm:mt-8 flex justify-end"
        >
          <motion.button
            onClick={onNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 bg-reinvent-purple hover:bg-purple-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg transition-colors duration-200"
            data-testid="next-button"
            aria-label="Continue to next slide"
          >
            Next
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </motion.button>
        </motion.div>
      </div>
    </motion.main>
    </>
  );
};

/**
 * ContentBlockRenderer Component
 * 
 * Renders individual content blocks based on their type
 */
const ContentBlockRenderer: React.FC<{ block: ContentBlock }> = ({ block }) => {
  switch (block.type) {
    case 'text':
      return <TextBlockComponent block={block} />;
    case 'image':
      return <ImageBlockComponent block={block} />;
    case 'icon':
      return <IconBlockComponent block={block} />;
    case 'list':
      return <ListBlockComponent block={block} />;
    case 'stat':
      return <StatBlockComponent block={block} />;
    case 'callout':
      return <CalloutBox text={block.text} style={block.style} />;
    case 'quote':
      return <QuoteBlock text={block.text} author={block.author} />;
    case 'grid':
      return <GridLayout columns={block.columns} items={block.items} />;
    default:
      return null;
  }
};

/**
 * TextBlock Component
 */
const TextBlockComponent: React.FC<{ block: { type: 'text'; text: string; style?: string; emphasis?: string } }> = ({ block }) => {
  const styleClasses = {
    heading: 'text-2xl sm:text-3xl md:text-4xl font-bold text-white',
    subheading: 'text-xl sm:text-2xl md:text-3xl font-semibold text-gray-200',
    body: 'text-base sm:text-lg text-gray-300 leading-relaxed',
    caption: 'text-xs sm:text-sm text-gray-400 italic',
  };

  const emphasisClasses = {
    bold: 'font-bold',
    italic: 'italic',
    highlight: 'bg-reinvent-purple/30 px-2 py-1 rounded',
  };

  const baseClass = styleClasses[block.style as keyof typeof styleClasses] || styleClasses.body;
  const emphasisClass = block.emphasis ? emphasisClasses[block.emphasis as keyof typeof emphasisClasses] : '';

  return (
    <p className={`${baseClass} ${emphasisClass}`} data-testid="text-block">
      {block.text}
    </p>
  );
};

/**
 * ImageBlock Component with error handling
 */
const ImageBlockComponent: React.FC<{ block: { type: 'image'; src: string; alt: string; caption?: string; size?: string } }> = ({ block }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    full: 'w-full',
  };

  const sizeClass = sizeClasses[block.size as keyof typeof sizeClasses] || sizeClasses.medium;

  const imageSrc = imageError ? getPlaceholderImage() : resolveImagePath(block.src);

  return (
    <figure className={`${sizeClass} mx-auto my-4 sm:my-6`} data-testid="image-block">
      <div className="relative">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg" />
        )}
        <img
          src={imageSrc}
          alt={block.alt}
          onError={() => setImageError(true)}
          onLoad={() => setImageLoaded(true)}
          className="w-full h-auto rounded-lg shadow-lg"
          data-testid="image-block-img"
        />
      </div>
      {block.caption && (
        <figcaption className="text-xs sm:text-sm text-gray-400 text-center mt-2 sm:mt-3 italic" data-testid="image-caption">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
};

/**
 * IconBlock Component
 */
const IconBlockComponent: React.FC<{ block: { type: 'icon'; iconType: 'aws' | 'lucide'; iconName: string; label?: string; size?: string } }> = ({ block }) => {
  const sizeClasses = {
    small: 'w-6 h-6 sm:w-8 sm:h-8',
    medium: 'w-10 h-10 sm:w-12 sm:h-12',
    large: 'w-12 h-12 sm:w-16 sm:h-16',
  };

  const sizeClass = sizeClasses[block.size as keyof typeof sizeClasses] || sizeClasses.medium;

  if (block.iconType === 'lucide') {
    const IconComponent = getLucideIcon(block.iconName);
    if (!IconComponent) return null;

    return (
      <div className="flex flex-col items-center gap-2 sm:gap-3 my-4 sm:my-6" data-testid="icon-block">
        <IconComponent className={`${sizeClass} text-reinvent-purple`} data-testid="icon-block-icon" />
        {block.label && (
          <span className="text-xs sm:text-sm text-gray-300 font-medium" data-testid="icon-block-label">
            {block.label}
          </span>
        )}
      </div>
    );
  } else {
    // AWS icon - for now, display the service name as text
    // In a real implementation, you would load AWS service icon SVGs
    const awsIconId = getAWSServiceIcon(block.iconName);
    
    return (
      <div className="flex flex-col items-center gap-2 sm:gap-3 my-4 sm:my-6" data-testid="icon-block">
        <div className={`${sizeClass} flex items-center justify-center bg-reinvent-purple/20 rounded-lg border border-reinvent-purple/50`} data-testid="icon-block-icon">
          <span className="text-xs font-bold text-reinvent-purple uppercase">
            {awsIconId || block.iconName}
          </span>
        </div>
        {block.label && (
          <span className="text-xs sm:text-sm text-gray-300 font-medium" data-testid="icon-block-label">
            {block.label}
          </span>
        )}
      </div>
    );
  }
};

/**
 * ListBlock Component with optional title
 */
const ListBlockComponent: React.FC<{ block: { type: 'list'; title?: string; items: string[]; ordered?: boolean } }> = ({ block }) => {
  const ListTag = block.ordered ? 'ol' : 'ul';
  const listClass = block.ordered ? 'list-decimal list-inside' : 'list-disc list-inside';

  return (
    <div className="my-4 sm:my-6" data-testid="list-block">
      {block.title && (
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3" data-testid="list-block-title">
          {block.title}
        </h3>
      )}
      <ListTag className={`${listClass} space-y-1 sm:space-y-2 text-gray-300`} data-testid="list-block-items">
        {block.items.map((item, index) => (
          <li key={index} className="text-sm sm:text-base md:text-lg leading-relaxed">
            {item}
          </li>
        ))}
      </ListTag>
    </div>
  );
};

/**
 * StatBlock Component
 */
const StatBlockComponent: React.FC<{ block: { type: 'stat'; value: string; label: string; color?: string } }> = ({ block }) => {
  const colorClasses = {
    purple: 'text-reinvent-purple',
    blue: 'text-reinvent-blue',
    red: 'text-reinvent-red',
    yellow: 'text-reinvent-yellow',
    orange: 'text-orange-400',
    green: 'text-green-400',
  };

  const colorClass = colorClasses[block.color as keyof typeof colorClasses] || colorClasses.purple;

  return (
    <div className="text-center my-6 sm:my-8 p-4 sm:p-6 bg-gray-900/50 rounded-lg border border-gray-700" data-testid="stat-block">
      <div className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold ${colorClass} mb-2`} data-testid="stat-block-value">
        {block.value}
      </div>
      <div className="text-base sm:text-lg text-gray-300 font-medium" data-testid="stat-block-label">
        {block.label}
      </div>
    </div>
  );
};

export default ContentSlide;
