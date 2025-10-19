# WordCraft - Make Spelling Fun

An adaptive spelling game for children ages 5-10. This project uses game mechanics and adaptive learning to make spelling practice engaging and effective.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3000
```

## 📋 Project Status

**✅ Epic 1: Foundation & Project Setup - COMPLETE**

- [x] Next.js 15+ with TypeScript configured
- [x] Tailwind CSS with custom design tokens
- [x] ESLint & Prettier configured
- [x] Project structure created
- [x] Environment variables set up
- [x] Basic layout and routing

**🎯 Next: Epic 2 - Word List Management**

## 🛠️ Development Commands

```bash
# Development
pnpm dev          # Start dev server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm format       # Format code with Prettier
pnpm type-check   # Check TypeScript types

# Testing (to be implemented)
pnpm test         # Run unit tests
pnpm test:e2e     # Run E2E tests
```

## 📁 Project Structure

```
wordcraft/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── games/           # Game mechanic implementations
├── machines/        # XState state machines
├── lib/             # Utilities and algorithms
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── public/          # Static assets
├── __tests__/       # Tests
└── docs/            # Documentation
```

## 📚 Documentation

- [Product Requirements Document](./docs/prd.md) - Full feature specifications
- [Frontend Architecture](./docs/ui-architecture.md) - Technical architecture
- [Project Brief](./docs/brief.md) - Project overview

## 🔧 Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: Tailwind CSS 3+ with custom design tokens
- **State Management**: XState v5 for complex game flows
- **UI Components**: shadcn/ui for accessible components
- **Animation**: Framer Motion for engaging interactions
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deployment**: Vercel

## 🎯 Roadmap

See the [PRD](./docs/prd.md) for detailed user stories:

1. ✅ **Epic 1**: Foundation & Project Setup
2. 🔄 **Epic 2**: Word List Management
3. **Epic 3**: Core Game Mechanics Part 1 (4 games)
4. **Epic 4**: Adaptive Learning Engine
5. **Epic 5**: Core Game Mechanics Part 2 (4 more games)
6. **Epic 6**: Story Mode Integration
7. **Epic 7**: Parent Dashboard & Analytics
8. **Epic 8**: Polish, Performance & Launch

## 🎮 Features

- **Adaptive Learning**: Game adjusts difficulty based on child's performance
- **Multiple Game Mechanics**: 8+ different game types to keep practice engaging
- **Story Mode**: Narrative progression tied to spelling mastery
- **Confidence Scoring**: Tracks mastery of individual words
- **Parent Dashboard**: Progress tracking and insights
- **No Authentication**: Simple, privacy-focused approach for MVP
