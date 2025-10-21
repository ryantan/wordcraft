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

/**
 * Request timeout for story generation (3 seconds as per AC 5)
 */
const STORY_GENERATION_TIMEOUT = 3000

/**
 * OpenAI API response structure for story generation
 */
interface OpenAIStoryResponse {
  stage1Beats: Array<{
    type: 'game' | 'choice' | 'narrative' | 'checkpoint'
    id: string
    narrative: string
    word?: string
    gameType?: string
    stage?: number
    question?: string
    options?: [string, string]
    checkpointNumber?: number
    celebrationEmoji?: string
    title?: string
  }>
}

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

    // Generate story content with timeout
    const response = await withTimeout(
      withRetry(async () => {
        return await generateStoryContent(client, {
          theme: input.theme,
          wordList: input.wordList,
          beatType: 'narrative',
          context: buildStoryGenerationPrompt(input),
        })
      }),
      STORY_GENERATION_TIMEOUT
    )

    // Parse and validate response
    const parsedStory = parseOpenAIResponse(response.content, input)
    if (!parsedStory) {
      console.warn('Failed to parse OpenAI story response')
      return null
    }

    return parsedStory
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
1. Game Beats: Spelling challenges for each word
2. Narrative Beats: Story progression (every 3-4 beats)
3. Choice Beats: Interactive decisions (2-3 total)
4. Checkpoint Beats: Celebrations at positions 5, 10, 15

THEME ELEMENTS FOR ${theme.toUpperCase()}:
${getThemeElements(theme)}

STRUCTURE REQUIREMENTS:
- Start with narrative setup
- Each word gets a game beat
- Intersperse narrative beats for story flow
- Add choice beats for engagement
- Include checkpoint celebrations

RESPONSE FORMAT:
Return valid JSON matching this structure:
{
  "stage1Beats": [
    {
      "type": "narrative",
      "id": "narrative-1",
      "narrative": "Your adventure begins in the cosmic depths of space..."
    },
    {
      "type": "game",
      "id": "game-rocket-stage1",
      "narrative": "A space beacon signals 'ROCKET' - spell it to unlock the next sector!",
      "word": "ROCKET",
      "gameType": "letterMatching",
      "stage": 1
    },
    {
      "type": "choice",
      "id": "choice-1",
      "narrative": "You reach a cosmic crossroads...",
      "question": "Which path through the nebula looks safer?",
      "options": ["Navigate left", "Navigate right"]
    },
    {
      "type": "checkpoint",
      "id": "checkpoint-1",
      "narrative": "Amazing progress! You've mastered 5 cosmic words and earned a stellar achievement!",
      "checkpointNumber": 1,
      "celebrationEmoji": "🌟",
      "title": "Stellar Speller"
    }
  ]
}

Generate the complete story now:`
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
 * Parse OpenAI response into GeneratedStory structure
 */
function parseOpenAIResponse(
  content: string,
  input: StoryGenerationInput
): GeneratedStory | null {
  try {
    // Clean and parse JSON response
    const cleanContent = content.trim()
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn('No JSON found in OpenAI response')
      return null
    }

    const parsed: OpenAIStoryResponse = JSON.parse(jsonMatch[0])
    if (!parsed.stage1Beats || !Array.isArray(parsed.stage1Beats)) {
      console.warn('Invalid story structure in OpenAI response')
      return null
    }

    // Convert to proper beat types
    const stage1Beats: StoryBeat[] = parsed.stage1Beats.map((beat, index) => {
      const baseProps = {
        id: beat.id || `beat-${index}`,
        narrative: beat.narrative || 'Continue your adventure...',
      }

      switch (beat.type) {
        case 'game':
          return {
            ...baseProps,
            type: 'game',
            word: beat.word || input.wordList[0],
            gameType: (beat.gameType as any) || 'letterMatching',
            stage: (beat.stage as 1 | 2) || 1,
          } as GameBeat

        case 'choice':
          return {
            ...baseProps,
            type: 'choice',
            question: beat.question || 'What should you do?',
            options: beat.options || ['Option A', 'Option B'],
          } as ChoiceBeat

        case 'checkpoint':
          return {
            ...baseProps,
            type: 'checkpoint',
            checkpointNumber: (beat.checkpointNumber as 1 | 2 | 3) || 1,
            celebrationEmoji: beat.celebrationEmoji || '🎉',
            title: beat.title || 'Great Progress!',
          } as CheckpointBeat

        default:
          return {
            ...baseProps,
            type: 'narrative',
          } as NarrativeBeat
      }
    })

    // Validate story structure
    const gameBeats = stage1Beats.filter(b => b.type === 'game') as GameBeat[]
    const requiredWords = new Set(input.wordList)
    const coveredWords = new Set(gameBeats.map(b => b.word))

    // Ensure all words are covered
    for (const word of requiredWords) {
      if (!coveredWords.has(word)) {
        console.warn(`Missing game beat for word: ${word}`)
        // Add missing game beat
        stage1Beats.push({
          type: 'game',
          id: `game-${word}-generated`,
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
  } catch (error) {
    console.error('Failed to parse OpenAI story response:', error)
    return null
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