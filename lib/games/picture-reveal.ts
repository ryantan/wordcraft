/**
 * Picture Reveal Game Mechanic
 */

import type { GameMechanic } from '@/types'
import { PictureReveal } from '@/components/games/PictureReveal'

export const pictureRevealMechanic: GameMechanic = {
  meta: {
    id: 'picture-reveal',
    name: 'Picture Reveal',
    description: 'Reveal a hidden picture by spelling letters correctly',
    targetAge: [5, 10],
    supportsHints: true,
  },
  Component: PictureReveal,
}
