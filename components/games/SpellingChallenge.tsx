'use client'

import { type FC, useState, useCallback, useRef, useEffect } from 'react'
import type { GameMechanicProps } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/**
 * Spelling Challenge Game
 * Player types the correct spelling of the word
 */
export const SpellingChallenge: FC<GameMechanicProps> = ({
  word,
  onComplete,
  onHintRequest,
  difficulty = 'medium',
}) => {
  const [userInput, setUserInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [showWord, setShowWord] = useState(true)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [revealedLetters, setRevealedLetters] = useState<Set<number>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  // Hide the word based on difficulty
  useEffect(() => {
    // Difficulty affects how long the word is shown
    const displayTime = difficulty === 'easy' ? 5000 : difficulty === 'hard' ? 2000 : 3000

    const timer = setTimeout(() => {
      setShowWord(false)
      // Focus input after word is hidden
      inputRef.current?.focus()
    }, displayTime)

    return () => clearTimeout(timer)
  }, [difficulty])

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()

      const answer = userInput.trim().toLowerCase()
      const correct = answer === word.toLowerCase()

      setAttempts(prev => prev + 1)
      setIsCorrect(correct)
      setShowFeedback(true)

      if (correct) {
        const timeMs = Date.now() - startTime

        setTimeout(() => {
          onComplete({
            word,
            correct: true,
            attempts: attempts + 1,
            timeMs,
            hintsUsed,
            mechanicId: 'spelling-challenge',
            completedAt: new Date(),
          })
        }, 1500)
      } else {
        setTimeout(() => {
          setShowFeedback(false)
          setUserInput('')
          inputRef.current?.focus()
        }, 2000)
      }
    },
    [userInput, word, attempts, hintsUsed, startTime, onComplete]
  )

  const handleHint = useCallback(() => {
    if (!onHintRequest) return

    setHintsUsed(prev => prev + 1)
    onHintRequest()

    // Reveal the next unrevealed letter
    const nextUnrevealedIndex = Array.from(word).findIndex(
      (_, i) => !revealedLetters.has(i)
    )

    if (nextUnrevealedIndex !== -1) {
      setRevealedLetters(prev => new Set([...prev, nextUnrevealedIndex]))

      // Update input to include revealed letters so far
      const newInput = Array.from(word)
        .map((letter, i) => {
          if (revealedLetters.has(i) || i === nextUnrevealedIndex) {
            return letter
          }
          return userInput[i] || ''
        })
        .join('')

      setUserInput(newInput)
      inputRef.current?.focus()
    }
  }, [word, revealedLetters, userInput, onHintRequest])

  const handleShowWord = useCallback(() => {
    setShowWord(true)
    setTimeout(() => {
      setShowWord(false)
      inputRef.current?.focus()
    }, 2000)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Instructions */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Spelling Challenge</h2>
          <p className="text-gray-600">
            {showWord
              ? 'Memorize the word below...'
              : 'Type the correct spelling of the word'}
          </p>
        </div>

        {/* Word Display */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-12 border-2 border-primary-300 min-h-[180px] flex items-center justify-center">
          {showWord ? (
            <div className="text-center space-y-4">
              <p className="text-6xl font-bold text-primary-700 tracking-wide animate-fade-in">
                {word.toUpperCase()}
              </p>
              <p className="text-sm text-primary-600 font-semibold animate-pulse">
                Study the word...
              </p>
            </div>
          ) : (
            <div className="text-center space-y-6 w-full">
              <div className="text-5xl font-bold text-gray-300">? ? ?</div>
              <p className="text-sm text-gray-500">
                The word is hidden. Type your answer below.
              </p>
            </div>
          )}
        </div>

        {/* Input Section */}
        {!showWord && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                disabled={showFeedback}
                placeholder="Type the word here..."
                className="text-2xl text-center font-semibold h-16 tracking-wide"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              {revealedLetters.size > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2">
                  <div className="flex justify-center gap-1">
                    {Array.from(word).map((letter, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded ${
                          revealedLetters.has(i)
                            ? 'bg-warning-100 text-warning-800 border-2 border-warning-400'
                            : 'bg-transparent'
                        }`}
                      >
                        {revealedLetters.has(i) ? letter.toUpperCase() : ''}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-center text-warning-700 mt-2">
                    💡 Hint: These letters are revealed
                  </p>
                </div>
              )}
            </div>
          </form>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div
            className={`p-4 rounded-lg text-center font-semibold animate-fade-in ${
              isCorrect
                ? 'bg-success-100 border-2 border-success-500 text-success-800'
                : 'bg-error-100 border-2 border-error-500 text-error-800'
            }`}
          >
            {isCorrect
              ? '🎉 Perfect spelling! Well done!'
              : `❌ Not quite. You wrote: "${userInput}". Try again!`}
          </div>
        )}

        {/* Actions */}
        {!showWord && (
          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              variant="outline"
              onClick={handleShowWord}
              disabled={showFeedback}
              size="sm"
            >
              👁️ Show Word Again
            </Button>
            {onHintRequest && (
              <Button
                variant="outline"
                onClick={handleHint}
                disabled={revealedLetters.size >= word.length || showFeedback}
                size="sm"
              >
                💡 Reveal Letter ({hintsUsed})
              </Button>
            )}
            <Button
              onClick={() => handleSubmit()}
              disabled={userInput.trim().length === 0 || showFeedback}
              size="lg"
            >
              Check Spelling
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-6 justify-center text-sm text-gray-600">
          <div>
            <span className="font-semibold">Attempts:</span> {attempts}
          </div>
          {onHintRequest && (
            <div>
              <span className="font-semibold">Hints Used:</span> {hintsUsed}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
