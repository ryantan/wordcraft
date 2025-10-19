/**
 * Learning Style Detection
 *
 * Analyzes game performance across different game types to detect
 * whether a child learns best through visual, auditory, or kinesthetic methods.
 */

import type { GameResult, GameMechanicId } from '@/types'

export type LearningStyleType = 'visual' | 'auditory' | 'kinesthetic'

export interface LearningStyleProfile {
  visual: number // 0-100
  auditory: number // 0-100
  kinesthetic: number // 0-100
  primary: LearningStyleType
  secondary: LearningStyleType | null
  confidence: 'low' | 'medium' | 'high'
  sampleSize: number
}

export interface StylePerformance {
  style: LearningStyleType
  successRate: number
  averageAttempts: number
  averageTimeMs: number
  gamesPlayed: number
}

/**
 * Map game mechanics to learning styles
 */
const GAME_STYLE_MAP: Record<GameMechanicId, LearningStyleType> = {
  // Visual learners: see patterns, letters, pictures
  'letter-matching': 'visual',
  'missing-letters': 'visual',
  'picture-reveal': 'visual',

  // Auditory learners: hear/say words, sound-based
  'spelling-challenge': 'auditory',

  // Kinesthetic learners: interactive, movement, building
  'word-scramble': 'kinesthetic',
  'letter-hunt': 'kinesthetic',
  'trace-write': 'kinesthetic',
  'word-building': 'kinesthetic',
}

/**
 * Minimum number of results needed for confident detection
 */
const MIN_RESULTS_FOR_DETECTION = 12

/**
 * Calculate performance metrics for each learning style
 */
export function calculateStylePerformances(results: GameResult[]): StylePerformance[] {
  // Group results by learning style
  const styleGroups = new Map<LearningStyleType, GameResult[]>()

  results.forEach(result => {
    const style = GAME_STYLE_MAP[result.mechanicId as keyof typeof GAME_STYLE_MAP]
    if (style) {
      const existing = styleGroups.get(style) || []
      styleGroups.set(style, [...existing, result])
    }
  })

  // Calculate performance for each style
  const performances: StylePerformance[] = []

  const styles: LearningStyleType[] = ['visual', 'auditory', 'kinesthetic']

  styles.forEach(style => {
    const styleResults = styleGroups.get(style) || []

    if (styleResults.length === 0) {
      performances.push({
        style,
        successRate: 0,
        averageAttempts: 0,
        averageTimeMs: 0,
        gamesPlayed: 0,
      })
      return
    }

    const successRate =
      (styleResults.filter(r => r.correct).length / styleResults.length) * 100

    const averageAttempts =
      styleResults.reduce((sum, r) => sum + r.attempts, 0) / styleResults.length

    const averageTimeMs =
      styleResults.reduce((sum, r) => sum + r.timeMs, 0) / styleResults.length

    performances.push({
      style,
      successRate,
      averageAttempts,
      averageTimeMs,
      gamesPlayed: styleResults.length,
    })
  })

  return performances
}

/**
 * Detect learning style profile from game results
 *
 * Algorithm:
 * - Calculate performance score for each style (based on success, attempts, speed)
 * - Normalize scores to percentages
 * - Determine primary and secondary styles
 * - Confidence based on sample size and score separation
 */
export function detectLearningStyle(results: GameResult[]): LearningStyleProfile {
  const performances = calculateStylePerformances(results)

  // Not enough data - return balanced default
  if (results.length < MIN_RESULTS_FOR_DETECTION) {
    return {
      visual: 33,
      auditory: 33,
      kinesthetic: 34,
      primary: 'visual',
      secondary: null,
      confidence: 'low',
      sampleSize: results.length,
    }
  }

  // Calculate composite score for each style
  // Higher is better: success rate + (1/attempts penalty) + (1/time penalty)
  const scores = performances.map(perf => {
    if (perf.gamesPlayed === 0) {
      return { style: perf.style, score: 0 }
    }

    // Success rate (0-100)
    const successScore = perf.successRate

    // Attempts penalty (fewer attempts = higher score)
    const attemptScore = Math.max(0, 100 - (perf.averageAttempts - 1) * 20)

    // Time penalty (faster = higher score, relative to reasonable time)
    const targetTimeMs = 30000 // 30 seconds
    const timeScore = Math.max(0, 100 - ((perf.averageTimeMs - targetTimeMs) / 1000) * 2)

    // Weighted composite score
    const compositeScore = successScore * 0.5 + attemptScore * 0.3 + timeScore * 0.2

    return {
      style: perf.style,
      score: compositeScore,
    }
  })

  // Normalize scores to percentages
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0)

  const percentages = scores.reduce(
    (acc, s) => {
      acc[s.style] = totalScore > 0 ? Math.round((s.score / totalScore) * 100) : 33
      return acc
    },
    {} as Record<LearningStyleType, number>
  )

  // Determine primary and secondary styles
  const sorted = scores.sort((a, b) => b.score - a.score)
  const primary = sorted[0].style
  const secondary = sorted[1].score > sorted[2].score * 1.2 ? sorted[1].style : null

  // Determine confidence based on sample size and score separation
  let confidence: 'low' | 'medium' | 'high'
  const scoreSeparation = sorted[0].score - sorted[1].score

  if (results.length < 20) {
    confidence = 'low'
  } else if (results.length < 40 || scoreSeparation < 10) {
    confidence = 'medium'
  } else {
    confidence = 'high'
  }

  return {
    visual: percentages.visual,
    auditory: percentages.auditory,
    kinesthetic: percentages.kinesthetic,
    primary,
    secondary,
    confidence,
    sampleSize: results.length,
  }
}

/**
 * Get recommended game mechanics based on learning style profile
 *
 * Returns game IDs weighted towards the child's preferred learning style
 */
export function getRecommendedGames(
  profile: LearningStyleProfile,
  availableGames: GameMechanicId[]
): GameMechanicId[] {
  // Group available games by style
  const gamesByStyle = availableGames.reduce(
    (acc, gameId) => {
      const style = GAME_STYLE_MAP[gameId]
      if (style) {
        acc[style].push(gameId)
      }
      return acc
    },
    { visual: [], auditory: [], kinesthetic: [] } as Record<
      LearningStyleType,
      GameMechanicId[]
    >
  )

  // Create weighted pool of games
  const weightedGames: GameMechanicId[] = []

  // Add visual games according to visual percentage
  const visualCount = Math.round((profile.visual / 100) * 10)
  for (let i = 0; i < visualCount; i++) {
    weightedGames.push(...gamesByStyle.visual)
  }

  // Add auditory games according to auditory percentage
  const auditoryCount = Math.round((profile.auditory / 100) * 10)
  for (let i = 0; i < auditoryCount; i++) {
    weightedGames.push(...gamesByStyle.auditory)
  }

  // Add kinesthetic games according to kinesthetic percentage
  const kinestheticCount = Math.round((profile.kinesthetic / 100) * 10)
  for (let i = 0; i < kinestheticCount; i++) {
    weightedGames.push(...gamesByStyle.kinesthetic)
  }

  return weightedGames
}

/**
 * Select next game based on learning style and variety
 *
 * @param profile Learning style profile
 * @param availableGames All available game mechanics
 * @param recentGames Games played recently (to avoid repetition)
 * @returns Recommended game mechanic ID
 */
export function selectNextGame(
  profile: LearningStyleProfile,
  availableGames: GameMechanicId[],
  recentGames: GameMechanicId[] = []
): GameMechanicId {
  const recommended = getRecommendedGames(profile, availableGames)

  // Filter out recently played games (for variety)
  const lastTwo = recentGames.slice(-2)
  const freshGames = recommended.filter(g => !lastTwo.includes(g))

  // If all games were recent, just use recommended list
  const pool = freshGames.length > 0 ? freshGames : recommended

  // Random selection from weighted pool
  return pool[Math.floor(Math.random() * pool.length)] || availableGames[0]
}
