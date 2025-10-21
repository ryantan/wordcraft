'use server'

/**
 * Server Action for OpenAI Story Generation
 * 
 * This runs on the server to keep API keys secure
 */

import { generateStoryWithOpenAI } from '@/lib/openai/story-service'
import type { StoryGenerationInput, GeneratedStory } from '@/types/story'

export async function generateStoryServerAction(
  input: StoryGenerationInput
): Promise<GeneratedStory | null> {
  try {
    console.log('🚀 Server action: Generating story for', input.wordList.length, 'words')
    
    const story = await generateStoryWithOpenAI(input)
    
    if (story) {
      console.log('✅ Server action: OpenAI story generated successfully')
      return story
    } else {
      console.log('⚠️ Server action: OpenAI generation failed, returning null')
      return null
    }
  } catch (error) {
    console.error('❌ Server action: Story generation failed:', error)
    return null
  }
}