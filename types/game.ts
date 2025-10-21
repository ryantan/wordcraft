/**
 * Game Types
 * Types for game mechanics and results
 */

export interface GameMechanicProps {
  word: string;
  onComplete: (result: GameResult) => void;
  onHintRequest?: () => void;
  difficulty?: GameDifficulty;
}

export interface GameResult {
  word: string;
  correct: boolean;
  attempts: number;
  timeMs: number;
  hintsUsed: number;
  mechanicId: string;
  completedAt: Date;
}

export interface GameMechanicMeta {
  id: string;
  name: string;
  description: string;
  targetAge: [number, number]; // [min, max]
  supportsHints: boolean;
}

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export type GameMechanicId =
  | 'word-scramble'
  | 'missing-letters'
  | 'letter-matching'
  | 'spelling-challenge'
  | 'letter-hunt'
  | 'trace-write'
  | 'picture-reveal'
  | 'word-building';

export interface GameMechanic {
  meta: GameMechanicMeta;
  Component: React.ComponentType<GameMechanicProps>;
}
