/**
 * Word Selection Logic
 *
 * Intelligently selects the next word to practice based on session performance.
 * Ensures all words are practiced at least once before repetition.
 */

import type { GameResult } from '@/types'

export interface WordScore {
  word: string
  score: number
}

/**
 * Select the next word to practice based on session performance
 *
 * Two-phase approach:
 * 1. First, ensure all words are practiced at least once
 * 2. Then prioritize struggling words for repetition
 *
 * @param wordPool Available words for this session
 * @param sessionPerformance Performance data for each word in current session
 * @param currentWord Currently displayed word (to avoid immediate repeats)
 * @returns Next word to practice, or null if pool is empty
 */
export function selectNextWord(
  wordPool: string[],
  sessionPerformance: Map<string, GameResult[]>,
  currentWord: string | null
): string | null {
  if (wordPool.length === 0) return null

  // Phase 1: Prioritize unpracticed words
  const unpracticedWords = wordPool.filter(word => {
    const performance = sessionPerformance.get(word)
    return !performance || performance.length === 0
  })

  if (unpracticedWords.length > 0) {
    // Avoid immediate repeat if possible
    if (unpracticedWords.length > 1 && currentWord && unpracticedWords.includes(currentWord)) {
      const otherWords = unpracticedWords.filter(w => w !== currentWord)
      return otherWords[0]
    }
    return unpracticedWords[0]
  }

  // Phase 2: All words practiced at least once - prioritize by performance
  const wordScores = calculateWordScores(wordPool, sessionPerformance)

  // Sort by priority (lowest score = highest priority for practice)
  wordScores.sort((a, b) => a.score - b.score)

  // Avoid immediate repeats if possible
  if (currentWord && wordScores.length > 1 && wordScores[0].word === currentWord) {
    return wordScores[1].word
  }

  return wordScores[0].word
}

/**
 * Calculate priority scores for each word based on session performance
 *
 * Lower score = higher priority for repetition
 *
 * Factors:
 * - Multiple attempts: -20 per extra attempt
 * - Hints used: -15 per hint
 * - Recent poor performance: -20
 * - Already practiced multiple times: -5 per practice
 */
function calculateWordScores(
  wordPool: string[],
  sessionPerformance: Map<string, GameResult[]>
): WordScore[] {
  return wordPool.map(word => {
    const performance = sessionPerformance.get(word) || []

    // Calculate average performance
    const avgAttempts = performance.reduce((sum, r) => sum + r.attempts, 0) / performance.length
    const avgHints = performance.reduce((sum, r) => sum + r.hintsUsed, 0) / performance.length
    const recentResult = performance[performance.length - 1]

    // Lower score = struggled = higher priority for repetition
    let priorityScore = 100
    priorityScore -= (avgAttempts - 1) * 20 // Extra attempts penalty
    priorityScore -= avgHints * 15 // Hints penalty

    // Recent poor performance
    if (recentResult.attempts > 1) {
      priorityScore -= 20
    }

    // Reduce priority if practiced many times (give other words a chance)
    priorityScore -= performance.length * 5

    return { word, score: Math.max(0, priorityScore) }
  })
}
