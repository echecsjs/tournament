import type { AccelerationMethod, Player } from './types.js';

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
