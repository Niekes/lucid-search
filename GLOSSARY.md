# Glossary

**Haystack**: the plain text being searched. Markup in it is never interpreted.

**Query**: what the user typed, as one string, or as a list of terms when the caller splits it themselves.

**Term**: one piece of a query after splitting on whitespace. Each term is matched on its own. `c++`, `e-mail` and `foo.bar` are each one term.

**Range**: a span of the original haystack that matched: start inclusive, end exclusive. Always refers to the haystack as given, never to a normalized copy. Overlapping or touching ranges are merged into one.

**Segment**: a consecutive slice of the haystack, flagged as a match or not. Laid end to end, the segments rebuild the haystack exactly.

**Normalization**: matching that ignores accents and diacritics, so `e` matches `é`, `l` matches `ł`, and `ss` matches `ß`. On by default. Matching always ignores case, whether normalization is on or not.

**Score**: a number ranking how well a haystack matched. Longer distinct matches and matches closer to the start of the haystack score higher.

_Retired in v2:_ **needle** (now query), **search term** (now term), **mark** and **flavour** (v2 returns ranges and segments, not HTML).
