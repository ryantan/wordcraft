/**
 * Story Asset Configuration
 *
 * Defines paths to all story mode visual assets.
 * Theme: Space Adventure (recommended for universal appeal)
 */

export interface StoryAssetPaths {
  characters: {
    neutral: string;
    celebrating: string;
    thinking: string;
  };
  backgrounds: {
    intro: string;
    checkpoint1: string;
    checkpoint2: string;
    checkpoint3: string;
    finale: string;
  };
  icons: {
    checkpoint: string;
    progress: string;
    lock: string;
  };
}

/**
 * Space Adventure Theme Assets
 *
 * Note: Placeholder paths - actual assets need to be added to /public/story-assets/
 * See /public/story-assets/README.md for asset requirements and sources
 */
export const STORY_ASSETS: Record<string, StoryAssetPaths> = {
  space: {
    characters: {
      neutral: '/story-assets/characters/astronaut-neutral.svg',
      celebrating: '/story-assets/characters/astronaut-celebrating.svg',
      thinking: '/story-assets/characters/astronaut-thinking.svg',
    },
    backgrounds: {
      intro: '/story-assets/backgrounds/intro-space-station.svg',
      checkpoint1: '/story-assets/backgrounds/checkpoint1-moon.svg',
      checkpoint2: '/story-assets/backgrounds/checkpoint2-mars.svg',
      checkpoint3: '/story-assets/backgrounds/checkpoint3-jupiter.svg',
      finale: '/story-assets/backgrounds/finale-stars.svg',
    },
    icons: {
      checkpoint: '/story-assets/icons/checkpoint-star.svg',
      progress: '/story-assets/icons/progress-dot.svg',
      lock: '/story-assets/icons/lock-icon.svg',
    },
  },

  // Future themes can be added here
  treasure: {
    characters: {
      neutral: '/story-assets/characters/pirate-neutral.svg',
      celebrating: '/story-assets/characters/pirate-celebrating.svg',
      thinking: '/story-assets/characters/pirate-thinking.svg',
    },
    backgrounds: {
      intro: '/story-assets/backgrounds/treasure-beach.svg',
      checkpoint1: '/story-assets/backgrounds/treasure-island1.svg',
      checkpoint2: '/story-assets/backgrounds/treasure-cave.svg',
      checkpoint3: '/story-assets/backgrounds/treasure-island2.svg',
      finale: '/story-assets/backgrounds/treasure-reveal.svg',
    },
    icons: {
      checkpoint: '/story-assets/icons/treasure-flag.svg',
      progress: '/story-assets/icons/treasure-coin.svg',
      lock: '/story-assets/icons/treasure-lock.svg',
    },
  },
};

/**
 * Get asset paths for a specific theme
 *
 * @param theme Theme name (default: 'space')
 * @returns Asset paths object
 */
export function getStoryAssets(theme: string = 'space'): StoryAssetPaths {
  return STORY_ASSETS[theme] || STORY_ASSETS.space;
}

/**
 * Check if all assets for a theme exist
 * This is for development/debugging purposes
 *
 * @param theme Theme name
 * @returns true if assets can be loaded (basic check)
 */
export function validateStoryAssets(theme: string): boolean {
  const assets = getStoryAssets(theme);

  // Basic validation - check if paths are defined
  return !!(assets.characters.neutral && assets.backgrounds.intro && assets.icons.checkpoint);
}
