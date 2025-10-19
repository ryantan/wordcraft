/**
 * Session Performance Tracking
 *
 * Tracks performance during a game session and updates adaptive learning data.
 */

import type { GameResult } from '@/types'
import { calculateAllConfidences } from '@/lib/algorithms/confidence-scoring'
import { updateWordReview } from '@/lib/algorithms/spaced-repetition'
import { detectLearningStyle } from '@/lib/algorithms/learning-style-detection'
import {
  saveGameResult,
  getAllGameResults,
  getAllReviewData,
  saveWordReviewData,
  saveLearningProfile,
} from '@/lib/storage/sessionStorage'

/**
 * Process a completed game round
 *
 * Updates all adaptive learning systems:
 * 1. Saves result to storage
 * 2. Updates spaced repetition data
 * 3. Updates learning style profile
 *
 * @param result The completed game result
 */
export function processGameCompletion(result: GameResult): void {
  // Save result to storage
  saveGameResult(result)

  // Update spaced repetition review data
  const allResults = getAllGameResults()
  const confidences = calculateAllConfidences([result.word], allResults)
  const confidence = confidences.get(result.word)

  if (confidence) {
    const allReviewData = getAllReviewData()
    const existingReview = allReviewData.get(result.word)

    if (existingReview) {
      const updatedReview = updateWordReview(existingReview, confidence)
      saveWordReviewData(updatedReview)
    }
  }

  // Update learning style profile
  const profile = detectLearningStyle(allResults)
  saveLearningProfile(profile)
}

/**
 * Calculate session statistics
 *
 * @param results All results from the session
 * @returns Statistics about the session
 */
export function calculateSessionStats(results: GameResult[]) {
  const totalTime = results.reduce((sum, r) => sum + r.timeMs, 0)
  const totalHints = results.reduce((sum, r) => sum + r.hintsUsed, 0)
  const avgTime = Math.round(totalTime / results.length / 1000)

  // Get unique words and their practice counts
  const uniqueWords = Array.from(new Set(results.map(r => r.word)))
  const wordPracticeCounts = uniqueWords.map(word => {
    const wordResults = results.filter(r => r.word === word)
    const totalWordAttempts = wordResults.reduce((sum, r) => sum + r.attempts, 0)
    const avgWordAttempts = totalWordAttempts / wordResults.length
    const totalWordTime = wordResults.reduce((sum, r) => sum + r.timeMs, 0)

    return {
      word,
      count: wordResults.length,
      results: wordResults,
      avgAttempts: avgWordAttempts,
      avgTime: Math.round(totalWordTime / wordResults.length / 1000),
    }
  })

  return {
    totalRounds: results.length,
    uniqueWords: uniqueWords.length,
    avgTime,
    totalHints,
    wordPracticeCounts,
  }
}
