# Performance

How lucid-search compares with other highlighting and fuzzy search libraries. Higher ops/s is faster. All
numbers are from one machine (see [Setup](#setup)), so compare the ratios rather than the
absolute values. To run the string scenarios in your own browser, open the
[Benchmark](/benchmark) page.

## Summary

- **`search` with `highlight` is the fastest or level with the fastest in three of five
  scenarios.** It leads with many short haystacks (S1, 1.7 times spotmark) and with accents
  (S3), and ties spotmark on an article (S2). When nothing matches (S4), spotmark is 6% faster. With 20
  search terms in 100 kB (S5), spotmark is 1.6 times faster: `search` also returns the position
  and search term of every match, about 12,000 objects here.
- **`findRanges` with `toSegments` is mid-field on plain text, but last when nothing matches
  (S4)**, and 4.5 times as fast as highlight-words-core with accents (S3). It is the path for
  rendering your own elements, such as in React.
- **With [typos](#typos), `findRanges` is the only library that finds every occurrence**, and
  the fastest that does on a single haystack.
- **Against mark.js, lucid-search is about 44 to 59 times faster.** mark.js walks and edits the
  DOM; lucid-search builds one string and sets it as `innerHTML` once.
- **The imports are small:** 1.9 kB gzip for `findRanges` with `toSegments` (typo matching
  included), 1.4 kB for `search` with `highlight`.

### Why it is fast

- `search` compiles the regexes for a needle once and reuses them for every haystack.
- `search` reads the haystack once to find every match. It only checks a search term again when
  that term found nothing of its own but matches were found.
- `highlight` skips HTML escaping when the haystack has nothing to escape.
- `findRanges` searches ASCII haystacks directly. In other haystacks it folds only the
  characters outside ASCII, each one once, and copies the runs of ASCII between them whole.
- With typos, `findRanges` runs Myers' bit-vector algorithm: one pass over the haystack, with a
  whole term held in one 32-bit integer.

The benchmarks repeat one needle, like search-as-you-type. A needle used once also pays for
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
| **lucid-search**              | 3,932 |
| **lucid-search (findRanges)** | 3,207 |
| spotmark                      | 2,373 |
| highlight-words-core          | 2,202 |
| highlight-words               | 1,451 |

### S2: article, 10 kB, 3 terms

| Library                       |  ops/s |
| ----------------------------- | -----: |
| spotmark                      | 59,437 |
| **lucid-search**              | 58,911 |
| highlight-words-core          | 54,926 |
| **lucid-search (findRanges)** | 38,926 |
| highlight-words               | 15,768 |

### S3: accents, 10 kB, 1 term

Every library in its accent-insensitive mode. highlight-words has none.

| Library                       |   ops/s |
| ----------------------------- | ------: |
| **lucid-search**              | 254,626 |
| spotmark                      | 222,668 |
| **lucid-search (findRanges)** |  22,157 |
| highlight-words-core          |   5,119 |
| accent-folding                |   2,852 |

### S4: no match, 10 kB, 2 terms

| Library                       |   ops/s |
| ----------------------------- | ------: |
| spotmark                      | 703,032 |
| **lucid-search**              | 661,031 |
| highlight-words-core          | 425,491 |
| highlight-words               | 405,385 |
| **lucid-search (findRanges)** | 219,668 |

### S5: stress, 100 kB, 20 terms

| Library                       | ops/s |
| ----------------------------- | ----: |
| spotmark                      | 1,192 |
| **lucid-search**              |   752 |
| **lucid-search (findRanges)** |   435 |
| highlight-words-core          |   408 |
| highlight-words               |   251 |

## Typos

lucid-search with `typos: 2` against [Fuse.js](https://www.fusejs.io) 7.5.0,
[uFuzzy](https://github.com/leeoniya/uFuzzy) 1.0.19 and
[fuzzysort](https://github.com/farzher/fuzzysort) 4.0.2. Speed alone proves nothing if a library
finds less, so every cell shows **recall** after the ops/s: the share of the expected words the
library found. Its precision was 100% wherever it found anything. The haystacks are the first
200 kB of _Pride and Prejudice_; the term targets `Netherfield` exactly, with one swap
(`Netherfeild`) and with two Typos (`Nethrfeeld`).

| Haystack            | Term          | **lucid-search** | Fuse.js          | uFuzzy        | fuzzysort        |
| ------------------- | ------------- | ---------------- | ---------------- | ------------- | ---------------- |
| one short line      | exact         | 1,342,289 · 100% | 1,009,826 · 100% | 89,382 · 100% | 3,191,240 · 100% |
| one short line      | 1 Typo (swap) | 1,354,346 · 100% | 547,508 · 100%   | 87,789 · 100% | finds nothing    |
| one short line      | 2 Typos       | 1,413,148 · 100% | finds nothing    | finds nothing | finds nothing    |
| 2,928 short lines   | exact         | 519 · 100%       | 94 · 100%        | 3,577 · 100%  | 7,747 · 29%      |
| 2,928 short lines   | 1 Typo (swap) | 524 · 100%       | 95 · 100%        | 3,402 · 100%  | finds nothing    |
| 2,928 short lines   | 2 Typos       | 537 · 100%       | finds nothing    | finds nothing | finds nothing    |
| one 200 kB haystack | exact         | 565 · 100%       | 316 · 100%       | 4,859 · 3%    | finds nothing    |
| one 200 kB haystack | 1 Typo (swap) | 527 · 100%       | 135 · 3%         | 4,775 · 3%    | finds nothing    |
| one 200 kB haystack | 2 Typos       | 581 · 100%       | finds nothing    | finds nothing | finds nothing    |

- lucid-search is the only library that finds every occurrence in every row.
- On a list of short lines, uFuzzy is about 6.5 times faster with up to one Typo: a regular
  expression rejects most lines before it looks closer. It finds nothing with two Typos.
- On a long haystack, uFuzzy and Fuse.js report only the first occurrence.
- fuzzysort matches subsequences (`fnr` finds `findRanges`), not Typos.
- A term over 32 letters matches exactly in lucid-search. With one Typo in a 38-letter term,
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

| Library                                       | min (kB) | gzip (kB) |
| --------------------------------------------- | -------: | --------: |
| highlight-words                               |      1.8 |       0.9 |
| highlight-words-core                          |      3.1 |       1.3 |
| spotmark                                      |      2.4 |       1.3 |
| **lucid-search** (`search`, `highlight`)      |      2.7 |       1.4 |
| **lucid-search** (`findRanges`, `toSegments`) |      4.3 |       1.9 |
| accent-folding                                |      9.6 |       3.3 |
| mark.js                                       |     23.4 |       6.6 |

## Setup

Measured on 2026-11-16 on an Apple M5, Node 26.13.1, Chromium from Playwright 1.65.1, with
lucid-search 2.2.0, highlight-words-core 2.0.0, highlight-words 2.0.0, spotmark 1.1.1,
accent-folding 2.7.0, mark.js 8.11.1, Fuse.js 7.5.0, uFuzzy 1.0.19 and fuzzysort 4.0.2.

- **Node:** Vitest benchmarks, 5 seconds per library and scenario.
- **Browser:** 50 warm-up runs, then the median of 7 one-second rounds.

The benchmarks live in [`bench/`](https://github.com/niekes/lucid-search/tree/master/bench).
Run them yourself:

```bash
pnpm bench          # string libraries and typos, Node
pnpm bench:browser  # lucid-search vs mark.js, Chromium
pnpm bench:size     # bundle sizes
```
