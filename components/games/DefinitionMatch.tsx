'use client'

import { type FC, useState, useEffect, useCallback } from 'react'
import type { GameMechanicProps } from '@/types'
import type { WordInfo } from '@/lib/openai/word-info/schema'
import { Button } from '@/components/ui/button'

/**
 * Definition Match Game
 * Player selects the correct word that matches the given definition
 * Uses hint from extraWordInfo.hint and similar words from extraWordInfo.similar_words
 */
interface DefinitionMatchProps extends GameMechanicProps {
  extraWordInfo?: WordInfo;
}

export const DefinitionMatch: FC<DefinitionMatchProps> = ({
  word,
  onComplete,
  onHintRequest,
  difficulty = 'medium',
  extraWordInfo,
}) => {
  const [options, setOptions] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [isCorrect, setIsCorrect] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<string>>(new Set())

  // Initialize options from similar words
  useEffect(() => {
    if (!extraWordInfo?.similar_words) {
      // If no similar words provided, create some basic options
      setOptions([word])
      return
    }

    // Create options array with correct word and similar words
    const similarWords = extraWordInfo.similar_words.filter(w => w.toLowerCase() !== word.toLowerCase())
    let allOptions = [word, ...similarWords]

    // Limit options based on difficulty
    const maxOptions = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 5 : 4
    if (allOptions.length > maxOptions) {
      // Keep the correct word and randomly select from similar words
      const shuffledSimilar = similarWords.sort(() => Math.random() - 0.5)
      allOptions = [word, ...shuffledSimilar.slice(0, maxOptions - 1)]
    }

    // Shuffle the options
    const shuffled = allOptions.sort(() => Math.random() - 0.5)
    setOptions(shuffled)
  }, [word, extraWordInfo, difficulty])

  const handleOptionClick = useCallback((option: string) => {
    if (showFeedback || eliminatedOptions.has(option)) return
    setSelectedOption(option)
  }, [showFeedback, eliminatedOptions])

  const handleSubmit = useCallback(() => {
    if (!selectedOption) return

    const correct = selectedOption.toLowerCase() === word.toLowerCase()
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
          mechanicId: 'definition-match',
          completedAt: new Date(),
        })
      }, 1500)
    } else {
      // Hide feedback after 2 seconds and reset
      setTimeout(() => {
        setShowFeedback(false)
        // Mark the incorrect option as eliminated in hard mode
        if (difficulty === 'hard' && selectedOption) {
          setEliminatedOptions(prev => new Set([...prev, selectedOption]))
        }
        setSelectedOption(null)
      }, 2000)
    }
  }, [selectedOption, word, attempts, hintsUsed, startTime, onComplete, difficulty])

  const handleHint = useCallback(() => {
    if (!onHintRequest) return

    setHintsUsed(prev => prev + 1)
    onHintRequest()

    // Hint: Eliminate one incorrect option
    const incorrectOptions = options.filter(
      opt => opt.toLowerCase() !== word.toLowerCase() && !eliminatedOptions.has(opt)
    )
    
    if (incorrectOptions.length > 0) {
      const toEliminate = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)]
      setEliminatedOptions(prev => new Set([...prev, toEliminate]))
    }
  }, [options, word, eliminatedOptions, onHintRequest])

  // Get the hint/definition to display
  const definition = extraWordInfo?.hint || 'Select the correct word'

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Instructions */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Match the Definition</h2>
          <p className="text-gray-600">
            Read the definition and select the word that matches
          </p>
        </div>

        {/* Definition */}
        <div className="bg-primary-50 rounded-xl p-6 border-2 border-primary-200">
          <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Definition:</p>
          <p className="text-lg text-center text-gray-800 font-medium">
            {definition}
          </p>
        </div>

        {/* Word Options */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 text-center">Choose the correct word:</p>
          <div className="grid gap-3">
            {options.map((option, index) => {
              const isEliminated = eliminatedOptions.has(option)
              const isSelected = selectedOption === option
              
              return (
                <button
                  key={`option-${index}`}
                  onClick={() => handleOptionClick(option)}
                  disabled={showFeedback || isEliminated}
                  className={`
                    px-6 py-4 text-lg font-semibold rounded-lg transition-all
                    ${isEliminated 
                      ? 'bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed line-through' 
                      : isSelected
                        ? 'bg-primary-100 border-2 border-primary-600 text-primary-900 ring-2 ring-primary-400'
                        : 'bg-white border-2 border-gray-300 text-gray-800 hover:border-primary-400 hover:bg-primary-50'
                    }
                    ${!showFeedback && !isEliminated ? 'active:scale-98' : ''}
                  `}
                >
                  {option}
                </button>
              )
            })}
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
              disabled={
                showFeedback || 
                eliminatedOptions.size >= options.length - 1 ||
                options.length <= 2
              }
            >
              💡 Hint ({hintsUsed})
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!selectedOption || showFeedback}
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
          {difficulty === 'hard' && eliminatedOptions.size > 0 && (
            <div>
              <span className="font-semibold">Eliminated:</span> {eliminatedOptions.size}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}