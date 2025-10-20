/**
 * Story Generation Module
 *
 * Generates story beats with contextual narrative for Story Mode.
 * Current: Template-based stub implementation
 * Future: OpenAI API integration for dynamic story generation
 */

import type {
  StoryGenerationInput,
  GeneratedStory,
  StoryBeat,
  GameBeat,
  ChoiceBeat,
  NarrativeBeat,
  CheckpointBeat,
} from '@/types/story'
import { getStoryContent } from './content'

/**
 * Generate a complete story with beats for word practice
 *
 * STUB IMPLEMENTATION:
 * - Returns template-based beats with hardcoded narratives
 * - TODO: Replace with OpenAI API call for dynamic story generation
 * - TODO: LLM prompt: "Generate a {theme} adventure story with beats for these words: {wordList}"
 *
 * @param input - Story generation parameters
 * @returns Generated story with Stage 1 and Stage 2 beats
 */
export function generateStory(
  input: StoryGenerationInput
): GeneratedStory {
  const { wordList, theme } = input

  // Get story content for theme
  const storyContent = getStoryContent(theme as any) // Type assertion for stub

  const stage1Beats: StoryBeat[] = []
  let beatIndex = 0

  // Generate beats for each word with narrative flavor
  for (let i = 0; i < wordList.length; i++) {
    const word = wordList[i]
    beatIndex++

    // Add narrative beats periodically for story progression
    if (i % 3 === 0 && i > 0) {
      const narrativeBeat: NarrativeBeat = {
        type: 'narrative',
        id: `narrative-${beatIndex}`,
        narrative: getNarrativeForBeat(theme, beatIndex),
      }
      stage1Beats.push(narrativeBeat)
      beatIndex++
    }

    // Add choice beats occasionally for engagement
    if (i === 2 || i === Math.floor(wordList.length / 2)) {
      const choiceBeat: ChoiceBeat = {
        type: 'choice',
        id: `choice-${beatIndex}`,
        narrative: 'You encounter a fork in the path...',
        question: getChoiceQuestion(theme, beatIndex),
        options: getChoiceOptions(theme, beatIndex),
      }
      stage1Beats.push(choiceBeat)
      beatIndex++
    }

    // Add game beat for this word
    const gameBeat: GameBeat = {
      type: 'game',
      id: `game-${word}-stage1`,
      narrative: getGameNarrative(theme, word, i),
      word,
      gameType: selectGameType(i),
      stage: 1,
    }
    stage1Beats.push(gameBeat)

    // Add checkpoint beats at positions 5, 10, 15
    const gamesCompleted = stage1Beats.filter((b) => b.type === 'game').length
    if (gamesCompleted === 5 || gamesCompleted === 10 || gamesCompleted === 15) {
      const checkpointNum = gamesCompleted === 5 ? 1 : gamesCompleted === 10 ? 2 : 3
      const checkpoint = storyContent.checkpoints[checkpointNum - 1]

      const checkpointBeat: CheckpointBeat = {
        type: 'checkpoint',
        id: `checkpoint-${checkpointNum}`,
        narrative: checkpoint.narrative.replace('{wordCount}', String(gamesCompleted)),
        checkpointNumber: checkpointNum as 1 | 2 | 3,
        celebrationEmoji: checkpoint.celebrationEmoji || '🎉',
        title: checkpoint.title,
      }
      stage1Beats.push(checkpointBeat)
      beatIndex++
    }
  }

  // Stage 2: Extra beats for low-confidence words (stub - empty for now)
  const stage2ExtraBeats = new Map<string, StoryBeat[]>()

  // Stage 2: Fixed sequence for fallback practice (stub)
  const stage2FixedSequence: StoryBeat[] = []

  return {
    stage1Beats,
    stage2ExtraBeats,
    stage2FixedSequence,
  }
}

/**
 * Get narrative text for a narrative beat
 * TODO: Replace with LLM-generated contextual narrative
 */
function getNarrativeForBeat(theme: string, beatIndex: number): string {
  const narratives: Record<string, string[]> = {
    space: [
      'Your spacecraft speeds through the cosmos, passing brilliant nebulae.',
      'You navigate through an asteroid field with expert precision.',
      'A distant galaxy sparkles in your viewscreen.',
      'Your mission control sends encouraging messages from Earth.',
    ],
    treasure: [
      'The ancient map reveals new markings as you progress.',
      'You discover mysterious footprints leading deeper into the jungle.',
      'A parrot squawks overhead, as if guiding your way.',
      'The treasure chest glows brighter with each word you master.',
    ],
    fantasy: [
      'The magical forest grows more enchanted with each step.',
      'A friendly dragon flies overhead, breathing sparkles of encouragement.',
      'Ancient runes glow on nearby stones, celebrating your progress.',
      'The wizard\'s tower grows closer on the horizon.',
    ],
  }

  const themeNarratives = narratives[theme] || narratives.space
  const index = beatIndex % themeNarratives.length
  return themeNarratives[index]
}

/**
 * Get game narrative for a specific word
 * TODO: Replace with LLM-generated word-relevant narrative
 */
function getGameNarrative(theme: string, word: string, index: number): string {
  const templates: Record<string, string[]> = {
    space: [
      `A space beacon signals "${word.toUpperCase()}" - can you spell it to unlock the next sector?`,
      `Planet ${word.toUpperCase()} appears on your star map. Master its name to land safely!`,
      `The alien message reads "${word.toUpperCase()}" - decipher it to proceed!`,
      `Your spacecraft computer asks you to spell "${word.toUpperCase()}" to continue the mission.`,
    ],
    treasure: [
      `The treasure chest lock shows the word "${word.toUpperCase()}" - spell it to open!`,
      `An ancient inscription requires you to spell "${word.toUpperCase()}" correctly.`,
      `The map reveals: "${word.toUpperCase()}" holds the key to the next clue!`,
      `A mysterious riddle asks: How do you spell "${word.toUpperCase()}"?`,
    ],
    fantasy: [
      `A magical spell requires the word "${word.toUpperCase()}" - cast it correctly!`,
      `The enchanted door asks: "Spell ${word.toUpperCase()} to enter."`,
      `A friendly creature needs help spelling "${word.toUpperCase()}".`,
      `The wizard's scroll glows with the word "${word.toUpperCase()}" - master it!`,
    ],
  }

  const themeTemplates = templates[theme] || templates.space
  const templateIndex = index % themeTemplates.length
  return themeTemplates[templateIndex]
}

/**
 * Get choice question for theme
 * TODO: Replace with LLM-generated contextual choices
 */
function getChoiceQuestion(theme: string, beatIndex: number): string {
  const questions: Record<string, string[]> = {
    space: [
      'Which path through the asteroid belt looks safer?',
      'Should you explore the mysterious signal or continue to the next planet?',
    ],
    treasure: [
      'Do you enter the dark cave or follow the river?',
      'Should you ask the parrot for help or check your compass?',
    ],
    fantasy: [
      'Do you take the enchanted forest path or the mountain trail?',
      'Should you ask the dragon for advice or consult your magic book?',
    ],
  }

  const themeQuestions = questions[theme] || questions.space
  return themeQuestions[beatIndex % themeQuestions.length]
}

/**
 * Get choice options for theme
 * TODO: Replace with LLM-generated contextual options
 */
function getChoiceOptions(theme: string, beatIndex: number): [string, string] {
  const options: Record<string, [string, string][]> = {
    space: [
      ['Take the northern route', 'Take the southern route'],
      ['Investigate the signal', 'Continue to next planet'],
    ],
    treasure: [
      ['Enter the cave', 'Follow the river'],
      ['Ask the parrot', 'Check the compass'],
    ],
    fantasy: [
      ['Forest path', 'Mountain trail'],
      ['Ask the dragon', 'Consult magic book'],
    ],
  }

  const themeOptions = options[theme] || options.space
  return themeOptions[beatIndex % themeOptions.length]
}

/**
 * Select appropriate game type based on progression
 * Cycles through different game types for variety
 */
function selectGameType(
  index: number
): 'letterMatching' | 'wordBuilding' | 'spellingChallenge' | 'wordScramble' | 'missingLetters' {
  const gameTypes: Array<'letterMatching' | 'wordBuilding' | 'spellingChallenge' | 'wordScramble' | 'missingLetters'> = [
    'letterMatching',
    'wordScramble',
    'wordBuilding',
    'missingLetters',
    'spellingChallenge',
  ]

  return gameTypes[index % gameTypes.length]
}

/**
 * Generate Stage 2 beats for a specific word
 * Used when word needs additional practice
 *
 * TODO: Implement with LLM generation
 */
export function generateStage2BeatsForWord(
  _word: string,
  _theme: string
): StoryBeat[] {
  // STUB: Return empty array
  // TODO: Generate contextual practice beats for this specific word
  return []
}
