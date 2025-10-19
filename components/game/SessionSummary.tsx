'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { calculateSessionStats } from '@/lib/game/session-tracker'
import type { GameResult } from '@/types'

interface SessionSummaryProps {
  results: GameResult[]
  listId: string
  mechanicId: string | null
}

/**
 * Session Summary Component
 *
 * Displays results and statistics after completing a game session.
 */
export function SessionSummary({ results, listId, mechanicId }: SessionSummaryProps) {
  const stats = calculateSessionStats(results)

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

          {/* Results List */}
          <div className="mt-8 space-y-3">
            <h3 className="font-semibold text-gray-900">Words Practiced:</h3>
            {stats.wordPracticeCounts.map((wordData, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-success-50 border border-success-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <div className="font-semibold text-gray-900">{wordData.word}</div>
                    <div className="text-sm text-gray-600">
                      Practiced {wordData.count} {wordData.count === 1 ? 'time' : 'times'}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>{wordData.avgAttempts.toFixed(1)} avg attempts</div>
                  <div>{wordData.avgTime}s avg</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link href={`/game?listId=${listId}${mechanicId ? `&mechanicId=${mechanicId}` : ''}`}>
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
