'use client'

import { type FC, useState, useEffect, useCallback } from 'react'
import type { GameMechanicProps } from '@/types'
import { Button } from '@/components/ui/button'

interface LetterBlock {
  letter: string
  id: string
  placed: boolean
}

interface Slot {
  index: number
  letter: string
  filled: boolean
  blockId: string | null
}

/**
 * Word Building Blocks Game
 * Player drags and drops letter tiles to construct the word
 */
export const WordBuildingBlocks: FC<GameMechanicProps> = ({
  word,
  onComplete,
  onHintRequest,
  difficulty = 'medium',
}) => {
  const [blocks, setBlocks] = useState<LetterBlock[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null)

  // Initialize blocks and slots
  useEffect(() => {
    const letters = word.replace(/\s/g, '').split('') // Remove spaces

    // Create slots for each letter
    const newSlots: Slot[] = letters.map((letter, index) => ({
      index,
      letter,
      filled: false,
      blockId: null,
    }))
    setSlots(newSlots)

    // Create letter blocks (shuffled)
    const newBlocks: LetterBlock[] = letters
      .map((letter, index) => ({
        letter,
        id: `block-${index}`,
        placed: false,
      }))
      .sort(() => Math.random() - 0.5)

    setBlocks(newBlocks)
  }, [word])

  const handleBlockClick = useCallback((blockId: string) => {
    const block = blocks.find(b => b.id === blockId)
    if (block && !block.placed) {
      setSelectedBlockId(blockId)
    }
  }, [blocks])

  const handleSlotClick = useCallback(
    (slotIndex: number) => {
      const slot = slots[slotIndex]

      // If slot is filled, return block to available blocks
      if (slot.filled && slot.blockId) {
        const newBlocks = blocks.map(b =>
          b.id === slot.blockId ? { ...b, placed: false } : b
        )
        const newSlots = slots.map(s =>
          s.index === slotIndex ? { ...s, filled: false, blockId: null } : s
        )
        setBlocks(newBlocks)
        setSlots(newSlots)
        return
      }

      // If a block is selected, place it in the slot
      if (selectedBlockId && !slot.filled) {
        const block = blocks.find(b => b.id === selectedBlockId)
        if (!block) return

        const newBlocks = blocks.map(b =>
          b.id === selectedBlockId ? { ...b, placed: true } : b
        )
        const newSlots = slots.map(s =>
          s.index === slotIndex ? { ...s, filled: true, blockId: selectedBlockId } : s
        )

        setBlocks(newBlocks)
        setSlots(newSlots)
        setSelectedBlockId(null)
      }
    },
    [blocks, slots, selectedBlockId]
  )

  const handleCheckAnswer = useCallback(() => {
    // Check if all slots are filled
    if (!slots.every(s => s.filled)) return

    // Check if letters match
    const userWord = slots
      .map(slot => {
        const block = blocks.find(b => b.id === slot.blockId)
        return block?.letter || ''
      })
      .join('')
      .toLowerCase()

    const correctWord = word.replace(/\s/g, '').toLowerCase()
    const correct = userWord === correctWord

    setAttempts(prev => prev + 1)
    setShowFeedback(correct ? 'correct' : 'incorrect')

    if (correct) {
      const timeMs = Date.now() - startTime

      setTimeout(() => {
        onComplete({
          word,
          correct: true,
          attempts: attempts + 1,
          timeMs,
          hintsUsed,
          mechanicId: 'word-building',
          completedAt: new Date(),
        })
      }, 1500)
    } else {
      setTimeout(() => {
        setShowFeedback(null)
      }, 2000)
    }
  }, [blocks, slots, word, attempts, hintsUsed, startTime, onComplete])

  const handleHint = useCallback(() => {
    if (!onHintRequest) return

    setHintsUsed(prev => prev + 1)
    onHintRequest()

    // Find first empty slot
    const emptySlotIndex = slots.findIndex(s => !s.filled)
    if (emptySlotIndex === -1) return

    const correctLetter = slots[emptySlotIndex].letter
    const correctBlock = blocks.find(b => !b.placed && b.letter === correctLetter)

    if (correctBlock) {
      // Auto-place the correct block
      const newBlocks = blocks.map(b =>
        b.id === correctBlock.id ? { ...b, placed: true } : b
      )
      const newSlots = slots.map(s =>
        s.index === emptySlotIndex ? { ...s, filled: true, blockId: correctBlock.id } : s
      )

      setBlocks(newBlocks)
      setSlots(newSlots)
      setSelectedBlockId(null)
    }
  }, [blocks, slots, onHintRequest])

  const handleClear = useCallback(() => {
    // Return all blocks to available
    const newBlocks = blocks.map(b => ({ ...b, placed: false }))
    const newSlots = slots.map(s => ({ ...s, filled: false, blockId: null }))

    setBlocks(newBlocks)
    setSlots(newSlots)
    setSelectedBlockId(null)
  }, [blocks, slots])

  const allFilled = slots.every(s => s.filled)

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Instructions */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Build the Word</h2>
          <p className="text-gray-600">
            {difficulty === 'easy'
              ? 'Click letter blocks to select, then click slots to place them'
              : 'Tap blocks then tap slots to build your word'}
          </p>
        </div>

        {/* Word Display - Slots */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-8 border-4 border-orange-300 min-h-[140px] flex items-center justify-center">
          <div className="flex flex-wrap gap-3 justify-center">
            {slots.map((slot) => {
              const block = blocks.find(b => b.id === slot.blockId)

              return (
                <button
                  key={slot.index}
                  onClick={() => handleSlotClick(slot.index)}
                  disabled={showFeedback !== null}
                  className={`w-20 h-20 text-3xl font-bold rounded-lg border-4 transition-all ${
                    slot.filled && block
                      ? 'bg-orange-200 border-orange-500 text-orange-900 hover:bg-orange-300 shadow-md'
                      : 'bg-white border-dashed border-orange-300 text-transparent hover:bg-orange-50'
                  } disabled:cursor-not-allowed`}
                >
                  {slot.filled && block ? block.letter.toUpperCase() : '_'}
                </button>
              )
            })}
          </div>
        </div>

        {/* Available Blocks */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-4 text-center">
            Letter Blocks:
          </p>
          <div className="flex flex-wrap gap-3 justify-center min-h-[100px]">
            {blocks
              .filter(b => !b.placed)
              .map((block) => (
                <button
                  key={block.id}
                  onClick={() => handleBlockClick(block.id)}
                  disabled={showFeedback !== null}
                  className={`w-20 h-20 text-3xl font-bold rounded-lg transition-all shadow-md ${
                    selectedBlockId === block.id
                      ? 'bg-primary-300 border-4 border-primary-700 text-primary-900 scale-110 shadow-lg'
                      : 'bg-gradient-to-br from-yellow-200 to-orange-200 border-2 border-orange-400 text-orange-900 hover:scale-105 active:scale-95'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {block.letter.toUpperCase()}
                </button>
              ))}
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div
            className={`p-4 rounded-lg text-center font-semibold animate-fade-in ${
              showFeedback === 'correct'
                ? 'bg-success-100 border-2 border-success-500 text-success-800'
                : 'bg-error-100 border-2 border-error-500 text-error-800'
            }`}
          >
            {showFeedback === 'correct'
              ? '🎉 Perfect! You built the word correctly!'
              : '❌ Not quite right. Try rearranging the blocks!'}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {onHintRequest && (
            <Button
              variant="outline"
              onClick={handleHint}
              disabled={allFilled || showFeedback !== null}
            >
              💡 Hint ({hintsUsed})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={slots.every(s => !s.filled) || showFeedback !== null}
          >
            Clear All
          </Button>
          <Button
            onClick={handleCheckAnswer}
            disabled={!allFilled || showFeedback !== null}
            size="lg"
          >
            Check Word
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-6 justify-center text-sm text-gray-600">
          <div>
            <span className="font-semibold">Placed:</span> {slots.filter(s => s.filled).length} / {slots.length}
          </div>
          <div>
            <span className="font-semibold">Attempts:</span> {attempts}
          </div>
          {onHintRequest && (
            <div>
              <span className="font-semibold">Hints:</span> {hintsUsed}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
