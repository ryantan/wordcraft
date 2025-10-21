/**
 * Story Progress Storage
 *
 * Handles persistence of story progress to localStorage
 * Follows the storage abstraction pattern from localStorage.ts
 */

import type { StoryProgressContext } from '@/types';

const STORAGE_KEY = 'wordcraft_story_progress';
const INTRO_TRACKING_KEY = 'wordcraft_story_intro_seen';

/**
 * Save story progress to localStorage
 *
 * @param context Story progress context to save
 */
export function saveStoryProgress(context: StoryProgressContext): void {
  if (typeof window === 'undefined') return; // SSR safety

  try {
    // Serialize context with Date converted to ISO string
    const data = {
      ...context,
      sessionStartTime: context.sessionStartTime.toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving story progress:', error);
    // Graceful degradation - don't throw, just log
  }
}

/**
 * Load story progress from localStorage
 *
 * @returns Saved progress context or null if not found
 */
export function loadStoryProgress(): StoryProgressContext | null {
  if (typeof window === 'undefined') return null; // SSR safety

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);

    // Deserialize ISO string back to Date object
    return {
      ...data,
      sessionStartTime: new Date(data.sessionStartTime),
    };
  } catch (error) {
    console.error('Error loading story progress:', error);
    return null; // Graceful degradation
  }
}

/**
 * Delete story progress from localStorage
 */
export function deleteStoryProgress(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error deleting story progress:', error);
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
  };

  saveStoryProgress(initialContext);
}

/**
 * Check if story intro has been seen for a specific word list
 *
 * @param wordListId Unique identifier for the word list
 * @returns Promise that resolves to true if intro was seen, false otherwise
 *
 * @example
 * ```typescript
 * const seen = await hasSeenStoryIntro('list-123')
 * if (!seen) {
 *   // Show intro screen
 * }
 * ```
 */
export async function hasSeenStoryIntro(wordListId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false; // SSR safety

  try {
    const stored = localStorage.getItem(INTRO_TRACKING_KEY);
    if (!stored) return false;

    const tracking = JSON.parse(stored) as Record<string, { seen: boolean; timestamp: number }>;
    return tracking[wordListId]?.seen ?? false;
  } catch (error) {
    console.error('Error checking story intro status:', error);
    return false; // Default to not seen on error
  }
}

/**
 * Mark story intro as seen for a specific word list
 *
 * @param wordListId Unique identifier for the word list
 * @returns Promise that resolves when the status is saved
 *
 * @example
 * ```typescript
 * await markStoryIntroAsSeen('list-123')
 * // Intro won't show again for this word list
 * ```
 */
export async function markStoryIntroAsSeen(wordListId: string): Promise<void> {
  if (typeof window === 'undefined') return; // SSR safety

  try {
    const stored = localStorage.getItem(INTRO_TRACKING_KEY);
    const tracking = stored
      ? (JSON.parse(stored) as Record<string, { seen: boolean; timestamp: number }>)
      : {};

    tracking[wordListId] = {
      seen: true,
      timestamp: Date.now(),
    };

    localStorage.setItem(INTRO_TRACKING_KEY, JSON.stringify(tracking));
  } catch (error) {
    console.error('Error marking story intro as seen:', error);
    // Graceful degradation - don't throw, just log
  }
}
