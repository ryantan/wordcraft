# Technical Assumptions

Based on the WordCraft Project Brief, here are the technical decisions that will guide the Architecture:

## Repository Structure: Monorepo

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

## Service Architecture

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

## Testing Requirements

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

## Additional Technical Assumptions and Requests

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
