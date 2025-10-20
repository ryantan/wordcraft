# 2. High Level Architecture

## Architecture Pattern: Jamstack

WordCraft follows the **Jamstack architecture** pattern:
- **JavaScript**: React 19 with TypeScript for all application logic
- **APIs**: None (client-side only)
- **Markup**: Pre-rendered HTML via Next.js Static Site Generation

## Deployment Platform: Vercel

- **Hosting**: Vercel Edge Network (global CDN)
- **Build**: Automated deployment on git push
- **Environment**: Production + Preview deployments

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Vercel CDN                        │
│              (Static Site Hosting)                  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              Next.js Application                    │
│            (React 19 + TypeScript)                  │
│                                                     │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │   UI Layer   │  │   Game      │  │  Storage  │ │
│  │ (Components) │◄─┤   Session   │◄─┤   Layer   │ │
│  │              │  │   Manager   │  │           │ │
│  └──────────────┘  └─────────────┘  └───────────┘ │
│         ▲                ▲                  ▲       │
│         │                │                  │       │
│         ▼                ▼                  ▼       │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │    Game      │  │  Adaptive   │  │   Types   │ │
│  │  Mechanics   │  │  Learning   │  │  (Shared) │ │
│  │  (8 games)   │  │  Engine     │  │           │ │
│  └──────────────┘  └─────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│          Browser localStorage                       │
│     (Word Lists + Game Results)                     │
└─────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Client-side only** | Simplifies architecture, reduces costs, no user authentication needed for MVP |
| **localStorage** | Sufficient for single-user data, synchronous API, works offline |
| **XState for game sessions** | Complex game flow benefits from explicit state machines |
| **Component-based games** | Each game mechanic is a pluggable React component |
| **No database** | Deferred until multi-device sync is required |

---
