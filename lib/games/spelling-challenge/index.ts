/**
 * Spelling Challenge Game Mechanic
 */

import type { GameMechanic } from '@/types'
import { SpellingChallenge } from '@/components/games/SpellingChallenge'

export const spellingChallengeMechanic: GameMechanic = {
  meta: {
    id: 'spelling-challenge',
    name: 'Spelling Challenge',
    description: 'Type the correct spelling of the word from memory',
    targetAge: [7, 10],
    supportsHints: true,
  },
  Component: SpellingChallenge,
}
