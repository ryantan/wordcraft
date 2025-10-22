/**
 * OpenAI Client Tests
 */

import OpenAI from 'openai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OpenAIAPIError } from './client';
import { generateStoryContent } from './story-integration';

// Mock OpenAI module
vi.mock('openai');

// Mock environment module
vi.mock('@/lib/env', () => ({
  serverEnv: {
    openai: {
      apiKey: 'test-api-key',
      model: 'gpt-4o-mini',
      maxTokens: 500,
      temperature: 0.8,
    },
  },
}));

// Set test environment
process.env.OPENAI_API_KEY = 'test-api-key';

describe('OpenAI Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('generateStoryContent', () => {
    it('should generate story content successfully', async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: 'Generated story content',
                  },
                },
              ],
              usage: {
                prompt_tokens: 100,
                completion_tokens: 50,
                total_tokens: 150,
              },
            }),
          },
        },
      } as unknown as OpenAI;

      const result = await generateStoryContent(mockClient, {
        theme: 'space',
        wordList: ['star', 'moon'],
        beatType: 'narrative',
        context: 'Previous story context',
      });

      expect(result.content).toBe('Generated story content');
      expect(result.usage).toEqual({
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      });

      expect(mockClient.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: expect.any(Array),
        temperature: 0.8,
        max_tokens: 500,
      });
    });

    it('should handle OpenAI API errors', async () => {
      const mockError = new OpenAI.APIError(
        400,
        { status: 400, headers: {}, error: { message: 'API Error' } },
        'invalid_request',
        undefined,
      );

      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(mockError),
          },
        },
      } as unknown as OpenAI;

      await expect(
        generateStoryContent(mockClient, {
          theme: 'space',
          wordList: ['star'],
        }),
      ).rejects.toThrow(OpenAIAPIError);
    });

    it('should handle empty response content', async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: null,
                  },
                },
              ],
            }),
          },
        },
      } as unknown as OpenAI;

      const result = await generateStoryContent(mockClient, {
        theme: 'space',
        wordList: ['star'],
      });

      expect(result.content).toBe('');
    });
  });
});
