type Result = 0 | 0.5 | 1;

interface AccelerationMethod {
  virtualPoints: (player: Player, round: number, totalRounds: number) => number;
}

interface Bye {
  playerId: string;
}

interface Game {
  blackId: string;
  result: Result;
  round: number;
  whiteId: string;
}

interface Pairing {
  blackId: string;
  whiteId: string;
}

interface PairingResult {
  byes: Bye[];
  pairings: Pairing[];
}

interface Player {
  id: string;
  rating?: number;
}

interface Standing {
  playerId: string;
  rank: number;
  score: number;
  tiebreaks: number[];
}

interface TournamentOptions {
  acceleration?: AccelerationMethod;
  pairingSystem: PairingSystem;
  players: Player[];
  rounds: number;
}

interface TournamentSnapshot {
  currentRound: number;
  games: Game[];
  players: Player[];
  roundPairings: Record<string, PairingResult>;
  rounds: number;
}

type PairingSystem = (
  players: Player[],
  games: Game[],
  round: number,
) => PairingResult;

type Tiebreak = (playerId: string, players: Player[], games: Game[]) => number;

export type {
  AccelerationMethod,
  Bye,
  Game,
  Pairing,
  PairingResult,
  PairingSystem,
  Player,
  Result,
  Standing,
  Tiebreak,
  TournamentOptions,
  TournamentSnapshot,
};
