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
import { resolveVideoPath } from '../utils/videoLoader';
import { resolveImagePath } from '../utils/imageLoader';

export interface VideoBlock {
  type: 'video';
  videoFile: string;
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
  const videoRef = useRef<HTMLVideoElement>(null);

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    full: 'w-full',
  };

  const sizeClass = sizeClasses[block.size || 'medium'];
  const videoSrc = resolveVideoPath(block.videoFile);
  const previewSrc = block.preview ? resolveImagePath(block.preview) : undefined;

  useEffect(() => {
    // Handle autoplay with user interaction requirement
    if (block.autoplay && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked by browser, silently fail
      });
    }
  }, [block.autoplay]);

  return (
    <figure className={`${sizeClass} mx-auto my-4 sm:my-6`} data-testid="video-block">
      <div className="relative rounded-lg overflow-hidden bg-gray-900">
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
          <video
            ref={videoRef}
            src={videoSrc}
            poster={previewSrc}
            controls
            loop={block.loop}
            onError={() => setVideoError(true)}
            onLoadedData={() => setVideoLoaded(true)}
            className="w-full h-auto"
            data-testid="video-element"
            aria-label={block.caption || 'Video content'}
          >
            Your browser does not support the video tag.
          </video>
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
