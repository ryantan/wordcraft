# 11. Testing Strategy

## Testing Pyramid

```
        E2E Tests (10%)
       /              \
    Integration Tests (20%)
   /                      \
  Frontend Unit Tests (70%)
```

**Distribution:**
- **70% Unit Tests** - Pure functions, algorithms, utilities
- **20% Integration Tests** - Component + storage, game mechanics
- **10% E2E Tests** - Full user flows

## Test Organization

**Frontend Tests:**

```
components/
├── games/
│   ├── WordScramble.tsx
│   └── WordScramble.test.tsx         # Component test
lib/
├── algorithms/
│   ├── confidence-scoring.ts
│   └── __tests__/
│       └── confidence-scoring.test.ts  # Unit test
tests/
└── e2e/
    ├── game-session-flow.spec.ts     # E2E test
    └── word-list-management.spec.ts  # E2E test
```

## Test Examples

**1. Frontend Component Test:**

```typescript
// components/games/WordScramble.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { WordScramble } from './WordScramble'

describe('WordScramble', () => {
  it('handles multi-word phrases correctly', () => {
    const onComplete = vi.fn()
    const phrase = 'went red'

    render(
      <WordScramble
        word={phrase}
        onComplete={onComplete}
        difficulty="medium"
      />
    )

    // Should scramble one word and show the other as context
    expect(screen.getByText(/went|red/)).toBeInTheDocument()

    // User completes the puzzle
    const letters = screen.getAllByRole('button', { name: /[a-z]/i })
    letters.forEach(letter => fireEvent.click(letter))

    // Should call onComplete with result
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        word: phrase,
        correct: expect.any(Boolean),
        attempts: expect.any(Number),
        timeSpent: expect.any(Number),
      })
    )
  })

  it('provides hints when requested', () => {
    const onHintRequest = vi.fn()

    render(
      <WordScramble
        word="cat"
        onComplete={vi.fn()}
        onHintRequest={onHintRequest}
      />
    )

    const hintButton = screen.getByRole('button', { name: /hint/i })
    fireEvent.click(hintButton)

    expect(onHintRequest).toHaveBeenCalledTimes(1)
  })
})
```

**2. E2E Test:**

```typescript
// tests/e2e/game-session-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Game Session Flow', () => {
  test('complete full game session with adaptive learning', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Create a word list first
    await page.click('text=Manage Word Lists')
    await page.click('text=Create New List')
    await page.fill('input[name="name"]', 'Test List')
    await page.fill('textarea[name="words"]', 'cat\ndog\nbird\nwent red')
    await page.click('button[type="submit"]')

    // Start game session
    await page.goto('http://localhost:3000')
    await page.selectOption('select[name="wordList"]', 'Test List')
    await page.selectOption('select[name="difficulty"]', 'medium')
    await page.click('text=Start Game')

    // Play through 10 questions
    for (let i = 0; i < 10; i++) {
      // Wait for game to load
      await page.waitForSelector('[data-testid="game-mechanic"]')

      // Answer the question (implementation depends on game type)
      await page.click('button:has-text("Submit")')

      // Wait for next question or summary
      await page.waitForTimeout(500)
    }

    // Verify session summary
    await expect(page.locator('text=Session Complete')).toBeVisible()
    await expect(page.locator('text=Words Practiced: 10')).toBeVisible()

    // Check that confidence scores were updated
    await page.click('text=View Progress')
    await expect(page.locator('[data-testid="confidence-score"]')).toBeVisible()
  })
})
```

## Test Configuration

**Vitest Configuration:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**Playwright Configuration:**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Overall | 75%+ | TBD |
| Algorithms | 90%+ | TBD |
| Components | 70%+ | TBD |
| Storage Layer | 80%+ | TBD |

## Testing Commands

```bash
# Run all unit and component tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test WordScramble.test.tsx

# Run E2E tests
pnpm test:e2e

# Run E2E in headed mode (visible browser)
pnpm test:e2e:headed

# Generate and view coverage report
pnpm test:coverage && open coverage/index.html
```

---
