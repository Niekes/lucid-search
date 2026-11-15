# Glossary

**Haystack**: The text being searched. Always a single string.

**Needle**: What the caller searches for: either one string, which is split into Terms, or a ready-made list of Terms. Taken literally: characters such as `+`, `.` or `(` mean themselves, never pattern syntax.

**Term**: One piece of a Needle, searched for on its own. Terms that differ only in case are the same Term. A Haystack matches if any Term is found in it.

**Match**: One place in the Haystack where a Term was found, identified by where it starts and ends, the text found there and the Term that found it.

**Missing Term**: A Term that occurs nowhere in the Haystack. A Term covered by a longer overlapping Match still occurs, so it is not missing. Tells the caller which part of its Needle to rephrase.

**Highlight**: Marking the Matches inside a Haystack for display. Separate from searching; a search never produces display output.

**Normalization**: Treating accented and plain forms of a letter as the same letter (`e` matches `é`, `ë`, …), so a Needle without accents finds accented text.

**Score**: A number for ranking Haystacks against the same Needle; higher means a better fit.
