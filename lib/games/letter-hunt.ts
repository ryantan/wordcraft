/**
 * Letter Hunt Game Mechanic
 */

import type { GameMechanic } from '@/types'
import { LetterHunt } from '@/components/games/LetterHunt'

export const letterHuntMechanic: GameMechanic = {
  meta: {
    id: 'letter-hunt',
    name: 'Letter Hunt',
    description: 'Find and collect letters in sequence within an interactive scene',
    targetAge: [5, 10],
    supportsHints: true,
  },
  Component: LetterHunt,
}
