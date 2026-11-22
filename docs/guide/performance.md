# Performance

How lucid-search compares with other highlighting and fuzzy search libraries. Higher ops/s is faster. All
numbers are from one machine (see [Setup](#setup)), so compare the ratios rather than the
absolute values. To run the string scenarios in your own browser, open the
[Benchmark](/benchmark) page.

## Summary

- **`search` with `highlight` is the fastest or level with the fastest in three of five
  scenarios.** It leads with many short haystacks (S1, 1.6 times spotmark) and with accents
  (S3), and ties spotmark on an article (S2). When nothing matches (S4), spotmark is 1% faster. With 20
  terms in 100 kB (S5), spotmark is 1.7 times faster: `search` also returns the position
  and term of every match, about 12,000 objects here.
- **`findRanges` with `toSegments` is mid-field on plain text, but last when nothing matches
  (S4)**, and 4.5 times as fast as highlight-words-core with accents (S3). It is the path for
  rendering your own elements, such as in React.
- **With [typos](#typos), `findRanges` is the only library that finds every occurrence** of a
  term up to 32 letters, and the fastest that does on a single haystack.
- **Against mark.js, lucid-search is about 44 to 59 times faster.** mark.js walks and edits the
  DOM; lucid-search builds one string and sets it as `innerHTML` once.
- **The imports are small:** 2.9 kB gzip for `findRanges` with `toSegments` and `toSnippet` (typo
  matching included), 1.8 kB for `search` with `highlight`, and 3.5 kB with `suggest` added.

### Why it is fast

- `search` compiles the regexes for a query once and reuses them for every haystack.
- `search` reads the haystack once to find every match. It only checks a term again when
  that term found nothing of its own but matches were found.
- `highlight` skips HTML escaping when the haystack has nothing to escape.
- `findRanges` searches ASCII haystacks directly. In other haystacks it folds only the
  characters outside ASCII, each one once, and copies the runs of ASCII between them whole.
- With typos, `findRanges` runs Myers' bit-vector algorithm: one pass over the haystack, with a
  whole term held in one 32-bit integer.

The benchmarks repeat one query, like search-as-you-type. A query used once also pays for
compiling its regexes.

## String libraries (Node)

Each library returns an HTML string with every match wrapped in a `span`. Before timing,
the benchmark checks that every library returns the same HTML as lucid-search, ignoring only
the attributes of the `span`: the same matches at the same places, and the same text around
them. A library that doesn't is left out of that scenario. lucid-search runs twice: `search` with `highlight`, and
`findRanges` with `toSegments`, joined into the same HTML.

### S1: search-as-you-type, 1,000 items of 60 characters, 2 terms

One operation highlights the whole list.

| Library                       | ops/s |
| ----------------------------- | ----: |
| **lucid-search**              | 3,510 |
| **lucid-search (findRanges)** | 3,043 |
| spotmark                      | 2,145 |
| highlight-words-core          | 2,000 |
| highlight-words               | 1,354 |

### S2: article, 10 kB, 3 terms

| Library                       |  ops/s |
| ----------------------------- | -----: |
| **lucid-search**              | 54,891 |
| spotmark                      | 54,250 |
| highlight-words-core          | 49,335 |
| **lucid-search (findRanges)** | 36,591 |
| highlight-words               | 15,437 |

### S3: accents, 10 kB, 1 term

Every library in its accent-insensitive mode. highlight-words has none.

| Library                       |   ops/s |
| ----------------------------- | ------: |
| **lucid-search**              | 222,111 |
| spotmark                      | 201,382 |
| **lucid-search (findRanges)** |  19,751 |
| highlight-words-core          |   4,406 |
| accent-folding                |   2,220 |

### S4: no match, 10 kB, 2 terms

| Library                       |   ops/s |
| ----------------------------- | ------: |
| spotmark                      | 649,622 |
| **lucid-search**              | 642,090 |
| highlight-words-core          | 390,222 |
| highlight-words               | 375,015 |
| **lucid-search (findRanges)** | 213,105 |

### S5: stress, 100 kB, 20 terms

| Library                       | ops/s |
| ----------------------------- | ----: |
| spotmark                      | 1,113 |
| **lucid-search**              |   638 |
| **lucid-search (findRanges)** |   409 |
| highlight-words-core          |   370 |
| highlight-words               |   214 |

## Typos

lucid-search with `typos: 2` against [Fuse.js](https://www.fusejs.io) 7.5.0,
[uFuzzy](https://github.com/leeoniya/uFuzzy) 1.0.19 and
[fuzzysort](https://github.com/farzher/fuzzysort) 4.0.2. Speed alone proves nothing if a library
finds less, so every cell shows **recall** after the ops/s: the share of the expected words the
library found. Its precision was 100% wherever it found anything. The haystacks are the first
200 kB of _Pride and Prejudice_; the term targets `Netherfield` exactly, with one swap
(`Netherfeild`) and with two typos (`Nethrfeeld`). The
last row targets a 38-letter phrase with one typo.

| Haystack            | Term               | **lucid-search** | Fuse.js        | uFuzzy        | fuzzysort        |
| ------------------- | ------------------ | ---------------- | -------------- | ------------- | ---------------- |
| one short line      | exact              | 1,086,963 · 100% | 993,629 · 100% | 89,477 · 100% | 3,176,488 · 100% |
| one short line      | 1 typo (swap)      | 1,137,898 · 100% | 559,191 · 100% | 87,527 · 100% | finds nothing    |
| one short line      | 2 typos            | 1,194,103 · 100% | finds nothing  | finds nothing | finds nothing    |
| 2,928 short lines   | exact              | 452 · 100%       | 90 · 100%      | 3,285 · 100%  | 7,321 · 29%      |
| 2,928 short lines   | 1 typo (swap)      | 440 · 100%       | 90 · 100%      | 3,308 · 100%  | finds nothing    |
| 2,928 short lines   | 2 typos            | 426 · 100%       | finds nothing  | finds nothing | finds nothing    |
| one 200 kB haystack | exact              | 535 · 100%       | 312 · 100%     | 4,512 · 3%    | finds nothing    |
| one 200 kB haystack | 1 typo (swap)      | 537 · 100%       | 135 · 3%       | 4,768 · 3%    | finds nothing    |
| one 200 kB haystack | 2 typos            | 533 · 100%       | finds nothing  | finds nothing | finds nothing    |
| one 200 kB haystack | 1 typo, 38 letters | finds nothing    | finds nothing  | 6,188 · 100%  | finds nothing    |

- For terms up to 32 letters, lucid-search is the only library that finds every occurrence
  in every row.
- On a list of short lines, uFuzzy is about 7.5 times faster with up to one typo: a regular
  expression rejects most lines before it looks closer. It finds nothing with two typos.
- On a long haystack, uFuzzy and Fuse.js report only the first occurrence.
- fuzzysort matches subsequences (`fnr` finds `findRanges`), not typos.
- A term over 32 letters matches exactly in lucid-search. With one typo in a 38-letter term,
  only uFuzzy finds it.

## Against mark.js (Chromium)

mark.js highlights DOM elements, so it runs in a real browser. Both libraries end with the
highlighted text on the page: lucid-search sets `innerHTML` to the output of `highlight`, and
mark.js highlights the element in place. Both highlight exactly the same text.

| Scenario                   | **lucid-search** | mark.js |
| -------------------------- | ---------------: | ------: |
| S2 article, 10 kB, 3 terms |           16,271 |     372 |
| S3 accents, 10 kB, 1 term  |           61,970 |   1,059 |

## Bundle size

Minified and gzipped size of the import, after tree-shaking.

| Library                                                    | min (kB) | gzip (kB) |
| ---------------------------------------------------------- | -------: | --------: |
| highlight-words                                            |      1.8 |       0.9 |
| highlight-words-core                                       |      3.1 |       1.3 |
| spotmark                                                   |      2.4 |       1.3 |
| **lucid-search** (`search`, `highlight`)                   |      4.0 |       1.8 |
| **lucid-search** (`findRanges`, `toSegments`, `toSnippet`) |      7.1 |       2.8 |
| accent-folding                                             |      9.6 |       3.3 |
| mark.js                                                    |     23.4 |       6.6 |

## Setup

Measured on 2026-11-16 on an Apple M5, Node 26.13.1, Chromium from Playwright 1.65.1, with
lucid-search 2.2.0, highlight-words-core 2.0.0, highlight-words 2.0.0, spotmark 1.1.1,
accent-folding 2.7.0, mark.js 8.11.1, Fuse.js 7.5.0, uFuzzy 1.0.19 and fuzzysort 4.0.2.

- **Node:** Vitest benchmarks, 5 seconds per library and scenario.
- **Browser:** 50 warm-up runs, then the median of 7 one-second rounds.

The benchmarks live in [`bench/`](https://github.com/niekes/lucid-search/tree/main/bench).
Run them yourself:

```bash
pnpm bench          # string libraries and typos, Node
pnpm bench:browser  # lucid-search vs mark.js, Chromium
pnpm bench:size     # bundle sizes
```
