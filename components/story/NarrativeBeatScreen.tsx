/**
 * Narrative Beat Screen
 *
 * Displays pure narrative beats without interaction
 */

'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface NarrativeBeatScreenProps {
  narrative: string;
  onContinue: () => void;
}

export function NarrativeBeatScreen({ narrative, onContinue }: NarrativeBeatScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl w-full bg-white rounded-xl shadow-xl p-8"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl text-gray-800 leading-relaxed mb-8 text-center"
        >
          {narrative}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Button
            onClick={onContinue}
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-lg"
          >
            Continue →
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
