/**
 * Story Session State Machine
 *
 * XState 5.x machine for orchestrating story beat progression
 * Handles multiple beat types: game, choice, narrative, checkpoint
 */

import { markStoryIntroAsSeen } from '@/lib/storage/story-progress-storage';
import { getStoryContent } from '@/lib/story/content';
import { storyProgressMachine } from '@/lib/story/machines/storyProgressMachine';
import {
  allWordsMastered,
  getWordsNeedingPractice,
  initializeWordStats,
  updateWordStats,
} from '@/lib/story/word-stats';
import type {
  CheckpointBeat,
  GameBeat,
  StorySessionContext,
  StorySessionEvent,
  StorySessionInput,
  WordStats,
} from '@/types/story';
import { assign, createMachine } from 'xstate';

/**
 * Story Session Machine
 *
 * Manages beat-based story progression with LLM-generated narrative
 */
export const storySessionMachine = createMachine(
  {
    /** @xstate-layout N8IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEkB5AOQFEBBAFQEEAlAGQDkBtABgF1EoAA4B7WLgAuuPiAAeiAIwBWAJwAGAKwA2DQHYjOgEwB2VdoA0IAJ6IjTgMzmAzBYDs6ww51OrAX29bNCw8IlJyKhp6RhY2Di4efkERRABmawBaXNzswJzkPz9UjDZOHj4BIVFEEwAWVx0NADYjDWtEJwBOJyrzDQs7Z1cvX3QMLFwCYlIKanomVg4ufkFRHIM1XQMNJyrtfVMNXV01DUNGo0R67RaTFr0jXTqetwHUdCwcAkISMkpaenZudwQKIxI4pZJpMAlYCocoVKq1eqNZqtNotNriTqIJaGayqbT6bS7O5OAh6Rx6Ox3KweX73FQmQHYIGg8GQmFwuH5JEo1IY7J4grFeRlBSVaofOrffT-UGIcHqOwGLS6XRnLR6OqOFzuXxmdxk54UzzTLaqTS-GYmNoY16uEmYj7YpW2VXVDV1GkMxAspks9kchqpNJcvkirGFYqlbW4mR4n7qyE6-V6IzaDRaGlGIx2ZF-OYGx6Ie0bOw6ewaDSucxOIxB1qht7EpX+tW2DXaqwWAw6Yxh-4F+w6QxeqnGEyeDS56weCxucw6V1uL2VhdB0m+qnU2w1swmNs+OxFhCrqweCwY8fBxAaQwY1ruSxOCyMj2L9z0ZWe+s+QL2a2aNoGJbFqy9bTuyVYclyi5ViyC7-tud4VmO7gbgO6gaBiGZfp+LZcmW1ZlvBCBlkOo5QVBTikfuuKXhSxJaOGDRaBamiBgWuhTLiHp+MRj6Cc+w6vo2FaoRAH5fvWv4AaBk6TtO07zvOS4LsBxaacuPbSRh2HNtiFGYv40yhp4mgaIxWi9qKugaHctJGCYQomkZCamEx7EcdWXHlrxA4CZuQlCU2ImSRWUl-h2ClJsOMRzou8lSeulbKZ23aYVA-RmNorjmLUGKBpo-pOXJW7nOhkxkWStIvHyiDDk+eHyY+in5mZ2n+Xp-pBSFDkOFFrktS5nnYT5nHOj+Hn+VFWUxQlimybJnlpRlWV9qOrYdh+9YqR+imbhG7YeD0ri9mZZgGBYwZOOaGIMXFelMfJnUKV1g31Ygc0pdFflLVNUWLQlG1pVtO17V1kkDVpQ3tqx5lubo+g+AYj22NSDpuh4E33JROgGOYH2xTAR4LnAq0Zb1-WDcNvHZfxgXpZ2I71jNdI4iYDQ2J4dqONi-ThrR23vZ9Q7qdOjr-XOsOJotqxLWta2Q9D+1dcdmUw-DMM3XDt3bvSQY2Bi3p2gYPhWr0xPkzipqNJdOhWqUjT+K92hvb9XQM01bBXWNcU3Rzs1K-NItrTL20a9lC0XUrLoa2ztPDgAmh4JM0kdJSdhsz0hhhnUpE6O4H3qDoQA */
    id: 'storySession',
    initial: 'idle',

    types: {} as {
      context: StorySessionContext;
      events: StorySessionEvent;
      input: StorySessionInput;
    },

    context: ({ input }: { input: StorySessionInput }) => ({
      // Input (provided at machine creation)
      wordList: input.wordList,
      storyTheme: input.theme || 'space',

      // Generated story structure (passed in from outside)
      generatedStory: input.generatedStory || null,
      currentBeatIndex: 0,
      currentBeat: null,

      // Phase tracking
      currentPhase: 'stage1' as 'stage1' | 'stage2',

      // Word stats tracking
      wordStats: new Map<string, WordStats>(),
      userChoices: [],
      gameResults: [],

      // Story integration
      storyProgressActor: null,

      // Checkpoint data
      currentCheckpoint: null,
      canContinueStory: false,

      // Content
      introContent: null,
      finaleContent: null,

      // Session tracking
      sessionStartTime: new Date(),
      sessionStartTimeMs: Date.now(),
      wordListId: input.wordListId || input.wordList.id,
      hasSeenIntro: input.hasSeenIntro || false,
    }),

    states: {
      idle: {
        entry: ['spawnStoryProgressActor', 'initializeWordStats', 'loadIntroContent'],
        always: 'showingIntro',
      },

      showingIntro: {
        on: {
          START_STORY: {
            target: 'processingBeat',
            actions: ['markIntroAsSeen', 'loadCurrentBeat'],
          },
          SKIP_INTRO: {
            target: 'processingBeat',
            actions: ['markIntroAsSeen', 'loadCurrentBeat'],
          },
        },
      },

      processingBeat: {
        initial: 'showingNarrative',
        always: [
          {
            guard: 'shouldShowFinale',
            target: 'finale',
          },
          {
            guard: 'isNarrativeBeat',
            target: '.showingNarrative',
          },
          {
            guard: 'isChoiceBeat',
            target: '.presentingChoice',
          },
          {
            guard: 'isGameBeat',
            target: '.playingGame',
          },
          {
            guard: 'isCheckpointBeat',
            target: '.showingCheckpoint',
          },
          {
            // No more beats and not caught by shouldShowFinale
            target: 'finale',
          },
        ],

        states: {
          showingNarrative: {
            on: {
              NARRATIVE_SEEN: {
                actions: ['advanceBeatIndex', 'loadCurrentBeat'],
                target: '#storySession.processingBeat',
              },
            },
          },

          presentingChoice: {
            on: {
              CHOICE_MADE: {
                actions: ['recordChoice', 'advanceBeatIndex', 'loadCurrentBeat'],
                target: '#storySession.processingBeat',
              },
            },
          },

          playingGame: {
            on: {
              GAME_COMPLETED: {
                actions: [
                  'updateWordStatsAfterGame',
                  'notifyStoryProgress',
                  'advanceBeatIndex',
                  'loadCurrentBeat',
                ],
                target: '#storySession.processingBeat',
              },
            },
          },

          showingCheckpoint: {
            entry: ['loadCheckpointData', 'resetContinueDelay'],
            on: {
              CONTINUE_STORY: {
                actions: ['acknowledgeCheckpoint', 'advanceBeatIndex', 'loadCurrentBeat'],
                target: '#storySession.processingBeat',
              },
              SKIP_CHECKPOINT: {
                actions: ['advanceBeatIndex', 'loadCurrentBeat'],
                target: '#storySession.processingBeat',
              },
            },
            after: {
              5000: {
                actions: 'enableContinueButton',
              },
            },
          },
        },
      },

      finale: {
        entry: 'loadFinaleContent',
        on: {
          RESTART_STORY: {
            target: 'idle',
          },
          TRY_NEW_WORDS: {
            actions: 'navigateToWordLists',
          },
        },
      },
    },
  },
  {
    actions: {
      /**
       * Spawn StoryProgressMachine as child actor
       */
      spawnStoryProgressActor: assign({
        storyProgressActor: ({ spawn }) => spawn(storyProgressMachine, { id: 'storyProgress' }),
      }),

      /**
       * Initialize word stats for all words in list
       */
      initializeWordStats: assign(({ context }) => ({
        wordStats: initializeWordStats(context.wordList.words),
      })),

      /**
       * Load intro content from story theme
       */
      loadIntroContent: assign(({ context }) => {
        const content = getStoryContent(context.storyTheme as any);
        return {
          introContent: content.intro,
        };
      }),

      /**
       * Load current beat from generated story
       */
      loadCurrentBeat: assign(({ context }) => {
        if (!context.generatedStory) return {};

        const beat = context.generatedStory.stage1Beats[context.currentBeatIndex];
        return {
          currentBeat: beat || null,
        };
      }),

      /**
       * Record user's choice selection
       */
      recordChoice: assign(({ context, event }) => {
        if (event.type !== 'CHOICE_MADE') return {};

        return {
          userChoices: [
            ...context.userChoices,
            {
              beatId: context.currentBeat?.id || '',
              choice: event.choice,
            },
          ],
        };
      }),

      /**
       * Update word stats after game completion
       */
      updateWordStatsAfterGame: assign(({ context, event }) => {
        if (event.type !== 'GAME_COMPLETED') return {};

        const currentBeat = context.currentBeat as GameBeat | null;
        if (!currentBeat || currentBeat.type !== 'game') return {};

        const word = currentBeat.word;
        const currentStats = context.wordStats.get(word);

        if (!currentStats) return {};

        const updatedStats = updateWordStats(currentStats, event.result);
        const newWordStats = new Map(context.wordStats);
        newWordStats.set(word, updatedStats);

        return {
          wordStats: newWordStats,
        };
      }),

      /**
       * Notify StoryProgressMachine of game completion
       */
      notifyStoryProgress: ({ context }) => {
        context.storyProgressActor?.send({ type: 'GAME_COMPLETED' });
      },

      /**
       * Advance to next beat
       */
      advanceBeatIndex: assign(({ context }) => ({
        currentBeatIndex: context.currentBeatIndex + 1,
      })),

      /**
       * Load checkpoint data from current beat
       */
      loadCheckpointData: assign(({ context }) => {
        const beat = context.currentBeat as CheckpointBeat | null;
        if (!beat || beat.type !== 'checkpoint') return {};

        return {
          currentCheckpoint: beat,
        };
      }),

      /**
       * Reset continue button delay state
       */
      resetContinueDelay: assign({
        canContinueStory: false,
      }),

      /**
       * Enable continue button after delay
       */
      enableContinueButton: assign({
        canContinueStory: true,
      }),

      /**
       * Acknowledge checkpoint with child machine
       */
      acknowledgeCheckpoint: ({ context }) => {
        context.storyProgressActor?.send({ type: 'CONTINUE_STORY' });
      },

      /**
       * Load finale content from story theme
       */
      loadFinaleContent: assign(({ context }) => {
        const content = getStoryContent(context.storyTheme as any);
        return {
          finaleContent: content.finale,
        };
      }),

      /**
       * Mark intro as seen in storage and update context
       */
      markIntroAsSeen: assign(({ context }) => {
        // Async storage operation (fire and forget)
        markStoryIntroAsSeen(context.wordListId).catch(error => {
          console.error('Error marking intro as seen:', error);
        });

        return {
          hasSeenIntro: true,
        };
      }),

      /**
       * Navigate to word lists page
       */
      navigateToWordLists: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/word-lists';
        }
      },
    },

    guards: {
      /**
       * Check if current beat is a narrative beat
       */
      isNarrativeBeat: ({ context }) => {
        return context.currentBeat?.type === 'narrative';
      },

      /**
       * Check if current beat is a choice beat
       */
      isChoiceBeat: ({ context }) => {
        return context.currentBeat?.type === 'choice';
      },

      /**
       * Check if current beat is a game beat
       */
      isGameBeat: ({ context }) => {
        return context.currentBeat?.type === 'game';
      },

      /**
       * Check if current beat is a checkpoint beat
       */
      isCheckpointBeat: ({ context }) => {
        return context.currentBeat?.type === 'checkpoint';
      },

      /**
       * Check if should show finale
       * - All beats exhausted OR
       * - All words mastered
       */
      shouldShowFinale: ({ context }) => {
        if (!context.generatedStory) return false;

        // Check if all beats exhausted
        const beatsExhausted =
          context.currentBeatIndex >= context.generatedStory.stage1Beats.length;

        // Check if all words mastered
        const wordsMastered = allWordsMastered(context.wordStats, 80);

        return beatsExhausted || wordsMastered;
      },

      /**
       * Check if there are more beats
       */
      hasMoreBeats: ({ context }) => {
        if (!context.generatedStory) return false;
        return context.currentBeatIndex < context.generatedStory.stage1Beats.length;
      },

      /**
       * Check if should transition to Stage 2
       */
      shouldTransitionToStage2: ({ context }) => {
        if (context.currentPhase === 'stage2') return false;
        if (!context.generatedStory) return false;

        // Stage 1 complete when all Stage 1 beats done
        const stage1Complete =
          context.currentBeatIndex >= context.generatedStory.stage1Beats.length;

        // Check if there are words needing practice
        const needsPractice = getWordsNeedingPractice(context.wordStats, 70);

        return stage1Complete && needsPractice.length > 0;
      },
    },
  },
);
