/**
 * useStoryProgress Hook
 *
 * React hook for managing story progress with XState machine
 */

import { getCheckpointContent, getFinaleContent, getIntroContent } from '@/lib/story/content';
import { initializeStoryProgress, storyProgressMachine } from '@/machines/story-progress';
import type { StoryProgressContext } from '@/machines/story-progress/types';
import { useMachine } from '@xstate/react';
import { useEffect, useState } from 'react';

export interface UseStoryProgressResult {
  // Current state
  currentState: string;
  currentCheckpoint: number;
  gamesCompleted: number;
  checkpointsUnlocked: number[];
  theme: string;

  // State checks
  isIntro: boolean;
  isPlaying: boolean;
  isAtCheckpoint: boolean;
  isFinale: boolean;

  // Current checkpoint details
  checkpointData: ReturnType<typeof getCheckpointContent> | null;
  introData: ReturnType<typeof getIntroContent> | null;
  finaleData: ReturnType<typeof getFinaleContent> | null;

  // Actions
  completeGame: () => void;
  continueStory: () => void;
  skipCheckpoint: () => void;
  resetStory: () => void;

  // Raw snapshot for advanced usage
  snapshot: any;
}

/**
 * Hook for managing story progress
 *
 * @param wordListId Optional word list ID for progress persistence
 * @param theme Story theme (default: 'space')
 * @returns Story progress state and actions
 */
export function useStoryProgress(
  wordListId?: string,
  theme: string = 'space',
): UseStoryProgressResult {
  const [initialContext, setInitialContext] = useState<StoryProgressContext | null>(null);

  // Load persisted progress on mount
  useEffect(() => {
    initializeStoryProgress().then(context => {
      setInitialContext({
        ...context,
        storyTheme: theme, // Override with current theme
      });
    });
  }, [wordListId, theme]);

  // Create machine actor with initial context
  const [snapshot, send] = useMachine(storyProgressMachine, {
    input: initialContext || undefined,
  });

  const context = snapshot.context;

  // Determine current state
  const currentState = snapshot.value as string;
  const isIntro = snapshot.matches('intro');
  const isPlaying = snapshot.matches('playing');
  const isAtCheckpoint =
    snapshot.matches('checkpoint1') ||
    snapshot.matches('checkpoint2') ||
    snapshot.matches('checkpoint3');
  const isFinale = snapshot.matches('finale');

  // Get current checkpoint content with interpolation
  const checkpointIndex = context.currentCheckpoint - 1;
  const checkpointData = isAtCheckpoint
    ? getCheckpointContent(theme, checkpointIndex, {
        wordCount: context.gamesCompleted,
      })
    : null;

  const introData = isIntro ? getIntroContent(theme) : null;
  const finaleData = isFinale
    ? getFinaleContent(theme, {
        wordCount: context.gamesCompleted,
      })
    : null;

  // Actions
  const completeGame = () => send({ type: 'GAME_COMPLETED' });
  const continueStory = () => send({ type: 'CONTINUE_STORY' });
  const skipCheckpoint = () => send({ type: 'SKIP_CHECKPOINT' });
  const resetStory = () => send({ type: 'STORY_RESET' });

  return {
    // Current state
    currentState,
    currentCheckpoint: context.currentCheckpoint,
    gamesCompleted: context.gamesCompleted,
    checkpointsUnlocked: context.checkpointsUnlocked,
    theme: context.storyTheme,

    // State checks
    isIntro,
    isPlaying,
    isAtCheckpoint,
    isFinale,

    // Content
    checkpointData,
    introData,
    finaleData,

    // Actions
    completeGame,
    continueStory,
    skipCheckpoint,
    resetStory,

    // Raw snapshot
    snapshot,
  };
}

/**
 * Hook for tracking story progress without machine control
 * Useful for displaying progress indicators
 */
export function useStoryProgressDisplay(wordListId?: string) {
  const [context, setContext] = useState<StoryProgressContext | null>(null);

  useEffect(() => {
    initializeStoryProgress().then(setContext);
  }, [wordListId]);

  if (!context) {
    return {
      gamesCompleted: 0,
      currentCheckpoint: 0,
      gamesUntilNext: 5,
      progress: 0,
    };
  }

  const thresholds = [5, 10, 15, 20];
  const nextThreshold = thresholds.find(t => t > context.gamesCompleted) || 20;
  const gamesUntilNext = nextThreshold - context.gamesCompleted;
  const progress = (context.gamesCompleted / nextThreshold) * 100;

  return {
    gamesCompleted: context.gamesCompleted,
    currentCheckpoint: context.currentCheckpoint,
    gamesUntilNext,
    progress: Math.min(100, progress),
  };
}
