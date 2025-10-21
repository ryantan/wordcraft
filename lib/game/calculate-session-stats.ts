/**
 * Session Stats Calculation
 *
 * Helper function to calculate session statistics for story mode finale
 */

import type { GameResult } from '@/types/game';
import type { SessionStats } from '@/types/session';
import type { WordStats } from '@/types/story';

/**
 * Calculate session statistics from word stats and game results
 *
 * @param wordStats - Map of word statistics tracked during session
 * @param gameResults - Array of game results from the session
 * @param sessionStartTime - Timestamp when session started (milliseconds)
 * @returns SessionStats object with calculated metrics
 *
 * @example
 * ```typescript
 * const stats = calculateSessionStats(
 *   wordStatsMap,
 *   gameResultsArray,
 *   Date.now() - 300000 // 5 minutes ago
 * )
 * console.log(stats.wordsMastered) // 8
 * console.log(stats.timeSpent) // 300 (seconds)
 * ```
 */
export function calculateSessionStats(
  wordStats: Map<string, WordStats>,
  gameResults: GameResult[],
  sessionStartTime: number,
): SessionStats {
  // Calculate total words
  const totalWords = wordStats.size;

  // Calculate words mastered (confidence >= 80)
  const wordsMastered = Array.from(wordStats.values()).filter(
    stats => stats.confidence >= 80,
  ).length;

  // Calculate average confidence
  const confidenceValues = Array.from(wordStats.values()).map(stats => stats.confidence);
  const averageConfidence =
    confidenceValues.length > 0
      ? confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length
      : 0;

  // Calculate games played
  const gamesPlayed = gameResults.length;

  // Calculate time spent (convert milliseconds to seconds)
  const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

  return {
    totalWords,
    wordsMastered,
    gamesPlayed,
    timeSpent,
    averageConfidence,
  };
}

/**
 * Format time in seconds to human-readable string
 *
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "5m 30s", "2m", "45s")
 *
 * @example
 * ```typescript
 * formatTime(45) // "45s"
 * formatTime(120) // "2m"
 * formatTime(325) // "5m 25s"
 * ```
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  } else if (remainingSeconds === 0) {
    return `${minutes}m`;
  } else {
    return `${minutes}m ${remainingSeconds}s`;
  }
}
