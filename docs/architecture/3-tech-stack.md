# 3. Tech Stack

## Definitive Technology Table

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| **Frontend Framework** | Next.js | 15+ | React framework with App Router | Best DX, built-in optimization, SSG support |
| **UI Library** | React | 19 | Component-based UI | Industry standard, excellent TypeScript support |
| **Language** | TypeScript | 5.x | Type-safe development | Catches errors at compile time, excellent IDE support |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS | Rapid development, consistent design system |
| **UI Components** | shadcn/ui | Latest | Pre-built accessible components | Customizable, accessible, TypeScript-native |
| **State Management (Complex)** | XState | 5.x | State machines for game sessions | Explicit state transitions prevent bugs |
| **State Management (Simple)** | React Hooks | 19 | Component state | Built-in, lightweight, sufficient for most cases |
| **Data Persistence** | localStorage | Browser API | Store word lists and results | Simple, synchronous, sufficient for MVP |
| **Testing (Unit)** | Vitest | Latest | Fast unit testing | Vite-powered, Jest-compatible API |
| **Testing (Component)** | React Testing Library | Latest | Component testing | Best practices, user-centric testing |
| **Testing (E2E)** | Playwright | Latest | End-to-end testing | Fast, reliable, multiple browser support |
| **Package Manager** | pnpm | 8.x | Package management | Faster installs, disk efficient, strict dependencies |
| **Build Tool** | Next.js Compiler | Built-in | Rust-based bundler | Fast builds, automatic optimization |
| **Deployment** | Vercel | N/A | Hosting and CI/CD | Zero-config, automatic previews, edge network |
| **Linting** | ESLint | Latest | Code quality | Catches common errors, enforces style |
| **Formatting** | Prettier | Latest | Code formatting | Consistent code style across team |

## Version Requirements

```json
// package.json (key dependencies)
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "xstate": "^5.0.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0"
  },
  "engines": {
    "node": ">=18.17.0",
    "pnpm": ">=8.0.0"
  }
}
```

---
