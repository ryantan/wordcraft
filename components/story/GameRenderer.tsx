/**
 * Game Renderer
 *
 * Dynamically renders game components based on beat type
 */

'use client';

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
  const { word, gameType, narrative } = beat;
  const [startTime] = useState(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);

  const handleGameComplete = (result: GameResult) => {
    const timeSpent = Date.now() - startTime;
    const errors = Math.max(0, result.attempts - 1); // Attempts minus first try

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-indigo-200 p-4">
      {/* Narrative banner */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-lg text-center text-gray-700 font-medium">{narrative}</p>
        </div>
      </div>

      {/* Game component */}
      <div className="max-w-4xl mx-auto">
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
      </div>
    </div>
  );
}
