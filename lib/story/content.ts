/**
 * Story Narrative Content
 *
 * Age-appropriate narrative text for story mode checkpoints.
 * Reading level: Grade 1-2 (ages 5-7)
 * Tone: Encouraging, adventurous, positive
 * Language: Gender-neutral, culturally inclusive
 */

export interface StoryCheckpoint {
  id: string
  title: string
  narrative: string
  celebrationEmoji?: string
}

export interface StoryThemeContent {
  themeName: string
  intro: StoryCheckpoint
  checkpoints: StoryCheckpoint[]
  finale: StoryCheckpoint
}

/**
 * Space Adventure Theme (Primary)
 */
const spaceTheme: StoryThemeContent = {
  themeName: 'Space Adventure',

  intro: {
    id: 'intro',
    title: 'Begin Your Journey',
    narrative:
      'Welcome, Space Explorer! Your mission is to collect word treasures across the galaxy. Each word you master will reveal new planets to explore!',
    celebrationEmoji: '🚀',
  },

  checkpoints: [
    {
      id: 'checkpoint1',
      title: 'Moon Landing',
      narrative:
        "Amazing work! You've landed on the Moon and mastered your first set of words. The stars are calling – keep going!",
      celebrationEmoji: '🌙',
    },
    {
      id: 'checkpoint2',
      title: 'Mars Mission',
      narrative:
        "Incredible! You've reached Mars with {wordCount} words mastered. The asteroid belt is just ahead – you're halfway to your goal!",
      celebrationEmoji: '🔴',
    },
    {
      id: 'checkpoint3',
      title: 'Jupiter Journey',
      narrative:
        "You're unstoppable! Jupiter's moons are behind you, and you've conquered {wordCount} words. The final frontier awaits!",
      celebrationEmoji: '🪐',
    },
  ],

  finale: {
    id: 'finale',
    title: 'Mission Complete',
    narrative:
      "Mission Complete, Space Explorer! You've traveled across the galaxy and mastered all your words. You're a true Word Champion! Ready for your next adventure?",
    celebrationEmoji: '⭐',
  },
}

/**
 * Treasure Hunt Theme (Alternative)
 */
const treasureTheme: StoryThemeContent = {
  themeName: 'Treasure Hunt',

  intro: {
    id: 'intro',
    title: 'The Adventure Begins',
    narrative:
      'Ahoy, Treasure Hunter! A mysterious map has appeared, leading to hidden word treasures. Spell each word correctly to reveal the next clue!',
    celebrationEmoji: '🗺️',
  },

  checkpoints: [
    {
      id: 'checkpoint1',
      title: 'Beach Discovery',
      narrative:
        "Brilliant! You've found the first treasure chest on the beach. Five words collected! The map now shows a secret cave...",
      celebrationEmoji: '🏖️',
    },
    {
      id: 'checkpoint2',
      title: 'Cave Treasures',
      narrative:
        "Fantastic! The cave revealed amazing treasures, and you've mastered {wordCount} words. The map points to a hidden island!",
      celebrationEmoji: '⛰️',
    },
    {
      id: 'checkpoint3',
      title: 'Island Riches',
      narrative:
        "Extraordinary! The island's treasures are yours, with {wordCount} words conquered. The final treasure awaits at Skull Rock!",
      celebrationEmoji: '🏝️',
    },
  },

  finale: {
    id: 'finale',
    title: 'Treasure Complete',
    narrative:
      "Treasure Complete! You've found all the word treasures and filled your chest. You're a Master Treasure Hunter! What adventure awaits next?",
    celebrationEmoji: '💎',
  },
}

/**
 * Fantasy Quest Theme (Future)
 */
const fantasyTheme: StoryThemeContent = {
  themeName: 'Fantasy Quest',

  intro: {
    id: 'intro',
    title: 'The Quest Begins',
    narrative:
      'Brave Hero! The kingdom needs your help. Evil has spread across the land, and only mastering these magic words can save everyone. Your journey starts now!',
    celebrationEmoji: '⚔️',
  },

  checkpoints: [
    {
      id: 'checkpoint1',
      title: 'Enchanted Forest',
      narrative:
        "Well done! You've cleared the Enchanted Forest and learned your first spells. The castle gates lie ahead!",
      celebrationEmoji: '🌲',
    },
    {
      id: 'checkpoint2',
      title: 'Castle Courtyard',
      narrative:
        "Magnificent! The castle courtyard is yours, with {wordCount} magic words mastered. The dragon's lair is near!",
      celebrationEmoji: '🏰',
    },
    {
      id: 'checkpoint3',
      title: "Dragon's Mountain",
      narrative:
        "Heroic! You've conquered the dragon's mountain with {wordCount} words. The final battle awaits!",
      celebrationEmoji: '🐉',
    },
  },

  finale: {
    id: 'finale',
    title: 'Kingdom Saved',
    narrative:
      "Victory! You've saved the kingdom and mastered all the magic words. You're a true Hero! Ready for your next quest?",
    celebrationEmoji: '👑',
  },
}

/**
 * All available themes
 */
export const STORY_THEMES: Record<string, StoryThemeContent> = {
  space: spaceTheme,
  treasure: treasureTheme,
  fantasy: fantasyTheme,
}

/**
 * Get story content for a theme
 *
 * @param theme Theme name (defaults to 'space')
 * @returns Story content for the theme
 */
export function getStoryContent(theme: string = 'space'): StoryThemeContent {
  return STORY_THEMES[theme] || STORY_THEMES.space
}

/**
 * Get checkpoint narrative by index
 *
 * @param theme Theme name
 * @param checkpointIndex Checkpoint number (0, 1, 2)
 * @returns Checkpoint narrative text
 */
export function getCheckpointNarrative(theme: string, checkpointIndex: number): string {
  const content = getStoryContent(theme)

  if (checkpointIndex < 0 || checkpointIndex >= content.checkpoints.length) {
    return ''
  }

  return content.checkpoints[checkpointIndex].narrative
}

/**
 * Interpolate variables into narrative text
 *
 * Supports template variables like {wordCount}, {checkpointNumber}
 *
 * @param template Narrative text with {variables}
 * @param vars Object with variable values
 * @returns Interpolated text
 */
export function interpolateContent(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return vars[key]?.toString() || match
  })
}

/**
 * Get full checkpoint content with interpolated values
 *
 * @param theme Theme name
 * @param checkpointIndex Checkpoint index
 * @param vars Variables for interpolation (e.g., {wordCount: 10})
 * @returns Complete checkpoint object with interpolated narrative
 */
export function getCheckpointContent(
  theme: string,
  checkpointIndex: number,
  vars: Record<string, string | number> = {}
): StoryCheckpoint | null {
  const content = getStoryContent(theme)

  if (checkpointIndex < 0 || checkpointIndex >= content.checkpoints.length) {
    return null
  }

  const checkpoint = content.checkpoints[checkpointIndex]

  return {
    ...checkpoint,
    narrative: interpolateContent(checkpoint.narrative, vars),
  }
}

/**
 * Get intro content with interpolated values
 */
export function getIntroContent(
  theme: string,
  vars: Record<string, string | number> = {}
): StoryCheckpoint {
  const content = getStoryContent(theme)

  return {
    ...content.intro,
    narrative: interpolateContent(content.intro.narrative, vars),
  }
}

/**
 * Get finale content with interpolated values
 */
export function getFinaleContent(
  theme: string,
  vars: Record<string, string | number> = {}
): StoryCheckpoint {
  const content = getStoryContent(theme)

  return {
    ...content.finale,
    narrative: interpolateContent(content.finale.narrative, vars),
  }
}
