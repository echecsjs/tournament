import type {
  AccelerationMethod,
  Game,
  PairingResult,
  PairingSystem,
  Player,
  Result,
  Standing,
  Tiebreak,
  TournamentOptions,
  TournamentSnapshot,
} from './types.js';

class Tournament {
  readonly #acceleration?: AccelerationMethod;
  #currentRound = 0;
  #games: Game[] = [];
  readonly #pairingSystem: PairingSystem;
  readonly #players: Player[];
  #roundPairings = new Map<number, PairingResult>();
  readonly #rounds: number;

  constructor(options: TournamentOptions) {
    if (options.players.length < 2) {
      throw new RangeError('at least 2 players are required');
    }
    if (options.rounds < 1) {
      throw new RangeError('at least 1 round is required');
    }
    this.#acceleration = options.acceleration;
    this.#pairingSystem = options.pairingSystem;
    this.#players = [...options.players];
    this.#rounds = options.rounds;
  }

  get currentRound(): number {
    return this.#currentRound;
  }

  get games(): readonly Game[] {
    return [...this.#games];
  }

  get isComplete(): boolean {
    return (
      this.#currentRound >= this.#rounds &&
      this.#isRoundComplete(this.#currentRound)
    );
  }

  get players(): readonly Player[] {
    return [...this.#players];
  }

  get rounds(): number {
    return this.#rounds;
  }

  pairRound(): PairingResult {
    if (this.#currentRound >= this.#rounds) {
      throw new RangeError('tournament is complete');
    }
    if (this.#currentRound > 0 && !this.#isRoundComplete(this.#currentRound)) {
      throw new RangeError(
        `round ${this.#currentRound} has unrecorded results`,
      );
    }

    this.#currentRound++;

    let games = [...this.#games];
    if (this.#acceleration) {
      games = [...games, ...this.#buildVirtualGames(this.#currentRound)];
    }

    const result = this.#pairingSystem(
      this.#players,
      games,
      this.#currentRound,
    );
    this.#roundPairings.set(this.#currentRound, result);
    return result;
  }

  recordResult(game: Omit<Game, 'round'>): void {
    if (this.#currentRound === 0) {
      throw new RangeError('no round has been paired yet');
    }

    const roundPairings = this.#roundPairings.get(this.#currentRound);
    if (!roundPairings) {
      throw new RangeError('no pairings for current round');
    }

    const validPairing = roundPairings.pairings.some(
      (p) =>
        (p.whiteId === game.whiteId && p.blackId === game.blackId) ||
        (p.whiteId === game.blackId && p.blackId === game.whiteId),
    );
    if (!validPairing) {
      throw new RangeError(
        `no pairing found for ${game.whiteId} vs ${game.blackId}`,
      );
    }

    this.#games.push({ ...game, round: this.#currentRound });
  }

  standings(tiebreaks: Tiebreak[] = []): Standing[] {
    const results = this.#players.map((player) => {
      let score = 0;
      for (const g of this.#games) {
        if (g.whiteId === player.id) {
          score += g.result;
        } else if (g.blackId === player.id) {
          score += 1 - g.result;
        }
      }

      const tiebreakValues = tiebreaks.map((tb) =>
        tb(player.id, this.#players, this.#games),
      );

      return {
        playerId: player.id,
        rank: 0,
        score,
        tiebreaks: tiebreakValues,
      };
    });

    // Sort: score desc, then tiebreaks in order desc
    results.sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      for (let index = 0; index < tiebreaks.length; index++) {
        const diff = (b.tiebreaks[index] ?? 0) - (a.tiebreaks[index] ?? 0);
        if (diff !== 0) {
          return diff;
        }
      }
      return 0;
    });

    // Assign ranks (1-based, ties get same rank)
    let previous: (typeof results)[number] | undefined;
    for (const [index, current] of results.entries()) {
      if (previous === undefined) {
        current.rank = 1;
      } else {
        const tied =
          current.score === previous.score &&
          current.tiebreaks.every(
            (v, index_) => v === (previous?.tiebreaks[index_] ?? 0),
          );
        current.rank = tied ? previous.rank : index + 1;
      }
      previous = current;
    }

    return results;
  }

  toJSON(): TournamentSnapshot {
    const roundPairings: Record<string, PairingResult> = {};
    for (const [round, pairings] of this.#roundPairings) {
      roundPairings[String(round)] = pairings;
    }
    return {
      currentRound: this.#currentRound,
      games: [...this.#games],
      players: [...this.#players],
      roundPairings,
      rounds: this.#rounds,
    };
  }

  static fromJSON(
    snapshot: TournamentSnapshot,
    pairingSystem: PairingSystem,
    acceleration?: AccelerationMethod,
  ): Tournament {
    const tournament = new Tournament({
      acceleration,
      pairingSystem,
      players: snapshot.players,
      rounds: snapshot.rounds,
    });
    tournament.#currentRound = snapshot.currentRound;
    tournament.#games = [...snapshot.games];
    for (const [round, pairings] of Object.entries(snapshot.roundPairings)) {
      tournament.#roundPairings.set(Number(round), pairings);
    }
    return tournament;
  }

  #buildVirtualGames(round: number): Game[] {
    if (!this.#acceleration) {
      return [];
    }
    const virtualGames: Game[] = [];
    for (const player of this.#players) {
      const vp = this.#acceleration.virtualPoints(player, round, this.#rounds);
      if (vp > 0) {
        virtualGames.push({
          blackId: '',
          result: vp as Result,
          round: 0,
          whiteId: player.id,
        });
      }
    }
    return virtualGames;
  }

  #isRoundComplete(round: number): boolean {
    const pairings = this.#roundPairings.get(round);
    if (!pairings) {
      return false;
    }
    const roundGames = this.#games.filter((g) => g.round === round);
    return roundGames.length >= pairings.pairings.length;
  }
}

export { Tournament };
