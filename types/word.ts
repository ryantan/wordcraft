/**
 * Word List Types
 * Core data structures for word list management
 */

export interface Word {
  id: string;
  text: string;
  addedAt: Date;
}

export interface WordList {
  id: string;
  name: string;
  description?: string;
  words: string[]; // Array of word strings for simplicity
  createdAt: Date;
  updatedAt: Date;
}

export interface WordListCreateInput {
  name: string;
  description?: string;
  words: string[];
}

export interface WordListUpdateInput {
  name?: string;
  description?: string;
  words?: string[];
}

export interface WordListSummary {
  id: string;
  name: string;
  description?: string;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type WordListSortBy = 'name' | 'createdAt' | 'updatedAt' | 'wordCount';
export type SortOrder = 'asc' | 'desc';
