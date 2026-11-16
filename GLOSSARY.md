# Glossary

**Haystack**: the plain text being searched. Markup in it is never interpreted.

**Query**: what the user typed, as one string, or as a list of terms when the caller splits it themselves.

**Term**: one piece of a query after splitting on whitespace. Each term is matched on its own. `c++`, `e-mail` and `foo.bar` are each one term.

**Range**: a span of the original haystack that matched: start inclusive, end exclusive. Always refers to the haystack as given, never to a normalized copy. Overlapping or touching ranges are merged into one.

**Segment**: a consecutive slice of the haystack, flagged as a match or not. Laid end to end, the segments rebuild the haystack exactly.

**Normalization**: matching that ignores accents and diacritics, so `e` matches `é`, `l` matches `ł`, and `ss` matches `ß`. On by default. Matching always ignores case, whether normalization is on or not.

**Match**: one occurrence found by `search`, as `{ start, end, text, term }`, so `haystack.slice(start, end) === text`. A Match is also a Range. `search` splits a string query on whitespace, `.`, `-` and `_`, and its matches never overlap: the longer term wins.

**Missing term**: a term `search` finds nowhere in the haystack. One covered by a longer overlapping match still occurs, so it is not missing. Tells an agent which part of its query to rephrase.

**Highlight**: build HTML from the matches of `search`, escaping the whole haystack. Separate from searching; `search` never produces display output.

**Score**: a number ranking how well a haystack matched. Longer distinct matches and matches closer to the start of the haystack score higher.

_Retired in v2:_ **needle** (now query), **search term** (now term), **mark** and **flavour** (v2 returns ranges and segments, not HTML).
