/**
 * Choice Beat Screen
 *
 * Displays choice moments where user selects between two options
 */

'use client';

import { Button } from '@/components/ui/button';
import type { ChoiceBeat } from '@/types/story';
import { motion } from 'framer-motion';

interface ChoiceBeatScreenProps {
  choiceBeat: ChoiceBeat;
  onChoice: (choice: string) => void;
}

export function ChoiceBeatScreen({ choiceBeat, onChoice }: ChoiceBeatScreenProps) {
  const { narrative, question, options } = choiceBeat;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-amber-100 to-amber-200 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl w-full bg-white rounded-xl shadow-xl p-8"
      >
        {/* Narrative context */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-gray-700 mb-6 text-center"
        >
          {narrative}
        </motion.p>

        {/* Question */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-amber-800 mb-8 text-center"
        >
          {question}
        </motion.h2>

        {/* Choice buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option, index) => (
            <motion.div
              key={option}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Button
                onClick={() => onChoice(option)}
                size="lg"
                className="w-full h-auto py-6 px-4 text-lg font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-md transform transition hover:scale-105"
              >
                {option}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
