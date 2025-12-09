/**
 * VideoBlock Component
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7
 * - 10.1: WHEN a video block is specified in the Data File THEN the Quiz Application SHALL render an HTML5 video player
 * - 10.2: WHEN the autoplay property is set to true THEN the Quiz Application SHALL automatically play the video when the slide loads
 * - 10.3: WHEN the loop property is set to true THEN the Quiz Application SHALL continuously loop the video playback
 * - 10.4: WHEN a preview image is specified THEN the Quiz Application SHALL display the preview image before video playback starts
 * - 10.5: WHEN the videoFile property is specified THEN the Quiz Application SHALL load the video from the public/data/video directory
 * - 10.6: WHEN a size property is specified THEN the Quiz Application SHALL apply the same size classes as image blocks
 * - 10.7: WHEN the video fails to load THEN the Quiz Application SHALL display the preview image as a fallback
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play } from 'lucide-react';
import { resolveVideoPath } from '../utils/videoLoader';
import { resolveImagePath } from '../utils/imageLoader';

export interface VideoBlock {
  type: 'video';
  videoFile?: string;  // Local file in public/data/video/
  videoUrl?: string;   // External URL
  preview?: string;
  autoplay?: boolean;
  loop?: boolean;
  size?: 'small' | 'medium' | 'large' | 'full';
  caption?: string;
}

interface VideoBlockProps {
  block: VideoBlock;
}

export const VideoBlockComponent: React.FC<VideoBlockProps> = ({ block }) => {
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    full: 'w-full',
  };

  const sizeClass = sizeClasses[block.size || 'medium'];
  
  // Support both local files and external URLs
  const videoSrc = block.videoUrl 
    ? block.videoUrl 
    : block.videoFile 
      ? resolveVideoPath(block.videoFile)
      : '';
  
  const previewSrc = block.preview ? resolveImagePath(block.preview) : undefined;

  useEffect(() => {
    // Handle autoplay with user interaction requirement
    if (block.autoplay && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked by browser, silently fail
      });
      setIsPlaying(true);
      setShowPlayButton(false);
    }
  }, [block.autoplay]);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      setShowPlayButton(false);
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    setShowPlayButton(false);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    setShowPlayButton(true);
  };

  return (
    <figure className={`${sizeClass} mx-auto my-4 sm:my-6`} data-testid="video-block">
      <div className="relative rounded-lg overflow-hidden bg-gray-900 group">
        {!videoLoaded && !videoError && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        )}
        
        {videoError && previewSrc ? (
          <img
            src={previewSrc}
            alt={block.caption || 'Video preview'}
            className="w-full h-auto"
            data-testid="video-fallback-image"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={videoSrc}
              poster={previewSrc}
              controls
              loop={block.loop}
              onError={() => setVideoError(true)}
              onLoadedData={() => setVideoLoaded(true)}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              className="w-full h-auto"
              data-testid="video-element"
              aria-label={block.caption || 'Video content'}
            >
              Your browser does not support the video tag.
            </video>
            
            {/* Custom large play button overlay */}
            {showPlayButton && !isPlaying && (
              <button
                onClick={handlePlayClick}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors duration-200 cursor-pointer"
                aria-label="Play video"
                data-testid="video-play-button"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-reinvent-purple/90 hover:bg-reinvent-purple flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-200">
                  <Play className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white ml-1" fill="white" />
                </div>
              </button>
            )}
          </>
        )}
      </div>
      
      {block.caption && (
        <figcaption 
          className="text-xs sm:text-sm text-gray-400 text-center mt-2 sm:mt-3 italic" 
          data-testid="video-caption"
        >
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
};
