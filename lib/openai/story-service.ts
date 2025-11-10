/**
 * OpenAI Story Generation Service
 *
 * Provides comprehensive story generation using OpenAI API
 * Generates complete story structures with coherent narratives
 */

import { validateEnvironment } from '@/lib/env';
import { generateStoryContent } from '@/lib/openai/story-integration';
import { selectGameType } from '@/lib/story/story-generator';
import type {
  CheckpointBeat,
  ChoiceBeat,
  GameBeat,
  GeneratedStory,
  NarrativeBeat,
  StoryBeat,
  StoryGenerationInput,
} from '@/types/story';
import partition from 'lodash/partition';

import { createOpenAIClient, OpenAIAPIError, withRetry, withTimeout } from './client';
import {
  ChildrenStory,
  getStoryGenerationJsonSchemaV1,
  getStoryGenerationJsonSchemaV3,
  Story,
  validateAndTransformOpenAIResponseV1,
  validateAndTransformOpenAIResponseV3,
  type OpenAIStoryResponse,
} from './story-schema';

/**
 * Request timeout for story generation (3 seconds as per AC 5)
 */
const STORY_GENERATION_TIMEOUT = 30000;

/**
 * Generate a complete story using OpenAI
 * @param input - Story generation parameters
 * @returns Generated story structure or null if generation fails
 */
async function generateStoryWithOpenAIV1(
  input: StoryGenerationInput,
): Promise<GeneratedStory | null> {
  console.log('generateStoryWithOpenAIV1 start, input:', JSON.stringify(input));
  try {
    // Validate environment and create client
    validateEnvironment();
    const client = createOpenAIClient();

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
          getStoryGenerationJsonSchemaV1(),
        );
      }),
      STORY_GENERATION_TIMEOUT * 100,
    );

    // Parse JSON response
    console.log('response.content');
    console.log(response.content);
    let jsonData: unknown;
    try {
      jsonData = JSON.parse(response.content);
    } catch (error) {
      console.error('Failed to parse OpenAI JSON response:', error);
      console.error('Response content:', response.content);
      return null;
    }

    // Validate with Zod schema
    const validatedResponse = validateAndTransformOpenAIResponseV1(jsonData);
    if (!validatedResponse) {
      console.warn('OpenAI response failed validation');
      return null;
    }
    console.info('OpenAI response passed validation');

    // Transform to our internal GeneratedStory format
    return transformToGeneratedStoryV1(validatedResponse, input);
  } catch (error) {
    if (error instanceof OpenAIAPIError) {
      console.error('OpenAI API error during story generation:', error.message);
    } else {
      console.error('Story generation failed:', error);
    }
    return null;
  }
}

/**
 * Generate a complete story using OpenAI
 * @param input - Story generation parameters
 * @returns Generated story structure or null if generation fails
 */
async function generateStoryWithOpenAIV2(
  input: StoryGenerationInput,
): Promise<GeneratedStory | null> {
  console.log('generateStoryWithOpenAIV2 start, input:', JSON.stringify(input));
  try {
    // Validate environment and create client
    validateEnvironment();
    const client = createOpenAIClient();

    // Generate story content with timeout and JSON schema
    const response = await withTimeout(
      withRetry(async () => {
        return await generateStoryContent(client, input, getStoryGenerationJsonSchemaV3());
      }),
      STORY_GENERATION_TIMEOUT * 100,
    );

    // Parse JSON response
    console.log('response.content');
    console.log(response.content);
    let jsonData: unknown;
    try {
      jsonData = JSON.parse(response.content);
    } catch (error) {
      console.error('Failed to parse OpenAI JSON response:', error);
      console.error('Response content:', response.content);
      return null;
    }

    // Validate with Zod schema
    const validatedResponse = validateAndTransformOpenAIResponseV3(jsonData);
    if (!validatedResponse) {
      console.warn('OpenAI response failed validation');
      return null;
    }
    console.info('OpenAI response passed validation');

    // Transform to our internal GeneratedStory format
    return transformToGeneratedStoryV3(validatedResponse, input);
  } catch (error) {
    if (error instanceof OpenAIAPIError) {
      console.error('OpenAI API error during story generation:', error.message);
    } else {
      console.error('Story generation failed:', error);
    }
    return null;
  }
}

// async function generateStoryWithOpenAIV2WithRetry(
//   input: StoryGenerationInput,
// ): Promise<GeneratedStory | null> {
//   // At most try 3 times
//   let storyWithLeastMissedWords: GeneratedStory | null = null;
//   for (let i = 0; i < 3; i++) {
//     const story = await generateStoryWithOpenAIV2(input);
//     if (!story) {
//       continue;
//     }
//     if (storyWithLeastMissedWords) {
//       if (
//         story.artificiallyAddedBlocksForMissingWords <
//         storyWithLeastMissedWords.artificiallyAddedBlocksForMissingWords
//       ) {
//         storyWithLeastMissedWords = story;
//       }
//     } else {
//       storyWithLeastMissedWords = story;
//     }
//
//     if (story.artificiallyAddedBlocksForMissingWords < 2) {
//       // Good enough.
//       break;
//     }
//   }
//   return storyWithLeastMissedWords;
// }

async function generateStoryWithOpenAIV2InParallel(
  input: StoryGenerationInput,
  attempts: number = 3,
): Promise<GeneratedStory | null> {
  // At most try 3 times

  const promises: Promise<GeneratedStory | null>[] = [];
  for (let i = 0; i < attempts; i++) {
    promises.push(generateStoryWithOpenAIV2(input));
  }
  const settledResults = await Promise.allSettled(promises);

  let storyWithLeastMissedWords: GeneratedStory | null = null;
  for (const settledResult of settledResults) {
    if (settledResult.status === 'rejected') {
      continue;
    }
    const story = settledResult.value;
    if (!story) {
      continue;
    }
    if (!story) {
      continue;
    }

    if (storyWithLeastMissedWords) {
      if (
        story.artificiallyAddedBlocksForMissingWords >=
        storyWithLeastMissedWords.artificiallyAddedBlocksForMissingWords
      ) {
        continue;
      }
    }
    storyWithLeastMissedWords = story;
  }

  return storyWithLeastMissedWords;
}

export const generateStoryWithOpenAILegacy = generateStoryWithOpenAIV1;
export const generateStoryWithOpenAI = generateStoryWithOpenAIV2InParallel;

/**
 * Build comprehensive prompt for story generation
 */
function buildStoryGenerationPrompt(input: StoryGenerationInput): string {
  const { wordList, theme, targetBeats = wordList.length * 2 } = input;

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

Each word must appear exactly once in a game beat. Generate an engaging story that connects all words thematically.`;
}

/**
 * Get theme-specific elements for prompt enhancement
 */
function getThemeElements(theme: string): string {
  const elements: Record<string, string> = {
    space:
      'rockets, planets, aliens, stars, galaxies, space stations, astronauts, cosmic adventures',
    treasure:
      'maps, chests, pirates, islands, gold, adventures, hidden treasures, mysterious clues',
    fantasy: 'wizards, dragons, castles, magic spells, enchanted forests, mystical creatures',
    ocean: 'submarines, sea creatures, coral reefs, underwater adventures, marine life',
    jungle: 'wild animals, dense forests, ancient temples, river crossings, exotic plants',
  };
  return elements[theme] || elements.space;
}

/**
 * Transform validated OpenAI response to our internal GeneratedStory format
 */
function transformToGeneratedStoryV1(
  validatedResponse: OpenAIStoryResponse,
  input: StoryGenerationInput,
): GeneratedStory {
  // Convert validated schema types to our internal types
  const stage1Beats: StoryBeat[] = validatedResponse.stage1Beats.map(beat => {
    const baseProps = {
      narrative: beat.narrative,
      isOptional: false,
      phase: 'middle',
    };

    switch (beat.type) {
      case 'game':
        return {
          ...baseProps,
          type: 'game',
          word: beat.word,
          gameType: beat.gameType,
          stage: beat.stage,
        } as GameBeat;

      case 'choice':
        return {
          ...baseProps,
          type: 'choice',
          question: beat.question,
          options: beat.options,
        } as ChoiceBeat;

      case 'checkpoint':
        return {
          ...baseProps,
          type: 'checkpoint',
          checkpointNumber: beat.checkpointNumber,
          celebrationEmoji: beat.celebrationEmoji || '🎉',
          title: beat.title,
        } as CheckpointBeat;

      case 'narrative':
      default:
        return {
          ...baseProps,
          type: 'narrative',
        } as NarrativeBeat;
    }
  });

  // Validate that all required words are covered
  const gameBeats = stage1Beats.filter(b => b.type === 'game') as GameBeat[];
  const requiredWords = new Set(input.wordList);
  const coveredWords = new Set(gameBeats.filter(item => item.type === 'game').map(b => b.word));
  let artificiallyAddedBlocksForMissingWords = 0;
  // Add missing words as game beats
  for (const word of requiredWords) {
    if (!coveredWords.has(word)) {
      console.warn(`Missing game beat for word: ${word}`);
      stage1Beats.push({
        type: 'game',
        narrative: `Time to spell "${word.toUpperCase()}"!`,
        word,
        gameType: 'letter-matching',
        stage: 1,
        phase: 'middle', // Default to middle phase for missing words
        isOptional: false,
      } as GameBeat);
      artificiallyAddedBlocksForMissingWords++;
    }
  }

  return {
    stage1Beats,
    stage2ExtraBeats: new Map(),
    stage2FixedSequence: [],
    artificiallyAddedBlocksForMissingWords,
  };
}

/**
 * Transform validated OpenAI response to our internal GeneratedStory format
 */
export function transformToGeneratedStoryV2(
  validatedResponse: ChildrenStory,
  input: StoryGenerationInput,
): GeneratedStory {
  // Convert validated schema types to our internal types
  let gameTypeIndex = 0;
  const wordsCoveredInMain = new Set<string>();
  const wordsCoveredInOptional = new Set<string>();
  const stage1Beats: StoryBeat[] = [];
  const stage2ExtraBeats = new Map<string, StoryBeat[]>();

  validatedResponse.main_blocks.forEach(beat => {
    const baseProps = {
      narrative: beat.text,
      isOptional: false,
      phase: beat.stage,
    };

    const word = beat.focus_word || null;

    // For now we take the first word that has not been used yet.
    // const word = selectItemFromListThatIsNotInSet(words, wordsCoveredInMain);
    if (!word) {
      // If no word, this is a pure narrative.
      stage1Beats.push({
        ...baseProps,
        type: 'narrative',
      } as NarrativeBeat);
      return;
    }
    wordsCoveredInMain.add(word);
    gameTypeIndex++;
    stage1Beats.push({
      ...baseProps,
      type: 'game',
      word,
      gameType: selectGameType(gameTypeIndex),
      stage: 1,
    } as GameBeat);
    return;
  });

  validatedResponse.optional_blocks.forEach(beat => {
    const baseProps = {
      narrative: beat.text,
      isOptional: true,
      phase: 'middle',
    };

    const word = beat.focus_word || null;

    // For now we take the first word that has not been used yet.
    // const word = selectItemFromListThatIsNotInSet(words, wordsCoveredInOptional);
    if (!word) {
      // If no word, we skip this item
      return;
    }
    wordsCoveredInOptional.add(word);
    gameTypeIndex++;

    const existingBeatsForWord = stage2ExtraBeats.get(word) || [];
    existingBeatsForWord.push({
      ...baseProps,
      type: 'game',
      word,
      gameType: selectGameType(gameTypeIndex),
      stage: 2,
    } as GameBeat);
    stage2ExtraBeats.set(word, existingBeatsForWord);

    return;
  });

  // Validate that all required words are covered
  const gameBeats = stage1Beats.filter(b => b.type === 'game') as GameBeat[];
  const requiredWords = new Set(input.wordList);
  const coveredWords = new Set(gameBeats.filter(item => item.stage === 1).map(b => b.word));
  let artificiallyAddedBlocksForMissingWords = 0;
  // Add missing words as game beats
  for (const word of requiredWords) {
    if (!coveredWords.has(word)) {
      console.warn(`Missing game beat for word: ${word}`);
      stage1Beats.push({
        type: 'game',
        narrative: `Time to spell "${word.toUpperCase()}"!`,
        word,
        gameType: 'letter-matching',
        stage: 1,
        phase: 'middle', // Default to middle phase for missing words
        isOptional: false,
      } as GameBeat);
      artificiallyAddedBlocksForMissingWords++;
    }
  }

  return {
    stage1Beats,
    stage2ExtraBeats,
    stage2FixedSequence: [],
    artificiallyAddedBlocksForMissingWords,
  };
}

const normalizeForWordMatching = (text: string) =>
  ' ' + text.toLowerCase().replace(/[^a-zA-Z]/g, ' ') + ' ';

/**
 * Transform validated OpenAI response to our internal GeneratedStory format
 */
function transformToGeneratedStoryV3(
  validatedResponse: Story,
  input: StoryGenerationInput,
): GeneratedStory {
  // Convert validated schema types to our internal types
  let gameTypeIndex = 0;
  const stage1Beats: StoryBeat[] = [];
  const stage2ExtraBeats = new Map<string, StoryBeat[]>();
  const wordListSet = new Set(input.wordList);
  validatedResponse.blocks.forEach(beat => {
    const baseProps: Partial<StoryBeat> = {
      id: crypto.randomUUID(),
      narrative: beat.text,
      isOptional: false,
      phase: beat.stage,
    };

    // AI seems to occasionally fails to fill in the right focus word, we find them ourselves.
    // Detect all potential words in baseProps.narrative.
    const normalizedNarrative = normalizeForWordMatching(baseProps.narrative || '');
    const potentialWords = [...wordListSet.values()].filter(word =>
      normalizedNarrative.includes(normalizeForWordMatching(word)),
    );

    if (potentialWords.length === 0) {
      // If no word, this is a pure narrative.
      stage1Beats.push({
        ...baseProps,
        type: 'narrative',
      } as NarrativeBeat);
      return;
    }
    stage1Beats.push({
      ...baseProps,
      type: 'game',
      word: '',
      potentialWords,
      gameType: selectGameType(0),
      stage: 1,
    } as GameBeat);
    return;
  });

  // region Assign words to blocks.
  // Assign words prioritizing those that only appear once.
  const wordOccurrences = new Map<string, GameBeat[]>();
  stage1Beats.forEach(block => {
    if (block.type !== 'game') {
      return;
    }
    block.potentialWords.forEach(potentialWord => {
      const existingBlocks = wordOccurrences.get(potentialWord) || [];
      existingBlocks.push(block);
      wordOccurrences.set(potentialWord, existingBlocks);
    });
  });
  const coveredWords1 = new Set<string>();

  // Assign words with only 1 block.
  // Do max 10 passes.
  for (let i = 0; i < 10; i++) {
    const entries = [...wordOccurrences.entries()].filter(([_, blocks]) => blocks?.length > 0);
    if (entries.length === 0) {
      console.log(`Word occurrences at ${i} pass: empty!`);
      break;
    }
    console.log(
      `Word occurrences at ${i} pass:`,
      entries.map(([word, beats]) => `${word} => ${beats.map(b => b.id).join(',')}`),
    );
    const entriesWithOnly1Block = entries.filter(([_, blocks]) => blocks.length === 1);
    entriesWithOnly1Block.forEach(([word, blocks]) => {
      const selectedBlock = blocks[0];
      selectedBlock.word = word;
      coveredWords1.add(word);
      console.log(`${word} assigned to block ${selectedBlock.id}`);
    });

    // If there are no more words that only have 1 block, we just pick the first one and go to next pass.
    if (entriesWithOnly1Block.length === 0) {
      // Assign word in first entry to first block.
      const firstEntry = entries[0];
      if (firstEntry) {
        const [word, blocks] = firstEntry;
        const selectedBlock = blocks[0];
        selectedBlock.word = word;
        coveredWords1.add(word);
        console.log(`${word} assigned to block ${selectedBlock.id}`);
      }
    }

    // Remove used blocks from wordOccurrences
    console.log('Remove used blocks.');
    for (const w of wordOccurrences.keys()) {
      const existingBlocks = wordOccurrences.get(w);
      if (!existingBlocks) {
        continue;
      }
      const [usedBlock, unusedBlocks] = partition(existingBlocks, block => !!block.word);
      if (usedBlock.length > 0) {
        usedBlock.forEach(block => {
          console.log(
            `Block ${block.id} removed from word ${w} as it is already assigned to word ${block.word}`,
          );
        });
      }
      wordOccurrences.set(w, unusedBlocks);
    }
  }
  console.log(
    'Word occurrences after:',
    [...wordOccurrences.entries()].map(
      ([word, beats]) => `${word} => ${beats.map(b => b.id).join(',')}`,
    ),
  );

  // endregion Assign words to blocks.

  // Validate that all required words are covered
  const gameBeats = stage1Beats.filter(b => b.type === 'game') as GameBeat[];
  const requiredWords = new Set(input.wordList);
  const coveredWords = new Set(gameBeats.filter(item => item.stage === 1).map(b => b.word));

  // Add missing words as game beats
  const missingWords: GameBeat[] = [];
  for (const word of requiredWords) {
    if (!coveredWords.has(word)) {
      console.warn(`Missing game beat for word: ${word}`);
      missingWords.push({
        id: crypto.randomUUID(),
        type: 'game',
        narrative: `Time to spell "${word.toUpperCase()}"!`,
        word,
        gameType: 'letter-matching',
        stage: 1,
        phase: 'middle', // Default to middle phase for missing words
        isOptional: false,
      } as GameBeat);
    }
  }

  // Insert missing words at the right position based on phase
  if (missingWords.length > 0) {
    // Find the index where 'end' phase starts
    const endPhaseIndex = stage1Beats.findIndex(beat => beat.phase === 'end');

    if (endPhaseIndex !== -1) {
      // Insert missing words before the end phase
      stage1Beats.splice(endPhaseIndex, 0, ...missingWords);
    } else {
      // If no end phase found, find the last middle phase beat
      let insertIndex = stage1Beats.length;
      for (let i = stage1Beats.length - 1; i >= 0; i--) {
        if (stage1Beats[i].phase === 'middle') {
          insertIndex = i + 1;
          break;
        }
      }
      stage1Beats.splice(insertIndex, 0, ...missingWords);
    }
  }

  // Assign games mechanics.
  // Those with similar words should use the find word out of similar words game.
  stage1Beats.forEach(beat => {
    if (beat.type !== 'game') {
      return;
    }
    gameTypeIndex++;
    beat.gameType = selectGameType(gameTypeIndex);
  });

  console.log('[transformToGeneratedStoryV3] stage1Beats:', stage1Beats);
  return {
    stage1Beats,
    stage2ExtraBeats,
    stage2FixedSequence: [],
    artificiallyAddedBlocksForMissingWords: missingWords.length,
  };
}

/**
 * Validate generated story content for quality and appropriateness
 */
export function validateStoryContent(story: GeneratedStory): boolean {
  // Check for inappropriate content keywords
  const inappropriateKeywords = [
    'violence',
    'scary',
    'death',
    'kill',
    'fight',
    'weapon',
    'blood',
    'hurt',
    'danger',
    'fear',
    'nightmare',
  ];

  const allNarratives = story.stage1Beats.map(beat => beat.narrative.toLowerCase()).join(' ');

  for (const keyword of inappropriateKeywords) {
    if (allNarratives.includes(keyword)) {
      console.warn(`Inappropriate content detected: ${keyword}`);
      return false;
    }
  }

  // Validate structure requirements
  const gameBeats = story.stage1Beats.filter(b => b.type === 'game');
  if (gameBeats.length === 0) {
    console.warn('Story contains no game beats');
    return false;
  }

  // Check narrative coherence (basic length validation)
  const narratives = story.stage1Beats.map(b => b.narrative);
  const tooShort = narratives.filter(n => n.length < 10);
  const tooLong = narratives.filter(n => n.length > 200);

  if (tooShort.length > 0) {
    console.warn('Story contains narratives that are too short');
    return false;
  }

  if (tooLong.length > narratives.length * 0.3) {
    console.warn('Story contains too many overly long narratives');
    return false;
  }

  return true;
}

/**
 * Performance monitoring for story generation
 */
export interface StoryGenerationMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  fallbackUsed: boolean;
  wordCount: number;
  beatCount: number;
  error?: string;
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
  };

  if (metrics.success) {
    console.info('Story generation completed:', logData);
  } else {
    console.warn('Story generation failed:', logData);
  }
}
