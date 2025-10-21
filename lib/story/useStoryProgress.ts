/**
 * useStoryProgress Hook
 *
 * React hook for interacting with the Story Progress state machine
 */

'use client';

import { useMachine } from '@xstate/react';

import { storyProgressMachine } from './machines/storyProgressMachine';

/**
 * Hook for managing story progression state
 *
 * @returns Story progress state and control functions
 */
export function useStoryProgress() {
  const [state, send] = useMachine(storyProgressMachine);

  return {
    // Context values
    currentCheckpoint: state.context.currentCheckpoint,
    gamesCompleted: state.context.gamesCompleted,
    totalGamesInSession: state.context.totalGamesInSession,
    checkpointsUnlocked: state.context.checkpointsUnlocked,
    lastCheckpointAt: state.context.lastCheckpointAt,
    storyTheme: state.context.storyTheme,
    sessionStartTime: state.context.sessionStartTime,

    // State queries
    isAtCheckpoint:
      state.matches('checkpoint1') || state.matches('checkpoint2') || state.matches('checkpoint3'),
    isIntro: state.matches('intro'),
    isPlaying: state.matches('playing'),
    isCheckpoint1: state.matches('checkpoint1'),
    isCheckpoint2: state.matches('checkpoint2'),
    isCheckpoint3: state.matches('checkpoint3'),
    isFinale: state.matches('finale'),

    // Actions
    completeGame: () => send({ type: 'GAME_COMPLETED' }),
    continueStory: () => send({ type: 'CONTINUE_STORY' }),
    skipCheckpoint: () => send({ type: 'SKIP_CHECKPOINT' }),
    resetStory: () => send({ type: 'STORY_RESET' }),

    // Raw state for advanced use
    state,
    send,
  };
}
