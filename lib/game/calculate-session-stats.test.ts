import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculateSessionStats, formatTime } from './calculate-session-stats'
import type { WordStats } from '@/types/story'
import type { GameResult } from '@/types/game'

describe('calculateSessionStats', () => {
  let mockNow: number

  beforeEach(() => {
    // Mock Date.now() to return a consistent value
    mockNow = 1000000
    vi.spyOn(Date, 'now').mockReturnValue(mockNow)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calculates all stats correctly with complete data', () => {
    const wordStats = new Map<string, WordStats>([
      [
        'cat',
        {
          word: 'cat',
          confidence: 85,
          errors: 1,
          hints: 0,
          timeSpent: 3000,
          streak: 3,
          lastPracticed: new Date(),
          attemptsCount: 4,
        },
      ],
      [
        'dog',
        {
          word: 'dog',
          confidence: 90,
          errors: 0,
          hints: 1,
          timeSpent: 2500,
          streak: 5,
          lastPracticed: new Date(),
          attemptsCount: 5,
        },
      ],
      [
        'bird',
        {
          word: 'bird',
          confidence: 75,
          errors: 2,
          hints: 0,
          timeSpent: 4000,
          streak: 2,
          lastPracticed: new Date(),
          attemptsCount: 3,
        },
      ],
    ])

    const gameResults: GameResult[] = [
      {
        word: 'cat',
        correct: true,
        attempts: 1,
        timeMs: 3000,
        hintsUsed: 0,
        mechanicId: 'word-scramble',
        completedAt: new Date(),
      },
      {
        word: 'dog',
        correct: true,
        attempts: 1,
        timeMs: 2500,
        hintsUsed: 1,
        mechanicId: 'letter-matching',
        completedAt: new Date(),
      },
      {
        word: 'bird',
        correct: true,
        attempts: 2,
        timeMs: 4000,
        hintsUsed: 0,
        mechanicId: 'spelling-challenge',
        completedAt: new Date(),
      },
    ]

    const sessionStartTime = mockNow - 180000 // 3 minutes ago (180 seconds)

    const stats = calculateSessionStats(wordStats, gameResults, sessionStartTime)

    expect(stats.totalWords).toBe(3)
    expect(stats.wordsMastered).toBe(2) // cat (85) and dog (90) >= 80
    expect(stats.gamesPlayed).toBe(3)
    expect(stats.timeSpent).toBe(180) // 3 minutes in seconds
    expect(stats.averageConfidence).toBe(83.33333333333333) // (85 + 90 + 75) / 3
  })

  it('handles empty word stats gracefully', () => {
    const wordStats = new Map<string, WordStats>()
    const gameResults: GameResult[] = []
    const sessionStartTime = mockNow - 60000 // 1 minute ago

    const stats = calculateSessionStats(wordStats, gameResults, sessionStartTime)

    expect(stats.totalWords).toBe(0)
    expect(stats.wordsMastered).toBe(0)
    expect(stats.gamesPlayed).toBe(0)
    expect(stats.timeSpent).toBe(60)
    expect(stats.averageConfidence).toBe(0)
  })

  it('handles all words below mastery threshold', () => {
    const wordStats = new Map<string, WordStats>([
      [
        'word1',
        {
          word: 'word1',
          confidence: 50,
          errors: 3,
          hints: 2,
          timeSpent: 5000,
          streak: 1,
          lastPracticed: new Date(),
          attemptsCount: 5,
        },
      ],
      [
        'word2',
        {
          word: 'word2',
          confidence: 65,
          errors: 2,
          hints: 1,
          timeSpent: 4000,
          streak: 2,
          lastPracticed: new Date(),
          attemptsCount: 4,
        },
      ],
    ])

    const gameResults: GameResult[] = [
      {
        word: 'word1',
        correct: true,
        attempts: 3,
        timeMs: 5000,
        hintsUsed: 2,
        mechanicId: 'word-scramble',
        completedAt: new Date(),
      },
      {
        word: 'word2',
        correct: true,
        attempts: 2,
        timeMs: 4000,
        hintsUsed: 1,
        mechanicId: 'letter-matching',
        completedAt: new Date(),
      },
    ]

    const sessionStartTime = mockNow - 120000 // 2 minutes ago

    const stats = calculateSessionStats(wordStats, gameResults, sessionStartTime)

    expect(stats.totalWords).toBe(2)
    expect(stats.wordsMastered).toBe(0) // Both below 80
    expect(stats.gamesPlayed).toBe(2)
    expect(stats.averageConfidence).toBe(57.5) // (50 + 65) / 2
  })

  it('handles all words at or above mastery threshold', () => {
    const wordStats = new Map<string, WordStats>([
      [
        'word1',
        {
          word: 'word1',
          confidence: 80,
          errors: 0,
          hints: 0,
          timeSpent: 2000,
          streak: 4,
          lastPracticed: new Date(),
          attemptsCount: 4,
        },
      ],
      [
        'word2',
        {
          word: 'word2',
          confidence: 95,
          errors: 0,
          hints: 0,
          timeSpent: 1500,
          streak: 5,
          lastPracticed: new Date(),
          attemptsCount: 5,
        },
      ],
    ])

    const gameResults: GameResult[] = []
    const sessionStartTime = mockNow - 30000 // 30 seconds ago

    const stats = calculateSessionStats(wordStats, gameResults, sessionStartTime)

    expect(stats.totalWords).toBe(2)
    expect(stats.wordsMastered).toBe(2) // Both >= 80
    expect(stats.gamesPlayed).toBe(0)
    expect(stats.averageConfidence).toBe(87.5) // (80 + 95) / 2
  })

  it('handles zero time elapsed (just started)', () => {
    const wordStats = new Map<string, WordStats>()
    const gameResults: GameResult[] = []
    const sessionStartTime = mockNow // Started right now

    const stats = calculateSessionStats(wordStats, gameResults, sessionStartTime)

    expect(stats.timeSpent).toBe(0)
  })

  it('calculates correct average confidence with varied scores', () => {
    const wordStats = new Map<string, WordStats>([
      [
        'word1',
        {
          word: 'word1',
          confidence: 100,
          errors: 0,
          hints: 0,
          timeSpent: 1000,
          streak: 10,
          lastPracticed: new Date(),
          attemptsCount: 10,
        },
      ],
      [
        'word2',
        {
          word: 'word2',
          confidence: 0,
          errors: 10,
          hints: 5,
          timeSpent: 8000,
          streak: 0,
          lastPracticed: new Date(),
          attemptsCount: 10,
        },
      ],
      [
        'word3',
        {
          word: 'word3',
          confidence: 50,
          errors: 3,
          hints: 1,
          timeSpent: 4000,
          streak: 2,
          lastPracticed: new Date(),
          attemptsCount: 5,
        },
      ],
    ])

    const gameResults: GameResult[] = []
    const sessionStartTime = mockNow - 60000

    const stats = calculateSessionStats(wordStats, gameResults, sessionStartTime)

    expect(stats.averageConfidence).toBe(50) // (100 + 0 + 50) / 3
  })
})

describe('formatTime', () => {
  it('formats seconds only when less than a minute', () => {
    expect(formatTime(0)).toBe('0s')
    expect(formatTime(30)).toBe('30s')
    expect(formatTime(59)).toBe('59s')
  })

  it('formats minutes only when no remaining seconds', () => {
    expect(formatTime(60)).toBe('1m')
    expect(formatTime(120)).toBe('2m')
    expect(formatTime(300)).toBe('5m')
  })

  it('formats minutes and seconds when both present', () => {
    expect(formatTime(61)).toBe('1m 1s')
    expect(formatTime(90)).toBe('1m 30s')
    expect(formatTime(325)).toBe('5m 25s')
    expect(formatTime(3665)).toBe('61m 5s')
  })

  it('handles edge cases', () => {
    expect(formatTime(1)).toBe('1s')
    expect(formatTime(59)).toBe('59s')
    expect(formatTime(60)).toBe('1m')
    expect(formatTime(3600)).toBe('60m')
    expect(formatTime(3601)).toBe('60m 1s')
  })
})
