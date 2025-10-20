/**
 * Session History Storage
 *
 * Stores game results and review data for the adaptive learning engine.
 * Uses localStorage for persistence across browser sessions.
 */

import type { GameResult } from '@/types'
import type { WordReviewData } from '@/lib/algorithms/spaced-repetition'
import type { LearningStyleProfile } from '@/lib/algorithms/learning-style-detection'

const STORAGE_KEYS = {
  GAME_RESULTS: 'wordcraft_game_results',
  REVIEW_DATA: 'wordcraft_review_data',
  LEARNING_PROFILE: 'wordcraft_learning_profile',
} as const

/**
 * Serialize Date objects for storage
 */
function serializeGameResult(result: GameResult): any {
  return {
    ...result,
    completedAt: result.completedAt.toISOString(),
  }
}

/**
 * Deserialize Date objects from storage
 */
function deserializeGameResult(data: any): GameResult {
  return {
    ...data,
    completedAt: new Date(data.completedAt),
  }
}

/**
 * Serialize review data for storage
 */
function serializeReviewData(data: WordReviewData): any {
  return {
    ...data,
    lastReviewDate: data.lastReviewDate.toISOString(),
    nextReviewDate: data.nextReviewDate.toISOString(),
  }
}

/**
 * Deserialize review data from storage
 */
function deserializeReviewData(data: any): WordReviewData {
  return {
    ...data,
    lastReviewDate: new Date(data.lastReviewDate),
    nextReviewDate: new Date(data.nextReviewDate),
  }
}

// ============================================================================
// Game Results
// ============================================================================

/**
 * Save a game result
 */
export function saveGameResult(result: GameResult): void {
  const results = getAllGameResults()
  results.push(result)

  // Keep last 500 results (prevent unlimited growth)
  const trimmedResults = results.slice(-500)

  localStorage.setItem(
    STORAGE_KEYS.GAME_RESULTS,
    JSON.stringify(trimmedResults.map(serializeGameResult))
  )
}

/**
 * Get all game results
 */
export function getAllGameResults(): GameResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GAME_RESULTS)
    if (!data) return []

    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed.map(deserializeGameResult) : []
  } catch (error) {
    console.error('Error loading game results:', error)
    return []
  }
}

/**
 * Get game results for a specific word
 */
export function getWordResults(word: string): GameResult[] {
  const allResults = getAllGameResults()
  return allResults.filter(r => r.word.toLowerCase() === word.toLowerCase())
}

/**
 * Get game results for a specific word list
 *
 * @param _wordListId - Word list ID (currently unused, for future enhancement)
 */
export function getWordListResults(_wordListId: string): GameResult[] {
  // For now, we don't store wordListId in results
  // This could be enhanced to filter by word list
  return getAllGameResults()
}

/**
 * Clear all game results
 */
export function clearAllGameResults(): void {
  localStorage.removeItem(STORAGE_KEYS.GAME_RESULTS)
}

// ============================================================================
// Review Data
// ============================================================================

/**
 * Save review data for a word
 */
export function saveWordReviewData(data: WordReviewData): void {
  const allData = getAllReviewData()
  allData.set(data.word.toLowerCase(), data)

  const serialized = Array.from(allData.entries()).map(([word, reviewData]) => [
    word,
    serializeReviewData(reviewData),
  ])

  localStorage.setItem(STORAGE_KEYS.REVIEW_DATA, JSON.stringify(serialized))
}

/**
 * Get all review data
 */
export function getAllReviewData(): Map<string, WordReviewData> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REVIEW_DATA)
    if (!data) return new Map()

    const parsed = JSON.parse(data)
    if (!Array.isArray(parsed)) return new Map()

    return new Map(
      parsed.map(([word, reviewData]: [string, any]) => [
        word,
        deserializeReviewData(reviewData),
      ])
    )
  } catch (error) {
    console.error('Error loading review data:', error)
    return new Map()
  }
}

/**
 * Get review data for a specific word
 */
export function getWordReviewData(word: string): WordReviewData | null {
  const allData = getAllReviewData()
  return allData.get(word.toLowerCase()) || null
}

/**
 * Clear all review data
 */
export function clearAllReviewData(): void {
  localStorage.removeItem(STORAGE_KEYS.REVIEW_DATA)
}

// ============================================================================
// Learning Profile
// ============================================================================

/**
 * Save learning style profile
 */
export function saveLearningProfile(profile: LearningStyleProfile): void {
  localStorage.setItem(STORAGE_KEYS.LEARNING_PROFILE, JSON.stringify(profile))
}

/**
 * Get learning style profile
 */
export function getLearningProfile(): LearningStyleProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEARNING_PROFILE)
    if (!data) return null

    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading learning profile:', error)
    return null
  }
}

/**
 * Clear learning profile
 */
export function clearLearningProfile(): void {
  localStorage.removeItem(STORAGE_KEYS.LEARNING_PROFILE)
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clear all adaptive data (results, reviews, profile)
 */
export function clearAllAdaptiveData(): void {
  clearAllGameResults()
  clearAllReviewData()
  clearLearningProfile()
}

/**
 * Get storage statistics
 */
export function getStorageStats() {
  const results = getAllGameResults()
  const reviewData = getAllReviewData()
  const profile = getLearningProfile()

  return {
    totalResults: results.length,
    wordsTracked: reviewData.size,
    hasLearningProfile: profile !== null,
    oldestResult: results.length > 0 ? results[0].completedAt : null,
    newestResult: results.length > 0 ? results[results.length - 1].completedAt : null,
  }
}

// ============================================================================
// Story Session State Persistence (Story 6.4a)
// ============================================================================

const STORY_SESSION_KEY = 'wordcraft_story_session_state'

/**
 * Save story session state to sessionStorage
 * Handles serialization of Maps and Dates
 */
export function saveStorySessionState(state: any): void {
  if (typeof window === 'undefined') return

  try {
    // Convert Maps to arrays for serialization
    const serialized = {
      ...state,
      wordStats: Array.from(state.wordStats || []),
      sessionStartTime: state.sessionStartTime?.toISOString(),
      generatedStory: state.generatedStory ? {
        ...state.generatedStory,
        stage2ExtraBeats: Array.from(state.generatedStory.stage2ExtraBeats || []),
      } : null,
    }

    sessionStorage.setItem(STORY_SESSION_KEY, JSON.stringify(serialized))
  } catch (error) {
    console.error('Error saving story session state:', error)
  }
}

/**
 * Load story session state from sessionStorage
 * Handles deserialization of Maps and Dates
 */
export function loadStorySessionState(): any | null {
  if (typeof window === 'undefined') return null

  try {
    const data = sessionStorage.getItem(STORY_SESSION_KEY)
    if (!data) return null

    const parsed = JSON.parse(data)

    // Convert arrays back to Maps
    const deserialized = {
      ...parsed,
      wordStats: new Map(parsed.wordStats || []),
      sessionStartTime: parsed.sessionStartTime ? new Date(parsed.sessionStartTime) : new Date(),
      generatedStory: parsed.generatedStory ? {
        ...parsed.generatedStory,
        stage2ExtraBeats: new Map(parsed.generatedStory.stage2ExtraBeats || []),
      } : null,
    }

    return deserialized
  } catch (error) {
    console.error('Error loading story session state:', error)
    return null
  }
}

/**
 * Clear story session state from sessionStorage
 */
export function clearStorySessionState(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(STORY_SESSION_KEY)
}
