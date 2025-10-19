'use client'

import { type FC, useState, useEffect, useCallback } from 'react'
import type { GameMechanicProps } from '@/types'
import { Button } from '@/components/ui/button'

/**
 * Word Scramble Game
 * Player unscrambles letters to form the correct word
 * For multi-word phrases: scrambles one word while showing others as hints
 */
export const WordScramble: FC<GameMechanicProps> = ({
  word,
  onComplete,
  onHintRequest,
  difficulty = 'medium',
}) => {
  const [words, setWords] = useState<string[]>([])
  const [scrambledWordIndex, setScrambledWordIndex] = useState<number>(0)
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([])
  const [userAnswer, setUserAnswer] = useState<string[]>([])
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [isCorrect, setIsCorrect] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  // Initialize - split into words and scramble one word
  useEffect(() => {
    const wordList = word.split(' ')
    setWords(wordList)

    // For multi-word phrases, pick a random word to scramble
    // For single words, scramble the only word
    const indexToScramble = wordList.length > 1
      ? Math.floor(Math.random() * wordList.length)
      : 0
    setScrambledWordIndex(indexToScramble)

    const wordToScramble = wordList[indexToScramble]
    const scrambled = wordToScramble.split('').sort(() => Math.random() - 0.5)

    // Ensure it's actually scrambled (not same as original)
    // Difficulty affects scrambling thoroughness
    const shuffleCount = difficulty === 'easy' ? 1 : difficulty === 'hard' ? 3 : 2
    let maxAttempts = 10
    while (scrambled.join('') === wordToScramble && maxAttempts > 0) {
      for (let i = 0; i < shuffleCount; i++) {
        scrambled.sort(() => Math.random() - 0.5)
      }
      maxAttempts--
    }

    setScrambledLetters(scrambled)
    setUserAnswer([])
  }, [word, difficulty])

  const handleLetterClick = useCallback((letter: string, index: number) => {
    // Move letter from scrambled to user answer
    setUserAnswer(prev => [...prev, letter])
    setScrambledLetters(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleAnswerClick = useCallback((letter: string, index: number) => {
    // Move letter back from user answer to scrambled
    setScrambledLetters(prev => [...prev, letter])
    setUserAnswer(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(() => {
    const answer = userAnswer.join('').toLowerCase()
    const correctWord = words[scrambledWordIndex].toLowerCase()
    const correct = answer === correctWord

    setAttempts(prev => prev + 1)
    setIsCorrect(correct)
    setShowFeedback(true)

    if (correct) {
      const timeMs = Date.now() - startTime

      // Complete the game after a short delay to show feedback
      setTimeout(() => {
        onComplete({
          word,
          correct: true,
          attempts: attempts + 1,
          timeMs,
          hintsUsed,
          mechanicId: 'word-scramble',
          completedAt: new Date(),
        })
      }, 1500)
    } else {
      // Hide feedback after 2 seconds and reset
      setTimeout(() => {
        setShowFeedback(false)
        // Move all letters back to scrambled
        setScrambledLetters(prev => [...prev, ...userAnswer])
        setUserAnswer([])
      }, 2000)
    }
  }, [userAnswer, words, scrambledWordIndex, word, attempts, hintsUsed, startTime, onComplete])

  const handleHint = useCallback(() => {
    if (!onHintRequest) return

    setHintsUsed(prev => prev + 1)
    onHintRequest()

    // Hint: Place the next correct letter in the answer
    const correctWord = words[scrambledWordIndex]
    if (userAnswer.length < correctWord.length) {
      const nextCorrectLetter = correctWord[userAnswer.length]
      const letterIndex = scrambledLetters.findIndex(
        l => l.toLowerCase() === nextCorrectLetter.toLowerCase()
      )

      if (letterIndex !== -1) {
        const letter = scrambledLetters[letterIndex]
        setUserAnswer(prev => [...prev, letter])
        setScrambledLetters(prev => prev.filter((_, i) => i !== letterIndex))
      }
    }
  }, [words, scrambledWordIndex, userAnswer, scrambledLetters, onHintRequest])

  const handleClear = useCallback(() => {
    setScrambledLetters(prev => [...prev, ...userAnswer])
    setUserAnswer([])
  }, [userAnswer])

  const correctWord = words[scrambledWordIndex] || ''

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Instructions */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Unscramble the Word</h2>
          <p className="text-gray-600">
            {words.length > 1
              ? 'Unscramble the highlighted word to complete the phrase'
              : 'Tap the letters below to spell the correct word'}
          </p>
        </div>

        {/* Phrase Context (for multi-word phrases) */}
        {words.length > 1 && (
          <div className="bg-primary-50 rounded-xl p-6 border-2 border-primary-200">
            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Complete the phrase:</p>
            <div className="flex flex-wrap gap-3 justify-center items-center">
              {words.map((w, index) => (
                <div key={index}>
                  {index === scrambledWordIndex ? (
                    <div className="px-6 py-3 bg-white border-2 border-dashed border-primary-400 rounded-lg text-primary-600 font-bold text-xl">
                      ___
                    </div>
                  ) : (
                    <div className="px-6 py-3 bg-white border-2 border-primary-300 rounded-lg text-gray-700 font-semibold text-xl">
                      {w}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scrambled Letters */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">Available Letters:</p>
          <div className="flex flex-wrap gap-2 justify-center min-h-[60px]">
            {scrambledLetters.map((letter, index) => (
              <button
                key={`scrambled-${index}`}
                onClick={() => handleLetterClick(letter, index)}
                className="w-14 h-14 text-2xl font-bold bg-white border-2 border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 hover:border-primary-500 transition-colors shadow-sm active:scale-95"
              >
                {letter.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* User Answer */}
        <div className="bg-white rounded-xl p-6 border-2 border-primary-300">
          <p className="text-sm font-semibold text-gray-700 mb-3">Your Answer:</p>
          <div className="flex flex-wrap gap-2 justify-center min-h-[60px]">
            {userAnswer.map((letter, index) => (
              <button
                key={`answer-${index}`}
                onClick={() => handleAnswerClick(letter, index)}
                className="w-14 h-14 text-2xl font-bold bg-primary-100 border-2 border-primary-500 text-primary-900 rounded-lg hover:bg-primary-200 transition-colors shadow-sm active:scale-95"
              >
                {letter.toUpperCase()}
              </button>
            ))}
            {userAnswer.length === 0 && (
              <p className="text-gray-400 text-sm self-center">Tap letters above to build your word</p>
            )}
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div
            className={`p-4 rounded-lg text-center font-semibold animate-fade-in ${
              isCorrect
                ? 'bg-success-100 border-2 border-success-500 text-success-800'
                : 'bg-error-100 border-2 border-error-500 text-error-800'
            }`}
          >
            {isCorrect ? '🎉 Correct! Great job!' : '❌ Not quite! Try again.'}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {onHintRequest && (
            <Button
              variant="outline"
              onClick={handleHint}
              disabled={userAnswer.length >= correctWord.length || showFeedback}
            >
              💡 Hint ({hintsUsed})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={userAnswer.length === 0 || showFeedback}
          >
            Clear
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={userAnswer.length !== correctWord.length || showFeedback}
            size="lg"
          >
            Check Answer
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-6 justify-center text-sm text-gray-600">
          <div>
            <span className="font-semibold">Attempts:</span> {attempts}
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
