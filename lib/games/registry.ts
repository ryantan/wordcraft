/**
 * Game Registry
 * Central registry for all game mechanics
 */

import type { GameMechanic, GameMechanicId } from '@/types'

class GameRegistry {
  private games = new Map<GameMechanicId, GameMechanic>()

  register(id: GameMechanicId, game: GameMechanic): void {
    if (this.games.has(id)) {
      console.warn(`Game mechanic '${id}' is already registered. Overwriting.`)
    }
    this.games.set(id, game)
  }

  get(id: GameMechanicId): GameMechanic | undefined {
    return this.games.get(id)
  }

  getAll(): GameMechanic[] {
    return Array.from(this.games.values())
  }

  getAllIds(): GameMechanicId[] {
    return Array.from(this.games.keys())
  }

  has(id: GameMechanicId): boolean {
    return this.games.has(id)
  }
}

// Singleton instance
export const gameRegistry = new GameRegistry()

// Helper functions
export function registerGame(id: GameMechanicId, game: GameMechanic): void {
  gameRegistry.register(id, game)
}

export function getGame(id: GameMechanicId): GameMechanic | undefined {
  return gameRegistry.get(id)
}

export function getAllGames(): GameMechanic[] {
  return gameRegistry.getAll()
}

export function getGameIds(): GameMechanicId[] {
  return gameRegistry.getAllIds()
}
