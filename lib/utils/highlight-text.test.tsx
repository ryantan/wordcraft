import { describe, it, expect } from 'vitest';
import { highlightText } from './highlight-text';

describe('highlightText', () => {
  it('highlights single words correctly', () => {
    const result = highlightText('The cat sat on the mat', 'cat');
    expect(result.length).toBe(3);
    expect(result[0]).toBe('The ');
    expect(result[2]).toBe(' sat on the mat');
  });

  it('highlights multi-word phrases correctly', () => {
    const result = highlightText('She went red when she saw him', 'went red');
    expect(result.length).toBe(3);
    expect(result[0]).toBe('She ');
    expect(result[2]).toBe(' when she saw him');
  });

  it('is case-insensitive', () => {
    const result = highlightText('The CAT sat on the mat', 'cat');
    expect(result.length).toBe(3);
    expect(result[0]).toBe('The ');
    expect(result[2]).toBe(' sat on the mat');
  });

  it('only highlights complete word matches', () => {
    const result = highlightText('The cathedral is beautiful', 'cat');
    expect(result.length).toBe(1);
    expect(result[0]).toBe('The cathedral is beautiful');
  });

  it('handles empty strings gracefully', () => {
    expect(highlightText('', 'word')).toEqual(['']);
    expect(highlightText('text', '')).toEqual(['text']);
  });

  it('highlights multiple occurrences', () => {
    const result = highlightText('The cat chased another cat', 'cat');
    expect(result.length).toBe(5);
    expect(result[0]).toBe('The ');
    expect(result[2]).toBe(' chased another ');
  });
});