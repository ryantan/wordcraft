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

