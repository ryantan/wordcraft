import { z } from 'zod';

export const wordInfoSchema = z
  .object({
    meaning: z
      .string()
      .min(10)
      .describe('A simple definition of the word, suitable for 5-10 year olds'),
    hint: z.string().min(10).describe('A short hint helpful to pick out the word from others'),
    similar_words: z
      .array(z.string())
      .min(0)
      .describe('3-5 similar words that may be confused with this word'),
    difficulty: z
      .number()
      .describe('1-10 with 10 being the most difficult out of all target words.'),
  })
  .strict();

export const wordInfoMapSchema = z
  .record(z.string().describe('The word from the list'), wordInfoSchema)
  .describe('Map of all the target words to their related info.')
  .nullable();

export const wordInfoMapResponseSchema = z.object({
  target_words: wordInfoMapSchema,
});

export type WordInfo = z.infer<typeof wordInfoSchema>;
export type WordInfoMap = z.infer<typeof wordInfoMapSchema>;
export type WordInfoMapResponse = z.infer<typeof wordInfoMapResponseSchema>;
