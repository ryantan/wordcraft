/**
 * Story Mode Debug Page
 * Visual state machine inspector for testing
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { storySessionMachine } from '@/lib/story/machines/storySessionMachine';
import { useMachine } from '@xstate/react';

export default function StoryDebugPage() {
  const testWordList = {
    id: 'debug-story',
    name: 'Debug Word List',
    description: 'For testing',
    words: ['TEST', 'DEBUG', 'STORY'],
    createdAt: new Date(),
    lastModifiedAt: new Date(),
    updatedAt: new Date(),
  };

  const [state, send] = useMachine(storySessionMachine, {
    input: {
      wordList: testWordList,
      theme: 'space',
      wordListId: 'debug-story',
      hasSeenIntro: false,
    },
  });

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Story Machine Debug</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* State Info */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(state.value, null, 2)}
          </pre>
        </Card>

        {/* Context Info */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Context</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Theme:</strong> {state.context.storyTheme}
            </p>
            <p>
              <strong>Beat Index:</strong> {state.context.currentBeatIndex}
            </p>
            <p>
              <strong>Current Beat:</strong> {state.context.currentBeat?.type || 'none'}
            </p>
            <p>
              <strong>Word Stats:</strong> {state.context.wordStats.size} words tracked
            </p>
            <p>
              <strong>Games Played:</strong> {state.context.gameResults.length}
            </p>
            <p>
              <strong>Has Seen Intro:</strong> {state.context.hasSeenIntro ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Session Time:</strong>{' '}
              {Math.floor((Date.now() - state.context.sessionStartTimeMs) / 1000)}s
            </p>
          </div>
        </Card>

        {/* Available Events */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Send Events</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => send({ type: 'START_STORY' })}
              disabled={!state.matches('showingIntro')}
            >
              START_STORY
            </Button>
            <Button
              onClick={() => send({ type: 'SKIP_INTRO' })}
              disabled={!state.matches('showingIntro')}
            >
              SKIP_INTRO
            </Button>
            <Button
              onClick={() => send({ type: 'NARRATIVE_SEEN' })}
              disabled={!state.matches({ processingBeat: 'showingNarrative' })}
            >
              NARRATIVE_SEEN
            </Button>
            <Button
              onClick={() =>
                send({
                  type: 'GAME_COMPLETED',
                  result: {
                    isCorrect: true,
                    timeSpent: 3000,
                    hintsUsed: 0,
                    errors: 0,
                  },
                })
              }
              disabled={!state.matches({ processingBeat: 'playingGame' })}
            >
              GAME_COMPLETED (Success)
            </Button>
            <Button
              onClick={() =>
                send({
                  type: 'GAME_COMPLETED',
                  result: {
                    isCorrect: false,
                    timeSpent: 5000,
                    hintsUsed: 2,
                    errors: 3,
                  },
                })
              }
              disabled={!state.matches({ processingBeat: 'playingGame' })}
            >
              GAME_COMPLETED (Fail)
            </Button>
            <Button
              onClick={() => send({ type: 'RESTART_STORY' })}
              disabled={!state.matches('finale')}
            >
              RESTART_STORY
            </Button>
            <Button
              onClick={() => send({ type: 'TRY_NEW_WORDS' })}
              disabled={!state.matches('finale')}
            >
              TRY_NEW_WORDS
            </Button>
          </div>
        </Card>

        {/* Word Stats */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Word Stats</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Word</th>
                  <th className="text-left p-2">Confidence</th>
                  <th className="text-left p-2">Errors</th>
                  <th className="text-left p-2">Attempts</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(state.context.wordStats.entries()).map(([word, stats]) => (
                  <tr key={word} className="border-b">
                    <td className="p-2">{word}</td>
                    <td className="p-2">{stats.confidence}%</td>
                    <td className="p-2">{stats.errors}</td>
                    <td className="p-2">{stats.attemptsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Beat Details */}
        {state.context.currentBeat && (
          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Current Beat Details</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(state.context.currentBeat, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
}
