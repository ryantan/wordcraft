/**
 * Story Intro Screen
 *
 * Displays story introduction before beginning the adventure
 */

'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface StoryIntroScreenProps {
  introContent: {
    title: string
    narrative: string
    celebrationEmoji?: string
  } | null
  theme: string
  wordListName: string
  onStart: () => void
  onSkip?: () => void
}

export function StoryIntroScreen({
  introContent,
  theme,
  wordListName,
  onStart,
  onSkip,
}: StoryIntroScreenProps) {
  if (!introContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading story...</p>
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-100 to-purple-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
          <div className="text-6xl mb-4">{introContent.celebrationEmoji || '🚀'}</div>
          <h1 className="text-4xl md:text-5xl font-bold text-purple-800 mb-2">
            {introContent.title}
          </h1>
        </motion.div>

        {/* Narrative */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <p className="text-xl text-gray-700 leading-relaxed text-center">
            {introContent.narrative}
          </p>
        </motion.div>

        {/* Word List Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <p className="text-lg text-purple-600 font-semibold text-center">
            Word List: &quot;{wordListName}&quot;
          </p>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <Button
            onClick={onStart}
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-xl font-bold rounded-xl shadow-lg transform transition hover:scale-105"
          >
            Begin Adventure 🎮
          </Button>
        </motion.div>

        {/* Theme indicator */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Theme: {theme}
        </div>
      </motion.div>

      {/* Skip Intro Button */}
      {onSkip && (
        <motion.button
          onClick={onSkip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-4 right-4 px-4 py-2 bg-gray-700/50 text-white text-sm rounded-lg hover:bg-gray-600/70 transition-colors backdrop-blur-sm"
        >
          Skip Intro →
        </motion.button>
      )}
    </div>
  )
}
