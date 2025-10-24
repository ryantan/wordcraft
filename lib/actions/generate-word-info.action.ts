'use server';

/**
 * Server Action for OpenAI word info Generation
 *
 * This runs on the server to keep API keys secure
 */
import { generateWordInfoWithOpenAI } from '@/lib/openai/word-info/word-info';
import type { StoryGenerationInput, WordInfoMap } from '@/types/story';

export async function generateWordInfoServerAction(
  input: StoryGenerationInput,
): Promise<WordInfoMap | null> {
  try {
    console.log('🚀 Server action: Generating word info for', input.wordList.length, 'words');

    const story = await generateWordInfoWithOpenAI(input);

    if (!story) {
      console.log('⚠️ Server action: word info generation failed, returning null');
      return null;
    }
    console.log('✅ Server action: word info story generated successfully');
    return new Map(Object.entries(story || {}) || {});
  } catch (error) {
    console.error('❌ Server action: word info generation failed:', error);
    return null;
  }
}
