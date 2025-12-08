import type { QuizChoice } from '../types/quiz.types';

/**
 * Shuffles quiz choices while maintaining the correct answer index
 * 
 * @param choices - Array of quiz choices
 * @param correctAnswerIndex - Index of the correct answer in the original array
 * @returns Object containing shuffled choices and new correct answer index
 */
export function shuffleChoices(
  choices: QuizChoice[],
  correctAnswerIndex: number
): { shuffledChoices: QuizChoice[]; newCorrectIndex: number } {
  // Create array of indices
  const indices = choices.map((_, index) => index);
  
  // Fisher-Yates shuffle algorithm
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  // Map shuffled indices to choices
  const shuffledChoices = indices.map(index => choices[index]);
  
  // Find new position of correct answer
  const newCorrectIndex = indices.indexOf(correctAnswerIndex);
  
  return { shuffledChoices, newCorrectIndex };
}
