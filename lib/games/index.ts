/**
 * Game Mechanics Initialization
 * Registers all available game mechanics
 */

import { definitionMatchMechanic } from './definition-match';
import { letterHuntMechanic } from './letter-hunt';
import { letterMatchingMechanic } from './letter-matching';
import { missingLettersMechanic } from './missing-letters';
import { pictureRevealMechanic } from './picture-reveal';
import { registerGame } from './registry';
import { spellingChallengeMechanic } from './spelling-challenge';
import { traceWriteMechanic } from './trace-write';
import { wordBuildingMechanic } from './word-building';
import { wordScrambleMechanic } from './word-scramble';

export type GameMechanics =
  | 'word-scramble'
  | 'missing-letters'
  | 'letter-matching'
  | 'spelling-challenge'
  | 'letter-hunt'
  | 'picture-reveal'
  | 'word-building'
  | 'trace-write'
  | 'definition-match';

export const gameMechanics: Array<GameMechanics> = [
  'word-scramble',
  'missing-letters',
  'letter-matching',
  'spelling-challenge',
  'letter-hunt',
  'picture-reveal',
  'word-building',
  'trace-write',
  'definition-match',
];

export const gameMechanicsWithoutRequirements: Array<GameMechanics> = [
  'word-scramble',
  'missing-letters',
  'letter-matching',
  'spelling-challenge',
  'letter-hunt',
  'picture-reveal',
  'word-building',
  'trace-write',
];

// Register all game mechanics
export function initializeGames(): void {
  registerGame('word-scramble', wordScrambleMechanic);
  registerGame('missing-letters', missingLettersMechanic);
  registerGame('letter-matching', letterMatchingMechanic);
  registerGame('spelling-challenge', spellingChallengeMechanic);
  registerGame('letter-hunt', letterHuntMechanic);
  registerGame('picture-reveal', pictureRevealMechanic);
  registerGame('word-building', wordBuildingMechanic);
  registerGame('trace-write', traceWriteMechanic);
  registerGame('definition-match', definitionMatchMechanic);
}

// Auto-initialize on import (for client-side usage)
if (typeof window !== 'undefined') {
  initializeGames();
}

// Re-export registry functions
export { getGame, getAllGames, getGameIds } from './registry';
