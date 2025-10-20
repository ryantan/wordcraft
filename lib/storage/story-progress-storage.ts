/**
 * Story Progress Storage
 *
 * Handles persistence of story progress to localStorage
 * Follows the storage abstraction pattern from localStorage.ts
 */

import type { StoryProgressContext } from '@/types'

const STORAGE_KEY = 'wordcraft_story_progress'

/**
 * Save story progress to localStorage
 *
 * @param context Story progress context to save
 */
export function saveStoryProgress(context: StoryProgressContext): void {
  if (typeof window === 'undefined') return // SSR safety

  try {
    // Serialize context with Date converted to ISO string
    const data = {
      ...context,
      sessionStartTime: context.sessionStartTime.toISOString(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving story progress:', error)
    // Graceful degradation - don't throw, just log
  }
}

/**
 * Load story progress from localStorage
 *
 * @returns Saved progress context or null if not found
 */
export function loadStoryProgress(): StoryProgressContext | null {
  if (typeof window === 'undefined') return null // SSR safety

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const data = JSON.parse(stored)

    // Deserialize ISO string back to Date object
    return {
      ...data,
      sessionStartTime: new Date(data.sessionStartTime),
    }
  } catch (error) {
    console.error('Error loading story progress:', error)
    return null // Graceful degradation
  }
}

/**
 * Delete story progress from localStorage
 */
export function deleteStoryProgress(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error deleting story progress:', error)
  }
}

/**
 * Reset story progress to initial state
 *
 * @param storyTheme Theme for the new story session
 */
export function resetStoryProgress(storyTheme: string = 'space'): void {
  const initialContext: StoryProgressContext = {
    currentCheckpoint: 0,
    gamesCompleted: 0,
    totalGamesInSession: 20,
    checkpointsUnlocked: [0],
    lastCheckpointAt: 0,
    storyTheme,
    sessionStartTime: new Date(),
  }

  saveStoryProgress(initialContext)
}
