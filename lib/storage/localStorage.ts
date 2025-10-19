/**
 * LocalStorage Utilities
 * Simple key-value storage for word lists
 */

import type { WordList, WordListCreateInput, WordListUpdateInput } from '@/types'

const STORAGE_KEYS = {
  WORD_LISTS: 'wordcraft_word_lists',
  WORD_LIST_PREFIX: 'wordcraft_list_',
} as const

/**
 * Generate a unique ID for word lists
 */
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Get all word lists
 */
export function getAllWordLists(): WordList[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WORD_LISTS)
    if (!stored) return []

    const lists: WordList[] = JSON.parse(stored)

    // Convert date strings back to Date objects
    return lists.map(list => ({
      ...list,
      createdAt: new Date(list.createdAt),
      updatedAt: new Date(list.updatedAt),
    }))
  } catch (error) {
    console.error('Error loading word lists:', error)
    return []
  }
}

/**
 * Get a single word list by ID
 */
export function getWordList(id: string): WordList | null {
  if (typeof window === 'undefined') return null

  try {
    const lists = getAllWordLists()
    const list = lists.find(l => l.id === id)
    return list || null
  } catch (error) {
    console.error('Error loading word list:', error)
    return null
  }
}

/**
 * Create a new word list
 */
export function createWordList(input: WordListCreateInput): WordList {
  if (typeof window === 'undefined') {
    throw new Error('Cannot create word list: window is undefined')
  }

  const now = new Date()
  const newList: WordList = {
    id: generateId(),
    name: input.name.trim(),
    description: input.description?.trim(),
    words: input.words.map(w => w.trim()).filter(Boolean),
    createdAt: now,
    updatedAt: now,
  }

  const lists = getAllWordLists()
  lists.push(newList)

  localStorage.setItem(STORAGE_KEYS.WORD_LISTS, JSON.stringify(lists))

  return newList
}

/**
 * Update an existing word list
 */
export function updateWordList(id: string, updates: WordListUpdateInput): WordList | null {
  if (typeof window === 'undefined') {
    throw new Error('Cannot update word list: window is undefined')
  }

  const lists = getAllWordLists()
  const index = lists.findIndex(l => l.id === id)

  if (index === -1) return null

  const updatedList: WordList = {
    ...lists[index],
    ...(updates.name && { name: updates.name.trim() }),
    ...(updates.description !== undefined && { description: updates.description?.trim() }),
    ...(updates.words && { words: updates.words.map(w => w.trim()).filter(Boolean) }),
    updatedAt: new Date(),
  }

  lists[index] = updatedList
  localStorage.setItem(STORAGE_KEYS.WORD_LISTS, JSON.stringify(lists))

  return updatedList
}

/**
 * Delete a word list
 */
export function deleteWordList(id: string): boolean {
  if (typeof window === 'undefined') {
    throw new Error('Cannot delete word list: window is undefined')
  }

  const lists = getAllWordLists()
  const filtered = lists.filter(l => l.id !== id)

  if (filtered.length === lists.length) return false

  localStorage.setItem(STORAGE_KEYS.WORD_LISTS, JSON.stringify(filtered))
  return true
}

/**
 * Check if a word list name already exists
 */
export function wordListNameExists(name: string, excludeId?: string): boolean {
  const lists = getAllWordLists()
  const normalizedName = name.trim().toLowerCase()

  return lists.some(
    list => list.id !== excludeId && list.name.toLowerCase() === normalizedName
  )
}

/**
 * Clear all word lists (for testing/reset)
 */
export function clearAllWordLists(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.WORD_LISTS)
}
