# Changelog

## [Unreleased]

### Added

- `findRanges` matches terms only where a word starts with `{ wordStart: true }`, like a server's prefix match (`(^|[^[:alnum:]])term` or `term:*`): `li` finds `Lina` but not `Feliz`. Off by default ([ADR 0004](docs/adr/0004-word-start-in-findranges.md)).
- A guide, [Highlighting Postgres results](https://niekes.github.io/lucid-search/guide/postgres), for results found with `pg_trgm` and `unaccent`: which `typos` to use, how to handle short terms, how accent folding differs, and a trigram index for the server side.

### Changed

- `llms.txt` lists `findRanges` and `toSegments` first, and it and the README show a React example, so AI assistants render matches as elements instead of building `highlight()` HTML.

### Fixed

- With `normalize`, ligatures fold into their letters, so `final` finds `ﬁnal` and `office` finds `oﬃce` (`ﬀ ﬁ ﬂ ﬃ ﬄ ﬅ ﬆ ĳ`), in `findRanges` and in `search`. Ranges still point into the original haystack; a term that covers part of a ligature highlights the whole character.

## [2.2.1] - 2026-11-16

### Fixed

- `findRanges` throws a `TypeError` that names the bad argument when the haystack or query has the wrong type, like `search` does, instead of `e.toLowerCase is not a function`. A sparse array query skips its holes, as in `search`.
- The README and docs said about 1 kB; the imports are 1.7 kB (`search` with `highlight`) and 2.2 kB (`findRanges` with `toSegments`) gzip. The README now shows the `typos` option.

## [2.2.0] - 2026-11-16

### Added

- `findRanges` forgives typos with `{ typos }`: an inserted, deleted or replaced letter, or two swapped adjacent letters, each count as one. A term gets at most one per 4 letters. Off by default ([ADR 0003](docs/adr/0003-typo-tolerant-findranges.md)).
- [Benchmarks](https://niekes.github.io/lucid-search/guide/performance#typos) against Fuse.js, uFuzzy and fuzzysort, with recall next to every timing.

### Changed

- `findRanges` is about 4 times faster on haystacks with accents: it folds only the characters outside ASCII.
- `findRanges` with `toSegments` grows from 0.9 to 2.1 kB gzip, for the typo matching.

## [2.1.0] - 2026-11-15

### Added

- `search` returns every match with its position and the terms it could not find, for AI agents and their tool calls. With `normalize`, it ignores accents the same way `findRanges` does, so `strasse` finds `Straße` and `timisoara` finds `Timișoara`.
- `highlight` wraps the matches of `search` and HTML-escapes the whole haystack.
- `score` also takes the matches of `search`, since a Match is a Range.
- `llms.txt`, a compact API reference for coding assistants, ships in the package.
- Benchmarks against other highlighting libraries, on the Performance page and as a live page in the docs.

### Changed

- `search` caches the regexes for its last 100 queries and reads the haystack once; `findRanges` searches ASCII haystacks without folding; `highlight` skips escaping when there is nothing to escape. Results are unchanged.

## [2.0.0] - 2026-11-15

Rewritten in TypeScript, returning positions instead of HTML. See [Migrating from v1](https://niekes.github.io/lucid-search/guide/migration).

### Breaking

- The eight `findMatches*` and `uncoverMatches*` functions and the HTML `mark` string are removed. Use `findRanges` and `toSegments`, and render matches with your own elements ([ADR 0001](docs/adr/0001-ranges-not-html.md)).
- HTML haystacks are no longer supported; strip markup first.
- A query is split on whitespace only, so `e-mail` and `foo.bar` are one term.
- `score(haystack, ranges)` replaces `score(matches, haystack)`.
- `normalize` is no longer exported; normalization is the `normalize` option of `findRanges`, on by default.
- The CDN file moved to `build/lucid-search.js`.

### Fixed

- Terms are matched as plain text: `c++`, `(` or `[` no longer throw, and no query can make matching slow.
- Matches that contain a comma are no longer split.
- Accent-insensitive matching covers all Latin letters, including `ñ`, `ł`, `ý`, `ž`, `ğ`, `ş`, and `ß` matches `ss`.

### Added

- `findRanges(haystack, query, { normalize })` returns sorted, merged `{ start, end }` Ranges into the original haystack.
- `toSegments(haystack, ranges)` returns `{ text, match }` Segments that rebuild the haystack exactly.
- TypeScript types, ESM, CommonJS and UMD builds.
- Documentation site with a playground.
