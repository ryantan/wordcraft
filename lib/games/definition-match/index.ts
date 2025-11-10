/**
 * Definition Match Game Mechanic
 */

import { DefinitionMatch } from '@/components/games/DefinitionMatch';
import type { GameMechanic } from '@/types';

export const definitionMatchMechanic: GameMechanic = {
  meta: {
    id: 'definition-match',
    name: 'Definition Match',
    description: 'Match the word to its definition from similar options',
    targetAge: [7, 12],
    supportsHints: true,
  },
  Component: DefinitionMatch,
};