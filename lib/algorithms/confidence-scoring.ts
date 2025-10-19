/**
 * Confidence Scoring Algorithm
 *
 * Calculates a confidence score (0-100%) for each word based on historical performance.
 * Uses a weighted average that emphasizes recent attempts over older ones.
 */

import type { GameResult } from '@/types'

export interface WordConfidence {
  word: string
  score: number // 0-100
  level: 'needs-work' | 'progressing' | 'mastered'
  totalAttempts: number
  lastPracticed: Date
}

/**
 * Confidence thresholds
 */
export const CONFIDENCE_THRESHOLDS = {
  NEEDS_WORK: 60,
  MASTERED: 80,
} as const

/**
 * Calculate confidence score for a word based on game results
 *
 * Algorithm:
 * - Recent results are weighted more heavily (exponential decay)
 * - Each result contributes based on: correctness, attempts, and recency
 * - Perfect first-attempt answers boost confidence more
 * - Multiple attempts or hints reduce confidence gain
 */
export function calculateWordConfidence(
  word: string,
  results: GameResult[]
): WordConfidence {
  // Filter results for this specific word
  const wordResults = results.filter(r => r.word.toLowerCase() === word.toLowerCase())

  // Handle edge case: no history
  if (wordResults.length === 0) {
    return {
      word,
      score: 0,
      level: 'needs-work',
      totalAttempts: 0,
      lastPracticed: new Date(),
    }
  }

  // Sort by completion date (oldest first)
  const sortedResults = [...wordResults].sort(
    (a, b) => a.completedAt.getTime() - b.completedAt.getTime()
  )

  // Calculate weighted confidence
  let weightedSum = 0
  let totalWeight = 0

  sortedResults.forEach((result, index) => {
    // Recency weight: more recent results get higher weight
    // Using exponential decay: newer items get weight closer to 1
    const recencyWeight = Math.pow(0.7, sortedResults.length - index - 1)

    // Performance score for this result (0-100)
    const performanceScore = calculateResultScore(result)

    weightedSum += performanceScore * recencyWeight
    totalWeight += recencyWeight
  })

  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0

  return {
    word,
    score: Math.max(0, Math.min(100, score)), // Clamp to 0-100
    level: getConfidenceLevel(score),
    totalAttempts: wordResults.length,
    lastPracticed: sortedResults[sortedResults.length - 1].completedAt,
  }
}

/**
 * Calculate a performance score for a single game result
 *
 * Factors:
 * - Correctness (must be correct to earn any points)
 * - Attempts (fewer is better)
 * - Hints used (fewer is better)
 * - Time taken (faster is slightly better)
 */
function calculateResultScore(result: GameResult): number {
  if (!result.correct) {
    return 0 // Incorrect answers contribute 0
  }

  // Base score for being correct
  let score = 100

  // Penalty for multiple attempts (each attempt after first reduces score)
  if (result.attempts > 1) {
    const attemptPenalty = Math.min(30, (result.attempts - 1) * 10)
    score -= attemptPenalty
  }

  // Penalty for using hints (each hint reduces score)
  if (result.hintsUsed > 0) {
    const hintPenalty = Math.min(30, result.hintsUsed * 10)
    score -= hintPenalty
  }

  // Small penalty for very slow responses (>60 seconds)
  const timeSeconds = result.timeMs / 1000
  if (timeSeconds > 60) {
    const timePenalty = Math.min(10, (timeSeconds - 60) / 10)
    score -= timePenalty
  }

  return Math.max(0, score)
}

/**
 * Determine confidence level based on score
 */
export function getConfidenceLevel(
  score: number
): 'needs-work' | 'progressing' | 'mastered' {
  if (score < CONFIDENCE_THRESHOLDS.NEEDS_WORK) {
    return 'needs-work'
  } else if (score < CONFIDENCE_THRESHOLDS.MASTERED) {
    return 'progressing'
  } else {
    return 'mastered'
  }
}

/**
 * Calculate confidence scores for all words in a list
 */
export function calculateAllConfidences(
  words: string[],
  results: GameResult[]
): Map<string, WordConfidence> {
  const confidenceMap = new Map<string, WordConfidence>()

  words.forEach(word => {
    const confidence = calculateWordConfidence(word, results)
    confidenceMap.set(word.toLowerCase(), confidence)
  })

  return confidenceMap
}

/**
 * Get words that need more practice (confidence < threshold)
 */
export function getWordsNeedingPractice(
  confidences: Map<string, WordConfidence>,
  threshold: number = CONFIDENCE_THRESHOLDS.NEEDS_WORK
): string[] {
  return Array.from(confidences.values())
    .filter(c => c.score < threshold)
    .sort((a, b) => a.score - b.score) // Lowest confidence first
    .map(c => c.word)
}

/**
 * Get mastered words (confidence >= threshold)
 */
export function getMasteredWords(
  confidences: Map<string, WordConfidence>,
  threshold: number = CONFIDENCE_THRESHOLDS.MASTERED
): string[] {
  return Array.from(confidences.values())
    .filter(c => c.score >= threshold)
    .map(c => c.word)
}
