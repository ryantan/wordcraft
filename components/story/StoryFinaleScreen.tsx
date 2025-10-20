/**
 * Story Finale Screen
 *
 * Displays story completion with session summary
 */

'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { WordStats } from '@/types/story'
import Confetti from 'react-confetti'
import { useState, useEffect } from 'react'

interface StoryFinaleScreenProps {
  finaleContent: {
    title: string
    narrative: string
    celebrationEmoji?: string
  } | null
  wordStats: Map<string, WordStats>
  onPlayAgain: () => void
}

export function StoryFinaleScreen({
  finaleContent,
  wordStats,
  onPlayAgain,
}: StoryFinaleScreenProps) {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(true)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  // Calculate summary stats
  const totalWords = wordStats.size
  const masteredWords = Array.from(wordStats.values()).filter(
    (stats) => stats.confidence >= 80
  ).length
  const averageConfidence =
    totalWords > 0
      ? Math.round(
          Array.from(wordStats.values()).reduce(
            (sum, stats) => sum + stats.confidence,
            0
          ) / totalWords
        )
      : 0

  if (!finaleContent) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-4">
      {showConfetti && <Confetti width={dimensions.width} height={dimensions.height} recycle={false} />}

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
          className="mb-8"
        >
          <p className="text-xl text-gray-700 leading-relaxed text-center">
            {finaleContent.narrative}
          </p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-green-50 rounded-xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-green-800 mb-4 text-center">
            Your Achievement
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">{totalWords}</div>
              <div className="text-sm text-gray-600">Words Practiced</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{masteredWords}</div>
              <div className="text-sm text-gray-600">Words Mastered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{averageConfidence}%</div>
              <div className="text-sm text-gray-600">Avg Confidence</div>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={onPlayAgain}
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-bold rounded-lg"
          >
            Play Again 🔄
          </Button>
          <Button
            onClick={() => router.push('/')}
            size="lg"
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-50 px-8 py-4 text-lg font-semibold rounded-lg"
          >
            Exit to Home 🏠
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
