'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getWordList } from '@/lib/storage/localStorage'
import { getGame } from '@/lib/games'
import type { GameMechanicId } from '@/types'
import { Button } from '@/components/ui/button'
import { SessionSummary } from '@/components/game/SessionSummary'
import { useGameSession } from '@/lib/game/useGameSession'

function GameContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listId = searchParams.get('listId')
  const mechanicId = searchParams.get('mechanicId') as GameMechanicId | null

  const [wordList, setWordList] = useState<ReturnType<typeof getWordList>>(null)
  const [isLoading, setIsLoading] = useState(true)

  const session = useGameSession(wordList, mechanicId)

  // Load word list
  useEffect(() => {
    if (!listId) {
      router.push('/word-lists')
      return
    }

    const list = getWordList(listId)
    if (!list) {
      router.push('/word-lists')
      return
    }

    setWordList(list)
    setIsLoading(false)
  }, [listId, router])

  const handleHintRequest = () => {
    // Hints are handled within each game mechanic
    // This callback is just for tracking/analytics
  }

  if (isLoading) {
    return (
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading game...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!wordList) {
    return (
      <main className="container mx-auto p-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Word List Not Found</h1>
          <p className="text-gray-600 mb-6">The word list you selected doesn&apos;t exist.</p>
          <Link href="/word-lists">
            <Button>Back to Word Lists</Button>
          </Link>
        </div>
      </main>
    )
  }

  if (session.gameFinished) {
    return <SessionSummary results={session.results} listId={listId!} mechanicId={mechanicId} />
  }

  if (!session.currentWord || !session.currentMechanicId) {
    return (
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Preparing game...</p>
          </div>
        </div>
      </main>
    )
  }

  const gameMechanic = getGame(session.currentMechanicId)
  if (!gameMechanic) {
    return (
      <main className="container mx-auto p-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Game Not Found</h1>
          <p className="text-gray-600 mb-6">The requested game mechanic is not available.</p>
          <Link href="/word-lists">
            <Button>Back to Word Lists</Button>
          </Link>
        </div>
      </main>
    )
  }

  const GameComponent = gameMechanic.Component

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Progress Header */}
      <div className="bg-white border-b-2 border-primary-200 px-6 py-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{wordList.name}</h1>
              <p className="text-sm text-gray-600">{gameMechanic.meta.name}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {session.roundsCompleted}/{session.maxRounds}
                </div>
                <div className="text-xs text-gray-600">Rounds</div>
              </div>
              <Link href="/word-lists">
                <Button variant="outline" size="sm">
                  Exit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <GameComponent
        key={session.roundKey}
        word={session.currentWord}
        onComplete={session.handleGameComplete}
        onHintRequest={handleHintRequest}
        difficulty={session.currentDifficulty}
      />
    </main>
  )
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Loading game...</p>
            </div>
          </div>
        </main>
      }
    >
      <GameContent />
    </Suspense>
  )
}
