/**
 * Missing Letters Game Mechanic
 */

import { MissingLetters } from '@/components/games/MissingLetters';
import type { GameMechanic } from '@/types';

export const missingLettersMechanic: GameMechanic = {
  meta: {
    id: 'missing-letters',
    name: 'Missing Letters',
    description: 'Fill in the blank spaces with the correct letters',
    targetAge: [5, 8],
    supportsHints: true,
  },
  Component: MissingLetters,
};
