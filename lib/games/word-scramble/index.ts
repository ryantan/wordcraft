/**
 * Word Scramble Game Mechanic
 */

import type { GameMechanic } from '@/types'
import { WordScramble } from '@/components/games/WordScramble'

export const wordScrambleMechanic: GameMechanic = {
  meta: {
    id: 'word-scramble',
    name: 'Word Scramble',
    description: 'Unscramble the letters to spell the word correctly',
    targetAge: [5, 10],
    supportsHints: true,
  },
  Component: WordScramble,
}
