/**
 * Zod Schema for OpenAI Story Generation
 *
 * Defines and validates the structure of story content returned by OpenAI
 */

import { z } from 'zod';

// Game types enum
const gameTypeSchema = z.enum([
  'letterMatching',
  'wordBuilding',
  'spellingChallenge',
  'wordScramble',
  'missingLetters',
]);

// Base beat schema (shared properties)
const baseBeatSchema = z.object({
  id: z.string().min(1),
  narrative: z.string().min(10), // Ensure meaningful narrative
});

// Narrative beat schema
const narrativeBeatSchema = baseBeatSchema.extend({
  type: z.literal('narrative'),
});

// Game beat schema
const gameBeatSchema = baseBeatSchema.extend({
  type: z.literal('game'),
  // transforms are not supported in json schema, and zod throws an error. We'll uppercase elsewhere.
  // word: z.string().min(1).transform(s => s.toUpperCase()), // Ensure word is uppercase
  word: z.string().min(1),
  gameType: gameTypeSchema,
  stage: z.literal(1), // Always stage 1 for now
});

// Choice beat schema
const choiceBeatSchema = baseBeatSchema.extend({
  type: z.literal('choice'),
  question: z.string().min(10),
  // options: z.tuple([z.string().min(1), z.string().min(1)]), // Exactly 2 options
  // OpenAI doesn't seme to like tuples in JSONSchema.
  options: z.array(z.string().min(1)),
});

// Checkpoint beat schema
const checkpointBeatSchema = baseBeatSchema.extend({
  type: z.literal('checkpoint'),
  checkpointNumber: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  celebrationEmoji: z.string().optional().default('🎉'),
  title: z.string().min(1),
});

// Story beat union type
const storyBeatSchema = z.discriminatedUnion('type', [
  narrativeBeatSchema,
  gameBeatSchema,
  choiceBeatSchema,
  checkpointBeatSchema,
]);

// Complete story response schema
export const openAIStoryResponseSchema = z.object({
  stage1Beats: z.array(storyBeatSchema).min(5), // At least 5 beats
  // We can add stage2 beats later if needed
});

// Type exports
export type OpenAIStoryResponse = z.infer<typeof openAIStoryResponseSchema>;
export type StoryBeatSchema = z.infer<typeof storyBeatSchema>;

/**
 * Generate JSON Schema for OpenAI function calling
 */
export function getStoryGenerationJsonSchema() {
  // Convert Zod schema to JSON Schema format
  // OpenAI expects a specific format for function parameters
  return z.toJSONSchema(openAIStoryResponseSchema);
}

/**
 * Validate OpenAI response and transform to our internal types
 */
export function validateAndTransformOpenAIResponse(response: unknown): OpenAIStoryResponse | null {
  try {
    // Parse and validate with Zod
    const parsed = openAIStoryResponseSchema.parse(response);

    // Additional validation: ensure all words are covered
    const gameBeats = parsed.stage1Beats.filter(beat => beat.type === 'game');
    if (gameBeats.length === 0) {
      console.error('No game beats found in OpenAI response');
      return null;
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('OpenAI response validation failed:', error.issues);
    } else {
      console.error('Unknown error validating OpenAI response:', error);
    }
    return null;
  }
}
