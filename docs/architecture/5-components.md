# 5. Components

## Component Architecture

WordCraft is organized into **6 major component categories**:

1. **Game Registry** - Central registry for game mechanics
2. **Storage Layer** - Abstraction over browser storage APIs
3. **Adaptive Learning Engine** - Confidence scoring and word selection algorithms
4. **Game Session Manager** - XState-based session orchestration
5. **Game Mechanics** - 8 pluggable game components
6. **UI Layer** - Pages, layouts, and shared UI components

## 1. Game Registry

**Purpose:** Central registration system for game mechanics

**Location:** `lib/games/registry.ts`

**Interface:**

```typescript
class GameRegistry {
  register(id: GameMechanicId, game: GameMechanic): void
  get(id: GameMechanicId): GameMechanic | undefined
  getAll(): GameMechanic[]
  getAllIds(): GameMechanicId[]
  has(id: GameMechanicId): boolean
}

export const gameRegistry: GameRegistry
```

**Dependencies:** None (standalone)

## 2. Storage Layer

**Purpose:** Abstract localStorage/sessionStorage with type safety and error handling

**Location:** `lib/storage/`

**Key Functions:**

```typescript
// localStorage.ts
export function getAllWordLists(): WordList[]
export function getWordList(id: string): WordList | null
export function createWordList(input: WordListCreateInput): WordList
export function updateWordList(id: string, updates: WordListUpdateInput): WordList | null
export function deleteWordList(id: string): boolean

// sessionStorage.ts
export function getCurrentSession(): GameSession | null
export function saveCurrentSession(session: GameSession): void
export function getAllGameResults(): GameResult[]
export function addGameResult(result: GameResult): void
export function clearSession(): void
```

**Dependencies:** Types from `@/types`

## 3. Adaptive Learning Engine

**Purpose:** Confidence scoring, spaced repetition, learning style detection

**Location:** `lib/algorithms/`

**Key Functions:**

```typescript
// confidence-scoring.ts
export function calculateWordConfidence(
  word: string,
  results: GameResult[]
): number

export function getMasteredWords(
  confidenceMap: Map<string, number>
): string[]

// spaced-repetition.ts
export function calculateNextReviewDate(
  word: string,
  confidence: number,
  lastReviewed: Date
): Date

export function shouldReviewWord(
  word: string,
  confidenceData: WordConfidenceData
): boolean

// learning-style-detection.ts
export function detectLearningStyle(
  results: GameResult[]
): LearningStyleProfile

export function updateLearningProfile(
  profile: LearningStyleProfile,
  newResults: GameResult[]
): LearningStyleProfile
```

**Dependencies:** Types, GameResult data

## 4. Game Session Manager

**Purpose:** Orchestrate game sessions using XState state machines

**Location:** `lib/game/`

**Key Components:**

```typescript
// session-manager.ts
export class GameSessionManager {
  startSession(wordListId: string, difficulty: Difficulty): GameSession
  getCurrentWord(): string | null
  submitAnswer(result: GameResult): void
  nextWord(): void
  endSession(): GameSession
}

// useGameSession.ts (React hook)
export function useGameSession() {
  return {
    session: GameSession | null,
    currentWord: string | null,
    progress: { current: number, total: number },
    submitAnswer: (result: GameResult) => void,
    nextWord: () => void,
    endSession: () => void,
  }
}
```

**Dependencies:** Storage layer, word selector, session tracker

## 5. Game Mechanics (8 Components)

Each game mechanic implements the `GameMechanicProps` interface:

```typescript
export interface GameMechanicProps {
  word: string                 // Word to practice (may be phrase)
  onComplete: (result: GameResult) => void
  onHintRequest?: () => void
  difficulty?: 'easy' | 'medium' | 'hard'
}
```

**Implemented Games:**

| Game ID | Component | Learning Style | Description |
|---------|-----------|----------------|-------------|
| `letter-matching` | `LetterMatching.tsx` | Visual, Kinesthetic | Match scrambled letters to word |
| `word-scramble` | `WordScramble.tsx` | Visual, Kinesthetic | Unscramble letters to form word |
| `spelling-challenge` | `SpellingChallenge.tsx` | Auditory, Kinesthetic | Type the word from memory |
| `letter-hunt` | `LetterHunt.tsx` | Visual, Kinesthetic | Find word in letter grid |
| `picture-reveal` | `PictureReveal.tsx` | Visual | Reveal picture by spelling word |
| `word-building` | `WordBuildingBlocks.tsx` | Kinesthetic | Build word from letter blocks |
| `trace-write` | `TraceAndWrite.tsx` | Kinesthetic | Trace letters to form word |
| `missing-letters` | `MissingLetters.tsx` | Visual | Fill in missing letters |

**Location:** `components/games/`

## 6. UI Layer

**Pages (App Router):**

```
app/
├── page.tsx                 # Home page with game session start
├── layout.tsx               # Root layout
├── game/
│   └── page.tsx            # Active game session
├── word-lists/
│   ├── page.tsx            # Word list management
│   ├── new/page.tsx        # Create new word list
│   └── [id]/page.tsx       # Edit word list
└── dashboard/
    └── page.tsx            # Parent dashboard (in progress)
```

**Shared UI Components:**

```
components/
├── ui/                      # shadcn/ui primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── game/
│   └── SessionSummary.tsx  # Post-session results
└── word-lists/
    ├── WordListCard.tsx    # Display word list
    └── WordListForm.tsx    # Create/edit form
```

## Component Dependencies Graph

```
Pages
  └─► UI Components
       └─► Game Session Manager
            ├─► Game Mechanics (8)
            ├─► Adaptive Learning Engine
            │    └─► Storage Layer
            └─► Storage Layer
                 └─► Types
```

---
