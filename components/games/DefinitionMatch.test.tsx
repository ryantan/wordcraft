/**
 * Tests for DefinitionMatch component
 */

import type { WordInfo } from '@/lib/openai/word-info/schema';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DefinitionMatch } from './DefinitionMatch';

describe('DefinitionMatch', () => {
  const mockOnComplete = vi.fn();
  const mockOnHintRequest = vi.fn();

  const defaultProps = {
    word: 'cat',
    onComplete: mockOnComplete,
    onHintRequest: mockOnHintRequest,
  };

  const mockExtraWordInfo: WordInfo = {
    meaning: 'A small domesticated carnivorous mammal',
    hint: 'A furry pet that says meow',
    similar_words: ['bat', 'rat', 'mat', 'hat'],
    difficulty: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with definition from extraWordInfo', () => {
    render(<DefinitionMatch {...defaultProps} extraWordInfo={mockExtraWordInfo} />);

    expect(screen.getByText('Match the Definition')).toBeInTheDocument();
    expect(screen.getByText(mockExtraWordInfo.hint)).toBeInTheDocument();
  });

  it('renders with fallback text when no extraWordInfo provided', () => {
    render(<DefinitionMatch {...defaultProps} />);

    expect(screen.getByText('Select the correct word')).toBeInTheDocument();
  });

  it('displays word options from similar words', () => {
    render(<DefinitionMatch {...defaultProps} extraWordInfo={mockExtraWordInfo} />);

    // Should show the correct word
    expect(screen.getByText('cat')).toBeInTheDocument();

    // Should show some similar words (limited by difficulty)
    const buttons = screen.getAllByRole('button');
    const wordButtons = buttons.filter(
      btn =>
        mockExtraWordInfo.similar_words.includes(btn.textContent || '') ||
        btn.textContent === 'cat',
    );
    expect(wordButtons.length).toBeGreaterThan(1);
  });

  it('allows selecting an option', () => {
    render(<DefinitionMatch {...defaultProps} extraWordInfo={mockExtraWordInfo} />);

    const catButton = screen.getByText('cat');
    fireEvent.click(catButton);

    // Button should show selected state
    expect(catButton).toHaveClass('border-primary-600');
  });

  it('shows success feedback for correct answer', async () => {
    render(<DefinitionMatch {...defaultProps} extraWordInfo={mockExtraWordInfo} />);

    const catButton = screen.getByText('cat');
    fireEvent.click(catButton);

    const checkButton = screen.getByText('Check Answer');
    fireEvent.click(checkButton);

    expect(screen.getByText('🎉 Correct! Great job!')).toBeInTheDocument();

    await waitFor(
      () => {
        expect(mockOnComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            word: 'cat',
            correct: true,
            attempts: 1,
            hintsUsed: 0,
            mechanicId: 'definition-match',
          }),
        );
      },
      { timeout: 2000 },
    );
  });

  it('shows error feedback for incorrect answer', async () => {
    render(<DefinitionMatch {...defaultProps} extraWordInfo={mockExtraWordInfo} />);

    // Find a button that isn't 'cat' (the correct answer)
    const buttons = screen.getAllByRole('button');
    const wordButtons = buttons.filter(
      btn =>
        mockExtraWordInfo.similar_words.includes(btn.textContent || '') ||
        btn.textContent === 'cat',
    );
    const wrongButton = wordButtons.find(btn => btn.textContent !== 'cat');

    if (wrongButton) {
      fireEvent.click(wrongButton);

      const checkButton = screen.getByText('Check Answer');
      fireEvent.click(checkButton);

      expect(screen.getByText('❌ Not quite! Try again.')).toBeInTheDocument();

      // Should not call onComplete for wrong answer
      await waitFor(
        () => {
          expect(mockOnComplete).not.toHaveBeenCalled();
        },
        { timeout: 1000 },
      );
    }
  });

  it('eliminates incorrect options with hints', () => {
    render(<DefinitionMatch {...defaultProps} extraWordInfo={mockExtraWordInfo} />);

    const hintButton = screen.getByText(/💡 Hint/);
    fireEvent.click(hintButton);

    expect(mockOnHintRequest).toHaveBeenCalled();

    // At least one option should be eliminated (crossed out)
    const buttons = screen.getAllByRole('button');
    const eliminatedButton = buttons.find(btn => btn.classList.contains('line-through'));
    expect(eliminatedButton).toBeDefined();
  });

  it('disables hint button when only correct option remains', () => {
    render(<DefinitionMatch {...defaultProps} extraWordInfo={mockExtraWordInfo} />);

    const hintButton = screen.getByText(/💡 Hint/);

    // Click hints until disabled
    while (!hintButton.hasAttribute('disabled')) {
      fireEvent.click(hintButton);
    }

    expect(hintButton).toBeDisabled();
  });

  it('handles difficulty levels correctly', () => {
    // Easy mode - fewer options
    const { rerender } = render(
      <DefinitionMatch {...defaultProps} difficulty="easy" extraWordInfo={mockExtraWordInfo} />,
    );
    let wordButtons = screen
      .getAllByRole('button')
      .filter(btn => ['cat', 'bat', 'rat', 'mat', 'hat'].includes(btn.textContent || ''));
    expect(wordButtons.length).toBeLessThanOrEqual(3);

    // Hard mode - more options
    rerender(
      <DefinitionMatch {...defaultProps} difficulty="hard" extraWordInfo={mockExtraWordInfo} />,
    );
    wordButtons = screen
      .getAllByRole('button')
      .filter(btn => ['cat', 'bat', 'rat', 'mat', 'hat'].includes(btn.textContent || ''));
    expect(wordButtons.length).toBeLessThanOrEqual(5);
  });

  it('tracks attempts correctly', async () => {
    render(<DefinitionMatch {...defaultProps} extraWordInfo={mockExtraWordInfo} />);

    // Find a wrong answer button
    const buttons = screen.getAllByRole('button');
    const wordButtons = buttons.filter(
      btn =>
        mockExtraWordInfo.similar_words.includes(btn.textContent || '') ||
        btn.textContent === 'cat',
    );
    const wrongButton = wordButtons.find(btn => btn.textContent !== 'cat');

    if (wrongButton) {
      fireEvent.click(wrongButton);
      fireEvent.click(screen.getByText('Check Answer'));

      // Wait for feedback to appear
      await waitFor(() => {
        expect(screen.getByText('❌ Not quite! Try again.')).toBeInTheDocument();
      });

      // Wait for attempts to update
      await waitFor(() => {
        const attemptsElement = screen.getByText(/Attempts:/).parentElement;
        expect(attemptsElement?.textContent).toContain('Attempts: 1');
      });
    }
  });

  it('prevents interaction when showing feedback', async () => {
    render(<DefinitionMatch {...defaultProps} extraWordInfo={mockExtraWordInfo} />);

    // Find and click a wrong answer
    const buttons = screen.getAllByRole('button');
    const wordButtons = buttons.filter(
      btn =>
        mockExtraWordInfo.similar_words.includes(btn.textContent || '') ||
        btn.textContent === 'cat',
    );
    const wrongButton = wordButtons.find(btn => btn.textContent !== 'cat');

    if (wrongButton) {
      fireEvent.click(wrongButton);
      fireEvent.click(screen.getByText('Check Answer'));

      // Wait for feedback to appear
      await waitFor(() => {
        expect(screen.getByText('❌ Not quite! Try again.')).toBeInTheDocument();
      });

      // Try to click the correct option while feedback is showing
      const catButton = screen.getByText('cat');
      fireEvent.click(catButton);

      // Should not change selection during feedback
      expect(catButton).not.toHaveClass('border-primary-600');
    }
  });
});
