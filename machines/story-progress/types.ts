/**
 * Story Progress Machine Types
 */

export interface StoryProgressContext {
  /** Current checkpoint level (0-4: intro, checkpoint1, checkpoint2, checkpoint3, finale) */
  currentCheckpoint: number;

  /** Total number of games completed in the story journey */
  gamesCompleted: number;

  /** Total games planned for this session */
  totalGamesInSession: number;

  /** Array of unlocked checkpoint numbers */
  checkpointsUnlocked: number[];

  /** Game count when last checkpoint was reached */
  lastCheckpointAt: number;

  /** Selected story theme (e.g., 'space', 'treasure') */
  storyTheme: string;

  /** When the story session started */
  sessionStartTime: Date;
}

export type StoryProgressEvent =
  | { type: 'GAME_COMPLETED' }
  | { type: 'CHECKPOINT_REACHED'; checkpoint: number }
  | { type: 'CONTINUE_STORY' }
  | { type: 'SKIP_CHECKPOINT' }
  | { type: 'STORY_RESET' }
  | { type: 'FINALE_REACHED' };

export type StoryProgressState =
  | { value: 'intro'; context: StoryProgressContext }
  | { value: 'playing'; context: StoryProgressContext }
  | { value: 'checkpoint1'; context: StoryProgressContext }
  | { value: 'checkpoint2'; context: StoryProgressContext }
  | { value: 'checkpoint3'; context: StoryProgressContext }
  | { value: 'finale'; context: StoryProgressContext };
