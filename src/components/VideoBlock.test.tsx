/**
 * Unit Tests for VideoBlock Component
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { VideoBlockComponent, VideoBlock } from './VideoBlock';

describe('VideoBlock Component', () => {
  beforeEach(() => {
    // Mock console.error to avoid noise from expected errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  /**
   * Test video element rendering with correct src
   * Requirements: 10.1, 10.5
   */
  it('should render video element with correct src', () => {
    const block: VideoBlock = {
      type: 'video',
      videoFile: 'demo.mp4',
    };

    render(<VideoBlockComponent block={block} />);

    const videoElement = screen.getByTestId('video-element') as HTMLVideoElement;
    expect(videoElement).toBeDefined();
    expect(videoElement.src).toContain('/data/video/demo.mp4');
  });

  /**
   * Test size class application
   * Requirements: 10.6
   */
  it('should apply correct size classes', () => {
    const sizes: Array<'small' | 'medium' | 'large' | 'full'> = ['small', 'medium', 'large', 'full'];
    const sizeClassMap = {
      small: 'max-w-sm',
      medium: 'max-w-2xl',
      large: 'max-w-4xl',
      full: 'w-full',
    };

    sizes.forEach((size) => {
      const block: VideoBlock = {
        type: 'video',
        videoFile: 'test.mp4',
        size,
      };

      const { container } = render(<VideoBlockComponent block={block} />);
      const figure = container.querySelector('figure');
      
      expect(figure?.className).toContain(sizeClassMap[size]);
    });
  });

  /**
   * Test default size when not specified
   * Requirements: 10.6
   */
  it('should default to medium size when size is not specified', () => {
    const block: VideoBlock = {
      type: 'video',
      videoFile: 'test.mp4',
    };

    const { container } = render(<VideoBlockComponent block={block} />);
    const figure = container.querySelector('figure');
    
    expect(figure?.className).toContain('max-w-2xl');
  });

  /**
   * Test preview image as poster
   * Requirements: 10.4
   */
  it('should display preview image as poster', () => {
    const block: VideoBlock = {
      type: 'video',
      videoFile: 'demo.mp4',
      preview: 'preview.jpg',
    };

    render(<VideoBlockComponent block={block} />);

    const videoElement = screen.getByTestId('video-element') as HTMLVideoElement;
    expect(videoElement.poster).toContain('/data/images/preview.jpg');
  });

  /**
   * Test error handling and fallback
   * Requirements: 10.7
   */
  it('should display preview image as fallback when video fails to load', async () => {
    const block: VideoBlock = {
      type: 'video',
      videoFile: 'nonexistent.mp4',
      preview: 'fallback.jpg',
    };

    render(<VideoBlockComponent block={block} />);

    const videoElement = screen.getByTestId('video-element') as HTMLVideoElement;
    
    // Simulate video error
    videoElement.dispatchEvent(new Event('error'));

    await waitFor(() => {
      const fallbackImage = screen.getByTestId('video-fallback-image');
      expect(fallbackImage).toBeDefined();
      expect(fallbackImage.getAttribute('src')).toContain('/data/images/fallback.jpg');
    });
  });

  /**
   * Test autoplay attribute
   * Requirements: 10.2
   */
  it('should attempt to play video when autoplay is true', () => {
    const playMock = vi.fn().mockResolvedValue(undefined);
    HTMLVideoElement.prototype.play = playMock;

    const block: VideoBlock = {
      type: 'video',
      videoFile: 'demo.mp4',
      autoplay: true,
    };

    render(<VideoBlockComponent block={block} />);

    const videoElement = screen.getByTestId('video-element');
    expect(videoElement).toBeDefined();
  });

  /**
   * Test loop attribute
   * Requirements: 10.3
   */
  it('should set loop attribute when loop is true', () => {
    const block: VideoBlock = {
      type: 'video',
      videoFile: 'demo.mp4',
      loop: true,
    };

    render(<VideoBlockComponent block={block} />);

    const videoElement = screen.getByTestId('video-element') as HTMLVideoElement;
    expect(videoElement.loop).toBe(true);
  });

  /**
   * Test loop attribute when false
   * Requirements: 10.3
   */
  it('should not set loop attribute when loop is false', () => {
    const block: VideoBlock = {
      type: 'video',
      videoFile: 'demo.mp4',
      loop: false,
    };

    render(<VideoBlockComponent block={block} />);

    const videoElement = screen.getByTestId('video-element') as HTMLVideoElement;
    expect(videoElement.loop).toBe(false);
  });

  /**
   * Test caption rendering
   * Requirements: 10.1
   */
  it('should render caption when provided', () => {
    const block: VideoBlock = {
      type: 'video',
      videoFile: 'demo.mp4',
      caption: 'Product demonstration video',
    };

    render(<VideoBlockComponent block={block} />);

    const caption = screen.getByTestId('video-caption');
    expect(caption).toBeDefined();
    expect(caption.textContent).toBe('Product demonstration video');
  });

  /**
   * Test no caption rendering when not provided
   * Requirements: 10.1
   */
  it('should not render caption when not provided', () => {
    const block: VideoBlock = {
      type: 'video',
      videoFile: 'demo.mp4',
    };

    render(<VideoBlockComponent block={block} />);

    const caption = screen.queryByTestId('video-caption');
    expect(caption).toBeNull();
  });

  /**
   * Test video controls are present
   * Requirements: 10.1
   */
  it('should render video with controls', () => {
    const block: VideoBlock = {
      type: 'video',
      videoFile: 'demo.mp4',
    };

    render(<VideoBlockComponent block={block} />);

    const videoElement = screen.getByTestId('video-element') as HTMLVideoElement;
    expect(videoElement.controls).toBe(true);
  });

  /**
   * Test loading state
   * Requirements: 10.1
   */
  it('should show loading state before video loads', () => {
    const block: VideoBlock = {
      type: 'video',
      videoFile: 'demo.mp4',
    };

    const { container } = render(<VideoBlockComponent block={block} />);

    const loadingIndicator = container.querySelector('.animate-pulse');
    expect(loadingIndicator).toBeDefined();
  });

  /**
   * Test aria-label for accessibility
   * Requirements: 10.1
   */
  it('should have aria-label for accessibility', () => {
    const block: VideoBlock = {
      type: 'video',
      videoFile: 'demo.mp4',
      caption: 'Demo video',
    };

    render(<VideoBlockComponent block={block} />);

    const videoElement = screen.getByTestId('video-element');
    expect(videoElement.getAttribute('aria-label')).toBe('Demo video');
  });

  /**
   * Test default aria-label when no caption
   * Requirements: 10.1
   */
  it('should have default aria-label when no caption provided', () => {
    const block: VideoBlock = {
      type: 'video',
      videoFile: 'demo.mp4',
    };

    render(<VideoBlockComponent block={block} />);

    const videoElement = screen.getByTestId('video-element');
    expect(videoElement.getAttribute('aria-label')).toBe('Video content');
  });
});
