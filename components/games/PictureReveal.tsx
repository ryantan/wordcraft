'use client'

import { type FC, useState, useCallback, useMemo } from 'react'
import type { GameMechanicProps } from '@/types'
import { Button } from '@/components/ui/button'

/**
 * Picture Reveal Game
 * Player reveals a hidden picture by spelling letters correctly
 */
export const PictureReveal: FC<GameMechanicProps> = ({
  word,
  onComplete,
  onHintRequest,
  difficulty = 'medium',
}) => {
  const [userInput, setUserInput] = useState<string[]>([])
  const [correctLetters, setCorrectLetters] = useState<Set<string>>(new Set())
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  // Clean word (remove spaces, lowercase)
  const cleanWord = useMemo(() => word.replace(/\s/g, '').toLowerCase(), [word])

  // Get unique letters needed
  const uniqueLetters = useMemo(() => Array.from(new Set(cleanWord.split(''))), [cleanWord])

  // Calculate reveal percentage based on correct letters
  const revealPercentage = useMemo(() => {
    return Math.floor((correctLetters.size / uniqueLetters.length) * 100)
  }, [correctLetters.size, uniqueLetters.length])

  // Get blur level based on difficulty and progress
  const getBlurAmount = useCallback(() => {
    const baseBlur = difficulty === 'easy' ? 15 : difficulty === 'hard' ? 30 : 20
    const progressBlur = baseBlur * (1 - correctLetters.size / uniqueLetters.length)
    return Math.max(0, Math.floor(progressBlur))
  }, [difficulty, correctLetters.size, uniqueLetters.length])

  // Simple emoji/icon representation based on first letter
  const getPictureEmoji = useCallback((word: string): string => {
    const firstLetter = word.toLowerCase()[0]
    const emojiMap: Record<string, string> = {
      'a': '🍎', 'b': '🏀', 'c': '🐱', 'd': '🐕', 'e': '🐘',
      'f': '🌸', 'g': '🎸', 'h': '🏠', 'i': '🍦', 'j': '🕹️',
      'k': '🔑', 'l': '🦁', 'm': '🌙', 'n': '🎵', 'o': '🐙',
      'p': '🍕', 'q': '👑', 'r': '🚀', 's': '⭐', 't': '🌳',
      'u': '☂️', 'v': '🎻', 'w': '🌊', 'x': '❌', 'y': '💛',
      'z': '⚡',
    }
    return emojiMap[firstLetter] || '🎨'
  }, [])

  const pictureEmoji = useMemo(() => getPictureEmoji(word), [word, getPictureEmoji])

  // Available letters (alphabet)
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')

  const handleLetterClick = useCallback(
    (letter: string) => {
      if (userInput.includes(letter) || isComplete) return

      setUserInput(prev => [...prev, letter])

      if (uniqueLetters.includes(letter)) {
        // Correct letter!
        setCorrectLetters(prev => new Set([...prev, letter]))
        setShowFeedback('correct')

        setTimeout(() => setShowFeedback(null), 500)

        // Check if word is complete
        if (correctLetters.size + 1 === uniqueLetters.length) {
          setIsComplete(true)
          const timeMs = Date.now() - startTime

          setTimeout(() => {
            onComplete({
              word,
              correct: true,
              attempts: attempts + 1,
              timeMs,
              hintsUsed,
              mechanicId: 'picture-reveal',
              completedAt: new Date(),
            })
          }, 1500)
        }
      } else {
        // Incorrect letter
        setAttempts(prev => prev + 1)
        setShowFeedback('incorrect')

        setTimeout(() => setShowFeedback(null), 1200)
      }
    },
    [userInput, isComplete, uniqueLetters, correctLetters.size, attempts, hintsUsed, startTime, word, onComplete]
  )

  const handleHint = useCallback(() => {
    if (!onHintRequest) return

    setHintsUsed(prev => prev + 1)
    onHintRequest()

    // Find first correct letter not yet clicked
    const nextLetter = uniqueLetters.find(l => !correctLetters.has(l))
    if (nextLetter && !userInput.includes(nextLetter)) {
      setTimeout(() => handleLetterClick(nextLetter), 500)
    }
  }, [uniqueLetters, correctLetters, userInput, onHintRequest, handleLetterClick])

  const blurAmount = getBlurAmount()

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-3xl w-full space-y-8">
        {/* Instructions */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Reveal the Picture</h2>
          <p className="text-gray-600">
            Click letters that spell &quot;{word}&quot; to uncover the hidden picture
          </p>
        </div>

        {/* Picture Area */}
        <div className="bg-white rounded-xl border-4 border-primary-300 p-8">
          <div className="relative aspect-square max-w-sm mx-auto bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg overflow-hidden flex items-center justify-center">
            {/* Progress overlay (pixelated effect) */}
            <div
              className={`absolute inset-0 bg-gray-400 transition-opacity duration-500`}
              style={{
                opacity: (100 - revealPercentage) / 100,
                backgroundImage: `repeating-linear-gradient(
                  0deg,
                  rgba(0, 0, 0, 0.1),
                  rgba(0, 0, 0, 0.1) ${blurAmount}px,
                  transparent ${blurAmount}px,
                  transparent ${blurAmount * 2}px
                ),
                repeating-linear-gradient(
                  90deg,
                  rgba(0, 0, 0, 0.1),
                  rgba(0, 0, 0, 0.1) ${blurAmount}px,
                  transparent ${blurAmount}px,
                  transparent ${blurAmount * 2}px
                )`,
              }}
            />

            {/* Picture (emoji) */}
            <div
              className="text-9xl transition-all duration-500"
              style={{
                filter: `blur(${blurAmount}px)`,
                opacity: 0.3 + (revealPercentage / 100) * 0.7,
              }}
            >
              {pictureEmoji}
            </div>

            {/* Reveal percentage */}
            <div className="absolute bottom-4 right-4 bg-white/80 px-3 py-1 rounded-full text-sm font-semibold text-primary-700">
              {revealPercentage}% revealed
            </div>
          </div>
        </div>

        {/* Keyboard */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-4 text-center">
            Choose letters:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {alphabet.map(letter => {
              const isUsed = userInput.includes(letter)
              const isCorrect = correctLetters.has(letter)

              return (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  disabled={isUsed || isComplete || showFeedback !== null}
                  className={`w-12 h-12 text-xl font-bold rounded-lg transition-all ${
                    isCorrect
                      ? 'bg-success-200 border-2 border-success-500 text-success-800'
                      : isUsed
                      ? 'bg-gray-200 border-2 border-gray-300 text-gray-400 opacity-50'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-primary-50 hover:border-primary-400 active:scale-95'
                  } disabled:cursor-not-allowed`}
                >
                  {letter.toUpperCase()}
                </button>
              )
            })}
          </div>
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
            {showFeedback === 'correct'
              ? '✓ Great! The picture is getting clearer!'
              : '✗ That letter is not in the word. Try another!'}
          </div>
        )}

        {isComplete && (
          <div className="p-4 rounded-lg text-center font-semibold bg-success-100 border-2 border-success-500 text-success-800 animate-success-pulse">
            🎉 Perfect! You revealed the whole picture!
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {onHintRequest && (
            <Button
              variant="outline"
              onClick={handleHint}
              disabled={isComplete || correctLetters.size === uniqueLetters.length}
            >
              💡 Hint ({hintsUsed})
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6 justify-center text-sm text-gray-600">
          <div>
            <span className="font-semibold">Correct:</span> {correctLetters.size} / {uniqueLetters.length}
          </div>
          <div>
            <span className="font-semibold">Wrong guesses:</span> {attempts}
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
