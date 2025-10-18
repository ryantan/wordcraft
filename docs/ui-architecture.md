# WordCraft Frontend Architecture Document

## Template and Framework Selection

**Framework Selection:**
- **React 19+** with hooks and functional components
- **Next.js 15+** using the App Router for modern patterns
- **TypeScript** with strict mode enabled

**No Starter Template** - This is a greenfield project being built from scratch using `create-next-app` with TypeScript and App Router.

**Key Technical Constraints from PRD:**
- Client-side only (no backend for MVP)
- XState v5 for complex state management
- Tailwind CSS + shadcn/ui for styling and components
- Vercel for deployment
- localStorage + IndexedDB for data persistence

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-18 | 1.0 | Initial Frontend Architecture created from PRD | Winston (Architect) |

---

## Frontend Tech Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| **Framework** | Next.js | 15+ | Application framework | Provides App Router for modern routing patterns, built-in optimization (code splitting, image optimization), excellent DX, zero-config TypeScript support, and seamless Vercel deployment. App Router enables React Server Components (future-proofing) even though MVP is client-side. |
| **UI Library** | React | 19+ | Component library | Latest stable version with improved hooks, automatic batching, transitions API, and Suspense improvements. Functional components with hooks provide cleaner code patterns for game state management. |
| **Language** | TypeScript | 5+ (strict mode) | Type safety | Strict mode catches errors at compile-time, provides excellent IDE support, documents component contracts, and prevents runtime errors critical for children's educational software. |
| **State Management** | XState | 5 | Complex state orchestration | Purpose-built for state machines. Critical for game session flow (GameSessionMachine), adaptive learning logic (AdaptiveEngineMachine), story progression (StoryProgressMachine), and word list management (WordListMachine). Provides visualization tools, predictable state transitions, and separation of business logic from UI. |
| **Styling** | Tailwind CSS | 3+ | Utility-first CSS framework | Rapid prototyping, consistent design tokens, smaller bundle sizes (only used classes), mobile-first responsive design. Integrates seamlessly with shadcn/ui. Enables quick iteration on game UIs. |
| **Component Library** | shadcn/ui | Latest | Accessible UI primitives | Provides WCAG AA compliant components (critical for NFR14), customizable via Tailwind, copy-paste architecture (no black-box dependencies), and includes animations out-of-box. Perfect for parent dashboard and UI chrome. |
| **Animation** | Framer Motion | Latest | Declarative animations | Smooth, performant animations for game mechanics and transitions. Declarative API works well with React components. Essential for engaging children (game reveals, transitions, feedback animations). |
| **Testing - Unit** | Vitest | Latest | Fast unit testing | Drop-in replacement for Jest with faster execution, native ESM support, TypeScript support out-of-box. Tests XState machines, utility functions, and adaptive learning algorithms. |
| **Testing - Component** | React Testing Library | Latest | Component integration tests | User-centric testing approach (tests what users see), promotes accessibility, integrates with Vitest. Tests game mechanics components and UI interactions. |
| **Testing - E2E** | Playwright | Latest | End-to-end testing | Cross-browser testing (NFR11: Chrome, Safari, Firefox), mobile emulation, network mocking for localStorage/IndexedDB scenarios. Tests full game sessions. |
| **Data Persistence** | localStorage | Browser API | Simple key-value storage | Word lists (FR2: create/edit lists), user preferences, simple settings. Synchronous API, 5-10MB capacity sufficient for word data. |
| **Data Persistence** | IndexedDB | Browser API | Structured data storage | Session history (FR16-FR19), game results, confidence scores, learning style data. Async API, larger capacity (50MB+), queryable structure for analytics. |
| **Deployment** | Vercel | Latest | Hosting platform | Zero-config Next.js deployment, automatic HTTPS, edge network (NFR9: <2s initial load), preview deployments, analytics. Built by Next.js creators. |
| **Package Manager** | pnpm | Latest | Dependency management | Faster than npm/yarn, efficient disk usage (symlinks), strict dependency resolution prevents phantom dependencies. |
| **Linting** | ESLint | Latest | Code quality | Catches bugs, enforces coding standards, Next.js + React + TypeScript configs. Includes accessibility plugin for a11y rules. |
| **Formatting** | Prettier | Latest | Code formatting | Consistent code style, integrates with ESLint, reduces bikeshedding. Tailwind plugin for class ordering. |
| **Dev Tools** | XState Inspector | Latest | State machine debugging | Visualizes state machines in development, helps debug complex game flows and adaptive learning logic. Critical for developing the 4 XState machines. |
| **Form Handling** | React Hook Form | Latest | Form state management | Parent dashboard forms (word list creation), minimal re-renders, built-in validation, TypeScript support. Lighter than Formik. |
| **Date/Time** | date-fns | Latest | Date utilities | Spaced repetition scheduling (FR11: Leitner system), session timestamps, progress tracking. Tree-shakeable, immutable, TypeScript support. Lighter than moment.js. |

### Technology Rationale Summary

**Why XState for State Management?**
The game requires complex, deterministic state flows:
- **GameSessionMachine**: Manages intro → word selection → game mechanics → confidence check → next word/end flows
- **AdaptiveEngineMachine**: Coordinates confidence scoring, learning style detection, word prioritization
- **StoryProgressMachine**: Tracks narrative checkpoints, unlocks story segments
- **WordListMachine**: CRUD operations with localStorage sync

Traditional state management (Redux, Zustand) would require extensive custom logic for these flows. XState provides:
- Visual state charts for documentation
- Impossible state prevention (no "loading while loaded" bugs)
- Clear separation between business logic and UI
- Built-in developer tools for debugging

**Why Client-Side Only Architecture?**
Per PRD constraints:
- MVP doesn't require user authentication (NFR20: no auth for MVP)
- Word lists are personal/local (not shared)
- No backend reduces complexity and hosting costs
- localStorage + IndexedDB provide sufficient persistence
- Future backend can be added without frontend rewrite (Next.js supports API routes)

**Why Tailwind + shadcn/ui?**
- **Tailwind**: Utility-first approach enables rapid game UI prototyping. Developers can style directly in JSX without context switching.
- **shadcn/ui**: Provides accessible primitives (buttons, dialogs, cards) without heavyweight component library. Copy-paste model means full control over code. WCAG AA compliance built-in (NFR14).

**Why Vitest over Jest?**
- Native ESM support (Next.js 15+ uses ESM)
- 10x faster test execution
- Compatible with Jest API (easy migration path)
- Better TypeScript integration
- Lighter configuration

---

## Project Structure

### Directory Tree

```
wordcraft/
├── app/                          # Next.js 15+ App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page (word list selection)
│   ├── globals.css               # Global styles, Tailwind imports
│   ├── game/
│   │   └── page.tsx              # Main game session page
│   ├── dashboard/
│   │   └── page.tsx              # Parent dashboard
│   └── word-lists/
│       ├── page.tsx              # Word list management
│       ├── new/
│       │   └── page.tsx          # Create new word list
│       └── [id]/
│           └── page.tsx          # Edit existing word list
│
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── Container.tsx
│   ├── word-lists/
│   │   ├── WordListCard.tsx
│   │   ├── WordListForm.tsx
│   │   └── WordEditor.tsx
│   ├── dashboard/
│   │   ├── ProgressChart.tsx
│   │   ├── SessionHistory.tsx
│   │   ├── ConfidenceGrid.tsx
│   │   └── StatsOverview.tsx
│   └── game/
│       ├── GameIntro.tsx         # Story intro/context
│       ├── GameProgress.tsx      # Progress indicator
│       ├── ConfidenceIndicator.tsx
│       └── FeedbackAnimation.tsx
│
├── games/                        # Game mechanic implementations
│   ├── types.ts                  # GameMechanic interface (NFR26)
│   ├── registry.ts               # Game mechanic registry
│   ├── word-scramble/
│   │   ├── WordScramble.tsx
│   │   ├── WordScramble.test.tsx
│   │   └── index.ts
│   ├── missing-letters/
│   │   ├── MissingLetters.tsx
│   │   ├── MissingLetters.test.tsx
│   │   └── index.ts
│   ├── letter-matching/
│   │   ├── LetterMatching.tsx
│   │   └── index.ts
│   ├── spelling-challenge/
│   │   ├── SpellingChallenge.tsx
│   │   └── index.ts
│   ├── letter-hunt/
│   │   ├── LetterHunt.tsx
│   │   └── index.ts
│   ├── trace-write/
│   │   ├── TraceWrite.tsx
│   │   └── index.ts
│   ├── picture-reveal/
│   │   ├── PictureReveal.tsx
│   │   └── index.ts
│   └── word-building/
│       ├── WordBuilding.tsx
│       └── index.ts
│
├── machines/                     # XState v5 state machines
│   ├── game-session/
│   │   ├── gameSessionMachine.ts
│   │   ├── gameSessionMachine.test.ts
│   │   ├── types.ts              # Machine-specific types
│   │   └── index.ts
│   ├── adaptive-engine/
│   │   ├── adaptiveEngineMachine.ts
│   │   ├── adaptiveEngineMachine.test.ts
│   │   ├── confidence.ts         # Confidence scoring logic
│   │   ├── learning-style.ts     # Learning style detection
│   │   ├── types.ts
│   │   └── index.ts
│   ├── story-progress/
│   │   ├── storyProgressMachine.ts
│   │   ├── storyProgressMachine.test.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── word-list/
│       ├── wordListMachine.ts
│       ├── wordListMachine.test.ts
│       ├── types.ts
│       └── index.ts
│
├── lib/                          # Utilities and algorithms
│   ├── storage/
│   │   ├── localStorage.ts       # Word list storage
│   │   ├── indexedDB.ts          # Session history, game results
│   │   └── types.ts
│   ├── algorithms/
│   │   ├── leitner.ts            # Leitner spaced repetition
│   │   ├── confidence-scoring.ts # Confidence calculation
│   │   ├── word-selection.ts     # Adaptive word prioritization
│   │   └── learning-style.ts     # Learning style detection
│   ├── game-logic/
│   │   ├── word-helpers.ts       # Scramble, missing letters logic
│   │   └── validation.ts         # Answer validation
│   └── utils/
│       ├── cn.ts                 # Tailwind class merging
│       ├── date.ts               # Date formatting helpers
│       └── analytics.ts          # Client-side analytics helpers
│
├── hooks/                        # Custom React hooks
│   ├── useGameSession.ts         # Game session machine hook
│   ├── useAdaptiveEngine.ts      # Adaptive engine machine hook
│   ├── useStoryProgress.ts       # Story progress machine hook
│   ├── useWordList.ts            # Word list machine hook
│   ├── useLocalStorage.ts        # localStorage sync hook
│   ├── useIndexedDB.ts           # IndexedDB operations hook
│   └── useConfidenceTracking.ts  # Confidence state hook
│
├── types/                        # TypeScript type definitions
│   ├── word.ts                   # Word, WordList types
│   ├── game.ts                   # GameMechanic, GameResult types
│   ├── session.ts                # GameSession, SessionHistory types
│   ├── confidence.ts             # ConfidenceScore, LearningStyle types
│   ├── story.ts                  # StorySegment, StoryProgress types
│   └── index.ts                  # Re-exports
│
├── public/                       # Static assets
│   ├── images/
│   │   ├── story/                # Story mode illustrations
│   │   ├── games/                # Game mechanic assets
│   │   └── ui/                   # UI icons, logos
│   ├── sounds/                   # Audio feedback (optional)
│   └── fonts/                    # Custom fonts (if needed)
│
├── __tests__/                    # Integration and E2E tests
│   ├── integration/
│   │   ├── game-session.test.tsx
│   │   └── adaptive-engine.test.tsx
│   └── e2e/
│       ├── game-flow.spec.ts
│       └── word-list-management.spec.ts
│
├── .vscode/                      # VS Code settings
│   └── settings.json             # Recommended extensions, configs
│
├── components.json               # shadcn/ui configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
├── vitest.config.ts              # Vitest configuration
├── playwright.config.ts          # Playwright configuration
├── .eslintrc.json                # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── package.json                  # Dependencies
└── pnpm-lock.yaml                # Lock file
```

### Directory Responsibilities

#### `/app` - Next.js App Router
- **Purpose**: Application routes and pages using Next.js 15+ App Router
- **Pattern**: File-system based routing
- **Key Files**:
  - `layout.tsx`: Root layout wrapping all pages with XState providers, theme provider
  - `page.tsx`: Home page showing word list selection
  - `game/page.tsx`: Main game session orchestrator
  - `dashboard/page.tsx`: Parent analytics dashboard
  - `word-lists/`: Word list CRUD operations

#### `/components` - UI Components
- **Purpose**: Reusable React components organized by domain
- **Pattern**: Domain-driven organization (not atomic design)
- **Subdirectories**:
  - `ui/`: shadcn/ui primitives (button, card, dialog, etc.)
  - `layout/`: App-wide layout components
  - `word-lists/`: Word list management components
  - `dashboard/`: Parent dashboard components (charts, stats)
  - `game/`: Shared game UI components (progress, feedback)

#### `/games` - Game Mechanics
- **Purpose**: Individual game mechanic implementations (NFR26 flexibility)
- **Pattern**: Each game mechanic is a self-contained module
- **Structure**:
  - `types.ts`: Defines `GameMechanic` interface all games implement
  - `registry.ts`: Maps game IDs to components for dynamic loading
  - Each game folder: Component + tests + index
- **Key Requirement**: New games added by creating folder + implementing interface

#### `/machines` - XState State Machines
- **Purpose**: Complex state orchestration using XState v5
- **Pattern**: One folder per machine with types and tests
- **Four Machines**:
  1. `game-session/`: Overall game flow (intro → words → mechanics → end)
  2. `adaptive-engine/`: Confidence scoring, word prioritization, learning style
  3. `story-progress/`: Narrative checkpoints and story unlocks
  4. `word-list/`: Word list CRUD with localStorage sync
- **Testing**: Each machine has comprehensive unit tests

#### `/lib` - Utilities & Algorithms
- **Purpose**: Pure functions and business logic
- **Subdirectories**:
  - `storage/`: localStorage + IndexedDB abstractions
  - `algorithms/`: Leitner system, confidence scoring, word selection
  - `game-logic/`: Word scrambling, validation helpers
  - `utils/`: General utilities (class names, date formatting)

#### `/hooks` - Custom React Hooks
- **Purpose**: React hooks wrapping XState machines and side effects
- **Pattern**: One hook per machine + utility hooks
- **Key Hooks**:
  - `useGameSession()`: Provides game session state and actions
  - `useAdaptiveEngine()`: Provides confidence scores and word priorities
  - `useStoryProgress()`: Provides story state and unlocks
  - `useWordList()`: Provides word list CRUD operations

#### `/types` - TypeScript Definitions
- **Purpose**: Shared TypeScript types and interfaces
- **Pattern**: Organized by domain (word, game, session, etc.)
- **Files**: Each domain gets its own file, re-exported via `index.ts`

#### `/public` - Static Assets
- **Purpose**: Images, fonts, audio served statically
- **Subdirectories**:
  - `images/story/`: Story mode illustrations
  - `images/games/`: Game-specific assets (picture reveal, etc.)
  - `sounds/`: Audio feedback for correct/incorrect answers (optional)

### File Naming Conventions

- **Components**: PascalCase (`WordListCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useGameSession.ts`)
- **Utilities**: camelCase (`confidence-scoring.ts` for files, functions camelCase)
- **Types**: camelCase files (`word.ts`), PascalCase types (`WordList`)
- **Tests**: Same name as file with `.test.tsx` or `.spec.ts` extension
- **Machines**: camelCase with `Machine` suffix (`gameSessionMachine.ts`)

### Import Aliases

Configure `tsconfig.json` with path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/games/*": ["./games/*"],
      "@/machines/*": ["./machines/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"]
    }
  }
}
```

**Usage Example**:
```typescript
import { WordListCard } from '@/components/word-lists/WordListCard'
import { useGameSession } from '@/hooks/useGameSession'
import type { GameMechanic } from '@/games/types'
```

---

## Component Standards

### Component Template

All React components follow this standard structure:

```typescript
'use client' // Only if client component (uses hooks, event handlers)

import { type FC, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

// Types/Interfaces
interface ComponentNameProps {
  // Required props first
  id: string
  title: string
  // Optional props second
  description?: string
  className?: string
  children?: ReactNode
  // Event handlers last
  onAction?: () => void
}

// Component
export const ComponentName: FC<ComponentNameProps> = ({
  id,
  title,
  description,
  className,
  children,
  onAction,
}) => {
  // Hooks at the top
  const [state, setState] = useState<string>('')

  // Event handlers
  const handleClick = () => {
    onAction?.()
  }

  // Render helpers (if needed)
  const renderContent = () => {
    return <div>{children}</div>
  }

  // Early returns for loading/error states
  if (!title) {
    return null
  }

  // Main render
  return (
    <div className={cn('base-styles', className)} data-testid={`component-${id}`}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {renderContent()}
    </div>
  )
}

// Display name for debugging
ComponentName.displayName = 'ComponentName'
```

### Component Categories

#### 1. Server Components (Default)
Use server components by default in Next.js 15+. No `'use client'` directive needed.

```typescript
// app/dashboard/page.tsx
import { SessionHistory } from '@/components/dashboard/SessionHistory'

export default async function DashboardPage() {
  // Can fetch data directly in server component
  return (
    <div>
      <h1>Parent Dashboard</h1>
      <SessionHistory />
    </div>
  )
}
```

#### 2. Client Components
Add `'use client'` when component uses:
- React hooks (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- Context consumers

```typescript
'use client'

import { useState } from 'react'

export const InteractiveComponent: FC<Props> = () => {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  )
}
```

### Props Patterns

#### 1. Discriminated Union Props
For components with different modes:

```typescript
type BaseProps = {
  id: string
  className?: string
}

type ViewMode = BaseProps & {
  mode: 'view'
  data: WordList
}

type EditMode = BaseProps & {
  mode: 'edit'
  data: WordList
  onSave: (data: WordList) => void
}

type WordListCardProps = ViewMode | EditMode

export const WordListCard: FC<WordListCardProps> = (props) => {
  if (props.mode === 'view') {
    // TypeScript knows props.data exists, props.onSave doesn't
    return <div>{props.data.name}</div>
  }

  // TypeScript knows props.onSave exists here
  return <form onSubmit={() => props.onSave(props.data)}>...</form>
}
```

#### 2. Render Props for Flexibility

```typescript
interface GameMechanicWrapperProps {
  word: string
  children: (helpers: {
    checkAnswer: (answer: string) => boolean
    giveHint: () => string
  }) => ReactNode
}

export const GameMechanicWrapper: FC<GameMechanicWrapperProps> = ({
  word,
  children
}) => {
  const checkAnswer = (answer: string) => answer === word
  const giveHint = () => word[0]

  return <>{children({ checkAnswer, giveHint })}</>
}
```

#### 3. Compound Components

```typescript
// Main component
export const WordList: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="word-list">{children}</div>
}

// Sub-components
WordList.Header = ({ title }: { title: string }) => <h2>{title}</h2>
WordList.Item = ({ word }: { word: string }) => <li>{word}</li>

// Usage
<WordList>
  <WordList.Header title="My Words" />
  <WordList.Item word="cat" />
  <WordList.Item word="dog" />
</WordList>
```

### Game Mechanic Interface (NFR26)

All game mechanics must implement this interface for pluggability:

```typescript
// games/types.ts
export interface GameMechanicProps {
  word: string
  onComplete: (result: GameResult) => void
  onHintRequest?: () => void
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface GameResult {
  word: string
  correct: boolean
  attempts: number
  timeMs: number
  hintsUsed: number
}

export interface GameMechanicMeta {
  id: string
  name: string
  description: string
  targetAge: [number, number] // [min, max]
  supportsHints: boolean
}
```

**Example Implementation**:

```typescript
// games/word-scramble/WordScramble.tsx
'use client'

import { type FC, useState } from 'react'
import type { GameMechanicProps, GameResult } from '@/games/types'

export const WordScramble: FC<GameMechanicProps> = ({
  word,
  onComplete,
  onHintRequest,
  difficulty = 'medium'
}) => {
  const [guess, setGuess] = useState('')
  const [attempts, setAttempts] = useState(0)
  const startTime = useRef(Date.now())

  const handleSubmit = () => {
    setAttempts(a => a + 1)
    const correct = guess.toLowerCase() === word.toLowerCase()

    if (correct) {
      const result: GameResult = {
        word,
        correct: true,
        attempts: attempts + 1,
        timeMs: Date.now() - startTime.current,
        hintsUsed: 0
      }
      onComplete(result)
    }
  }

  return (
    <div data-testid="word-scramble">
      {/* Game UI */}
    </div>
  )
}

// Metadata export
export const meta: GameMechanicMeta = {
  id: 'word-scramble',
  name: 'Word Scramble',
  description: 'Unscramble the letters to spell the word',
  targetAge: [5, 10],
  supportsHints: true
}
```

**Registry Pattern**:

```typescript
// games/registry.ts
import type { FC } from 'react'
import type { GameMechanicProps, GameMechanicMeta } from './types'

import { WordScramble, meta as wordScrambleMeta } from './word-scramble'
import { MissingLetters, meta as missingLettersMeta } from './missing-letters'
// ... other imports

export const gameRegistry: Record<string, {
  Component: FC<GameMechanicProps>
  meta: GameMechanicMeta
}> = {
  'word-scramble': { Component: WordScramble, meta: wordScrambleMeta },
  'missing-letters': { Component: MissingLetters, meta: missingLettersMeta },
  // ... other games
}

export const getGameMechanic = (id: string) => gameRegistry[id]
export const getAllGames = () => Object.values(gameRegistry)
```

### Error Boundaries

Wrap game mechanics and critical UI in error boundaries:

```typescript
// components/ErrorBoundary.tsx
'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div role="alert">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Accessibility Requirements (NFR14 - WCAG AA)

All components must meet WCAG AA standards:

```typescript
// Good accessibility example
export const AccessibleButton: FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  loading
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled}
      className={cn(
        'min-h-[44px] min-w-[44px]', // Touch target size
        'focus-visible:ring-2 focus-visible:ring-blue-500', // Visible focus
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {loading && <span className="sr-only">Loading...</span>}
      {children}
    </button>
  )
}
```

**Accessibility Checklist**:
- ✅ Semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- ✅ ARIA labels for screen readers
- ✅ Keyboard navigation support (Tab, Enter, Escape)
- ✅ Focus visible states (`:focus-visible`)
- ✅ Color contrast ≥4.5:1 for text
- ✅ Touch targets ≥44x44px (mobile)
- ✅ Skip links for keyboard navigation
- ✅ Alt text for images

### Loading States

Consistent loading patterns across the app:

```typescript
// components/LoadingState.tsx
export const LoadingSpinner: FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md'
}) => (
  <div
    role="status"
    aria-label="Loading"
    className={cn(
      'animate-spin rounded-full border-2 border-gray-300 border-t-blue-500',
      size === 'sm' && 'h-4 w-4',
      size === 'md' && 'h-8 w-8',
      size === 'lg' && 'h-12 w-12'
    )}
  >
    <span className="sr-only">Loading...</span>
  </div>
)

// Skeleton loading
export const SkeletonCard: FC = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
  </div>
)

// Suspense boundaries
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <AsyncComponent />
    </Suspense>
  )
}
```

### Testing Standards

Every component should have corresponding tests:

```typescript
// components/word-lists/WordListCard.test.tsx
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { WordListCard } from './WordListCard'

describe('WordListCard', () => {
  it('renders word list name', () => {
    render(<WordListCard data={{ id: '1', name: 'Animals' }} mode="view" />)
    expect(screen.getByText('Animals')).toBeInTheDocument()
  })

  it('calls onSave when in edit mode', async () => {
    const onSave = vi.fn()
    render(
      <WordListCard
        data={{ id: '1', name: 'Animals' }}
        mode="edit"
        onSave={onSave}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onSave).toHaveBeenCalled()
  })

  it('is accessible', async () => {
    const { container } = render(<WordListCard data={{ id: '1', name: 'Animals' }} mode="view" />)

    // Check for semantic HTML
    expect(container.querySelector('article')).toBeInTheDocument()

    // Check keyboard navigation
    const card = screen.getByRole('article')
    card.focus()
    expect(card).toHaveFocus()
  })
})
```

---

## State Management

### XState v5 Architecture

WordCraft uses **XState v5** for state orchestration instead of traditional state management (Redux, Zustand) because:
- Game flow has complex, deterministic state transitions
- Visual state machines serve as documentation
- Prevents impossible states (e.g., "playing while loading")
- Separates business logic from UI components

### Four Core Machines

```
┌─────────────────────┐
│  GameSessionMachine │  ← Orchestrates overall game flow
└──────────┬──────────┘
           │
           ├───→ ┌────────────────────┐
           │     │ AdaptiveEngineM... │  ← Manages confidence, learning style
           │     └────────────────────┘
           │
           ├───→ ┌────────────────────┐
           │     │ StoryProgressMac...│  ← Tracks narrative progression
           │     └────────────────────┘
           │
           └───→ ┌────────────────────┐
                 │   WordListMachine  │  ← CRUD for word lists
                 └────────────────────┘
```

### 1. GameSessionMachine

**Purpose**: Orchestrates the game session from start to finish

**States**:
```
idle → loading → intro → selectingWord → playingGame → checkingConfidence → [nextWord | ending] → complete
```

**Context**:
```typescript
interface GameSessionContext {
  wordListId: string
  currentWordIndex: number
  words: Word[]
  completedWords: Set<string>
  currentGameMechanic: string | null
  sessionStartTime: number
  results: GameResult[]
}
```

**Events**:
```typescript
type GameSessionEvent =
  | { type: 'START'; wordListId: string }
  | { type: 'WORD_SELECTED'; word: Word; gameMechanic: string }
  | { type: 'GAME_COMPLETE'; result: GameResult }
  | { type: 'CONFIDENCE_CHECKED'; isConfident: boolean }
  | { type: 'NEXT_WORD' }
  | { type: 'END_SESSION' }
```

**Machine Definition**:
```typescript
// machines/game-session/gameSessionMachine.ts
import { createMachine, assign } from 'xstate'

export const gameSessionMachine = createMachine({
  id: 'gameSession',
  initial: 'idle',
  context: {
    wordListId: '',
    currentWordIndex: 0,
    words: [],
    completedWords: new Set(),
    currentGameMechanic: null,
    sessionStartTime: 0,
    results: []
  },
  states: {
    idle: {
      on: {
        START: {
          target: 'loading',
          actions: assign({
            wordListId: ({ event }) => event.wordListId,
            sessionStartTime: () => Date.now()
          })
        }
      }
    },
    loading: {
      invoke: {
        src: 'loadWordList',
        onDone: {
          target: 'intro',
          actions: assign({
            words: ({ event }) => event.output
          })
        },
        onError: 'error'
      }
    },
    intro: {
      after: {
        3000: 'selectingWord' // Auto-transition after story intro
      }
    },
    selectingWord: {
      entry: 'selectNextWord',
      always: [
        { guard: 'allWordsConfident', target: 'ending' },
        { target: 'playingGame' }
      ]
    },
    playingGame: {
      on: {
        GAME_COMPLETE: {
          target: 'checkingConfidence',
          actions: assign({
            results: ({ context, event }) => [...context.results, event.result]
          })
        }
      }
    },
    checkingConfidence: {
      invoke: {
        src: 'checkConfidence',
        onDone: [
          {
            guard: ({ event }) => event.output.isConfident,
            target: 'selectingWord',
            actions: 'markWordConfident'
          },
          {
            target: 'playingGame',
            actions: 'selectNewGameMechanic'
          }
        ]
      }
    },
    ending: {
      entry: 'saveSessionResults',
      after: {
        2000: 'complete'
      }
    },
    complete: {
      type: 'final'
    },
    error: {
      on: {
        RETRY: 'loading'
      }
    }
  }
}, {
  actions: {
    selectNextWord: assign({
      currentWordIndex: ({ context }) => {
        // Logic to select next word based on confidence
        return context.currentWordIndex + 1
      }
    }),
    markWordConfident: assign({
      completedWords: ({ context, event }) => {
        const newSet = new Set(context.completedWords)
        newSet.add(context.words[context.currentWordIndex].text)
        return newSet
      }
    })
  },
  guards: {
    allWordsConfident: ({ context }) => {
      return context.completedWords.size === context.words.length
    }
  }
})
```

**React Hook**:
```typescript
// hooks/useGameSession.ts
'use client'

import { useMachine } from '@xstate/react'
import { gameSessionMachine } from '@/machines/game-session'

export const useGameSession = () => {
  const [state, send] = useMachine(gameSessionMachine, {
    services: {
      loadWordList: async ({ wordListId }) => {
        const storage = await getWordList(wordListId)
        return storage.words
      },
      checkConfidence: async ({ results, currentWord }) => {
        // Invoke adaptive engine to check confidence
        const confidence = calculateConfidence(results, currentWord)
        return { isConfident: confidence > 0.8 }
      }
    }
  })

  return {
    state: state.value,
    context: state.context,
    startSession: (wordListId: string) => send({ type: 'START', wordListId }),
    completeGame: (result: GameResult) => send({ type: 'GAME_COMPLETE', result }),
    endSession: () => send({ type: 'END_SESSION' }),
    isPlaying: state.matches('playingGame'),
    isComplete: state.matches('complete')
  }
}
```

### 2. AdaptiveEngineMachine

**Purpose**: Manages confidence scoring, learning style detection, and word prioritization

**States**:
```
idle → analyzing → updatingConfidence → detectingStyle → prioritizing → ready
```

**Context**:
```typescript
interface AdaptiveEngineContext {
  wordConfidences: Map<string, ConfidenceScore>
  learningStyle: LearningStyle | null
  gamePerformance: Map<string, number[]> // game mechanic → scores
  currentWord: string | null
  recommendations: {
    nextGameMechanic: string
    shouldRetry: boolean
    suggestedDifficulty: 'easy' | 'medium' | 'hard'
  }
}

interface ConfidenceScore {
  word: string
  score: number // 0-1
  lastPracticed: Date
  attempts: number
  successRate: number
}

type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
```

**Events**:
```typescript
type AdaptiveEngineEvent =
  | { type: 'ANALYZE_RESULT'; result: GameResult }
  | { type: 'REQUEST_NEXT_WORD' }
  | { type: 'UPDATE_CONFIDENCE'; word: string; delta: number }
```

**Machine Definition** (simplified):
```typescript
export const adaptiveEngineMachine = createMachine({
  id: 'adaptiveEngine',
  initial: 'idle',
  context: {
    wordConfidences: new Map(),
    learningStyle: null,
    gamePerformance: new Map(),
    currentWord: null,
    recommendations: {
      nextGameMechanic: 'word-scramble',
      shouldRetry: false,
      suggestedDifficulty: 'medium'
    }
  },
  states: {
    idle: {
      on: {
        ANALYZE_RESULT: 'analyzing'
      }
    },
    analyzing: {
      entry: 'analyzeGameResult',
      always: 'updatingConfidence'
    },
    updatingConfidence: {
      invoke: {
        src: 'calculateConfidence',
        onDone: {
          target: 'detectingStyle',
          actions: assign({
            wordConfidences: ({ event }) => event.output
          })
        }
      }
    },
    detectingStyle: {
      invoke: {
        src: 'detectLearningStyle',
        onDone: {
          target: 'prioritizing',
          actions: assign({
            learningStyle: ({ event }) => event.output
          })
        }
      }
    },
    prioritizing: {
      entry: 'generateRecommendations',
      always: 'ready'
    },
    ready: {
      on: {
        ANALYZE_RESULT: 'analyzing',
        REQUEST_NEXT_WORD: {
          actions: 'provideNextWord'
        }
      }
    }
  }
})
```

**Key Algorithms**:
```typescript
// machines/adaptive-engine/confidence.ts
export const calculateConfidence = (
  word: string,
  results: GameResult[]
): number => {
  const wordResults = results.filter(r => r.word === word)
  if (wordResults.length === 0) return 0

  const recentResults = wordResults.slice(-5) // Last 5 attempts
  const successRate = recentResults.filter(r => r.correct).length / recentResults.length
  const avgAttempts = recentResults.reduce((sum, r) => sum + r.attempts, 0) / recentResults.length

  // Lower attempts = higher confidence
  const attemptScore = Math.max(0, 1 - (avgAttempts - 1) * 0.2)

  // Combine success rate and attempt efficiency
  return (successRate * 0.7) + (attemptScore * 0.3)
}

// machines/adaptive-engine/learning-style.ts
export const detectLearningStyle = (
  gamePerformance: Map<string, number[]>
): LearningStyle => {
  const visualGames = ['picture-reveal', 'letter-matching']
  const auditoryGames = ['spelling-challenge'] // (if we add audio)
  const kinestheticGames = ['trace-write', 'word-building']

  const visualScore = getAveragePerformance(gamePerformance, visualGames)
  const kinestheticScore = getAveragePerformance(gamePerformance, kinestheticGames)

  if (Math.abs(visualScore - kinestheticScore) < 0.1) return 'mixed'
  return visualScore > kinestheticScore ? 'visual' : 'kinesthetic'
}
```

### 3. StoryProgressMachine

**Purpose**: Tracks narrative checkpoints and unlocks story segments

**States**:
```
chapter1 → checkpoint1 → chapter2 → checkpoint2 → ... → finale → complete
```

**Context**:
```typescript
interface StoryProgressContext {
  currentChapter: number
  unlockedSegments: string[]
  wordsRequired: number
  wordsCompleted: number
}
```

**Machine Definition** (simplified):
```typescript
export const storyProgressMachine = createMachine({
  id: 'storyProgress',
  initial: 'chapter1',
  context: {
    currentChapter: 1,
    unlockedSegments: ['intro'],
    wordsRequired: 3,
    wordsCompleted: 0
  },
  states: {
    chapter1: {
      on: {
        WORD_MASTERED: {
          actions: assign({
            wordsCompleted: ({ context }) => context.wordsCompleted + 1
          })
        }
      },
      always: {
        guard: ({ context }) => context.wordsCompleted >= context.wordsRequired,
        target: 'checkpoint1'
      }
    },
    checkpoint1: {
      entry: assign({
        unlockedSegments: ({ context }) => [...context.unlockedSegments, 'chapter1-end'],
        currentChapter: 2,
        wordsCompleted: 0
      }),
      after: {
        5000: 'chapter2'
      }
    },
    // ... more chapters
    finale: {
      entry: 'unlockFinalSegment',
      after: {
        10000: 'complete'
      }
    },
    complete: {
      type: 'final'
    }
  }
})
```

### 4. WordListMachine

**Purpose**: CRUD operations for word lists with localStorage sync

**States**:
```
idle → creating | loading | updating | deleting → syncing → idle
```

**Context**:
```typescript
interface WordListContext {
  lists: WordList[]
  currentList: WordList | null
  error: Error | null
}
```

**Machine Definition**:
```typescript
export const wordListMachine = createMachine({
  id: 'wordList',
  initial: 'idle',
  context: {
    lists: [],
    currentList: null,
    error: null
  },
  states: {
    idle: {
      on: {
        CREATE: 'creating',
        LOAD: 'loading',
        UPDATE: 'updating',
        DELETE: 'deleting'
      }
    },
    creating: {
      invoke: {
        src: 'createWordList',
        onDone: {
          target: 'syncing',
          actions: assign({
            currentList: ({ event }) => event.output
          })
        },
        onError: {
          target: 'idle',
          actions: assign({
            error: ({ event }) => event.error
          })
        }
      }
    },
    syncing: {
      invoke: {
        src: 'syncToStorage',
        onDone: 'idle'
      }
    }
    // ... other states
  }
})
```

### Machine Communication

Machines communicate via events and context:

```typescript
// app/game/page.tsx
'use client'

import { useGameSession } from '@/hooks/useGameSession'
import { useAdaptiveEngine } from '@/hooks/useAdaptiveEngine'
import { useStoryProgress } from '@/hooks/useStoryProgress'

export default function GamePage() {
  const gameSession = useGameSession()
  const adaptiveEngine = useAdaptiveEngine()
  const storyProgress = useStoryProgress()

  const handleGameComplete = (result: GameResult) => {
    // 1. Send result to game session
    gameSession.completeGame(result)

    // 2. Analyze with adaptive engine
    adaptiveEngine.analyzeResult(result)

    // 3. Check if confidence met for story progress
    if (result.correct && adaptiveEngine.isConfident(result.word)) {
      storyProgress.wordMastered()
    }
  }

  return (
    <div>
      {/* Game UI */}
    </div>
  )
}
```

### XState DevTools

Enable XState Inspector in development:

```typescript
// app/layout.tsx
'use client'

import { useEffect } from 'react'
import { inspect } from '@xstate/inspect'

export default function RootLayout({ children }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      inspect({
        iframe: false // Use browser extension
      })
    }
  }, [])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

**Inspector Benefits**:
- Visualize state machines in real-time
- See state transitions as they happen
- Inspect context changes
- Send events manually for testing

---

## Routing

### Next.js 15+ App Router

WordCraft uses the **App Router** (not Pages Router) for modern routing patterns.

**Route Structure**:
```
app/
├── layout.tsx              → Root layout (/)
├── page.tsx                → Home page (/)
├── game/
│   ├── page.tsx            → Game session (/game)
│   └── layout.tsx          → Game layout (optional)
├── dashboard/
│   └── page.tsx            → Parent dashboard (/dashboard)
└── word-lists/
    ├── page.tsx            → List all word lists (/word-lists)
    ├── new/
    │   └── page.tsx        → Create new list (/word-lists/new)
    └── [id]/
        ├── page.tsx        → View/edit list (/word-lists/:id)
        └── layout.tsx      → Word list detail layout
```

### Root Layout

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WordCraft - Adaptive Spelling Game',
  description: 'Fun, adaptive spelling game for children ages 5-10',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}
```

### Navigation Component

```typescript
// components/layout/Navigation.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

const routes = [
  { path: '/', label: 'Home' },
  { path: '/word-lists', label: 'Word Lists' },
  { path: '/dashboard', label: 'Dashboard' },
]

export const Navigation = () => {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation">
      <ul className="flex gap-4">
        {routes.map((route) => (
          <li key={route.path}>
            <Link
              href={route.path}
              className={cn(
                'px-4 py-2 rounded-md transition-colors',
                pathname === route.path
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200'
              )}
              aria-current={pathname === route.path ? 'page' : undefined}
            >
              {route.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

### Dynamic Routes

**Word List Detail** (`/word-lists/[id]`):

```typescript
// app/word-lists/[id]/page.tsx
import { notFound } from 'next/navigation'

interface PageProps {
  params: { id: string }
  searchParams: { edit?: string }
}

export default function WordListDetailPage({ params, searchParams }: PageProps) {
  const { id } = params
  const isEditMode = searchParams.edit === 'true'

  // Since we're client-side only, data loading happens in component
  return (
    <div>
      <h1>Word List: {id}</h1>
      {isEditMode ? <EditForm id={id} /> : <ViewMode id={id} />}
    </div>
  )
}

// Generate metadata dynamically
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Word List - WordCraft`,
    description: `View and edit word list`
  }
}
```

### Programmatic Navigation

```typescript
'use client'

import { useRouter } from 'next/navigation'

export const WordListCard = ({ id }: { id: string }) => {
  const router = useRouter()

  const handleEdit = () => {
    router.push(`/word-lists/${id}?edit=true`)
  }

  const handleStart = () => {
    router.push(`/game?listId=${id}`)
  }

  return (
    <div>
      <button onClick={handleEdit}>Edit</button>
      <button onClick={handleStart}>Start Game</button>
    </div>
  )
}
```

### Loading States

**Global Loading** (`app/loading.tsx`):
```typescript
// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  )
}
```

**Route-Specific Loading** (`app/dashboard/loading.tsx`):
```typescript
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div>
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}
```

### Error Handling

**Global Error Boundary** (`app/error.tsx`):
```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  )
}
```

**Route-Specific Error** (`app/game/error.tsx`):
```typescript
// app/game/error.tsx
'use client'

export default function GameError({ error, reset }: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="p-8 text-center">
      <h2>Game Error</h2>
      <p>We couldn't load the game. Please try again.</p>
      <button onClick={reset}>Restart Game</button>
    </div>
  )
}
```

### Not Found Page

```typescript
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
      <p className="text-gray-600 mt-2 mb-6">
        The page you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Go Home
      </Link>
    </div>
  )
}
```

### Route Groups (Optional)

For organizing routes without affecting URL structure:

```
app/
├── (marketing)/          → Route group (doesn't affect URL)
│   ├── layout.tsx        → Marketing layout
│   ├── page.tsx          → Home page (/)
│   └── about/
│       └── page.tsx      → About page (/about)
│
└── (app)/                → Route group
    ├── layout.tsx        → App layout (with navigation)
    ├── game/
    │   └── page.tsx      → Game (/game)
    └── dashboard/
        └── page.tsx      → Dashboard (/dashboard)
```

**Route Group Layout**:
```typescript
// app/(app)/layout.tsx
import { Navigation } from '@/components/layout/Navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navigation />
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  )
}
```

### Parallel Routes (Advanced)

For rendering multiple pages simultaneously:

```
app/
└── dashboard/
    ├── @stats/
    │   └── page.tsx      → Stats slot
    ├── @activity/
    │   └── page.tsx      → Activity slot
    └── layout.tsx        → Receives both slots
```

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  stats,
  activity,
}: {
  stats: React.ReactNode
  activity: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>{stats}</div>
      <div>{activity}</div>
    </div>
  )
}
```

### Intercepting Routes (Modals)

For modal routes that intercept navigation:

```
app/
├── word-lists/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
└── @modal/
    └── word-lists/
        └── (.)[id]/
            └── page.tsx  → Modal version
```

### Middleware (Future)

For authentication or redirects (when backend is added):

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check authentication
  const token = request.cookies.get('token')

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/game/:path*']
}
```

### Prefetching and Performance

**Automatic Prefetching**:
Next.js automatically prefetches links in viewport:

```typescript
// Prefetched by default
<Link href="/game">Start Game</Link>

// Disable prefetching
<Link href="/dashboard" prefetch={false}>Dashboard</Link>
```

**Manual Prefetching**:
```typescript
'use client'

import { useRouter } from 'next/navigation'

export const WordListCard = ({ id }: { id: string }) => {
  const router = useRouter()

  const handleMouseEnter = () => {
    // Prefetch game route on hover
    router.prefetch(`/game?listId=${id}`)
  }

  return (
    <div onMouseEnter={handleMouseEnter}>
      {/* Card content */}
    </div>
  )
}
```

### Route Handlers (API Routes)

For future backend integration:

```typescript
// app/api/word-lists/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  // Fetch from database
  const lists = await fetchWordLists()
  return NextResponse.json(lists)
}

export async function POST(request: Request) {
  const body = await request.json()
  // Create word list
  const list = await createWordList(body)
  return NextResponse.json(list, { status: 201 })
}
```

### Metadata

**Static Metadata**:
```typescript
// app/game/page.tsx
export const metadata = {
  title: 'Play Game - WordCraft',
  description: 'Play adaptive spelling games',
}
```

**Dynamic Metadata**:
```typescript
// app/word-lists/[id]/page.tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const list = await getWordList(params.id)

  return {
    title: `${list.name} - WordCraft`,
    description: `Practice spelling with ${list.words.length} words`,
  }
}
```

---

## Styling Guidelines

### Tailwind CSS Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './games/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette (blue)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main brand color
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Secondary palette (green for success)
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          700: '#15803d',
        },
        // Error palette (red)
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          700: '#b91c1c',
        },
        // Warning palette (yellow)
        warning: {
          50: '#fefce8',
          100: '#fef3c7',
          500: '#eab308',
          700: '#a16207',
        },
        // Neutral palette (gray)
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'], // For headings
      },
      fontSize: {
        // Child-friendly sizes (slightly larger)
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        // Additional spacing for game mechanics
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        // Custom animations for game feedback
        'bounce-slow': 'bounce 1.5s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'success-pulse': 'successPulse 0.6s ease-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        successPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),      // Better form styles
    require('tailwindcss-animate'),     // Animation utilities
  ],
}

export default config
```

### Global Styles

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Child-friendly base styles */
  html {
    @apply antialiased;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-gray-50 text-gray-900;
  }

  /* Larger touch targets for children */
  button,
  a,
  input,
  select {
    @apply min-h-[44px] min-w-[44px];
  }

  /* Focus visible for keyboard navigation */
  *:focus-visible {
    @apply outline-none ring-2 ring-primary-500 ring-offset-2;
  }

  /* Heading styles */
  h1 {
    @apply text-4xl font-bold font-display text-gray-900;
  }

  h2 {
    @apply text-3xl font-semibold font-display text-gray-800;
  }

  h3 {
    @apply text-2xl font-semibold font-display text-gray-800;
  }
}

@layer components {
  /* Button variants */
  .btn {
    @apply px-6 py-3 rounded-lg font-medium transition-all duration-200;
    @apply focus-visible:ring-2 focus-visible:ring-offset-2;
  }

  .btn-primary {
    @apply btn bg-primary-500 text-white hover:bg-primary-600;
    @apply focus-visible:ring-primary-500;
  }

  .btn-secondary {
    @apply btn bg-gray-200 text-gray-900 hover:bg-gray-300;
    @apply focus-visible:ring-gray-500;
  }

  .btn-success {
    @apply btn bg-success-500 text-white hover:bg-success-600;
    @apply focus-visible:ring-success-500;
  }

  .btn-lg {
    @apply px-8 py-4 text-lg;
  }

  /* Card component */
  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6;
  }

  .card-hover {
    @apply card transition-all duration-200 hover:shadow-md hover:scale-[1.02];
  }

  /* Game feedback animations */
  .correct-answer {
    @apply animate-success-pulse bg-success-50 border-success-500;
  }

  .incorrect-answer {
    @apply animate-wiggle bg-error-50 border-error-500;
  }
}

@layer utilities {
  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Truncate text */
  .truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
```

### Design Tokens

**Color Usage Guidelines**:
- **Primary (Blue)**: Main actions, links, interactive elements
- **Success (Green)**: Correct answers, achievements, positive feedback
- **Error (Red)**: Incorrect answers, validation errors
- **Warning (Yellow)**: Hints, important notices
- **Gray**: Text, backgrounds, borders

**Color Contrast (WCAG AA)**:
```typescript
// Ensure text meets 4.5:1 contrast ratio
const textColors = {
  onLight: 'text-gray-900',   // On white/light backgrounds
  onDark: 'text-white',        // On dark backgrounds
  onPrimary: 'text-white',     // On primary-500
  onSuccess: 'text-white',     // On success-500
  onError: 'text-white',       // On error-500
}
```

### Responsive Design

**Breakpoints**:
```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
}
```

**Mobile-First Approach**:
```typescript
// ✅ Good: Mobile first, then scale up
<div className="text-base md:text-lg lg:text-xl">
  Responsive text
</div>

// ❌ Bad: Desktop first
<div className="text-xl lg:text-base">
  Wrong approach
</div>
```

**Responsive Game Layout**:
```typescript
export const GameBoard = () => {
  return (
    <div className="
      grid grid-cols-1 gap-4
      md:grid-cols-2 md:gap-6
      lg:grid-cols-3 lg:gap-8
    ">
      {/* Game tiles */}
    </div>
  )
}
```

### Typography Scale

```typescript
// Component usage examples
<h1 className="text-4xl font-bold">        // Page titles
<h2 className="text-3xl font-semibold">    // Section headings
<h3 className="text-2xl font-semibold">    // Subsections
<p className="text-base">                  // Body text
<span className="text-sm text-gray-600">   // Helper text
<button className="text-lg font-medium">   // Large buttons
```

### Spacing System

```typescript
// Consistent spacing
const spacing = {
  xs: '0.5rem',   // 8px  - Tight spacing
  sm: '0.75rem',  // 12px - Small spacing
  md: '1rem',     // 16px - Base spacing
  lg: '1.5rem',   // 24px - Large spacing
  xl: '2rem',     // 32px - Extra large
  '2xl': '3rem',  // 48px - Section spacing
}

// Usage
<div className="p-4">           // 16px padding
<div className="space-y-6">     // 24px gap between children
<div className="mb-8">          // 32px bottom margin
```

### shadcn/ui Integration

**Installation**:
```bash
npx shadcn-ui@latest init
```

**Configuration** (`components.json`):
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "blue",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Add Components**:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
```

**Using shadcn/ui**:
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

export const WordListCard = () => {
  return (
    <Card>
      <CardHeader>
        <h3>My Words</h3>
      </CardHeader>
      <CardContent>
        <Button>Start Game</Button>
      </CardContent>
    </Card>
  )
}
```

### Animation Patterns

**Feedback Animations**:
```typescript
// Correct answer animation
<div className="animate-success-pulse bg-success-50 border-2 border-success-500">
  Correct!
</div>

// Incorrect answer animation
<div className="animate-wiggle bg-error-50 border-2 border-error-500">
  Try again
</div>

// Loading animation
<div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
```

**Framer Motion Integration**:
```typescript
import { motion } from 'framer-motion'

export const GameCard = ({ word }: { word: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="card"
    >
      {word}
    </motion.div>
  )
}

// Stagger children animation
<motion.div variants={containerVariants}>
  {letters.map((letter, i) => (
    <motion.div key={i} variants={itemVariants}>
      {letter}
    </motion.div>
  ))}
</motion.div>

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}
```

### Accessibility Styling

**Focus States**:
```typescript
// Always visible focus (never remove!)
<button className="
  focus:outline-none
  focus-visible:ring-2
  focus-visible:ring-primary-500
  focus-visible:ring-offset-2
">
  Accessible Button
</button>
```

**Color Contrast**:
```typescript
// ✅ Good: 4.5:1 contrast
<p className="text-gray-900 bg-white">High contrast text</p>

// ❌ Bad: Low contrast
<p className="text-gray-400 bg-gray-300">Hard to read</p>
```

**Screen Reader Text**:
```typescript
<button>
  <span className="sr-only">Close dialog</span>
  <XIcon className="h-5 w-5" />
</button>
```

### Dark Mode (Future)

Prepare for dark mode with CSS variables:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
  }
}
```

### Performance Considerations

**CSS Optimization**:
- Tailwind purges unused styles in production
- Use `@apply` sparingly (prefer utility classes)
- Avoid deep CSS nesting

**Animation Performance**:
```typescript
// ✅ Good: Use transform and opacity (GPU accelerated)
<div className="transition-transform duration-300 hover:scale-105" />

// ❌ Bad: Use width/height (triggers reflow)
<div className="transition-all duration-300 hover:w-full" />
```

---

## Testing Requirements

### Testing Strategy

**Test Pyramid**:
```
        ┌────────────┐
        │    E2E     │  10% - Full user flows
        │ (Playwright)│
        ├────────────┤
        │ Integration│  30% - Component integration
        │  (Vitest)  │
        ├────────────┤
        │    Unit    │  60% - Functions, machines
        │  (Vitest)  │
        └────────────┘
```

**Coverage Targets**:
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical user paths
- **E2E Tests**: Core game flows

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '*.config.ts',
        'app/layout.tsx',
        'public/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock IndexedDB
global.indexedDB = {} as any
```

### Unit Testing

**Pure Functions**:
```typescript
// lib/algorithms/confidence-scoring.test.ts
import { describe, it, expect } from 'vitest'
import { calculateConfidence } from './confidence-scoring'
import type { GameResult } from '@/types/game'

describe('calculateConfidence', () => {
  it('returns 0 for no results', () => {
    expect(calculateConfidence('cat', [])).toBe(0)
  })

  it('calculates confidence based on success rate', () => {
    const results: GameResult[] = [
      { word: 'cat', correct: true, attempts: 1, timeMs: 1000, hintsUsed: 0 },
      { word: 'cat', correct: true, attempts: 1, timeMs: 900, hintsUsed: 0 },
      { word: 'cat', correct: false, attempts: 3, timeMs: 2000, hintsUsed: 1 },
    ]

    const confidence = calculateConfidence('cat', results)
    expect(confidence).toBeGreaterThan(0.5)
    expect(confidence).toBeLessThan(1)
  })

  it('weights recent results higher', () => {
    const oldResults: GameResult[] = [
      { word: 'cat', correct: false, attempts: 3, timeMs: 2000, hintsUsed: 1 },
    ]
    const recentResults: GameResult[] = [
      { word: 'cat', correct: true, attempts: 1, timeMs: 1000, hintsUsed: 0 },
      { word: 'cat', correct: true, attempts: 1, timeMs: 900, hintsUsed: 0 },
    ]

    const allResults = [...oldResults, ...recentResults]
    const confidence = calculateConfidence('cat', allResults)

    // Recent success should result in high confidence
    expect(confidence).toBeGreaterThan(0.7)
  })
})
```

**React Hooks**:
```typescript
// hooks/useGameSession.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useGameSession } from './useGameSession'

describe('useGameSession', () => {
  it('initializes in idle state', () => {
    const { result } = renderHook(() => useGameSession())
    expect(result.current.state).toBe('idle')
  })

  it('transitions to loading when session started', async () => {
    const { result } = renderHook(() => useGameSession())

    act(() => {
      result.current.startSession('list-123')
    })

    await waitFor(() => {
      expect(result.current.state).toBe('loading')
    })
  })

  it('loads word list and transitions to intro', async () => {
    const { result } = renderHook(() => useGameSession())

    act(() => {
      result.current.startSession('list-123')
    })

    await waitFor(() => {
      expect(result.current.state).toBe('intro')
      expect(result.current.context.words).toHaveLength(10)
    })
  })
})
```

### Component Testing

**React Testing Library**:
```typescript
// components/word-lists/WordListCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { WordListCard } from './WordListCard'

describe('WordListCard', () => {
  const mockWordList = {
    id: 'list-123',
    name: 'Animals',
    words: ['cat', 'dog', 'bird'],
    createdAt: new Date('2025-01-01'),
  }

  it('renders word list name and count', () => {
    render(<WordListCard data={mockWordList} mode="view" />)

    expect(screen.getByText('Animals')).toBeInTheDocument()
    expect(screen.getByText('3 words')).toBeInTheDocument()
  })

  it('shows edit button in view mode', () => {
    render(<WordListCard data={mockWordList} mode="view" />)

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  it('calls onSave when save button clicked', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <WordListCard
        data={mockWordList}
        mode="edit"
        onSave={onSave}
      />
    )

    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(mockWordList)
    })
  })

  it('is keyboard accessible', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <WordListCard
        data={mockWordList}
        mode="edit"
        onSave={onSave}
      />
    )

    // Tab to save button
    await user.tab()
    expect(screen.getByRole('button', { name: /save/i })).toHaveFocus()

    // Press Enter
    await user.keyboard('{Enter}')
    expect(onSave).toHaveBeenCalled()
  })

  it('has accessible name and role', () => {
    render(<WordListCard data={mockWordList} mode="view" />)

    const card = screen.getByRole('article')
    expect(card).toHaveAccessibleName('Animals')
  })
})
```

**Game Mechanic Testing**:
```typescript
// games/word-scramble/WordScramble.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { WordScramble } from './WordScramble'

describe('WordScramble', () => {
  const mockOnComplete = vi.fn()

  it('scrambles letters correctly', () => {
    render(<WordScramble word="cat" onComplete={mockOnComplete} />)

    const letters = screen.getAllByRole('button')
    const letterTexts = letters.map(l => l.textContent)

    // Should have same letters, different order
    expect(letterTexts.sort()).toEqual(['a', 'c', 't'])
    expect(letterTexts).not.toEqual(['c', 'a', 't'])
  })

  it('calls onComplete with correct result', async () => {
    const user = userEvent.setup()
    render(<WordScramble word="cat" onComplete={mockOnComplete} />)

    // Click letters in correct order
    await user.click(screen.getByText('c'))
    await user.click(screen.getByText('a'))
    await user.click(screen.getByText('t'))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith({
        word: 'cat',
        correct: true,
        attempts: 1,
        timeMs: expect.any(Number),
        hintsUsed: 0,
      })
    })
  })

  it('shows error feedback on incorrect answer', async () => {
    const user = userEvent.setup()
    render(<WordScramble word="cat" onComplete={mockOnComplete} />)

    // Click letters in wrong order
    await user.click(screen.getByText('a'))
    await user.click(screen.getByText('c'))
    await user.click(screen.getByText('t'))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/try again/i)).toBeInTheDocument()
    })
  })
})
```

### XState Machine Testing

```typescript
// machines/game-session/gameSessionMachine.test.ts
import { describe, it, expect } from 'vitest'
import { createActor } from 'xstate'
import { gameSessionMachine } from './gameSessionMachine'

describe('gameSessionMachine', () => {
  it('starts in idle state', () => {
    const actor = createActor(gameSessionMachine)
    actor.start()

    expect(actor.getSnapshot().value).toBe('idle')
  })

  it('transitions to loading on START event', () => {
    const actor = createActor(gameSessionMachine)
    actor.start()

    actor.send({ type: 'START', wordListId: 'list-123' })

    expect(actor.getSnapshot().value).toBe('loading')
    expect(actor.getSnapshot().context.wordListId).toBe('list-123')
  })

  it('transitions to complete when all words confident', async () => {
    const actor = createActor(gameSessionMachine, {
      input: {
        words: [
          { text: 'cat', id: '1' },
          { text: 'dog', id: '2' },
        ],
      },
    })
    actor.start()

    actor.send({ type: 'START', wordListId: 'list-123' })

    // Wait for loading to complete
    await waitFor(() => {
      expect(actor.getSnapshot().value).toBe('intro')
    })

    // Simulate completing all words
    actor.send({ type: 'WORD_MASTERED', wordId: '1' })
    actor.send({ type: 'WORD_MASTERED', wordId: '2' })

    await waitFor(() => {
      expect(actor.getSnapshot().value).toBe('ending')
    })
  })

  it('prevents invalid state transitions', () => {
    const actor = createActor(gameSessionMachine)
    actor.start()

    // Try to send GAME_COMPLETE while in idle
    actor.send({ type: 'GAME_COMPLETE', result: {} as any })

    // Should still be in idle
    expect(actor.getSnapshot().value).toBe('idle')
  })
})
```

### Integration Testing

```typescript
// __tests__/integration/game-session.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import GamePage from '@/app/game/page'

describe('Game Session Integration', () => {
  it('completes full game session flow', async () => {
    const user = userEvent.setup()

    // Mock word list in localStorage
    localStorage.setItem('wordlist-123', JSON.stringify({
      id: '123',
      name: 'Test List',
      words: ['cat', 'dog']
    }))

    render(<GamePage searchParams={{ listId: '123' }} />)

    // Wait for intro to finish
    await waitFor(() => {
      expect(screen.getByText(/let's begin/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    // Play first game (Word Scramble)
    await user.click(screen.getByText('c'))
    await user.click(screen.getByText('a'))
    await user.click(screen.getByText('t'))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Should show success feedback
    await waitFor(() => {
      expect(screen.getByText(/correct/i)).toBeInTheDocument()
    })

    // Should progress to next word
    await waitFor(() => {
      expect(screen.getByTestId('current-word')).toHaveTextContent('dog')
    })

    // Complete second word
    // ... (similar interaction)

    // Should show completion screen
    await waitFor(() => {
      expect(screen.getByText(/you did it!/i)).toBeInTheDocument()
    })
  })
})
```

### E2E Testing with Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**E2E Test Example**:
```typescript
// __tests__/e2e/game-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Game Flow', () => {
  test('user can create word list and play game', async ({ page }) => {
    await page.goto('/')

    // Create new word list
    await page.click('text=Create Word List')
    await page.fill('input[name="listName"]', 'My Animals')
    await page.fill('input[name="word-1"]', 'cat')
    await page.fill('input[name="word-2"]', 'dog')
    await page.click('button:has-text("Save")')

    // Verify word list created
    await expect(page.locator('text=My Animals')).toBeVisible()

    // Start game
    await page.click('text=My Animals >> .. >> button:has-text("Play")')

    // Wait for game to load
    await expect(page.locator('[data-testid="game-intro"]')).toBeVisible()

    // Play game
    await page.click('text=Start')

    // Interact with game mechanic
    // ... (specific to game type)

    // Verify completion
    await expect(page.locator('text=You did it!')).toBeVisible()
  })

  test('game session persists across page reloads', async ({ page }) => {
    await page.goto('/game?listId=123')

    // Start game
    await page.click('text=Start')

    // Complete one word
    // ... (game interaction)

    // Reload page
    await page.reload()

    // Should resume where left off
    await expect(page.locator('[data-testid="progress"]')).toContainText('1/10')
  })
})
```

### Test Utilities

**Custom Render with Providers**:
```typescript
// __tests__/utils/test-utils.tsx
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
    </>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

**Mock Data Factories**:
```typescript
// __tests__/utils/factories.ts
import type { WordList, GameResult } from '@/types'

export const createMockWordList = (overrides?: Partial<WordList>): WordList => ({
  id: 'list-123',
  name: 'Test List',
  words: ['cat', 'dog', 'bird'],
  createdAt: new Date('2025-01-01'),
  ...overrides,
})

export const createMockGameResult = (overrides?: Partial<GameResult>): GameResult => ({
  word: 'cat',
  correct: true,
  attempts: 1,
  timeMs: 1000,
  hintsUsed: 0,
  ...overrides,
})
```

### Running Tests

```json
// package.json scripts
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "vitest run && playwright test"
  }
}
```

---

## Environment Configuration

### Environment Variables

**MVP (Client-side only)**:
Since the MVP is client-side only, minimal environment variables are needed.

```bash
# .env.local (for local development)
NEXT_PUBLIC_APP_NAME=WordCraft
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development

# XState Inspector (dev only)
NEXT_PUBLIC_XSTATE_INSPECT=true

# Feature flags
NEXT_PUBLIC_ENABLE_STORY_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

**Future (when backend added)**:
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.wordcraft.app
NEXT_PUBLIC_API_TIMEOUT=10000

# Authentication (when implemented)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=postgresql://...

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=GA-XXXXXXX
```

**Environment Variable Naming**:
- `NEXT_PUBLIC_*`: Exposed to browser (use sparingly)
- No prefix: Server-side only (when backend added)

**TypeScript Environment Types**:
```typescript
// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_NAME: string
    NEXT_PUBLIC_APP_VERSION: string
    NEXT_PUBLIC_ENVIRONMENT: 'development' | 'staging' | 'production'
    NEXT_PUBLIC_XSTATE_INSPECT?: string
    NEXT_PUBLIC_ENABLE_STORY_MODE?: string
    NEXT_PUBLIC_ENABLE_ANALYTICS?: string
  }
}
```

**Environment Helper**:
```typescript
// lib/env.ts
export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'WordCraft',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  isDevelopment: process.env.NEXT_PUBLIC_ENVIRONMENT === 'development',
  isProduction: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production',
  enableXStateInspect: process.env.NEXT_PUBLIC_XSTATE_INSPECT === 'true',
  enableStoryMode: process.env.NEXT_PUBLIC_ENABLE_STORY_MODE !== 'false',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
} as const

// Usage
import { env } from '@/lib/env'

if (env.enableXStateInspect && env.isDevelopment) {
  // Enable inspector
}
```

### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // App Router configuration
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@xstate/react', 'framer-motion'],
  },

  // TypeScript
  typescript: {
    ignoreBuildErrors: false, // Strict type checking
  },

  // ESLint
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'hooks', 'machines', 'games'],
  },

  // Images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    domains: [], // Add external image domains if needed
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Rewrites (if needed)
  async rewrites() {
    return []
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Performance
  swcMinify: true,
  compress: true,
  poweredByHeader: false,

  // Output configuration
  output: 'standalone', // For Docker deployment

  // Webpack customization (if needed)
  webpack: (config, { dev, isServer }) => {
    // Custom webpack config
    return config
  },
}

module.exports = nextConfig
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/games/*": ["./games/*"],
      "@/machines/*": ["./machines/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"]
    },
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### Package.json Scripts

```json
{
  "name": "wordcraft",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run type-check && npm run lint && vitest run && playwright test",
    "clean": "rm -rf .next node_modules",
    "prepare": "husky install"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "xstate": "^5.0.0",
    "@xstate/react": "^4.0.0",
    "framer-motion": "^11.0.0",
    "date-fns": "^3.0.0",
    "react-hook-form": "^7.50.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@tailwindcss/forms": "^0.5.7",
    "tailwindcss-animate": "^1.0.7",
    "vitest": "^1.2.0",
    "@vitest/ui": "^1.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@testing-library/jest-dom": "^6.2.0",
    "@playwright/test": "^1.41.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.2.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.2.0"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": [
      "warn",
      {
        "allow": ["warn", "error"]
      }
    ]
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

```
// .prettierignore
node_modules
.next
.turbo
dist
build
coverage
*.min.js
*.min.css
```

### Git Hooks (Husky + Lint-Staged)

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

```bash
# .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run type-check
npm run test:coverage
```

### VS Code Configuration

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

```json
// .vscode/extensions.json (Recommended Extensions)
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "statelyai.stately-vscode",
    "ms-playwright.playwright",
    "vitest.explorer"
  ]
}
```

### Deployment Configuration (Vercel)

```json
// vercel.json (optional - most settings via dashboard)
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_APP_NAME": "WordCraft",
    "NEXT_PUBLIC_ENVIRONMENT": "production"
  }
}
```

**Environment Variables in Vercel**:
- Set via Vercel Dashboard → Project → Settings → Environment Variables
- Add separate values for Production, Preview, Development

### Docker Configuration (Future)

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

---

## Frontend Developer Standards

### Quick Reference

**Development Workflow**:
```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Before committing
npm run lint:fix
npm run format
npm run type-check
npm run test

# 4. Open PRs
git checkout -b feature/your-feature
# Make changes
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature
# Create PR via GitHub
```

### Code Style Rules

#### 1. TypeScript

**✅ Do**:
```typescript
// Use const for immutable values
const MAX_ATTEMPTS = 3

// Explicit return types for public functions
export function calculateScore(attempts: number): number {
  return 100 - (attempts * 10)
}

// Interface for object shapes
interface WordListProps {
  id: string
  name: string
  words: string[]
}

// Type for unions
type GameMode = 'easy' | 'medium' | 'hard'

// Avoid any - use unknown or specific types
function handleData(data: unknown): void {
  if (typeof data === 'string') {
    // data is string here
  }
}
```

**❌ Don't**:
```typescript
// Don't use var
var count = 0 // Use const or let

// Don't omit return types for exported functions
export function calculateScore(attempts) { // Missing return type
  return 100 - (attempts * 10)
}

// Don't use any without good reason
function handleData(data: any): void { // Use unknown instead
  console.log(data)
}

// Don't use type assertions unnecessarily
const name = data as string // Use type guards instead
```

#### 2. React Components

**✅ Do**:
```typescript
// Functional components with explicit typing
export const WordCard: FC<{ word: string; onClick: () => void }> = ({
  word,
  onClick
}) => {
  return (
    <button onClick={onClick} className="card">
      {word}
    </button>
  )
}

// Use hooks at top level
export const GameMechanic: FC = () => {
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Event handlers with clear names
  const handleStart = () => setIsPlaying(true)

  return <div>{/* ... */}</div>
}

// Memoize expensive computations
const sortedWords = useMemo(
  () => words.sort((a, b) => a.localeCompare(b)),
  [words]
)
```

**❌ Don't**:
```typescript
// Don't use class components
class WordCard extends Component { /* ... */ }

// Don't call hooks conditionally
if (condition) {
  useState(0) // Breaks Rules of Hooks
}

// Don't define components inside components
export const Parent = () => {
  const Child = () => <div>Child</div> // Re-created on every render
  return <Child />
}
```

#### 3. State Management (XState)

**✅ Do**:
```typescript
// Define context interface
interface GameContext {
  score: number
  currentWord: string | null
}

// Use typed events
type GameEvent =
  | { type: 'START' }
  | { type: 'ANSWER'; word: string }

// Separate business logic from UI
const gameLogic = {
  calculateScore: (attempts: number) => 100 - (attempts * 10),
  validateAnswer: (guess: string, answer: string) => guess === answer,
}

// Use services for async operations
services: {
  loadWords: async () => {
    const words = await fetchWords()
    return words
  }
}
```

**❌ Don't**:
```typescript
// Don't put UI logic in machines
actions: {
  showAlert: () => {
    alert('Game over') // UI logic belongs in components
  }
}

// Don't mutate context directly
actions: {
  updateScore: ({ context }) => {
    context.score++ // Use assign() instead
  }
}
```

### Best Practices

#### Performance

**Optimize Re-renders**:
```typescript
// Use React.memo for expensive components
export const GameBoard = memo(({ tiles }: Props) => {
  return <div>{tiles.map(renderTile)}</div>
})

// Use useCallback for event handlers passed to children
const handleClick = useCallback((id: string) => {
  setSelected(id)
}, [])

// Use useMemo for expensive calculations
const statistics = useMemo(() => {
  return calculateStatistics(results) // Expensive operation
}, [results])
```

**Code Splitting**:
```typescript
// Lazy load heavy components
const Dashboard = lazy(() => import('@/components/dashboard/Dashboard'))

// Use Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>

// Dynamic imports for game mechanics
const loadGameMechanic = async (id: string) => {
  const module = await import(`@/games/${id}`)
  return module.default
}
```

#### Error Handling

**Always handle errors**:
```typescript
// Try-catch for async operations
try {
  const data = await fetchWordList(id)
  setWordList(data)
} catch (error) {
  console.error('Failed to load word list:', error)
  setError(error instanceof Error ? error.message : 'Unknown error')
}

// Error boundaries for component errors
<ErrorBoundary fallback={<ErrorMessage />}>
  <GameMechanic word={word} />
</ErrorBoundary>

// Validate user input
const validateWordList = (list: unknown): list is WordList => {
  return (
    typeof list === 'object' &&
    list !== null &&
    'id' in list &&
    'name' in list &&
    'words' in list &&
    Array.isArray((list as any).words)
  )
}
```

#### Data Fetching (Future)

```typescript
// Use SWR or React Query for data fetching
import useSWR from 'swr'

const { data, error, isLoading } = useSWR('/api/word-lists', fetcher)

// Handle loading and error states
if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
if (!data) return null

return <WordListView data={data} />
```

### Security Considerations

**Input Validation**:
```typescript
// Sanitize user input
import DOMPurify from 'dompurify'

const sanitizedInput = DOMPurify.sanitize(userInput)

// Validate word lists before saving
const MAX_WORDS = 100
const MAX_WORD_LENGTH = 50

if (words.length > MAX_WORDS) {
  throw new Error('Too many words')
}

if (words.some(w => w.length > MAX_WORD_LENGTH)) {
  throw new Error('Word too long')
}
```

**Storage Security**:
```typescript
// Don't store sensitive data in localStorage
// ✅ OK for MVP (no authentication)
localStorage.setItem('wordLists', JSON.stringify(lists))

// ❌ Never store tokens in localStorage (when backend added)
// localStorage.setItem('authToken', token) // Use httpOnly cookies instead
```

**XSS Prevention**:
```typescript
// ✅ React escapes by default
<div>{userInput}</div> // Safe

// ❌ Dangerous - avoid dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // Unsafe!

// ✅ If you must use HTML, sanitize first
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

### Common Patterns

#### Loading Pattern
```typescript
export const DataComponent = ({ id }: Props) => {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const result = await fetchData(id)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (!data) return null

  return <DataView data={data} />
}
```

#### Form Pattern
```typescript
import { useForm } from 'react-hook-form'

export const WordListForm = ({ onSubmit }: Props) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('name', { required: 'Name is required' })}
        aria-invalid={errors.name ? 'true' : 'false'}
      />
      {errors.name && <span role="alert">{errors.name.message}</span>}

      <button type="submit">Save</button>
    </form>
  )
}
```

#### Modal Pattern
```typescript
import { Dialog } from '@/components/ui/dialog'

export const ConfirmDialog = ({ open, onClose, onConfirm }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <Dialog.Content>
        <Dialog.Title>Confirm Action</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to continue?
        </Dialog.Description>

        <Dialog.Footer>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  )
}
```

### Debugging Tips

**React DevTools**:
- Install React DevTools browser extension
- Use Components tab to inspect props/state
- Use Profiler to find performance issues

**XState Inspector**:
```typescript
// Enable in development
if (process.env.NODE_ENV === 'development') {
  inspect({ iframe: false })
}

// Visualize machines at https://stately.ai/viz
```

**Console Debugging**:
```typescript
// Use labeled console logs
console.log('🎮 Game state:', state)
console.log('📝 Word list:', wordList)
console.log('⚠️ Error:', error)

// Remove console.logs before committing (ESLint will warn)
```

### Git Commit Conventions

Follow Conventional Commits:

```bash
# Format: <type>(<scope>): <description>

# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation only
style:    # Code style (formatting, missing semi colons)
refactor: # Code refactoring
test:     # Adding tests
chore:    # Build process or tooling

# Examples:
git commit -m "feat(games): add word scramble mechanic"
git commit -m "fix(dashboard): correct confidence calculation"
git commit -m "docs(readme): update setup instructions"
git commit -m "test(adaptive-engine): add learning style detection tests"
```

### Code Review Checklist

Before submitting PR:
- ✅ All tests pass (`npm run test:all`)
- ✅ No TypeScript errors (`npm run type-check`)
- ✅ No ESLint warnings (`npm run lint`)
- ✅ Code is formatted (`npm run format`)
- ✅ New code has tests (unit + integration)
- ✅ Accessibility tested (keyboard navigation, screen reader)
- ✅ Mobile responsive (test on small screens)
- ✅ No console.logs or debugger statements
- ✅ Comments added for complex logic
- ✅ PropTypes or TypeScript types defined

### Performance Budgets

**Bundle Size Targets**:
- First Load JS: < 200 KB
- Route JS: < 50 KB per route
- Total Page Weight: < 1 MB

**Performance Metrics (Lighthouse)**:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

**Core Web Vitals**:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Resources

**Documentation**:
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [XState Docs](https://stately.ai/docs/xstate)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

**Tools**:
- [XState Visualizer](https://stately.ai/viz)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-18
**Author**: Winston (Architect)
**Status**: Complete

