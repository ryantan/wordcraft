# Epic 4: Adaptive Learning Engine

**Expanded Goal**: Build the intelligent core that analyzes game results to calculate per-word confidence scores, implements spaced repetition logic to re-introduce challenging words at optimal intervals, detects each child's learning style preference (visual/auditory/kinesthetic), and dynamically adapts game selection and difficulty in real-time. This epic transforms WordCraft from a simple game collection into a truly adaptive learning system. By the end of this epic, the system intelligently personalizes the learning experience for each child based on their demonstrated performance and preferences.

## Story 4.1: Implement Confidence Scoring Algorithm

As a developer,
I want to build an algorithm that calculates a confidence score (0-100%) for each word based on game results,
so that the system can identify which words need more practice.

**Acceptance Criteria:**
1. A `/lib/algorithms/confidence-scoring.ts` module is created
2. Algorithm calculates confidence based on: accuracy rate, number of attempts, recency of practice
3. Formula gives more weight to recent attempts than older ones (recency bias)
4. Confidence increases with consecutive correct answers, decreases with incorrect answers
5. Thresholds are defined: <60% = needs work, 60-80% = progressing, >80% = mastered
6. Algorithm handles edge cases (new words with no history, perfect scores, etc.)
7. Unit tests verify confidence calculations for various scenarios
8. Algorithm is documented with comments explaining the scoring logic

## Story 4.2: Create Adaptive Engine State Machine

As a developer,
I want to build an XState machine that manages word prioritization, learning style detection, and game selection,
so that the adaptive logic is centralized and testable.

**Acceptance Criteria:**
1. `AdaptiveEngineMachine` is created in `/machines/adaptive-engine-machine.ts`
2. Machine manages context: word confidence scores, learning style profile, session metrics
3. Machine provides services: `prioritizeWords()`, `selectGame()`, `updateConfidence()`, `detectLearningStyle()`
4. Machine updates confidence scores after each game result
5. Machine is visualizable in XState Inspector
6. Machine can be queried by `GameSessionMachine` for word/game selection
7. Unit tests verify adaptive logic and state transitions
8. Machine persists adaptive data to IndexedDB

## Story 4.3: Implement Spaced Repetition Logic

As a developer,
I want to implement a spaced repetition algorithm that determines when to re-introduce words,
so that challenging words are practiced at optimal intervals for retention.

**Acceptance Criteria:**
1. A `/lib/algorithms/spaced-repetition.ts` module implements Leitner system or SM-2 algorithm
2. Algorithm tracks per-word: review count, last review date, current interval
3. Words with low confidence are scheduled for sooner review
4. Words with high confidence have longer intervals between reviews
5. Algorithm provides `getNextWords()` function that prioritizes words due for review
6. Within-session logic re-introduces struggling words 2-3 times per session
7. Cross-session logic schedules words for future sessions based on mastery
8. Unit tests verify spacing intervals and word prioritization

## Story 4.4: Implement Learning Style Detection

As a developer,
I want to analyze game performance across different game types to detect learning style preferences,
so that the system can emphasize effective game mechanics for each child.

**Acceptance Criteria:**
1. A `/lib/algorithms/learning-style-detection.ts` module is created
2. Algorithm tracks performance metrics by game type (visual, auditory, kinesthetic)
3. Algorithm calculates success rate, average attempts, and speed for each category
4. Learning style profile is determined after minimum 10-15 game results (enough data)
5. Profile indicates primary and secondary learning styles (e.g., 60% visual, 30% kinesthetic, 10% auditory)
6. Algorithm updates incrementally as more data is collected
7. Default profile is balanced (33% each) until sufficient data exists
8. Unit tests verify detection logic with sample game result datasets

## Story 4.5: Implement Adaptive Game Selection

As a child,
I want the system to select games that work well for how I learn,
so that practice is more effective and engaging for me.

**Acceptance Criteria:**
1. `GameSessionMachine` integrates with `AdaptiveEngineMachine` for game selection
2. Game selection algorithm considers: learning style profile, game variety, word difficulty
3. System favors game types aligned with child's detected learning style (60-70% of selections)
4. System ensures variety by not repeating same game type consecutively
5. Easier words paired with more challenging games; harder words with simpler games
6. Selection logic is configurable and can be tuned based on testing
7. System logs game selection rationale for debugging/analysis
8. Unit tests verify game selection distribution matches learning style profile

## Story 4.6: Implement Dynamic Difficulty Adjustment

As a child,
I want games to get slightly harder when I'm doing well and easier when I'm struggling,
so that practice stays appropriately challenging.

**Acceptance Criteria:**
1. Each game component accepts a `difficulty: 'easy' | 'medium' | 'hard'` prop
2. Difficulty affects game parameters: time limits, hint availability, complexity
3. `AdaptiveEngineMachine` determines difficulty based on recent performance (last 3-5 attempts)
4. Consecutive correct answers → increase difficulty; consecutive errors → decrease difficulty
5. Difficulty adjustments are gradual (don't jump from easy to hard immediately)
6. System balances challenge with confidence-building (70-80% success rate target)
7. Games implement difficulty variations (e.g., more/fewer missing letters, tighter time limits)
8. Unit tests verify difficulty adjustment logic

## Story 4.7: Integrate Adaptive Engine with Game Session

As a child,
I want the game to feel personalized and smart about what I practice,
so that my time is spent on words I need help with, not ones I've mastered.

**Acceptance Criteria:**
1. `GameSessionMachine` queries `AdaptiveEngineMachine` for next word to practice
2. Words are selected based on confidence score and spaced repetition schedule
3. Mastered words (>80% confidence) appear less frequently in sessions
4. Struggling words (<60% confidence) are re-introduced 2-3 times per session
5. Session adapts mid-game based on real-time performance
6. Session ends when all words show adequate confidence or child opts to end
7. UI displays subtle confidence indicators (progress bars, colors) for parent view
8. System handles edge cases (all words mastered, all words struggling, single-word lists)

## Story 4.8: Test and Validate Adaptive Engine

As a developer,
I want to validate that the adaptive engine produces sensible, effective learning paths,
so that I'm confident it will help children learn effectively.

**Acceptance Criteria:**
1. Integration tests simulate full game sessions with various performance patterns
2. Tests verify: confidence scores increase with correct answers, decrease with errors
3. Tests verify: low-confidence words are prioritized over high-confidence words
4. Tests verify: learning style detection converges on correct profile given biased data
5. Tests verify: game selection matches detected learning style over time
6. Tests verify: difficulty adjusts appropriately to performance trends
7. Manual testing with real game play validates adaptive behavior feels natural
8. Documentation explains adaptive engine behavior and tuning parameters

---
