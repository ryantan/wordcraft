/**
 * Game Mechanics Initialization
 * Registers all available game mechanics
 */

import { registerGame } from './registry'
import { wordScrambleMechanic } from './word-scramble'
import { missingLettersMechanic } from './missing-letters'
import { letterMatchingMechanic } from './letter-matching'
import { spellingChallengeMechanic } from './spelling-challenge'
import { letterHuntMechanic } from './letter-hunt'

// Register all game mechanics
export function initializeGames(): void {
  registerGame('word-scramble', wordScrambleMechanic)
  registerGame('missing-letters', missingLettersMechanic)
  registerGame('letter-matching', letterMatchingMechanic)
  registerGame('spelling-challenge', spellingChallengeMechanic)
  registerGame('letter-hunt', letterHuntMechanic)
}

// Auto-initialize on import (for client-side usage)
if (typeof window !== 'undefined') {
  initializeGames()
}

// Re-export registry functions
export { getGame, getAllGames, getGameIds } from './registry'
