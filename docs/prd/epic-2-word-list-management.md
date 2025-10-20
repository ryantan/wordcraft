# Epic 2: Word List Management

**Expanded Goal**: Enable parents to create, view, edit, and delete word lists with client-side persistence using localStorage. This epic delivers the foundational data layer that all game sessions depend on, allowing parents to manage custom spelling word lists with a simple, intuitive interface. By the end of this epic, parents can fully manage their word lists and select one to prepare for a game session.

## Story 2.1: Create Word List Storage Layer

As a developer,
I want to implement a localStorage-based storage layer for word lists,
so that word lists persist across browser sessions.

**Acceptance Criteria:**
1. A `WordListStorage` utility is created in `/lib/storage/word-list-storage.ts`
2. Utility provides methods: `saveWordList()`, `getWordList()`, `getAllWordLists()`, `deleteWordList()`, `updateWordList()`
3. Each word list has a structure: `{ id: string, name: string, words: string[], createdAt: Date, updatedAt: Date }`
4. Data is stored in localStorage under a key like `wordcraft_word_lists`
5. All localStorage operations are wrapped in try-catch to handle quota errors
6. Unit tests verify all CRUD operations work correctly
7. Storage layer handles edge cases (empty storage, corrupted data, quota exceeded)

## Story 2.2: Create Word List Form Component

As a parent,
I want to fill out a simple form to create a new word list,
so that I can enter my child's spelling words.

**Acceptance Criteria:**
1. A `WordListForm` component is created in `/components/word-list-form.tsx`
2. Form includes: word list name input, text area or multiple inputs for up to 15 words
3. Form validates that word list name is not empty
4. Form validates that each word contains only letters (a-z, A-Z) and shows inline error messages
5. Form validates that at least 1 word is entered and no more than 15 words
6. "Add Word" and "Remove Word" buttons allow dynamic addition/removal of word inputs
7. Form is responsive and works well on mobile and desktop
8. Form follows parent UX paradigm: minimal, clean, familiar patterns

## Story 2.3: Create Word List Page

As a parent,
I want to navigate to a dedicated page to create a new word list,
so that I can save my child's spelling words.

**Acceptance Criteria:**
1. A `/word-lists/new` route is created with the `WordListForm` component
2. Page includes a "Save Word List" button that calls the storage layer
3. On successful save, user sees a success message/toast
4. On successful save, user is redirected to the word lists overview page
5. Form handles validation errors gracefully with clear error messages
6. If localStorage quota is exceeded, user sees a helpful error message
7. Page is accessible from the home page "Create Word List" button
8. Page title and breadcrumbs clearly indicate "Create New Word List"

## Story 2.4: Display Word Lists Overview

As a parent,
I want to view all my saved word lists in one place,
so that I can select, edit, or delete them.

**Acceptance Criteria:**
1. A `/word-lists` route displays all saved word lists
2. Each word list is shown as a card/row with: name, word count, created date
3. Empty state is shown when no word lists exist with a "Create Your First Word List" CTA
4. Word lists are sorted by most recently updated first
5. Page is responsive with grid/list layout adapting to screen size
6. Each word list card includes action buttons: "Play", "Edit", "Delete"
7. Page is accessible from the home page navigation
8. Page follows parent UX paradigm: glanceable, visual indicators

## Story 2.5: Edit Existing Word List

As a parent,
I want to edit an existing word list to add, remove, or modify words,
so that I can keep my word lists up to date.

**Acceptance Criteria:**
1. A `/word-lists/[id]/edit` route is created that reuses the `WordListForm` component
2. Form is pre-populated with the existing word list data
3. User can modify the word list name and words
4. "Save Changes" button updates the word list in localStorage
5. Updated word list's `updatedAt` timestamp is refreshed
6. On successful update, user sees success message and is redirected to overview page
7. "Cancel" button returns user to overview without saving changes
8. If word list ID doesn't exist, user sees a "Word list not found" message

## Story 2.6: Delete Word List

As a parent,
I want to delete a word list I no longer need,
so that my list stays organized.

**Acceptance Criteria:**
1. "Delete" button on word list card triggers a confirmation dialog
2. Confirmation dialog clearly states "Are you sure you want to delete '[Word List Name]'? This cannot be undone."
3. If user confirms, word list is removed from localStorage
4. Word list card is immediately removed from the overview page
5. User sees a success message "Word list deleted"
6. If deletion fails, user sees an error message
7. If user cancels, dialog closes and no action is taken

## Story 2.7: Select Word List for Game Session

As a parent,
I want to select a word list and start a game session,
so that my child can practice those specific words.

**Acceptance Criteria:**
1. "Play" button on word list card navigates to `/play?wordListId=[id]`
2. Selected word list ID is passed to the play route via URL parameter
3. Play route validates that the word list exists
4. If word list doesn't exist, user is redirected back to word lists overview with error message
5. Play route displays a simple "Starting game session..." page for now (actual game in Epic 3)
6. Navigation is smooth with loading states where appropriate
7. Home page "Continue Playing" button navigates to last-used word list (stored in localStorage)

---
