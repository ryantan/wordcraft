/**
 * Story Progress State Machine
 *
 * XState 5.x machine for managing story progression and checkpoints
 */

import { createMachine, assign } from 'xstate'
import type { StoryProgressContext } from '@/types'
import { saveStoryProgress, loadStoryProgress } from '@/lib/storage/story-progress-storage'
import { getMasteredWords, calculateWordConfidence } from '@/lib/algorithms/confidence-scoring'
import { getAllGameResults } from '@/lib/storage/sessionStorage'
import { getAllWordLists } from '@/lib/storage/localStorage'

/**
 * Initial context for story progress
 */
const initialContext: StoryProgressContext = {
  currentCheckpoint: 0,
  gamesCompleted: 0,
  totalGamesInSession: 20,
  checkpointsUnlocked: [0],
  lastCheckpointAt: 0,
  storyTheme: 'space',
  sessionStartTime: new Date(),
}

/**
 * Story Progress Machine
 *
 * Manages narrative progression through checkpoints based on games completed
 */
export const storyProgressMachine = createMachine({
  /** @xstate-layout N8IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEkB5AOQFEBBAFQEEAlAGQDkBtABgF1EoAA4B7WGoA2LPiAAeiAIwBWAJwEAzAA4lABgC0GgEz6lq-QBoQ-RADYAnC1PKArBZ1mN-Y-ZP6AvnytoGLgERCTklDR0DExsHNy8fCJiElIIcioEKh56Bn6qRqZmZeZO1lYAlKX6Ji6m-lZGIWEYOHiEpOTUdIwsbJzcCSnpGWhZ2XkFQpLSCIqGJqq+Glb6Kqb67e2+SqZWKr5mZlb6hha+AR5jGFAAJiwsqDxwACacN4+YBESkFFQ0dH4g2GYwmi2k0lUKhAKx0qgMK2MSjUSi6XQ6qn0hmsqhcjk8Xh8-iCoQiUViiWS-0BqX+wIyYKymRy+SKJTKajMqiqvWM-Sq-jUSk8esMXm6KKGYXG4UBSSB0sysvlisVKpV6rVmqoOmMejqdRZ3QISnqlkMm2UOgJHWUOh5-n8LlsLm8LlF4TisXiSRSQA */
  id: 'storyProgress',

  initial: 'intro',

  context: ({ input }: { input?: Partial<StoryProgressContext> }) => {
    // Try to load persisted progress
    const persisted = loadStoryProgress()

    if (persisted) {
      return persisted
    }

    // Otherwise use initial context with any provided input
    return {
      ...initialContext,
      ...input,
    }
  },

  states: {
    intro: {
      on: {
        CONTINUE_STORY: {
          target: 'playing',
        },
      },
    },

    playing: {
      on: {
        GAME_COMPLETED: {
          actions: ['incrementGamesCompleted', 'persistProgress'],
        },
      },

      always: [
        {
          guard: 'shouldReachCheckpoint1',
          target: 'checkpoint1',
        },
        {
          guard: 'shouldReachCheckpoint2',
          target: 'checkpoint2',
        },
        {
          guard: 'shouldReachCheckpoint3',
          target: 'checkpoint3',
        },
        {
          guard: 'shouldReachFinale',
          target: 'finale',
        },
      ],
    },

    checkpoint1: {
      entry: ['unlockCheckpoint1', 'persistProgress'],
      on: {
        CONTINUE_STORY: {
          target: 'playing',
        },
        SKIP_CHECKPOINT: {
          target: 'playing',
        },
      },
    },

    checkpoint2: {
      entry: ['unlockCheckpoint2', 'persistProgress'],
      on: {
        CONTINUE_STORY: {
          target: 'playing',
        },
        SKIP_CHECKPOINT: {
          target: 'playing',
        },
      },
    },

    checkpoint3: {
      entry: ['unlockCheckpoint3', 'persistProgress'],
      on: {
        CONTINUE_STORY: {
          target: 'playing',
        },
        SKIP_CHECKPOINT: {
          target: 'playing',
        },
      },
    },

    finale: {
      type: 'final',
    },
  },

  on: {
    STORY_RESET: {
      target: '.intro',
      actions: ['resetContext', 'persistProgress'],
    },
  },
}).provide({
  guards: {
    shouldReachCheckpoint1: ({ context }) => {
      return context.gamesCompleted >= 5 && context.currentCheckpoint < 1
    },

    shouldReachCheckpoint2: ({ context }) => {
      return context.gamesCompleted >= 10 && context.currentCheckpoint < 2
    },

    shouldReachCheckpoint3: ({ context }) => {
      return context.gamesCompleted >= 15 && context.currentCheckpoint < 3
    },

    shouldReachFinale: ({ context }) => {
      // Check if all words have >80% confidence
      try {
        const results = getAllGameResults()
        const wordLists = getAllWordLists()

        if (wordLists.length === 0) return false

        const allWords = wordLists.flatMap(list => list.words)
        const uniqueWords = Array.from(new Set(allWords))

        if (uniqueWords.length === 0) return false

        const confidenceMap = new Map(
          uniqueWords.map(word => [
            word,
            calculateWordConfidence(word, results)
          ])
        )

        const masteredWords = getMasteredWords(confidenceMap)
        return masteredWords.length === uniqueWords.length && context.gamesCompleted >= 20
      } catch (error) {
        console.error('Error checking finale condition:', error)
        return false
      }
    },
  },

  actions: {
    incrementGamesCompleted: assign({
      gamesCompleted: ({ context }) => context.gamesCompleted + 1,
    }),

    unlockCheckpoint1: assign({
      currentCheckpoint: 1,
      checkpointsUnlocked: ({ context }) => {
        if (!context.checkpointsUnlocked.includes(1)) {
          return [...context.checkpointsUnlocked, 1]
        }
        return context.checkpointsUnlocked
      },
      lastCheckpointAt: ({ context }) => context.gamesCompleted,
    }),

    unlockCheckpoint2: assign({
      currentCheckpoint: 2,
      checkpointsUnlocked: ({ context }) => {
        if (!context.checkpointsUnlocked.includes(2)) {
          return [...context.checkpointsUnlocked, 2]
        }
        return context.checkpointsUnlocked
      },
      lastCheckpointAt: ({ context }) => context.gamesCompleted,
    }),

    unlockCheckpoint3: assign({
      currentCheckpoint: 3,
      checkpointsUnlocked: ({ context }) => {
        if (!context.checkpointsUnlocked.includes(3)) {
          return [...context.checkpointsUnlocked, 3]
        }
        return context.checkpointsUnlocked
      },
      lastCheckpointAt: ({ context }) => context.gamesCompleted,
    }),

    resetContext: assign({
      currentCheckpoint: 0,
      gamesCompleted: 0,
      totalGamesInSession: 20,
      checkpointsUnlocked: [0],
      lastCheckpointAt: 0,
      sessionStartTime: new Date(),
    }),

    persistProgress: ({ context }) => {
      saveStoryProgress(context)
    },
  },
})
