/**
 * Game Renderer
 *
 * Dynamically renders game components based on beat type
 */

'use client';

import { DefinitionMatch } from '@/components/games/DefinitionMatch';
import { LetterHunt } from '@/components/games/LetterHunt';
import { LetterMatching } from '@/components/games/LetterMatching';
import { MissingLetters } from '@/components/games/MissingLetters';
import { PictureReveal } from '@/components/games/PictureReveal';
import { SpellingChallenge } from '@/components/games/SpellingChallenge';
import { TraceAndWrite } from '@/components/games/TraceAndWrite';
import { WordBuildingBlocks } from '@/components/games/WordBuildingBlocks';
import { WordScramble } from '@/components/games/WordScramble';
import type { GameResult } from '@/types';
import type { GameBeat } from '@/types/story';
import { highlightText } from '@/lib/utils/highlight-text';
import { useState } from 'react';

interface GameRendererProps {
  beat: GameBeat;
  onComplete: (result: {
    isCorrect: boolean;
    timeSpent: number;
    hintsUsed: number;
    errors: number;
  }) => void;
}

export function GameRenderer({ beat, onComplete }: GameRendererProps) {
  const { word, gameType, narrative, extraWordInfo } = beat;
  const [showingNarrative, setShowingNarrative] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);

  const handleStartGame = () => {
    setStartTime(Date.now());
    setShowingNarrative(false);
  };

  const handleGameComplete = (result: GameResult) => {
    const timeSpent = startTime ? Date.now() - startTime : 0;
    const errors = Math.max(0, result.attempts - 1); // Attempts minus first try

    setShowingNarrative(true);
    onComplete({
      isCorrect: result.correct,
      timeSpent,
      hintsUsed,
      errors,
    });
  };

  const handleHintRequest = () => {
    setHintsUsed(prev => prev + 1);
  };

  // Show narrative first
  if (showingNarrative) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-indigo-200 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Story narrative with highlighted word */}
            <div className="mb-8">
              <p className="text-xl text-gray-700 leading-relaxed text-center">
                {highlightText(narrative, word)}
              </p>
            </div>

            {/* Start game button */}
            <div className="text-center">
              <button
                onClick={handleStartGame}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium"
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-indigo-200 p-4">
      {/* Game component */}
      <div className="max-w-4xl mx-auto mt-8">
        {gameType === 'letter-matching' && (
          <LetterMatching
            word={word}
            onComplete={handleGameComplete}
            onHintRequest={handleHintRequest}
          />
        )}

        {gameType === 'word-scramble' && (
          <WordScramble
            word={word}
            onComplete={handleGameComplete}
            onHintRequest={handleHintRequest}
          />
        )}

        {gameType === 'spelling-challenge' && (
          <SpellingChallenge
            word={word}
            onComplete={handleGameComplete}
            onHintRequest={handleHintRequest}
          />
        )}

        {gameType === 'word-building' && (
          <WordBuildingBlocks
            word={word}
            onComplete={handleGameComplete}
            onHintRequest={handleHintRequest}
          />
        )}

        {gameType === 'missing-letters' && (
          <MissingLetters
            word={word}
            onComplete={handleGameComplete}
            onHintRequest={handleHintRequest}
          />
        )}

        {gameType === 'letter-hunt' && (
          <LetterHunt
            word={word}
            onComplete={handleGameComplete}
            onHintRequest={handleHintRequest}
          />
        )}

        {gameType === 'picture-reveal' && (
          <PictureReveal
            word={word}
            onComplete={handleGameComplete}
            onHintRequest={handleHintRequest}
          />
        )}

        {gameType === 'trace-write' && (
          <TraceAndWrite
            word={word}
            onComplete={handleGameComplete}
            onHintRequest={handleHintRequest}
          />
        )}

        {gameType === 'definition-match' && (
          <DefinitionMatch
            word={word}
            onComplete={handleGameComplete}
            onHintRequest={handleHintRequest}
            extraWordInfo={extraWordInfo}
          />
        )}
      </div>
    </div>
  );
}
