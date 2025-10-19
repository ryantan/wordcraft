/**
 * Session Types
 * Types for game sessions and history
 */

import type { GameResult } from './game'

export interface GameSession {
  id: string
  wordListId: string
  startedAt: Date
  completedAt?: Date
  results: GameResult[]
  wordsCompleted: Set<string>
  currentWordIndex: number
  isComplete: boolean
}

export interface SessionHistory {
  id: string
  wordListId: string
  wordListName: string
  startedAt: Date
  completedAt: Date
  totalWords: number
  wordsCompleted: number
  totalAttempts: number
  averageTimeMs: number
  successRate: number
  results: GameResult[]
}

export interface SessionSummary {
  id: string
  wordListName: string
  completedAt: Date
  wordsCompleted: number
  totalWords: number
  successRate: number
}
