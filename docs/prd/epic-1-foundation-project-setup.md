# Epic 1: Foundation & Project Setup

**Expanded Goal**: Establish the complete technical foundation for WordCraft by initializing a Next.js 15+ project with TypeScript, configuring essential development tools (Tailwind CSS, XState, testing), setting up the Vercel deployment pipeline, and creating basic routing with a welcome page. This epic delivers a deployable, production-ready skeleton that validates our entire development and deployment workflow while providing the foundation for all subsequent features.

## Story 1.1: Initialize Next.js Project with TypeScript

As a developer,
I want to create a new Next.js project with TypeScript and configure the basic project structure,
so that I have a solid foundation to build WordCraft upon.

**Acceptance Criteria:**
1. Next.js 15+ project is initialized using `create-next-app` with TypeScript and App Router
2. Project includes the folder structure: `/app`, `/components`, `/games`, `/machines`, `/lib`, `/hooks`, `/types`, `/public`
3. TypeScript is configured with strict mode enabled in `tsconfig.json`
4. Project runs successfully with `npm run dev` and displays the default Next.js page
5. `.gitignore` is properly configured to exclude `node_modules`, `.next`, and other build artifacts
6. Git repository is initialized with an initial commit

## Story 1.2: Configure Tailwind CSS and Component Library

As a developer,
I want to set up Tailwind CSS and shadcn/ui for styling,
so that I can build responsive, accessible UI components efficiently.

**Acceptance Criteria:**
1. Tailwind CSS v3+ is installed and configured with Next.js
2. `tailwind.config.ts` includes mobile-first breakpoints and color scheme
3. shadcn/ui is initialized and at least one component (e.g., Button) is installed and working
4. Global styles are configured in `app/globals.css` with Tailwind directives
5. A test page demonstrates that Tailwind utilities and shadcn/ui components render correctly
6. Dark mode configuration is set up (even if not actively used in MVP)

## Story 1.3: Install and Configure XState

As a developer,
I want to set up XState v5 with TypeScript types and inspector integration,
so that I can build robust state machines for game logic and adaptive engine.

**Acceptance Criteria:**
1. XState v5 is installed with proper TypeScript types
2. XState Inspector is configured to run in development mode only
3. A simple demo machine (e.g., `counterMachine`) is created in `/machines` to validate setup
4. Demo machine is visualizable in XState Inspector during development
5. XState testing utilities are installed and a basic test validates the demo machine
6. Documentation comment or README snippet explains how to use XState Inspector

## Story 1.4: Configure Development Tools and Testing

As a developer,
I want to set up ESLint, Prettier, and Vitest for code quality and testing,
so that code remains clean, consistent, and well-tested throughout development.

**Acceptance Criteria:**
1. ESLint is configured with TypeScript and React rules
2. Prettier is configured with standard formatting rules and integrates with ESLint
3. Pre-commit hooks (using Husky or similar) run linting and formatting
4. Vitest is installed and configured for unit testing
5. React Testing Library is installed for component testing
6. At least one example test file exists and passes (`npm run test`)
7. Test coverage reporting is configured

## Story 1.5: Set Up Vercel Deployment Pipeline

As a developer,
I want to configure Vercel for automatic deployment from Git,
so that every commit triggers a deployment and I can validate the production environment.

**Acceptance Criteria:**
1. Project is connected to Vercel with GitHub integration
2. Automatic deployments are configured for the main branch (production)
3. Preview deployments are enabled for pull requests
4. Environment variables are configured if needed (even if none required for MVP)
5. First successful deployment to production is verified with a live URL
6. Deployment status badge or link is added to README

## Story 1.6: Create Welcome/Home Page and Basic Routing

As a parent,
I want to see a welcoming home page when I visit WordCraft,
so that I understand what the app does and can get started.

**Acceptance Criteria:**
1. Home page (`/app/page.tsx`) displays "WordCraft" title and tagline
2. Page includes a brief description of what WordCraft does
3. Two call-to-action buttons are present: "Create Word List" and "Continue Playing" (non-functional for now)
4. Page is responsive and looks good on mobile and desktop
5. Basic Next.js routes are set up: `/` (home), `/word-lists` (placeholder), `/play` (placeholder)
6. Navigation between routes works with Next.js Link components
7. Page follows the UX vision: clean, simple, parent-friendly design

---
