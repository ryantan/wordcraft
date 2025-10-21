/**
 * Letter Hunt Game Mechanic
 */

import { LetterHunt } from '@/components/games/LetterHunt';
import type { GameMechanic } from '@/types';

export const letterHuntMechanic: GameMechanic = {
  meta: {
    id: 'letter-hunt',
    name: 'Letter Hunt',
    description: 'Find and collect letters in sequence within an interactive scene',
    targetAge: [5, 10],
    supportsHints: true,
  },
  Component: LetterHunt,
};
