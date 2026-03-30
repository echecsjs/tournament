import type { AccelerationMethod, Player } from './types.js';

/**
 * Creates an acceleration method implementing the FIDE C.04.7 Baku
 * Acceleration.
 *
 * Splits players into two groups — GA (top half) and GB (rest) — and adds
 * virtual points to GA players' scores in the first rounds, causing stronger
 * players to face each other earlier.
 *
 * Virtual points affect pairing only — they are never stored in the game
 * history or reflected in standings.
 *
 * - **First half of accelerated rounds**: GA players get 1 virtual point.
 * - **Second half of accelerated rounds**: GA players get 0.5 virtual points.
 * - **After accelerated rounds**: 0 virtual points.
 * - **GB players**: always 0 virtual points.
 *
 * @see https://handbook.fide.com/chapter/C0407202602
 * @param players - The full player list, ordered by rating descending.
 * @returns An {@link AccelerationMethod} to pass to the Tournament constructor.
 */
function bakuAcceleration(players: Player[]): AccelerationMethod {
  const gaSize = 2 * Math.ceil(players.length / 4);
  const gaIds = new Set(players.slice(0, gaSize).map((p) => p.id));

  return {
    virtualPoints: (
      player: Player,
      round: number,
      totalRounds: number,
    ): number => {
      if (!gaIds.has(player.id)) {
        return 0;
      }

      const acceleratedRounds = Math.ceil(totalRounds / 2);
      if (round > acceleratedRounds) {
        return 0;
      }

      const firstHalf = Math.ceil(acceleratedRounds / 2);
      return round <= firstHalf ? 1 : 0.5;
    },
  };
}

export { bakuAcceleration };
