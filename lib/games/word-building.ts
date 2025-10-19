/**
 * Word Building Blocks Game Mechanic
 */

import type { GameMechanic } from '@/types'
import { WordBuildingBlocks } from '@/components/games/WordBuildingBlocks'

export const wordBuildingMechanic: GameMechanic = {
  meta: {
    id: 'word-building',
    name: 'Word Building Blocks',
    description: 'Drag and drop letter tiles to construct the word',
    targetAge: [5, 10],
    supportsHints: true,
  },
  Component: WordBuildingBlocks,
}
