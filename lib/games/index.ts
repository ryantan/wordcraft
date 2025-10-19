/**
 * Game Mechanics Initialization
 * Registers all available game mechanics
 */

import { registerGame } from './registry'
import { wordScrambleMechanic } from './word-scramble'

// Register all game mechanics
export function initializeGames(): void {
  registerGame('word-scramble', wordScrambleMechanic)
}

// Auto-initialize on import (for client-side usage)
if (typeof window !== 'undefined') {
  initializeGames()
}

// Re-export registry functions
export { getGame, getAllGames, getGameIds } from './registry'
