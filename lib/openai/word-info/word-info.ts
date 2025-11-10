/**
 * OpenAI Story Generation Service
 *
 * Provides comprehensive story generation using OpenAI API
 * Generates complete story structures with coherent narratives
 */
import { findSimilar } from '@/lib/data/find-similar';
import { validateEnvironment } from '@/lib/env';
import { buildSystemPromptForWordInfo, buildUserPromptForWordInfo } from '@/lib/openai/prompts';
import {
  WordInfoMap,
  WordInfoMapResponse,
  wordInfoMapResponseSchema,
} from '@/lib/openai/word-info/schema';
import type { StoryGenerationInput } from '@/types/story';
import OpenAI from 'openai';
import type { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions';
import { z } from 'zod';

import { createOpenAIClient, OpenAIAPIError, withRetry, withTimeout } from '../client';

/**
 * Request timeout for story generation (3 seconds as per AC 5)
 */
const GENERATION_TIMEOUT_IN_MS = 30000;

// const model = serverEnv.openai.model;
const model: ChatCompletionCreateParamsBase['model'] = 'gpt-4o-mini';
// const model: ChatCompletionCreateParamsBase['model'] = 'gpt-4o';
// const model: ChatCompletionCreateParamsBase['model'] = 'gpt-5-mini';
// const model: ChatCompletionCreateParamsBase['model'] = 'gpt-5';
// const model: ChatCompletionCreateParamsBase['model'] = 'gpt-5-nano';

/**
 * Validate OpenAI response and transform to our internal types
 */
const validateAndTransformOpenAIResponse = async (
  response: unknown,
): Promise<WordInfoMap | null> => {
  try {
    // Parse and validate with Zod
    const parsed: WordInfoMapResponse = wordInfoMapResponseSchema.parse(response);
    console.log('[validateAndTransformOpenAIResponse] parsed:', parsed);

    return parsed.target_words;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('OpenAI response validation failed:', error.issues);
    } else {
      console.error('Unknown error validating OpenAI response:', error);
    }
    return null;
  }
};

/**
 * Generate info for words using OpenAI
 * @param input - Generation parameters
 * @returns Info for each word or null if generation fails
 */
export async function generateWordInfoWithOpenAI(
  input: StoryGenerationInput,
): Promise<WordInfoMap | null> {
  console.log('generateWordInfoWithOpenAIV1 start, input:', JSON.stringify(input));
  try {
    // Validate environment and create client
    validateEnvironment();
    const client = createOpenAIClient();

    // Generate story content with timeout and JSON schema
    const response = await withTimeout(
      withRetry(async () => {
        console.log('generateStoryContent start');

        const request = {
          theme: input.theme,
          wordList: input.wordList,
        };
        const systemPrompt = buildSystemPromptForWordInfo(request);
        const userPrompt = buildUserPromptForWordInfo(request);
        const jsonSchema = z.toJSONSchema(wordInfoMapResponseSchema, {
          // Use older version for openAI support.
          target: 'draft-4',
        });

        try {
          const openAiRequest: ChatCompletionCreateParamsBase = {
            model,
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
              {
                role: 'user',
                content: userPrompt,
              },
            ],
            // Not supported in o4-mini
            // temperature: serverEnv.openai.temperature,
            // max_tokens: serverEnv.openai.maxTokens,
            ...(jsonSchema && {
              response_format: {
                type: 'json_schema',
                json_schema: { strict: true, name: 'word_info', schema: jsonSchema },
              },
            }),
          };
          console.log('Open AI request: ');
          console.log(JSON.stringify(openAiRequest, null, 2));

          const start = Date.now();
          const completion = (await client.chat.completions.create(
            openAiRequest,
          )) as OpenAI.Chat.Completions.ChatCompletion;
          const timeTaken = Date.now() - start;
          console.log(`Open AI response took ${timeTaken}ms on ${openAiRequest.model}:`);
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
      }),
      GENERATION_TIMEOUT_IN_MS,
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
    const validatedResponse = await validateAndTransformOpenAIResponse(jsonData);
    if (!validatedResponse) {
      console.warn('OpenAI response failed validation');
      return null;
    }
    console.info('OpenAI response passed validation');

    for (const word of input.wordList) {
      const similarWords = await findSimilar(word);
      console.log(`Found ${similarWords.length} words similar to ${word}`);
      console.log(JSON.stringify(similarWords));
    }

    // Transform to our internal GeneratedStory format
    return transformToWordInfo(validatedResponse, input);
  } catch (error) {
    if (error instanceof OpenAIAPIError) {
      console.error('OpenAI API error during word info generation:', error.message);
    } else {
      console.error('Story generation failed:', error);
    }
    return null;
  }
}

/**
 * Transform validated OpenAI response to word info map.
 */
function transformToWordInfo(
  validatedResponse: WordInfoMap,
  _input: StoryGenerationInput,
): WordInfoMap {
  if (validatedResponse) {
    for (const word in validatedResponse) {
      const item = validatedResponse[word];
      // Filter similar words if they are subsets of original word.
      const similarWords = new Set<string>(item.similar_words);
      const lowercaseWord = word.toLowerCase();
      item.similar_words.forEach(similarWord => {
        const lc = similarWord.toLowerCase();
        if (lc === lowercaseWord) {
          similarWords.delete(similarWord);
        } else if (lowercaseWord.includes(lc)) {
          similarWords.delete(similarWord);
        }
      });
      item.similar_words = [...similarWords.values()];
    }
  }
  return validatedResponse;
}
