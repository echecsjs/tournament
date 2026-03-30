# Design: `GameKind` validation

Enforce consistency between `kind` and `result` when recording or updating game
results.

## Validation rules

| `kind`         | Required `result` | FIDE ref      |
| -------------- | ----------------- | ------------- |
| `forfeit-win`  | `1`               | Art. 16.2.2   |
| `forfeit-loss` | `0`               | Art. 16.2.4   |
| `full-bye`     | `1`               | —             |
| `half-bye`     | `0.5`             | Art. 16.2.5   |
| `pairing-bye`  | `1`               | Art. 16.2.1   |
| `zero-bye`     | `0`               | Art. 16.2.3   |
| `undefined`    | any               | no validation |

## Error

Throws `RangeError`: `"result {result} is inconsistent with kind '{kind}'"`

## Affected methods

- `recordResult` — validate before appending.
- `updateResult` — validate before replacing.

## What doesn't change

- `clearResult` — no game data to validate.
- `standings()` — still treats all games identically for scoring. Tiebreak
  functions handle FIDE 16 nuance.
- `#isRoundComplete` — unchanged.
- Types — `GameKind` already has all 6 values.

## Testing plan

1. `recordResult` accepts `forfeit-win` with `result: 1`.
2. `recordResult` throws for `forfeit-win` with `result: 0`.
3. `recordResult` throws for `forfeit-loss` with `result: 1`.
4. `recordResult` accepts `forfeit-loss` with `result: 0`.
5. `recordResult` accepts `half-bye` with `result: 0.5`.
6. `recordResult` throws for `half-bye` with `result: 1`.
7. `updateResult` throws for inconsistent kind/result.
8. No validation when `kind` is omitted (existing behavior).
