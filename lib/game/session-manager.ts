/**
 * Game Session Management
 *
 * Handles initialization of game sessions with adaptive word selection.
 */

import type { WordList } from '@/types'
import { calculateAllConfidences } from '@/lib/algorithms/confidence-scoring'
import { initializeWordReview } from '@/lib/algorithms/spaced-repetition'
import {
  getAllGameResults,
  getAllReviewData,
  saveWordReviewData,
} from '@/lib/storage/sessionStorage'

export interface SessionConfig {
  wordPool: string[]
  sessionPerformance: Map<string, any[]>
}

/**
 * Initialize a new game session
 *
 * Creates the word pool for this session by:
 * 1. Identifying struggling words (low confidence)
 * 2. Finding words due for review (spaced repetition)
 * 3. Falling back to all words if no priority words exist
 *
 * @param wordList The word list to practice
 * @returns Configuration for the new session
 */
export function initializeGameSession(wordList: WordList): SessionConfig {
  // Load historical data
  const allResults = getAllGameResults()
  let allReviewData = getAllReviewData()

  // Initialize review data for any new words
  wordList.words.forEach(word => {
    if (!allReviewData.has(word)) {
      const reviewData = initializeWordReview(word)
      saveWordReviewData(reviewData)
      allReviewData.set(word, reviewData)
    }
  })

  // Calculate confidence scores
  const confidences = calculateAllConfidences(wordList.words, allResults)

  // Identify struggling words (needs-work level)
  const strugglingWords = wordList.words.filter(word => {
    const confidence = confidences.get(word)
    return confidence && confidence.level === 'needs-work'
  })

  // Identify words due for review
  const dueWords = wordList.words.filter(word => {
    const reviewData = allReviewData.get(word)
    if (!reviewData) return false
    return reviewData.nextReviewDate <= new Date()
  })

  // Combine and dedupe (struggling words get highest priority)
  const priorityWords = Array.from(new Set([...strugglingWords, ...dueWords]))

  // Create word pool: use priority words if available, otherwise all words
  const wordPool = priorityWords.length > 0 ? priorityWords : wordList.words

  return {
    wordPool,
    sessionPerformance: new Map(),
  }
}
