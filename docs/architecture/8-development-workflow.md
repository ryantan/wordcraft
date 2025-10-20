# 8. Development Workflow

## Local Development Setup

**Prerequisites:**

```bash
# Required software
node --version    # v18.17.0 or higher
pnpm --version    # v8.0.0 or higher

# Install pnpm globally if needed
npm install -g pnpm
```

**Initial Setup:**

```bash
# Clone repository
git clone <repository-url>
cd spelling-fun

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Start development server
pnpm dev
```

**Development Commands:**

```bash
# Start development server (http://localhost:3000)
pnpm dev

# Run type checking
pnpm type-check

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Run all unit and component tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests with Playwright
pnpm test:e2e

# Build for production
pnpm build

# Start production server locally
pnpm start

# Clean build artifacts
pnpm clean
```

**pnpm-Specific Features:**

```bash
# View dependency tree
pnpm list --depth=1

# Check for outdated packages
pnpm outdated

# Update dependencies
pnpm update

# Prune unused packages
pnpm prune

# Store management (disk space efficiency)
pnpm store status
pnpm store prune

# Workspace commands (if using monorepo in future)
pnpm --filter <package-name> <command>
```

## Environment Configuration

**Required Environment Variables:**

```bash
# .env.local (development)
NEXT_PUBLIC_APP_NAME=WordCraft
NEXT_PUBLIC_APP_VERSION=1.0.0

# Future: Error tracking
# NEXT_PUBLIC_SENTRY_DSN=<sentry-dsn>

# Future: Analytics
# NEXT_PUBLIC_ANALYTICS_ID=<analytics-id>
```

**Environment Variable Rules:**
- `NEXT_PUBLIC_*` prefix for client-side accessible variables
- Never commit `.env.local` to git
- Use `.env.example` to document required variables

## Git Workflow

**Branch Strategy:**

```bash
main              # Production-ready code
├── develop       # Integration branch (future)
└── feature/*     # Feature branches
```

**Commit Message Convention:**

```
feat: Add word scramble game mechanic
fix: Correct confidence scoring calculation
docs: Update architecture documentation
style: Format code with Prettier
refactor: Extract storage logic to separate module
test: Add tests for learning style detection
chore: Update dependencies
```

**Pull Request Checklist:**
- [ ] TypeScript builds without errors
- [ ] All tests pass
- [ ] Linting passes
- [ ] No console errors in browser
- [ ] Manual testing completed
- [ ] Documentation updated if needed

## Code Review Guidelines

**What to Check:**
1. Type safety - No `any` types without justification
2. Error handling - All storage operations wrapped in try-catch
3. Component structure - Follows existing patterns
4. Accessibility - Interactive elements keyboard accessible
5. Performance - No unnecessary re-renders
6. Testing - New features have test coverage

## Testing Workflow

**Test Organization:**

```
# Component tests alongside source
components/games/WordScramble.test.tsx
components/games/WordScramble.tsx

# Unit tests in __tests__ directories
lib/algorithms/__tests__/confidence-scoring.test.ts

# E2E tests in dedicated directory
tests/e2e/game-session.spec.ts
```

**Running Tests:**

```bash
# Quick test run (changed files only)
pnpm test

# Full test suite
pnpm test:all

# Coverage report
pnpm test:coverage
# Open coverage/index.html to view report

# E2E tests (requires built application)
pnpm build && pnpm test:e2e

# E2E in headed mode (visible browser)
pnpm test:e2e:headed
```

---
