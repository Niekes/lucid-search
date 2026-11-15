# Changelog

## [2.0.1] - 2026-11-15

### Fixed

- The Html flavours run in linear time. Long text with few or no tags took seconds before (about 10 s for 500 kB).
- The Html flavours find matches before a lone `>`, as in `the dog > 0`. A tag runs from `<` to the next `>` with no other `<` in between.
- The Html flavours no longer match search terms that overlap a tag, such as `<i>`, so the mark keeps valid markup.

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
