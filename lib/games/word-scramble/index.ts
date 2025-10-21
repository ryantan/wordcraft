/**
 * Word Scramble Game Mechanic
 */

import { WordScramble } from '@/components/games/WordScramble';
import type { GameMechanic } from '@/types';

export const wordScrambleMechanic: GameMechanic = {
  meta: {
    id: 'word-scramble',
    name: 'Word Scramble',
    description: 'Unscramble the letters to spell the word correctly',
    targetAge: [5, 10],
    supportsHints: true,
  },
  Component: WordScramble,
};
