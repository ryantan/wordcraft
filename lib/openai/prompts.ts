/**
 * OpenAI Prompt Templates
 *
 * Manages prompt engineering for story generation
 * Provides structured templates for different beat types
 */

import { StoryGenerationRequest } from '@/lib/openai/story-integration';
import type { StoryBeat, StoryTheme } from '@/types/story';

/**
 * Base prompt context for all story generation
 */
export const BASE_STORY_CONTEXT = {
  role: "You are a creative children's story writer specializing in educational adventures.",
  guidelines: [
    'Keep language age-appropriate for children ages 5-10',
    'Make content engaging and interactive',
    'Use positive encouragement',
    'Avoid scary or inappropriate content',
    'Keep responses concise (2-3 sentences for narratives)',
  ],
};

/**
 * Theme-specific context and settings
 */
export const THEME_CONTEXTS: Record<StoryTheme, { setting: string; elements: string[] }> = {
  space: {
    setting: 'A thrilling space adventure exploring distant planets and galaxies',
    elements: ['rockets', 'planets', 'aliens', 'stars', 'space stations', 'asteroids'],
  },
  treasure: {
    setting: 'An exciting treasure hunt through mysterious lands',
    elements: ['maps', 'chests', 'pirates', 'islands', 'clues', 'gold coins'],
  },
  fantasy: {
    setting: 'A magical journey through enchanted kingdoms',
    elements: ['wizards', 'dragons', 'castles', 'spells', 'potions', 'magical creatures'],
  },
  ocean: {
    setting: 'An underwater adventure exploring the depths of the ocean',
    elements: ['submarines', 'fish', 'coral reefs', 'dolphins', 'treasure', 'mermaids'],
  },
  jungle: {
    setting: 'A wild expedition through dense jungle landscapes',
    elements: ['vines', 'animals', 'temples', 'rivers', 'bridges', 'hidden paths'],
  },
};

/**
 * Generate narrative beat prompt
 */
export function generateNarrativeBeatPrompt(
  theme: StoryTheme,
  context: string,
  progressPercentage: number,
): string {
  const themeContext = THEME_CONTEXTS[theme];

  return `Theme: ${themeContext.setting}

Current story progress: ${progressPercentage}% complete

Previous context: ${context}

Generate a short narrative paragraph (2-3 sentences) that:
1. Advances the story naturally from the previous context
2. Builds excitement and momentum
3. Incorporates elements like: ${themeContext.elements.join(', ')}
4. Keeps the adventure moving forward

Remember: This is for children learning to spell, so keep it encouraging and fun!`;
}

/**
 * Generate game beat prompt for a specific word
 */
export function generateGameBeatPrompt(
  theme: StoryTheme,
  word: string,
  gameType: string,
  context: string,
): string {
  const themeContext = THEME_CONTEXTS[theme];

  return `Theme: ${themeContext.setting}

Word to practice: "${word}"
Game type: ${gameType}

Previous context: ${context}

Create an engaging story prompt that:
1. Naturally introduces a spelling challenge for the word "${word}"
2. Makes the challenge feel like part of the adventure
3. Uses theme elements creatively (${themeContext.elements.slice(0, 3).join(', ')})
4. Motivates the child to spell the word correctly

Example format: "The [theme element] displays the word '${word.toUpperCase()}' - spell it correctly to [achieve goal]!"

Keep it to 1-2 sentences, exciting and encouraging.`;
}

/**
 * Generate choice beat prompt
 */
export function generateChoiceBeatPrompt(
  theme: StoryTheme,
  context: string,
  wordsRemaining: number,
): string {
  const themeContext = THEME_CONTEXTS[theme];

  return `Theme: ${themeContext.setting}

Previous context: ${context}
Words remaining in adventure: ${wordsRemaining}

Create a story choice that:
1. Presents an interesting decision point in the adventure
2. Offers two clear, exciting options
3. Uses theme elements: ${themeContext.elements.slice(0, 3).join(', ')}
4. Both choices should be positive and lead to fun outcomes

Format your response as:
Question: [The choice question]
Option A: [First choice]
Option B: [Second choice]

Keep the question short and the options to 3-4 words each.`;
}

/**
 * Generate checkpoint celebration prompt
 */
export function generateCheckpointPrompt(
  theme: StoryTheme,
  checkpointNumber: number,
  wordsCompleted: number,
): string {
  const themeContext = THEME_CONTEXTS[theme];
  const checkpointNames = ['First', 'Second', 'Third'];

  return `Theme: ${themeContext.setting}

Checkpoint: ${checkpointNames[checkpointNumber - 1]} milestone reached!
Words mastered: ${wordsCompleted}

Create a celebratory narrative (2-3 sentences) that:
1. Congratulates the child on their progress
2. References their spelling achievements
3. Builds excitement for continuing the adventure
4. Incorporates a special ${themeContext.elements[checkpointNumber - 1]} as a reward

Make it feel like a major accomplishment in their ${theme} adventure!`;
}

/**
 * Validate and sanitize prompt inputs
 */
export function sanitizePromptInput(input: string): string {
  // Remove any potential prompt injection attempts
  return input
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Build complete system prompt for OpenAI
 */
export function buildSystemPromptLegacy(): string {
  return `${BASE_STORY_CONTEXT.role}

Guidelines:
${BASE_STORY_CONTEXT.guidelines.map(g => `- ${g}`).join('\n')}

You're creating content for WordCraft, an educational spelling game.
Always maintain story continuity and theme consistency.`;
}

/**
 * Format beat response into structured data
 */
export function parseGameBeatResponse(
  response: string,
  _word: string,
  _gameType: string,
): Partial<StoryBeat> {
  return {
    narrative: sanitizePromptInput(response),
    // Additional fields will be filled by the story generator
  };
}

/**
 * Format choice beat response
 */
export function parseChoiceBeatResponse(response: string): {
  question: string;
  options: [string, string];
} {
  const lines = response.split('\n').filter(line => line.trim());

  // Parse question and options from response
  const question =
    lines
      .find(l => l.startsWith('Question:'))
      ?.replace('Question:', '')
      .trim() || '';
  const optionA =
    lines
      .find(l => l.startsWith('Option A:'))
      ?.replace('Option A:', '')
      .trim() || '';
  const optionB =
    lines
      .find(l => l.startsWith('Option B:'))
      ?.replace('Option B:', '')
      .trim() || '';

  return {
    question: sanitizePromptInput(question),
    options: [sanitizePromptInput(optionA), sanitizePromptInput(optionB)],
  };
}

export const customStorySystemV1 = `
You are a creative children's story writer specializing in short educational 
adventures that weaves around a list of words. 

The stories take the form of 15-25 short paragraphs, each 1-2 sentences long, 
which we will eventually put together to form the story.
The first paragraph sets the setting and hero using 2-3 sentences. Incorporate 
one of the given words here.

The second paragraph sets the villain and a problem for the hero. Try to 
incorporate one of the given words here.

The third paragraph explains the mission of the hero - for example to save 
the villagers, rescue her friends, find the stolen treasures, etc.

The next 8 or so paragraphs describes the short adventure of the hero while 
on the mission. In each paragraph, try to incorporate one of the given words 
as something the reader has to figure out - don't give it away in the 
narrative! We'll then let the user play a short game to figure it out.

At a suitable time, circle back to the word used in the first paragraph. 
Example, the first paragraph may mention that the hero likes to eat 
carrots. We can then let the reader play a mini game where they have to 
guess what the hero likes to eat, in order to overcome one of the 
in-story challenges - maybe it's a quiz given by a wizard, or a challenge 
given by a witch.

Sometimes the reader would fail the challenges, so we will prepare 
another 5 obstacles the hero may need to go through - structure these as 
optional obstacles that we can introduce when required, but does not 
really affect the story.

Next, craft a paragraph where the hero faces the villain and up the stakes.

For the next few paragraphs, craft a challenge for each of the given 
words - the reader has to figure out each word in order to advance to the 
next challenge. For these paragraphs, make them independent of each 
other, i.e. make sure they work whether they are included in the final 
story or not. We will pick and chose from these paragraphs when putting 
together the final story.

At the end, craft a challenge for the word used in paragraph 2 in order for 
the reader to deal the final blow to the villain.

Finally, craft a happy ending - to be used if the reader is successful in 
overcoming the challenge, and a unhappy ending - to be used if the reader 
fails to overcome the challenge. We will pick either one when putting the 
final story together.

Keep the language age-appropriate for children learning to spell.

Generate structured story data in JSON format.`;

export const customStorySystemV2 = `You are a children’s story writer. You write 
for ages 5-10. Use very short, simple sentences (mostly 6–12 words). 
Prefer subject-verb-object. Avoid commas and long clauses. Each block has 
2–3 sentences. Keep it cheerful and exaggerated for comedy effect. Add in 
unexpected twists, let the villain do silly things, allow some goofing around. 
No scary content.

The story must follow a classic hero arc with a clear beginning (setup), middle 
(challenge), and end (resolution).

Main story blocks makes up the story. Each block:
- focuses on one target word,
- uses the target word naturally,
- advances the plot.

Optional story blocks (optional_blocks) are optional vocabulary practice. Each optional block:
- focuses on one target word,
- uses the target word naturally,
- stands alone (the story still works if skipped),
- does not advance plot.

Return only JSON that validates against the provided schema. No extra text.`;

export const customStoryUser = `Write a children’s story with theme {THEME} that:

Uses these exact {WORDS_LENGTH} words naturally at least once: {WORDS_JSON_ARRAY}.

Target reading level: {LEVEL} (e.g., “CEFR A1” or “very early reader”).

Max total length: {MAX_WORDS} words.

Make the hero arc clear: setup (beginning) → challenge (middle) → resolution (end).

- Please produce 2 main narrative-only blocks that introduce the setting.
- Please produce 4 main blocks should be used to build the setup stage. 
- Please produce 6 blocks for the middle challenge stage.
- Please produce {OPTIONAL_COUNT} optional blocks that we may use where required.
- And lastly please produce 4 blocks for a satisfying resolution stage. 

Fill the JSON fields as specified by the schema below. Return only the JSON object.`;

export const wordInfoSystemPromptV1 = `You are a children’s story writer. You write 
for ages 5-10. Use very short, simple sentences (mostly 6–12 words). 
Prefer subject-verb-object. Keep a cheerful, safe tone. No scary content.

For each target word (store in target_words), 
- give a simplified definition,
- come up with a hint
- rank them 1-10 with 10 being the most difficult out of all target words (store in difficulty).
- If you can, find 2 common words (store in similar_words) that have similar spelling, sometimes only a few letters off, that might make them confusing. Only use words suitable for kids.

Return only JSON that validates against the provided schema. No extra text.`;

// LEVEL: e.g., “CEFR A1” or “very early reader”
export const wordInfoUserPromptV1 = `These are the target words: {WORDS_JSON_ARRAY}.

Target reading level: {LEVEL}.

Fill the JSON fields as specified by the schema below. Return only the JSON object.`;

/**
 * Build user prompt from request parameters
 * @param request - Story generation request
 * @returns Formatted prompt string
 */
export const buildSystemPromptV1 = (request: StoryGenerationRequest): string => {
  console.log('buildSystemPrompt request:', request);
  return customStorySystemV1;
};

/**
 * Build user prompt from request parameters
 * @param request - Story generation request
 * @returns Formatted prompt string
 */
const buildSystemPromptV2 = (request: StoryGenerationRequest): string => {
  console.log('buildSystemPrompt request:', request);
  return customStorySystemV2;
};

export const buildSystemPrompt = buildSystemPromptV2;

export const buildSystemPromptForWordInfo = (request: StoryGenerationRequest): string => {
  console.log('buildSystemPromptForWordInfo request:', request);

  return wordInfoSystemPromptV1;
};
export const buildUserPromptForWordInfo = (request: StoryGenerationRequest): string => {
  console.log('buildUserPromptForWordInfo request:', request);

  const {
    // v
    theme,
    wordList,
  } = request;

  return (
    wordInfoUserPromptV1
      .replace('{THEME}', theme)
      .replace('{WORDS_LENGTH}', `${wordList.length}`)
      .replace('{WORDS_JSON_ARRAY}', JSON.stringify(wordList))
      // .replace('{LEVEL}', 'CEFR A1')
      .replace('{LEVEL}', 'CEFR B2')
      .replace('{MAX_WORDS}', '600')
      .replace('{MAIN_COUNT}', '12')
      .replace('{OPTIONAL_COUNT}', `${wordList.length}`)
  );
};

/**
 * Build user prompt from request parameters
 * @param request - Story generation request
 * @returns Formatted prompt string
 */
export const buildUserPromptV1 = (request: StoryGenerationRequest): string => {
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
};

/**
 * Build user prompt from request parameters
 * @param request - Story generation request
 * @returns Formatted prompt string
 */
export const buildUserPrompt = (request: StoryGenerationRequest): string => {
  const {
    // v
    theme,
    wordList,
  } = request;

  return (
    customStoryUser
      .replace('{THEME}', theme)
      .replace('{WORDS_LENGTH}', `${wordList.length}`)
      .replace('{WORDS_JSON_ARRAY}', JSON.stringify(wordList))
      // .replace('{LEVEL}', 'CEFR A1')
      .replace('{LEVEL}', 'CEFR B2')
      .replace('{MAX_WORDS}', '600')
      .replace('{MAIN_COUNT}', '12')
      .replace('{OPTIONAL_COUNT}', `${wordList.length}`)
  );
};
