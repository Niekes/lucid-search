# Suggestions come from a separate `suggest`, not from search

Agents that get a Missing Term back from `search` need to know what to rephrase it to. `suggest(haystack, term)` returns one Suggestion as a Match, or `undefined`: the whole word in the haystack that is the fewest Typos away from the Term (ties go to the earliest), with Normalization always on and the Typo budget of `findRanges` (at most one per 4 letters). It reuses the typo matching from [ADR 0003](0003-typo-tolerant-findranges.md) and keeps only matches that start at a Word start and end where a word ends. It is its own function, so `search` stays exact and does not bundle the typo code. Callers run it on `result.missing`.

## Considered Options

- **A `suggestions` field on `SearchResult`**: rejected. Agents would need one call instead of two, but `search` would always bundle the typo code, which pushes against its size budget, and it would mix fuzzy results into the result that ADR 0002 and 0003 keep literal.
- **Suggestions from a caller-supplied word list**: rejected. It is a spellchecker, not search over the haystack, and a Suggestion that does not occur in the haystack gives the agent nothing to find.
- **Any slice, not only whole words**: rejected. `serch` would get `search` from inside `researching`, a word the reader cannot find in the text.
- **A ranked list of Suggestions**: deferred. Ranking needs a public shape for Typos, the same reason ADR 0003 put off ranking Ranges by Typos.
- **A looser Typo budget for short Terms**: rejected. Short Terms with Typos match almost anything, so `teh` gets no Suggestion.

## Consequences

Matches are chosen first and filtered to whole words afterwards, so, as [ADR 0004](0004-word-start-in-findranges.md) notes for `wordStart`, a mid-word variant can hide a slightly worse whole-word one in the same run.
