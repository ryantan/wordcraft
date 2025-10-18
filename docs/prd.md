# WordCraft Product Requirements Document (PRD)

## Goals and Background Context

### Goals

Based on the WordCraft Project Brief, here are the desired outcomes this PRD will deliver:

- Enable children ages 5-10 to practice spelling through engaging, adaptive game-based learning
- Provide parents with a simple, no-setup-required tool to support their child's spelling practice
- Deliver measurable learning effectiveness through intelligent adaptation (confidence scoring, learning style detection, spaced repetition)
- Create an enjoyable experience that children voluntarily return to 2+ times per week
- Achieve functional completeness with 8+ game mechanics working smoothly with adaptive difficulty
- Ensure technical stability across browsers and devices with <2s load times
- Successfully integrate story mode to provide narrative continuity without interrupting gameplay

### Background Context

Traditional spelling practice for children ages 5-10 relies on tedious, repetitive exercises like worksheets and flashcards that children resist and parents struggle to make engaging. WordCraft solves this by transforming spelling practice into an adaptive game-based learning experience where parents simply enter a word list (~10 words) and the app generates a dynamic session of varied mini-games that adapt in real-time based on the child's demonstrated mastery.

The MVP focuses on client-side functionality with no authentication or server requirements, allowing rapid development and deployment. The core differentiator is the adaptive intelligence that continuously assesses confidence levels, detects learning styles (visual/auditory/kinesthetic), and strategically re-introduces challenging words using spaced repetition—making practice both effective and enjoyable.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-18 | 1.0 | Initial PRD created from Project Brief | Mary (Business Analyst) |

---

## Requirements

### Functional Requirements

**Word List Management:**
- **FR1:** Parents can create a new word list by entering up to 15 words via a simple input interface
- **FR2:** Word lists are saved to browser local storage and can be retrieved for future sessions
- **FR3:** Parents can edit existing word lists (add, remove, or modify words)
- **FR4:** Parents can delete word lists they no longer need
- **FR5:** The system validates word inputs to ensure they contain only letters (a-z, A-Z)

**Game Session Management:**
- **FR6:** The system generates a game session from a selected word list, creating a queue of mini-games
- **FR7:** Each game session includes a mix of different game mechanics to maintain variety
- **FR8:** The session continues until the child exhibits confidence in the words, or the child chooses to end the session
- **FR9:** Session progress is saved automatically so users can resume if interrupted
- **FR10:** Users can restart a session or start a new session with a different word list at any time

**Game Mechanics (Minimum 8 types):**
- **FR11:** Word Scramble - Present scrambled letters that the user must rearrange to form the correct word
- **FR12:** Missing Letters - Display word with blank spaces where user must fill in missing letters
- **FR13:** Letter Matching - User matches individual letters to their correct positions in the word
- **FR14:** Spelling Challenge - User sees/hears the word and spells it letter-by-letter using on-screen keyboard
- **FR15:** Letter Hunt - User finds and collects letters in sequence within an interactive scene
- **FR16:** Trace & Write - User traces letter shapes with touch/mouse for kinesthetic learning
- **FR17:** Picture Reveal - Each correct letter reveals part of a hidden image related to the word
- **FR18:** Word Building Blocks - User drags and drops letter tiles to construct the word

**Adaptive Learning Engine:**
- **FR19:** The system tracks accuracy for each word across all game attempts to calculate a confidence score (0-100%)
- **FR20:** Words with low confidence scores (<60%) are prioritized for re-introduction within the same session
- **FR21:** Words with high confidence scores (>80%) are marked as "mastered" and appear less frequently
- **FR22:** The system implements spaced repetition logic to re-introduce challenging words at optimal intervals across sessions
- **FR23:** The system detects learning style preference by tracking performance across game types (visual, auditory, kinesthetic)
- **FR24:** Game selection adapts to emphasize game types that align with the child's detected learning style
- **FR25:** Game difficulty dynamically adjusts based on real-time performance (e.g., adding time pressure, reducing hints)

**Story Mode:**
- **FR26:** A lightweight narrative theme (space adventure, treasure hunt, fantasy quest, etc.) ties all game sessions together
- **FR27:** The story progresses through checkpoints as the child completes mini-games
- **FR28:** Story progression is persistent across sessions and resumes from the last checkpoint
- **FR29:** Visual elements (character, theme graphics) are consistent throughout the experience
- **FR30:** Story advancement provides positive reinforcement and motivation to continue playing

**Parent Dashboard:**
- **FR31:** Parents can view mastery status for each word in a word list (mastered, in-progress, needs work)
- **FR32:** The dashboard displays confidence scores for individual words with visual indicators (colors, progress bars)
- **FR33:** Parents can view session history including date, duration, and words practiced
- **FR34:** Basic analytics show total time spent, number of sessions, and overall mastery rate
- **FR35:** Parents can export word lists and progress data for backup purposes
- **FR36:** Parents can import previously exported data to restore progress

**User Interface:**
- **FR37:** The interface is responsive and works on desktop browsers (1024px+) and mobile devices (320px+)
- **FR38:** All game interactions support both mouse/keyboard and touch input
- **FR39:** Visual feedback is provided for all user actions (button presses, correct/incorrect answers)
- **FR40:** Navigation between screens is intuitive with clear back/home/exit options
- **FR41:** The app provides a simple onboarding/welcome screen explaining how to get started

### Non-Functional Requirements

**Performance:**
- **NFR1:** Initial page load time must be under 2 seconds on a 4G connection
- **NFR2:** Game interaction latency must be under 100ms for responsive feel
- **NFR3:** Animations and transitions must run smoothly at 60fps on mid-range devices
- **NFR4:** The app must handle word lists up to 15 words without performance degradation

**Browser Compatibility:**
- **NFR5:** The app must work on Chrome 90+, Safari 14+, Firefox 88+, and Edge 90+
- **NFR6:** The app must work on mobile browsers (iOS Safari 14+, Chrome Mobile, Samsung Internet)
- **NFR7:** The app must gracefully degrade features not supported by older browsers with clear messaging

**Mobile Optimization:**
- **NFR8:** Touch targets must be at least 44x44px for easy tapping on mobile devices
- **NFR9:** Text must be readable without zooming (minimum 16px font size for body text)
- **NFR10:** Games must be playable in both portrait and landscape orientations where appropriate

**Data Storage:**
- **NFR11:** All user data (word lists, progress, confidence scores) must be stored client-side using localStorage or IndexedDB
- **NFR12:** The app must handle localStorage quota limits gracefully with clear error messaging
- **NFR13:** Data export must be in a standard, portable format (JSON) for easy backup and migration

**Privacy & Security:**
- **NFR14:** No personally identifiable information (PII) is collected or transmitted to servers
- **NFR15:** All data remains on the user's device for MVP; no cloud sync or server storage
- **NFR16:** The app must be served over HTTPS to ensure secure communication

**Reliability:**
- **NFR17:** The app must have 99% uptime (considering CDN and hosting provider)
- **NFR18:** The app must handle unexpected errors gracefully without losing session progress
- **NFR19:** Local storage operations must be wrapped in try-catch blocks to handle quota or permission errors

**Accessibility:**
- **NFR20:** Color contrast must meet WCAG AA standards for readability
- **NFR21:** Interactive elements must be keyboard accessible where applicable
- **NFR22:** The app should provide visual feedback for all state changes (loading, success, error)

**Code Quality:**
- **NFR23:** Code must be written in TypeScript with strict type checking enabled
- **NFR24:** Components must be modular and reusable to support adding new game mechanics
- **NFR25:** XState machines must be unit-testable and visualizable using XState Inspector

**Extensibility:**
- **NFR26:** The system architecture must support adding new mini-game types without requiring changes to core game session logic or adaptive engine code

---

## User Interface Design Goals

### Overall UX Vision

WordCraft's user experience must balance two distinct user needs: **simplicity for parents** and **engaging playfulness for children**. Parents need a no-friction interface where they can quickly create word lists and check progress without reading instructions. Children need vibrant, responsive, game-like interactions that feel fun and rewarding, not educational-boring.

The design philosophy is **"invisible for parents, magical for kids"**—parents should barely notice the UI (it just works), while children should feel immersed in an interactive story-game world.

### Key Interaction Paradigms

**For Parents (Setup & Dashboard):**
- **Minimal Text Input**: Simple form for word list creation with inline validation
- **Glanceable Progress**: Visual indicators (colors, icons, progress bars) over dense tables or numbers
- **One-Click Actions**: Start session, view progress, export data—all accessible in 1-2 clicks
- **Familiar Patterns**: Standard web UI patterns (buttons, forms, cards) for instant familiarity

**For Children (Game Play):**
- **Touch-First Interactions**: Large, tappable elements; drag-and-drop; swipe gestures
- **Immediate Feedback**: Visual/audio feedback within 100ms of any interaction
- **Forgiving UX**: No penalties for mistakes; encouragement and retry opportunities
- **Progressive Disclosure**: Simple instructions shown just-in-time, not upfront
- **Playful Micro-Interactions**: Animations, celebrations, character reactions to maintain engagement

### Core Screens and Views

**1. Welcome/Home Screen**
- Simple landing page with "Create Word List" and "Continue Playing" options
- Optional: brief onboarding tour for first-time users

**2. Parent Portal - Word List Management**
- Create new word list (input form)
- View/edit/delete existing word lists
- Select word list to start game session

**3. Game Session Screen**
- Full-screen game play area
- Minimal UI chrome (just exit/pause button)
- Story mode narrative elements integrated into game flow
- Progress indicator (subtle, non-intrusive)

**4. Story/Transition Screens**
- Brief narrative moments between games
- Story checkpoint celebrations
- Character progression visuals

**5. Parent Dashboard - Progress View**
- Word mastery status grid/list
- Session history log
- Basic analytics charts (time spent, mastery rate)
- Export/import data options

**6. Session Complete Screen**
- Celebration of progress/achievements
- Summary of words practiced
- Options: continue, return home, view progress

### Accessibility: WCAG AA

- **Color Contrast**: All text and UI elements meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- **Keyboard Navigation**: Parent-facing screens support full keyboard navigation with visible focus states
- **Touch Targets**: Minimum 44x44px for all interactive elements (child-friendly and accessibility-friendly)
- **Visual Feedback**: Clear visual indicators for all state changes, not relying solely on color
- **Readable Text**: Minimum 16px body text; scalable without breaking layout

### Branding

**MVP Branding Approach:**
- **Clean & Playful**: Modern, friendly aesthetic using free design resources and component libraries
- **Color Palette**: Bright, cheerful colors for children's interface; calm, professional tones for parent interface
- **Typography**: Readable sans-serif fonts suitable for children (rounded, friendly) and parents (clean, professional)
- **Illustrations**: Free or low-cost illustration packs for story theme (e.g., space, adventure, fantasy)
- **Component Library**: Use Tailwind CSS + shadcn/ui for consistent, polished UI components

**No Existing Brand Requirements**: This is a new project with flexibility to define visual identity during development.

### Target Platforms: Web Responsive

- **Primary**: Desktop browsers (Chrome, Safari, Firefox, Edge) at 1024px+ width
- **Secondary**: Tablets (iPad, Android tablets) at 768px-1024px width
- **Tertiary**: Mobile phones (iOS, Android) at 320px-767px width

**Responsive Strategy:**
- Mobile-first CSS approach using Tailwind CSS responsive utilities
- Game mechanics adapt to screen size (portrait/landscape support where appropriate)
- Parent dashboard optimized for desktop but functional on mobile
- Touch and mouse/keyboard input both fully supported across all screen sizes

---

## Technical Assumptions

Based on the WordCraft Project Brief, here are the technical decisions that will guide the Architecture:

### Repository Structure: Monorepo

**Decision**: Single monorepo containing all WordCraft code (Next.js app with frontend and future backend)

**Rationale**:
- Simplifies MVP development with everything in one place
- Easy to share types and utilities between frontend and future backend
- Single deployment pipeline for Vercel
- If native apps are added later, can migrate to polyrepo or keep as monorepo with workspace structure

**Repository Organization**:
```
/app or /pages     - Next.js routes
/components        - Reusable UI components
/games             - Individual game mechanic components
/machines          - XState state machines
/lib               - Utilities, algorithms (spaced repetition, confidence scoring)
/hooks             - Custom React hooks
/types             - TypeScript type definitions
/public            - Static assets (images, fonts)
```

### Service Architecture

**Architecture**: Client-side single-page application (SPA) with no backend for MVP

**Key Decisions**:
- **Frontend**: React with Next.js (leveraging static site generation or client-side rendering)
- **State Management**: XState for complex application state (game flow, adaptive engine, session management)
- **Data Persistence**: Browser localStorage and IndexedDB (no server database for MVP)
- **API Layer**: None for MVP; Next.js API routes available for future server features
- **Authentication**: None for MVP; purely client-side

**Rationale**:
- Eliminates server costs and complexity for MVP validation
- Faster development iteration (no backend to build/deploy/maintain)
- Privacy-first approach (no data leaves user's device)
- XState provides robust state management for complex game logic
- Next.js provides excellent developer experience and deployment via Vercel

**Future Architecture Path**: When server features are needed post-MVP (authentication, cloud sync, analytics), add Next.js API routes backed by PostgreSQL or MongoDB with minimal frontend changes.

### Testing Requirements

**Testing Strategy**: Unit testing with integration testing for critical paths

**MVP Testing Approach**:
- **Unit Tests**: XState machines, utility functions (confidence scoring, spaced repetition algorithms)
- **Component Tests**: React Testing Library for key components (game mechanics, word list forms)
- **Integration Tests**: Critical user flows (create word list → start session → complete game → view progress)
- **Manual Testing**: Browser compatibility, mobile responsiveness, game playability with real users
- **No E2E for MVP**: Skip Playwright/Cypress to reduce complexity; rely on manual testing for full flows

**Testing Tools**:
- **Framework**: Vitest (fast, Vite-compatible)
- **React Testing**: React Testing Library
- **XState Testing**: Built-in XState testing utilities
- **Coverage Goal**: 70%+ for core logic (machines, algorithms), lower coverage acceptable for UI components

**Convenience Methods**:
- Seed data functions for testing (pre-populated word lists, mock session history)
- XState Inspector integration for visual debugging
- Development-only reset/clear storage buttons

**Rationale**: Balance test coverage with MVP speed; focus testing on business logic (adaptive engine) where bugs are costliest.

### Additional Technical Assumptions and Requests

**Frontend Framework & Libraries**:
- **React**: Latest stable version (v19+) with hooks and functional components
- **Next.js**: Latest stable version (v15+), using App Router for modern patterns
- **TypeScript**: Strict mode enabled for type safety
- **Tailwind CSS**: v3+ for utility-first styling
- **Framer Motion**: For animations and transitions
- **XState**: v5 for state machine orchestration
- **shadcn/ui**: For polished, accessible UI components

**Build & Deployment**:
- **Hosting**: Vercel (optimized for Next.js, free tier for MVP)
- **CI/CD**: Vercel Git integration (auto-deploy on push to main)
- **Environments**: Preview (for PRs), Production (from main branch)
- **Asset Optimization**: Next.js built-in image optimization, code splitting, tree shaking

**Data & Storage**:
- **localStorage**: For word lists (small data, simple key-value)
- **IndexedDB**: For session history and larger structured data
- **Data Format**: JSON for import/export
- **Storage Limits**: Handle 5-10MB localStorage limit gracefully with user warnings

**Game Development**:
- **Game Interface**: All game mechanics implement a common TypeScript interface (e.g., `GameMechanic`)
- **Game Registration**: Games register with adaptive engine via configuration/registry pattern
- **Pluggable Architecture**: Adding new games requires no changes to core session or adaptive logic (supports NFR26)
- **Asset Management**: Free illustration packs (e.g., unDraw, Blush, Humaaans) for game visuals

**State Management (XState Details)**:
- **Machines**:
  - `GameSessionMachine`: Orchestrates overall game flow
  - `AdaptiveEngineMachine`: Manages word confidence, prioritization, learning style
  - `StoryProgressMachine`: Tracks narrative checkpoints
  - `WordListMachine`: Handles CRUD operations with localStorage
- **Actors**: Use XState actors for parallel concerns (timers, animations)
- **Persistence**: XState state snapshots saved to IndexedDB for session resume

**Performance**:
- **Bundle Size**: Monitor with Next.js bundle analyzer; target <500KB initial JS bundle
- **Lazy Loading**: Lazy load game components to reduce initial load time
- **Prefetching**: Prefetch next likely game for smooth transitions
- **Animation Performance**: Use CSS transforms/opacity for 60fps animations

**Development Tools**:
- **Code Formatter**: Prettier with standard config
- **Linting**: ESLint with TypeScript and React rules
- **Version Control**: Git with conventional commit messages
- **XState Inspector**: Enabled in development for state machine visualization

**Browser APIs Used**:
- **localStorage**: For persistent data storage
- **IndexedDB**: For structured data (via library like idb or Dexie.js)
- **Web Speech API**: (Future Phase 2) For text-to-speech word pronunciation
- **Vibration API**: (Optional) For haptic feedback on mobile

**No Backend Services for MVP**:
- No authentication service
- No database server
- No cloud storage
- No real-time sync
- No analytics backend (can use client-side analytics like Vercel Analytics)

---

## Epic List

Based on the WordCraft requirements, here are the proposed epics for MVP development:

**Epic 1: Foundation & Project Setup**
*Goal*: Establish Next.js project infrastructure, TypeScript configuration, XState setup, and basic routing with a simple health-check page to validate deployment pipeline.

**Epic 2: Word List Management**
*Goal*: Enable parents to create, edit, delete, and persist word lists using localStorage, providing the foundation for all game sessions.

**Epic 3: Core Game Mechanics (Part 1)**
*Goal*: Implement 4 initial game mechanics (Word Scramble, Missing Letters, Letter Matching, Spelling Challenge) with a shared game interface and basic session flow.

**Epic 4: Adaptive Learning Engine**
*Goal*: Build the intelligent core that tracks confidence scores, implements spaced repetition, detects learning styles, and dynamically adjusts game selection and difficulty.

**Epic 5: Core Game Mechanics (Part 2)**
*Goal*: Implement remaining 4 game mechanics (Letter Hunt, Trace & Write, Picture Reveal, Word Building Blocks) leveraging the established game interface.

**Epic 6: Story Mode Integration**
*Goal*: Create a lightweight narrative theme with checkpoints, visual elements, and progress persistence that ties game sessions together.

**Epic 7: Parent Dashboard & Data Management**
*Goal*: Provide parents with visibility into word mastery, session history, analytics, and export/import capabilities for data backup.

**Epic 8: Polish, Performance & Launch Readiness**
*Goal*: Optimize performance, add animations/transitions, ensure cross-browser compatibility, mobile responsiveness, and prepare for beta testing and launch.

---

## Epic 1: Foundation & Project Setup

**Expanded Goal**: Establish the complete technical foundation for WordCraft by initializing a Next.js 15+ project with TypeScript, configuring essential development tools (Tailwind CSS, XState, testing), setting up the Vercel deployment pipeline, and creating basic routing with a welcome page. This epic delivers a deployable, production-ready skeleton that validates our entire development and deployment workflow while providing the foundation for all subsequent features.

### Story 1.1: Initialize Next.js Project with TypeScript

As a developer,
I want to create a new Next.js project with TypeScript and configure the basic project structure,
so that I have a solid foundation to build WordCraft upon.

**Acceptance Criteria:**
1. Next.js 15+ project is initialized using `create-next-app` with TypeScript and App Router
2. Project includes the folder structure: `/app`, `/components`, `/games`, `/machines`, `/lib`, `/hooks`, `/types`, `/public`
3. TypeScript is configured with strict mode enabled in `tsconfig.json`
4. Project runs successfully with `npm run dev` and displays the default Next.js page
5. `.gitignore` is properly configured to exclude `node_modules`, `.next`, and other build artifacts
6. Git repository is initialized with an initial commit

### Story 1.2: Configure Tailwind CSS and Component Library

As a developer,
I want to set up Tailwind CSS and shadcn/ui for styling,
so that I can build responsive, accessible UI components efficiently.

**Acceptance Criteria:**
1. Tailwind CSS v3+ is installed and configured with Next.js
2. `tailwind.config.ts` includes mobile-first breakpoints and color scheme
3. shadcn/ui is initialized and at least one component (e.g., Button) is installed and working
4. Global styles are configured in `app/globals.css` with Tailwind directives
5. A test page demonstrates that Tailwind utilities and shadcn/ui components render correctly
6. Dark mode configuration is set up (even if not actively used in MVP)

### Story 1.3: Install and Configure XState

As a developer,
I want to set up XState v5 with TypeScript types and inspector integration,
so that I can build robust state machines for game logic and adaptive engine.

**Acceptance Criteria:**
1. XState v5 is installed with proper TypeScript types
2. XState Inspector is configured to run in development mode only
3. A simple demo machine (e.g., `counterMachine`) is created in `/machines` to validate setup
4. Demo machine is visualizable in XState Inspector during development
5. XState testing utilities are installed and a basic test validates the demo machine
6. Documentation comment or README snippet explains how to use XState Inspector

### Story 1.4: Configure Development Tools and Testing

As a developer,
I want to set up ESLint, Prettier, and Vitest for code quality and testing,
so that code remains clean, consistent, and well-tested throughout development.

**Acceptance Criteria:**
1. ESLint is configured with TypeScript and React rules
2. Prettier is configured with standard formatting rules and integrates with ESLint
3. Pre-commit hooks (using Husky or similar) run linting and formatting
4. Vitest is installed and configured for unit testing
5. React Testing Library is installed for component testing
6. At least one example test file exists and passes (`npm run test`)
7. Test coverage reporting is configured

### Story 1.5: Set Up Vercel Deployment Pipeline

As a developer,
I want to configure Vercel for automatic deployment from Git,
so that every commit triggers a deployment and I can validate the production environment.

**Acceptance Criteria:**
1. Project is connected to Vercel with GitHub integration
2. Automatic deployments are configured for the main branch (production)
3. Preview deployments are enabled for pull requests
4. Environment variables are configured if needed (even if none required for MVP)
5. First successful deployment to production is verified with a live URL
6. Deployment status badge or link is added to README

### Story 1.6: Create Welcome/Home Page and Basic Routing

As a parent,
I want to see a welcoming home page when I visit WordCraft,
so that I understand what the app does and can get started.

**Acceptance Criteria:**
1. Home page (`/app/page.tsx`) displays "WordCraft" title and tagline
2. Page includes a brief description of what WordCraft does
3. Two call-to-action buttons are present: "Create Word List" and "Continue Playing" (non-functional for now)
4. Page is responsive and looks good on mobile and desktop
5. Basic Next.js routes are set up: `/` (home), `/word-lists` (placeholder), `/play` (placeholder)
6. Navigation between routes works with Next.js Link components
7. Page follows the UX vision: clean, simple, parent-friendly design

---

## Epic 2: Word List Management

**Expanded Goal**: Enable parents to create, view, edit, and delete word lists with client-side persistence using localStorage. This epic delivers the foundational data layer that all game sessions depend on, allowing parents to manage custom spelling word lists with a simple, intuitive interface. By the end of this epic, parents can fully manage their word lists and select one to prepare for a game session.

### Story 2.1: Create Word List Storage Layer

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

### Story 2.2: Create Word List Form Component

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

### Story 2.3: Create Word List Page

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

### Story 2.4: Display Word Lists Overview

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

### Story 2.5: Edit Existing Word List

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

### Story 2.6: Delete Word List

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

### Story 2.7: Select Word List for Game Session

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

## Epic 3: Core Game Mechanics (Part 1)

**Expanded Goal**: Establish the game architecture by defining a shared `GameMechanic` interface, building the `GameSessionMachine` to orchestrate game flow, and implementing the first 4 game mechanics (Word Scramble, Missing Letters, Letter Matching, Spelling Challenge). This epic delivers a fully playable game session where children can practice spelling words through varied, interactive mini-games. By the end of this epic, the system can load a word list, select words, pick appropriate games, render them, track results, and cycle through multiple games in a session.

### Story 3.1: Define Game Mechanic Interface and Types

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

### Story 3.2: Create Game Session State Machine

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

### Story 3.3: Implement Word Scramble Game

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

### Story 3.4: Implement Missing Letters Game

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

### Story 3.5: Implement Letter Matching Game

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

### Story 3.6: Implement Spelling Challenge Game

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

### Story 3.7: Create Game Session UI and Orchestration

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

### Story 3.8: Track and Store Game Results

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

## Epic 4: Adaptive Learning Engine

**Expanded Goal**: Build the intelligent core that analyzes game results to calculate per-word confidence scores, implements spaced repetition logic to re-introduce challenging words at optimal intervals, detects each child's learning style preference (visual/auditory/kinesthetic), and dynamically adapts game selection and difficulty in real-time. This epic transforms WordCraft from a simple game collection into a truly adaptive learning system. By the end of this epic, the system intelligently personalizes the learning experience for each child based on their demonstrated performance and preferences.

### Story 4.1: Implement Confidence Scoring Algorithm

As a developer,
I want to build an algorithm that calculates a confidence score (0-100%) for each word based on game results,
so that the system can identify which words need more practice.

**Acceptance Criteria:**
1. A `/lib/algorithms/confidence-scoring.ts` module is created
2. Algorithm calculates confidence based on: accuracy rate, number of attempts, recency of practice
3. Formula gives more weight to recent attempts than older ones (recency bias)
4. Confidence increases with consecutive correct answers, decreases with incorrect answers
5. Thresholds are defined: <60% = needs work, 60-80% = progressing, >80% = mastered
6. Algorithm handles edge cases (new words with no history, perfect scores, etc.)
7. Unit tests verify confidence calculations for various scenarios
8. Algorithm is documented with comments explaining the scoring logic

### Story 4.2: Create Adaptive Engine State Machine

As a developer,
I want to build an XState machine that manages word prioritization, learning style detection, and game selection,
so that the adaptive logic is centralized and testable.

**Acceptance Criteria:**
1. `AdaptiveEngineMachine` is created in `/machines/adaptive-engine-machine.ts`
2. Machine manages context: word confidence scores, learning style profile, session metrics
3. Machine provides services: `prioritizeWords()`, `selectGame()`, `updateConfidence()`, `detectLearningStyle()`
4. Machine updates confidence scores after each game result
5. Machine is visualizable in XState Inspector
6. Machine can be queried by `GameSessionMachine` for word/game selection
7. Unit tests verify adaptive logic and state transitions
8. Machine persists adaptive data to IndexedDB

### Story 4.3: Implement Spaced Repetition Logic

As a developer,
I want to implement a spaced repetition algorithm that determines when to re-introduce words,
so that challenging words are practiced at optimal intervals for retention.

**Acceptance Criteria:**
1. A `/lib/algorithms/spaced-repetition.ts` module implements Leitner system or SM-2 algorithm
2. Algorithm tracks per-word: review count, last review date, current interval
3. Words with low confidence are scheduled for sooner review
4. Words with high confidence have longer intervals between reviews
5. Algorithm provides `getNextWords()` function that prioritizes words due for review
6. Within-session logic re-introduces struggling words 2-3 times per session
7. Cross-session logic schedules words for future sessions based on mastery
8. Unit tests verify spacing intervals and word prioritization

### Story 4.4: Implement Learning Style Detection

As a developer,
I want to analyze game performance across different game types to detect learning style preferences,
so that the system can emphasize effective game mechanics for each child.

**Acceptance Criteria:**
1. A `/lib/algorithms/learning-style-detection.ts` module is created
2. Algorithm tracks performance metrics by game type (visual, auditory, kinesthetic)
3. Algorithm calculates success rate, average attempts, and speed for each category
4. Learning style profile is determined after minimum 10-15 game results (enough data)
5. Profile indicates primary and secondary learning styles (e.g., 60% visual, 30% kinesthetic, 10% auditory)
6. Algorithm updates incrementally as more data is collected
7. Default profile is balanced (33% each) until sufficient data exists
8. Unit tests verify detection logic with sample game result datasets

### Story 4.5: Implement Adaptive Game Selection

As a child,
I want the system to select games that work well for how I learn,
so that practice is more effective and engaging for me.

**Acceptance Criteria:**
1. `GameSessionMachine` integrates with `AdaptiveEngineMachine` for game selection
2. Game selection algorithm considers: learning style profile, game variety, word difficulty
3. System favors game types aligned with child's detected learning style (60-70% of selections)
4. System ensures variety by not repeating same game type consecutively
5. Easier words paired with more challenging games; harder words with simpler games
6. Selection logic is configurable and can be tuned based on testing
7. System logs game selection rationale for debugging/analysis
8. Unit tests verify game selection distribution matches learning style profile

### Story 4.6: Implement Dynamic Difficulty Adjustment

As a child,
I want games to get slightly harder when I'm doing well and easier when I'm struggling,
so that practice stays appropriately challenging.

**Acceptance Criteria:**
1. Each game component accepts a `difficulty: 'easy' | 'medium' | 'hard'` prop
2. Difficulty affects game parameters: time limits, hint availability, complexity
3. `AdaptiveEngineMachine` determines difficulty based on recent performance (last 3-5 attempts)
4. Consecutive correct answers → increase difficulty; consecutive errors → decrease difficulty
5. Difficulty adjustments are gradual (don't jump from easy to hard immediately)
6. System balances challenge with confidence-building (70-80% success rate target)
7. Games implement difficulty variations (e.g., more/fewer missing letters, tighter time limits)
8. Unit tests verify difficulty adjustment logic

### Story 4.7: Integrate Adaptive Engine with Game Session

As a child,
I want the game to feel personalized and smart about what I practice,
so that my time is spent on words I need help with, not ones I've mastered.

**Acceptance Criteria:**
1. `GameSessionMachine` queries `AdaptiveEngineMachine` for next word to practice
2. Words are selected based on confidence score and spaced repetition schedule
3. Mastered words (>80% confidence) appear less frequently in sessions
4. Struggling words (<60% confidence) are re-introduced 2-3 times per session
5. Session adapts mid-game based on real-time performance
6. Session ends when all words show adequate confidence or child opts to end
7. UI displays subtle confidence indicators (progress bars, colors) for parent view
8. System handles edge cases (all words mastered, all words struggling, single-word lists)

### Story 4.8: Test and Validate Adaptive Engine

As a developer,
I want to validate that the adaptive engine produces sensible, effective learning paths,
so that I'm confident it will help children learn effectively.

**Acceptance Criteria:**
1. Integration tests simulate full game sessions with various performance patterns
2. Tests verify: confidence scores increase with correct answers, decrease with errors
3. Tests verify: low-confidence words are prioritized over high-confidence words
4. Tests verify: learning style detection converges on correct profile given biased data
5. Tests verify: game selection matches detected learning style over time
6. Tests verify: difficulty adjusts appropriately to performance trends
7. Manual testing with real game play validates adaptive behavior feels natural
8. Documentation explains adaptive engine behavior and tuning parameters

---

## Epic 5: Core Game Mechanics (Part 2)

**Expanded Goal**: Complete the game mechanic library by implementing the remaining 4 game types (Letter Hunt, Trace & Write, Picture Reveal, Word Building Blocks) using the established `GameMechanic` interface and adaptive engine integration. This epic expands the variety of learning experiences available to children and ensures the adaptive engine has sufficient game diversity to match different learning styles effectively. By the end of this epic, WordCraft offers 8 fully functional, diverse game mechanics that work seamlessly with the adaptive learning system.

### Story 5.1: Implement Letter Hunt Game

As a child,
I want to find and collect letters in sequence within an interactive scene,
so that I can practice spelling through exploration and discovery.

**Acceptance Criteria:**
1. `LetterHunt` component is created in `/games/letter-hunt.tsx`
2. Component implements the `GameMechanic` interface
3. Component displays an illustrated scene with letters hidden/scattered throughout
4. User must find and click/tap letters in the correct sequence to spell the word
5. Visual/audio feedback when correct letter is found; gentle hint if wrong letter clicked
6. Progress indicator shows which letters have been found (e.g., "C_T" for "CAT")
7. Scene is simple but engaging (trees, clouds, objects with letters embedded)
8. Component is categorized as kinesthetic/visual learning style
9. Component supports difficulty: easy (obvious letters), medium (subtle letters), hard (camouflaged letters)

### Story 5.2: Implement Trace & Write Game

As a child,
I want to trace letter shapes with my finger or mouse to form a word,
so that I can practice spelling through kinesthetic motor memory.

**Acceptance Criteria:**
1. `TraceAndWrite` component is created in `/games/trace-and-write.tsx`
2. Component implements the `GameMechanic` interface
3. Component displays outlined letters for the target word
4. User traces each letter path with touch/mouse; system validates tracing accuracy
5. Tracing path follows proper letter formation (top-to-bottom, left-to-right)
6. Visual feedback shows traced path in real-time (stroke appears as user draws)
7. Letter is marked complete when traced within acceptable accuracy (70-80%)
8. "Retry" option allows user to re-trace if they go off-path significantly
9. Component is categorized as kinesthetic learning style
10. Component supports difficulty: easy (thick lines, forgiving), medium (normal), hard (thin lines, strict)

### Story 5.3: Implement Picture Reveal Game

As a child,
I want to reveal a hidden picture by spelling letters correctly,
so that I'm motivated to spell accurately and see the full image.

**Acceptance Criteria:**
1. `PictureReveal` component is created in `/games/picture-reveal.tsx`
2. Component implements the `GameMechanic` interface
3. Component displays a pixelated/obscured image related to the word (e.g., cat picture for "cat")
4. On-screen keyboard or letter buttons allow user to spell the word letter-by-letter
5. Each correct letter reveals a portion of the hidden picture (progressive reveal)
6. Incorrect letters don't reveal picture but show encouraging feedback to try again
7. Complete picture is revealed when word is spelled correctly
8. Picture library uses free illustration resources or simple SVG graphics
9. Component is categorized as visual learning style
10. Component supports difficulty: easy (clear image), medium (slightly obscured), hard (very pixelated)

### Story 5.4: Implement Word Building Blocks Game

As a child,
I want to drag and drop letter tiles like building blocks to construct a word,
so that I can practice spelling through hands-on manipulation.

**Acceptance Criteria:**
1. `WordBuildingBlocks` component is created in `/games/word-building-blocks.tsx`
2. Component implements the `GameMechanic` interface
3. Component displays letter tiles scattered at the bottom of the screen
4. Empty slots at the top represent positions where letters should be placed
5. User drags letter tiles to slot positions or taps tiles then taps slots
6. Tiles snap into place when dropped on a slot; can be removed and repositioned
7. Visual feedback shows when tiles are in correct positions (color change, glow effect)
8. "Check Answer" button validates the complete word
9. Component is categorized as kinesthetic/visual learning style
10. Component supports difficulty: easy (4-letter words), medium (6-8 letters), hard (9+ letters)

### Story 5.5: Register New Games with Adaptive Engine

As a developer,
I want to register the 4 new game mechanics with the game session and adaptive engine,
so that they're available for selection during game sessions.

**Acceptance Criteria:**
1. All 4 new games are added to a game registry in `/lib/game-registry.ts`
2. Registry exports an array of all 8 available games with metadata (id, name, learning style)
3. `GameSessionMachine` can access and instantiate any registered game
4. `AdaptiveEngineMachine` considers all 8 games when selecting based on learning style
5. Learning style distribution is correct: visual (3 games), kinesthetic (3 games), visual/kinesthetic (2 games)
6. Games can be enabled/disabled via configuration for testing
7. Registry is extensible to support adding future games (supports NFR26)
8. Unit tests verify registry structure and game accessibility

### Story 5.6: Test Game Variety and Balance

As a developer,
I want to validate that all 8 games work correctly and provide balanced learning experiences,
so that children have a diverse, effective practice environment.

**Acceptance Criteria:**
1. Integration tests verify all 8 games can be loaded and played successfully
2. Tests verify each game correctly implements the `GameMechanic` interface
3. Tests verify games handle difficulty levels appropriately
4. Tests verify touch and mouse interactions work for all games
5. Manual testing on mobile and desktop confirms responsive design
6. Tests verify adaptive engine selects from all 8 games based on learning style
7. Play-through testing confirms no game is significantly harder/easier than others at same difficulty
8. Documentation includes game descriptions and learning style categorizations

---

## Epic 6: Story Mode Integration

**Expanded Goal**: Create a lightweight narrative theme that provides continuity and motivation across game sessions by introducing story checkpoints, character visuals, and progression tracking. The story mode wraps the educational experience in an engaging narrative without interrupting gameplay flow. By the end of this epic, children experience a cohesive story that advances as they complete games, adding an extra layer of motivation and making WordCraft feel like a unified adventure rather than disconnected mini-games.

### Story 6.1: Select Story Theme and Create Assets

As a developer,
I want to choose a story theme and gather/create the necessary visual assets,
so that the story mode has a consistent look and feel.

**Acceptance Criteria:**
1. Story theme is selected from candidates: space adventure, treasure hunt, fantasy quest, underwater journey, etc.
2. Theme choice is documented with rationale (appeals to 5-10 age range, supports free/affordable assets)
3. Free illustration resources are identified (unDraw, Blush, Humaaans, or similar)
4. Key visual assets are collected/created: character sprite, 3-5 environment backgrounds, checkpoint icons
5. Assets are optimized for web (SVG preferred, or optimized PNG/WebP)
6. Assets are organized in `/public/story-assets/` directory
7. Asset licensing is verified as compatible with project use
8. Visual style is playful, child-friendly, and aligns with overall UI design

### Story 6.2: Create Story Progress State Machine

As a developer,
I want to build an XState machine that manages story progression and checkpoint tracking,
so that the narrative state is maintainable and persistent.

**Acceptance Criteria:**
1. `StoryProgressMachine` is created in `/machines/story-progress-machine.ts`
2. Machine has states representing story checkpoints: `intro`, `checkpoint1`, `checkpoint2`, `checkpoint3`, `finale`
3. Machine manages context: current checkpoint, games completed, story milestones unlocked
4. Machine handles events: `GAME_COMPLETED`, `CHECKPOINT_REACHED`, `STORY_RESET`
5. Progression logic: advance checkpoint every N games completed (e.g., every 5-7 games)
6. Machine persists state to IndexedDB so story resumes across sessions
7. Machine is visualizable in XState Inspector
8. Unit tests verify checkpoint progression logic

### Story 6.3: Create Story Narrative Content

As a content creator,
I want to write simple, engaging narrative text for each story checkpoint,
so that children feel part of a larger adventure.

**Acceptance Criteria:**
1. Narrative content is written for: intro, 3-4 checkpoints, finale
2. Each narrative segment is 1-3 sentences, age-appropriate, and encouraging
3. Content reinforces the learning theme (e.g., "You've mastered 5 words! The treasure map reveals the next location...")
4. Tone is positive, adventurous, and celebrates progress
5. Content is stored in a configuration file `/lib/story-content.ts`
6. Content is easily editable and supports future theme variations
7. Content avoids gender-specific pronouns (uses "you" or "the explorer")
8. Content is reviewed for age-appropriateness and clarity

### Story 6.4: Integrate Story Checkpoints into Game Session

As a child,
I want to see story updates as I complete games,
so that I feel like I'm progressing through an adventure.

**Acceptance Criteria:**
1. `GameSessionMachine` integrates with `StoryProgressMachine`
2. After every N games completed, session triggers a story checkpoint event
3. Checkpoint screen displays: character visual, environment background, narrative text, "Continue" button
4. Checkpoint celebration includes simple animation (character movement, confetti, sparkles)
5. Checkpoint screen is skippable but encouraged with 3-5 second auto-delay before "Continue" appears
6. Story progression is smooth and doesn't feel intrusive to gameplay
7. UI clearly indicates this is a story moment (different visual treatment than game screens)
8. Checkpoint data is saved so progress persists across sessions

### Story 6.5: Create Story Introduction and Finale Screens

As a child,
I want to see a story introduction when I start and a finale when I finish,
so that the experience has a clear beginning and satisfying ending.

**Acceptance Criteria:**
1. Story intro screen displays when starting a new word list for the first time
2. Intro includes: character introduction, narrative setup, "Let's Begin" button
3. Story finale screen displays when all words in list reach mastery (>80% confidence)
4. Finale includes: celebration animation, congratulatory message, character completion visual
5. Finale shows summary: words mastered, games played, time spent
6. Finale offers options: "Practice More", "Try New Words", "View Progress"
7. Intro and finale are visually distinct and celebratory
8. Screens are responsive and work on mobile and desktop

### Story 6.6: Add Visual Story Elements to Game UI

As a child,
I want to see story-themed visual elements during gameplay,
so that I feel immersed in the adventure even while playing games.

**Acceptance Criteria:**
1. Game session UI includes a subtle story banner/header showing current checkpoint
2. Character sprite appears in a corner or edge of the game screen (non-intrusive)
3. Progress bar or indicator shows advancement toward next checkpoint
4. Visual theme (colors, backgrounds) aligns with selected story theme
5. Story elements don't obscure game interactions or distract from gameplay
6. Elements are visible but not dominant (games remain the focus)
7. Responsive design ensures story elements scale appropriately on mobile
8. Visual polish: smooth transitions, subtle animations for story elements

### Story 6.7: Test Story Mode Integration and Flow

As a developer,
I want to validate that story mode enhances rather than disrupts the gameplay experience,
so that children stay engaged and motivated.

**Acceptance Criteria:**
1. Integration tests verify story checkpoints trigger at correct intervals
2. Tests verify story state persists correctly across sessions
3. Manual play-testing confirms story feels motivating, not annoying
4. Testing confirms checkpoint screens don't break game flow
5. Story intro and finale appear at appropriate times
6. Visual elements render correctly on various screen sizes
7. Story content is age-appropriate and clear to target audience
8. User testing with children (if possible) validates engagement and understanding

---

## Epic 7: Parent Dashboard & Data Management

**Expanded Goal**: Provide parents with comprehensive visibility into their child's learning progress by creating a dashboard that displays word mastery status, session history, confidence scores, and basic analytics. Additionally, implement export and import functionality to allow parents to back up and restore their data. By the end of this epic, parents can monitor learning effectiveness, identify words needing attention, and safely manage their data.

### Story 7.1: Create Dashboard Page Layout

As a parent,
I want to navigate to a dedicated dashboard page,
so that I can view my child's spelling progress.

**Acceptance Criteria:**
1. A `/dashboard` route is created with main dashboard layout
2. Page is accessible from main navigation and home page
3. Dashboard is organized into sections: Overview, Word Mastery, Session History, Analytics
4. Layout is responsive with grid/card-based design
5. Page uses parent UX paradigm: clean, glanceable, professional
6. Empty state is shown if no game session data exists yet
7. Loading states are displayed while fetching data from IndexedDB
8. Page title and breadcrumbs clearly indicate "Progress Dashboard"

### Story 7.2: Display Word Mastery Overview

As a parent,
I want to see which words my child has mastered and which need more work,
so that I can understand their progress at a glance.

**Acceptance Criteria:**
1. Dashboard displays current active word list with mastery status for each word
2. Each word shows: name, confidence score (0-100%), mastery status (needs work/progressing/mastered)
3. Visual indicators: color coding (red <60%, yellow 60-80%, green >80%), progress bars
4. Words are sortable by: confidence (low to high), alphabetically, recently practiced
5. Summary stats displayed: X/Y words mastered, overall mastery percentage
6. If multiple word lists exist, user can switch between them to view different lists
7. Clicking a word shows detailed breakdown: games played, success rate, last practiced date
8. UI is glanceable and clearly communicates status without reading detailed numbers

### Story 7.3: Display Session History

As a parent,
I want to view a history of practice sessions,
so that I can track how often and how long my child practices.

**Acceptance Criteria:**
1. Dashboard includes "Session History" section showing recent sessions
2. Each session entry shows: date/time, duration, words practiced, games completed
3. Sessions are listed in reverse chronological order (most recent first)
4. Pagination or "Load More" if many sessions exist
5. Session entries are expandable to show detailed game-by-game results
6. Visual timeline or calendar view option shows practice frequency
7. Summary stats: total sessions, total practice time, average session length
8. Data is pulled from IndexedDB game results storage

### Story 7.4: Create Analytics Visualizations

As a parent,
I want to see charts and graphs of progress over time,
so that I can understand learning trends and effectiveness.

**Acceptance Criteria:**
1. Dashboard includes "Analytics" section with data visualizations
2. Charts display: confidence scores over time (line chart), mastery progress (stacked bar)
3. Learning style distribution chart shows detected preference (pie or bar chart)
4. Session frequency chart shows practice patterns (calendar heatmap or bar chart)
5. Charts use a simple charting library (Recharts or Chart.js)
6. Charts are responsive and render correctly on mobile
7. Data ranges are configurable: last week, last month, all time
8. Charts handle edge cases gracefully (insufficient data, no data)

### Story 7.5: Implement Data Export Functionality

As a parent,
I want to export all word lists and progress data to a file,
so that I can back up my child's learning data.

**Acceptance Criteria:**
1. Dashboard includes "Export Data" button
2. Export generates a JSON file containing: word lists, game results, confidence scores, story progress
3. Exported file is timestamped (e.g., `wordcraft-backup-2025-10-18.json`)
4. File download triggers automatically when export is clicked
5. Export includes data structure version for future compatibility
6. Exported data is human-readable JSON (formatted, not minified)
7. User sees confirmation message after successful export
8. Export handles large datasets gracefully (no browser freezing)

### Story 7.6: Implement Data Import Functionality

As a parent,
I want to import a previously exported data file,
so that I can restore my child's progress on a new device or after clearing browser data.

**Acceptance Criteria:**
1. Dashboard includes "Import Data" button
2. Button opens file picker allowing user to select a JSON backup file
3. System validates imported file structure and version compatibility
4. Import merges data with existing data (handles duplicates intelligently)
5. User is prompted to confirm before overwriting existing data
6. Success/error messages clearly communicate import results
7. Import handles errors gracefully: invalid files, corrupted data, version mismatches
8. After successful import, dashboard refreshes to show restored data

### Story 7.7: Add Dashboard Navigation and Polish

As a parent,
I want easy navigation between dashboard sections and the rest of the app,
so that I can quickly check progress and return to managing word lists.

**Acceptance Criteria:**
1. Dashboard has clear navigation to: word lists, create new list, start game session
2. "Back to Word Lists" and "Back to Home" links/buttons are prominently placed
3. Dashboard sections have clear headings and visual separation
4. Loading skeletons are shown while data loads (professional UX)
5. Transitions between sections are smooth
6. Mobile navigation uses tabs or collapsible sections for space efficiency
7. Dashboard state (selected word list, expanded sections) persists during session
8. Overall polish: consistent spacing, typography, colors matching app theme

### Story 7.8: Test Dashboard Functionality and Data Integrity

As a developer,
I want to validate that the dashboard accurately displays data and export/import work reliably,
so that parents can trust the information and safely manage their data.

**Acceptance Criteria:**
1. Integration tests verify dashboard loads data correctly from IndexedDB
2. Tests verify word mastery calculations match expected confidence scores
3. Tests verify session history displays correct game results
4. Tests verify analytics charts render with sample datasets
5. Tests verify export produces valid, complete JSON
6. Tests verify import correctly restores exported data
7. Manual testing confirms dashboard is accurate against known game session data
8. Edge case testing: empty data, corrupted files, quota limits

---

## Epic 8: Polish, Performance & Launch Readiness

**Expanded Goal**: Optimize performance for fast load times and smooth interactions, add animations and micro-interactions for delightful UX, ensure cross-browser and mobile compatibility, conduct comprehensive testing, and prepare the application for beta testing and public launch. This epic transforms WordCraft from a functional MVP to a polished, production-ready application that provides an excellent user experience. By the end of this epic, WordCraft is ready for real users.

### Story 8.1: Implement Framer Motion Animations

As a user,
I want smooth, delightful animations throughout the app,
so that the experience feels polished and engaging.

**Acceptance Criteria:**
1. Framer Motion is integrated for all page transitions
2. Game components have entrance/exit animations (fade, slide, scale)
3. Celebration animations for correct answers (confetti, bounce, glow effects)
4. Button hover and click animations provide tactile feedback
5. Loading states use animated spinners or skeleton screens
6. Animations respect `prefers-reduced-motion` accessibility setting
7. Animation durations are appropriate: 150-300ms for transitions, 400-600ms for celebrations
8. Animations run smoothly at 60fps on mid-range devices

### Story 8.2: Optimize Bundle Size and Loading Performance

As a developer,
I want to optimize the application bundle for fast initial load times,
so that users can start using the app quickly, even on slower connections.

**Acceptance Criteria:**
1. Next.js bundle analyzer is run and bundle size is reviewed
2. Initial JavaScript bundle is <500KB (gzipped)
3. Game components are lazy-loaded using React.lazy() and Suspense
4. Images are optimized using Next.js Image component with proper sizing
5. Unused dependencies are identified and removed
6. Code splitting is optimized at route level
7. Initial page load time is <2 seconds on 4G connection (tested with Lighthouse)
8. Performance budget is documented and monitored

### Story 8.3: Ensure Cross-Browser Compatibility

As a user,
I want the app to work correctly on any modern browser,
so that I can use it regardless of my browser choice.

**Acceptance Criteria:**
1. App is tested on Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
2. All game mechanics work correctly across browsers
3. Touch and mouse interactions function properly
4. Animations and transitions render smoothly
5. localStorage and IndexedDB operations work reliably
6. CSS layouts render consistently (no browser-specific bugs)
7. Polyfills are added if needed for browser APIs
8. Browser compatibility is documented in README

### Story 8.4: Mobile Responsiveness and Touch Optimization

As a mobile user,
I want the app to work perfectly on my phone or tablet,
so that my child can practice spelling anywhere.

**Acceptance Criteria:**
1. All screens are tested on devices: iPhone (iOS 14+), Android phones, iPads, Android tablets
2. Touch targets meet 44x44px minimum size requirement
3. Drag-and-drop games work smoothly with touch gestures
4. Virtual keyboard doesn't obscure input fields
5. Landscape and portrait orientations both work well
6. No horizontal scrolling on any screen size (320px+)
7. Text remains readable without zooming
8. Mobile performance is smooth with no lag during interactions

### Story 8.5: Add Error Handling and User Feedback

As a user,
I want clear feedback when something goes wrong,
so that I understand what happened and how to fix it.

**Acceptance Criteria:**
1. Global error boundary catches React errors and shows friendly error screen
2. localStorage/IndexedDB quota errors show helpful messages with recovery options
3. Network errors (if any) are caught and displayed
4. Form validation errors are clear and actionable
5. Success messages confirm important actions (save, delete, export, import)
6. Loading states prevent user confusion during async operations
7. 404 and error pages match app design and provide navigation back
8. Error logging is implemented for debugging (console logs for MVP)

### Story 8.6: Comprehensive Testing and QA

As a developer,
I want to ensure all features work correctly through systematic testing,
so that users have a bug-free experience.

**Acceptance Criteria:**
1. Unit test coverage is >70% for core logic (algorithms, machines, storage)
2. Integration tests cover critical user flows: create word list → play session → view dashboard
3. All 8 game mechanics are manually tested on desktop and mobile
4. Adaptive engine is tested with simulated and real game sessions
5. Story mode progression is validated across sessions
6. Dashboard data accuracy is verified against known test data
7. Export/import functionality is tested with various scenarios
8. Regression testing is performed after bug fixes

### Story 8.7: Accessibility Audit and Improvements

As a user with accessibility needs,
I want the app to be usable with keyboard navigation and screen readers,
so that I can access all functionality.

**Acceptance Criteria:**
1. WCAG AA color contrast standards are met for all text and UI elements
2. Parent-facing screens support full keyboard navigation with visible focus states
3. Interactive elements have proper ARIA labels and roles
4. Form inputs have associated labels for screen readers
5. Error messages are announced to screen readers
6. Skip-to-content links are added where appropriate
7. Reduced motion preferences are respected
8. Accessibility audit using Lighthouse or axe DevTools shows no critical issues

### Story 8.8: Prepare for Beta Launch

As a project owner,
I want to prepare all documentation and deployment infrastructure for beta testing,
so that I can safely launch to a small group of users.

**Acceptance Criteria:**
1. README is updated with: project description, setup instructions, tech stack, contributing guidelines
2. User guide or help documentation is created for parents (simple markdown file)
3. Known limitations are documented (local storage, device-specific data, etc.)
4. Beta testing recruitment plan is prepared (target 5-10 families)
5. Feedback collection method is established (Google Form, GitHub Issues, or email)
6. Production deployment to Vercel is verified and stable
7. Simple landing page or about page explains WordCraft's purpose
8. Analytics are set up (Vercel Analytics or similar) to track usage

---

## Next Steps

### UX Expert Prompt

You are the UX Expert for WordCraft, an adaptive spelling game for children ages 5-10. Review this PRD thoroughly, particularly:

- **User Interface Design Goals section** - Understand the dual UX philosophy: "invisible for parents, magical for kids"
- **Core Screens and Views** - Familiarize yourself with the 6 main screen types
- **Requirements (FR37-FR41)** - Note responsive design and interaction requirements

**Your Task:**

Create detailed UX/UI specifications including:
1. **Wireframes** for all 6 core screens (low-fidelity sketches showing layout and hierarchy)
2. **User Flows** for critical journeys: parent creates word list → child plays session → parent views dashboard
3. **Component Specifications** for reusable UI elements (buttons, cards, forms, game containers)
4. **Interaction Patterns** for game mechanics (drag-and-drop, touch targets, animations)
5. **Visual Design System**: Color palette (parent vs. child themes), typography scale, spacing/grid system, icon style
6. **Accessibility Guidelines**: Ensure WCAG AA compliance, keyboard navigation patterns, focus states

**Deliverables:**
- UX specification document with wireframes and flows
- Design system documentation (colors, typography, components)
- Interactive prototypes (optional but recommended) for key user flows

**Key Considerations:**
- Balance playful child interface with clean parent interface
- Ensure 44x44px touch targets for all interactive elements
- Design for mobile-first, scales up to desktop
- Animations should delight but not distract
- Story mode visuals should be simple and consistent

---

### Architect Prompt

You are the Technical Architect for WordCraft, an adaptive spelling game built with React, Next.js, XState, and Tailwind CSS. Review this PRD thoroughly, particularly:

- **Technical Assumptions section** - Understand the tech stack, architecture decisions, and constraints
- **Requirements (all FR and NFR)** - Note functional and non-functional requirements
- **All 8 Epics** - Understand the full scope and sequencing of development work

**Your Task:**

Create comprehensive technical architecture documentation including:

1. **System Architecture Diagram**: Show all major components, state machines, data flows, and storage layers
2. **Data Models**: Define TypeScript types/interfaces for all entities (WordList, GameResult, ConfidenceScore, StoryProgress, etc.)
3. **XState Machine Specifications**: Detail all state machines with states, events, context, and guards
   - GameSessionMachine
   - AdaptiveEngineMachine
   - StoryProgressMachine
   - WordListMachine
4. **Component Architecture**: Define component hierarchy, props interfaces, and reusability patterns
5. **Storage Strategy**: Detail localStorage vs IndexedDB usage, data schemas, migration strategies
6. **Game Interface Design**: Specify the `GameMechanic` interface and registration pattern
7. **Algorithm Specifications**: Pseudo-code or detailed logic for:
   - Confidence scoring algorithm
   - Spaced repetition logic (Leitner or SM-2)
   - Learning style detection
   - Adaptive game selection
   - Dynamic difficulty adjustment
8. **Performance Strategy**: Code splitting, lazy loading, bundle optimization approach
9. **Testing Strategy**: Unit testing approach for machines and algorithms, integration testing patterns
10. **Deployment Architecture**: Vercel configuration, environment setup, CI/CD pipeline

**Deliverables:**
- Architecture document (`docs/architecture.md`)
- Data model definitions (`/types/*`)
- State machine diagrams and specifications
- Component structure and interface definitions
- Setup and development guides

**Key Considerations:**
- Client-side only for MVP (no backend)
- XState v5 for all complex state management
- Extensible architecture supporting NFR26 (pluggable games)
- TypeScript strict mode throughout
- Performance targets: <2s load, <100ms interaction latency
- LocalStorage + IndexedDB data persistence
- Support for future Phase 2 features (authentication, cloud sync)

**Critical Technical Decisions to Document:**
- How XState machines communicate and share state
- Storage abstraction layer for localStorage/IndexedDB
- Game registration and dynamic loading mechanism
- Adaptive engine integration points
- Story progression triggers and persistence
- Error handling and recovery strategies
- Testing infrastructure and patterns

---

**Ready to Begin Development?**

Once UX specifications and technical architecture are complete, development can begin with **Epic 1: Foundation & Project Setup**. Follow the user stories sequentially within each epic, ensuring each story's acceptance criteria are met before proceeding.

Good luck building **WordCraft**! 🚀

