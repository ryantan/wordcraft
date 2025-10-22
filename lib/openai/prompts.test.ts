/**
 * OpenAI Prompts Tests
 */

import { describe, expect, it } from 'vitest';

import {
  generateCheckpointPrompt,
  generateChoiceBeatPrompt,
  generateGameBeatPrompt,
  generateNarrativeBeatPrompt,
  parseChoiceBeatResponse,
  parseGameBeatResponse,
  sanitizePromptInput,
  THEME_CONTEXTS,
} from './prompts';

describe('OpenAI Prompts', () => {
  describe('THEME_CONTEXTS', () => {
    it('should have all required themes', () => {
      const themes = ['space', 'treasure', 'fantasy', 'ocean', 'jungle'];
      themes.forEach(theme => {
        expect(THEME_CONTEXTS).toHaveProperty(theme);
        expect(THEME_CONTEXTS[theme as keyof typeof THEME_CONTEXTS]).toHaveProperty('setting');
        expect(THEME_CONTEXTS[theme as keyof typeof THEME_CONTEXTS]).toHaveProperty('elements');
        expect(
          THEME_CONTEXTS[theme as keyof typeof THEME_CONTEXTS].elements.length,
        ).toBeGreaterThan(0);
      });
    });
  });

  describe('generateNarrativeBeatPrompt', () => {
    it('should generate narrative prompt with theme context', () => {
      const prompt = generateNarrativeBeatPrompt('space', 'Previous context', 50);

      expect(prompt).toContain('space adventure');
      expect(prompt).toContain('50% complete');
      expect(prompt).toContain('Previous context');
      expect(prompt).toContain('rockets');
    });

    it('should include all required narrative instructions', () => {
      const prompt = generateNarrativeBeatPrompt('treasure', 'Context', 25);

      expect(prompt).toContain('2-3 sentences');
      expect(prompt).toContain('Advances the story');
      expect(prompt).toContain('Builds excitement');
      expect(prompt).toContain('encouraging and fun');
    });
  });

  describe('generateGameBeatPrompt', () => {
    it('should generate game prompt for specific word', () => {
      const prompt = generateGameBeatPrompt('fantasy', 'dragon', 'wordScramble', 'Context');

      expect(prompt).toContain('magical journey');
      expect(prompt).toContain('Word to practice: "dragon"');
      expect(prompt).toContain('Game type: wordScramble');
      expect(prompt).toContain('DRAGON');
    });

    it('should include game-specific instructions', () => {
      const prompt = generateGameBeatPrompt('ocean', 'whale', 'letterMatching', 'Context');

      expect(prompt).toContain('spelling challenge');
      expect(prompt).toContain('part of the adventure');
      expect(prompt).toContain('1-2 sentences');
      expect(prompt).toContain('exciting and encouraging');
    });
  });

  describe('generateChoiceBeatPrompt', () => {
    it('should generate choice prompt with options', () => {
      const prompt = generateChoiceBeatPrompt('jungle', 'Context', 5);

      expect(prompt).toContain('jungle');
      expect(prompt).toContain('Words remaining in adventure: 5');
      expect(prompt).toContain('Question:');
      expect(prompt).toContain('Option A:');
      expect(prompt).toContain('Option B:');
    });

    it('should request positive choices', () => {
      const prompt = generateChoiceBeatPrompt('space', 'Context', 10);

      expect(prompt).toContain('positive and lead to fun outcomes');
      expect(prompt).toContain('3-4 words each');
    });
  });

  describe('generateCheckpointPrompt', () => {
    it('should generate checkpoint celebration', () => {
      const prompt = generateCheckpointPrompt('treasure', 1, 5);

      expect(prompt).toContain('First milestone reached!');
      expect(prompt).toContain('Words mastered: 5');
      expect(prompt).toContain('Congratulates');
      expect(prompt).toContain('spelling achievements');
    });

    it('should reference theme-specific rewards', () => {
      const prompt = generateCheckpointPrompt('space', 2, 10);

      expect(prompt).toContain('planets');
      expect(prompt).toContain('Second milestone');
      expect(prompt).toContain('major accomplishment');
    });
  });

  describe('sanitizePromptInput', () => {
    it('should remove excessive newlines', () => {
      const input = 'Line 1\n\n\n\nLine 2';
      expect(sanitizePromptInput(input)).toBe('Line 1\n\nLine 2');
    });

    it('should remove angle brackets', () => {
      const input = 'Text with <script>alert("xss")</script> tags';
      expect(sanitizePromptInput(input)).toBe('Text with scriptalert("xss")/script tags');
    });

    it('should trim whitespace', () => {
      const input = '  Trimmed text  ';
      expect(sanitizePromptInput(input)).toBe('Trimmed text');
    });
  });

  describe('parseGameBeatResponse', () => {
    it('should parse game beat response', () => {
      const response = 'The spaceship displays "STAR" - spell it to continue!';
      const parsed = parseGameBeatResponse(response, 'star', 'letterMatching');

      expect(parsed.narrative).toBe(response);
    });

    it('should sanitize response', () => {
      const response = 'Text with <brackets> and\n\n\nextra lines';
      const parsed = parseGameBeatResponse(response, 'word', 'wordScramble');

      expect(parsed.narrative).toBe('Text with brackets and\n\nextra lines');
    });
  });

  describe('parseChoiceBeatResponse', () => {
    it('should parse formatted choice response', () => {
      const response = `Question: Which path to take?
Option A: Left tunnel
Option B: Right tunnel`;

      const parsed = parseChoiceBeatResponse(response);

      expect(parsed.question).toBe('Which path to take?');
      expect(parsed.options[0]).toBe('Left tunnel');
      expect(parsed.options[1]).toBe('Right tunnel');
    });

    it('should handle malformed response', () => {
      const response = 'Malformed response without proper format';
      const parsed = parseChoiceBeatResponse(response);

      expect(parsed.question).toBe('');
      expect(parsed.options[0]).toBe('');
      expect(parsed.options[1]).toBe('');
    });

    it('should sanitize parsed values', () => {
      const response = `Question: Path with <brackets>?
Option A: Go <left>
Option B: Go <right>`;

      const parsed = parseChoiceBeatResponse(response);

      expect(parsed.question).toBe('Path with brackets?');
      expect(parsed.options[0]).toBe('Go left');
      expect(parsed.options[1]).toBe('Go right');
    });
  });
});
