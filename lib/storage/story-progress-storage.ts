/**
 * Story Progress Storage
 *
 * Handles persistence of story progress to IndexedDB
 */

import type { StoryProgressContext } from '@/machines/story-progress/types'

const DB_NAME = 'wordcraft-story'
const DB_VERSION = 1
const STORE_NAME = 'story-progress'

/**
 * Open IndexedDB database
 */
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'wordListId' })
      }
    }
  })
}

/**
 * Save story progress to IndexedDB
 *
 * @param context Story progress context to save
 * @param wordListId Optional word list ID (defaults to 'default')
 */
export async function saveStoryProgress(
  context: StoryProgressContext,
  wordListId: string = 'default'
): Promise<void> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const data = {
      wordListId,
      ...context,
      // Serialize Date to ISO string for IndexedDB
      sessionStartTime: context.sessionStartTime.toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await new Promise<void>((resolve, reject) => {
      const request = store.put(data)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    db.close()
  } catch (error) {
    console.error('Failed to save story progress:', error)
    throw error
  }
}

/**
 * Load story progress from IndexedDB
 *
 * @param wordListId Optional word list ID (defaults to 'default')
 * @returns Saved progress context or null if not found
 */
export async function loadStoryProgress(
  wordListId: string = 'default'
): Promise<StoryProgressContext | null> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    const data = await new Promise<any>((resolve, reject) => {
      const request = store.get(wordListId)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    db.close()

    if (!data) {
      return null
    }

    // Deserialize ISO string back to Date
    return {
      currentCheckpoint: data.currentCheckpoint,
      gamesCompleted: data.gamesCompleted,
      totalGamesInSession: data.totalGamesInSession,
      checkpointsUnlocked: data.checkpointsUnlocked,
      lastCheckpointAt: data.lastCheckpointAt,
      storyTheme: data.storyTheme,
      sessionStartTime: new Date(data.sessionStartTime),
    }
  } catch (error) {
    console.error('Failed to load story progress:', error)
    return null
  }
}

/**
 * Delete story progress from IndexedDB
 *
 * @param wordListId Optional word list ID (defaults to 'default')
 */
export async function deleteStoryProgress(wordListId: string = 'default'): Promise<void> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(wordListId)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    db.close()
  } catch (error) {
    console.error('Failed to delete story progress:', error)
    throw error
  }
}

/**
 * Get all story progress records (for debugging)
 */
export async function getAllStoryProgress(): Promise<Array<StoryProgressContext & { wordListId: string }>> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    const records = await new Promise<any[]>((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    db.close()

    return records.map(data => ({
      wordListId: data.wordListId,
      currentCheckpoint: data.currentCheckpoint,
      gamesCompleted: data.gamesCompleted,
      totalGamesInSession: data.totalGamesInSession,
      checkpointsUnlocked: data.checkpointsUnlocked,
      lastCheckpointAt: data.lastCheckpointAt,
      storyTheme: data.storyTheme,
      sessionStartTime: new Date(data.sessionStartTime),
    }))
  } catch (error) {
    console.error('Failed to get all story progress:', error)
    return []
  }
}
