# Epic 3: Core Game Mechanics (Part 1)

**Expanded Goal**: Establish the game architecture by defining a shared `GameMechanic` interface, building the `GameSessionMachine` to orchestrate game flow, and implementing the first 4 game mechanics (Word Scramble, Missing Letters, Letter Matching, Spelling Challenge). This epic delivers a fully playable game session where children can practice spelling words through varied, interactive mini-games. By the end of this epic, the system can load a word list, select words, pick appropriate games, render them, track results, and cycle through multiple games in a session.

## Story 3.1: Define Game Mechanic Interface and Types

As a developer,
I want to define a TypeScript interface that all game mechanics must implement,
so that games are pluggable and the session manager can work with any game type.

**Acceptance Criteria:**
1. A `GameMechanic` interface is defined in `/types/game.ts`
2. Interface includes: `id: string`, `name: string`, `description: string`, `learningStyle: 'visual' | 'auditory' | 'kinesthetic'`
3. Interface includes methods/properties: `render()`, `onAnswer()`, `getResult()`, `reset()`
4. Supporting types are defined: `GameResult`, `GameConfig`, `Word`
5. Documentation comments explain how to implement the interface
6. Interface design supports NFR26 (extensibility for new game types)
7. TypeScript strictly enforces the interface for all game implementations

## Story 3.2: Create Game Session State Machine

As a developer,
I want to build an XState machine that orchestrates the game session flow,
so that the system can manage word selection, game selection, and session progression.

**Acceptance Criteria:**
1. `GameSessionMachine` is created in `/machines/game-session-machine.ts`
2. Machine has states: `idle`, `selectingWord`, `selectingGame`, `playing`, `showingResult`, `sessionComplete`
3. Machine manages context: current word, current game, word queue, results history
4. Machine handles events: `START_SESSION`, `GAME_COMPLETE`, `NEXT_GAME`, `END_SESSION`
5. Machine transitions correctly between states based on events
6. Machine is visualizable in XState Inspector
7. Unit tests verify state transitions and context updates
8. Machine integrates with word list data (from Epic 2)

## Story 3.3: Implement Word Scramble Game

As a child,
I want to unscramble letters to form the correct spelling of a word,
so that I can practice spelling in a fun, puzzle-like way.

**Acceptance Criteria:**
1. `WordScramble` component is created in `/games/word-scramble.tsx`
2. Component implements the `GameMechanic` interface
3. Component displays scrambled letters as draggable/clickable tiles
4. User can rearrange letters by drag-and-drop or clicking in sequence
5. "Check Answer" button validates if the arrangement matches the target word
6. Correct answer shows celebration animation and proceeds to next state
7. Incorrect answer shows encouraging message and allows retry
8. Component is touch-friendly (44x44px touch targets) and works on mobile
9. Component follows child UX paradigm: playful, immediate feedback, forgiving

## Story 3.4: Implement Missing Letters Game

As a child,
I want to fill in missing letters in a word,
so that I can practice spelling with helpful context clues.

**Acceptance Criteria:**
1. `MissingLetters` component is created in `/games/missing-letters.tsx`
2. Component implements the `GameMechanic` interface
3. Component displays word with 2-4 letters replaced by blank spaces (underscores or boxes)
4. Blanks are strategically placed (not all consecutive, not all at start/end)
5. User can type or select letters to fill in the blanks
6. "Check Answer" button validates if all blanks are filled correctly
7. Correct answer shows celebration; incorrect shows which blanks are wrong
8. Component provides hint button that reveals one correct letter
9. Component is responsive and works well on mobile with on-screen keyboard

## Story 3.5: Implement Letter Matching Game

As a child,
I want to match individual letters to their correct positions in a word,
so that I can practice letter order and spelling patterns.

**Acceptance Criteria:**
1. `LetterMatching` component is created in `/games/letter-matching.tsx`
2. Component implements the `GameMechanic` interface
3. Component displays the word as empty slots and scrambled letters below
4. User drags or clicks letters to match them to the correct position
5. Visual feedback shows if a letter is placed correctly (green) or incorrectly (red)
6. User can swap/remove letters and try different combinations
7. Game is complete when all letters are correctly positioned
8. Component includes shuffle button to re-scramble available letters
9. Component works with both mouse and touch interactions

## Story 3.6: Implement Spelling Challenge Game

As a child,
I want to see/hear a word and spell it letter-by-letter using an on-screen keyboard,
so that I can practice spelling from memory.

**Acceptance Criteria:**
1. `SpellingChallenge` component is created in `/games/spelling-challenge.tsx`
2. Component implements the `GameMechanic` interface
3. Component displays the target word prominently (visual mode for MVP; audio for Phase 2)
4. On-screen keyboard displays alphabet in QWERTY or ABC layout
5. User clicks/taps letters to build the spelling letter-by-letter
6. Current spelling is displayed as user types with clear visual formatting
7. Backspace button allows user to delete last letter
8. "Check Spelling" button validates the complete word
9. Keyboard buttons are touch-friendly (minimum 44x44px)

## Story 3.7: Create Game Session UI and Orchestration

As a child,
I want to play through a series of mini-games with my spelling words,
so that I can practice in an engaging, varied way.

**Acceptance Criteria:**
1. `/play` route renders the active game session
2. UI loads the selected word list from localStorage (via URL parameter)
3. `GameSessionMachine` is initialized and connected to React component
4. UI dynamically renders the current game component based on machine state
5. Game results are captured and stored in machine context
6. UI shows session progress indicator (e.g., "Word 3 of 10")
7. "Exit" button allows user to end session early with confirmation dialog
8. Session completion shows summary screen with encouragement message
9. UI is full-screen, minimal chrome, child-friendly design

## Story 3.8: Track and Store Game Results

As a developer,
I want to track each game attempt (correct/incorrect, time taken, game type),
so that the adaptive engine can use this data to calculate confidence scores.

**Acceptance Criteria:**
1. A `GameResult` data structure is defined in `/types/game.ts`
2. Result includes: `wordId`, `gameType`, `isCorrect`, `attempts`, `timestamp`, `timeTaken`
3. Results are stored in IndexedDB for persistence across sessions
4. A `/lib/storage/game-results-storage.ts` utility handles CRUD operations
5. `GameSessionMachine` records a result after each game completion
6. Results storage handles edge cases (quota limits, corrupted data)
7. Unit tests verify results are correctly saved and retrieved
8. Results data structure supports future adaptive engine requirements (Epic 4)

---
