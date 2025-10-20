/**
 * StoryFinaleScreen Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StoryFinaleScreen } from './StoryFinaleScreen'
import type { WordStats } from '@/types/story'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock react-confetti
vi.mock('react-confetti', () => ({
  default: () => null,
}))

describe('StoryFinaleScreen', () => {
  const mockFinaleContent = {
    title: 'Mission Complete!',
    narrative: 'You have successfully completed your space adventure!',
    celebrationEmoji: '⭐',
  }

  beforeEach(() => {
    mockPush.mockClear()
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    })
  })

  describe('Rendering', () => {
    it('renders finale content correctly', () => {
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>()

      render(
        <StoryFinaleScreen
          finaleContent={mockFinaleContent}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      expect(screen.getByText('Mission Complete!')).toBeInTheDocument()
      expect(screen.getByText('You have successfully completed your space adventure!')).toBeInTheDocument()
    })

    it('displays celebration emoji', () => {
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>()

      render(
        <StoryFinaleScreen
          finaleContent={mockFinaleContent}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      expect(screen.getByText('⭐')).toBeInTheDocument()
    })

    it('displays default emoji when celebrationEmoji is not provided', () => {
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>()
      const contentWithoutEmoji = {
        title: 'Complete!',
        narrative: 'You did it!',
      }

      render(
        <StoryFinaleScreen
          finaleContent={contentWithoutEmoji}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      // Default emoji should be ⭐
      expect(screen.getByText('⭐')).toBeInTheDocument()
    })

    it('shows loading state when content is null', () => {
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>()

      render(
        <StoryFinaleScreen
          finaleContent={null}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>()

      render(
        <StoryFinaleScreen
          finaleContent={mockFinaleContent}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      expect(screen.getByRole('button', { name: /Play Again/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Exit to Home/i })).toBeInTheDocument()
    })
  })

  describe('Stats Calculation', () => {
    it('calculates total words correctly', () => {
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>([
        ['ROCKET', { word: 'ROCKET', attempts: 1, successes: 1, errors: 0, hintsUsed: 0, totalTimeSpent: 3000, lastAttemptTime: new Date(), confidence: 90 }],
        ['SPACE', { word: 'SPACE', attempts: 2, successes: 1, errors: 1, hintsUsed: 0, totalTimeSpent: 5000, lastAttemptTime: new Date(), confidence: 75 }],
        ['ALIEN', { word: 'ALIEN', attempts: 1, successes: 1, errors: 0, hintsUsed: 0, totalTimeSpent: 2000, lastAttemptTime: new Date(), confidence: 85 }],
      ])

      render(
        <StoryFinaleScreen
          finaleContent={mockFinaleContent}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      expect(screen.getByText('3')).toBeInTheDocument() // Total words
    })

    it('calculates mastered words correctly (confidence >= 80)', () => {
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>([
        ['ROCKET', { word: 'ROCKET', attempts: 1, successes: 1, errors: 0, hintsUsed: 0, totalTimeSpent: 3000, lastAttemptTime: new Date(), confidence: 90 }],
        ['SPACE', { word: 'SPACE', attempts: 2, successes: 1, errors: 1, hintsUsed: 0, totalTimeSpent: 5000, lastAttemptTime: new Date(), confidence: 75 }],
        ['ALIEN', { word: 'ALIEN', attempts: 1, successes: 1, errors: 0, hintsUsed: 0, totalTimeSpent: 2000, lastAttemptTime: new Date(), confidence: 85 }],
      ])

      render(
        <StoryFinaleScreen
          finaleContent={mockFinaleContent}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      // ROCKET (90) and ALIEN (85) are >= 80, so 2 mastered
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('calculates average confidence correctly', () => {
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>([
        ['ROCKET', { word: 'ROCKET', attempts: 1, successes: 1, errors: 0, hintsUsed: 0, totalTimeSpent: 3000, lastAttemptTime: new Date(), confidence: 90 }],
        ['SPACE', { word: 'SPACE', attempts: 2, successes: 1, errors: 1, hintsUsed: 0, totalTimeSpent: 5000, lastAttemptTime: new Date(), confidence: 60 }],
        ['ALIEN', { word: 'ALIEN', attempts: 1, successes: 1, errors: 0, hintsUsed: 0, totalTimeSpent: 2000, lastAttemptTime: new Date(), confidence: 75 }],
      ])

      render(
        <StoryFinaleScreen
          finaleContent={mockFinaleContent}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      // Average: (90 + 60 + 75) / 3 = 75
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('handles empty word stats', () => {
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>()

      render(
        <StoryFinaleScreen
          finaleContent={mockFinaleContent}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      // Check that all stat values are 0 (there are three 0s: total, mastered, and 0%)
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThanOrEqual(2) // At least total and mastered
      expect(screen.getByText('0%')).toBeInTheDocument() // Average confidence
    })

    it('displays stats labels correctly', () => {
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>()

      render(
        <StoryFinaleScreen
          finaleContent={mockFinaleContent}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      expect(screen.getByText('Words Practiced')).toBeInTheDocument()
      expect(screen.getByText('Words Mastered')).toBeInTheDocument()
      expect(screen.getByText('Avg Confidence')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onPlayAgain when Play Again button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>()

      render(
        <StoryFinaleScreen
          finaleContent={mockFinaleContent}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      const button = screen.getByRole('button', { name: /Play Again/i })
      await user.click(button)

      expect(mockOnPlayAgain).toHaveBeenCalledTimes(1)
    })

    it('navigates to home when Exit button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>()

      render(
        <StoryFinaleScreen
          finaleContent={mockFinaleContent}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      const button = screen.getByRole('button', { name: /Exit to Home/i })
      await user.click(button)

      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>()

      render(
        <StoryFinaleScreen
          finaleContent={mockFinaleContent}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      // Check for heading
      const heading = screen.getByRole('heading', { name: 'Mission Complete!' })
      expect(heading).toBeInTheDocument()

      // Check for buttons
      expect(screen.getByRole('button', { name: /Play Again/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Exit to Home/i })).toBeInTheDocument()
    })

    it('buttons are keyboard accessible', async () => {
      const user = userEvent.setup()
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>()

      render(
        <StoryFinaleScreen
          finaleContent={mockFinaleContent}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      const playAgainButton = screen.getByRole('button', { name: /Play Again/i })
      playAgainButton.focus()
      expect(playAgainButton).toHaveFocus()

      // Simulate Enter key press
      await user.keyboard('{Enter}')
      expect(mockOnPlayAgain).toHaveBeenCalled()
    })
  })

  describe('Summary Section', () => {
    it('displays "Your Achievement" heading', () => {
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>()

      render(
        <StoryFinaleScreen
          finaleContent={mockFinaleContent}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      expect(screen.getByRole('heading', { name: 'Your Achievement' })).toBeInTheDocument()
    })

    it('displays stats in grid layout', () => {
      const mockOnPlayAgain = vi.fn()
      const wordStats = new Map<string, WordStats>([
        ['WORD1', { word: 'WORD1', attempts: 1, successes: 1, errors: 0, hintsUsed: 0, totalTimeSpent: 1000, lastAttemptTime: new Date(), confidence: 85 }],
      ])

      render(
        <StoryFinaleScreen
          finaleContent={mockFinaleContent}
          wordStats={wordStats}
          onPlayAgain={mockOnPlayAgain}
        />
      )

      // All three stat categories should be present
      expect(screen.getByText('Words Practiced')).toBeInTheDocument()
      expect(screen.getByText('Words Mastered')).toBeInTheDocument()
      expect(screen.getByText('Avg Confidence')).toBeInTheDocument()
    })
  })
})
