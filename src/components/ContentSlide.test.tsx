import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContentSlide from './ContentSlide';
import type { ContentSlide as ContentSlideType } from '../types/quiz.types';
import { AudioProvider } from '../context/AudioContext';
import { ScoreProvider } from '../context/ScoreContext';

/**
 * Unit Tests for ContentSlide Component
 * 
 * Tests specific examples and edge cases for content slide rendering.
 */

// Helper function to render ContentSlide with required providers
const renderContentSlide = (props: React.ComponentProps<typeof ContentSlide>) => {
  return render(
    <AudioProvider>
      <ScoreProvider>
        <ContentSlide {...props} />
      </ScoreProvider>
    </AudioProvider>
  );
};

describe('ContentSlide Component', () => {
  /**
   * Test: Image placeholder displays when image fails to load
   * Requirements: 5.4
   */
  it('displays placeholder when image fails to load', async () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide with Image',
      content: [
        {
          type: 'image',
          src: 'non-existent-image.png',
          alt: 'Test image that will fail',
          size: 'medium',
        },
      ],
    };

    const mockOnNext = vi.fn();
    renderContentSlide({ slide, onNext: mockOnNext });

    // Get the image element
    const img = screen.getByTestId('image-block-img') as HTMLImageElement;

    // Trigger error event
    const errorEvent = new Event('error');
    img.dispatchEvent(errorEvent);

    // Wait for the component to update
    await waitFor(() => {
      // After error, the image src should be the placeholder
      expect(img.src).toContain('data:image/svg+xml');
    });
  });

  /**
   * Test: Navigation button is present and functional
   * Requirements: 1.4
   */
  it('renders navigation button and calls onNext when clicked', async () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide',
      content: [
        {
          type: 'text',
          text: 'Test content',
          style: 'body',
        },
      ],
    };

    const mockOnNext = vi.fn();
    const user = userEvent.setup();
    renderContentSlide({ slide, onNext: mockOnNext });

    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeInTheDocument();

    await user.click(nextButton);
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Slide title is rendered
   * Requirements: 1.3
   */
  it('renders slide title', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'AWS re:Invent 2025 Announcement',
      content: [],
    };

    const mockOnNext = vi.fn();
    renderContentSlide({ slide, onNext: mockOnNext });

    expect(screen.getByTestId('content-slide-title')).toHaveTextContent('AWS re:Invent 2025 Announcement');
  });

  /**
   * Test: Text blocks render with correct content
   * Requirements: 1.3
   */
  it('renders text blocks with various styles', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide',
      content: [
        {
          type: 'text',
          text: 'This is a heading',
          style: 'heading',
        },
        {
          type: 'text',
          text: 'This is body text',
          style: 'body',
        },
        {
          type: 'text',
          text: 'This is a caption',
          style: 'caption',
        },
      ],
    };

    const mockOnNext = vi.fn();
    const { container } = renderContentSlide({ slide, onNext: mockOnNext });

    expect(container.textContent).toContain('This is a heading');
    expect(container.textContent).toContain('This is body text');
    expect(container.textContent).toContain('This is a caption');
  });

  /**
   * Test: List blocks render with items
   * Requirements: 1.3
   */
  it('renders list blocks with items', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide',
      content: [
        {
          type: 'list',
          items: ['First item', 'Second item', 'Third item'],
          ordered: false,
        },
      ],
    };

    const mockOnNext = vi.fn();
    renderContentSlide({ slide, onNext: mockOnNext });

    const listItems = screen.getByTestId('list-block-items');
    expect(listItems.textContent).toContain('First item');
    expect(listItems.textContent).toContain('Second item');
    expect(listItems.textContent).toContain('Third item');
  });

  /**
   * Test: List blocks render with title when present
   * Requirements: 13.4
   */
  it('renders list title when present', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide',
      content: [
        {
          type: 'list',
          title: 'Key Features',
          items: ['Feature 1', 'Feature 2'],
          ordered: false,
        },
      ],
    };

    const mockOnNext = vi.fn();
    renderContentSlide({ slide, onNext: mockOnNext });

    expect(screen.getByTestId('list-block-title')).toHaveTextContent('Key Features');
  });

  /**
   * Test: Stat blocks render with value and label
   * Requirements: 1.3
   */
  it('renders stat blocks with value and label', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide',
      content: [
        {
          type: 'stat',
          value: '10x',
          label: 'Faster Performance',
          color: 'purple',
        },
      ],
    };

    const mockOnNext = vi.fn();
    renderContentSlide({ slide, onNext: mockOnNext });

    expect(screen.getByTestId('stat-block-value')).toHaveTextContent('10x');
    expect(screen.getByTestId('stat-block-label')).toHaveTextContent('Faster Performance');
  });

  /**
   * Test: Icon blocks render (Lucide icons)
   * Requirements: 1.3, 5.3
   */
  it('renders Lucide icon blocks', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide',
      content: [
        {
          type: 'icon',
          iconType: 'lucide',
          iconName: 'check-circle',
          label: 'Success',
          size: 'large',
        },
      ],
    };

    const mockOnNext = vi.fn();
    renderContentSlide({ slide, onNext: mockOnNext });

    expect(screen.getByTestId('icon-block')).toBeInTheDocument();
    expect(screen.getByTestId('icon-block-label')).toHaveTextContent('Success');
  });

  /**
   * Test: AWS icon blocks render
   * Requirements: 1.3, 5.2
   */
  it('renders AWS icon blocks', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide',
      content: [
        {
          type: 'icon',
          iconType: 'aws',
          iconName: 'lambda',
          label: 'AWS Lambda',
          size: 'medium',
        },
      ],
    };

    const mockOnNext = vi.fn();
    renderContentSlide({ slide, onNext: mockOnNext });

    expect(screen.getByTestId('icon-block')).toBeInTheDocument();
    expect(screen.getByTestId('icon-block-label')).toHaveTextContent('AWS Lambda');
  });

  /**
   * Test: Callout blocks render
   * Requirements: 13.1
   */
  it('renders callout blocks', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide',
      content: [
        {
          type: 'callout',
          text: 'This is an important callout',
          style: 'info',
        },
      ],
    };

    const mockOnNext = vi.fn();
    renderContentSlide({ slide, onNext: mockOnNext });

    expect(screen.getByTestId('callout-box')).toBeInTheDocument();
    expect(screen.getByTestId('callout-text')).toHaveTextContent('This is an important callout');
  });

  /**
   * Test: Quote blocks render
   * Requirements: 13.2
   */
  it('renders quote blocks', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide',
      content: [
        {
          type: 'quote',
          text: 'This is a great quote',
          author: 'John Doe',
        },
      ],
    };

    const mockOnNext = vi.fn();
    renderContentSlide({ slide, onNext: mockOnNext });

    expect(screen.getByTestId('quote-block')).toBeInTheDocument();
    expect(screen.getByTestId('quote-text')).toHaveTextContent('This is a great quote');
    expect(screen.getByTestId('quote-author')).toHaveTextContent('John Doe');
  });

  /**
   * Test: Grid blocks render
   * Requirements: 13.3
   */
  it('renders grid blocks', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide',
      content: [
        {
          type: 'grid',
          columns: 2,
          items: [
            { title: 'Item 1', description: 'Description 1' },
            { title: 'Item 2', description: 'Description 2' },
          ],
        },
      ],
    };

    const mockOnNext = vi.fn();
    renderContentSlide({ slide, onNext: mockOnNext });

    expect(screen.getByTestId('grid-layout')).toBeInTheDocument();
    const gridItems = screen.getAllByTestId('grid-item');
    expect(gridItems).toHaveLength(2);
  });

  /**
   * Test: Multiple content blocks render together
   * Requirements: 1.3
   */
  it('renders multiple content blocks in sequence', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide',
      content: [
        {
          type: 'text',
          text: 'Introduction text',
          style: 'body',
        },
        {
          type: 'stat',
          value: '99.99%',
          label: 'Uptime',
          color: 'green',
        },
        {
          type: 'list',
          title: 'Features',
          items: ['Feature A', 'Feature B'],
        },
      ],
    };

    const mockOnNext = vi.fn();
    const { container } = renderContentSlide({ slide, onNext: mockOnNext });

    expect(container.textContent).toContain('Introduction text');
    expect(screen.getByTestId('stat-block-value')).toHaveTextContent('99.99%');
    expect(screen.getByTestId('list-block-title')).toHaveTextContent('Features');
  });

  /**
   * Integration Test: ProgressBar renders when showProgress is true
   * Requirements: 1.1, 3.3, 3.5
   */
  it('renders ProgressBar when showProgress is true', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide',
      content: [
        {
          type: 'text',
          text: 'Test content',
          style: 'body',
        },
      ],
    };

    const mockOnNext = vi.fn();
    const { container } = renderContentSlide({
      slide,
      onNext: mockOnNext,
      currentSlide: 3,
      totalSlides: 10,
      showProgress: true,
    });

    const progressBar = container.querySelector('[data-testid="progress-bar"]');
    expect(progressBar).toBeInTheDocument();
  });

  /**
   * Integration Test: ProgressBar does not render when showProgress is false
   * Requirements: 1.1, 3.3, 3.5
   */
  it('does not render ProgressBar when showProgress is false', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide',
      content: [
        {
          type: 'text',
          text: 'Test content',
          style: 'body',
        },
      ],
    };

    const mockOnNext = vi.fn();
    const { container } = renderContentSlide({
      slide,
      onNext: mockOnNext,
      currentSlide: 3,
      totalSlides: 10,
      showProgress: false,
    });

    const progressBar = container.querySelector('[data-testid="progress-bar"]');
    expect(progressBar).not.toBeInTheDocument();
  });

  /**
   * Integration Test: ProgressBar does not render when currentSlide or totalSlides is missing
   * Requirements: 1.1, 3.3, 3.5
   */
  it('does not render ProgressBar when currentSlide or totalSlides is missing', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide',
      content: [
        {
          type: 'text',
          text: 'Test content',
          style: 'body',
        },
      ],
    };

    const mockOnNext = vi.fn();
    
    // Test without currentSlide
    const { container: container1 } = renderContentSlide({
      slide,
      onNext: mockOnNext,
      totalSlides: 10,
      showProgress: true,
    });
    expect(container1.querySelector('[data-testid="progress-bar"]')).not.toBeInTheDocument();

    // Test without totalSlides
    const { container: container2 } = renderContentSlide({
      slide,
      onNext: mockOnNext,
      currentSlide: 3,
      showProgress: true,
    });
    expect(container2.querySelector('[data-testid="progress-bar"]')).not.toBeInTheDocument();
  });

  /**
   * Integration Test: Header is rendered with correct props
   * Requirements: 1.1, 3.3, 3.5
   */
  it('renders Header with showScore and showAudioControls props', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide',
      content: [
        {
          type: 'text',
          text: 'Test content',
          style: 'body',
        },
      ],
    };

    const mockOnNext = vi.fn();
    const { container } = renderContentSlide({
      slide,
      onNext: mockOnNext,
      showScore: true,
    });

    // Header should be present
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  /**
   * Integration Test: ContentSlide renders VideoBlock correctly
   * Requirements: 10.1
   */
  it('renders VideoBlock correctly', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide with Video',
      content: [
        {
          type: 'video',
          videoFile: 'demo.mp4',
          preview: 'demo-preview.jpg',
          autoplay: false,
          loop: true,
          size: 'large',
          caption: 'Demo video',
        },
      ],
    };

    const mockOnNext = vi.fn();
    renderContentSlide({ slide, onNext: mockOnNext });

    // VideoBlock should be rendered
    expect(screen.getByTestId('video-block')).toBeInTheDocument();
    expect(screen.getByTestId('video-element')).toBeInTheDocument();
    expect(screen.getByTestId('video-caption')).toHaveTextContent('Demo video');
  });

  /**
   * Integration Test: ContentSlide renders LinkBlock correctly
   * Requirements: 11.1
   */
  it('renders LinkBlock correctly', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide with Link',
      content: [
        {
          type: 'link',
          url: 'https://aws.amazon.com/reinvent/',
          text: 'Learn more about re:Invent',
          newTab: true,
          style: 'button',
        },
      ],
    };

    const mockOnNext = vi.fn();
    renderContentSlide({ slide, onNext: mockOnNext });

    // LinkBlock should be rendered
    const linkElement = screen.getByTestId('link-block');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://aws.amazon.com/reinvent/');
    expect(linkElement).toHaveTextContent('Learn more about re:Invent');
    expect(linkElement).toHaveAttribute('target', '_blank');
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
  });

  /**
   * Integration Test: ContentSlide renders multiple new content blocks together
   * Requirements: 10.1, 11.1
   */
  it('renders VideoBlock and LinkBlock with existing content blocks', () => {
    const slide: ContentSlideType = {
      type: 'content',
      id: 'test-slide',
      title: 'Test Slide with Mixed Content',
      content: [
        {
          type: 'text',
          text: 'Introduction text',
          style: 'body',
        },
        {
          type: 'video',
          videoFile: 'demo.mp4',
          size: 'medium',
        },
        {
          type: 'link',
          url: 'https://example.com',
          text: 'Click here',
          style: 'text',
        },
        {
          type: 'stat',
          value: '100%',
          label: 'Success Rate',
        },
      ],
    };

    const mockOnNext = vi.fn();
    const { container } = renderContentSlide({ slide, onNext: mockOnNext });

    // All content blocks should be rendered
    expect(container.textContent).toContain('Introduction text');
    expect(screen.getByTestId('video-block')).toBeInTheDocument();
    expect(screen.getByTestId('link-block')).toBeInTheDocument();
    expect(screen.getByTestId('stat-block-value')).toHaveTextContent('100%');
  });
});
