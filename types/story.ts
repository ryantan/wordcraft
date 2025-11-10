// ============================================================================
// Story 6.4a: StorySessionMachine Types
// ============================================================================

import { GameMechanics } from '@/lib/games';
import { WordInfo } from '@/lib/openai/word-info/schema';

import type { WordList } from './word';

/**
 * Story Mode Type Definitions
 *
 * Types for story progression, checkpoints, and narrative state
 */

/**
 * Story progress context maintained by the state machine
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

/**
 * Events that can be sent to the story progress machine
 */
export type StoryProgressEvent =
  | { type: 'GAME_COMPLETED' }
  | { type: 'CHECKPOINT_REACHED'; checkpoint: number }
  | { type: 'CONTINUE_STORY' }
  | { type: 'SKIP_CHECKPOINT' }
  | { type: 'STORY_RESET' }
  | { type: 'FINALE_REACHED' };

/**
 * Story theme options
 */
export type StoryTheme = 'space' | 'treasure' | 'fantasy' | 'ocean' | 'jungle';

/**
 * Checkpoint milestone information
 */
export interface StoryCheckpoint {
  id: number;
  name: string;
  gamesRequired: number;
  description: string;
  unlocked: boolean;
}

/**
 * Base interface for all story beats
 */
export interface BaseBeat {
  type: 'game' | 'choice' | 'narrative' | 'checkpoint';
  id: string;
  isOptional?: boolean;
  narrative: string;
  // Phase of the story.
  phase?: 'beginning' | 'middle' | 'challenge' | 'end';
}

/**
 * Game Beat - User plays a spelling game with a specific word
 */
export interface GameBeat extends BaseBeat {
  type: 'game';
  word: string;
  potentialWords: string[];
  gameType: GameMechanics;
  stage: 1 | 2; // Stage 1: Assessment, Stage 2: Mastery
}

/**
 * Choice Beat - User makes a story decision
 */
export interface ChoiceBeat extends BaseBeat {
  type: 'choice';
  question: string;
  options: [string, string]; // Two choices
}

/**
 * Narrative Beat - Pure story advancement, no interaction
 */
export interface NarrativeBeat extends BaseBeat {
  type: 'narrative';
  // Just narrative text, user clicks continue
}

/**
 * Checkpoint Beat - Major milestone celebration
 */
export interface CheckpointBeat extends BaseBeat {
  type: 'checkpoint';
  checkpointNumber: 1 | 2 | 3;
  celebrationEmoji: string;
  title: string;
}

/**
 * Union type of all beat types
 */
export type StoryBeat = GameBeat | ChoiceBeat | NarrativeBeat | CheckpointBeat;

/**
 * Statistics tracked for each word during story mode
 */
export interface WordStats {
  word: string;
  confidence: number; // 0-100 confidence score
  errors: number; // Number of mistakes
  hints: number; // Number of hints used
  timeSpent: number; // Total time in milliseconds
  streak: number; // Current correct streak
  lastPracticed: Date; // Last time word was practiced
  attemptsCount: number; // Total number of attempts
}

/**
 * Input for LLM story generation
 */
export interface StoryGenerationInput {
  wordList: string[];
  theme: StoryTheme;
  targetBeats: number;
}

export type WordInfoMap = Map<string, WordInfo>;

/**
 * Generated story structure
 */
export interface GeneratedStory {
  words?: WordInfoMap;
  stage1Beats: StoryBeat[]; // One beat per word (story order)
  stage2ExtraBeats: Map<string, StoryBeat[]>; // Extra beats per word for mastery
  stage2FixedSequence: StoryBeat[]; // Fallback sequence for Stage 2
  artificiallyAddedBlocksForMissingWords: number;
}

/**
 * Context for StorySessionMachine
 */
export interface StorySessionContext {
  // Input (provided at machine creation)
  wordList: WordList;
  storyTheme: string;

  // Generated story structure
  generatedStory: GeneratedStory | null;
  currentBeatIndex: number;
  currentBeat: StoryBeat | null;

  // Phase tracking
  currentPhase: 'stage1' | 'stage2';

  // Word stats tracking
  wordStats: Map<string, WordStats>;
  userChoices: Array<{ beatId: string; choice: string }>;
  gameResults: Array<any>; // GameResult array for stats calculation

  // Story integration
  storyProgressActor: any | null; // XState ActorRef

  // Checkpoint data
  currentCheckpoint: any | null;
  canContinueStory: boolean;

  // Content
  introContent: any | null;
  finaleContent: any | null;

  // Session tracking
  sessionStartTime: Date;
  sessionStartTimeMs: number; // Timestamp for stats calculation
  wordListId: string;
  hasSeenIntro: boolean;
}

/**
 * Event: User starts the story from intro screen
 */
export type StartStoryEvent = {
  type: 'START_STORY';
};

/**
 * Event: User clicked continue after narrative beat
 */
export type NarrativeSeenEvent = {
  type: 'NARRATIVE_SEEN';
};

/**
 * Event: User made a choice
 */
export type ChoiceMadeEvent = {
  type: 'CHOICE_MADE';
  choice: string;
};

/**
 * Event: Game completed with results
 */
export type GameCompletedEvent = {
  type: 'GAME_COMPLETED';
  result: {
    isCorrect: boolean;
    timeSpent: number;
    hintsUsed: number;
    errors: number;
  };
};

/**
 * Event: Continue from checkpoint
 */
export type ContinueStoryEvent = {
  type: 'CONTINUE_STORY';
};

/**
 * Event: Skip checkpoint screen
 */
export type SkipCheckpointEvent = {
  type: 'SKIP_CHECKPOINT';
};

/**
 * Event: Restart the entire story
 */
export type RestartStoryEvent = {
  type: 'RESTART_STORY';
};

/**
 * Event: Skip intro screen
 */
export type SkipIntroEvent = {
  type: 'SKIP_INTRO';
};

/**
 * Event: Navigate to word lists from finale
 */
export type TryNewWordsEvent = {
  type: 'TRY_NEW_WORDS';
};

/**
 * Union type of all StorySessionMachine events
 */
export type StorySessionEvent =
  | StartStoryEvent
  | NarrativeSeenEvent
  | ChoiceMadeEvent
  | GameCompletedEvent
  | ContinueStoryEvent
  | SkipCheckpointEvent
  | RestartStoryEvent
  | SkipIntroEvent
  | TryNewWordsEvent;

/**
 * Input provided when creating StorySessionMachine
 */
export interface StorySessionInput {
  wordList: WordList;
  theme?: string;
  wordListId?: string;
  hasSeenIntro?: boolean;
  generatedStory?: GeneratedStory;
}
