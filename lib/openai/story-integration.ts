/**
 * Story Integration Service
 *
 * Integrates OpenAI with the existing story generation flow
 * Provides fallback mechanisms and error handling
 */

import { serverEnv } from '@/lib/env';
import { StoryTheme } from '@/types';
import OpenAI from 'openai';
import type { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions';

import { OpenAIAPIError } from './client';
import { buildSystemPrompt, buildUserPrompt } from './prompts';

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

  const systemPrompt = buildSystemPrompt(request);
  const userPrompt = buildUserPrompt(request);

  try {
    const openAiRequest: ChatCompletionCreateParamsBase = {
      model: serverEnv.openai.model,
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
      temperature: serverEnv.openai.temperature,
      // max_tokens: serverEnv.openai.maxTokens,
      ...(jsonSchema && {
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
