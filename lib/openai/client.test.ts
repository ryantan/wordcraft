/**
 * OpenAI Client Tests
 */

import OpenAI from 'openai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createOpenAIClient,
  OpenAIAPIError,
  testConnection,
  validateAPIKey,
  withRetry,
  withTimeout,
} from './client';

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

  describe('createOpenAIClient', () => {
    it('should create client with valid API key', () => {
      const mockClient = {};
      vi.mocked(OpenAI).mockImplementation(() => mockClient as OpenAI);

      const client = createOpenAIClient();

      expect(client).toBe(mockClient);
      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        maxRetries: 3,
        timeout: 30000,
      });
    });

    it('should throw error when API key is missing', async () => {
      // Temporarily clear the API key
      const originalApiKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      vi.resetModules();
      vi.doMock('@/lib/env', () => ({
        serverEnv: {
          openai: {
            apiKey: '',
            model: 'gpt-4o-mini',
            maxTokens: 500,
            temperature: 0.8,
          },
        },
      }));

      const { createOpenAIClient, OpenAIConfigError } = await import('./client');

      expect(() => createOpenAIClient()).toThrow(OpenAIConfigError);
      expect(() => createOpenAIClient()).toThrow('OPENAI_API_KEY environment variable is not set');

      // Restore the API key
      process.env.OPENAI_API_KEY = originalApiKey;
    });
  });

  describe('validateAPIKey', () => {
    it('should validate correct API key format', () => {
      expect(validateAPIKey('sk-1234567890123456789012')).toBe(true);
      expect(validateAPIKey('sk-proj-1234567890123456789012')).toBe(true);
    });

    it('should reject invalid API key formats', () => {
      expect(validateAPIKey('')).toBe(false);
      expect(validateAPIKey('invalid-key')).toBe(false);
      expect(validateAPIKey('sk-')).toBe(false);
      expect(validateAPIKey('sk-tooshort')).toBe(false);
    });
  });

  describe('testConnection', () => {
    it('should return true for successful connection', async () => {
      const mockClient = {
        models: {
          list: vi.fn().mockResolvedValue({
            data: [{ id: 'model-1' }],
          }),
        },
      } as unknown as OpenAI;

      const result = await testConnection(mockClient);
      expect(result).toBe(true);
    });

    it('should return false for failed connection', async () => {
      const mockClient = {
        models: {
          list: vi.fn().mockRejectedValue(new Error('Connection failed')),
        },
      } as unknown as OpenAI;

      const result = await testConnection(mockClient);
      expect(result).toBe(false);
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await withRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const result = await withRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Always fails'));

      await expect(withRetry(fn, 2)).rejects.toThrow('Always fails');
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('withTimeout', () => {
    it('should resolve before timeout', async () => {
      const promise = Promise.resolve('success');
      const result = await withTimeout(promise, 1000);

      expect(result).toBe('success');
    });

    it('should throw timeout error', async () => {
      const promise = new Promise(resolve => setTimeout(resolve, 2000));

      await expect(withTimeout(promise, 100)).rejects.toThrow(OpenAIAPIError);
      await expect(withTimeout(promise, 100)).rejects.toThrow('Request timed out');
    });
  });
});
