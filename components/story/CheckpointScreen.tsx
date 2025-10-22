/**
 * Checkpoint Screen Component
 *
 * Displays story checkpoints with character, background, narrative, and celebrations
 */

'use client';

import type { StoryCheckpoint } from '@/lib/story/content';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

export interface CheckpointScreenProps {
  checkpoint: StoryCheckpoint;
  backgroundImage: string;
  characterImage: string;
  onContinue: () => void;
  onSkip: () => void;
  canContinue: boolean;
}

/**
 * CheckpointScreen Component
 *
 * Full-screen overlay that appears between games to show story progression.
 * Features:
 * - Background environment image
 * - Animated character sprite
 * - Narrative text with title and emoji
 * - Confetti celebration
 * - Delayed continue button (3-5 seconds)
 * - Immediate skip option
 */
export function CheckpointScreen({
  checkpoint,
  backgroundImage,
  characterImage,
  onContinue,
  onSkip,
  canContinue,
}: CheckpointScreenProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Setup window size for confetti
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Stop confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Image */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            filter: 'brightness(0.8)', // Slightly darken background
          }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Overlay to improve text readability */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Confetti */}
        {showConfetti && windowSize.width > 0 && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
          />
        )}

        {/* Character Sprite */}
        <motion.img
          src={characterImage}
          alt="Character celebrating"
          className="absolute bottom-10 left-10 w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
          initial={{ x: -300, opacity: 0, rotate: -10 }}
          animate={{ x: 0, opacity: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            delay: 0.3,
            stiffness: 100,
            damping: 10,
          }}
        />

        {/* Narrative Box */}
        <motion.div
          className="relative z-10 max-w-2xl mx-4 md:mx-auto p-6 md:p-8 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-purple-200"
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        >
          <div className="text-center">
            {/* Celebration Emoji */}
            <motion.div
              className="text-6xl md:text-7xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.7,
                type: 'spring',
                stiffness: 300,
                damping: 10,
              }}
            >
              {checkpoint.celebrationEmoji || '⭐'}
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4 text-purple-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {checkpoint.title}
            </motion.h2>

            {/* Narrative Text */}
            <motion.p
              className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {checkpoint.narrative}
            </motion.p>

            {/* Buttons */}
            <motion.div
              className="flex gap-4 justify-center items-center flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {/* Skip Button */}
              <button
                onClick={onSkip}
                className="px-6 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
                aria-label="Skip checkpoint"
              >
                Skip
              </button>

              {/* Continue Button */}
              <motion.button
                onClick={onContinue}
                disabled={!canContinue}
                className={`px-8 py-3 rounded-xl font-bold text-white text-lg transition-all shadow-lg ${
                  canContinue
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 cursor-pointer'
                    : 'bg-gray-400 cursor-not-allowed opacity-60'
                }`}
                animate={
                  canContinue
                    ? {
                        scale: [1, 1.05, 1],
                      }
                    : {}
                }
                transition={{
                  repeat: canContinue ? Infinity : 0,
                  duration: 1.5,
                  ease: 'easeInOut',
                }}
                whileHover={canContinue ? { scale: 1.05 } : {}}
                whileTap={canContinue ? { scale: 0.95 } : {}}
                aria-label="Continue to next game"
              >
                {canContinue ? 'Continue Adventure' : 'Loading...'}
              </motion.button>
            </motion.div>

            {/* Timer Hint (when button is disabled) */}
            {!canContinue && (
              <motion.p
                className="text-sm text-gray-500 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Take a moment to celebrate your progress!
              </motion.p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
