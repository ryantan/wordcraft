/**
 * Game Renderer
 *
 * Dynamically renders game components based on beat type
 */

'use client'

import { useState } from 'react'
import type { GameBeat } from '@/types/story'
import type { GameResult } from '@/types'
import { LetterMatching } from '@/components/games/LetterMatching'
import { WordScramble } from '@/components/games/WordScramble'
import { SpellingChallenge } from '@/components/games/SpellingChallenge'
import { WordBuildingBlocks } from '@/components/games/WordBuildingBlocks'
import { MissingLetters } from '@/components/games/MissingLetters'

interface GameRendererProps {
  beat: GameBeat
  onComplete: (result: {
    isCorrect: boolean
    timeSpent: number
    hintsUsed: number
    errors: number
  }) => void
}

export function GameRenderer({ beat, onComplete }: GameRendererProps) {
  const { word, gameType, narrative } = beat
  const [startTime] = useState(Date.now())
  const [hintsUsed, setHintsUsed] = useState(0)

  const handleGameComplete = (result: GameResult) => {
    const timeSpent = Date.now() - startTime
    const errors = Math.max(0, result.attempts - 1) // Attempts minus first try

    onComplete({
      isCorrect: result.correct,
      timeSpent,
      hintsUsed,
      errors,
    })
  }

  const handleHintRequest = () => {
    setHintsUsed((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-indigo-200 p-4">
      {/* Narrative banner */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-lg text-center text-gray-700 font-medium">
            {narrative}
          </p>
        </div>
      </div>

      {/* Game component */}
      <div className="max-w-4xl mx-auto">
        {gameType === 'letterMatching' && (
          <LetterMatching
            word={word}
            onComplete={handleGameComplete}
            onHintRequest={handleHintRequest}
          />
        )}

        {gameType === 'wordScramble' && (
          <WordScramble
            word={word}
            onComplete={handleGameComplete}
            onHintRequest={handleHintRequest}
          />
        )}

        {gameType === 'spellingChallenge' && (
          <SpellingChallenge
            word={word}
            onComplete={handleGameComplete}
            onHintRequest={handleHintRequest}
          />
        )}

        {gameType === 'wordBuilding' && (
          <WordBuildingBlocks
            word={word}
            onComplete={handleGameComplete}
            onHintRequest={handleHintRequest}
          />
        )}

        {gameType === 'missingLetters' && (
          <MissingLetters
            word={word}
            onComplete={handleGameComplete}
            onHintRequest={handleHintRequest}
          />
        )}
      </div>
    </div>
  )
}
