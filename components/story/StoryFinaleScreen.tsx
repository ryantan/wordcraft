/**
 * Story Finale Screen
 *
 * Displays story completion with session summary
 */

'use client';

import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/game/calculate-session-stats';
import type { SessionStats } from '@/types/session';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

interface StoryFinaleScreenProps {
  finaleContent: {
    title: string;
    narrative: string;
    celebrationEmoji?: string;
  } | null;
  wordListName: string;
  stats: SessionStats;
  onPlayAgain: () => void;
  onTryNewWords: () => void;
  onViewProgress: () => void;
}

export function StoryFinaleScreen({
  finaleContent,
  wordListName,
  stats,
  onPlayAgain,
  onTryNewWords,
  onViewProgress,
}: StoryFinaleScreenProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!finaleContent) {
    return <div>Loading...</div>;
  }

  // Hardcode for now.
  finaleContent.title = 'You saved the day!';
  finaleContent.narrative = "You're a true Word Champion! Ready for your next adventure?";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-4">
      {showConfetti && (
        <Confetti width={dimensions.width} height={dimensions.height} recycle={false} />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12"
      >
        {/* Title */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-center mb-6"
        >
          <div className="text-6xl mb-4">{finaleContent.celebrationEmoji || '⭐'}</div>
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-2">
            {finaleContent.title}
          </h1>
        </motion.div>

        {/* Narrative */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-4"
        >
          <p className="text-xl text-gray-700 leading-relaxed text-center">
            {finaleContent.narrative}
          </p>
        </motion.div>

        {/* Word List Name */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <p className="text-lg text-green-600 font-semibold text-center">
            Word List: &quot;{wordListName}&quot;
          </p>
        </motion.div>

        {/* Summary Stats - 5 stats in grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-green-50 rounded-xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-green-800 mb-4 text-center">Your Achievement</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">{stats.totalWords}</div>
              <div className="text-sm text-gray-600">Total Words</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{stats.wordsMastered}</div>
              <div className="text-sm text-gray-600">Mastered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{stats.gamesPlayed}</div>
              <div className="text-sm text-gray-600">Games Played</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{formatTime(stats.timeSpent)}</div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                {Math.round(stats.averageConfidence)}%
              </div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </div>
          </div>
        </motion.div>

        {/* Action buttons - now 3 buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={onPlayAgain}
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 text-lg font-bold rounded-lg"
          >
            Practice More 🔄
          </Button>
          <Button
            onClick={onTryNewWords}
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 text-lg font-bold rounded-lg"
          >
            Try New Words ✨
          </Button>
          <Button
            onClick={onViewProgress}
            size="lg"
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-50 px-6 py-4 text-lg font-semibold rounded-lg"
          >
            View Progress 📊
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
