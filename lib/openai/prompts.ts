/**
 * OpenAI Prompt Templates
 *
 * Manages prompt engineering for story generation
 * Provides structured templates for different beat types
 */

import type { StoryBeat, StoryTheme } from '@/types/story'

/**
 * Base prompt context for all story generation
 */
export const BASE_STORY_CONTEXT = {
  role: 'You are a creative children\'s story writer specializing in educational adventures.',
  guidelines: [
    'Keep language age-appropriate for children ages 5-10',
    'Make content engaging and interactive',
    'Use positive encouragement',
    'Avoid scary or inappropriate content',
    'Keep responses concise (2-3 sentences for narratives)',
  ],
}

/**
 * Theme-specific context and settings
 */
export const THEME_CONTEXTS: Record<StoryTheme, { setting: string; elements: string[] }> = {
  space: {
    setting: 'A thrilling space adventure exploring distant planets and galaxies',
    elements: ['rockets', 'planets', 'aliens', 'stars', 'space stations', 'asteroids'],
  },
  treasure: {
    setting: 'An exciting treasure hunt through mysterious lands',
    elements: ['maps', 'chests', 'pirates', 'islands', 'clues', 'gold coins'],
  },
  fantasy: {
    setting: 'A magical journey through enchanted kingdoms',
    elements: ['wizards', 'dragons', 'castles', 'spells', 'potions', 'magical creatures'],
  },
  ocean: {
    setting: 'An underwater adventure exploring the depths of the ocean',
    elements: ['submarines', 'fish', 'coral reefs', 'dolphins', 'treasure', 'mermaids'],
  },
  jungle: {
    setting: 'A wild expedition through dense jungle landscapes',
    elements: ['vines', 'animals', 'temples', 'rivers', 'bridges', 'hidden paths'],
  },
}

/**
 * Generate narrative beat prompt
 */
export function generateNarrativeBeatPrompt(
  theme: StoryTheme,
  context: string,
  progressPercentage: number
): string {
  const themeContext = THEME_CONTEXTS[theme]
  
  return `Theme: ${themeContext.setting}

Current story progress: ${progressPercentage}% complete

Previous context: ${context}

Generate a short narrative paragraph (2-3 sentences) that:
1. Advances the story naturally from the previous context
2. Builds excitement and momentum
3. Incorporates elements like: ${themeContext.elements.join(', ')}
4. Keeps the adventure moving forward

Remember: This is for children learning to spell, so keep it encouraging and fun!`
}

/**
 * Generate game beat prompt for a specific word
 */
export function generateGameBeatPrompt(
  theme: StoryTheme,
  word: string,
  gameType: string,
  context: string
): string {
  const themeContext = THEME_CONTEXTS[theme]
  
  return `Theme: ${themeContext.setting}

Word to practice: "${word}"
Game type: ${gameType}

Previous context: ${context}

Create an engaging story prompt that:
1. Naturally introduces a spelling challenge for the word "${word}"
2. Makes the challenge feel like part of the adventure
3. Uses theme elements creatively (${themeContext.elements.slice(0, 3).join(', ')})
4. Motivates the child to spell the word correctly

Example format: "The [theme element] displays the word '${word.toUpperCase()}' - spell it correctly to [achieve goal]!"

Keep it to 1-2 sentences, exciting and encouraging.`
}

/**
 * Generate choice beat prompt
 */
export function generateChoiceBeatPrompt(
  theme: StoryTheme,
  context: string,
  wordsRemaining: number
): string {
  const themeContext = THEME_CONTEXTS[theme]
  
  return `Theme: ${themeContext.setting}

Previous context: ${context}
Words remaining in adventure: ${wordsRemaining}

Create a story choice that:
1. Presents an interesting decision point in the adventure
2. Offers two clear, exciting options
3. Uses theme elements: ${themeContext.elements.slice(0, 3).join(', ')}
4. Both choices should be positive and lead to fun outcomes

Format your response as:
Question: [The choice question]
Option A: [First choice]
Option B: [Second choice]

Keep the question short and the options to 3-4 words each.`
}

/**
 * Generate checkpoint celebration prompt
 */
export function generateCheckpointPrompt(
  theme: StoryTheme,
  checkpointNumber: number,
  wordsCompleted: number
): string {
  const themeContext = THEME_CONTEXTS[theme]
  const checkpointNames = ['First', 'Second', 'Third']
  
  return `Theme: ${themeContext.setting}

Checkpoint: ${checkpointNames[checkpointNumber - 1]} milestone reached!
Words mastered: ${wordsCompleted}

Create a celebratory narrative (2-3 sentences) that:
1. Congratulates the child on their progress
2. References their spelling achievements
3. Builds excitement for continuing the adventure
4. Incorporates a special ${themeContext.elements[checkpointNumber - 1]} as a reward

Make it feel like a major accomplishment in their ${theme} adventure!`
}

/**
 * Validate and sanitize prompt inputs
 */
export function sanitizePromptInput(input: string): string {
  // Remove any potential prompt injection attempts
  return input
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
}

/**
 * Build complete system prompt for OpenAI
 */
export function buildSystemPrompt(): string {
  return `${BASE_STORY_CONTEXT.role}

Guidelines:
${BASE_STORY_CONTEXT.guidelines.map(g => `- ${g}`).join('\n')}

You're creating content for WordCraft, an educational spelling game.
Always maintain story continuity and theme consistency.`
}

/**
 * Format beat response into structured data
 */
export function parseGameBeatResponse(response: string, word: string, gameType: string): Partial<StoryBeat> {
  return {
    narrative: sanitizePromptInput(response),
    // Additional fields will be filled by the story generator
  }
}

/**
 * Format choice beat response
 */
export function parseChoiceBeatResponse(response: string): { question: string; options: [string, string] } {
  const lines = response.split('\n').filter(line => line.trim())
  
  // Parse question and options from response
  const question = lines.find(l => l.startsWith('Question:'))?.replace('Question:', '').trim() || ''
  const optionA = lines.find(l => l.startsWith('Option A:'))?.replace('Option A:', '').trim() || ''
  const optionB = lines.find(l => l.startsWith('Option B:'))?.replace('Option B:', '').trim() || ''
  
  return {
    question: sanitizePromptInput(question),
    options: [
      sanitizePromptInput(optionA),
      sanitizePromptInput(optionB),
    ],
  }
}