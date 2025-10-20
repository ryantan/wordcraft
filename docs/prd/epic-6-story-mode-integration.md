# Epic 6: Story Mode Integration

**Expanded Goal**: Create a beat-based narrative system where each story beat advances the narrative through game challenges, choice moments, narrative segments, and checkpoint celebrations. LLM-generated content (initially stub-based) creates contextual, word-relevant story beats that make learning feel like an interactive adventure. The system supports two-stage progression: Stage 1 presents words in story-coherent order for narrative flow, while Stage 2 focuses on mastery of challenging words. By the end of this epic, children experience a dynamic, personalized story that adapts to their word list and progress, making WordCraft feel like a unique adventure tailored to their learning journey.

## Story 6.1: Select Story Theme and Create Assets

As a developer,
I want to choose a story theme and gather/create the necessary visual assets,
so that the story mode has a consistent look and feel.

**Acceptance Criteria:**
1. Story theme is selected from candidates: space adventure, treasure hunt, fantasy quest, underwater journey, etc.
2. Theme choice is documented with rationale (appeals to 5-10 age range, supports free/affordable assets)
3. Free illustration resources are identified (unDraw, Blush, Humaaans, or similar)
4. Key visual assets are collected/created: character sprite, 3-5 environment backgrounds, checkpoint icons
5. Assets are optimized for web (SVG preferred, or optimized PNG/WebP)
6. Assets are organized in `/public/story-assets/` directory
7. Asset licensing is verified as compatible with project use
8. Visual style is playful, child-friendly, and aligns with overall UI design

## Story 6.2: Create Story Progress State Machine

As a developer,
I want to build an XState machine that manages story progression and checkpoint tracking,
so that the narrative state is maintainable and persistent.

**Acceptance Criteria:**
1. `StoryProgressMachine` is created in `/machines/story/storyProgressMachine.ts`
2. Machine has states representing story checkpoints: `intro`, `checkpoint1`, `checkpoint2`, `checkpoint3`, `finale`
3. Machine manages context: current checkpoint, games completed, story milestones unlocked
4. Machine handles events: `GAME_COMPLETED`, `CHECKPOINT_REACHED`, `CONTINUE_STORY`, `STORY_RESET`
5. Progression logic: advance checkpoint every N games completed (e.g., every 5 games)
6. Machine persists state to IndexedDB so story resumes across sessions
7. Machine is visualizable in XState Inspector
8. Machine is spawned as child actor by StorySessionMachine for checkpoint detection
9. Unit tests verify checkpoint progression logic

## Story 6.3: Create Story Narrative Content

As a content creator,
I want to write simple, engaging narrative text for each story checkpoint,
so that children feel part of a larger adventure.

**Acceptance Criteria:**
1. Narrative content is written for: intro, 3-4 checkpoints, finale
2. Each narrative segment is 1-3 sentences, age-appropriate, and encouraging
3. Content reinforces the learning theme (e.g., "You've mastered 5 words! The treasure map reveals the next location...")
4. Tone is positive, adventurous, and celebrates progress
5. Content is stored in a configuration file `/lib/story-content.ts`
6. Content is easily editable and supports future theme variations
7. Content avoids gender-specific pronouns (uses "you" or "the explorer")
8. Content is reviewed for age-appropriateness and clarity

## Story 6.4: Create Story Mode Flow (Parent Story)

As a child,
I want to experience a narrative story adventure while practicing spelling,
so that learning feels like playing through an exciting game with a beginning, middle, and end.

**Acceptance Criteria:**
1. ✅ **CheckpointScreen component exists** with animations, confetti, and delayed continue
2. Story Mode is a separate `/story` route (doesn't affect existing `/practice`)
3. `StorySessionMachine` orchestrates story beat progression with support for multiple beat types
4. App automatically selects words and game mechanics based on LLM-generated story
5. Beat types include: GameBeat, ChoiceBeat, NarrativeBeat, CheckpointBeat
6. Checkpoints appear at appropriate story beats (5, 10, 15 games)
7. Story intro and finale screens frame the narrative experience
8. All story progress persists across sessions
9. Practice mode remains completely unchanged

**Substories:**
- **Story 6.4a:** Create StorySessionMachine with beat-based architecture and LLM stub
- **Story 6.4b:** Create Story Mode Page with UI integration for all beat types
- **Story 6.4c:** Create Story Intro & Finale Screens

**Implementation Notes:**
- See `docs/stories/6.4.integrate-story-checkpoints.md` for architectural decision
- LLM story generation uses stub initially (hardcoded templates), OpenAI later
- Stage 1: Words in story-coherent order (not random)
- Stage 2: Mastery phase for low-confidence words

## Story 6.5: Implement Beat-Type UI Components

As a developer,
I want to create UI components for each beat type (narrative, choice, game, checkpoint),
so that the Story Mode page can render dynamic story content.

**Acceptance Criteria:**
1. `NarrativeBeatScreen` component displays story text with "Continue" button
2. `ChoiceBeatScreen` component presents two choices for user selection
3. `GameBeatScreen` component wraps existing game mechanics with story narrative context
4. `CheckpointBeatScreen` component (already exists) shows milestone celebrations
5. All components accept beat data as props following TypeScript interfaces
6. Components have consistent visual theme aligned with story mode design
7. Animations and transitions are smooth between beat types
8. Components are responsive and work on mobile and desktop
9. Components integrate with StorySessionMachine for event handling

## Story 6.6: Create LLM Story Generation Stub

As a developer,
I want to create a stub for LLM story generation that returns template-based beats,
so that Story Mode can function immediately while we prepare for OpenAI integration later.

**Acceptance Criteria:**
1. `story-generator.ts` module created in `/lib/story/`
2. Stub function `generateStory(wordList, theme, targetBeats)` returns `GeneratedStory`
3. Generated story includes Stage 1 beats (one per word in story order)
4. Story beats include mix of GameBeat, NarrativeBeat, ChoiceBeat, and CheckpointBeat types
5. Beat narrative is contextually relevant to word (basic templates initially)
6. CheckpointBeats placed at beats 5, 10, 15 using Story 6.3 content
7. Stage 2 extra beats and fixed sequence structures are stubbed (can be empty Maps/arrays)
8. Interface is designed for future OpenAI integration (TODOs documented)
9. Unit tests verify stub generates expected beat structure

## Story 6.7: Test Story Mode Integration and Flow

As a developer,
I want to validate that the beat-based story mode creates an engaging, cohesive experience,
so that children stay motivated throughout their practice session.

**Acceptance Criteria:**
1. Integration tests verify all beat types (game, choice, narrative, checkpoint) render correctly
2. Tests verify StorySessionMachine transitions between beat types based on guards
3. Tests verify story state persists correctly across sessions (beat index, choices, progress)
4. Manual play-testing confirms beat flow feels natural and engaging
5. Testing confirms beat transitions are smooth without jarring jumps
6. Story progression from intro → beats → finale works end-to-end
7. Choice beats don't break flow; narrative beats provide context
8. LLM stub generates coherent, word-relevant story structure
9. User testing with children (if possible) validates engagement and understanding

---
