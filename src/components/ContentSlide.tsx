import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { ContentSlide as ContentSlideType, ContentBlock } from '../types/quiz.types';
import { resolveImagePath, getPlaceholderImage } from '../utils/imageLoader';
import { getLucideIcon, getAWSServiceIcon } from '../utils/iconMapper';
import CalloutBox from './CalloutBox';
import QuoteBlock from './QuoteBlock';
import GridLayout from './GridLayout';

interface ContentSlideProps {
  slide: ContentSlideType;
  onNext: () => void;
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
 * - 13.1: Render callout blocks with specified style
 * - 13.2: Render quote blocks with author attribution
 * - 13.3: Render grid blocks in multi-column layout
 * - 13.4: Render list title when present
 */
const ContentSlide: React.FC<ContentSlideProps> = ({ slide, onNext }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-black text-white px-6 py-12 flex flex-col"
      data-testid="content-slide"
    >
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {/* Slide Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold mb-8 text-white"
          data-testid="content-slide-title"
        >
          {slide.title}
        </motion.h1>

        {/* Content Blocks */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex-1 space-y-6"
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
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 flex justify-end"
        >
          <button
            onClick={onNext}
            className="flex items-center gap-2 bg-reinvent-purple hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
            data-testid="next-button"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </motion.div>
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
    heading: 'text-3xl md:text-4xl font-bold text-white',
    subheading: 'text-2xl md:text-3xl font-semibold text-gray-200',
    body: 'text-lg text-gray-300 leading-relaxed',
    caption: 'text-sm text-gray-400 italic',
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
    <figure className={`${sizeClass} mx-auto my-6`} data-testid="image-block">
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
        <figcaption className="text-sm text-gray-400 text-center mt-3 italic" data-testid="image-caption">
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
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const sizeClass = sizeClasses[block.size as keyof typeof sizeClasses] || sizeClasses.medium;

  if (block.iconType === 'lucide') {
    const IconComponent = getLucideIcon(block.iconName);
    if (!IconComponent) return null;

    return (
      <div className="flex flex-col items-center gap-3 my-6" data-testid="icon-block">
        <IconComponent className={`${sizeClass} text-reinvent-purple`} data-testid="icon-block-icon" />
        {block.label && (
          <span className="text-sm text-gray-300 font-medium" data-testid="icon-block-label">
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
      <div className="flex flex-col items-center gap-3 my-6" data-testid="icon-block">
        <div className={`${sizeClass} flex items-center justify-center bg-reinvent-purple/20 rounded-lg border border-reinvent-purple/50`} data-testid="icon-block-icon">
          <span className="text-xs font-bold text-reinvent-purple uppercase">
            {awsIconId || block.iconName}
          </span>
        </div>
        {block.label && (
          <span className="text-sm text-gray-300 font-medium" data-testid="icon-block-label">
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
    <div className="my-6" data-testid="list-block">
      {block.title && (
        <h3 className="text-xl font-semibold text-white mb-3" data-testid="list-block-title">
          {block.title}
        </h3>
      )}
      <ListTag className={`${listClass} space-y-2 text-gray-300`} data-testid="list-block-items">
        {block.items.map((item, index) => (
          <li key={index} className="text-lg leading-relaxed">
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
    <div className="text-center my-8 p-6 bg-gray-900/50 rounded-lg border border-gray-700" data-testid="stat-block">
      <div className={`text-5xl md:text-6xl font-bold ${colorClass} mb-2`} data-testid="stat-block-value">
        {block.value}
      </div>
      <div className="text-lg text-gray-300 font-medium" data-testid="stat-block-label">
        {block.label}
      </div>
    </div>
  );
};

export default ContentSlide;
