/**
 * StoryIntroScreen Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StoryIntroScreen } from './StoryIntroScreen'

describe('StoryIntroScreen', () => {
  const mockIntroContent = {
    title: 'Space Adventure Awaits',
    narrative: 'Prepare for an exciting journey through the cosmos!',
    celebrationEmoji: '🚀',
  }

  describe('Rendering', () => {
    it('renders intro content correctly', () => {
      const mockOnStart = vi.fn()

      render(
        <StoryIntroScreen
          introContent={mockIntroContent}
          theme="space"
          onStart={mockOnStart}
        />
      )

      expect(screen.getByText('Space Adventure Awaits')).toBeInTheDocument()
      expect(screen.getByText('Prepare for an exciting journey through the cosmos!')).toBeInTheDocument()
    })

    it('displays celebration emoji', () => {
      const mockOnStart = vi.fn()

      render(
        <StoryIntroScreen
          introContent={mockIntroContent}
          theme="space"
          onStart={mockOnStart}
        />
      )

      expect(screen.getByText('🚀')).toBeInTheDocument()
    })

    it('displays default emoji when celebrationEmoji is not provided', () => {
      const mockOnStart = vi.fn()
      const contentWithoutEmoji = {
        title: 'Adventure',
        narrative: 'Let\'s begin!',
      }

      render(
        <StoryIntroScreen
          introContent={contentWithoutEmoji}
          theme="space"
          onStart={mockOnStart}
        />
      )

      // Default emoji should be 🚀
      expect(screen.getByText('🚀')).toBeInTheDocument()
    })

    it('displays theme correctly', () => {
      const mockOnStart = vi.fn()

      render(
        <StoryIntroScreen
          introContent={mockIntroContent}
          theme="treasure"
          onStart={mockOnStart}
        />
      )

      expect(screen.getByText('Theme: treasure')).toBeInTheDocument()
    })

    it('shows loading state when content is null', () => {
      const mockOnStart = vi.fn()

      render(
        <StoryIntroScreen
          introContent={null}
          theme="space"
          onStart={mockOnStart}
        />
      )

      expect(screen.getByText('Loading story...')).toBeInTheDocument()
      expect(screen.queryByText('Begin Adventure')).not.toBeInTheDocument()
    })

    it('renders Begin Adventure button', () => {
      const mockOnStart = vi.fn()

      render(
        <StoryIntroScreen
          introContent={mockIntroContent}
          theme="space"
          onStart={mockOnStart}
        />
      )

      const button = screen.getByRole('button', { name: /Begin Adventure/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onStart when Begin Adventure button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnStart = vi.fn()

      render(
        <StoryIntroScreen
          introContent={mockIntroContent}
          theme="space"
          onStart={mockOnStart}
        />
      )

      const button = screen.getByRole('button', { name: /Begin Adventure/i })
      await user.click(button)

      expect(mockOnStart).toHaveBeenCalledTimes(1)
    })

    it('does not render button in loading state', () => {
      const mockOnStart = vi.fn()

      render(
        <StoryIntroScreen
          introContent={null}
          theme="space"
          onStart={mockOnStart}
        />
      )

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const mockOnStart = vi.fn()

      render(
        <StoryIntroScreen
          introContent={mockIntroContent}
          theme="space"
          onStart={mockOnStart}
        />
      )

      // Check for heading
      const heading = screen.getByRole('heading', { name: 'Space Adventure Awaits' })
      expect(heading).toBeInTheDocument()

      // Check for button
      const button = screen.getByRole('button', { name: /Begin Adventure/i })
      expect(button).toBeInTheDocument()
    })

    it('button is keyboard accessible', async () => {
      const user = userEvent.setup()
      const mockOnStart = vi.fn()

      render(
        <StoryIntroScreen
          introContent={mockIntroContent}
          theme="space"
          onStart={mockOnStart}
        />
      )

      const button = screen.getByRole('button', { name: /Begin Adventure/i })
      button.focus()
      expect(button).toHaveFocus()

      // Simulate Enter key press
      await user.keyboard('{Enter}')
      expect(mockOnStart).toHaveBeenCalled()
    })
  })
})
