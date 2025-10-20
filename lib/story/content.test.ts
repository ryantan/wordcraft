/**
 * Story Content Tests
 *
 * Tests for story narrative content and helper functions
 */

import { describe, it, expect } from 'vitest'
import {
  STORY_THEMES,
  getStoryContent,
  getCheckpointNarrative,
  interpolateContent,
  getCheckpointContent,
  getIntroContent,
  getFinaleContent,
  type StoryThemeContent,
} from './content'

describe('Story Content', () => {
  describe('STORY_THEMES', () => {
    it('includes space theme', () => {
      expect(STORY_THEMES.space).toBeDefined()
      expect(STORY_THEMES.space.themeName).toBe('Space Adventure')
    })

    it('includes treasure theme', () => {
      expect(STORY_THEMES.treasure).toBeDefined()
      expect(STORY_THEMES.treasure.themeName).toBe('Treasure Hunt')
    })

    it('includes fantasy theme', () => {
      expect(STORY_THEMES.fantasy).toBeDefined()
      expect(STORY_THEMES.fantasy.themeName).toBe('Fantasy Quest')
    })

    it('all themes have required structure', () => {
      Object.values(STORY_THEMES).forEach((theme: StoryThemeContent) => {
        expect(theme.themeName).toBeTruthy()
        expect(theme.intro).toBeDefined()
        expect(theme.intro.id).toBe('intro')
        expect(theme.intro.narrative).toBeTruthy()
        expect(theme.checkpoints).toHaveLength(3)
        expect(theme.finale).toBeDefined()
        expect(theme.finale.id).toBe('finale')
      })
    })

    it('all checkpoints have required fields', () => {
      Object.values(STORY_THEMES).forEach((theme: StoryThemeContent) => {
        theme.checkpoints.forEach((checkpoint, index) => {
          expect(checkpoint.id).toBe(`checkpoint${index + 1}`)
          expect(checkpoint.title).toBeTruthy()
          expect(checkpoint.narrative).toBeTruthy()
          expect(checkpoint.narrative.length).toBeGreaterThan(0)
        })
      })
    })

    it('narratives are concise and age-appropriate', () => {
      Object.values(STORY_THEMES).forEach((theme: StoryThemeContent) => {
        // Narratives should be concise (under 250 characters for readability)
        expect(theme.intro.narrative.length).toBeLessThan(250)
        expect(theme.finale.narrative.length).toBeLessThan(300) // Finale can be slightly longer

        theme.checkpoints.forEach((checkpoint) => {
          expect(checkpoint.narrative.length).toBeLessThan(250)
        })
      })
    })
  })

  describe('getStoryContent', () => {
    it('returns space theme by default', () => {
      const content = getStoryContent()
      expect(content.themeName).toBe('Space Adventure')
    })

    it('returns requested theme', () => {
      const content = getStoryContent('treasure')
      expect(content.themeName).toBe('Treasure Hunt')
    })

    it('returns space theme for unknown theme', () => {
      const content = getStoryContent('nonexistent')
      expect(content.themeName).toBe('Space Adventure')
    })

    it('returns correct intro for theme', () => {
      const spaceContent = getStoryContent('space')
      expect(spaceContent.intro.title).toBe('Begin Your Journey')

      const treasureContent = getStoryContent('treasure')
      expect(treasureContent.intro.title).toBe('The Adventure Begins')
    })
  })

  describe('getCheckpointNarrative', () => {
    it('returns correct checkpoint narrative', () => {
      const narrative = getCheckpointNarrative('space', 0)
      expect(narrative).toContain('Moon')
      expect(narrative.length).toBeGreaterThan(0)
    })

    it('returns narrative for all checkpoints', () => {
      for (let i = 0; i < 3; i++) {
        const narrative = getCheckpointNarrative('space', i)
        expect(narrative).toBeTruthy()
        expect(typeof narrative).toBe('string')
      }
    })

    it('returns empty string for invalid checkpoint index', () => {
      expect(getCheckpointNarrative('space', -1)).toBe('')
      expect(getCheckpointNarrative('space', 99)).toBe('')
    })

    it('returns correct narrative for different themes', () => {
      const spaceNarrative = getCheckpointNarrative('space', 0)
      const treasureNarrative = getCheckpointNarrative('treasure', 0)

      expect(spaceNarrative).not.toBe(treasureNarrative)
      expect(spaceNarrative).toContain('Moon')
      expect(treasureNarrative).toContain('beach')
    })
  })

  describe('interpolateContent', () => {
    it('replaces single variable', () => {
      const template = 'You have {wordCount} words!'
      const result = interpolateContent(template, { wordCount: 10 })
      expect(result).toBe('You have 10 words!')
    })

    it('replaces multiple variables', () => {
      const template = '{name} has {wordCount} words at checkpoint {checkpoint}!'
      const result = interpolateContent(template, {
        name: 'Player',
        wordCount: 5,
        checkpoint: 1,
      })
      expect(result).toBe('Player has 5 words at checkpoint 1!')
    })

    it('handles missing variables by keeping placeholder', () => {
      const template = 'You have {wordCount} words!'
      const result = interpolateContent(template, {})
      expect(result).toBe('You have {wordCount} words!')
    })

    it('handles text without variables', () => {
      const template = 'No variables here!'
      const result = interpolateContent(template, { wordCount: 10 })
      expect(result).toBe('No variables here!')
    })

    it('converts numbers to strings', () => {
      const template = 'Checkpoint {num}'
      const result = interpolateContent(template, { num: 42 })
      expect(result).toBe('Checkpoint 42')
    })
  })

  describe('getCheckpointContent', () => {
    it('returns checkpoint with interpolated narrative', () => {
      const checkpoint = getCheckpointContent('space', 1, { wordCount: 10 })
      expect(checkpoint).toBeDefined()
      expect(checkpoint?.narrative).toContain('10')
    })

    it('returns null for invalid index', () => {
      expect(getCheckpointContent('space', -1)).toBeNull()
      expect(getCheckpointContent('space', 99)).toBeNull()
    })

    it('includes all checkpoint fields', () => {
      const checkpoint = getCheckpointContent('space', 0)
      expect(checkpoint).toBeDefined()
      expect(checkpoint?.id).toBe('checkpoint1')
      expect(checkpoint?.title).toBeTruthy()
      expect(checkpoint?.narrative).toBeTruthy()
      expect(checkpoint?.celebrationEmoji).toBeTruthy()
    })

    it('interpolates variables correctly', () => {
      const checkpoint = getCheckpointContent('treasure', 1, { wordCount: 15 })
      expect(checkpoint?.narrative).toContain('15')
    })
  })

  describe('getIntroContent', () => {
    it('returns intro content for theme', () => {
      const intro = getIntroContent('space')
      expect(intro.id).toBe('intro')
      expect(intro.title).toBe('Begin Your Journey')
      expect(intro.narrative).toContain('Space Explorer')
    })

    it('interpolates variables in intro', () => {
      const intro = getIntroContent('space', { playerName: 'Alex' })
      // Space intro doesn't have playerName template, but should handle gracefully
      expect(intro.narrative).toBeTruthy()
    })

    it('returns different content for different themes', () => {
      const spaceIntro = getIntroContent('space')
      const treasureIntro = getIntroContent('treasure')

      expect(spaceIntro.narrative).not.toBe(treasureIntro.narrative)
    })
  })

  describe('getFinaleContent', () => {
    it('returns finale content for theme', () => {
      const finale = getFinaleContent('space')
      expect(finale.id).toBe('finale')
      expect(finale.title).toBe('Mission Complete')
      expect(finale.narrative).toContain('Word Champion')
    })

    it('interpolates variables in finale', () => {
      const finale = getFinaleContent('space', { totalWords: 20 })
      // Finale doesn't have totalWords template by default, but should handle gracefully
      expect(finale.narrative).toBeTruthy()
    })

    it('returns different content for different themes', () => {
      const spaceFinale = getFinaleContent('space')
      const fantasyFinale = getFinaleContent('fantasy')

      expect(spaceFinale.narrative).not.toBe(fantasyFinale.narrative)
      expect(fantasyFinale.narrative).toContain('kingdom')
    })
  })

  describe('Gender-neutral language check', () => {
    const genderSpecificPronouns = ['he', 'she', 'him', 'her', 'his', 'hers']

    it('intro narratives use gender-neutral language', () => {
      Object.values(STORY_THEMES).forEach((theme) => {
        const narrative = theme.intro.narrative.toLowerCase()
        genderSpecificPronouns.forEach((pronoun) => {
          // Check for pronoun as whole word, not as part of other words
          const regex = new RegExp(`\\b${pronoun}\\b`, 'i')
          expect(regex.test(narrative)).toBe(false)
        })
      })
    })

    it('checkpoint narratives use gender-neutral language', () => {
      Object.values(STORY_THEMES).forEach((theme) => {
        theme.checkpoints.forEach((checkpoint) => {
          const narrative = checkpoint.narrative.toLowerCase()
          genderSpecificPronouns.forEach((pronoun) => {
            const regex = new RegExp(`\\b${pronoun}\\b`, 'i')
            expect(regex.test(narrative)).toBe(false)
          })
        })
      })
    })

    it('finale narratives use gender-neutral language', () => {
      Object.values(STORY_THEMES).forEach((theme) => {
        const narrative = theme.finale.narrative.toLowerCase()
        genderSpecificPronouns.forEach((pronoun) => {
          const regex = new RegExp(`\\b${pronoun}\\b`, 'i')
          expect(regex.test(narrative)).toBe(false)
        })
      })
    })
  })

  describe('Positive tone check', () => {
    const positiveWords = ['amazing', 'incredible', 'fantastic', 'brilliant', 'well done', 'unstoppable', 'complete', 'champion', 'hero', 'great', 'excellent', 'wonderful', 'marvelous', 'magnificent', 'extraordinary', 'terrific', 'superb', 'outstanding', 'remarkable']

    it('checkpoint narratives include positive or encouraging language', () => {
      Object.values(STORY_THEMES).forEach((theme) => {
        theme.checkpoints.forEach((checkpoint) => {
          const narrative = checkpoint.narrative.toLowerCase()
          // Check for positive words OR exclamation marks (indicating enthusiasm)
          const hasPositiveWord = positiveWords.some((word) =>
            narrative.includes(word.toLowerCase())
          )
          const hasExclamation = narrative.includes('!')

          // Should have either positive words or exclamation marks
          expect(hasPositiveWord || hasExclamation).toBe(true)
        })
      })
    })

    it('finale narratives celebrate accomplishment', () => {
      Object.values(STORY_THEMES).forEach((theme) => {
        const narrative = theme.finale.narrative.toLowerCase()
        const hasPositiveWord = positiveWords.some((word) =>
          narrative.includes(word.toLowerCase())
        )
        expect(hasPositiveWord).toBe(true)
      })
    })
  })
})
