/**
 * Tests for LetterHunt component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { LetterHunt } from './LetterHunt'

describe('LetterHunt', () => {
  const mockOnComplete = vi.fn()
  const mockOnHintRequest = vi.fn()

  const defaultProps = {
    word: 'hello',
    onComplete: mockOnComplete,
    onHintRequest: mockOnHintRequest,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with correct title and instructions', () => {
    render(<LetterHunt {...defaultProps} />)
    
    expect(screen.getByText('Find the Letters!')).toBeInTheDocument()
    expect(screen.getByText('Click the letters in order to spell the word')).toBeInTheDocument()
  })

  it('displays all letters from the word', () => {
    render(<LetterHunt {...defaultProps} />)
    
    // Should show H, E, L, L, O buttons
    expect(screen.getByText('H')).toBeInTheDocument()
    expect(screen.getByText('E')).toBeInTheDocument()
    expect(screen.getAllByText('L')).toHaveLength(2) // Two L's
    expect(screen.getByText('O')).toBeInTheDocument()
  })

  it('allows selecting any instance of repeated letters', async () => {
    render(<LetterHunt {...defaultProps} word="book" />)
    
    // Get all O buttons (there should be 2)
    const oButtons = screen.getAllByText('O')
    expect(oButtons).toHaveLength(2)
    
    // Click B first (correct)
    fireEvent.click(screen.getByText('B'))
    await waitFor(() => {
      expect(screen.getByText('✓ Great find!')).toBeInTheDocument()
    })
    
    // Now we need the first O. Click either O button - should work
    fireEvent.click(oButtons[1]) // Click the second O instance
    await waitFor(() => {
      expect(screen.getByText('✓ Great find!')).toBeInTheDocument()
    })
    
    // Now need another O - click the remaining O
    fireEvent.click(oButtons[0]) // Click first O instance 
    await waitFor(() => {
      expect(screen.getByText('✓ Great find!')).toBeInTheDocument()
    })
  })

  it('highlights target letters when hint is used', () => {
    render(<LetterHunt {...defaultProps} word="book" />)
    
    // Use hint
    const hintButton = screen.getByText(/💡 Hint/)
    fireEvent.click(hintButton)
    
    expect(mockOnHintRequest).toHaveBeenCalled()
    
    // B should be highlighted (first letter needed)
    const bButton = screen.getByText('B')
    expect(bButton).toHaveClass('bg-primary-200')
    expect(bButton).toHaveClass('border-primary-600')
  })

  it('shows wrong feedback for incorrect letter', async () => {
    render(<LetterHunt {...defaultProps} word="cat" />)
    
    // Click wrong letter (should click C first, but click A)
    fireEvent.click(screen.getByText('A'))
    
    await waitFor(() => {
      expect(screen.getByText('✗ Look for the next letter in the word!')).toBeInTheDocument()
    })
  })

  it('tracks wrong attempts correctly', async () => {
    render(<LetterHunt {...defaultProps} word="cat" />)
    
    // Click wrong letter
    fireEvent.click(screen.getByText('A'))
    
    await waitFor(() => {
      // Check that the wrong clicks counter shows 1
      const wrongClicksElement = screen.getByText('Wrong clicks:').parentElement
      expect(wrongClicksElement?.textContent).toContain('Wrong clicks: 1')
    })
  })
})