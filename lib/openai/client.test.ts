/**
 * OpenAI Client Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import OpenAI from 'openai'
import {
  createOpenAIClient,
  generateStoryContent,
  validateAPIKey,
  testConnection,
  withRetry,
  withTimeout,
  OpenAIConfigError,
  OpenAIAPIError,
} from './client'

// Mock OpenAI module
vi.mock('openai')

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
}))

// Set test environment
process.env.OPENAI_API_KEY = 'test-api-key'

describe('OpenAI Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('createOpenAIClient', () => {
    it('should create client with valid API key', () => {
      const mockClient = {}
      vi.mocked(OpenAI).mockImplementation(() => mockClient as any)

      const client = createOpenAIClient()

      expect(client).toBe(mockClient)
      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        maxRetries: 3,
        timeout: 30000,
      })
    })

    it('should throw error when API key is missing', async () => {
      // Temporarily clear the API key
      const originalApiKey = process.env.OPENAI_API_KEY
      delete process.env.OPENAI_API_KEY

      vi.resetModules()
      vi.doMock('@/lib/env', () => ({
        serverEnv: {
          openai: {
            apiKey: '',
            model: 'gpt-4o-mini',
            maxTokens: 500,
            temperature: 0.8,
          },
        },
      }))

      const { createOpenAIClient, OpenAIConfigError } = await import('./client')
      
      expect(() => createOpenAIClient()).toThrow(OpenAIConfigError)
      expect(() => createOpenAIClient()).toThrow('OPENAI_API_KEY environment variable is not set')
      
      // Restore the API key
      process.env.OPENAI_API_KEY = originalApiKey
    })
  })

  describe('generateStoryContent', () => {
    it('should generate story content successfully', async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: 'Generated story content',
                },
              }],
              usage: {
                prompt_tokens: 100,
                completion_tokens: 50,
                total_tokens: 150,
              },
            }),
          },
        },
      } as any

      const result = await generateStoryContent(mockClient, {
        theme: 'space',
        wordList: ['star', 'moon'],
        beatType: 'narrative',
        context: 'Previous story context',
      })

      expect(result.content).toBe('Generated story content')
      expect(result.usage).toEqual({
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      })

      expect(mockClient.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: expect.any(Array),
        temperature: 0.8,
        max_tokens: 500,
      })
    })

    it('should handle OpenAI API errors', async () => {
      const mockError = new OpenAI.APIError(
        'API Error',
        { message: 'API Error' },
        'invalid_request',
        {},
      )
      
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(mockError),
          },
        },
      } as any

      await expect(
        generateStoryContent(mockClient, {
          theme: 'space',
          wordList: ['star'],
        })
      ).rejects.toThrow(OpenAIAPIError)
    })

    it('should handle empty response content', async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: null,
                },
              }],
            }),
          },
        },
      } as any

      const result = await generateStoryContent(mockClient, {
        theme: 'space',
        wordList: ['star'],
      })

      expect(result.content).toBe('')
    })
  })

  describe('validateAPIKey', () => {
    it('should validate correct API key format', () => {
      expect(validateAPIKey('sk-1234567890123456789012')).toBe(true)
      expect(validateAPIKey('sk-proj-1234567890123456789012')).toBe(true)
    })

    it('should reject invalid API key formats', () => {
      expect(validateAPIKey('')).toBe(false)
      expect(validateAPIKey('invalid-key')).toBe(false)
      expect(validateAPIKey('sk-')).toBe(false)
      expect(validateAPIKey('sk-tooshort')).toBe(false)
    })
  })

  describe('testConnection', () => {
    it('should return true for successful connection', async () => {
      const mockClient = {
        models: {
          list: vi.fn().mockResolvedValue({
            data: [{ id: 'model-1' }],
          }),
        },
      } as any

      const result = await testConnection(mockClient)
      expect(result).toBe(true)
    })

    it('should return false for failed connection', async () => {
      const mockClient = {
        models: {
          list: vi.fn().mockRejectedValue(new Error('Connection failed')),
        },
      } as any

      const result = await testConnection(mockClient)
      expect(result).toBe(false)
    })
  })

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      const result = await withRetry(fn)

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and eventually succeed', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success')

      const result = await withRetry(fn)

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should throw after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Always fails'))

      await expect(withRetry(fn, 2)).rejects.toThrow('Always fails')
      expect(fn).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })
  })

  describe('withTimeout', () => {
    it('should resolve before timeout', async () => {
      const promise = Promise.resolve('success')
      const result = await withTimeout(promise, 1000)

      expect(result).toBe('success')
    })

    it('should throw timeout error', async () => {
      const promise = new Promise(resolve => setTimeout(resolve, 2000))

      await expect(withTimeout(promise, 100)).rejects.toThrow(OpenAIAPIError)
      await expect(withTimeout(promise, 100)).rejects.toThrow('Request timed out')
    })
  })
})