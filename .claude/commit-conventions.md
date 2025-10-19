# Commit Conventions

## Format

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

## Types

- **feat**: A new feature for the user
- **fix**: A bug fix
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **style**: Formatting, missing semi colons, etc; no code change
- **test**: Adding missing tests or correcting existing tests
- **docs**: Documentation only changes
- **chore**: Maintenance tasks, configs, dependencies

## Scopes

Use specific scopes to indicate which part of the codebase is affected:

- **types**: TypeScript type definitions
- **storage**: localStorage and data persistence
- **validation**: Input validation utilities
- **ui**: Base UI components (buttons, cards, inputs)
- **word-lists**: Word list management features
- **game**: Game mechanics and logic
- **state**: State management (XState)
- **home**: Homepage
- **config**: Configuration files
- **deps**: Dependencies

## Examples

### Good Commits

```
feat(types): add word list and game types

Add TypeScript interfaces for WordList, GameResult, and GameSession
to support word list management and game tracking.
```

```
feat(storage): implement localStorage utilities

Add CRUD operations for word lists with automatic ID generation
and timestamp management.
```

```
fix(lint): escape apostrophes in JSX content

Replace unescaped apostrophes with &apos; to resolve ESLint errors
in app/page.tsx and app/word-lists/[id]/page.tsx
```

```
feat(word-lists): add WordListCard component

Create reusable card component for displaying word list summaries
with edit, play, and delete actions.
```

### Atomic Commits

Each commit should:
- ✅ Represent a single logical change
- ✅ Compile without errors
- ✅ Pass all tests and linting
- ✅ Be independently revertible
- ✅ Have a clear, descriptive message

### Anti-patterns

❌ **Avoid large commits:**
```
feat: implement word list management

19 files changed, 1266 insertions(+)
```

✅ **Instead, break into atomic commits:**
```
feat(types): add word list and game types
feat(storage): implement localStorage utilities
feat(validation): add word list input validation
feat(ui): add shadcn/ui base components
feat(word-lists): add WordListCard component
feat(word-lists): add WordListForm component
feat(word-lists): add word list management pages
```

## Breaking Changes

For breaking changes, add `BREAKING CHANGE:` in the footer or append `!` after the type/scope:

```
feat(storage)!: change wordList ID generation to UUID

BREAKING CHANGE: Word list IDs now use UUID v4 instead of timestamps.
Existing localStorage data will need migration.
```

## Commit Workflow

1. Make a focused change (single feature/fix)
2. Run `pnpm run lint` to check code quality
3. Run `pnpm exec tsc --noEmit` to verify types
4. Stage only related files: `git add <files>`
5. Commit with conventional message
6. Repeat for next logical unit of work

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
