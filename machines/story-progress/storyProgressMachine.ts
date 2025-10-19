/**
 * Story Progress State Machine
 *
 * Manages story mode progression through checkpoints as games are completed.
 * Checkpoints trigger after specific game milestones (5, 10, 15 games).
 */

import { setup, assign } from 'xstate'
import type { StoryProgressContext, StoryProgressEvent } from './types'
import { saveStoryProgress, loadStoryProgress } from '@/lib/storage/story-progress-storage'

/** Number of games required to reach each checkpoint */
const CHECKPOINT_THRESHOLDS = {
  checkpoint1: 5,
  checkpoint2: 10,
  checkpoint3: 15,
} as const

/**
 * Story Progress Machine
 *
 * States:
 * - intro: Story introduction screen
 * - playing: Active gameplay between checkpoints
 * - checkpoint1/2/3: Milestone celebration screens
 * - finale: Story completion screen
 */
export const storyProgressMachine = setup({
  types: {
    context: {} as StoryProgressContext,
    events: {} as StoryProgressEvent,
  },

  guards: {
    shouldReachCheckpoint1: ({ context }) => {
      return (
        context.gamesCompleted >= CHECKPOINT_THRESHOLDS.checkpoint1 &&
        context.currentCheckpoint < 1
      )
    },

    shouldReachCheckpoint2: ({ context }) => {
      return (
        context.gamesCompleted >= CHECKPOINT_THRESHOLDS.checkpoint2 &&
        context.currentCheckpoint < 2
      )
    },

    shouldReachCheckpoint3: ({ context }) => {
      return (
        context.gamesCompleted >= CHECKPOINT_THRESHOLDS.checkpoint3 &&
        context.currentCheckpoint < 3
      )
    },

    shouldReachFinale: ({ context }) => {
      // Finale reached when significantly beyond checkpoint 3
      // In practice, this will be triggered by external logic (all words mastered)
      return context.gamesCompleted >= 20 && context.currentCheckpoint >= 3
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

    unlockFinale: assign({
      currentCheckpoint: 4,
      checkpointsUnlocked: ({ context }) => {
        if (!context.checkpointsUnlocked.includes(4)) {
          return [...context.checkpointsUnlocked, 4]
        }
        return context.checkpointsUnlocked
      },
      lastCheckpointAt: ({ context }) => context.gamesCompleted,
    }),

    persistProgress: ({ context }) => {
      // Save progress to IndexedDB
      saveStoryProgress(context).catch(err => {
        console.error('Failed to save story progress:', err)
      })
    },

    resetStory: assign({
      currentCheckpoint: 0,
      gamesCompleted: 0,
      checkpointsUnlocked: [0],
      lastCheckpointAt: 0,
      sessionStartTime: new Date(),
    }),
  },
}).createMachine({
  id: 'storyProgress',

  initial: 'intro',

  context: {
    currentCheckpoint: 0,
    gamesCompleted: 0,
    totalGamesInSession: 20,
    checkpointsUnlocked: [0],
    lastCheckpointAt: 0,
    storyTheme: 'space',
    sessionStartTime: new Date(),
  },

  states: {
    intro: {
      on: {
        CONTINUE_STORY: {
          target: 'playing',
          actions: 'persistProgress',
        },
      },
    },

    playing: {
      on: {
        GAME_COMPLETED: {
          actions: ['incrementGamesCompleted', 'persistProgress'],
        },
        STORY_RESET: {
          target: 'intro',
          actions: ['resetStory', 'persistProgress'],
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
        CONTINUE_STORY: 'playing',
        SKIP_CHECKPOINT: 'playing',
      },
    },

    checkpoint2: {
      entry: ['unlockCheckpoint2', 'persistProgress'],
      on: {
        CONTINUE_STORY: 'playing',
        SKIP_CHECKPOINT: 'playing',
      },
    },

    checkpoint3: {
      entry: ['unlockCheckpoint3', 'persistProgress'],
      on: {
        CONTINUE_STORY: 'playing',
        SKIP_CHECKPOINT: 'playing',
      },
    },

    finale: {
      type: 'final',
      entry: ['unlockFinale', 'persistProgress'],
    },
  },
})

/**
 * Initialize Story Progress Machine with persisted data
 *
 * Loads previous progress from IndexedDB if available
 */
export async function initializeStoryProgress(
  wordListId?: string
): Promise<StoryProgressContext> {
  const saved = await loadStoryProgress(wordListId)

  if (saved) {
    return {
      ...saved,
      // Ensure Date object (might be serialized as string)
      sessionStartTime: new Date(saved.sessionStartTime),
    }
  }

  // Return default context
  return {
    currentCheckpoint: 0,
    gamesCompleted: 0,
    totalGamesInSession: 20,
    checkpointsUnlocked: [0],
    lastCheckpointAt: 0,
    storyTheme: 'space',
    sessionStartTime: new Date(),
  }
}
