/**
 * Story Mode Page
 *
 * Main page for narrative-driven spelling practice
 */

'use client'

import { useMachine } from '@xstate/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { storySessionMachine } from '@/machines/story'
import { StoryIntroScreen } from '@/components/story/StoryIntroScreen'
import { NarrativeBeatScreen } from '@/components/story/NarrativeBeatScreen'
import { ChoiceBeatScreen } from '@/components/story/ChoiceBeatScreen'
import { CheckpointScreen } from '@/components/story/CheckpointScreen'
import { StoryFinaleScreen } from '@/components/story/StoryFinaleScreen'
import { GameRenderer } from '@/components/story/GameRenderer'
import type { GameBeat, ChoiceBeat } from '@/types/story'
import { Button } from '@/components/ui/button'
import { useStoryIntro } from '@/lib/hooks/useStoryIntro'
import { calculateSessionStats } from '@/lib/game/calculate-session-stats'

export default function StoryModePage() {
  const router = useRouter()
  const [showExitDialog, setShowExitDialog] = useState(false)

  // TODO: Get word list from URL params or user selection
  // For now, using a demo word list
  const now = new Date()
  const demoWordList = {
    id: 'demo-story',
    name: 'Space Adventure Words',
    description: 'Words for space adventure',
    words: ['ROCKET', 'SPACE', 'ALIEN', 'PLANET', 'STAR', 'MOON', 'GALAXY', 'COMET', 'ORBIT', 'TELESCOPE'],
    createdAt: now,
    lastModifiedAt: now,
    updatedAt: now,
  }

  // Check if intro has been seen for this word list
  const { hasSeenIntro } = useStoryIntro(demoWordList.id)

  const [state, send] = useMachine(storySessionMachine, {
    input: {
      wordList: demoWordList,
      theme: 'space',
      wordListId: demoWordList.id,
      hasSeenIntro,
    },
  })

  const handleExit = () => {
    setShowExitDialog(true)
  }

  const confirmExit = () => {
    // Clear story session state and return to home
    router.push('/')
  }

  // Exit Dialog
  if (showExitDialog) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Exit Story Mode?</h2>
          <p className="text-gray-700 mb-6">
            Your progress will be saved. You can continue this story later.
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => setShowExitDialog(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmExit}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              Exit
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (state.matches('idle')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🚀</div>
          <p className="text-xl font-semibold">Preparing your adventure...</p>
        </div>
      </div>
    )
  }

  // Intro screen
  if (state.matches('showingIntro')) {
    return (
      <StoryIntroScreen
        introContent={state.context.introContent}
        theme={state.context.storyTheme}
        wordListName={demoWordList.name}
        onStart={() => send({ type: 'START_STORY' })}
        onSkip={() => send({ type: 'SKIP_INTRO' })}
      />
    )
  }

  // Narrative beat
  if (state.matches({ processingBeat: 'showingNarrative' })) {
    const beat = state.context.currentBeat
    return (
      <>
        {/* Exit button */}
        <div className="fixed top-4 right-4 z-10">
          <Button onClick={handleExit} variant="outline" size="sm">
            Exit Story
          </Button>
        </div>

        <NarrativeBeatScreen
          narrative={beat?.narrative || ''}
          onContinue={() => send({ type: 'NARRATIVE_SEEN' })}
        />
      </>
    )
  }

  // Choice beat
  if (state.matches({ processingBeat: 'presentingChoice' })) {
    const beat = state.context.currentBeat as ChoiceBeat
    return (
      <>
        {/* Exit button */}
        <div className="fixed top-4 right-4 z-10">
          <Button onClick={handleExit} variant="outline" size="sm">
            Exit Story
          </Button>
        </div>

        <ChoiceBeatScreen
          choiceBeat={beat}
          onChoice={(choice) => send({ type: 'CHOICE_MADE', choice })}
        />
      </>
    )
  }

  // Game beat
  if (state.matches({ processingBeat: 'playingGame' })) {
    const beat = state.context.currentBeat as GameBeat
    return (
      <>
        {/* Exit button */}
        <div className="fixed top-4 right-4 z-10">
          <Button onClick={handleExit} variant="outline" size="sm">
            Exit Story
          </Button>
        </div>

        <GameRenderer
          beat={beat}
          onComplete={(result) => send({ type: 'GAME_COMPLETED', result })}
        />
      </>
    )
  }

  // Checkpoint beat
  if (state.matches({ processingBeat: 'showingCheckpoint' })) {
    return (
      <CheckpointScreen
        checkpoint={state.context.currentCheckpoint}
        backgroundImage="/story-assets/space-bg.jpg"
        characterImage="/story-assets/space-character.png"
        canContinue={state.context.canContinueStory}
        onContinue={() => send({ type: 'CONTINUE_STORY' })}
        onSkip={() => send({ type: 'SKIP_CHECKPOINT' })}
      />
    )
  }

  // Finale
  if (state.matches('finale')) {
    // Calculate session stats
    const stats = calculateSessionStats(
      state.context.wordStats,
      state.context.gameResults,
      state.context.sessionStartTimeMs
    )

    return (
      <StoryFinaleScreen
        finaleContent={state.context.finaleContent}
        wordListName={demoWordList.name}
        stats={stats}
        onPlayAgain={() => send({ type: 'RESTART_STORY' })}
        onTryNewWords={() => send({ type: 'TRY_NEW_WORDS' })}
        onViewProgress={() => router.push('/dashboard')}
      />
    )
  }

  // Fallback
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-xl">Unknown state: {JSON.stringify(state.value)}</p>
        <Button onClick={() => router.push('/')} className="mt-4">
          Return Home
        </Button>
      </div>
    </div>
  )
}
