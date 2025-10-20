# Epic 6: Story Mode Integration

**Expanded Goal**: Create a lightweight narrative theme that provides continuity and motivation across game sessions by introducing story checkpoints, character visuals, and progression tracking. The story mode wraps the educational experience in an engaging narrative without interrupting gameplay flow. By the end of this epic, children experience a cohesive story that advances as they complete games, adding an extra layer of motivation and making WordCraft feel like a unified adventure rather than disconnected mini-games.

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
1. `StoryProgressMachine` is created in `/machines/story-progress-machine.ts`
2. Machine has states representing story checkpoints: `intro`, `checkpoint1`, `checkpoint2`, `checkpoint3`, `finale`
3. Machine manages context: current checkpoint, games completed, story milestones unlocked
4. Machine handles events: `GAME_COMPLETED`, `CHECKPOINT_REACHED`, `STORY_RESET`
5. Progression logic: advance checkpoint every N games completed (e.g., every 5-7 games)
6. Machine persists state to IndexedDB so story resumes across sessions
7. Machine is visualizable in XState Inspector
8. Unit tests verify checkpoint progression logic

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

## Story 6.4: Integrate Story Checkpoints into Game Session

As a child,
I want to see story updates as I complete games,
so that I feel like I'm progressing through an adventure.

**Acceptance Criteria:**
1. `GameSessionMachine` integrates with `StoryProgressMachine`
2. After every N games completed, session triggers a story checkpoint event
3. Checkpoint screen displays: character visual, environment background, narrative text, "Continue" button
4. Checkpoint celebration includes simple animation (character movement, confetti, sparkles)
5. Checkpoint screen is skippable but encouraged with 3-5 second auto-delay before "Continue" appears
6. Story progression is smooth and doesn't feel intrusive to gameplay
7. UI clearly indicates this is a story moment (different visual treatment than game screens)
8. Checkpoint data is saved so progress persists across sessions

## Story 6.5: Create Story Introduction and Finale Screens

As a child,
I want to see a story introduction when I start and a finale when I finish,
so that the experience has a clear beginning and satisfying ending.

**Acceptance Criteria:**
1. Story intro screen displays when starting a new word list for the first time
2. Intro includes: character introduction, narrative setup, "Let's Begin" button
3. Story finale screen displays when all words in list reach mastery (>80% confidence)
4. Finale includes: celebration animation, congratulatory message, character completion visual
5. Finale shows summary: words mastered, games played, time spent
6. Finale offers options: "Practice More", "Try New Words", "View Progress"
7. Intro and finale are visually distinct and celebratory
8. Screens are responsive and work on mobile and desktop

## Story 6.6: Add Visual Story Elements to Game UI

As a child,
I want to see story-themed visual elements during gameplay,
so that I feel immersed in the adventure even while playing games.

**Acceptance Criteria:**
1. Game session UI includes a subtle story banner/header showing current checkpoint
2. Character sprite appears in a corner or edge of the game screen (non-intrusive)
3. Progress bar or indicator shows advancement toward next checkpoint
4. Visual theme (colors, backgrounds) aligns with selected story theme
5. Story elements don't obscure game interactions or distract from gameplay
6. Elements are visible but not dominant (games remain the focus)
7. Responsive design ensures story elements scale appropriately on mobile
8. Visual polish: smooth transitions, subtle animations for story elements

## Story 6.7: Test Story Mode Integration and Flow

As a developer,
I want to validate that story mode enhances rather than disrupts the gameplay experience,
so that children stay engaged and motivated.

**Acceptance Criteria:**
1. Integration tests verify story checkpoints trigger at correct intervals
2. Tests verify story state persists correctly across sessions
3. Manual play-testing confirms story feels motivating, not annoying
4. Testing confirms checkpoint screens don't break game flow
5. Story intro and finale appear at appropriate times
6. Visual elements render correctly on various screen sizes
7. Story content is age-appropriate and clear to target audience
8. User testing with children (if possible) validates engagement and understanding

---
