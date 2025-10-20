# 12. Coding Standards

## Critical Fullstack Rules

**Type Organization:**
- All types are defined in the `/types` directory and imported using `@/types` path alias
- Never define interfaces/types inline in components - always create them in appropriate type files
- Type files are organized by domain (word.ts, game.ts, session.ts, confidence.ts)

**Component Architecture:**
- Client components MUST include `'use client'` directive at the top
- All game mechanics must implement the `GameMechanicProps` interface
- Components use React 19 with TypeScript functional components and FC type

**Storage Layer:**
- Never access localStorage/sessionStorage directly in components
- Always use storage abstraction functions from `@/lib/storage/localStorage.ts` or `@/lib/storage/sessionStorage.ts`
- All storage functions handle SSR safety (check `typeof window === 'undefined'`)

**Multi-word Phrase Handling:**
- The term "word" encompasses both single words and multi-word phrases with spaces
- Validation allows letters + spaces: `/^[a-zA-Z\s]+$/`
- Game mechanics handle phrases appropriately (see WordScramble for reference implementation)

**State Management:**
- Complex game flows use XState state machines (see StoryProgressMachine)
- React state hooks for simple component state
- Never mutate state directly - always use state setters

**Error Handling:**
- All storage operations use try-catch blocks
- Errors are logged to console with descriptive messages
- Functions return sensible defaults on error (empty arrays, null, false)

**JSDoc Documentation:**
- All exported functions require JSDoc comments
- Include parameter descriptions and return types
- Document edge cases and important behavior notes

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `WordScramble.tsx` |
| Hooks | camelCase with 'use' prefix | `useGameSession.ts` |
| Routes | kebab-case | `/app/word-lists/page.tsx` |
| Type files | camelCase | `word.ts`, `game.ts` |
| Storage keys | snake_case with prefix | `wordcraft_word_lists` |
| Functions | camelCase | `getAllWordLists()` |
| Constants | UPPER_SNAKE_CASE | `STORAGE_KEYS` |

## Critical for AI Agents

When developing for WordCraft:

1. **Check type existence first** - Always verify if a type exists in `/types` before creating a new one
2. **Study reference implementations** - Use `WordScramble.tsx` as the canonical example for game mechanics
3. **Use storage abstraction** - Never directly access localStorage; always use storage layer functions
4. **Follow App Router conventions** - Routes are defined with `page.tsx` files in the `/app` directory
5. **Handle SSR safety** - All browser APIs (localStorage, window, document) require checks for `typeof window !== 'undefined'`
6. **Support multi-word phrases** - Remember that "words" can include spaces (e.g., "went red")

---
