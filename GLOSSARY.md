# Glossary

**Haystack**: the text being searched. It is either plain text or an HTML string. `search` and `highlight` treat it as plain text.

**Needle**: the raw search input, as a single string, e.g. `"The dog"`. Taken literally: characters such as `+`, `.` or `(` mean themselves, never pattern syntax.

**Search term**: one piece of a needle after splitting on whitespace, `.`, `-` or `_`, e.g. `"The"` and `"dog"`. The _uncover_ flavours and `search` also take search terms directly instead of a needle. In `search`, search terms that differ only in case are the same search term.

**Match**: one occurrence of a search term found in the haystack, in its original casing (`"the"` and `"The"` are separate matches). The flavours return it as a string; `search` returns it as `{ start, end, text, term }`, so `haystack.slice(start, end) === text`.

**Missing search term**: a search term that occurs nowhere in the haystack. One covered by a longer overlapping match still occurs, so it is not missing. Tells an agent which part of its needle to rephrase.

**Mark**: the haystack returned with every match wrapped in a highlight element. The flavours return it unescaped.

**Highlight**: build a mark from the matches of `search`, HTML-escaping the whole haystack. Separate from searching; `search` never produces display output.

**Flavour**: one of the eight `findMatches*` / `uncoverMatches*` functions. Each one is a combination of three choices:

- _find_ (takes a needle) or _uncover_ (takes search terms)
- plain or _Html_ (ignores text inside tags)
- with or without _Normalized_

**Normalize**: make a search term also match the accented variants of its letters, so `"a"` also matches `"ä"` and `"å"`. Each letter stays one character, so match positions still line up with the haystack.

**Score**: a number ranking how well a haystack matched. Longer distinct matches and matches closer to the start of the haystack score higher.
