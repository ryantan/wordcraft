/**
 * Story Integration Service
 *
 * Integrates OpenAI with the existing story generation flow
 * Provides fallback mechanisms and error handling
 */

import { validateEnvironment } from '@/lib/env';
import type {
  ChoiceBeat,
  GameBeat,
  GeneratedStory,
  NarrativeBeat,
  StoryBeat,
  StoryGenerationInput,
  StoryTheme,
} from '@/types/story';

import { createOpenAIClient, generateStoryContent, withRetry, withTimeout } from './client';
import { parseChoiceBeatResponse } from './prompts';

// Cache for OpenAI client instance
let openAIClient: ReturnType<typeof createOpenAIClient> | null = null;

/**
 * Get or create OpenAI client with environment validation
 * @returns OpenAI client instance or null if disabled
 */
function getOpenAIClient(): ReturnType<typeof createOpenAIClient> | null {
  // Skip in test/development without API key
  if (process.env.NODE_ENV === 'test' || !process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!openAIClient) {
    try {
      validateEnvironment();
      openAIClient = createOpenAIClient();
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
      return null;
    }
  }

  return openAIClient;
}

/**
 * Enhanced story generation with OpenAI integration
 * Falls back to template system on errors
 *
 * @param input - Story generation parameters
 * @param templateFallback - Template-based generation function
 * @returns Generated story with beats
 */
export async function generateStoryWithAI(
  input: StoryGenerationInput,
  templateFallback: (input: StoryGenerationInput) => GeneratedStory,
): Promise<GeneratedStory> {
  const client = getOpenAIClient();

  // Use template fallback if OpenAI is not available
  if (!client) {
    console.warn('OpenAI client not available, using template system');
    return templateFallback(input);
  }

  try {
    // Generate story beats with AI
    const stage1Beats = await generateStage1BeatsWithAI(
      client,
      input.wordList,
      input.theme as StoryTheme,
    );

    // Return AI-generated story structure
    return {
      stage1Beats,
      stage2ExtraBeats: new Map(),
      stage2FixedSequence: [],
    };
  } catch (error) {
    console.error('OpenAI story generation failed, using fallback:', error);
    return templateFallback(input);
  }
}

/**
 * Generate Stage 1 beats using OpenAI
 * @param client - OpenAI client
 * @param wordList - List of words to practice
 * @param theme - Story theme
 * @returns Array of story beats
 */
async function generateStage1BeatsWithAI(
  client: ReturnType<typeof createOpenAIClient>,
  wordList: string[],
  theme: StoryTheme,
): Promise<StoryBeat[]> {
  const beats: StoryBeat[] = [];
  let beatIndex = 0;
  let context = `Starting a ${theme} adventure...`;

  for (let i = 0; i < wordList.length; i++) {
    const word = wordList[i];
    // const progressPercentage = Math.floor((i / wordList.length) * 100)

    // Add narrative beats periodically
    if (i % 3 === 0 && i > 0) {
      try {
        const narrativeResponse = await withRetry(() =>
          withTimeout(
            generateStoryContent(client, {
              theme,
              wordList: [],
              beatType: 'narrative',
              context,
            }),
            15000,
          ),
        );

        const narrativeBeat: NarrativeBeat = {
          type: 'narrative',
          id: `narrative-${beatIndex}`,
          narrative: narrativeResponse.content || generateFallbackNarrative(theme, beatIndex),
        };

        beats.push(narrativeBeat);
        context = narrativeResponse.content;
        beatIndex++;
      } catch (error) {
        console.error('Failed to generate narrative beat:', error);
        // Use fallback narrative
        beats.push({
          type: 'narrative',
          id: `narrative-${beatIndex}`,
          narrative: generateFallbackNarrative(theme, beatIndex),
        });
        beatIndex++;
      }
    }

    // Add choice beats occasionally
    if (i === 2 || i === Math.floor(wordList.length / 2)) {
      try {
        const choiceResponse = await withRetry(() =>
          withTimeout(
            generateStoryContent(client, {
              theme,
              wordList: [],
              beatType: 'choice',
              context,
            }),
            15000,
          ),
        );

        const parsed = parseChoiceBeatResponse(choiceResponse.content);

        const choiceBeat: ChoiceBeat = {
          type: 'choice',
          id: `choice-${beatIndex}`,
          narrative: context,
          question: parsed.question || generateFallbackChoice(theme).question,
          options: parsed.options || generateFallbackChoice(theme).options,
        };

        beats.push(choiceBeat);
        beatIndex++;
      } catch (error) {
        console.error('Failed to generate choice beat:', error);
        // Use fallback choice
        const fallback = generateFallbackChoice(theme);
        beats.push({
          type: 'choice',
          id: `choice-${beatIndex}`,
          narrative: context,
          ...fallback,
        });
        beatIndex++;
      }
    }

    // Add game beat for this word
    try {
      const gameType = selectGameType(i);
      const gameResponse = await withRetry(() =>
        withTimeout(
          generateStoryContent(client, {
            theme,
            wordList: [word],
            beatType: 'game',
            context,
          }),
          15000,
        ),
      );

      const gameBeat: GameBeat = {
        type: 'game',
        id: `game-${word}-stage1`,
        narrative: gameResponse.content || generateFallbackGameNarrative(theme, word),
        word,
        gameType,
        stage: 1,
      };

      beats.push(gameBeat);
      context = `After successfully spelling "${word}"...`;
    } catch (error) {
      console.error('Failed to generate game beat:', error);
      // Use fallback game narrative
      beats.push({
        type: 'game',
        id: `game-${word}-stage1`,
        narrative: generateFallbackGameNarrative(theme, word),
        word,
        gameType: selectGameType(i),
        stage: 1,
      });
    }
  }

  return beats;
}

/**
 * Fallback narrative generation
 */
function generateFallbackNarrative(theme: string, _index: number): string {
  const narratives: Record<string, string[]> = {
    space: ['Your journey through the cosmos continues...'],
    treasure: ['The adventure grows more exciting...'],
    fantasy: ['The magical quest continues...'],
    ocean: ['You dive deeper into the ocean...'],
    jungle: ['The jungle path reveals new wonders...'],
  };

  return narratives[theme]?.[0] || 'Your adventure continues...';
}

/**
 * Fallback choice generation
 */
function generateFallbackChoice(theme: string): { question: string; options: [string, string] } {
  const choices: Record<string, { question: string; options: [string, string] }> = {
    space: {
      question: 'Which route should we take?',
      options: ['Left path', 'Right path'],
    },
    treasure: {
      question: 'Which way to go?',
      options: ['Follow map', 'Trust instinct'],
    },
    fantasy: {
      question: 'What should we do?',
      options: ['Use magic', 'Be brave'],
    },
    ocean: {
      question: 'Which direction to swim?',
      options: ['Towards light', 'Follow current'],
    },
    jungle: {
      question: 'Which path looks safer?',
      options: ['Dense trees', 'Open trail'],
    },
  };

  return choices[theme] || choices.space;
}

/**
 * Fallback game narrative generation
 */
function generateFallbackGameNarrative(theme: string, word: string): string {
  const templates: Record<string, string> = {
    space: `A cosmic challenge awaits! Spell "${word.toUpperCase()}" to proceed.`,
    treasure: `The treasure map shows "${word.toUpperCase()}" - spell it correctly!`,
    fantasy: `A magical spell requires "${word.toUpperCase()}" - cast it now!`,
    ocean: `The ocean reveals "${word.toUpperCase()}" - spell it to continue!`,
    jungle: `The jungle path shows "${word.toUpperCase()}" - master it!`,
  };

  return templates[theme] || `Time to spell "${word.toUpperCase()}"!`;
}

/**
 * Select game type based on index
 */
function selectGameType(
  _index: number,
): 'letterMatching' | 'wordBuilding' | 'spellingChallenge' | 'wordScramble' | 'missingLetters' {
  const gameTypes: Array<
    'letterMatching' | 'wordBuilding' | 'spellingChallenge' | 'wordScramble' | 'missingLetters'
  > = ['letterMatching', 'wordScramble', 'wordBuilding', 'missingLetters', 'spellingChallenge'];

  return gameTypes[_index % gameTypes.length];
}
