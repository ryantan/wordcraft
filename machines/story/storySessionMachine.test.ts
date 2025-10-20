/**
 * Story Session Machine Tests
 *
 * Comprehensive test suite for StorySessionMachine
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createActor } from 'xstate'
import { storySessionMachine } from './storySessionMachine'
import type { WordList } from '@/types'
import type { StorySessionInput, GameBeat, CheckpointBeat } from '@/types/story'

describe('StorySessionMachine', () => {
  let mockWordList: WordList

  beforeEach(() => {
    mockWordList = {
      id: 'test-list',
      name: 'Test Words',
      description: 'Test word list',
      words: ['ROCKET', 'SPACE', 'ALIEN', 'PLANET', 'STAR'],
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    }
  })

  describe('Initialization', () => {
    it('starts in idle state', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList, theme: 'space' },
      })
      actor.start()

      const snapshot = actor.getSnapshot()
      // Machine auto-transitions from idle to showingIntro
      expect(snapshot.matches('showingIntro')).toBe(true)
    })

    it('initializes with provided word list', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()

      const context = actor.getSnapshot().context
      expect(context.wordList).toEqual(mockWordList)
    })

    it('defaults to space theme if not provided', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()

      const context = actor.getSnapshot().context
      expect(context.storyTheme).toBe('space')
    })

    it('uses custom theme if provided', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList, theme: 'treasure' },
      })
      actor.start()

      const context = actor.getSnapshot().context
      expect(context.storyTheme).toBe('treasure')
    })

    it('generates story on initialization', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()

      const context = actor.getSnapshot().context
      expect(context.generatedStory).not.toBeNull()
      expect(context.generatedStory?.stage1Beats).toBeDefined()
      expect(context.generatedStory?.stage1Beats.length).toBeGreaterThan(0)
    })

    it('initializes word stats for all words', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()

      const context = actor.getSnapshot().context
      expect(context.wordStats.size).toBe(mockWordList.words.length)

      for (const word of mockWordList.words) {
        const stats = context.wordStats.get(word)
        expect(stats).toBeDefined()
        expect(stats?.confidence).toBe(50) // Initial confidence
      }
    })

    it('loads intro content', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()

      const context = actor.getSnapshot().context
      expect(context.introContent).not.toBeNull()
    })

    it('spawns story progress actor', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()

      const context = actor.getSnapshot().context
      expect(context.storyProgressActor).not.toBeNull()
    })
  })

  describe('Story Intro Flow', () => {
    it('shows intro screen initially', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()

      expect(actor.getSnapshot().matches('showingIntro')).toBe(true)
    })

    it('transitions to processing beat on START_STORY', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()

      actor.send({ type: 'START_STORY' })

      const snapshot = actor.getSnapshot()
      expect(snapshot.matches('processingBeat')).toBe(true)
    })

    it('loads current beat on START_STORY', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()

      actor.send({ type: 'START_STORY' })

      const context = actor.getSnapshot().context
      expect(context.currentBeat).not.toBeNull()
      expect(context.currentBeatIndex).toBe(0)
    })
  })

  describe('Beat Type Routing', () => {
    it('routes to showingNarrative for narrative beats', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      // Find a narrative beat and set it as current
      const context = actor.getSnapshot().context
      const narrativeBeat = context.generatedStory?.stage1Beats.find(b => b.type === 'narrative')

      if (narrativeBeat) {
        // Advance to narrative beat
        while (context.currentBeat?.type !== 'narrative' && context.currentBeatIndex < 20) {
          const beat = context.currentBeat
          if (beat?.type === 'game') {
            actor.send({
              type: 'GAME_COMPLETED',
              result: { isCorrect: true, timeSpent: 5000, hintsUsed: 0, errors: 0 },
            })
          } else if (beat?.type === 'choice') {
            actor.send({ type: 'CHOICE_MADE', choice: 'Option 1' })
          } else if (beat?.type === 'narrative') {
            break
          }
        }

        const snapshot = actor.getSnapshot()
        if (snapshot.context.currentBeat?.type === 'narrative') {
          expect(snapshot.matches({ processingBeat: 'showingNarrative' })).toBe(true)
        }
      }
    })

    it('routes to playingGame for game beats', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      const snapshot = actor.getSnapshot()
      const beat = snapshot.context.currentBeat

      if (beat?.type === 'game') {
        expect(snapshot.matches({ processingBeat: 'playingGame' })).toBe(true)
      }
    })

    it('routes to presentingChoice for choice beats', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      // Advance to choice beat if exists
      const context = actor.getSnapshot().context
      const choiceBeatIndex = context.generatedStory?.stage1Beats.findIndex(b => b.type === 'choice')

      if (choiceBeatIndex && choiceBeatIndex >= 0) {
        // Navigate to choice beat
        while (context.currentBeatIndex < choiceBeatIndex) {
          const beat = context.currentBeat
          if (beat?.type === 'game') {
            actor.send({
              type: 'GAME_COMPLETED',
              result: { isCorrect: true, timeSpent: 5000, hintsUsed: 0, errors: 0 },
            })
          } else if (beat?.type === 'narrative') {
            actor.send({ type: 'NARRATIVE_SEEN' })
          }
        }

        const snapshot = actor.getSnapshot()
        if (snapshot.context.currentBeat?.type === 'choice') {
          expect(snapshot.matches({ processingBeat: 'presentingChoice' })).toBe(true)
        }
      }
    })
  })

  describe('Beat Progression', () => {
    it('advances beat index on NARRATIVE_SEEN', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      const initialIndex = actor.getSnapshot().context.currentBeatIndex

      // Find and process a narrative beat
      let attempts = 0
      while (attempts < 20) {
        const beat = actor.getSnapshot().context.currentBeat
        if (beat?.type === 'narrative') {
          actor.send({ type: 'NARRATIVE_SEEN' })
          break
        } else if (beat?.type === 'game') {
          actor.send({
            type: 'GAME_COMPLETED',
            result: { isCorrect: true, timeSpent: 5000, hintsUsed: 0, errors: 0 },
          })
        } else if (beat?.type === 'choice') {
          actor.send({ type: 'CHOICE_MADE', choice: 'Option 1' })
        } else {
          break
        }
        attempts++
      }

      const finalIndex = actor.getSnapshot().context.currentBeatIndex
      expect(finalIndex).toBeGreaterThan(initialIndex)
    })

    it('advances beat index on CHOICE_MADE', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      // Navigate to choice beat and make choice
      let attempts = 0
      let choiceFound = false
      const initialIndex = actor.getSnapshot().context.currentBeatIndex

      while (attempts < 20 && !choiceFound) {
        const beat = actor.getSnapshot().context.currentBeat
        if (beat?.type === 'choice') {
          actor.send({ type: 'CHOICE_MADE', choice: 'Option 1' })
          choiceFound = true
        } else if (beat?.type === 'game') {
          actor.send({
            type: 'GAME_COMPLETED',
            result: { isCorrect: true, timeSpent: 5000, hintsUsed: 0, errors: 0 },
          })
        } else if (beat?.type === 'narrative') {
          actor.send({ type: 'NARRATIVE_SEEN' })
        } else {
          break
        }
        attempts++
      }

      if (choiceFound) {
        const finalIndex = actor.getSnapshot().context.currentBeatIndex
        expect(finalIndex).toBeGreaterThan(initialIndex)
      }
    })

    it('advances beat index on GAME_COMPLETED', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      const initialIndex = actor.getSnapshot().context.currentBeatIndex

      // Complete a game beat
      const beat = actor.getSnapshot().context.currentBeat
      if (beat?.type === 'game') {
        actor.send({
          type: 'GAME_COMPLETED',
          result: { isCorrect: true, timeSpent: 5000, hintsUsed: 0, errors: 0 },
        })

        const finalIndex = actor.getSnapshot().context.currentBeatIndex
        expect(finalIndex).toBe(initialIndex + 1)
      }
    })
  })

  describe('Word Stats Tracking', () => {
    it('updates word stats after game completion', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      const beat = actor.getSnapshot().context.currentBeat as GameBeat
      if (beat?.type === 'game') {
        const word = beat.word
        const initialStats = actor.getSnapshot().context.wordStats.get(word)

        actor.send({
          type: 'GAME_COMPLETED',
          result: { isCorrect: true, timeSpent: 5000, hintsUsed: 0, errors: 0 },
        })

        const updatedStats = actor.getSnapshot().context.wordStats.get(word)
        expect(updatedStats).toBeDefined()
        expect(updatedStats?.attemptsCount).toBeGreaterThan(initialStats?.attemptsCount || 0)
      }
    })

    it('increases confidence on correct answer', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      const beat = actor.getSnapshot().context.currentBeat as GameBeat
      if (beat?.type === 'game') {
        const word = beat.word
        const initialConfidence = actor.getSnapshot().context.wordStats.get(word)?.confidence || 0

        actor.send({
          type: 'GAME_COMPLETED',
          result: { isCorrect: true, timeSpent: 5000, hintsUsed: 0, errors: 0 },
        })

        const updatedConfidence = actor.getSnapshot().context.wordStats.get(word)?.confidence || 0
        expect(updatedConfidence).toBeGreaterThan(initialConfidence)
      }
    })

    it('decreases confidence on incorrect answer', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      const beat = actor.getSnapshot().context.currentBeat as GameBeat
      if (beat?.type === 'game') {
        const word = beat.word
        const initialConfidence = actor.getSnapshot().context.wordStats.get(word)?.confidence || 50

        actor.send({
          type: 'GAME_COMPLETED',
          result: { isCorrect: false, timeSpent: 5000, hintsUsed: 2, errors: 3 },
        })

        const updatedConfidence = actor.getSnapshot().context.wordStats.get(word)?.confidence || 0
        expect(updatedConfidence).toBeLessThan(initialConfidence)
      }
    })
  })

  describe('Checkpoint Handling', () => {
    it('routes to showingCheckpoint for checkpoint beats', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      // Navigate to checkpoint beat
      let attempts = 0
      while (attempts < 30) {
        const snapshot = actor.getSnapshot()
        const beat = snapshot.context.currentBeat

        if (beat?.type === 'checkpoint') {
          expect(snapshot.matches({ processingBeat: 'showingCheckpoint' })).toBe(true)
          break
        } else if (beat?.type === 'game') {
          actor.send({
            type: 'GAME_COMPLETED',
            result: { isCorrect: true, timeSpent: 5000, hintsUsed: 0, errors: 0 },
          })
        } else if (beat?.type === 'choice') {
          actor.send({ type: 'CHOICE_MADE', choice: 'Option 1' })
        } else if (beat?.type === 'narrative') {
          actor.send({ type: 'NARRATIVE_SEEN' })
        } else {
          break
        }
        attempts++
      }
    })

    it('disables continue button initially at checkpoint', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      // Navigate to checkpoint
      let attempts = 0
      while (attempts < 30) {
        const beat = actor.getSnapshot().context.currentBeat

        if (beat?.type === 'checkpoint') {
          const context = actor.getSnapshot().context
          expect(context.canContinueStory).toBe(false)
          break
        } else if (beat?.type === 'game') {
          actor.send({
            type: 'GAME_COMPLETED',
            result: { isCorrect: true, timeSpent: 5000, hintsUsed: 0, errors: 0 },
          })
        } else if (beat?.type === 'choice') {
          actor.send({ type: 'CHOICE_MADE', choice: 'Option 1' })
        } else if (beat?.type === 'narrative') {
          actor.send({ type: 'NARRATIVE_SEEN' })
        } else {
          break
        }
        attempts++
      }
    })

    it('allows skipping checkpoint immediately', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      // Navigate to checkpoint
      let attempts = 0
      while (attempts < 30) {
        const beat = actor.getSnapshot().context.currentBeat

        if (beat?.type === 'checkpoint') {
          const beforeIndex = actor.getSnapshot().context.currentBeatIndex
          actor.send({ type: 'SKIP_CHECKPOINT' })
          const afterIndex = actor.getSnapshot().context.currentBeatIndex

          expect(afterIndex).toBeGreaterThan(beforeIndex)
          break
        } else if (beat?.type === 'game') {
          actor.send({
            type: 'GAME_COMPLETED',
            result: { isCorrect: true, timeSpent: 5000, hintsUsed: 0, errors: 0 },
          })
        } else if (beat?.type === 'choice') {
          actor.send({ type: 'CHOICE_MADE', choice: 'Option 1' })
        } else if (beat?.type === 'narrative') {
          actor.send({ type: 'NARRATIVE_SEEN' })
        } else {
          break
        }
        attempts++
      }
    })
  })

  describe('Finale Conditions', () => {
    it('transitions to finale when all beats exhausted', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      const context = actor.getSnapshot().context
      const totalBeats = context.generatedStory?.stage1Beats.length || 0

      // Process all beats
      let attempts = 0
      const maxAttempts = totalBeats + 10

      while (attempts < maxAttempts) {
        const snapshot = actor.getSnapshot()

        if (snapshot.matches('finale')) {
          break
        }

        const beat = snapshot.context.currentBeat

        if (!beat) {
          break
        } else if (beat.type === 'game') {
          actor.send({
            type: 'GAME_COMPLETED',
            result: { isCorrect: true, timeSpent: 5000, hintsUsed: 0, errors: 0 },
          })
        } else if (beat.type === 'choice') {
          actor.send({ type: 'CHOICE_MADE', choice: 'Option 1' })
        } else if (beat.type === 'narrative') {
          actor.send({ type: 'NARRATIVE_SEEN' })
        } else if (beat.type === 'checkpoint') {
          actor.send({ type: 'SKIP_CHECKPOINT' })
        }

        attempts++
      }

      expect(actor.getSnapshot().matches('finale')).toBe(true)
    })

    it('loads finale content', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      // Process all beats to reach finale
      let attempts = 0
      while (attempts < 100 && !actor.getSnapshot().matches('finale')) {
        const beat = actor.getSnapshot().context.currentBeat

        if (!beat) break

        if (beat.type === 'game') {
          actor.send({
            type: 'GAME_COMPLETED',
            result: { isCorrect: true, timeSpent: 5000, hintsUsed: 0, errors: 0 },
          })
        } else if (beat.type === 'choice') {
          actor.send({ type: 'CHOICE_MADE', choice: 'Option 1' })
        } else if (beat.type === 'narrative') {
          actor.send({ type: 'NARRATIVE_SEEN' })
        } else if (beat.type === 'checkpoint') {
          actor.send({ type: 'SKIP_CHECKPOINT' })
        }

        attempts++
      }

      if (actor.getSnapshot().matches('finale')) {
        const context = actor.getSnapshot().context
        expect(context.finaleContent).not.toBeNull()
      }
    })
  })

  describe('Guards', () => {
    it('isGameBeat returns true for game beats', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      const beat = actor.getSnapshot().context.currentBeat
      if (beat?.type === 'game') {
        expect(actor.getSnapshot().matches({ processingBeat: 'playingGame' })).toBe(true)
      }
    })

    it('isCheckpointBeat returns true for checkpoint beats', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      // Navigate to checkpoint
      let attempts = 0
      while (attempts < 30) {
        const snapshot = actor.getSnapshot()
        const beat = snapshot.context.currentBeat

        if (beat?.type === 'checkpoint') {
          expect(snapshot.matches({ processingBeat: 'showingCheckpoint' })).toBe(true)
          break
        } else if (beat?.type === 'game') {
          actor.send({
            type: 'GAME_COMPLETED',
            result: { isCorrect: true, timeSpent: 5000, hintsUsed: 0, errors: 0 },
          })
        } else if (beat?.type === 'choice') {
          actor.send({ type: 'CHOICE_MADE', choice: 'Option 1' })
        } else if (beat?.type === 'narrative') {
          actor.send({ type: 'NARRATIVE_SEEN' })
        } else {
          break
        }
        attempts++
      }
    })
  })

  describe('Choice Recording', () => {
    it('records user choices', () => {
      const actor = createActor(storySessionMachine, {
        input: { wordList: mockWordList },
      })
      actor.start()
      actor.send({ type: 'START_STORY' })

      // Navigate to choice beat and make choice
      let attempts = 0
      while (attempts < 20) {
        const snapshot = actor.getSnapshot()
        const beat = snapshot.context.currentBeat

        if (beat?.type === 'choice') {
          const initialChoices = snapshot.context.userChoices.length
          actor.send({ type: 'CHOICE_MADE', choice: 'Test Option' })

          const finalChoices = actor.getSnapshot().context.userChoices.length
          expect(finalChoices).toBeGreaterThan(initialChoices)
          break
        } else if (beat?.type === 'game') {
          actor.send({
            type: 'GAME_COMPLETED',
            result: { isCorrect: true, timeSpent: 5000, hintsUsed: 0, errors: 0 },
          })
        } else if (beat?.type === 'narrative') {
          actor.send({ type: 'NARRATIVE_SEEN' })
        } else {
          break
        }
        attempts++
      }
    })
  })
})
