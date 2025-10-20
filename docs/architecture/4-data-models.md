# 4. Data Models

## Important Note on Terminology

**The term "word" throughout this architecture encompasses both single words ("cat") and multi-word phrases ("went red", "ice cream"). Game mechanics handle both cases appropriately.**

## Core Type Definitions

**WordList Model:**

```typescript
// types/word.ts
export interface WordList {
  id: string                    // Unique identifier
  name: string                  // Display name (e.g., "Grade 2 Spelling")
  description?: string          // Optional description
  words: string[]               // Array of words/phrases (can include spaces)
  createdAt: Date              // Creation timestamp
  updatedAt: Date              // Last modification timestamp
}

export interface WordListCreateInput {
  name: string
  description?: string
  words: string[]
}

export interface WordListUpdateInput {
  name?: string
  description?: string
  words?: string[]
}
```

**Validation Rules:**
- `name`: Required, trimmed, 1-100 characters
- `words`: Array of strings matching `/^[a-zA-Z\s]+$/` (letters and spaces only)
- Duplicate word list names not allowed

**GameResult Model:**

```typescript
// types/game.ts
export interface GameResult {
  id: string                    // Unique result ID
  wordListId: string           // Reference to WordList
  word: string                 // The word practiced (can be phrase)
  gameMechanicId: GameMechanicId
  difficulty: 'easy' | 'medium' | 'hard'
  correct: boolean             // Did user answer correctly?
  attempts: number             // Number of attempts made
  hintsUsed: number            // Number of hints requested
  timeSpent: number            // Milliseconds spent on question
  completedAt: Date            // When the question was completed
}
```

**GameMechanic Model:**

```typescript
// types/game.ts
export type GameMechanicId =
  | 'letter-matching'
  | 'word-scramble'
  | 'spelling-challenge'
  | 'letter-hunt'
  | 'picture-reveal'
  | 'word-building'
  | 'trace-write'
  | 'missing-letters'

export interface GameMechanic {
  id: GameMechanicId
  name: string                 // Display name
  description: string          // Short description
  icon: string                 // Icon identifier
  learningStyles: LearningStyle[]  // Which learning styles this game targets
  component: React.ComponentType<GameMechanicProps>
}
```

**Confidence Scoring Model:**

```typescript
// types/confidence.ts
export interface WordConfidenceData {
  word: string
  confidence: number           // 0-100 percentage
  lastPracticed: Date
  totalAttempts: number
  successfulAttempts: number
  streak: number              // Consecutive correct answers
  nextReviewDate: Date        // Spaced repetition schedule
}
```

**Learning Style Model:**

```typescript
// types/session.ts
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic'

export interface LearningStyleProfile {
  visual: number              // 0-100 score
  auditory: number            // 0-100 score
  kinesthetic: number         // 0-100 score
  dominantStyle: LearningStyle
  lastUpdated: Date
}
```

**Game Session Model:**

```typescript
// types/session.ts
export interface GameSession {
  id: string
  wordListId: string
  selectedWords: string[]      // Words chosen for this session
  currentWordIndex: number
  difficulty: 'easy' | 'medium' | 'hard'
  results: GameResult[]
  startedAt: Date
  completedAt?: Date
}
```

## Data Relationships

```
WordList (1) ────► (N) GameResult
    │
    │
    └────► (N) WordConfidenceData

GameResult (N) ────► (1) GameMechanic

GameSession (1) ────► (1) WordList
    │
    └────► (N) GameResult
```

## Storage Schema

**localStorage Keys:**

```typescript
const STORAGE_KEYS = {
  WORD_LISTS: 'wordcraft_word_lists',              // WordList[]
  GAME_RESULTS: 'wordcraft_game_results',          // GameResult[]
  LEARNING_PROFILE: 'wordcraft_learning_profile',  // LearningStyleProfile
  STORY_PROGRESS: 'wordcraft_story_progress',      // StoryProgressState (future)
} as const
```

**sessionStorage Keys:**

```typescript
const SESSION_KEYS = {
  CURRENT_SESSION: 'wordcraft_current_session',    // GameSession
  SESSION_RESULTS: 'wordcraft_session_results',    // GameResult[]
} as const
```

---
