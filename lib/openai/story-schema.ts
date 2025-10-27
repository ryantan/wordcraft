/**
 * Zod Schema for OpenAI Story Generation
 *
 * Defines and validates the structure of story content returned by OpenAI
 */

import { gameMechanics } from '@/lib/games';
import { z } from 'zod';

// Game types enum
const gameTypeSchema = z.enum(gameMechanics);

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
export function getStoryGenerationJsonSchemaV1() {
  // Convert Zod schema to JSON Schema format
  // OpenAI expects a specific format for function parameters
  return z.toJSONSchema(openAIStoryResponseSchema);
}

/**
 * Generate JSON Schema for OpenAI function calling
 */
export function getStoryGenerationJsonSchemaV2() {
  // Convert Zod schema to JSON Schema format
  // OpenAI expects a specific format for function parameters
  return z.toJSONSchema(ChildrenStorySchema, {
    // Use older version for openAI support.
    target: 'draft-4',
  });
}

/**
 * Validate OpenAI response and transform to our internal types
 */
export function validateAndTransformOpenAIResponseV1(
  response: unknown,
): OpenAIStoryResponse | null {
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

/**
 * Validate OpenAI response and transform to our internal types
 */
export function validateAndTransformOpenAIResponseV2(response: unknown): ChildrenStory | null {
  try {
    // Parse and validate with Zod
    const parsed: ChildrenStory = ChildrenStorySchema.parse(response);

    // Additional validation: ensure all words are covered
    const gameBeats = parsed.main_blocks.filter(beat => beat.type === 'main');
    if (gameBeats.length === 0) {
      console.error('No main beats found in OpenAI response');
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

// region V2 structure

export const StoryBlockSchema = z
  .object({
    id: z.string().regex(/^p_[a-z0-9_-]{4,}$/, {
      message: 'id must match pattern p_[a-z0-9_-]{4,}',
    }),
    type: z.enum(['main', 'optional']),
    stage: z
      .enum(['beginning', 'middle', 'end', 'none'])
      .describe("Use 'none' for optional practice blocks."),
    focus_word: z.string().describe('The key word for this block'),
    used_words: z
      .array(z.string())
      .default([])
      .describe('Words used in this block, but not the focus.'),
    text: z
      .string()
      .min(10, 'Paragraph text should be at least 16 characters.')
      .describe('2–3 short sentences. Very simple vocabulary. No markdown.'),
  })
  .strict();

export const HeroArcSchema = z
  .object({
    beginning: z.string().describe('1–2 sentences summary of setup.'),
    middle: z.string().describe('1–2 sentences summary of challenge.'),
    end: z.string().describe('1–2 sentences summary of resolution.'),
  })
  .strict();

export const StatsSchema = z
  .object({
    total_word_count: z.number().int().min(1),
    main_count: z.number().int().min(1),
    optional_count: z.number().int().min(0),
    words_used: z
      .record(z.string(), z.number().int().min(0))
      .describe('Map from target word → count of occurrences in entire story.')
      .nullable(),
  })
  .strict();

export const ChildrenStorySchema = z
  .object({
    title: z.string().min(1),
    target_age_range: z.string(), // e.g. "5-10"
    level: z.string(), // e.g. "CEFR A1"
    hero_arc: HeroArcSchema,
    main_blocks: z
      .array(StoryBlockSchema)
      .min(10)
      .describe('The main story blocks that make up the hero story.'),
    optional_blocks: z.array(StoryBlockSchema).min(10).describe('The optional story blocks'),
    stats: StatsSchema,
  })
  .strict();

// Inferred TypeScript type
export type ChildrenStory = z.infer<typeof ChildrenStorySchema>;

// endregion V2 structure
