# 6. Core Workflows

## Workflow 1: Adaptive Game Session Flow

```mermaid
sequenceDiagram
    participant User
    participant SessionManager
    participant WordSelector
    participant AdaptiveEngine
    participant GameMechanic
    participant Storage

    User->>SessionManager: Start Game Session
    SessionManager->>Storage: Load WordList
    Storage-->>SessionManager: WordList data

    SessionManager->>AdaptiveEngine: Get confidence scores
    AdaptiveEngine->>Storage: Load GameResults
    Storage-->>AdaptiveEngine: Historical results
    AdaptiveEngine-->>SessionManager: Confidence map

    SessionManager->>WordSelector: Select words for session
    WordSelector->>AdaptiveEngine: Get learning profile
    AdaptiveEngine-->>WordSelector: LearningStyleProfile
    WordSelector-->>SessionManager: Selected words (prioritized)

    loop For each word
        SessionManager->>GameMechanic: Display word challenge
        User->>GameMechanic: Complete challenge
        GameMechanic-->>SessionManager: GameResult
        SessionManager->>Storage: Save result
        SessionManager->>AdaptiveEngine: Update confidence
    end

    SessionManager->>User: Show session summary
```

## Workflow 2: Confidence Scoring Update

```mermaid
sequenceDiagram
    participant GameMechanic
    participant SessionManager
    participant ConfidenceScorer
    participant Storage

    GameMechanic->>SessionManager: Submit GameResult
    SessionManager->>ConfidenceScorer: Calculate new confidence
    ConfidenceScorer->>Storage: Load previous results for word
    Storage-->>ConfidenceScorer: Historical GameResult[]

    ConfidenceScorer->>ConfidenceScorer: Apply scoring algorithm
    Note over ConfidenceScorer: Factors:<br/>- Success rate<br/>- Time spent<br/>- Hints used<br/>- Recency

    ConfidenceScorer-->>SessionManager: Updated confidence (0-100)
    SessionManager->>Storage: Save GameResult
    Storage-->>SessionManager: Success
```

## Workflow 3: Word Selection Algorithm

```mermaid
graph TD
    Start[Start Session] --> LoadWords[Load WordList]
    LoadWords --> GetConfidence[Get confidence scores for all words]
    GetConfidence --> GetProfile[Get learning style profile]

    GetProfile --> Categorize[Categorize words by confidence]
    Categorize --> Low[Low confidence<br/>0-40%]
    Categorize --> Medium[Medium confidence<br/>41-75%]
    Categorize --> High[High confidence<br/>76-100%]

    Low --> SpacedRep1[Apply spaced repetition]
    Medium --> SpacedRep2[Apply spaced repetition]
    High --> SpacedRep3[Apply spaced repetition]

    SpacedRep1 --> Select[Select words:<br/>60% low<br/>30% medium<br/>10% high]
    SpacedRep2 --> Select
    SpacedRep3 --> Select

    Select --> MatchGames[Match to suitable game mechanics]
    MatchGames --> Randomize[Randomize game order]
    Randomize --> Return[Return selected words + games]
```

## Workflow 4: Learning Style Detection

```mermaid
sequenceDiagram
    participant User
    participant Games
    participant LearningDetector
    participant Profile
    participant Storage

    User->>Games: Plays various games
    Games->>Storage: Save GameResults with learning style tags

    Note over Storage: Each game tagged with:<br/>visual/auditory/kinesthetic

    LearningDetector->>Storage: Load recent GameResults
    Storage-->>LearningDetector: Last 50 results

    LearningDetector->>LearningDetector: Analyze performance by style
    Note over LearningDetector: Higher success rate<br/>+ faster completion<br/>= stronger style indicator

    LearningDetector->>Profile: Update profile scores
    Profile->>Profile: Calculate dominant style
    Profile->>Storage: Save updated profile

    Note over Profile: Used for future<br/>game selection
```

## Workflow 5: Word List to Game Session

```mermaid
graph LR
    A[User selects<br/>Word List] --> B[Choose Difficulty]
    B --> C[Session Manager<br/>starts session]

    C --> D[Load words]
    C --> E[Load confidence data]
    C --> F[Load learning profile]

    D --> G[Word Selector]
    E --> G
    F --> G

    G --> H[Select 10 words<br/>adaptive prioritization]
    H --> I[Match words to<br/>appropriate games]

    I --> J[Game 1]
    J --> K[Game 2]
    K --> L[...]
    L --> M[Game 10]

    M --> N[Session Summary<br/>+ confidence updates]
    N --> O[Save all results<br/>to localStorage]
```

---
