import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { ContentSlide as ContentSlideType, ContentBlock } from '../types/quiz.types';
import { resolveImagePath, getPlaceholderImage } from '../utils/imageLoader';
import { getLucideIcon, resolveAWSIconPath } from '../utils/iconMapper';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { useAudioManager } from '../hooks/useAudioManager';
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
 * - 3.2: Read backgroundMusic property from slide data
 * - 3.3: Play background music with fade transitions
 * - 3.4: Continue playing if backgroundMusic matches current track
 * - 3.6: Continue current music if no backgroundMusic specified
 * - 4.4: Play slide transition sound effect
 * - 5.4: Display placeholder when image fails to load
 * - 8.1: Animate transitions smoothly
 * - 9.1: Support backgroundMusic property on slides
 * - 9.3: Load audio from backgroundMusic property
 * - 9.4: Compare backgroundMusic with current track
 * - 9.5: Maintain continuous playback when tracks match
 * - 10.1: Right arrow key to advance slides
 * - 13.1: Render callout blocks with specified style
 * - 13.2: Render quote blocks with author attribution
 * - 13.3: Render grid blocks in multi-column layout
 * - 13.4: Render list title when present
 */
const ContentSlide: React.FC<ContentSlideProps> = ({ 
  slide, 
  onNext,
  currentSlide: _currentSlide,
  totalSlides: _totalSlides,
  showProgress: _showProgress = false,
  showScore = false
}) => {
  const { playBackgroundMusic, playSFX } = useAudioManager();

  // Scroll to top when slide changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slide.id]);

  // Handle background music for this slide
  useEffect(() => {
    // Play slide transition sound effect
    playSFX('slide-transition.mp3');

    // Play background music if specified on the slide
    if (slide.backgroundMusic) {
      playBackgroundMusic(slide.backgroundMusic);
    } else {
      // For content slides without specific background music, play default quiz music
      playBackgroundMusic('quiz-bg.mp3');
    }
  }, [slide.id, slide.backgroundMusic, playBackgroundMusic, playSFX]);

  // Enable keyboard navigation for content slides
  useKeyboardNav({
    onNext,
    enabled: true,
  });

  return (
    <>
      <Header 
        showScore={showScore}
        showAudioControls={true}
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
    case 'iconList':
      return <IconListBlockComponent block={block} />;
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
const IconBlockComponent: React.FC<{ block: { type: 'icon'; iconType: 'aws' | 'lucide'; iconName: string; label?: string; title?: string; size?: string } }> = ({ block }) => {
  const sizeClasses = {
    small: 'w-6 h-6 sm:w-8 sm:h-8',
    medium: 'w-10 h-10 sm:w-12 sm:h-12',
    large: 'w-12 h-12 sm:w-16 sm:h-16',
  };

  const sizeClass = sizeClasses[block.size as keyof typeof sizeClasses] || sizeClasses.medium;
  
  // Use title if provided, otherwise fall back to label for backward compatibility
  const displayText = block.title || block.label;

  if (block.iconType === 'lucide') {
    const IconComponent = getLucideIcon(block.iconName);
    if (!IconComponent) return null;

    return (
      <div className="flex flex-col items-center gap-2 sm:gap-3 my-4 sm:my-6" data-testid="icon-block">
        <IconComponent className={`${sizeClass} text-reinvent-purple`} data-testid="icon-block-icon" />
        {displayText && (
          <span className="text-xs sm:text-sm text-gray-300 font-medium text-center" data-testid="icon-block-label">
            {displayText}
          </span>
        )}
      </div>
    );
  } else {
    // AWS icon - load SVG from public/data/icons/aws/
    const [imageError, setImageError] = useState(false);
    const awsIconPath = resolveAWSIconPath(block.iconName);
    
    return (
      <div className="flex flex-col items-center gap-2 sm:gap-3 my-4 sm:my-6" data-testid="icon-block">
        {!imageError ? (
          <img
            src={awsIconPath}
            alt={displayText || block.iconName}
            className={`${sizeClass} object-contain`}
            onError={() => setImageError(true)}
            data-testid="icon-block-icon"
          />
        ) : (
          <div className={`${sizeClass} flex items-center justify-center bg-reinvent-purple/20 rounded-lg border border-reinvent-purple/50`} data-testid="icon-block-icon">
            <span className="text-xs font-bold text-reinvent-purple uppercase">
              {block.iconName}
            </span>
          </div>
        )}
        {displayText && (
          <span className="text-xs sm:text-sm text-gray-300 font-medium text-center" data-testid="icon-block-label">
            {displayText}
          </span>
        )}
      </div>
    );
  }
};

/**
 * IconListBlock Component
 * Renders a horizontal list of icons centered on the page
 */
const IconListBlockComponent: React.FC<{ 
  block: { 
    type: 'iconList'; 
    icons: Array<{
      iconType: 'aws' | 'lucide';
      iconName: string;
      title?: string;
      size?: 'small' | 'medium' | 'large';
    }>;
    spacing?: 'tight' | 'normal' | 'loose';
  } 
}> = ({ block }) => {
  // Define spacing classes based on spacing prop
  const spacingClasses = {
    tight: 'gap-3 sm:gap-4 md:gap-6',
    normal: 'gap-6 sm:gap-8 md:gap-10',
    loose: 'gap-8 sm:gap-12 md:gap-16',
  };
  
  const spacingClass = spacingClasses[block.spacing || 'normal'];
  
  return (
    <div className={`flex flex-wrap justify-center items-center ${spacingClass} my-6 sm:my-8`} data-testid="icon-list-block">
      {block.icons.map((icon, index) => (
        <IconListItemComponent key={index} icon={icon} />
      ))}
    </div>
  );
};

/**
 * IconListItemComponent
 * Renders a single icon in the icon list
 */
const IconListItemComponent: React.FC<{
  icon: {
    iconType: 'aws' | 'lucide';
    iconName: string;
    title?: string;
    size?: 'small' | 'medium' | 'large';
  };
}> = ({ icon }) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    small: 'w-8 h-8 sm:w-10 sm:h-10',
    medium: 'w-12 h-12 sm:w-16 sm:h-16',
    large: 'w-16 h-16 sm:w-20 sm:h-20',
  };

  const sizeClass = sizeClasses[icon.size as keyof typeof sizeClasses] || sizeClasses.medium;

  if (icon.iconType === 'lucide') {
    const IconComponent = getLucideIcon(icon.iconName);
    if (!IconComponent) return null;

    return (
      <div className="flex flex-col items-center gap-2 sm:gap-3" data-testid="icon-list-item">
        <IconComponent className={`${sizeClass} text-reinvent-purple`} data-testid="icon-list-item-icon" />
        {icon.title && (
          <span className="text-xs sm:text-sm text-gray-300 font-medium text-center" data-testid="icon-list-item-title">
            {icon.title}
          </span>
        )}
      </div>
    );
  } else {
    // AWS icon - load SVG from public/data/icons/aws/
    const awsIconPath = resolveAWSIconPath(icon.iconName);
    
    return (
      <div className="flex flex-col items-center gap-2 sm:gap-3" data-testid="icon-list-item">
        {!imageError ? (
          <img
            src={awsIconPath}
            alt={icon.title || icon.iconName}
            className={`${sizeClass} object-contain`}
            onError={() => setImageError(true)}
            data-testid="icon-list-item-icon"
          />
        ) : (
          <div className={`${sizeClass} flex items-center justify-center bg-reinvent-purple/20 rounded-lg border border-reinvent-purple/50`} data-testid="icon-list-item-icon">
            <span className="text-xs font-bold text-reinvent-purple uppercase">
              {icon.iconName}
            </span>
          </div>
        )}
        {icon.title && (
          <span className="text-xs sm:text-sm text-gray-300 font-medium text-center" data-testid="icon-list-item-title">
            {icon.title}
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
