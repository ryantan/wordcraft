import type { ReactNode } from 'react';

/**
 * Highlights occurrences of a target word/phrase in text
 * @param text - The full text to search in
 * @param targetWord - The word or phrase to highlight
 * @param className - CSS classes to apply to highlighted text
 * @returns React nodes with highlighted text
 */
export function highlightText(
  text: string,
  targetWord: string,
  className: string = 'text-indigo-600 font-semibold'
): ReactNode[] {
  if (!text || !targetWord) return [text];

  // Escape special regex characters in the target word
  const escapedWord = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Create regex for case-insensitive word boundary matching
  // This will match the word as a complete word, not partial matches
  const regex = new RegExp(`\\b(${escapedWord})\\b`, 'gi');
  
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    // Check if this part matches the target word (case-insensitive)
    if (part.toLowerCase() === targetWord.toLowerCase()) {
      return (
        <span key={index} className={className}>
          {part}
        </span>
      );
    }
    return part;
  });
}