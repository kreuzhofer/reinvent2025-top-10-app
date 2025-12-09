import { useState, useEffect } from 'react';
import type { QuizData } from '../types/quiz.types';
import { validateQuizData } from '../utils/validateQuizData';

interface UseQuizDataResult {
  data: QuizData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to load and validate quiz data from JSON file
 * Requirements: 4.1, 4.2, 4.3
 */
export function useQuizData(dataPath: string = '/data/quiz-data.json'): UseQuizDataResult {
  const [data, setData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the JSON file with cache-busting in development
        const cacheBuster = import.meta.env.DEV ? `?t=${Date.now()}` : '';
        const response = await fetch(`${dataPath}${cacheBuster}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load quiz data: ${response.statusText}`);
        }

        const jsonData = await response.json();

        // Validate the data
        const validationResult = validateQuizData(jsonData);

        if (!validationResult.valid) {
          const errorMessages = validationResult.errors
            .map(err => `${err.path}: ${err.message}`)
            .join('; ');
          throw new Error(`Invalid quiz data: ${errorMessages}`);
        }

        setData(jsonData as QuizData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [dataPath]);

  return { data, loading, error };
}
