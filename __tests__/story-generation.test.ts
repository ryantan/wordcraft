/**
 * Story Generation Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateStory, generateStoryAsync } from '@/lib/story/story-generator'
import type { StoryGenerationInput } from '@/types/story'

// Mock OpenAI service to control test behavior
vi.mock('@/lib/openai/story-service', () => ({
  generateStoryWithOpenAI: vi.fn(),
  validateStoryContent: vi.fn(),
  logStoryMetrics: vi.fn(),
}))

// Mock environment
vi.mock('@/lib/env', () => ({
  env: {
    enableOpenAIStoryGeneration: false, // Disabled by default for tests
  },
}))

describe('Story Generation Integration', () => {
  const mockInput: StoryGenerationInput = {
    wordList: ['rocket', 'space', 'alien', 'planet', 'star'],
    theme: 'space',
    targetBeats: 15,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console methods
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('generateStory (synchronous)', () => {
    it('should generate story using template system', () => {
      const result = generateStory(mockInput)

      expect(result).toBeDefined()
      expect(result.stage1Beats).toBeDefined()
      expect(result.stage1Beats.length).toBeGreaterThan(0)
      expect(result.stage2ExtraBeats).toBeDefined()
      expect(result.stage2FixedSequence).toBeDefined()
    })

    it('should include all words in game beats', () => {
      const result = generateStory(mockInput)
      const gameBeats = result.stage1Beats.filter(beat => beat.type === 'game')
      const wordsInBeats = gameBeats.map(beat => 
        beat.type === 'game' ? beat.word : null
      ).filter(Boolean)

      // All words should be represented
      for (const word of mockInput.wordList) {
        expect(wordsInBeats).toContain(word)
      }
    })

    it('should include different beat types', () => {
      const result = generateStory(mockInput)
      const beatTypes = result.stage1Beats.map(beat => beat.type)

      expect(beatTypes).toContain('game')
      expect(beatTypes).toContain('narrative')
      expect(beatTypes).toContain('choice')
    })

    it('should include checkpoint beats for longer word lists', () => {
      const longInput: StoryGenerationInput = {
        wordList: Array.from({ length: 10 }, (_, i) => `word${i + 1}`),
        theme: 'space',
        targetBeats: 20,
      }

      const result = generateStory(longInput)
      const checkpointBeats = result.stage1Beats.filter(beat => beat.type === 'checkpoint')
      
      expect(checkpointBeats.length).toBeGreaterThan(0)
    })
  })

  describe('generateStoryAsync (asynchronous)', () => {
    it('should use template fallback when OpenAI is disabled', async () => {
      const result = await generateStoryAsync(mockInput)

      expect(result).toBeDefined()
      expect(result.stage1Beats).toBeDefined()
      expect(result.stage1Beats.length).toBeGreaterThan(0)
    })

    it('should attempt OpenAI generation when enabled', async () => {
      // Enable OpenAI for this test
      const { env } = await import('@/lib/env')
      vi.mocked(env).enableOpenAIStoryGeneration = true

      const { generateStoryWithOpenAI } = await import('@/lib/openai/story-service')
      vi.mocked(generateStoryWithOpenAI).mockResolvedValue(null) // Simulate failure

      const result = await generateStoryAsync(mockInput)

      expect(generateStoryWithOpenAI).toHaveBeenCalledWith(mockInput)
      expect(result).toBeDefined() // Should fall back to template
    })

    it('should use OpenAI result when generation succeeds', async () => {
      // Enable OpenAI for this test
      const { env } = await import('@/lib/env')
      vi.mocked(env).enableOpenAIStoryGeneration = true

      const mockOpenAIResult = {
        stage1Beats: [
          {
            type: 'narrative' as const,
            id: 'ai-narrative-1',
            narrative: 'AI-generated story begins...',
          },
          {
            type: 'game' as const,
            id: 'ai-game-1',
            narrative: 'AI-generated game challenge!',
            word: 'rocket',
            gameType: 'letterMatching' as const,
            stage: 1 as const,
          },
        ],
        stage2ExtraBeats: new Map(),
        stage2FixedSequence: [],
      }

      const { generateStoryWithOpenAI, validateStoryContent } = await import('@/lib/openai/story-service')
      vi.mocked(generateStoryWithOpenAI).mockResolvedValue(mockOpenAIResult)
      vi.mocked(validateStoryContent).mockReturnValue(true)

      const result = await generateStoryAsync(mockInput)

      expect(result.stage1Beats[0].id).toBe('ai-narrative-1')
      expect(result.stage1Beats[0].narrative).toContain('AI-generated')
    })

    it('should fall back to templates when OpenAI generates invalid content', async () => {
      // Enable OpenAI for this test
      const { env } = await import('@/lib/env')
      vi.mocked(env).enableOpenAIStoryGeneration = true

      const mockInvalidResult = {
        stage1Beats: [],
        stage2ExtraBeats: new Map(),
        stage2FixedSequence: [],
      }

      const { generateStoryWithOpenAI, validateStoryContent } = await import('@/lib/openai/story-service')
      vi.mocked(generateStoryWithOpenAI).mockResolvedValue(mockInvalidResult)
      vi.mocked(validateStoryContent).mockReturnValue(false)

      const result = await generateStoryAsync(mockInput)

      expect(result.stage1Beats.length).toBeGreaterThan(0) // Should have template content
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('invalid story content')
      )
    })
  })

  describe('Story Quality and Structure', () => {
    it('should generate age-appropriate content', () => {
      const result = generateStory(mockInput)
      const allNarratives = result.stage1Beats.map(beat => beat.narrative).join(' ')

      // Should not contain inappropriate words
      const inappropriateWords = ['kill', 'death', 'violence', 'scary', 'danger']
      for (const word of inappropriateWords) {
        expect(allNarratives.toLowerCase()).not.toContain(word)
      }
    })

    it('should generate coherent theme-based content', () => {
      const result = generateStory(mockInput)
      const allNarratives = result.stage1Beats.map(beat => beat.narrative).join(' ')

      // Space theme should contain space-related words
      const spaceWords = ['space', 'rocket', 'planet', 'galaxy', 'alien', 'cosmic']
      const hasSpaceContent = spaceWords.some(word => 
        allNarratives.toLowerCase().includes(word)
      )
      expect(hasSpaceContent).toBe(true)
    })

    it('should generate different game types for variety', () => {
      const longInput: StoryGenerationInput = {
        wordList: Array.from({ length: 10 }, (_, i) => `word${i + 1}`),
        theme: 'space',
        targetBeats: 20,
      }

      const result = generateStory(longInput)
      const gameBeats = result.stage1Beats.filter(beat => beat.type === 'game')
      const gameTypes = gameBeats.map(beat => 
        beat.type === 'game' ? beat.gameType : null
      ).filter(Boolean)

      const uniqueGameTypes = new Set(gameTypes)
      expect(uniqueGameTypes.size).toBeGreaterThan(1) // Should have variety
    })
  })
})