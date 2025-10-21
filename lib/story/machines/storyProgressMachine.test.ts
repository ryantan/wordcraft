/**
 * Story Progress Machine Tests
 *
 * Comprehensive tests for story progression state machine
 */

import {
  deleteStoryProgress,
  loadStoryProgress,
  saveStoryProgress,
} from '@/lib/storage/story-progress-storage';
import { beforeEach, describe, expect, it } from 'vitest';
import { createActor } from 'xstate';

import { storyProgressMachine } from './storyProgressMachine';

// Mock localStorage and window for Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock window object for SSR-safe storage functions
Object.defineProperty(global, 'window', {
  value: {
    localStorage: localStorageMock,
  },
  writable: true,
});

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('StoryProgressMachine', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    deleteStoryProgress();
  });

  describe('Machine Initialization', () => {
    it('starts in intro state', () => {
      const actor = createActor(storyProgressMachine);
      actor.start();

      expect(actor.getSnapshot().matches('intro')).toBe(true);
      expect(actor.getSnapshot().context.gamesCompleted).toBe(0);
      expect(actor.getSnapshot().context.currentCheckpoint).toBe(0);
      expect(actor.getSnapshot().context.checkpointsUnlocked).toEqual([0]);

      actor.stop();
    });

    it('loads persisted state on initialization', () => {
      // Save state to localStorage
      const persistedContext = {
        currentCheckpoint: 2,
        gamesCompleted: 10,
        totalGamesInSession: 20,
        checkpointsUnlocked: [0, 1, 2],
        lastCheckpointAt: 10,
        storyTheme: 'treasure',
        sessionStartTime: new Date(),
      };
      saveStoryProgress(persistedContext);

      // Create new machine instance
      const actor = createActor(storyProgressMachine);
      actor.start();

      const snapshot = actor.getSnapshot();
      expect(snapshot.context.currentCheckpoint).toBe(2);
      expect(snapshot.context.gamesCompleted).toBe(10);
      expect(snapshot.context.checkpointsUnlocked).toEqual([0, 1, 2]);
      expect(snapshot.context.storyTheme).toBe('treasure');

      actor.stop();
    });
  });

  describe('State Transitions', () => {
    it('transitions from intro to playing on CONTINUE_STORY', () => {
      const actor = createActor(storyProgressMachine);
      actor.start();

      expect(actor.getSnapshot().matches('intro')).toBe(true);

      actor.send({ type: 'CONTINUE_STORY' });

      expect(actor.getSnapshot().matches('playing')).toBe(true);

      actor.stop();
    });

    it('increments gamesCompleted on GAME_COMPLETED event', () => {
      const actor = createActor(storyProgressMachine);
      actor.start();

      actor.send({ type: 'CONTINUE_STORY' });
      expect(actor.getSnapshot().context.gamesCompleted).toBe(0);

      actor.send({ type: 'GAME_COMPLETED' });
      expect(actor.getSnapshot().context.gamesCompleted).toBe(1);

      actor.send({ type: 'GAME_COMPLETED' });
      expect(actor.getSnapshot().context.gamesCompleted).toBe(2);

      actor.stop();
    });
  });

  describe('Checkpoint Progression', () => {
    it('advances to checkpoint1 after 5 games', () => {
      const actor = createActor(storyProgressMachine);
      actor.start();

      actor.send({ type: 'CONTINUE_STORY' });

      // Complete 4 games - should still be playing
      for (let i = 0; i < 4; i++) {
        actor.send({ type: 'GAME_COMPLETED' });
      }
      expect(actor.getSnapshot().matches('playing')).toBe(true);

      // Complete 5th game - should advance to checkpoint1
      actor.send({ type: 'GAME_COMPLETED' });
      expect(actor.getSnapshot().matches('checkpoint1')).toBe(true);
      expect(actor.getSnapshot().context.currentCheckpoint).toBe(1);
      expect(actor.getSnapshot().context.checkpointsUnlocked).toContain(1);

      actor.stop();
    });

    it('advances to checkpoint2 after 10 games', () => {
      const actor = createActor(storyProgressMachine);
      actor.start();

      actor.send({ type: 'CONTINUE_STORY' });

      // Complete 10 games
      for (let i = 0; i < 10; i++) {
        actor.send({ type: 'GAME_COMPLETED' });
        if (actor.getSnapshot().matches('checkpoint1')) {
          actor.send({ type: 'CONTINUE_STORY' });
        }
      }

      expect(actor.getSnapshot().matches('checkpoint2')).toBe(true);
      expect(actor.getSnapshot().context.currentCheckpoint).toBe(2);
      expect(actor.getSnapshot().context.checkpointsUnlocked).toContain(2);

      actor.stop();
    });

    it('advances to checkpoint3 after 15 games', () => {
      const actor = createActor(storyProgressMachine);
      actor.start();

      actor.send({ type: 'CONTINUE_STORY' });

      // Complete 15 games
      for (let i = 0; i < 15; i++) {
        actor.send({ type: 'GAME_COMPLETED' });
        const state = actor.getSnapshot();
        if (state.matches('checkpoint1') || state.matches('checkpoint2')) {
          actor.send({ type: 'CONTINUE_STORY' });
        }
      }

      expect(actor.getSnapshot().matches('checkpoint3')).toBe(true);
      expect(actor.getSnapshot().context.currentCheckpoint).toBe(3);
      expect(actor.getSnapshot().context.checkpointsUnlocked).toContain(3);

      actor.stop();
    });

    it('does not skip checkpoints', () => {
      const actor = createActor(storyProgressMachine);
      actor.start();

      actor.send({ type: 'CONTINUE_STORY' });

      // Complete games and verify sequential checkpoint progression
      const checkpoints: number[] = [];

      for (let i = 0; i < 20; i++) {
        actor.send({ type: 'GAME_COMPLETED' });
        const state = actor.getSnapshot();

        if (state.matches('checkpoint1') && !checkpoints.includes(1)) {
          checkpoints.push(1);
          actor.send({ type: 'CONTINUE_STORY' });
        } else if (state.matches('checkpoint2') && !checkpoints.includes(2)) {
          checkpoints.push(2);
          actor.send({ type: 'CONTINUE_STORY' });
        } else if (state.matches('checkpoint3') && !checkpoints.includes(3)) {
          checkpoints.push(3);
          actor.send({ type: 'CONTINUE_STORY' });
        }
      }

      // Verify checkpoints were reached in order
      expect(checkpoints).toEqual([1, 2, 3]);

      actor.stop();
    });

    it('allows skipping checkpoint screens', () => {
      const actor = createActor(storyProgressMachine);
      actor.start();

      actor.send({ type: 'CONTINUE_STORY' });

      // Complete 5 games to reach checkpoint1
      for (let i = 0; i < 5; i++) {
        actor.send({ type: 'GAME_COMPLETED' });
      }

      expect(actor.getSnapshot().matches('checkpoint1')).toBe(true);

      // Skip the checkpoint
      actor.send({ type: 'SKIP_CHECKPOINT' });

      expect(actor.getSnapshot().matches('playing')).toBe(true);

      actor.stop();
    });
  });

  describe('Persistence', () => {
    it('persists state to localStorage on game completion', () => {
      const actor = createActor(storyProgressMachine);
      actor.start();

      actor.send({ type: 'CONTINUE_STORY' });
      actor.send({ type: 'GAME_COMPLETED' });

      // Check localStorage was updated
      const saved = loadStoryProgress();
      expect(saved?.gamesCompleted).toBe(1);

      actor.stop();
    });

    it('persists state when reaching checkpoints', () => {
      const actor = createActor(storyProgressMachine);
      actor.start();

      actor.send({ type: 'CONTINUE_STORY' });

      // Complete 5 games to reach checkpoint1
      for (let i = 0; i < 5; i++) {
        actor.send({ type: 'GAME_COMPLETED' });
      }

      const saved = loadStoryProgress();
      expect(saved?.currentCheckpoint).toBe(1);
      expect(saved?.checkpointsUnlocked).toContain(1);

      actor.stop();
    });

    it('persists theme information', () => {
      const actor = createActor(storyProgressMachine, {
        input: { storyTheme: 'ocean' },
      });
      actor.start();

      actor.send({ type: 'CONTINUE_STORY' });
      actor.send({ type: 'GAME_COMPLETED' });

      const saved = loadStoryProgress();
      expect(saved?.storyTheme).toBe('ocean');

      actor.stop();
    });
  });

  describe('Story Reset', () => {
    it('resets to intro state on STORY_RESET', () => {
      const actor = createActor(storyProgressMachine);
      actor.start();

      actor.send({ type: 'CONTINUE_STORY' });

      // Progress the story
      for (let i = 0; i < 10; i++) {
        actor.send({ type: 'GAME_COMPLETED' });
        const state = actor.getSnapshot();
        if (state.matches('checkpoint1') || state.matches('checkpoint2')) {
          actor.send({ type: 'CONTINUE_STORY' });
        }
      }

      expect(actor.getSnapshot().context.gamesCompleted).toBeGreaterThan(0);

      // Reset
      actor.send({ type: 'STORY_RESET' });

      const snapshot = actor.getSnapshot();
      expect(snapshot.matches('intro')).toBe(true);
      expect(snapshot.context.gamesCompleted).toBe(0);
      expect(snapshot.context.currentCheckpoint).toBe(0);
      expect(snapshot.context.checkpointsUnlocked).toEqual([0]);

      actor.stop();
    });
  });

  describe('Context Management', () => {
    it('tracks last checkpoint reached', () => {
      const actor = createActor(storyProgressMachine);
      actor.start();

      actor.send({ type: 'CONTINUE_STORY' });

      // Complete 5 games to reach checkpoint1
      for (let i = 0; i < 5; i++) {
        actor.send({ type: 'GAME_COMPLETED' });
      }

      expect(actor.getSnapshot().context.lastCheckpointAt).toBe(5);

      actor.send({ type: 'CONTINUE_STORY' });

      // Complete 5 more games to reach checkpoint2
      for (let i = 0; i < 5; i++) {
        actor.send({ type: 'GAME_COMPLETED' });
      }

      expect(actor.getSnapshot().context.lastCheckpointAt).toBe(10);

      actor.stop();
    });

    it('maintains unique checkpoints in unlocked array', () => {
      const actor = createActor(storyProgressMachine);
      actor.start();

      actor.send({ type: 'CONTINUE_STORY' });

      // Reach checkpoint1
      for (let i = 0; i < 5; i++) {
        actor.send({ type: 'GAME_COMPLETED' });
      }

      const unlocked1 = actor.getSnapshot().context.checkpointsUnlocked;
      expect(unlocked1.filter(cp => cp === 1).length).toBe(1);

      actor.stop();
    });
  });
});
