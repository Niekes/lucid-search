# Benchmarks

`pnpm bench` searches the same haystacks for the same term with lucid-search (`typos: 2`),
[Fuse.js](https://www.fusejs.io) 7.5.0, [uFuzzy](https://github.com/leeoniya/uFuzzy) 1.0.19
and [fuzzysort](https://github.com/farzher/fuzzysort) 4.0.2. Speed alone proves nothing if a library finds
less, so every row first shows **recall**: the share of the expected words that the library
found. Its precision was 100% wherever it found anything.

The haystacks come from the first 200 KB of _Pride and Prejudice_. The term targets
`Netherfield`, exactly, with one swap (`Netherfeild`) and with two Typos (`Nethrfeeld`).

Apple M5, Node 26.13, 16 November 2026. Calls per second, higher is faster.

| Haystack            | Term          | lucid-search     | Fuse.js          | uFuzzy        | fuzzysort        |
| ------------------- | ------------- | ---------------- | ---------------- | ------------- | ---------------- |
| one short line      | exact         | 1,361,000 · 100% | 1,022,000 · 100% | 87,000 · 100% | 3,199,000 · 100% |
| one short line      | 1 Typo (swap) | 1,371,000 · 100% | 529,000 · 100%   | 77,000 · 100% | finds nothing    |
| one short line      | 2 Typos       | 1,459,000 · 100% | finds nothing    | finds nothing | finds nothing    |
| 2,928 short lines   | exact         | 504 · 100%       | 90 · 100%        | 3,376 · 100%  | 6,520 · 29%      |
| 2,928 short lines   | 1 Typo (swap) | 510 · 100%       | 90 · 100%        | 3,222 · 100%  | finds nothing    |
| 2,928 short lines   | 2 Typos       | 516 · 100%       | finds nothing    | finds nothing | finds nothing    |
| one 200 KB haystack | exact         | 285 · 100%       | 275 · 100%       | 4,642 · 3%    | finds nothing    |
| one 200 KB haystack | 1 Typo (swap) | 561 · 100%       | 131 · 3%         | 4,570 · 3%    | finds nothing    |
| one 200 KB haystack | 2 Typos       | 577 · 100%       | finds nothing    | finds nothing | finds nothing    |

What this shows:

- lucid-search is the only library that finds every occurrence in every row.
- On one haystack, it is the fastest library that finds everything.
- On a list of short lines, uFuzzy is about 6 times faster with up to one Typo, because a
  regular expression rejects most lines before it looks closer. It finds nothing with two
  Typos. On a long haystack, uFuzzy and Fuse.js report only the first occurrence.
- fuzzysort matches subsequences (`fnr` finds `findRanges`), not Typos.

A term over 32 letters matches exactly in lucid-search. With one Typo in a 38-letter term,
only uFuzzy finds it.

Timings on your machine will differ. CI does not run the benchmarks, because shared runners are
too noisy to compare.
