# Next Steps

## UX Expert Prompt

You are the UX Expert for WordCraft, an adaptive spelling game for children ages 5-10. Review this PRD thoroughly, particularly:

- **User Interface Design Goals section** - Understand the dual UX philosophy: "invisible for parents, magical for kids"
- **Core Screens and Views** - Familiarize yourself with the 6 main screen types
- **Requirements (FR37-FR41)** - Note responsive design and interaction requirements

**Your Task:**

Create detailed UX/UI specifications including:
1. **Wireframes** for all 6 core screens (low-fidelity sketches showing layout and hierarchy)
2. **User Flows** for critical journeys: parent creates word list → child plays session → parent views dashboard
3. **Component Specifications** for reusable UI elements (buttons, cards, forms, game containers)
4. **Interaction Patterns** for game mechanics (drag-and-drop, touch targets, animations)
5. **Visual Design System**: Color palette (parent vs. child themes), typography scale, spacing/grid system, icon style
6. **Accessibility Guidelines**: Ensure WCAG AA compliance, keyboard navigation patterns, focus states

**Deliverables:**
- UX specification document with wireframes and flows
- Design system documentation (colors, typography, components)
- Interactive prototypes (optional but recommended) for key user flows

**Key Considerations:**
- Balance playful child interface with clean parent interface
- Ensure 44x44px touch targets for all interactive elements
- Design for mobile-first, scales up to desktop
- Animations should delight but not distract
- Story mode visuals should be simple and consistent

---

## Architect Prompt

You are the Technical Architect for WordCraft, an adaptive spelling game built with React, Next.js, XState, and Tailwind CSS. Review this PRD thoroughly, particularly:

- **Technical Assumptions section** - Understand the tech stack, architecture decisions, and constraints
- **Requirements (all FR and NFR)** - Note functional and non-functional requirements
- **All 8 Epics** - Understand the full scope and sequencing of development work

**Your Task:**

Create comprehensive technical architecture documentation including:

1. **System Architecture Diagram**: Show all major components, state machines, data flows, and storage layers
2. **Data Models**: Define TypeScript types/interfaces for all entities (WordList, GameResult, ConfidenceScore, StoryProgress, etc.)
3. **XState Machine Specifications**: Detail all state machines with states, events, context, and guards
   - GameSessionMachine
   - AdaptiveEngineMachine
   - StoryProgressMachine
   - WordListMachine
4. **Component Architecture**: Define component hierarchy, props interfaces, and reusability patterns
5. **Storage Strategy**: Detail localStorage vs IndexedDB usage, data schemas, migration strategies
6. **Game Interface Design**: Specify the `GameMechanic` interface and registration pattern
7. **Algorithm Specifications**: Pseudo-code or detailed logic for:
   - Confidence scoring algorithm
   - Spaced repetition logic (Leitner or SM-2)
   - Learning style detection
   - Adaptive game selection
   - Dynamic difficulty adjustment
8. **Performance Strategy**: Code splitting, lazy loading, bundle optimization approach
9. **Testing Strategy**: Unit testing approach for machines and algorithms, integration testing patterns
10. **Deployment Architecture**: Vercel configuration, environment setup, CI/CD pipeline

**Deliverables:**
- Architecture document (`docs/architecture.md`)
- Data model definitions (`/types/*`)
- State machine diagrams and specifications
- Component structure and interface definitions
- Setup and development guides

**Key Considerations:**
- Client-side only for MVP (no backend)
- XState v5 for all complex state management
- Extensible architecture supporting NFR26 (pluggable games)
- TypeScript strict mode throughout
- Performance targets: <2s load, <100ms interaction latency
- LocalStorage + IndexedDB data persistence
- Support for future Phase 2 features (authentication, cloud sync)

**Critical Technical Decisions to Document:**
- How XState machines communicate and share state
- Storage abstraction layer for localStorage/IndexedDB
- Game registration and dynamic loading mechanism
- Adaptive engine integration points
- Story progression triggers and persistence
- Error handling and recovery strategies
- Testing infrastructure and patterns

---

**Ready to Begin Development?**

Once UX specifications and technical architecture are complete, development can begin with **Epic 1: Foundation & Project Setup**. Follow the user stories sequentially within each epic, ensuring each story's acceptance criteria are met before proceeding.

Good luck building **WordCraft**! 🚀

