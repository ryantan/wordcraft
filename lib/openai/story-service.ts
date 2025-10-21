/**
 * OpenAI Story Generation Service
 *
 * Provides comprehensive story generation using OpenAI API
 * Generates complete story structures with coherent narratives
 */

import type {
  StoryGenerationInput,
  GeneratedStory,
  StoryBeat,
  GameBeat,
  ChoiceBeat,
  NarrativeBeat,
  CheckpointBeat,
} from '@/types/story'
import {
  createOpenAIClient,
  generateStoryContent,
  withRetry,
  withTimeout,
  OpenAIAPIError,
} from './client'
import { validateEnvironment } from '@/lib/env'
import { 
  getStoryGenerationJsonSchema, 
  validateAndTransformOpenAIResponse,
  type OpenAIStoryResponse 
} from './story-schema'

/**
 * Request timeout for story generation (3 seconds as per AC 5)
 */
const STORY_GENERATION_TIMEOUT = 30000


/**
 * Generate a complete story using OpenAI
 * @param input - Story generation parameters
 * @returns Generated story structure or null if generation fails
 */
export async function generateStoryWithOpenAI(
  input: StoryGenerationInput
): Promise<GeneratedStory | null> {
  console.log('generateStoryWithOpenAI start');
  try {
    // Validate environment and create client
    validateEnvironment()
    const client = createOpenAIClient()

    // Generate story content with timeout and JSON schema
    const response = await withTimeout(
      withRetry(async () => {
        return await generateStoryContent(
          client, 
          {
            theme: input.theme,
            wordList: input.wordList,
            beatType: 'narrative',
            context: buildStoryGenerationPrompt(input),
          },
          getStoryGenerationJsonSchema()
        )
      }),
      STORY_GENERATION_TIMEOUT
    )

    // Parse JSON response
    let jsonData: unknown
    try {
      jsonData = JSON.parse(response.content)
    } catch (error) {
      console.error('Failed to parse OpenAI JSON response:', error)
      console.error('Response content:', response.content)
      return null
    }

    // Validate with Zod schema
    const validatedResponse = validateAndTransformOpenAIResponse(jsonData)
    if (!validatedResponse) {
      console.warn('OpenAI response failed validation')
      return null
    }

    // Transform to our internal GeneratedStory format
    return transformToGeneratedStory(validatedResponse, input)
  } catch (error) {
    if (error instanceof OpenAIAPIError) {
      console.error('OpenAI API error during story generation:', error.message)
    } else {
      console.error('Story generation failed:', error)
    }
    return null
  }
}

/**
 * Build comprehensive prompt for story generation
 */
function buildStoryGenerationPrompt(input: StoryGenerationInput): string {
  const { wordList, theme, targetBeats = wordList.length * 2 } = input

  return `Generate a complete ${theme}-themed educational story for children learning to spell.

REQUIREMENTS:
- Create exactly ${targetBeats} story beats
- Include all these words: ${wordList.join(', ')}
- Make it age-appropriate for children ages 5-10
- Ensure narrative coherence throughout
- Include educational spelling challenges

BEAT TYPES TO INCLUDE:
1. Game Beats: Spelling challenges for each word (use "letterMatching", "wordBuilding", "spellingChallenge", "wordScramble", or "missingLetters")
2. Narrative Beats: Story progression (every 3-4 beats)
3. Choice Beats: Interactive decisions (2-3 total)
4. Checkpoint Beats: Celebrations at positions 5, 10, 15

THEME ELEMENTS FOR ${theme.toUpperCase()}:
${getThemeElements(theme)}

STRUCTURE REQUIREMENTS:
- Start with narrative setup
- Each word gets a game beat with appropriate gameType
- Intersperse narrative beats for story flow
- Add choice beats for engagement
- Include checkpoint celebrations with titles and emojis

WORD LIST TO COVER:
${wordList.map(word => `- ${word.toUpperCase()}`).join('\n')}

Each word must appear exactly once in a game beat. Generate an engaging story that connects all words thematically.`
}

/**
 * Get theme-specific elements for prompt enhancement
 */
function getThemeElements(theme: string): string {
  const elements: Record<string, string> = {
    space: 'rockets, planets, aliens, stars, galaxies, space stations, astronauts, cosmic adventures',
    treasure: 'maps, chests, pirates, islands, gold, adventures, hidden treasures, mysterious clues',
    fantasy: 'wizards, dragons, castles, magic spells, enchanted forests, mystical creatures',
    ocean: 'submarines, sea creatures, coral reefs, underwater adventures, marine life',
    jungle: 'wild animals, dense forests, ancient temples, river crossings, exotic plants',
  }
  return elements[theme] || elements.space
}

/**
 * Transform validated OpenAI response to our internal GeneratedStory format
 */
function transformToGeneratedStory(
  validatedResponse: OpenAIStoryResponse,
  input: StoryGenerationInput
): GeneratedStory {
  // Convert validated schema types to our internal types
  const stage1Beats: StoryBeat[] = validatedResponse.stage1Beats.map((beat) => {
    const baseProps = {
      id: beat.id,
      narrative: beat.narrative,
    }

    switch (beat.type) {
      case 'game':
        return {
          ...baseProps,
          type: 'game',
          word: beat.word,
          gameType: beat.gameType,
          stage: beat.stage,
        } as GameBeat

      case 'choice':
        return {
          ...baseProps,
          type: 'choice',
          question: beat.question,
          options: beat.options,
        } as ChoiceBeat

      case 'checkpoint':
        return {
          ...baseProps,
          type: 'checkpoint',
          checkpointNumber: beat.checkpointNumber,
          celebrationEmoji: beat.celebrationEmoji || '🎉',
          title: beat.title,
        } as CheckpointBeat

      case 'narrative':
      default:
        return {
          ...baseProps,
          type: 'narrative',
        } as NarrativeBeat
    }
  })

  // Validate that all required words are covered
  const gameBeats = stage1Beats.filter(b => b.type === 'game') as GameBeat[]
  const requiredWords = new Set(input.wordList)
  const coveredWords = new Set(gameBeats.map(b => b.word))

  // Add missing words as game beats
  for (const word of requiredWords) {
    if (!coveredWords.has(word)) {
      console.warn(`Missing game beat for word: ${word}`)
      stage1Beats.push({
        type: 'game',
        id: `game-${word.toLowerCase()}-generated`,
        narrative: `Time to spell "${word.toUpperCase()}"!`,
        word,
        gameType: 'letterMatching',
        stage: 1,
      })
    }
  }

  return {
    stage1Beats,
    stage2ExtraBeats: new Map(),
    stage2FixedSequence: [],
  }
}


/**
 * Validate generated story content for quality and appropriateness
 */
export function validateStoryContent(story: GeneratedStory): boolean {
  // Check for inappropriate content keywords
  const inappropriateKeywords = [
    'violence', 'scary', 'death', 'kill', 'fight', 'weapon',
    'blood', 'hurt', 'danger', 'fear', 'nightmare'
  ]

  const allNarratives = story.stage1Beats
    .map(beat => beat.narrative.toLowerCase())
    .join(' ')

  for (const keyword of inappropriateKeywords) {
    if (allNarratives.includes(keyword)) {
      console.warn(`Inappropriate content detected: ${keyword}`)
      return false
    }
  }

  // Validate structure requirements
  const gameBeats = story.stage1Beats.filter(b => b.type === 'game')
  if (gameBeats.length === 0) {
    console.warn('Story contains no game beats')
    return false
  }

  // Check narrative coherence (basic length validation)
  const narratives = story.stage1Beats.map(b => b.narrative)
  const tooShort = narratives.filter(n => n.length < 10)
  const tooLong = narratives.filter(n => n.length > 200)

  if (tooShort.length > 0) {
    console.warn('Story contains narratives that are too short')
    return false
  }

  if (tooLong.length > narratives.length * 0.3) {
    console.warn('Story contains too many overly long narratives')
    return false
  }

  return true
}

/**
 * Performance monitoring for story generation
 */
export interface StoryGenerationMetrics {
  startTime: number
  endTime: number
  duration: number
  success: boolean
  fallbackUsed: boolean
  wordCount: number
  beatCount: number
  error?: string
}

/**
 * Log story generation metrics for monitoring
 */
export function logStoryMetrics(metrics: StoryGenerationMetrics): void {
  const logData = {
    duration: `${metrics.duration}ms`,
    success: metrics.success,
    fallback: metrics.fallbackUsed,
    words: metrics.wordCount,
    beats: metrics.beatCount,
    ...(metrics.error && { error: metrics.error }),
  }

  if (metrics.success) {
    console.info('Story generation completed:', logData)
  } else {
    console.warn('Story generation failed:', logData)
  }
}