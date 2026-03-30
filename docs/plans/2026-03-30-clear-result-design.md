# Design: `clearResult` API

Undo a recorded game result, removing it from the round's game list.

## Signature

```typescript
clearResult(round: number, white: string, black: string): void
```

## Behavior

1. Find the game in `#games[round - 1]` matching the `white`/`black` pair (check
   both orderings, same as `updateResult`).
2. Remove the matched game from the array via `splice`.
3. No return value.
4. After clearing, the round becomes "incomplete" — `#isRoundComplete` returns
   `false` since `games.length < pairings.length`. `pairRound()` will refuse to
   advance until the result is re-recorded.

## Validation

All throw `RangeError`:

| Condition                             | Message                                                     |
| ------------------------------------- | ----------------------------------------------------------- |
| `round < 1` or `round > currentRound` | `"invalid round number"`                                    |
| No games recorded for that round      | `"no results recorded for round {round}"`                   |
| No game matching the white/black pair | `"no result found for {white} vs {black} in round {round}"` |

## Edge cases

- Caller can swap white/black — lookup checks both orderings.
- Clearing a past-round result is allowed. The round becomes incomplete by count
  but subsequent rounds that were already paired remain valid.
- Clearing the same game twice throws on the second call (no longer exists).
- After clearing, the same pairing can be re-recorded via `recordResult`.

## Serialization

No changes needed. `toJSON()`/`fromJSON()` serialize `#games` as-is.

## Testing plan

1. Clear a result in the current round — game count decreases by 1.
2. Clear a result in a past round.
3. Clear with swapped white/black (lookup symmetry).
4. Error: invalid round number (0, negative, beyond current).
5. Error: no result for the given pairing.
6. After clearing, the pairing can be re-recorded with `recordResult`.
7. Standings reflect the cleared result (score drops).
8. Serialization round-trip after clearing.
