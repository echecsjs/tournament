# Changelog

## [2.1.2] - 2026-04-17

### Fixed

- Added top-level `types` field to `package.json` for TypeScript configs that
  don't resolve types through `exports` conditions.

## 2.1.1 — 2026-04-09

### Fixed

- Corrected getter return types to `readonly` (`games`, `players`, `tiebreaks`).
- Documented `TournamentSnapshot`, `AccelerationMethod`, `PairingSystem`, and
  `Result` types.

## 2.1.0 — 2026-03-30

### Added

- `updateResult(round, game)` — replace a recorded game result in any round.
- `clearResult(round, white, black)` — remove a recorded result from any round.
- `GameKind` validation — `recordResult` and `updateResult` enforce consistency
  between `kind` and `result` (e.g. `forfeit-win` requires `result: 1`).

## 0.1.1 — 2026-03-22

### Fixed

- Triggered initial npm publish (version check required a version change)

## 0.1.0 — 2026-03-22

- Initial release
