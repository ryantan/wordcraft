/**
 * Difficulty Adjustment Algorithm
 *
 * Dynamically adjusts game difficulty based on recent performance to maintain
 * optimal challenge level (70-80% success rate).
 */

import type { GameResult, GameDifficulty } from '@/types'

/**
 * Calculate appropriate difficulty level based on recent performance
 *
 * Algorithm:
 * - Analyzes last 3-5 game attempts for the current word
 * - Consecutive successes → increase difficulty (gradually)
 * - Consecutive failures → decrease difficulty (quickly)
 * - Target: 70-80% success rate for optimal learning
 *
 * @param wordResults Recent results for a specific word (most recent last)
 * @param currentDifficulty Current difficulty level
 * @returns Recommended difficulty level
 */
export function calculateDifficulty(
  wordResults: GameResult[],
  currentDifficulty: GameDifficulty = 'medium'
): GameDifficulty {
  // Not enough data - start with medium
  if (wordResults.length === 0) {
    return 'medium'
  }

  // Look at last 3-5 attempts (recent performance)
  const recentResults = wordResults.slice(-5)
  const recentCount = recentResults.length

  // Calculate success metrics
  const successCount = recentResults.filter(r => r.correct && r.attempts === 1).length
  const successRate = successCount / recentCount

  // Check for consecutive patterns
  const lastThree = recentResults.slice(-3)
  const consecutiveSuccesses = lastThree.every(r => r.correct && r.attempts === 1)
  const consecutiveFailures = lastThree.every(r => !r.correct || r.attempts > 1)

  // Calculate average performance indicators
  const avgAttempts = recentResults.reduce((sum, r) => sum + r.attempts, 0) / recentCount
  const avgHints = recentResults.reduce((sum, r) => sum + r.hintsUsed, 0) / recentCount

  // Difficulty adjustment logic
  if (currentDifficulty === 'easy') {
    // From easy: need strong performance to move up
    if (successRate >= 0.8 && consecutiveSuccesses) {
      return 'medium'
    }
    return 'easy'
  } else if (currentDifficulty === 'medium') {
    // From medium: can move up or down
    if (consecutiveFailures || successRate < 0.5 || avgAttempts > 2 || avgHints > 1) {
      return 'easy' // Struggling - make it easier
    } else if (consecutiveSuccesses && successRate >= 0.85 && avgHints === 0) {
      return 'hard' // Excelling - increase challenge
    }
    return 'medium'
  } else {
    // From hard: quick to ease if struggling
    if (successRate < 0.6 || avgAttempts > 1.5 || avgHints > 0.5) {
      return 'medium' // Too hard - ease back
    }
    return 'hard'
  }
}

/**
 * Get initial difficulty for a word based on word characteristics
 *
 * Factors:
 * - Word length (shorter = easier)
 * - Character complexity (simple letters vs similar-looking letters)
 *
 * @param word The word to analyze
 * @returns Initial difficulty level
 */
export function getInitialDifficulty(word: string): GameDifficulty {
  const cleanWord = word.replace(/\s/g, '') // Remove spaces
  const length = cleanWord.length

  // Very short words start easy
  if (length <= 3) {
    return 'easy'
  }

  // Long words start medium (not hard - avoid discouragement)
  if (length >= 8) {
    return 'medium'
  }

  // Check for tricky letter patterns
  const trickyPatterns = [
    /ie|ei/, // i before e confusion
    /ph|gh/, // unusual phonics
    /ough|augh/, // complex patterns
    /c[ei]|g[ei]/, // soft c/g
    /[aeiou]{2,}/, // vowel clusters
  ]

  const hasTrickyPattern = trickyPatterns.some(pattern => pattern.test(cleanWord.toLowerCase()))

  if (hasTrickyPattern) {
    return 'medium'
  }

  // Default: medium for most words
  return 'medium'
}

/**
 * Determine if difficulty should be locked at current level
 *
 * Sometimes we want to keep difficulty stable for consistency
 * (e.g., during initial learning phase)
 *
 * @param wordResults All results for the word
 * @returns True if difficulty should be locked
 */
export function shouldLockDifficulty(wordResults: GameResult[]): boolean {
  // Lock difficulty if we don't have enough data (first 2 attempts)
  return wordResults.length < 2
}

/**
 * Get difficulty adjustment explanation (for debugging/analytics)
 *
 * @param wordResults Recent results
 * @param oldDifficulty Previous difficulty
 * @param newDifficulty New difficulty
 * @returns Human-readable explanation
 */
export function getDifficultyRationale(
  wordResults: GameResult[],
  oldDifficulty: GameDifficulty,
  newDifficulty: GameDifficulty
): string {
  if (oldDifficulty === newDifficulty) {
    return 'Difficulty maintained - performance is appropriate'
  }

  const recentResults = wordResults.slice(-3)
  const successRate = recentResults.filter(r => r.correct && r.attempts === 1).length / recentResults.length

  if (newDifficulty === 'easy') {
    return `Difficulty reduced to easy - success rate ${(successRate * 100).toFixed(0)}% indicates struggle`
  } else if (newDifficulty === 'hard') {
    return `Difficulty increased to hard - consistent strong performance (${(successRate * 100).toFixed(0)}% success)`
  } else {
    return `Difficulty adjusted to medium - balancing challenge level`
  }
}
