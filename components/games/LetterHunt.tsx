'use client'

import { type FC, useState, useEffect, useCallback, useMemo } from 'react'
import type { GameMechanicProps } from '@/types'
import { Button } from '@/components/ui/button'

interface LetterPosition {
  letter: string
  x: number
  y: number
  found: boolean
  index: number
  uniqueId: number // Unique identifier for each letter instance
}

/**
 * Letter Hunt Game
 * Player finds and collects letters in sequence within an interactive scene
 */
export const LetterHunt: FC<GameMechanicProps> = ({
  word,
  onComplete,
  onHintRequest,
  difficulty = 'medium',
}) => {
  const [letterPositions, setLetterPositions] = useState<LetterPosition[]>([])
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [wrongLetter, setWrongLetter] = useState<number | null>(null)

  // Get letter opacity based on difficulty
  const getLetterOpacity = useCallback(() => {
    if (difficulty === 'easy') return 1.0
    if (difficulty === 'hard') return 0.6
    return 0.85 // medium
  }, [difficulty])

  // Initialize letter positions
  useEffect(() => {
    const letters = word.replace(/\s/g, '').split('') // Remove spaces

    // Generate random positions for letters
    const positions: LetterPosition[] = letters.map((letter, index) => {
      // Spread letters across the scene
      // Use a grid-like distribution to avoid overlap
      const cols = Math.ceil(Math.sqrt(letters.length))
      const row = Math.floor(index / cols)
      const col = index % cols

      // Add randomness within each grid cell
      const baseX = (col * 100 / cols) + 10
      const baseY = (row * 100 / cols) + 10

      return {
        letter,
        x: baseX + (Math.random() * 15 - 7.5),
        y: baseY + (Math.random() * 15 - 7.5),
        found: false,
        index,
        uniqueId: index, // Each position gets a unique ID
      }
    })

    setLetterPositions(positions)
    setCurrentLetterIndex(0)
  }, [word])

  const handleLetterClick = useCallback(
    (clickedIndex: number) => {
      const clickedLetter = letterPositions[clickedIndex]

      if (clickedLetter.found) return // Already found

      // Get the current letter we're looking for
      const targetLetter = word.replace(/\s/g, '').charAt(currentLetterIndex)
      
      if (clickedLetter.letter === targetLetter) {
        // Correct letter! (any instance of the target letter is acceptable)
        const newPositions = [...letterPositions]
        newPositions[clickedIndex].found = true
        setLetterPositions(newPositions)
        setCurrentLetterIndex(prev => prev + 1)
        setShowFeedback('correct')

        setTimeout(() => setShowFeedback(null), 500)

        // Check if all letters found
        if (currentLetterIndex === letterPositions.length - 1) {
          const timeMs = Date.now() - startTime

          setTimeout(() => {
            onComplete({
              word,
              correct: true,
              attempts: attempts + 1,
              timeMs,
              hintsUsed,
              mechanicId: 'letter-hunt',
              completedAt: new Date(),
            })
          }, 800)
        }
      } else {
        // Wrong letter
        setAttempts(prev => prev + 1)
        setWrongLetter(clickedIndex)
        setShowFeedback('wrong')

        setTimeout(() => {
          setWrongLetter(null)
          setShowFeedback(null)
        }, 1000)
      }
    },
    [letterPositions, currentLetterIndex, attempts, hintsUsed, startTime, word, onComplete]
  )

  const handleHint = useCallback(() => {
    if (!onHintRequest) return

    setHintsUsed(prev => prev + 1)
    onHintRequest()

    // The hint system will highlight all instances of the target letter via CSS
  }, [onHintRequest])

  // Progress display
  const progressWord = useMemo(() => {
    return letterPositions
      .sort((a, b) => a.index - b.index)
      .map(lp => (lp.found ? lp.letter : '_'))
      .join('')
  }, [letterPositions])

  const letterOpacity = getLetterOpacity()

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-4xl w-full space-y-6">
        {/* Instructions */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Find the Letters!</h2>
          <p className="text-gray-600">
            Click the letters in order to spell the word
          </p>
        </div>

        {/* Progress Display */}
        <div className="text-center">
          <div className="inline-block bg-primary-50 border-2 border-primary-200 rounded-lg px-6 py-3">
            <p className="text-3xl font-bold text-primary-700 tracking-widest font-mono">
              {progressWord}
            </p>
          </div>
        </div>

        {/* Game Scene */}
        <div className="relative bg-gradient-to-b from-sky-200 to-green-100 rounded-xl border-4 border-primary-300 aspect-video overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0">
            {/* Sun */}
            <div className="absolute top-4 right-8 w-16 h-16 bg-yellow-300 rounded-full opacity-80" />

            {/* Clouds */}
            <div className="absolute top-8 left-12 w-24 h-12 bg-white rounded-full opacity-60" />
            <div className="absolute top-12 left-16 w-20 h-10 bg-white rounded-full opacity-60" />
            <div className="absolute top-6 right-32 w-28 h-14 bg-white rounded-full opacity-60" />
            <div className="absolute top-10 right-36 w-24 h-12 bg-white rounded-full opacity-60" />

            {/* Ground elements */}
            <div className="absolute bottom-8 left-16 w-24 h-32 bg-green-600 rounded-t-full opacity-40" />
            <div className="absolute bottom-8 right-24 w-20 h-28 bg-green-700 rounded-t-full opacity-40" />
            <div className="absolute bottom-12 left-1/3 w-16 h-20 bg-green-500 rounded-t-full opacity-40" />
          </div>

          {/* Letter positions */}
          {letterPositions.map((lp, index) => {
            const targetLetter = word.replace(/\s/g, '').charAt(currentLetterIndex)
            const isTargetLetter = lp.letter === targetLetter && !lp.found
            const isWrong = wrongLetter === index
            const shouldPulse = isTargetLetter && hintsUsed > 0

            return (
              <button
                key={lp.uniqueId}
                onClick={() => handleLetterClick(index)}
                disabled={lp.found || showFeedback !== null}
                className={`absolute w-16 h-16 text-3xl font-bold rounded-full transition-all transform
                  ${lp.found
                    ? 'bg-success-200 border-2 border-success-400 text-success-700 opacity-50 scale-75'
                    : isWrong
                    ? 'bg-error-200 border-4 border-error-500 text-error-800 scale-90 animate-shake'
                    : isTargetLetter
                    ? 'bg-primary-200 border-4 border-primary-600 text-primary-900 scale-110 shadow-lg hover:scale-125'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:scale-110 hover:border-primary-400'
                  }
                  ${shouldPulse ? 'animate-pulse' : ''}
                  disabled:cursor-not-allowed
                `}
                style={{
                  left: `${lp.x}%`,
                  top: `${lp.y}%`,
                  opacity: lp.found ? 0.5 : letterOpacity,
                }}
              >
                {lp.letter.toUpperCase()}
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div
            className={`p-4 rounded-lg text-center font-semibold animate-fade-in ${
              showFeedback === 'correct'
                ? 'bg-success-100 border-2 border-success-500 text-success-800'
                : 'bg-error-100 border-2 border-error-500 text-error-800'
            }`}
          >
            {showFeedback === 'correct' ? '✓ Great find!' : '✗ Look for the next letter in the word!'}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {onHintRequest && (
            <Button
              variant="outline"
              onClick={handleHint}
              disabled={currentLetterIndex >= letterPositions.length || showFeedback !== null}
            >
              💡 Hint ({hintsUsed})
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6 justify-center text-sm text-gray-600">
          <div>
            <span className="font-semibold">Found:</span> {currentLetterIndex} / {letterPositions.length}
          </div>
          <div>
            <span className="font-semibold">Wrong clicks:</span> {attempts}
          </div>
          {onHintRequest && (
            <div>
              <span className="font-semibold">Hints:</span> {hintsUsed}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
