/**
 * Spelling Challenge Game Mechanic
 */

import { SpellingChallenge } from '@/components/games/SpellingChallenge';
import type { GameMechanic } from '@/types';

export const spellingChallengeMechanic: GameMechanic = {
  meta: {
    id: 'spelling-challenge',
    name: 'Spelling Challenge',
    description: 'Type the correct spelling of the word from memory',
    targetAge: [7, 10],
    supportsHints: true,
  },
  Component: SpellingChallenge,
};
