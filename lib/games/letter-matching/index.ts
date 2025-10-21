/**
 * Letter Matching Game Mechanic
 */

import { LetterMatching } from '@/components/games/LetterMatching';
import type { GameMechanic } from '@/types';

export const letterMatchingMechanic: GameMechanic = {
  meta: {
    id: 'letter-matching',
    name: 'Letter Matching',
    description: 'Match lowercase letters with their uppercase counterparts',
    targetAge: [5, 7],
    supportsHints: true,
  },
  Component: LetterMatching,
};
