/**
 * Confidence & Learning Style Types
 * Types for adaptive learning engine
 */

import type { GameResult } from './game'

export interface ConfidenceScore {
  word: string
  score: number // 0-1, where 1 is fully confident
  lastPracticed: Date
  attempts: number
  successRate: number
  recentResults: GameResult[]
}

export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'mixed'

export interface LearningStyleData {
  style: LearningStyle
  confidence: number // 0-1, how confident we are in this assessment
  gamePerformance: Map<string, number[]> // game mechanic ID -> scores
  lastUpdated: Date
}

export interface AdaptiveRecommendation {
  nextWord: string
  gameMechanic: string
  difficulty: 'easy' | 'medium' | 'hard'
  reason: string
}
