/**
 * Word Building Blocks Game Mechanic
 */

import { WordBuildingBlocks } from '@/components/games/WordBuildingBlocks';
import type { GameMechanic } from '@/types';

export const wordBuildingMechanic: GameMechanic = {
  meta: {
    id: 'word-building',
    name: 'Word Building Blocks',
    description: 'Drag and drop letter tiles to construct the word',
    targetAge: [5, 10],
    supportsHints: true,
  },
  Component: WordBuildingBlocks,
};
