/**
 * Spaced Repetition Algorithm
 *
 * Implements a Leitner-inspired spaced repetition system to optimize
 * word practice timing. Words are reviewed at intervals that increase
 * with successful recalls and decrease with failures.
 */

import type { WordConfidence } from './confidence-scoring'

export interface WordReviewData {
  word: string
  reviewCount: number
  lastReviewDate: Date
  nextReviewDate: Date
  currentInterval: number // in days
  boxLevel: number // Leitner box (1-5)
}

/**
 * Leitner box intervals (in days)
 * Box 1: Review daily (struggling words)
 * Box 2: Review every 2 days
 * Box 3: Review every 4 days
 * Box 4: Review weekly
 * Box 5: Review bi-weekly (mastered words)
 */
const LEITNER_INTERVALS = [1, 2, 4, 7, 14] as const

/**
 * Initialize review data for a word
 */
export function initializeWordReview(word: string): WordReviewData {
  const now = new Date()

  return {
    word,
    reviewCount: 0,
    lastReviewDate: now,
    nextReviewDate: now, // Due immediately
    currentInterval: 1,
    boxLevel: 1, // Start in box 1 (needs most practice)
  }
}

/**
 * Update review data after practicing a word
 *
 * @param reviewData Current review data
 * @param confidence Word confidence from latest practice
 * @returns Updated review data
 */
export function updateWordReview(
  reviewData: WordReviewData,
  confidence: WordConfidence
): WordReviewData {
  const now = new Date()

  // Determine if word should move up or down in Leitner boxes
  let newBoxLevel = reviewData.boxLevel

  if (confidence.level === 'mastered') {
    // Move up a box (max box 5)
    newBoxLevel = Math.min(5, reviewData.boxLevel + 1)
  } else if (confidence.level === 'needs-work') {
    // Move down to box 1 (needs immediate practice)
    newBoxLevel = 1
  } else if (confidence.level === 'progressing') {
    // Stay in current box or move up slowly
    if (confidence.score > 70 && reviewData.boxLevel < 5) {
      newBoxLevel = reviewData.boxLevel + 1
    }
  }

  // Calculate next review interval based on box level
  const interval = LEITNER_INTERVALS[newBoxLevel - 1]

  // Calculate next review date
  const nextReviewDate = new Date(now)
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  return {
    ...reviewData,
    reviewCount: reviewData.reviewCount + 1,
    lastReviewDate: now,
    nextReviewDate,
    currentInterval: interval,
    boxLevel: newBoxLevel,
  }
}

/**
 * Check if a word is due for review
 */
export function isWordDueForReview(reviewData: WordReviewData, now: Date = new Date()): boolean {
  return reviewData.nextReviewDate <= now
}

/**
 * Get words that are due for review, prioritized by urgency
 *
 * Priority factors:
 * 1. Overdue words (past next review date)
 * 2. Lower box level (struggling words)
 * 3. Longer time since last review
 */
export function getWordsForReview(
  reviewDataMap: Map<string, WordReviewData>,
  confidenceMap: Map<string, WordConfidence>,
  limit?: number
): string[] {
  const now = new Date()

  // Get all due words with priority scores
  const dueWords = Array.from(reviewDataMap.values())
    .filter(data => isWordDueForReview(data, now))
    .map(data => {
      const confidence = confidenceMap.get(data.word.toLowerCase())
      const overdueDays = Math.max(
        0,
        (now.getTime() - data.nextReviewDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Priority score (higher = more urgent)
      const priorityScore =
        overdueDays * 10 + // Overdue gets high priority
        (6 - data.boxLevel) * 5 + // Lower boxes get higher priority
        (confidence?.level === 'needs-work' ? 20 : 0) // Struggling words highest priority

      return {
        word: data.word,
        priorityScore,
      }
    })
    .sort((a, b) => b.priorityScore - a.priorityScore) // Highest priority first

  const words = dueWords.map(w => w.word)

  return limit ? words.slice(0, limit) : words
}

/**
 * Within-session word selection
 *
 * For a game session, select words that:
 * 1. Are due for review or struggling (<60% confidence)
 * 2. Haven't been practiced too recently in the session
 * 3. Ensure struggling words appear 2-3 times in the session
 */
export function selectWordsForSession(
  allWords: string[],
  reviewDataMap: Map<string, WordReviewData>,
  confidenceMap: Map<string, WordConfidence>,
  sessionSize: number = 5
): string[] {
  const selectedWords: string[] = []

  // 1. Prioritize struggling words (needs-work)
  const strugglingWords = allWords.filter(word => {
    const confidence = confidenceMap.get(word.toLowerCase())
    return confidence && confidence.level === 'needs-work'
  })

  // Add struggling words (2-3 times if session size allows)
  const strugglingQuota = Math.min(
    Math.ceil(sessionSize * 0.6), // 60% of session
    strugglingWords.length * 2
  )

  for (let i = 0; i < strugglingQuota && selectedWords.length < sessionSize; i++) {
    const word = strugglingWords[i % strugglingWords.length]
    if (word) {
      selectedWords.push(word)
    }
  }

  // 2. Add words due for review
  const dueWords = getWordsForReview(reviewDataMap, confidenceMap)
    .filter(word => !selectedWords.includes(word))
    .slice(0, sessionSize - selectedWords.length)

  selectedWords.push(...dueWords)

  // 3. Fill remaining slots with random words (variety)
  const remainingWords = allWords
    .filter(word => !selectedWords.includes(word))
    .sort(() => Math.random() - 0.5)
    .slice(0, sessionSize - selectedWords.length)

  selectedWords.push(...remainingWords)

  // Shuffle to avoid predictable patterns
  return selectedWords.sort(() => Math.random() - 0.5).slice(0, sessionSize)
}

/**
 * Get statistics for review data
 */
export function getReviewStats(reviewDataMap: Map<string, WordReviewData>) {
  const allData = Array.from(reviewDataMap.values())

  const boxDistribution = {
    box1: allData.filter(d => d.boxLevel === 1).length,
    box2: allData.filter(d => d.boxLevel === 2).length,
    box3: allData.filter(d => d.boxLevel === 3).length,
    box4: allData.filter(d => d.boxLevel === 4).length,
    box5: allData.filter(d => d.boxLevel === 5).length,
  }

  const dueCount = allData.filter(d => isWordDueForReview(d)).length

  return {
    totalWords: allData.length,
    dueForReview: dueCount,
    boxDistribution,
    averageInterval:
      allData.reduce((sum, d) => sum + d.currentInterval, 0) / allData.length || 0,
  }
}
