/**
 * Game Session Hook
 *
 * Manages game session state and adaptive word/game selection.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
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
  const initializedRef = useRef(false)

  // Initialize session when word list loads
  useEffect(() => {
    if (!wordList) return

    const sessionConfig = initializeGameSession(wordList)
    setState(prev => ({
      ...prev,
      wordPool: sessionConfig.wordPool,
      sessionPerformance: sessionConfig.sessionPerformance,
      currentWord: null,
      currentMechanicId: null,
    }))
  }, [wordList])

  // Start next round
  const startNextRound = useCallback(() => {
    if (!wordList) return

    setState(prev => {
      if (prev.wordPool.length === 0) return prev

      // Select next word adaptively
      const nextWord = selectNextWord(
        prev.wordPool,
        prev.sessionPerformance,
        prev.currentWord
      )
      if (!nextWord) return prev

      // Select game mechanic
      let mechanic: GameMechanicId
      if (mechanicId && getGame(mechanicId)) {
        mechanic = mechanicId
      } else {
        const allResults = getAllGameResults()
        const profile = getLearningProfile()
        const availableIds = getGameIds()

        // Use adaptive selection if enough data
        if (allResults.length >= 12) {
          mechanic = selectNextGame(
            profile || detectLearningStyle(allResults),
            availableIds,
            prev.recentGames
          )
        } else {
          // Random for first games
          mechanic = availableIds[Math.floor(Math.random() * availableIds.length)]
        }
      }

      return {
        ...prev,
        currentWord: nextWord,
        currentMechanicId: mechanic,
        recentGames: [...prev.recentGames.slice(-2), mechanic],
        roundKey: prev.roundKey + 1,
      }
    })
  }, [wordList, mechanicId])

  // Handle game completion
  const handleGameComplete = useCallback(
    (result: GameResult) => {
      // Process with adaptive learning systems
      processGameCompletion(result)

      // Update local state and determine if we should continue
      let shouldContinue = false
      setState(prev => {
        const newSessionPerformance = new Map(prev.sessionPerformance)
        const wordResults = newSessionPerformance.get(result.word) || []
        newSessionPerformance.set(result.word, [...wordResults, result])

        const nextRound = prev.roundsCompleted + 1
        const finished = nextRound >= MAX_ROUNDS
        shouldContinue = !finished

        return {
          ...prev,
          results: [...prev.results, result],
          roundsCompleted: nextRound,
          sessionPerformance: newSessionPerformance,
          gameFinished: finished,
        }
      })

      // Start next round after delay if not finished
      if (shouldContinue) {
        setTimeout(() => {
          startNextRound()
        }, 2000)
      }
    },
    [startNextRound]
  )

  // Initialize first round when word pool is ready
  useEffect(() => {
    if (wordList && state.wordPool.length > 0 && !initializedRef.current) {
      initializedRef.current = true
      startNextRound()
    }
  }, [wordList, state.wordPool.length, startNextRound])

  // Reset initialization when word list changes
  useEffect(() => {
    initializedRef.current = false
  }, [wordList])

  return {
    ...state,
    maxRounds: MAX_ROUNDS,
    startNextRound,
    handleGameComplete,
  }
}
