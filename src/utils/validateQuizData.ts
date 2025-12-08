// Validation utilities for quiz data

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validates quiz data against the defined schema
 */
export function validateQuizData(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: [{ path: 'root', message: 'Quiz data must be an object' }],
    };
  }

  const quizData = data as Record<string, unknown>;

  // Validate metadata
  if (!quizData.metadata || typeof quizData.metadata !== 'object') {
    errors.push({ path: 'metadata', message: 'metadata is required and must be an object' });
  } else {
    const metadata = quizData.metadata as Record<string, unknown>;
    
    if (typeof metadata.title !== 'string') {
      errors.push({ path: 'metadata.title', message: 'title must be a string' });
    }
    if (typeof metadata.description !== 'string') {
      errors.push({ path: 'metadata.description', message: 'description must be a string' });
    }
    if (typeof metadata.version !== 'string') {
      errors.push({ path: 'metadata.version', message: 'version must be a string' });
    }
    if (typeof metadata.totalSlides !== 'number') {
      errors.push({ path: 'metadata.totalSlides', message: 'totalSlides must be a number' });
    }
    
    // Optional fields
    if (metadata.author !== undefined && typeof metadata.author !== 'string') {
      errors.push({ path: 'metadata.author', message: 'author must be a string if provided' });
    }
    if (metadata.date !== undefined && typeof metadata.date !== 'string') {
      errors.push({ path: 'metadata.date', message: 'date must be a string if provided' });
    }
    if (metadata.tags !== undefined && !Array.isArray(metadata.tags)) {
      errors.push({ path: 'metadata.tags', message: 'tags must be an array if provided' });
    } else if (metadata.tags && Array.isArray(metadata.tags)) {
      metadata.tags.forEach((tag, i) => {
        if (typeof tag !== 'string') {
          errors.push({ path: `metadata.tags[${i}]`, message: 'each tag must be a string' });
        }
      });
    }
  }

  // Validate slides
  if (!Array.isArray(quizData.slides)) {
    errors.push({ path: 'slides', message: 'slides must be an array' });
  } else {
    quizData.slides.forEach((slide, index) => {
      validateSlide(slide, `slides[${index}]`, errors);
    });
  }

  // Validate optional resources
  if (quizData.resources !== undefined) {
    if (typeof quizData.resources !== 'object' || quizData.resources === null) {
      errors.push({ path: 'resources', message: 'resources must be an object if provided' });
    } else {
      const resources = quizData.resources as Record<string, unknown>;
      
      if (!Array.isArray(resources.images)) {
        errors.push({ path: 'resources.images', message: 'resources.images must be an array' });
      }
      
      if (typeof resources.icons !== 'object' || resources.icons === null) {
        errors.push({ path: 'resources.icons', message: 'resources.icons must be an object' });
      }
    }
  }

  // Validate optional quizConfig
  if (quizData.quizConfig !== undefined) {
    if (typeof quizData.quizConfig !== 'object' || quizData.quizConfig === null) {
      errors.push({ path: 'quizConfig', message: 'quizConfig must be an object if provided' });
    } else {
      const config = quizData.quizConfig as Record<string, unknown>;
      
      if (typeof config.passingScore !== 'number') {
        errors.push({ path: 'quizConfig.passingScore', message: 'passingScore must be a number' });
      }
      if (typeof config.totalPoints !== 'number') {
        errors.push({ path: 'quizConfig.totalPoints', message: 'totalPoints must be a number' });
      }
      if (typeof config.showExplanations !== 'boolean') {
        errors.push({ path: 'quizConfig.showExplanations', message: 'showExplanations must be a boolean' });
      }
      if (typeof config.allowRetry !== 'boolean') {
        errors.push({ path: 'quizConfig.allowRetry', message: 'allowRetry must be a boolean' });
      }
      if (typeof config.shuffleChoices !== 'boolean') {
        errors.push({ path: 'quizConfig.shuffleChoices', message: 'shuffleChoices must be a boolean' });
      }
      if (typeof config.showProgressBar !== 'boolean') {
        errors.push({ path: 'quizConfig.showProgressBar', message: 'showProgressBar must be a boolean' });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateSlide(slide: unknown, path: string, errors: ValidationError[]): void {
  if (!slide || typeof slide !== 'object') {
    errors.push({ path, message: 'slide must be an object' });
    return;
  }

  const slideObj = slide as Record<string, unknown>;

  if (slideObj.type !== 'content' && slideObj.type !== 'quiz') {
    errors.push({ path: `${path}.type`, message: 'slide type must be "content" or "quiz"' });
    return;
  }

  if (typeof slideObj.id !== 'string') {
    errors.push({ path: `${path}.id`, message: 'id must be a string' });
  }

  if (slideObj.type === 'content') {
    validateContentSlide(slideObj, path, errors);
  } else if (slideObj.type === 'quiz') {
    validateQuizSlide(slideObj, path, errors);
  }
}

function validateContentSlide(slide: Record<string, unknown>, path: string, errors: ValidationError[]): void {
  if (typeof slide.title !== 'string') {
    errors.push({ path: `${path}.title`, message: 'title must be a string' });
  }

  if (!Array.isArray(slide.content)) {
    errors.push({ path: `${path}.content`, message: 'content must be an array' });
  } else {
    slide.content.forEach((block, index) => {
      validateContentBlock(block, `${path}.content[${index}]`, errors);
    });
  }
}

function validateQuizSlide(slide: Record<string, unknown>, path: string, errors: ValidationError[]): void {
  if (typeof slide.question !== 'string') {
    errors.push({ path: `${path}.question`, message: 'question must be a string' });
  }

  if (!Array.isArray(slide.choices)) {
    errors.push({ path: `${path}.choices`, message: 'choices must be an array' });
  } else {
    slide.choices.forEach((choice, index) => {
      if (!choice || typeof choice !== 'object') {
        errors.push({ path: `${path}.choices[${index}]`, message: 'choice must be an object' });
      } else {
        const choiceObj = choice as Record<string, unknown>;
        if (typeof choiceObj.text !== 'string') {
          errors.push({ path: `${path}.choices[${index}].text`, message: 'choice text must be a string' });
        }
      }
    });
  }

  if (typeof slide.correctAnswerIndex !== 'number') {
    errors.push({ path: `${path}.correctAnswerIndex`, message: 'correctAnswerIndex must be a number' });
  }

  if (typeof slide.points !== 'number') {
    errors.push({ path: `${path}.points`, message: 'points must be a number' });
  }

  // Optional fields
  if (slide.explanation !== undefined && typeof slide.explanation !== 'string') {
    errors.push({ path: `${path}.explanation`, message: 'explanation must be a string if provided' });
  }

  if (slide.funFact !== undefined && typeof slide.funFact !== 'string') {
    errors.push({ path: `${path}.funFact`, message: 'funFact must be a string if provided' });
  }

  if (slide.timeLimit !== undefined && typeof slide.timeLimit !== 'number') {
    errors.push({ path: `${path}.timeLimit`, message: 'timeLimit must be a number if provided' });
  }

  if (slide.relatedAnnouncementId !== undefined && typeof slide.relatedAnnouncementId !== 'string') {
    errors.push({ path: `${path}.relatedAnnouncementId`, message: 'relatedAnnouncementId must be a string if provided' });
  }
}

function validateContentBlock(block: unknown, path: string, errors: ValidationError[]): void {
  if (!block || typeof block !== 'object') {
    errors.push({ path, message: 'content block must be an object' });
    return;
  }

  const blockObj = block as Record<string, unknown>;
  const validTypes = ['text', 'image', 'icon', 'list', 'stat', 'callout', 'quote', 'grid'];

  if (!validTypes.includes(blockObj.type as string)) {
    errors.push({ path: `${path}.type`, message: `content block type must be one of: ${validTypes.join(', ')}` });
    return;
  }

  switch (blockObj.type) {
    case 'text':
      if (typeof blockObj.text !== 'string') {
        errors.push({ path: `${path}.text`, message: 'text must be a string' });
      }
      break;
    case 'image':
      if (typeof blockObj.src !== 'string') {
        errors.push({ path: `${path}.src`, message: 'src must be a string' });
      }
      if (typeof blockObj.alt !== 'string') {
        errors.push({ path: `${path}.alt`, message: 'alt must be a string' });
      }
      break;
    case 'icon':
      if (blockObj.iconType !== 'aws' && blockObj.iconType !== 'lucide') {
        errors.push({ path: `${path}.iconType`, message: 'iconType must be "aws" or "lucide"' });
      }
      if (typeof blockObj.iconName !== 'string') {
        errors.push({ path: `${path}.iconName`, message: 'iconName must be a string' });
      }
      break;
    case 'list':
      if (!Array.isArray(blockObj.items)) {
        errors.push({ path: `${path}.items`, message: 'items must be an array' });
      } else {
        blockObj.items.forEach((item, i) => {
          if (typeof item !== 'string') {
            errors.push({ path: `${path}.items[${i}]`, message: 'list item must be a string' });
          }
        });
      }
      if (blockObj.title !== undefined && typeof blockObj.title !== 'string') {
        errors.push({ path: `${path}.title`, message: 'title must be a string if provided' });
      }
      break;
    case 'stat':
      if (typeof blockObj.value !== 'string') {
        errors.push({ path: `${path}.value`, message: 'value must be a string' });
      }
      if (typeof blockObj.label !== 'string') {
        errors.push({ path: `${path}.label`, message: 'label must be a string' });
      }
      break;
    case 'callout':
      if (typeof blockObj.text !== 'string') {
        errors.push({ path: `${path}.text`, message: 'text must be a string' });
      }
      if (!['info', 'success', 'warning'].includes(blockObj.style as string)) {
        errors.push({ path: `${path}.style`, message: 'style must be "info", "success", or "warning"' });
      }
      break;
    case 'quote':
      if (typeof blockObj.text !== 'string') {
        errors.push({ path: `${path}.text`, message: 'text must be a string' });
      }
      if (typeof blockObj.author !== 'string') {
        errors.push({ path: `${path}.author`, message: 'author must be a string' });
      }
      break;
    case 'grid':
      if (typeof blockObj.columns !== 'number') {
        errors.push({ path: `${path}.columns`, message: 'columns must be a number' });
      }
      if (!Array.isArray(blockObj.items)) {
        errors.push({ path: `${path}.items`, message: 'items must be an array' });
      } else {
        blockObj.items.forEach((item, i) => {
          if (!item || typeof item !== 'object') {
            errors.push({ path: `${path}.items[${i}]`, message: 'grid item must be an object' });
          } else {
            const gridItem = item as Record<string, unknown>;
            if (typeof gridItem.title !== 'string') {
              errors.push({ path: `${path}.items[${i}].title`, message: 'title must be a string' });
            }
          }
        });
      }
      break;
  }
}
