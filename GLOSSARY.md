# Glossary

**Haystack**: the plain text being searched. Markup in it is never interpreted.

**Query**: what the user typed, as one string, or as a list of terms when the caller splits it themselves.

**Term**: one piece of a query after splitting on whitespace. Each term is matched on its own. `c++`, `e-mail` and `foo.bar` are each one term.

**Range**: a span of the original haystack that matched: start inclusive, end exclusive. Always refers to the haystack as given, never to a normalized copy. Overlapping or touching ranges are merged into one.

**Segment**: a consecutive slice of the haystack, flagged as a match or not. Laid end to end, the segments rebuild the haystack exactly.

**Snippet**: a window of the haystack around its first match (or at its start, without one), as segments, for showing an excerpt in a result list. Where text was cut, it has an ellipsis segment that is not a match. Unlike the full list of segments, a snippet does not rebuild the haystack.

**Normalization**: matching that ignores accents, diacritics and ligatures, so `e` matches `é`, `l` matches `ł`, `ss` matches `ß`, and `fi` matches `ﬁ`. On by default for `findRanges`, off for `search`. Matching always ignores case, whether normalization is on or not.

**Typo**: one inserted, deleted or replaced character, or two adjacent characters swapped. `serach` is one typo away from `search`. A term may have at most one typo per 4 letters, because short terms with typos match almost anything. Off by default: `findRanges` matches a term exactly unless the caller allows typos.

**Word start**: where a word begins: at the start of the haystack, or after a character that is not a letter, digit or combining mark. `findRanges` can be told to match terms only at word starts, so `li` finds `Lina` but not `Feliz`. Scripts without spaces, such as Chinese, have almost no word starts.

**Match**: one occurrence found by `search`, as `{ start, end, text, term }`, so `haystack.slice(start, end) === text`. A Match is also a Range. `search` splits a string query on whitespace, `.`, `-` and `_`, and its matches never overlap: the longer term wins.

**Missing term**: a term `search` finds nowhere in the haystack. One covered by a longer overlapping match still occurs, so it is not missing. Tells an agent which part of its query to rephrase.

**Highlight**: build HTML from the matches of `search`, escaping the whole haystack. Separate from searching; `search` never produces display output.

**Score**: a number ranking how well a haystack matched. Longer distinct matches and matches closer to the start of the haystack score higher.

_Retired in v2:_ **needle** (now query), **search term** (now term), **mark** and **flavour** (v2 returns ranges and segments, not HTML).
