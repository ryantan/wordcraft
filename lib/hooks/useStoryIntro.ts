/**
 * useStoryIntro Hook
 *
 * Manages story intro visibility tracking for word lists
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  hasSeenStoryIntro,
  markStoryIntroAsSeen,
} from '@/lib/storage/story-progress-storage'

export interface UseStoryIntroReturn {
  /**
   * Whether the user has seen the intro for this word list
   */
  hasSeenIntro: boolean

  /**
   * Whether the intro status is still being loaded
   */
  isLoading: boolean

  /**
   * Mark the intro as seen for this word list
   */
  markAsSeen: () => Promise<void>
}

/**
 * Hook to manage story intro visibility for a specific word list
 *
 * @param wordListId Unique identifier for the word list
 * @returns Object with hasSeenIntro status, loading state, and markAsSeen function
 *
 * @example
 * ```typescript
 * function StoryPage({ wordListId }: { wordListId: string }) {
 *   const { hasSeenIntro, isLoading, markAsSeen } = useStoryIntro(wordListId)
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (!hasSeenIntro) {
 *     return <StoryIntro onStart={markAsSeen} />
 *   }
 *   return <StoryGame />
 * }
 * ```
 */
export function useStoryIntro(wordListId: string): UseStoryIntroReturn {
  const [hasSeenIntro, setHasSeenIntro] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load intro seen status from storage on mount
  useEffect(() => {
    async function loadIntroStatus() {
      try {
        setIsLoading(true)
        const seen = await hasSeenStoryIntro(wordListId)
        setHasSeenIntro(seen)
      } catch (error) {
        console.error('Error loading intro status:', error)
        // Default to not seen on error
        setHasSeenIntro(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadIntroStatus()
  }, [wordListId])

  // Function to mark intro as seen
  const markAsSeen = useCallback(async () => {
    try {
      await markStoryIntroAsSeen(wordListId)
      setHasSeenIntro(true)
    } catch (error) {
      console.error('Error marking intro as seen:', error)
      // Still update local state to prevent re-showing intro in this session
      setHasSeenIntro(true)
    }
  }, [wordListId])

  return {
    hasSeenIntro,
    isLoading,
    markAsSeen,
  }
}
