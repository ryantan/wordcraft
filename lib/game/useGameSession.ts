/**
 * Game Session Hook
 *
 * Manages game session state and adaptive word/game selection.
 */

import { useState, useCallback, useEffect } from 'react'
import type { GameResult, GameMechanicId, WordList } from '@/types'
import { getGame, getGameIds } from '@/lib/games'
import { selectNextWord } from './word-selector'
import { initializeGameSession } from './session-manager'
import { processGameCompletion } from './session-tracker'
import { detectLearningStyle, selectNextGame } from '@/lib/algorithms/learning-style-detection'
import { getAllGameResults, getLearningProfile } from '@/lib/storage/sessionStorage'

const MAX_ROUNDS = 10

export interface GameSessionState {
  wordPool: string[]
  sessionPerformance: Map<string, GameResult[]>
  currentWord: string | null
  currentMechanicId: GameMechanicId | null
  recentGames: GameMechanicId[]
  results: GameResult[]
  roundsCompleted: number
  gameFinished: boolean
  roundKey: number
}

export function useGameSession(wordList: WordList | null, mechanicId: GameMechanicId | null) {
  const [state, setState] = useState<GameSessionState>({
    wordPool: [],
    sessionPerformance: new Map(),
    currentWord: null,
    currentMechanicId: null,
    recentGames: [],
    results: [],
    roundsCompleted: 0,
    gameFinished: false,
    roundKey: 0,
  })

  // Initialize session when word list loads
  useEffect(() => {
    if (!wordList) return

    const sessionConfig = initializeGameSession(wordList)
    setState(prev => ({
      ...prev,
      wordPool: sessionConfig.wordPool,
      sessionPerformance: sessionConfig.sessionPerformance,
    }))
  }, [wordList])

  // Start next round
  const startNextRound = useCallback(() => {
    if (!wordList || state.wordPool.length === 0) return

    // Select next word adaptively
    const nextWord = selectNextWord(
      state.wordPool,
      state.sessionPerformance,
      state.currentWord
    )
    if (!nextWord) return

    // Select game mechanic
    let mechanic: GameMechanicId
    if (mechanicId && getGame(mechanicId)) {
      mechanic = mechanicId
    } else {
      const allResults = getAllGameResults()
      const profile = getLearningProfile()

      // Use adaptive selection if enough data
      if (allResults.length >= 12) {
        mechanic = selectNextGame(
          profile || detectLearningStyle(allResults),
          state.recentGames
        )
      } else {
        // Random for first games
        const availableIds = getGameIds()
        mechanic = availableIds[Math.floor(Math.random() * availableIds.length)]
      }
    }

    setState(prev => ({
      ...prev,
      currentWord: nextWord,
      currentMechanicId: mechanic,
      recentGames: [...prev.recentGames.slice(-2), mechanic],
      roundKey: prev.roundKey + 1,
    }))
  }, [wordList, mechanicId, state.wordPool, state.sessionPerformance, state.currentWord, state.recentGames])

  // Handle game completion
  const handleGameComplete = useCallback(
    (result: GameResult) => {
      // Process with adaptive learning systems
      processGameCompletion(result)

      // Update local state
      setState(prev => {
        const newSessionPerformance = new Map(prev.sessionPerformance)
        const wordResults = newSessionPerformance.get(result.word) || []
        newSessionPerformance.set(result.word, [...wordResults, result])

        const nextRound = prev.roundsCompleted + 1
        const finished = nextRound >= MAX_ROUNDS

        return {
          ...prev,
          results: [...prev.results, result],
          roundsCompleted: nextRound,
          sessionPerformance: newSessionPerformance,
          gameFinished: finished,
        }
      })

      // Start next round after delay if not finished
      const nextRound = state.roundsCompleted + 1
      if (nextRound < MAX_ROUNDS) {
        setTimeout(() => {
          startNextRound()
        }, 2000)
      }
    },
    [state.roundsCompleted, startNextRound]
  )

  // Initialize first round when ready
  useEffect(() => {
    if (wordList && state.wordPool.length > 0 && !state.currentWord) {
      startNextRound()
    }
  }, [wordList, state.wordPool, state.currentWord, startNextRound])

  return {
    ...state,
    maxRounds: MAX_ROUNDS,
    startNextRound,
    handleGameComplete,
  }
}
