# Epic 5: Core Game Mechanics (Part 2)

**Expanded Goal**: Complete the game mechanic library by implementing the remaining 4 game types (Letter Hunt, Trace & Write, Picture Reveal, Word Building Blocks) using the established `GameMechanic` interface and adaptive engine integration. This epic expands the variety of learning experiences available to children and ensures the adaptive engine has sufficient game diversity to match different learning styles effectively. By the end of this epic, WordCraft offers 8 fully functional, diverse game mechanics that work seamlessly with the adaptive learning system.

## Story 5.1: Implement Letter Hunt Game

As a child,
I want to find and collect letters in sequence within an interactive scene,
so that I can practice spelling through exploration and discovery.

**Acceptance Criteria:**
1. `LetterHunt` component is created in `/games/letter-hunt.tsx`
2. Component implements the `GameMechanic` interface
3. Component displays an illustrated scene with letters hidden/scattered throughout
4. User must find and click/tap letters in the correct sequence to spell the word
5. Visual/audio feedback when correct letter is found; gentle hint if wrong letter clicked
6. Progress indicator shows which letters have been found (e.g., "C_T" for "CAT")
7. Scene is simple but engaging (trees, clouds, objects with letters embedded)
8. Component is categorized as kinesthetic/visual learning style
9. Component supports difficulty: easy (obvious letters), medium (subtle letters), hard (camouflaged letters)

## Story 5.2: Implement Trace & Write Game

As a child,
I want to trace letter shapes with my finger or mouse to form a word,
so that I can practice spelling through kinesthetic motor memory.

**Acceptance Criteria:**
1. `TraceAndWrite` component is created in `/games/trace-and-write.tsx`
2. Component implements the `GameMechanic` interface
3. Component displays outlined letters for the target word
4. User traces each letter path with touch/mouse; system validates tracing accuracy
5. Tracing path follows proper letter formation (top-to-bottom, left-to-right)
6. Visual feedback shows traced path in real-time (stroke appears as user draws)
7. Letter is marked complete when traced within acceptable accuracy (70-80%)
8. "Retry" option allows user to re-trace if they go off-path significantly
9. Component is categorized as kinesthetic learning style
10. Component supports difficulty: easy (thick lines, forgiving), medium (normal), hard (thin lines, strict)

## Story 5.3: Implement Picture Reveal Game

As a child,
I want to reveal a hidden picture by spelling letters correctly,
so that I'm motivated to spell accurately and see the full image.

**Acceptance Criteria:**
1. `PictureReveal` component is created in `/games/picture-reveal.tsx`
2. Component implements the `GameMechanic` interface
3. Component displays a pixelated/obscured image related to the word (e.g., cat picture for "cat")
4. On-screen keyboard or letter buttons allow user to spell the word letter-by-letter
5. Each correct letter reveals a portion of the hidden picture (progressive reveal)
6. Incorrect letters don't reveal picture but show encouraging feedback to try again
7. Complete picture is revealed when word is spelled correctly
8. Picture library uses free illustration resources or simple SVG graphics
9. Component is categorized as visual learning style
10. Component supports difficulty: easy (clear image), medium (slightly obscured), hard (very pixelated)

## Story 5.4: Implement Word Building Blocks Game

As a child,
I want to drag and drop letter tiles like building blocks to construct a word,
so that I can practice spelling through hands-on manipulation.

**Acceptance Criteria:**
1. `WordBuildingBlocks` component is created in `/games/word-building-blocks.tsx`
2. Component implements the `GameMechanic` interface
3. Component displays letter tiles scattered at the bottom of the screen
4. Empty slots at the top represent positions where letters should be placed
5. User drags letter tiles to slot positions or taps tiles then taps slots
6. Tiles snap into place when dropped on a slot; can be removed and repositioned
7. Visual feedback shows when tiles are in correct positions (color change, glow effect)
8. "Check Answer" button validates the complete word
9. Component is categorized as kinesthetic/visual learning style
10. Component supports difficulty: easy (4-letter words), medium (6-8 letters), hard (9+ letters)

## Story 5.5: Register New Games with Adaptive Engine

As a developer,
I want to register the 4 new game mechanics with the game session and adaptive engine,
so that they're available for selection during game sessions.

**Acceptance Criteria:**
1. All 4 new games are added to a game registry in `/lib/game-registry.ts`
2. Registry exports an array of all 8 available games with metadata (id, name, learning style)
3. `GameSessionMachine` can access and instantiate any registered game
4. `AdaptiveEngineMachine` considers all 8 games when selecting based on learning style
5. Learning style distribution is correct: visual (3 games), kinesthetic (3 games), visual/kinesthetic (2 games)
6. Games can be enabled/disabled via configuration for testing
7. Registry is extensible to support adding future games (supports NFR26)
8. Unit tests verify registry structure and game accessibility

## Story 5.6: Test Game Variety and Balance

As a developer,
I want to validate that all 8 games work correctly and provide balanced learning experiences,
so that children have a diverse, effective practice environment.

**Acceptance Criteria:**
1. Integration tests verify all 8 games can be loaded and played successfully
2. Tests verify each game correctly implements the `GameMechanic` interface
3. Tests verify games handle difficulty levels appropriately
4. Tests verify touch and mouse interactions work for all games
5. Manual testing on mobile and desktop confirms responsive design
6. Tests verify adaptive engine selects from all 8 games based on learning style
7. Play-through testing confirms no game is significantly harder/easier than others at same difficulty
8. Documentation includes game descriptions and learning style categorizations

---
