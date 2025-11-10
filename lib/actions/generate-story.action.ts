'use server';

/**
 * Server Action for OpenAI Story Generation
 *
 * This runs on the server to keep API keys secure
 */
import { generateStoryWithOpenAI } from '@/lib/openai/story-service';
import { generateWordInfoWithOpenAI } from '@/lib/openai/word-info/word-info';
import type { GeneratedStory, StoryGenerationInput } from '@/types/story';

export async function generateStoryServerAction(
  input: StoryGenerationInput,
): Promise<GeneratedStory | null> {
  try {
    console.log('🚀 Server action: Generating story for', input.wordList.length, 'words');

    const [story, wordInfo] = await Promise.all([
      generateStoryWithOpenAI(input),
      generateWordInfoWithOpenAI(input),
    ]);

    if (!story) {
      console.log('⚠️ Server action: OpenAI generation failed, returning null');
      return null;
    }

    console.log('✅ Server action: OpenAI story generated successfully');
    story.words = new Map(Object.entries(wordInfo || {}));

    // Enrich blocks with wordinfo
    story.stage1Beats.forEach(beat => {
      if (beat.type === 'game') {
        beat.extraWordInfo = story.words?.get(beat.word);
      }
    });

    return story;
  } catch (error) {
    console.error('❌ Server action: Story generation failed:', error);
    return null;
  }
}
