/**
 * Word Statistics Management
 *
 * Tracks word-level performance during story mode sessions
 * Used for Stage 2 mastery phase to identify low-confidence words
 */

import type { WordStats } from '@/types/story';

/**
 * Initialize word stats for all words in the list
 *
 * @param words - Array of words to track
 * @returns Map of word to initial stats
 */
export function initializeWordStats(words: string[]): Map<string, WordStats> {
  const statsMap = new Map<string, WordStats>();

  for (const word of words) {
    statsMap.set(word, {
      word,
      confidence: 50, // Start at neutral
      errors: 0,
      hints: 0,
      timeSpent: 0,
      streak: 0,
      lastPracticed: new Date(),
      attemptsCount: 0,
    });
  }

  return statsMap;
}

/**
 * Update word stats after a game completion
 *
 * @param stats - Current word stats
 * @param result - Game result data
 * @returns Updated word stats
 */
export function updateWordStats(
  stats: WordStats,
  result: {
    isCorrect: boolean;
    timeSpent: number;
    hintsUsed: number;
    errors: number;
  },
): WordStats {
  const updated = { ...stats };

  // Update counters
  updated.errors += result.errors;
  updated.hints += result.hintsUsed;
  updated.timeSpent += result.timeSpent;
  updated.attemptsCount += 1;
  updated.lastPracticed = new Date();

  // Update streak
  if (result.isCorrect) {
    updated.streak += 1;
  } else {
    updated.streak = 0;
  }

  // Recalculate confidence
  updated.confidence = calculateConfidence(updated, result);

  return updated;
}

/**
 * Calculate confidence score based on performance
 *
 * Factors:
 * - Correctness (weighted heavily)
 * - Errors count
 * - Hints used
 * - Time efficiency
 * - Current streak
 * - Number of attempts
 *
 * @param stats - Current word stats
 * @param result - Latest game result
 * @returns Confidence score (0-100)
 */
function calculateConfidence(
  stats: WordStats,
  result: {
    isCorrect: boolean;
    timeSpent: number;
    hintsUsed: number;
    errors: number;
  },
): number {
  let confidence = stats.confidence;

  // Correctness impact (±15 points)
  if (result.isCorrect) {
    confidence += 15;
  } else {
    confidence -= 20;
  }

  // Errors impact (-5 per error, up to -15)
  confidence -= Math.min(result.errors * 5, 15);

  // Hints impact (-3 per hint, up to -9)
  confidence -= Math.min(result.hintsUsed * 3, 9);

  // Streak bonus (+2 per streak level, up to +10)
  if (stats.streak > 0) {
    confidence += Math.min(stats.streak * 2, 10);
  }

  // Time efficiency bonus/penalty
  // Fast completion (< 10s): +5
  // Slow completion (> 30s): -5
  if (result.timeSpent < 10000) {
    confidence += 5;
  } else if (result.timeSpent > 30000) {
    confidence -= 5;
  }

  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, confidence));
}

/**
 * Calculate overall difficulty score for a word
 * Higher score = more difficult, needs more practice
 *
 * Used to prioritize which words need Stage 2 practice
 *
 * @param stats - Word statistics
 * @returns Difficulty score (0-100, higher = more difficult)
 */
export function calculateDifficultyScore(stats: WordStats): number {
  // Invert confidence (low confidence = high difficulty)
  let difficulty = 100 - stats.confidence;

  // Increase difficulty based on errors
  difficulty += stats.errors * 3;

  // Increase difficulty if hints were needed
  difficulty += stats.hints * 2;

  // Decrease difficulty if there's a good streak
  difficulty -= Math.min(stats.streak * 5, 20);

  // Recent practice reduces perceived difficulty
  const hoursSinceLastPractice = (Date.now() - stats.lastPracticed.getTime()) / (1000 * 60 * 60);
  if (hoursSinceLastPractice < 1) {
    difficulty -= 10;
  }

  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, difficulty));
}

/**
 * Get words that need more practice (low confidence)
 * Used to determine which words should appear in Stage 2
 *
 * @param wordStats - Map of all word statistics
 * @param threshold - Confidence threshold (default: 70)
 * @returns Array of words needing practice, sorted by difficulty
 */
export function getWordsNeedingPractice(
  wordStats: Map<string, WordStats>,
  threshold: number = 70,
): string[] {
  const needsPractice: Array<{ word: string; difficulty: number }> = [];

  for (const [word, stats] of wordStats.entries()) {
    if (stats.confidence < threshold) {
      needsPractice.push({
        word,
        difficulty: calculateDifficultyScore(stats),
      });
    }
  }

  // Sort by difficulty (highest first)
  needsPractice.sort((a, b) => b.difficulty - a.difficulty);

  return needsPractice.map(item => item.word);
}

/**
 * Check if all words have reached mastery level
 *
 * @param wordStats - Map of all word statistics
 * @param masteryThreshold - Confidence threshold for mastery (default: 80)
 * @returns True if all words are mastered
 */
export function allWordsMastered(
  wordStats: Map<string, WordStats>,
  masteryThreshold: number = 80,
): boolean {
  for (const stats of wordStats.values()) {
    if (stats.confidence < masteryThreshold) {
      return false;
    }
  }
  return true;
}

/**
 * Get summary statistics for all words
 *
 * @param wordStats - Map of all word statistics
 * @returns Summary object
 */
export function getWordStatsSummary(wordStats: Map<string, WordStats>): {
  totalWords: number;
  masteredWords: number;
  averageConfidence: number;
  totalAttempts: number;
  totalErrors: number;
} {
  let totalConfidence = 0;
  let masteredCount = 0;
  let totalAttempts = 0;
  let totalErrors = 0;

  for (const stats of wordStats.values()) {
    totalConfidence += stats.confidence;
    totalAttempts += stats.attemptsCount;
    totalErrors += stats.errors;

    if (stats.confidence >= 80) {
      masteredCount++;
    }
  }

  const totalWords = wordStats.size;

  return {
    totalWords,
    masteredWords: masteredCount,
    averageConfidence: totalWords > 0 ? totalConfidence / totalWords : 0,
    totalAttempts,
    totalErrors,
  };
}
