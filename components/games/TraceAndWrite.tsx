'use client'

import { type FC, useState, useEffect, useCallback, useRef } from 'react'
import type { GameMechanicProps } from '@/types'
import { Button } from '@/components/ui/button'

/**
 * Trace & Write Game
 * Player traces letter shapes to practice spelling through kinesthetic motor memory
 */
export const TraceAndWrite: FC<GameMechanicProps> = ({
  word,
  onComplete,
  onHintRequest,
  difficulty = 'medium',
}) => {
  const [letters, setLetters] = useState<string[]>([])
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [tracedLetters, setTracedLetters] = useState<Set<number>>(new Set())
  const [isTracing, setIsTracing] = useState(false)
  const [traceProgress, setTraceProgress] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [showFeedback, setShowFeedback] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Initialize letters
  useEffect(() => {
    const cleanWord = word.replace(/\s/g, '') // Remove spaces
    setLetters(cleanWord.split(''))
    setCurrentLetterIndex(0)
    setTracedLetters(new Set())
  }, [word])

  // Get stroke requirement based on difficulty
  const getRequiredProgress = useCallback(() => {
    if (difficulty === 'easy') return 50 // More forgiving
    if (difficulty === 'hard') return 90 // More strict
    return 70 // Medium
  }, [difficulty])

  const handleTraceStart = useCallback(() => {
    setIsTracing(true)
    setTraceProgress(0)
  }, [])

  const handleTraceMove = useCallback(() => {
    if (!isTracing) return

    // Simulate tracing progress (in a real implementation, this would track actual mouse/touch movement)
    setTraceProgress(prev => {
      const increment = difficulty === 'easy' ? 15 : difficulty === 'hard' ? 8 : 10
      return Math.min(100, prev + increment)
    })
  }, [isTracing, difficulty])

  const handleTraceEnd = useCallback(() => {
    if (!isTracing) return

    setIsTracing(false)
    const requiredProgress = getRequiredProgress()

    if (traceProgress >= requiredProgress) {
      // Successfully traced!
      const newTracedLetters = new Set(tracedLetters)
      newTracedLetters.add(currentLetterIndex)
      setTracedLetters(newTracedLetters)
      setShowFeedback(true)

      setTimeout(() => {
        setShowFeedback(false)
        setTraceProgress(0)

        // Move to next letter or complete
        if (currentLetterIndex < letters.length - 1) {
          setCurrentLetterIndex(prev => prev + 1)
        } else {
          // All letters traced - complete the game
          const timeMs = Date.now() - startTime

          setTimeout(() => {
            onComplete({
              word,
              correct: true,
              attempts: attempts + 1,
              timeMs,
              hintsUsed,
              mechanicId: 'trace-write',
              completedAt: new Date(),
            })
          }, 800)
        }
      }, 500)
    } else {
      // Not traced enough
      setAttempts(prev => prev + 1)
      setTraceProgress(0)
    }
  }, [isTracing, traceProgress, tracedLetters, currentLetterIndex, letters.length, getRequiredProgress, attempts, hintsUsed, startTime, word, onComplete])

  const handleHint = useCallback(() => {
    if (!onHintRequest) return

    setHintsUsed(prev => prev + 1)
    onHintRequest()

    // Auto-complete current letter
    const newTracedLetters = new Set(tracedLetters)
    newTracedLetters.add(currentLetterIndex)
    setTracedLetters(newTracedLetters)
    setShowFeedback(true)

    setTimeout(() => {
      setShowFeedback(false)
      setTraceProgress(0)

      if (currentLetterIndex < letters.length - 1) {
        setCurrentLetterIndex(prev => prev + 1)
      }
    }, 500)
  }, [tracedLetters, currentLetterIndex, letters.length, onHintRequest])

  const currentLetter = letters[currentLetterIndex]
  const allTraced = tracedLetters.size === letters.length
  const requiredProgress = getRequiredProgress()

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-3xl w-full space-y-8">
        {/* Instructions */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Trace the Letters</h2>
          <p className="text-gray-600">
            Click and drag over each letter to trace it
          </p>
        </div>

        {/* Progress Display */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 border-2 border-primary-200 rounded-lg px-6 py-3">
            {letters.map((letter, index) => (
              <span
                key={index}
                className={`text-2xl font-bold font-mono ${
                  tracedLetters.has(index)
                    ? 'text-success-600'
                    : index === currentLetterIndex
                    ? 'text-primary-600'
                    : 'text-gray-400'
                }`}
              >
                {tracedLetters.has(index) ? '✓' : letter.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Tracing Area */}
        {!allTraced && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-12 border-4 border-purple-300">
            <div
              ref={canvasRef}
              onMouseDown={handleTraceStart}
              onMouseMove={handleTraceMove}
              onMouseUp={handleTraceEnd}
              onMouseLeave={handleTraceEnd}
              onTouchStart={handleTraceStart}
              onTouchMove={handleTraceMove}
              onTouchEnd={handleTraceEnd}
              className="relative bg-white rounded-lg border-4 border-dashed border-purple-400 aspect-square max-w-md mx-auto cursor-pointer select-none overflow-hidden"
              style={{
                background: `linear-gradient(to bottom, white ${traceProgress}%, rgba(147, 51, 234, 0.1) ${traceProgress}%)`,
              }}
            >
              {/* Large letter to trace */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`text-[12rem] font-bold transition-all ${
                    isTracing
                      ? 'text-purple-400 scale-105'
                      : 'text-purple-200'
                  }`}
                  style={{
                    textShadow: '0 0 20px rgba(147, 51, 234, 0.3)',
                    WebkitTextStroke: '4px rgba(147, 51, 234, 0.3)',
                    paintOrder: 'stroke fill',
                  }}
                >
                  {currentLetter?.toUpperCase()}
                </div>
              </div>

              {/* Trace instruction overlay */}
              {!isTracing && traceProgress === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-purple-600 text-lg font-semibold bg-white/80 px-6 py-3 rounded-lg">
                    Click and drag to trace
                  </div>
                </div>
              )}

              {/* Progress indicator */}
              {isTracing && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-gray-200 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all"
                      style={{ width: `${traceProgress}%` }}
                    />
                  </div>
                  <div className="text-xs text-center mt-1 text-purple-700 font-semibold">
                    {traceProgress}% (need {requiredProgress}%)
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success state */}
        {allTraced && (
          <div className="bg-success-100 border-4 border-success-500 rounded-xl p-12">
            <div className="text-center space-y-4">
              <div className="text-6xl">🎉</div>
              <h3 className="text-2xl font-bold text-success-800">
                Excellent Tracing!
              </h3>
              <p className="text-success-700">
                You traced all the letters perfectly!
              </p>
              <div className="text-4xl font-bold text-success-600 tracking-wider">
                {word.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && !allTraced && (
          <div className="p-4 rounded-lg text-center font-semibold bg-success-100 border-2 border-success-500 text-success-800 animate-fade-in">
            ✓ Perfect! Letter traced successfully!
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {onHintRequest && !allTraced && (
            <Button
              variant="outline"
              onClick={handleHint}
            >
              💡 Skip Letter ({hintsUsed})
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6 justify-center text-sm text-gray-600">
          <div>
            <span className="font-semibold">Traced:</span> {tracedLetters.size} / {letters.length}
          </div>
          <div>
            <span className="font-semibold">Retries:</span> {attempts}
          </div>
          {onHintRequest && (
            <div>
              <span className="font-semibold">Skipped:</span> {hintsUsed}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
