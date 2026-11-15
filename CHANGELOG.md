# Changelog

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
