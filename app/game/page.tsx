'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getWordList } from '@/lib/storage/localStorage'
import { getGame, getGameIds } from '@/lib/games'
import type { WordList, GameResult, GameMechanicId } from '@/types'
import { Button } from '@/components/ui/button'
import {
  saveGameResult,
  getAllGameResults,
  getAllReviewData,
  saveWordReviewData,
  getLearningProfile,
  saveLearningProfile,
} from '@/lib/storage/sessionStorage'
import { calculateAllConfidences } from '@/lib/algorithms/confidence-scoring'
import {
  selectWordsForSession,
  initializeWordReview,
  updateWordReview,
} from '@/lib/algorithms/spaced-repetition'
import { detectLearningStyle, selectNextGame } from '@/lib/algorithms/learning-style-detection'

function GameContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listId = searchParams.get('listId')
  const mechanicId = searchParams.get('mechanicId') as GameMechanicId | null

  const [wordList, setWordList] = useState<WordList | null>(null)
  const [sessionWords, setSessionWords] = useState<string[]>([]) // Adaptive word selection
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentWord, setCurrentWord] = useState<string | null>(null)
  const [currentMechanicId, setCurrentMechanicId] = useState<GameMechanicId | null>(null)
  const [recentGames, setRecentGames] = useState<GameMechanicId[]>([]) // For variety
  const [results, setResults] = useState<GameResult[]>([])
  const [wordsCompleted, setWordsCompleted] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [gameFinished, setGameFinished] = useState(false)
  const [roundKey, setRoundKey] = useState(0)

  // Load word list and initialize adaptive session
  useEffect(() => {
    if (!listId) {
      router.push('/word-lists')
      return
    }

    const list = getWordList(listId)
    if (!list) {
      router.push('/word-lists')
      return
    }

    setWordList(list)

    // Initialize adaptive learning data
    const allResults = getAllGameResults()
    let allReviewData = getAllReviewData()

    // Initialize review data for any new words
    list.words.forEach(word => {
      if (!allReviewData.has(word)) {
        const reviewData = initializeWordReview(word)
        saveWordReviewData(reviewData)
        allReviewData.set(word, reviewData)
      }
    })

    // Calculate confidence scores for words in this list
    const confidences = calculateAllConfidences(list.words, allResults)

    // Select words for this session using adaptive algorithm
    const selectedWords = selectWordsForSession(
      list.words,
      allReviewData,
      confidences,
      5 // Session size
    )
    setSessionWords(selectedWords)
    setCurrentWordIndex(0)

    setIsLoading(false)
  }, [listId, router])

  // Start next round with adaptive selection
  const startNextRound = useCallback(() => {
    if (!wordList || sessionWords.length === 0) return

    // Get next word from adaptive session selection
    const nextWord = sessionWords[currentWordIndex]

    // Select game mechanic adaptively (or use specified one)
    let mechanic: GameMechanicId
    if (mechanicId && getGame(mechanicId)) {
      mechanic = mechanicId
    } else {
      // Use learning style detection to pick the best game
      const allResults = getAllGameResults()
      const profile = getLearningProfile()

      // If we have enough data, use adaptive selection
      if (allResults.length >= 12) {
        mechanic = selectNextGame(
          profile || detectLearningStyle(allResults),
          recentGames
        )
      } else {
        // Fall back to random for first few games
        const availableIds = getGameIds()
        mechanic = availableIds[Math.floor(Math.random() * availableIds.length)]
      }
    }

    // Track recent games for variety
    setRecentGames(prev => [...prev.slice(-2), mechanic])

    // Update state - increment roundKey to force component remount
    setCurrentWord(nextWord)
    setCurrentMechanicId(mechanic)
    setRoundKey(prev => prev + 1)
  }, [wordList, sessionWords, currentWordIndex, mechanicId, recentGames])

  // Initialize first round when session words are ready
  useEffect(() => {
    if (wordList && sessionWords.length > 0 && !currentWord) {
      startNextRound()
    }
  }, [wordList, sessionWords, currentWord, startNextRound])

  const handleGameComplete = useCallback(
    (result: GameResult) => {
      // Save result to storage
      saveGameResult(result)

      // Update local state
      setResults(prev => [...prev, result])
      setWordsCompleted(prev => prev + 1)

      // Update spaced repetition review data
      const allResults = getAllGameResults()
      const confidences = calculateAllConfidences([result.word], allResults)
      const confidence = confidences.get(result.word)

      if (confidence) {
        const allReviewData = getAllReviewData()
        const existingReview = allReviewData.get(result.word)

        if (existingReview) {
          const updatedReview = updateWordReview(existingReview, confidence)
          saveWordReviewData(updatedReview)
        }
      }

      // Update learning style profile
      const profile = detectLearningStyle(allResults)
      saveLearningProfile(profile)

      // Move to next word
      const nextIndex = currentWordIndex + 1

      // Check if we should continue or finish
      if (nextIndex >= sessionWords.length) {
        setGameFinished(true)
      } else {
        setCurrentWordIndex(nextIndex)
        // Short delay before next round
        setTimeout(() => {
          startNextRound()
        }, 2000)
      }
    },
    [currentWordIndex, sessionWords, startNextRound]
  )

  const handleHintRequest = useCallback(() => {
    // Hints are handled within each game mechanic
    // This callback is just for tracking/analytics
  }, [])

  if (isLoading) {
    return (
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading game...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!wordList) {
    return (
      <main className="container mx-auto p-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Word List Not Found</h1>
          <p className="text-gray-600 mb-6">The word list you selected doesn&apos;t exist.</p>
          <Link href="/word-lists">
            <Button>Back to Word Lists</Button>
          </Link>
        </div>
      </main>
    )
  }

  if (gameFinished) {
    const totalAttempts = results.reduce((sum, r) => sum + r.attempts, 0)
    const totalTime = results.reduce((sum, r) => sum + r.timeMs, 0)
    const totalHints = results.reduce((sum, r) => sum + r.hintsUsed, 0)
    const avgTime = Math.round(totalTime / results.length / 1000)

    return (
      <main className="container mx-auto p-8 max-w-3xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-primary-600">🎉 Great Job!</h1>
            <p className="text-xl text-gray-700">You completed the game session!</p>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl border-2 border-primary-300 p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Session Summary
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600">{results.length}</div>
                <div className="text-sm text-gray-600 mt-1">Words</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600">{totalAttempts}</div>
                <div className="text-sm text-gray-600 mt-1">Attempts</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600">{avgTime}s</div>
                <div className="text-sm text-gray-600 mt-1">Avg Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600">{totalHints}</div>
                <div className="text-sm text-gray-600 mt-1">Hints</div>
              </div>
            </div>

            {/* Results List */}
            <div className="mt-8 space-y-3">
              <h3 className="font-semibold text-gray-900">Words Practiced:</h3>
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-success-50 border border-success-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <div className="font-semibold text-gray-900">{result.word}</div>
                      <div className="text-sm text-gray-600">
                        {result.mechanicId.replace(/-/g, ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>{result.attempts} {result.attempts === 1 ? 'attempt' : 'attempts'}</div>
                    <div>{Math.round(result.timeMs / 1000)}s</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Link href={`/game?listId=${listId}${mechanicId ? `&mechanicId=${mechanicId}` : ''}`}>
              <Button size="lg">Play Again</Button>
            </Link>
            <Link href="/word-lists">
              <Button variant="outline" size="lg">
                Back to Word Lists
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!currentWord || !currentMechanicId) {
    return (
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Preparing game...</p>
          </div>
        </div>
      </main>
    )
  }

  const gameMechanic = getGame(currentMechanicId)
  if (!gameMechanic) {
    return (
      <main className="container mx-auto p-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Game Not Found</h1>
          <p className="text-gray-600 mb-6">The requested game mechanic is not available.</p>
          <Link href="/word-lists">
            <Button>Back to Word Lists</Button>
          </Link>
        </div>
      </main>
    )
  }

  const GameComponent = gameMechanic.Component

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Progress Header */}
      <div className="bg-white border-b-2 border-primary-200 px-6 py-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{wordList.name}</h1>
              <p className="text-sm text-gray-600">{gameMechanic.meta.name}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{wordsCompleted}/5</div>
                <div className="text-xs text-gray-600">Words</div>
              </div>
              <Link href="/word-lists">
                <Button variant="outline" size="sm">
                  Exit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <GameComponent
        key={roundKey}
        word={currentWord}
        onComplete={handleGameComplete}
        onHintRequest={handleHintRequest}
      />
    </main>
  )
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Loading game...</p>
            </div>
          </div>
        </main>
      }
    >
      <GameContent />
    </Suspense>
  )
}
