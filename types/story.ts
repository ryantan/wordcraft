/**
 * Story Mode Type Definitions
 *
 * Types for story progression, checkpoints, and narrative state
 */

/**
 * Story progress context maintained by the state machine
 */
export interface StoryProgressContext {
  currentCheckpoint: number // 0-4 (intro to finale)
  gamesCompleted: number
  totalGamesInSession: number
  checkpointsUnlocked: number[] // [0, 1, 2, ...]
  lastCheckpointAt: number // games count when last checkpoint reached
  storyTheme: string // 'space', 'treasure', etc.
  sessionStartTime: Date
}

/**
 * Events that can be sent to the story progress machine
 */
export type StoryProgressEvent =
  | { type: 'GAME_COMPLETED' }
  | { type: 'CHECKPOINT_REACHED'; checkpoint: number }
  | { type: 'CONTINUE_STORY' }
  | { type: 'SKIP_CHECKPOINT' }
  | { type: 'STORY_RESET' }
  | { type: 'FINALE_REACHED' }

/**
 * Story theme options
 */
export type StoryTheme = 'space' | 'treasure' | 'fantasy' | 'ocean' | 'jungle'

/**
 * Checkpoint milestone information
 */
export interface StoryCheckpoint {
  id: number
  name: string
  gamesRequired: number
  description: string
  unlocked: boolean
}
