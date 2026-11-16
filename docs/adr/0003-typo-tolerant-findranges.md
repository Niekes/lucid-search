# Typo-tolerant matching in findRanges, with Myers' bit-vector algorithm

Search boxes over prose need to forgive typos, and the library's goal is to beat the other position-returning libraries (Fuse.js, uFuzzy, fuzzysort) on speed without finding less. `findRanges` takes `{ typos }`, the most Typos a single Term may have. It defaults to 0, which keeps exact matching on its own `indexOf` path so the default never gets slower. A Term gets at most one Typo per 4 letters, because short Terms with Typos match almost anything. Swapping two adjacent letters counts as one Typo, because it is the most common typing mistake (`serach`). Matching runs Myers' bit-vector algorithm with Hyyrö's transposition extension on the folded haystack. Its running time is linear in the haystack because one 32-bit integer holds the whole Term; Terms over 32 letters therefore match exactly, and the sources map of `fold` turns each hit back into a Range of the original haystack. From each group of overlapping candidates, only the best one is kept: fewest Typos first, then one that starts and ends on the Term's own first and last letters, then the length closest to the Term's. `merge` would otherwise join them into a Range wider than the word, and length alone would pick `Café ` (with its space) for `cafee`.

## Considered Options

- **Subsequence matching (`fnr` finds `findRanges`)**: rejected for now; it suits command palettes, not prose, and returns scattered Ranges. It can be a separate option later.
- **Plain Sellers dynamic programming**: rejected; it is a factor of the Term's length slower than Myers and gives the same results.
- **Plain Levenshtein (a swap is two Typos)**: rejected; `{ typos: 1 }` would miss `serach`.
- **Typo matching in `search` too**: rejected; its Missing Terms and "longer Term wins" rule ([ADR 0002](0002-search-returns-data-for-agent-callers.md)) assume exact matches, and agent callers need to know what literally occurs.
- **WebAssembly**: rejected unless the benchmark shows it winning; every call would have to copy the haystack into WebAssembly memory, and Myers is integer bit operations that JavaScript engines already compile to fast code.
- **Multi-block Myers for Terms over 32 letters**: deferred; nobody types such Terms into a search box, and it slows the inner loop.
- **Rank Ranges by their Typos in `score`**: deferred; it needs `Range` or `score` to change shape, which is public API.
- **Benchmarks that gate CI**: rejected; timings on shared CI runners vary too much. `pnpm bench` runs locally and checks every library's recall before timing it.
