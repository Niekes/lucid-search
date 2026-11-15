# Performance

How lucid-search compares with other highlighting libraries. Higher ops/s is faster. All
numbers are from one machine (see [Setup](#setup)), so compare the ratios rather than the
absolute values.

## Summary

- **Against string libraries, lucid-search is mid-field.** spotmark is the fastest in every
  scenario. highlight-words-core is faster than lucid-search in S1 and S2. lucid-search beats
  highlight-words-core with many search terms (S6) and is 28 times faster with accents (S4).
  Without matches (S5) they tie.
- **Against mark.js, lucid-search is about 20 to 65 times faster.** mark.js walks and edits the DOM;
  lucid-search builds one string and sets it as `innerHTML` once.
- **lucid-search is the smallest import**, at 0.4 kB gzip for `findMatches`.
- **Only lucid-search and mark.js handle HTML haystacks.** spotmark puts tags inside
  attributes, and the others work on plain text only.

## String libraries (Node)

Each library returns an HTML string with every match wrapped in a `span`. Before timing,
the benchmark checks that every library highlights exactly the same text. A library that
doesn't is left out of that scenario.

### S1: search-as-you-type, 1,000 items of 60 characters, 2 terms

One operation highlights the whole list.

| Library              | ops/s |
| -------------------- | ----: |
| spotmark             | 2,389 |
| highlight-words-core | 2,184 |
| **lucid-search**     | 1,579 |
| highlight-words      | 1,478 |

### S2: article, 10 kB, 3 terms

| Library              |  ops/s |
| -------------------- | -----: |
| spotmark             | 58,376 |
| highlight-words-core | 52,829 |
| **lucid-search**     | 36,890 |
| highlight-words      | 17,054 |

### S4: accents, 10 kB, 1 term

Every library in its accent-insensitive mode. highlight-words has none.

| Library              |   ops/s |
| -------------------- | ------: |
| spotmark             | 221,863 |
| **lucid-search**     | 140,137 |
| highlight-words-core |   4,986 |
| accent-folding       |   2,844 |

### S5: no match, 10 kB, 2 terms

| Library              |   ops/s |
| -------------------- | ------: |
| spotmark             | 695,592 |
| **lucid-search**     | 425,270 |
| highlight-words-core | 416,669 |
| highlight-words      | 396,629 |

### S6: stress, 100 kB, 20 terms

| Library              | ops/s |
| -------------------- | ----: |
| spotmark             | 1,176 |
| **lucid-search**     |   460 |
| highlight-words-core |   401 |
| highlight-words      |   231 |

## Against mark.js (Chromium)

mark.js highlights DOM elements, so it runs in a real browser. Both libraries end with the
highlighted text on the page: lucid-search sets `innerHTML` to its mark, and mark.js
highlights the element in place. Both highlight exactly the same text.

| Scenario                        | **lucid-search** | mark.js |
| ------------------------------- | ---------------: | ------: |
| S2 article, 10 kB, 3 terms      |           16,708 |     372 |
| S3 HTML article, 10 kB, 3 terms |            7,171 |     339 |
| S4 accents, 10 kB, 1 term       |           58,733 |     891 |

## Bundle size

Minified and gzipped size of the main function's import, after tree-shaking.

| Library              | min (kB) | gzip (kB) |
| -------------------- | -------: | --------: |
| **lucid-search**     |      0.7 |       0.4 |
| highlight-words      |      1.8 |       0.9 |
| highlight-words-core |      3.1 |       1.3 |
| spotmark             |      2.4 |       1.3 |
| accent-folding       |      9.6 |       3.3 |
| mark.js              |     23.4 |       6.6 |

## Setup

Measured on 2026-11-15 on an Apple M5, Node 26.13.1, Chromium from Playwright 1.65.1, with
lucid-search 2.0.0, highlight-words-core 2.0.0, highlight-words 2.0.0, spotmark 1.1.1,
accent-folding 2.7.0 and mark.js 8.11.1.

- **Node:** Vitest benchmarks, 5 seconds per library and scenario.
- **Browser:** 50 warm-up runs, then the median of 7 one-second rounds.

The benchmarks live in [`bench/`](https://github.com/niekes/lucid-search/tree/master/bench).
Run them yourself:

```bash
pnpm bench          # string libraries, Node
pnpm bench:browser  # lucid-search vs mark.js, Chromium
pnpm bench:size     # bundle sizes
```
