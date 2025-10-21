/**
 * OpenAI Story Service Tests
 */

import type { GeneratedStory, StoryGenerationInput } from '@/types/story';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  generateStoryWithOpenAI,
  logStoryMetrics,
  validateStoryContent,
  type StoryGenerationMetrics,
} from './story-service';

// Mock dependencies
vi.mock('./client', () => ({
  createOpenAIClient: vi.fn(),
  generateStoryContent: vi.fn(),
  withRetry: vi.fn(),
  withTimeout: vi.fn(),
  OpenAIAPIError: class extends Error {},
}));

vi.mock('@/lib/env', () => ({
  validateEnvironment: vi.fn(),
}));

describe('OpenAI Story Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateStoryWithOpenAI', () => {
    const mockInput: StoryGenerationInput = {
      wordList: ['rocket', 'space', 'alien'],
      theme: 'space',
      targetBeats: 10,
    };

    it('should return null on environment validation failure', async () => {
      const { validateEnvironment } = await import('@/lib/env');
      vi.mocked(validateEnvironment).mockImplementation(() => {
        throw new Error('Missing API key');
      });

      const result = await generateStoryWithOpenAI(mockInput);
      expect(result).toBeNull();
    });

    it('should return null on OpenAI API failure', async () => {
      const { validateEnvironment } = await import('@/lib/env');
      const { createOpenAIClient, withTimeout } = await import('./client');

      vi.mocked(validateEnvironment).mockImplementation(() => {});
      vi.mocked(createOpenAIClient).mockReturnValue({} as any);
      vi.mocked(withTimeout).mockRejectedValue(new Error('API failure'));

      const result = await generateStoryWithOpenAI(mockInput);
      expect(result).toBeNull();
    });

    it('should return null on invalid response parsing', async () => {
      const { validateEnvironment } = await import('@/lib/env');
      const { createOpenAIClient, withTimeout } = await import('./client');

      vi.mocked(validateEnvironment).mockImplementation(() => {});
      vi.mocked(createOpenAIClient).mockReturnValue({} as any);
      vi.mocked(withTimeout).mockResolvedValue({
        content: 'Invalid JSON response',
      });

      const result = await generateStoryWithOpenAI(mockInput);
      expect(result).toBeNull();
    });

    it('should parse valid OpenAI response correctly', async () => {
      const { validateEnvironment } = await import('@/lib/env');
      const { createOpenAIClient, withTimeout } = await import('./client');

      const mockResponse = {
        content: JSON.stringify({
          stage1Beats: [
            {
              type: 'narrative',
              id: 'narrative-1',
              narrative: 'Your space adventure begins...',
            },
            {
              type: 'game',
              id: 'game-rocket-1',
              narrative: 'Spell ROCKET to launch!',
              word: 'rocket',
              gameType: 'letterMatching',
              stage: 1,
            },
          ],
        }),
      };

      vi.mocked(validateEnvironment).mockImplementation(() => {});
      vi.mocked(createOpenAIClient).mockReturnValue({} as any);
      vi.mocked(withTimeout).mockResolvedValue(mockResponse);

      const result = await generateStoryWithOpenAI(mockInput);

      expect(result).not.toBeNull();
      expect(result?.stage1Beats.length).toBeGreaterThanOrEqual(2);
      expect(result?.stage1Beats[0].type).toBe('narrative');
      expect(result?.stage1Beats[1].type).toBe('game');

      // Should have game beats for all input words
      const gameBeats = result?.stage1Beats.filter(b => b.type === 'game');
      expect(gameBeats?.length).toBe(3); // All 3 words from mockInput
    });

    it('should ensure all words are covered in game beats', async () => {
      const { validateEnvironment } = await import('@/lib/env');
      const { createOpenAIClient, withTimeout } = await import('./client');

      const mockResponse = {
        content: JSON.stringify({
          stage1Beats: [
            {
              type: 'game',
              id: 'game-rocket-1',
              narrative: 'Spell ROCKET to launch!',
              word: 'rocket',
              gameType: 'letterMatching',
              stage: 1,
            },
            // Missing 'space' and 'alien' words
          ],
        }),
      };

      vi.mocked(validateEnvironment).mockImplementation(() => {});
      vi.mocked(createOpenAIClient).mockReturnValue({} as any);
      vi.mocked(withTimeout).mockResolvedValue(mockResponse);

      const result = await generateStoryWithOpenAI(mockInput);

      expect(result).not.toBeNull();
      const gameBeats = result?.stage1Beats.filter(b => b.type === 'game');
      expect(gameBeats).toHaveLength(3); // All 3 words should be covered
    });
  });

  describe('validateStoryContent', () => {
    it('should reject content with inappropriate keywords', () => {
      const story: GeneratedStory = {
        stage1Beats: [
          {
            type: 'narrative',
            id: 'narrative-1',
            narrative: 'This story contains violence and scary monsters.',
          },
        ],
        stage2ExtraBeats: new Map(),
        stage2FixedSequence: [],
      };

      const result = validateStoryContent(story);
      expect(result).toBe(false);
    });

    it('should reject stories with no game beats', () => {
      const story: GeneratedStory = {
        stage1Beats: [
          {
            type: 'narrative',
            id: 'narrative-1',
            narrative: 'Just a narrative with no games.',
          },
        ],
        stage2ExtraBeats: new Map(),
        stage2FixedSequence: [],
      };

      const result = validateStoryContent(story);
      expect(result).toBe(false);
    });

    it('should reject stories with narratives that are too short', () => {
      const story: GeneratedStory = {
        stage1Beats: [
          {
            type: 'game',
            id: 'game-1',
            narrative: 'Go!', // Too short
            word: 'rocket',
            gameType: 'letterMatching',
            stage: 1,
          },
        ],
        stage2ExtraBeats: new Map(),
        stage2FixedSequence: [],
      };

      const result = validateStoryContent(story);
      expect(result).toBe(false);
    });

    it('should accept valid story content', () => {
      const story: GeneratedStory = {
        stage1Beats: [
          {
            type: 'narrative',
            id: 'narrative-1',
            narrative: 'Your exciting space adventure begins with wonder and discovery.',
          },
          {
            type: 'game',
            id: 'game-1',
            narrative: 'A space beacon signals ROCKET - spell it to proceed!',
            word: 'rocket',
            gameType: 'letterMatching',
            stage: 1,
          },
        ],
        stage2ExtraBeats: new Map(),
        stage2FixedSequence: [],
      };

      const result = validateStoryContent(story);
      expect(result).toBe(true);
    });
  });

  describe('logStoryMetrics', () => {
    it('should log successful generation metrics', () => {
      const metrics: StoryGenerationMetrics = {
        startTime: 1000,
        endTime: 2000,
        duration: 1000,
        success: true,
        fallbackUsed: false,
        wordCount: 5,
        beatCount: 10,
      };

      logStoryMetrics(metrics);
      expect(console.info).toHaveBeenCalledWith(
        'Story generation completed:',
        expect.objectContaining({
          duration: '1000ms',
          success: true,
          fallback: false,
          words: 5,
          beats: 10,
        }),
      );
    });

    it('should log failed generation metrics with error', () => {
      const metrics: StoryGenerationMetrics = {
        startTime: 1000,
        endTime: 2000,
        duration: 1000,
        success: false,
        fallbackUsed: true,
        wordCount: 5,
        beatCount: 0,
        error: 'API timeout',
      };

      logStoryMetrics(metrics);
      expect(console.warn).toHaveBeenCalledWith(
        'Story generation failed:',
        expect.objectContaining({
          duration: '1000ms',
          success: false,
          fallback: true,
          words: 5,
          beats: 0,
          error: 'API timeout',
        }),
      );
    });
  });
});
