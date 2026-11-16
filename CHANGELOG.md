# Changelog

## [Unreleased]

### Fixed

- Matches that overlap or touch share one highlight: the needle `ove ver` highlights all of `over`, not just `ove`.

## [2.1.0] - 2026-11-15

### Added

- `search` returns every match with its position and the search terms it could not find, for AI agents and their tool calls.
- `highlight` wraps the matches of `search` and HTML-escapes the whole haystack.
- `score` also takes the matches of `search`.
- `llms.txt`, a compact API reference for coding assistants, ships in the package.

### Changed

- `normalize` also covers `d`, `g`, `l`, `n`, `r`, `y`, `z`, `ą`, `ę` and `ů`, so the Normalized flavours find more accented text.

## [2.0.0] - 2026-11-15

Rewritten in TypeScript. See [Migrating from v1](https://niekes.github.io/lucid-search/guide/migration).

### Breaking

- `uncoverMatchesNormalized` and `uncoverMatchesHtmlNormalized` now normalize.
- Regex characters in the needle are matched as plain text.
- The longest match wins when search terms overlap.
- `normalize` is a named export; the deep import `lucid-search/src/normalize` is gone.
- The CDN file moved to `build/lucid-search.js`.

### Fixed

- Matches that contain a comma are no longer split.
- Empty search terms are ignored.

### Added

- TypeScript types, ESM and CommonJS builds.
- Options can be passed partially; missing fields keep their default.
- Documentation site with a playground.
