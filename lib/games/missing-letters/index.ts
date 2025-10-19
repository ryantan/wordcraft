/**
 * Missing Letters Game Mechanic
 */

import type { GameMechanic } from '@/types'
import { MissingLetters } from '@/components/games/MissingLetters'

export const missingLettersMechanic: GameMechanic = {
  meta: {
    id: 'missing-letters',
    name: 'Missing Letters',
    description: 'Fill in the blank spaces with the correct letters',
    targetAge: [5, 8],
    supportsHints: true,
  },
  Component: MissingLetters,
}
