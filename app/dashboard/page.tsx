'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAllGameResults } from '@/lib/storage/sessionStorage'
import { getAllWordLists } from '@/lib/storage/localStorage'
import { calculateWordConfidence, getMasteredWords } from '@/lib/algorithms/confidence-scoring'
import type { GameResult, WordList } from '@/types'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [wordLists, setWordLists] = useState<WordList[]>([])
  const [gameResults, setGameResults] = useState<GameResult[]>([])

  useEffect(() => {
    // Load data from storage
    const lists = getAllWordLists()
    const results = getAllGameResults()

    setWordLists(lists)
    setGameResults(results)
    setIsLoading(false)
  }, [])

  // Calculate overall stats
  const totalWords = wordLists.reduce((sum, list) => sum + list.words.length, 0)
  const totalSessions = new Set(gameResults.map(r => r.completedAt.toDateString())).size
  const totalGamesPlayed = gameResults.length

  // Calculate mastery across all words
  const allWords = wordLists.flatMap(list => list.words)
  const uniqueWords = Array.from(new Set(allWords))
  const confidenceMap = new Map(
    uniqueWords.map(word => [
      word,
      calculateWordConfidence(word, gameResults)
    ])
  )
  const masteredWords = getMasteredWords(confidenceMap)

  const hasData = gameResults.length > 0

  if (isLoading) {
    return (
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Progress Dashboard</h1>
            <p className="text-gray-600">Track your child&apos;s spelling journey</p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900">No Practice Data Yet</h2>
            <p className="text-gray-600">
              Start playing games to see progress tracking, word mastery stats, and learning analytics here.
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <Link href="/word-lists">
                <Button size="lg">Create Word List</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {hasData && (
        <div className="space-y-8">
          {/* Overview Stats */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border-2 border-primary-200 p-6">
                <div className="text-sm font-semibold text-gray-600 mb-2">Total Words</div>
                <div className="text-4xl font-bold text-primary-600">{totalWords}</div>
                <div className="text-xs text-gray-500 mt-2">Across {wordLists.length} lists</div>
              </div>

              <div className="bg-white rounded-xl border-2 border-success-200 p-6">
                <div className="text-sm font-semibold text-gray-600 mb-2">Words Mastered</div>
                <div className="text-4xl font-bold text-success-600">{masteredWords.length}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {totalWords > 0 ? Math.round((masteredWords.length / uniqueWords.length) * 100) : 0}% complete
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-purple-200 p-6">
                <div className="text-sm font-semibold text-gray-600 mb-2">Practice Sessions</div>
                <div className="text-4xl font-bold text-purple-600">{totalSessions}</div>
                <div className="text-xs text-gray-500 mt-2">Days practiced</div>
              </div>

              <div className="bg-white rounded-xl border-2 border-orange-200 p-6">
                <div className="text-sm font-semibold text-gray-600 mb-2">Games Played</div>
                <div className="text-4xl font-bold text-orange-600">{totalGamesPlayed}</div>
                <div className="text-xs text-gray-500 mt-2">Total rounds</div>
              </div>
            </div>
          </section>

          {/* Word Mastery Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Word Mastery</h2>
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <p className="text-gray-600 mb-4">Coming soon: Detailed word-by-word mastery tracking</p>
              <div className="text-sm text-gray-500">
                View confidence scores, practice frequency, and mastery status for each word.
              </div>
            </div>
          </section>

          {/* Session History Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Session History</h2>
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <p className="text-gray-600 mb-4">Coming soon: Practice session timeline</p>
              <div className="text-sm text-gray-500">
                Track when and how long your child practices, with detailed session breakdowns.
              </div>
            </div>
          </section>

          {/* Analytics Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <p className="text-gray-600 mb-4">Coming soon: Progress charts and learning insights</p>
              <div className="text-sm text-gray-500">
                Visualize learning trends, game preferences, and improvement over time.
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
