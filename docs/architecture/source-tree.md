# WordCraft Source Tree

**Current Project Structure** (Updated: 2025-10-20)

```
spelling-fun/
├── app/                           # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── game/
│   │   └── page.tsx             # Active game session page
│   ├── word-lists/
│   │   ├── page.tsx             # Word list management
│   │   ├── new/
│   │   │   └── page.tsx         # Create word list
│   │   └── [id]/
│   │       └── page.tsx         # Edit word list
│   └── dashboard/
│       └── page.tsx             # Parent dashboard (in progress)
│
├── components/                    # React components
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   ├── games/                    # 8 game mechanic components
│   │   ├── LetterMatching.tsx
│   │   ├── WordScramble.tsx
│   │   ├── SpellingChallenge.tsx
│   │   ├── LetterHunt.tsx
│   │   ├── PictureReveal.tsx
│   │   ├── WordBuildingBlocks.tsx
│   │   ├── TraceAndWrite.tsx
│   │   └── MissingLetters.tsx
│   ├── game/
│   │   └── SessionSummary.tsx   # Post-session results display
│   └── word-lists/
│       ├── WordListCard.tsx     # Display word list
│       └── WordListForm.tsx     # Create/edit form
│
├── lib/                          # Business logic
│   ├── algorithms/               # Adaptive learning algorithms
│   │   ├── confidence-scoring.ts
│   │   ├── spaced-repetition.ts
│   │   ├── learning-style-detection.ts
│   │   └── difficulty-adjustment.ts
│   ├── games/                    # Game mechanics registration
│   │   ├── registry.ts          # Central game registry
│   │   ├── letter-matching/
│   │   │   └── index.ts
│   │   ├── word-scramble/
│   │   │   └── index.ts
│   │   ├── missing-letters/
│   │   │   └── index.ts
│   │   ├── spelling-challenge/
│   │   │   └── index.ts
│   │   ├── letter-hunt.ts
│   │   ├── picture-reveal.ts
│   │   ├── word-building.ts
│   │   ├── trace-write.ts
│   │   └── index.ts             # Export all games
│   ├── game/                     # Session management
│   │   ├── session-manager.ts
│   │   ├── session-tracker.ts
│   │   ├── word-selector.ts
│   │   └── useGameSession.ts    # React hook
│   ├── story/                    # Story mode (future)
│   │   ├── assets.ts
│   │   ├── content.ts
│   │   └── machines/
│   ├── storage/                  # Persistence layer
│   │   ├── localStorage.ts
│   │   ├── sessionStorage.ts
│   │   └── story-progress-storage.ts
│   └── utils/                    # Utility functions
│       ├── cn.ts                # Tailwind class merger
│       └── validation.ts        # Input validation
│
├── types/                        # TypeScript type definitions
│   ├── index.ts                 # Re-export all types
│   ├── word.ts                  # WordList types
│   ├── game.ts                  # Game mechanic types
│   ├── session.ts               # Session types
│   └── confidence.ts            # Confidence scoring types
│
├── docs/                         # Documentation
│   ├── prd.md                   # Product Requirements Document
│   ├── architecture.md          # Full architecture document
│   └── architecture/            # Modular architecture sections
│       ├── index.md
│       ├── source-tree.md       # This file
│       ├── 1-introduction.md
│       ├── 2-high-level-architecture.md
│       ├── 3-tech-stack.md
│       ├── 4-data-models.md
│       ├── 5-components.md
│       ├── 6-core-workflows.md
│       ├── 7-unified-project-structure.md
│       ├── 8-development-workflow.md
│       ├── 9-deployment-architecture.md
│       ├── 10-security-and-performance.md
│       ├── 11-testing-strategy.md
│       ├── 12-coding-standards.md
│       ├── 13-error-handling-strategy.md
│       ├── 14-monitoring-and-observability.md
│       ├── 15-checklist-results-report.md
│       └── document-history.md
│
├── public/                       # Static assets
│   └── images/                  # Game images (future)
│
├── .bmad-core/                   # BMAD framework files (AI agent system)
├── .github/                      # GitHub configuration
├── node_modules/                 # Dependencies (managed by pnpm)
├── .env.local                    # Local environment variables
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Git ignore patterns
├── next.config.js               # Next.js configuration
├── package.json                 # Project dependencies
├── pnpm-lock.yaml               # Dependency lock file
├── postcss.config.js            # PostCSS configuration
├── README.md                    # Project README
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── vitest.config.ts             # Vitest test configuration
```

## Quick Reference

### Import Aliases

| Alias | Maps To | Example |
|-------|---------|---------|
| `@/components` | `/components` | `import { Button } from '@/components/ui/button'` |
| `@/lib` | `/lib` | `import { getAllWordLists } from '@/lib/storage/localStorage'` |
| `@/types` | `/types` | `import type { WordList } from '@/types'` |
| `@/app` | `/app` | `import type { Metadata } from '@/app/layout'` |

### Key Locations

| What | Where |
|------|-------|
| Page routes | `/app/**/page.tsx` |
| Game mechanics | `/components/games/*.tsx` |
| Game logic | `/lib/games/` |
| Storage functions | `/lib/storage/*.ts` |
| Type definitions | `/types/*.ts` |
| Adaptive algorithms | `/lib/algorithms/*.ts` |
| Documentation | `/docs/*.md` |

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `WordScramble.tsx` |
| Hooks | camelCase + 'use' | `useGameSession.ts` |
| Utils | camelCase | `validation.ts` |
| Types | camelCase | `word.ts` |
| Routes | kebab-case | `/word-lists/new` |

---

**Note:** This tree reflects the current implemented state (Epics 1-5 complete, Epic 7 Story 7.1 complete).
