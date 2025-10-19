'use client'

import { type FC, useState, useEffect, useCallback, useMemo } from 'react'
import type { GameMechanicProps } from '@/types'
import { Button } from '@/components/ui/button'

interface LetterSlot {
  letter: string
  isMissing: boolean
  userInput?: string
}

/**
 * Missing Letters Game
 * Player fills in missing letters to complete the word
 */
export const MissingLetters: FC<GameMechanicProps> = ({
  word,
  onComplete,
  onHintRequest,
  difficulty = 'medium',
}) => {
  const [slots, setSlots] = useState<LetterSlot[]>([])
  const [availableLetters, setAvailableLetters] = useState<string[]>([])
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number>(-1)
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [isCorrect, setIsCorrect] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  // Determine how many letters to hide based on difficulty
  const hiddenLetterCount = useMemo(() => {
    const wordLength = word.length
    if (difficulty === 'easy') {
      return Math.max(1, Math.floor(wordLength * 0.3))
    } else if (difficulty === 'hard') {
      return Math.max(2, Math.floor(wordLength * 0.6))
    }
    // medium
    return Math.max(1, Math.floor(wordLength * 0.4))
  }, [word, difficulty])

  // Initialize the game
  useEffect(() => {
    const letters = word.split('')

    // Randomly select which letters to hide
    const hiddenIndices = new Set<number>()
    while (hiddenIndices.size < hiddenLetterCount) {
      const randomIndex = Math.floor(Math.random() * letters.length)
      hiddenIndices.add(randomIndex)
    }

    // Create slots
    const newSlots: LetterSlot[] = letters.map((letter, index) => ({
      letter,
      isMissing: hiddenIndices.has(index),
    }))

    setSlots(newSlots)

    // Find first missing slot
    const firstMissing = newSlots.findIndex(s => s.isMissing)
    setCurrentSlotIndex(firstMissing)

    // Create available letters (correct + some distractors)
    const missingLetters = newSlots.filter(s => s.isMissing).map(s => s.letter)
    const distractorCount = Math.max(2, Math.floor(missingLetters.length * 0.5))
    const allLetters = 'abcdefghijklmnopqrstuvwxyz'
    const distractors: string[] = []

    while (distractors.length < distractorCount) {
      const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)]
      if (
        !missingLetters.includes(randomLetter) &&
        !distractors.includes(randomLetter)
      ) {
        distractors.push(randomLetter)
      }
    }

    const allAvailable = [...missingLetters, ...distractors].sort(
      () => Math.random() - 0.5
    )
    setAvailableLetters(allAvailable)
  }, [word, hiddenLetterCount])

  const handleLetterClick = useCallback(
    (letter: string) => {
      if (currentSlotIndex === -1) return

      // Fill the current slot
      const newSlots = [...slots]
      newSlots[currentSlotIndex].userInput = letter

      // Find next empty slot
      const nextSlotIndex = newSlots.findIndex(
        (s, i) => i > currentSlotIndex && s.isMissing && !s.userInput
      )

      setSlots(newSlots)
      setCurrentSlotIndex(nextSlotIndex)

      // Remove letter from available
      setAvailableLetters(prev => {
        const index = prev.indexOf(letter)
        if (index > -1) {
          return prev.filter((_, i) => i !== index)
        }
        return prev
      })
    },
    [currentSlotIndex, slots]
  )

  const handleSlotClick = useCallback((index: number) => {
    setSlots(prev => {
      const slot = prev[index]
      if (slot.isMissing && slot.userInput) {
        // Return letter to available
        setAvailableLetters(letters => [...letters, slot.userInput!])

        // Clear the slot
        const newSlots = [...prev]
        newSlots[index].userInput = undefined
        return newSlots
      }
      return prev
    })

    // Set as current slot
    setCurrentSlotIndex(index)
  }, [])

  const handleSubmit = useCallback(() => {
    const userWord = slots
      .map(s => (s.isMissing ? s.userInput || '' : s.letter))
      .join('')
      .toLowerCase()
    const correct = userWord === word.toLowerCase()

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
          mechanicId: 'missing-letters',
          completedAt: new Date(),
        })
      }, 1500)
    } else {
      setTimeout(() => {
        setShowFeedback(false)
      }, 2000)
    }
  }, [slots, word, attempts, hintsUsed, startTime, onComplete])

  const handleHint = useCallback(() => {
    if (!onHintRequest) return

    setHintsUsed(prev => prev + 1)
    onHintRequest()

    // Find first empty missing slot and fill it
    const emptySlotIndex = slots.findIndex(s => s.isMissing && !s.userInput)
    if (emptySlotIndex !== -1) {
      const correctLetter = slots[emptySlotIndex].letter
      handleLetterClick(correctLetter)
    }
  }, [slots, onHintRequest, handleLetterClick])

  const handleClear = useCallback(() => {
    // Return all user inputs to available letters
    const returnedLetters = slots
      .filter(s => s.isMissing && s.userInput)
      .map(s => s.userInput!)

    setAvailableLetters(prev => [...prev, ...returnedLetters])

    // Clear all slots
    setSlots(prev =>
      prev.map(s => ({
        ...s,
        userInput: undefined,
      }))
    )

    // Reset to first missing slot
    const firstMissing = slots.findIndex(s => s.isMissing)
    setCurrentSlotIndex(firstMissing)
  }, [slots])

  const allFilled = slots.every(s => !s.isMissing || s.userInput)

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-3xl w-full space-y-8">
        {/* Instructions */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Fill in the Missing Letters</h2>
          <p className="text-gray-600">
            Click the blank spaces and choose the correct letters
          </p>
        </div>

        {/* Word Display */}
        <div className="bg-white rounded-xl p-8 border-2 border-primary-300">
          <div className="flex flex-wrap gap-2 justify-center">
            {slots.map((slot, index) => (
              <button
                key={index}
                onClick={() => slot.isMissing && handleSlotClick(index)}
                disabled={!slot.isMissing || showFeedback}
                className={`w-16 h-20 text-3xl font-bold rounded-lg transition-all ${
                  slot.isMissing
                    ? currentSlotIndex === index
                      ? 'bg-primary-200 border-4 border-primary-600 text-primary-900 scale-105'
                      : slot.userInput
                      ? 'bg-primary-100 border-2 border-primary-400 text-primary-900 hover:bg-primary-150'
                      : 'bg-gray-100 border-2 border-dashed border-gray-400 text-transparent hover:bg-gray-200'
                    : 'bg-gray-50 border-2 border-gray-300 text-gray-700'
                }`}
              >
                {slot.isMissing ? (slot.userInput?.toUpperCase() || '_') : slot.letter.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Available Letters */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
            Choose a letter:
          </p>
          <div className="flex flex-wrap gap-2 justify-center min-h-[60px]">
            {availableLetters.map((letter, index) => (
              <button
                key={`${letter}-${index}`}
                onClick={() => handleLetterClick(letter)}
                disabled={currentSlotIndex === -1 || showFeedback}
                className="w-14 h-14 text-2xl font-bold bg-white border-2 border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 hover:border-primary-500 transition-colors shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {letter.toUpperCase()}
              </button>
            ))}
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
            {isCorrect ? '🎉 Perfect! You got it!' : '❌ Not quite right. Try again!'}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {onHintRequest && (
            <Button
              variant="outline"
              onClick={handleHint}
              disabled={allFilled || showFeedback}
            >
              💡 Hint ({hintsUsed})
            </Button>
          )}
          <Button variant="outline" onClick={handleClear} disabled={showFeedback}>
            Clear
          </Button>
          <Button onClick={handleSubmit} disabled={!allFilled || showFeedback} size="lg">
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
