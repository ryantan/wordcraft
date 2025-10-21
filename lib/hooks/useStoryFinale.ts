/**
 * useStoryFinale Hook
 *
 * Calculates when to show story finale and computes session statistics
 */

'use client';

import { calculateSessionStats } from '@/lib/game/calculate-session-stats';
import type { GameResult } from '@/types/game';
import type { SessionStats } from '@/types/session';
import type { WordStats } from '@/types/story';
import { useMemo } from 'react';

export interface UseStoryFinaleReturn {
  /**
   * Whether the finale should be shown (all words mastered)
   */
  shouldShowFinale: boolean;

  /**
   * Calculated session statistics
   */
  stats: SessionStats;
}

/**
 * Hook to determine when to show story finale and calculate session stats
 *
 * @param wordStats Map of word statistics for the session
 * @param gameResults Array of game results from the session
 * @param sessionStartTime Timestamp when session started (milliseconds)
 * @returns Object with shouldShowFinale flag and calculated stats
 *
 * @example
 * ```typescript
 * function StorySession() {
 *   const [wordStats, setWordStats] = useState(new Map())
 *   const [gameResults, setGameResults] = useState([])
 *   const sessionStart = useRef(Date.now())
 *
 *   const { shouldShowFinale, stats } = useStoryFinale(
 *     wordStats,
 *     gameResults,
 *     sessionStart.current
 *   )
 *
 *   if (shouldShowFinale) {
 *     return <StoryFinale stats={stats} />
 *   }
 *   return <GamePlay />
 * }
 * ```
 */
export function useStoryFinale(
  wordStats: Map<string, WordStats>,
  gameResults: GameResult[],
  sessionStartTime: number,
): UseStoryFinaleReturn {
  // Calculate session stats (memoized to prevent unnecessary recalculations)
  const stats = useMemo(
    () => calculateSessionStats(wordStats, gameResults, sessionStartTime),
    [wordStats, gameResults, sessionStartTime],
  );

  // Determine if finale should be shown (all words >= 80% confidence)
  const shouldShowFinale = useMemo(() => {
    if (wordStats.size === 0) return false;

    return Array.from(wordStats.values()).every(wordStat => wordStat.confidence >= 80);
  }, [wordStats]);

  return {
    shouldShowFinale,
    stats,
  };
}
