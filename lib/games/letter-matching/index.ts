/**
 * Letter Matching Game Mechanic
 */

import type { GameMechanic } from '@/types'
import { LetterMatching } from '@/components/games/LetterMatching'

export const letterMatchingMechanic: GameMechanic = {
  meta: {
    id: 'letter-matching',
    name: 'Letter Matching',
    description: 'Match lowercase letters with their uppercase counterparts',
    targetAge: [5, 7],
    supportsHints: true,
  },
  Component: LetterMatching,
}
