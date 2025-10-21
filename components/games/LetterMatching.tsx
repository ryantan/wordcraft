'use client'

import { type FC, useState, useEffect, useCallback } from 'react'
import type { GameMechanicProps } from '@/types'
import { Button } from '@/components/ui/button'

interface LetterPair {
  index: number
  lowercase: string
  uppercase: string
  matched: boolean
}

/**
 * Letter Matching Game
 * Player matches lowercase letters to their uppercase counterparts
 */
export const LetterMatching: FC<GameMechanicProps> = ({
  word,
  onComplete,
  onHintRequest,
  difficulty = 'medium',
}) => {
  const [pairs, setPairs] = useState<LetterPair[]>([])
  const [uppercaseOptions, setUppercaseOptions] = useState<string[]>([])
  const [selectedLowercase, setSelectedLowercase] = useState<number>(-1)
  const [mistakes, setMistakes] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)

  // Initialize the game
  useEffect(() => {
    const letters = word.toLowerCase().split('')

    // Create pairs for ALL letters (including duplicates), excluding spaces
    const newPairs: LetterPair[] = letters
      .map((letter, index) => ({
        index,
        lowercase: letter,
        uppercase: letter.toUpperCase(),
        matched: letter === ' ', // Auto-match spaces
      }))
      .filter(pair => pair.lowercase !== ' ') // Remove space pairs from display

    setPairs(newPairs)

    // Create uppercase options (one for each letter in the word, excluding spaces)
    const correctUppercase = letters.filter(l => l !== ' ').map(l => l.toUpperCase())

    // Add distractors based on difficulty
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const uniqueCorrect = Array.from(new Set(correctUppercase))

    // Difficulty affects number of distractor letters
    const baseDistractorCount = difficulty === 'easy' ? 1 : difficulty === 'hard' ? 5 : 3
    const distractorCount = Math.min(baseDistractorCount, Math.max(0, 8 - correctUppercase.length))
    const distractors: string[] = []

    while (distractors.length < distractorCount) {
      const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)]
      if (!uniqueCorrect.includes(randomLetter) && !distractors.includes(randomLetter)) {
        distractors.push(randomLetter)
      }
    }

    const allOptions = [...correctUppercase, ...distractors].sort(() => Math.random() - 0.5)
    setUppercaseOptions(allOptions)
  }, [word, difficulty])

  const handleLowercaseClick = useCallback((index: number) => {
    if (pairs[index].matched) return
    setSelectedLowercase(index)
  }, [pairs])

  const handleUppercaseClick = useCallback(
    (uppercase: string) => {
      if (selectedLowercase === -1) return

      const pair = pairs[selectedLowercase]
      const correct = uppercase === pair.uppercase

      if (correct) {
        // Mark as matched
        const newPairs = [...pairs]
        newPairs[selectedLowercase].matched = true
        setPairs(newPairs)

        // Remove only the first occurrence of this letter from options
        setUppercaseOptions(prev => {
          const index = prev.indexOf(uppercase)
          if (index > -1) {
            return [...prev.slice(0, index), ...prev.slice(index + 1)]
          }
          return prev
        })

        // Check if all matched
        if (newPairs.every(p => p.matched)) {
          const timeMs = Date.now() - startTime
          // Attempts = 1 if no mistakes, otherwise mistakes + 1
          const finalAttempts = mistakes === 0 ? 1 : mistakes + 1

          setSelectedLowercase(-1)
          setFeedback('correct')

          setTimeout(() => {
            onComplete({
              word,
              correct: true,
              attempts: finalAttempts,
              timeMs,
              hintsUsed,
              mechanicId: 'letter-matching',
              completedAt: new Date(),
            })
          }, 800)
        } else {
          // Auto-select next unmatched letter for continuous flow
          const nextUnmatched = newPairs.findIndex((p, _i) => !p.matched)
          setSelectedLowercase(nextUnmatched)
        }
      } else {
        // Increment mistakes counter for incorrect matches
        setMistakes(prev => prev + 1)
        setFeedback('incorrect')

        setTimeout(() => {
          setFeedback(null)
          setSelectedLowercase(-1)
        }, 1200)
      }
    },
    [selectedLowercase, pairs, mistakes, hintsUsed, startTime, word, onComplete]
  )

  const handleHint = useCallback(() => {
    if (!onHintRequest) return

    setHintsUsed(prev => prev + 1)
    onHintRequest()

    // Find first unmatched pair and highlight it briefly
    const unmatchedIndex = pairs.findIndex(p => !p.matched)
    if (unmatchedIndex !== -1) {
      setSelectedLowercase(unmatchedIndex)

      // After 2 seconds, auto-select the correct answer
      setTimeout(() => {
        const correctUppercase = pairs[unmatchedIndex].uppercase
        handleUppercaseClick(correctUppercase)
      }, 2000)
    }
  }, [pairs, onHintRequest, handleUppercaseClick])

  const allMatched = pairs.every(p => p.matched)
  const progress = pairs.filter(p => p.matched).length

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-3xl w-full space-y-8">
        {/* Instructions */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Match the Letters</h2>
          <p className="text-gray-600">
            Click a lowercase letter, then click its matching uppercase letter
          </p>
        </div>

        {/* Progress */}
        <div className="text-center">
          <div className="inline-block bg-primary-50 border-2 border-primary-200 rounded-lg px-6 py-3">
            <p className="text-lg font-semibold text-primary-700">
              Matched: {progress} / {pairs.length}
            </p>
          </div>
        </div>

        {/* Lowercase Letters */}
        <div className="bg-white rounded-xl p-6 border-2 border-primary-300">
          <p className="text-sm font-semibold text-gray-700 mb-4 text-center">
            Lowercase Letters:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {pairs.map((pair, index) => (
              <button
                key={`lower-${index}`}
                onClick={() => handleLowercaseClick(index)}
                disabled={pair.matched || feedback === 'incorrect'}
                className={`w-16 h-16 text-3xl font-bold rounded-lg transition-all ${
                  pair.matched
                    ? 'bg-success-100 border-2 border-success-500 text-success-700 opacity-50'
                    : selectedLowercase === index
                    ? 'bg-primary-200 border-4 border-primary-600 text-primary-900 scale-110 shadow-lg'
                    : 'bg-primary-50 border-2 border-primary-300 text-primary-700 hover:bg-primary-100 hover:border-primary-500 active:scale-95'
                }`}
              >
                {pair.lowercase}
              </button>
            ))}
          </div>
        </div>

        {/* Uppercase Letters */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-4 text-center">
            Uppercase Letters:
          </p>
          <div className="flex flex-wrap gap-3 justify-center min-h-[80px]">
            {uppercaseOptions.map((letter, index) => (
              <button
                key={`upper-${index}`}
                onClick={() => handleUppercaseClick(letter)}
                disabled={selectedLowercase === -1 || feedback === 'incorrect'}
                className="w-16 h-16 text-3xl font-bold rounded-lg bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-500 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`p-4 rounded-lg text-center font-semibold animate-fade-in ${
              feedback === 'correct'
                ? 'bg-success-100 border-2 border-success-500 text-success-800'
                : 'bg-error-100 border-2 border-error-500 text-error-800'
            }`}
          >
            {feedback === 'correct' ? '✓ Great match!' : '✗ Try again!'}
          </div>
        )}

        {allMatched && (
          <div className="p-4 rounded-lg text-center font-semibold bg-success-100 border-2 border-success-500 text-success-800 animate-success-pulse">
            🎉 Perfect! All letters matched!
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {onHintRequest && (
            <Button
              variant="outline"
              onClick={handleHint}
              disabled={allMatched || feedback !== null}
            >
              💡 Hint ({hintsUsed})
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6 justify-center text-sm text-gray-600">
          <div>
            <span className="font-semibold">Mistakes:</span> {mistakes}
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
