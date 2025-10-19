'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { calculateSessionStats } from '@/lib/game/session-tracker'
import { calculateWordConfidence } from '@/lib/algorithms/confidence-scoring'
import type { GameResult } from '@/types'

interface SessionSummaryProps {
  results: GameResult[]
  listId: string
  mechanicId: string | null
}

/**
 * Get confidence level styling based on score
 */
function getConfidenceStyle(score: number) {
  if (score >= 80) {
    return {
      label: 'Mastered',
      bgColor: 'bg-success-50',
      borderColor: 'border-success-300',
      textColor: 'text-success-700',
      barColor: 'bg-success-500',
      emoji: '🌟',
    }
  } else if (score >= 60) {
    return {
      label: 'Progressing',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-700',
      barColor: 'bg-yellow-500',
      emoji: '📈',
    }
  } else {
    return {
      label: 'Needs Practice',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-700',
      barColor: 'bg-orange-500',
      emoji: '💪',
    }
  }
}

/**
 * Session Summary Component
 *
 * Displays results and statistics after completing a game session.
 */
export function SessionSummary({ results, listId, mechanicId }: SessionSummaryProps) {
  const stats = calculateSessionStats(results)

  // Calculate confidence for each word
  const wordConfidence = stats.wordPracticeCounts.map(wordData => {
    const confidence = calculateWordConfidence(wordData.word, results)
    return {
      ...wordData,
      confidence,
      style: getConfidenceStyle(confidence.score),
    }
  })

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
              <div className="text-4xl font-bold text-primary-600">{stats.totalRounds}</div>
              <div className="text-sm text-gray-600 mt-1">Rounds</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">{stats.uniqueWords}</div>
              <div className="text-sm text-gray-600 mt-1">Words</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">{stats.avgTime}s</div>
              <div className="text-sm text-gray-600 mt-1">Avg Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">{stats.totalHints}</div>
              <div className="text-sm text-gray-600 mt-1">Hints</div>
            </div>
          </div>

          {/* Results List with Confidence Indicators */}
          <div className="mt-8 space-y-3">
            <h3 className="font-semibold text-gray-900">Words Practiced:</h3>
            {wordConfidence.map((wordData, index) => (
              <div
                key={index}
                className={`p-4 ${wordData.style.bgColor} border ${wordData.style.borderColor} rounded-lg space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{wordData.style.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{wordData.word}</div>
                      <div className="text-sm text-gray-600">
                        Practiced {wordData.count} {wordData.count === 1 ? 'time' : 'times'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${wordData.style.textColor}`}>
                      {wordData.style.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {wordData.avgAttempts.toFixed(1)} avg attempts
                    </div>
                  </div>
                </div>

                {/* Confidence Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Confidence</span>
                    <span className="font-semibold">{wordData.confidence.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${wordData.style.barColor} h-2 rounded-full transition-all`}
                      style={{ width: `${wordData.confidence.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link href={`/game?listId=${listId}${mechanicId ? `&mechanicId=${mechanicId}` : ''}&t=${Date.now()}`}>
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
