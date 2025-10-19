/**
 * Validation Utilities
 * Input validation for word lists and words
 */

const MAX_WORDS = 100
const MAX_WORD_LENGTH = 50
const MIN_WORD_LENGTH = 2
const MAX_LIST_NAME_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 500

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Validate a word
 */
export function validateWord(word: string): ValidationResult {
  const errors: ValidationError[] = []

  if (!word || word.trim().length === 0) {
    errors.push({
      field: 'word',
      message: 'Word cannot be empty',
    })
    return { valid: false, errors }
  }

  const trimmed = word.trim()

  if (trimmed.length < MIN_WORD_LENGTH) {
    errors.push({
      field: 'word',
      message: `Word must be at least ${MIN_WORD_LENGTH} characters`,
    })
  }

  if (trimmed.length > MAX_WORD_LENGTH) {
    errors.push({
      field: 'word',
      message: `Word cannot be longer than ${MAX_WORD_LENGTH} characters`,
    })
  }

  // Only allow letters, spaces, and common punctuation (apostrophes, hyphens)
  // Also prevent multiple consecutive spaces
  if (!/^[a-zA-Z' -]+$/.test(trimmed) || /\s{2,}/.test(trimmed)) {
    errors.push({
      field: 'word',
      message: trimmed.includes('  ')
        ? 'Word cannot contain multiple consecutive spaces'
        : 'Word can only contain letters, spaces, hyphens, and apostrophes',
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate a word list name
 */
export function validateWordListName(name: string): ValidationResult {
  const errors: ValidationError[] = []

  if (!name || name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Word list name is required',
    })
    return { valid: false, errors }
  }

  const trimmed = name.trim()

  if (trimmed.length > MAX_LIST_NAME_LENGTH) {
    errors.push({
      field: 'name',
      message: `Name cannot be longer than ${MAX_LIST_NAME_LENGTH} characters`,
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate description
 */
export function validateDescription(description?: string): ValidationResult {
  const errors: ValidationError[] = []

  if (description && description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push({
      field: 'description',
      message: `Description cannot be longer than ${MAX_DESCRIPTION_LENGTH} characters`,
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate array of words
 */
export function validateWords(words: string[]): ValidationResult {
  const errors: ValidationError[] = []

  if (words.length === 0) {
    errors.push({
      field: 'words',
      message: 'Word list must contain at least one word',
    })
    return { valid: false, errors }
  }

  if (words.length > MAX_WORDS) {
    errors.push({
      field: 'words',
      message: `Word list cannot contain more than ${MAX_WORDS} words`,
    })
  }

  // Validate each word
  const invalidWords: string[] = []
  const duplicates: string[] = []
  const seen = new Set<string>()

  words.forEach((word, index) => {
    const result = validateWord(word)
    if (!result.valid) {
      invalidWords.push(`Word ${index + 1}: ${result.errors[0].message}`)
    }

    const normalized = word.trim().toLowerCase()
    if (seen.has(normalized)) {
      duplicates.push(word)
    } else {
      seen.add(normalized)
    }
  })

  if (invalidWords.length > 0) {
    errors.push({
      field: 'words',
      message: invalidWords.join('; '),
    })
  }

  if (duplicates.length > 0) {
    errors.push({
      field: 'words',
      message: `Duplicate words found: ${duplicates.join(', ')}`,
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate complete word list input
 */
export function validateWordListInput(input: {
  name: string
  description?: string
  words: string[]
}): ValidationResult {
  const allErrors: ValidationError[] = []

  const nameResult = validateWordListName(input.name)
  allErrors.push(...nameResult.errors)

  const descResult = validateDescription(input.description)
  allErrors.push(...descResult.errors)

  const wordsResult = validateWords(input.words)
  allErrors.push(...wordsResult.errors)

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  }
}

/**
 * Get validation constants (useful for forms)
 */
export const VALIDATION_LIMITS = {
  MAX_WORDS,
  MAX_WORD_LENGTH,
  MIN_WORD_LENGTH,
  MAX_LIST_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} as const
