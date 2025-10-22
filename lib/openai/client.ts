/**
 * OpenAI API Client
 *
 * Manages connection and authentication with OpenAI API
 * Provides typed methods for story generation requests
 */

import { serverEnv } from '@/lib/env';
import { StoryTheme } from '@/types';
import OpenAI from 'openai';
import type { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second
const MAX_DELAY = 10000; // 10 seconds

/**
 * Create and configure OpenAI client instance
 * @returns Configured OpenAI client
 * @throws Error if OPENAI_API_KEY is not set
 */
export function createOpenAIClient(): OpenAI {
  const apiKey = serverEnv.openai.apiKey;

  if (!apiKey) {
    throw new OpenAIConfigError('OPENAI_API_KEY environment variable is not set');
  }

  return new OpenAI({
    apiKey,
    maxRetries: 3,
    timeout: 30000, // 30 seconds
  });
}

/**
 * OpenAI request configuration for story generation
 */
export interface StoryGenerationRequest {
  theme: StoryTheme;
  wordList: string[];
  beatType?: 'narrative' | 'game' | 'choice';
  context?: string;
}

/**
 * OpenAI response for story generation
 */
export interface StoryGenerationResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Custom error class for OpenAI configuration errors
 */
export class OpenAIConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAIConfigError';
  }
}

/**
 * Custom error class for OpenAI API errors
 */
export class OpenAIAPIError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'OpenAIAPIError';
  }
}

/**
 * Generate story content using OpenAI
 * @param client - OpenAI client instance
 * @param request - Story generation parameters
 * @param jsonSchema
 * @returns Generated story content
 * @throws OpenAIAPIError on API failure
 */
export async function generateStoryContent(
  client: OpenAI,
  request: StoryGenerationRequest,
  jsonSchema?: any,
): Promise<StoryGenerationResponse> {
  console.log('generateStoryContent start');
  try {
    const openAiRequest: ChatCompletionCreateParamsBase = {
      model: serverEnv.openai.model,
      messages: [
        {
          role: 'system',
          content:
            "You are a creative children's story writer specializing in short educational adventures that weaves around a list of words. \n\n\n" +
            'The stories take the form of 15-25 short paragraphs, each 1-2 sentences long, which we will eventually put together to form the story.\n\n\n' +
            'The first paragraph sets the setting and hero using 2-3 sentences. Incorporate one of the given words here.\n\n\n' +
            'The second paragraph sets the villain and a problem for the hero. Try to incorporate one of the given words here.\n\n\n' +
            'The third paragraph explains the mission of the hero - for example to save the villagers, rescue her friends, find the stolen treasures, etc.\n\n\n' +
            "The next 8 or so paragraphs describes the short adventure of the hero while on the mission. In each paragraph, try to incorporate one of the given words as something the reader has to figure out - don't give it away in the narrative! We'll then let the user play a short game to figure it out.\n\n\n" +
            "At suitable times, circle back to the word used in the first paragraph. Example, the first paragraph may mention that the hero likes to eat carrots. We can then let the reader play a mini game where they have to guess what the hero likes to eat, in order to overcome one of the in-story challenges - maybe it's a quiz given by a wizard, or a challenge given by a witch.\n\n\n" +
            'Sometimes the reader would fail the challenges, so we will prepare another 5 obstacles the hero may need to go through - structure these as optional obstacles that we can introduce when required, but does not really affect the story.\n\n\n' +
            'Next, craft a paragraph where the hero faces the boss villain and up the stakes.\n\n\n' +
            'For the next few paragraphs, craft a challenge for each of the given words - the reader has to figure out each word in order to advance to the next challenge. For these paragraphs, make them independent of each other, i.e. make sure they work whether they are included in the final story or not. We will pick and chose from these paragraphs when putting together the final story.\n\n\n' +
            'At the end, craft a challenge for the word used in paragraph 2 in order for the reader to deal the final blow to the villain.\n\n\n' +
            'Finally, craft a happy ending - to be used if the reader is successful in overcoming the challenge, and a unhappy ending - to be used if the reader fails to overcome the challenge. We will pick either one when putting the final story together.' +
            '\n\n\nKeep the language age-appropriate for children learning to spell.' +
            '\n\n\nGenerate structured story data in JSON format.',
        },
        {
          role: 'user',
          content: buildPrompt(request),
        },
      ],
      temperature: serverEnv.openai.temperature,
      // max_tokens: serverEnv.openai.maxTokens,
      // Add structured output if schema provided
      ...(jsonSchema && {
        // response_format: zodResponseFormat(jsonSchema, 'story_generation')
        // response_format: jsonSchema
        response_format: {
          type: 'json_schema',
          json_schema: { strict: true, name: 'story_generation', schema: jsonSchema },
        },
      }),
    };
    console.log('Open AI request: ');
    console.log(JSON.stringify(openAiRequest, null, 2));

    const completion = (await client.chat.completions.create(
      openAiRequest,
    )) as OpenAI.Chat.Completions.ChatCompletion;
    console.log('Open AI response: ');
    console.log(JSON.stringify(completion, null, 2));

    const content = completion.choices[0]?.message?.content || '';
    const usage = completion.usage;

    return {
      content,
      usage: usage
        ? {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
          }
        : undefined,
    };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new OpenAIAPIError(
        `OpenAI API error: ${error.message}`,
        error.status,
        error.code || undefined,
      );
    }
    throw error;
  }
}

/**
 * Build prompt from request parameters
 * @param request - Story generation request
 * @returns Formatted prompt string
 */
function buildPrompt(request: StoryGenerationRequest): string {
  const {
    // v
    theme,
    wordList,
    // beatType = 'narrative',
    // context = '',
  } = request;

  let prompt = `Generate a ${theme}-themed story beat for a children's educational spelling game.\n\n`;

  // if (context) {
  //   prompt += `Previous story context: ${context}\n\n`;
  // }

  prompt += `Words to practice: ${wordList.join(', ')}\n\n`;

  // switch (beatType) {
  //   case 'narrative':
  //     prompt += 'Create a short narrative paragraph (2-3 sentences) that advances the story.';
  //     break;
  //   case 'game':
  //     prompt += `Create an engaging prompt that introduces a spelling challenge for the word "${wordList[0]}".`;
  //     break;
  //   case 'choice':
  //     prompt +=
  //       'Create a story choice with a question and two options for the player to choose from.';
  //     break;
  // }
  //
  // prompt += '\n\nKeep the language age-appropriate for children learning to spell.';

  return prompt;
}

/**
 * Validate OpenAI API key format
 * @param apiKey - API key to validate
 * @returns True if valid format
 */
export function validateAPIKey(apiKey: string): boolean {
  return apiKey.startsWith('sk-') && apiKey.length > 20;
}

/**
 * Test OpenAI connection
 * @param client - OpenAI client instance
 * @returns True if connection successful
 */
export async function testConnection(client: OpenAI): Promise<boolean> {
  try {
    const response = await client.models.list();
    return response.data.length > 0;
  } catch {
    return false;
  }
}

/**
 * Retry wrapper with exponential backoff
 * @param fn - Function to retry
 * @param retries - Number of retry attempts
 * @returns Result of function or throws after all retries
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
): Promise<T> {
  let lastError: unknown;
  let delay = INITIAL_DELAY;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i === retries) {
        throw lastError;
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, MAX_DELAY)));
      delay *= 2;
    }
  }

  throw lastError;
}

/**
 * Execute with timeout
 * @param promise - Promise to timeout
 * @param timeoutMs - Timeout in milliseconds
 * @returns Result or throws timeout error
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new OpenAIAPIError('Request timed out', 408, 'timeout'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}
