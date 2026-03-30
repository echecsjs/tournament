# Design: `updateResult` API

Replace a recorded game result without appending.

## Signature

```typescript
updateResult(
  round: number,
  game: { black: string; kind?: GameKind; result: Result; white: string },
): void
```

## Behavior

1. Find the game in `#games[round - 1]` matching the `white`/`black` pair (check
   both orderings, same as `recordResult`).
2. Replace the matched game in-place (overwrite `result`, `kind`; preserve the
   stored `white`/`black` values from the original game).
3. No return value.

## Validation

All throw `RangeError`:

| Condition                             | Message                                                     |
| ------------------------------------- | ----------------------------------------------------------- |
| `round < 1` or `round > currentRound` | `"invalid round number"`                                    |
| No games recorded for that round      | `"no results recorded for round {round}"`                   |
| No game matching the white/black pair | `"no result found for {white} vs {black} in round {round}"` |

## Edge cases

- Caller can swap white/black in the input — lookup checks both orderings. The
  stored game retains its original color assignment.
- Updating a past-round game is allowed. The corrected history feeds into future
  pairings.
- `kind` can be added, changed, or omitted (`undefined` when absent).

## Serialization

No changes needed. `toJSON()`/`fromJSON()` already serialize `#games` as-is.

## Testing plan

1. Update a result in the current round.
2. Update a result in a past round.
3. Update with swapped white/black (lookup symmetry).
4. Update the `kind` field.
5. Error: invalid round number (0, negative, beyond current).
6. Error: no result for the given pairing.
7. Standings reflect the updated result.
8. Serialization round-trip preserves updated results.
