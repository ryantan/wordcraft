/**
 * Game Session Management
 *
 * Handles initialization of game sessions with adaptive word selection.
 */

import { initializeWordReview } from '@/lib/algorithms/spaced-repetition';
import { getAllReviewData, saveWordReviewData } from '@/lib/storage/sessionStorage';
import type { GameResult, WordList } from '@/types';

export interface SessionConfig {
  wordPool: string[];
  sessionPerformance: Map<string, GameResult[]>;
}

/**
 * Initialize a new game session
 *
 * Each session includes ALL words from the word list.
 * Historical data is used for:
 * - Long-term spaced repetition scheduling (when to review in future sessions)
 * - Initializing review data for tracking
 *
 * Within-session confidence and word selection is based ONLY on
 * current session performance, not historical data.
 *
 * @param wordList The word list to practice
 * @returns Configuration for the new session
 */
export function initializeGameSession(wordList: WordList): SessionConfig {
  // Initialize review data for any new words (for spaced repetition tracking)
  const allReviewData = getAllReviewData();

  wordList.words.forEach(word => {
    if (!allReviewData.has(word)) {
      const reviewData = initializeWordReview(word);
      saveWordReviewData(reviewData);
      allReviewData.set(word, reviewData);
    }
  });

  // Always include all words in the session
  // Word repetition will be determined by current session performance
  return {
    wordPool: wordList.words,
    sessionPerformance: new Map(),
  };
}
