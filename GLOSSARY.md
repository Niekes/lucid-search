# Glossary

**Haystack**: the text being searched. It is either plain text or an HTML string.

**Needle**: the raw search input the user typed, as a single string, e.g. `"The dog"`.

**Search term**: one piece of a needle after splitting on whitespace, `.`, `-` or `_`, e.g. `"The"` and `"dog"`. The _uncover_ flavours take search terms directly instead of a needle.

**Match**: one occurrence of a search term found in the haystack, in its original casing (`"the"` and `"The"` are separate matches).

**Mark**: the haystack returned with every match wrapped in a highlight element.

**Flavour**: one of the eight search functions. Each one is a combination of three choices:

- _find_ (takes a needle) or _uncover_ (takes search terms)
- plain or _Html_ (ignores text inside tags)
- with or without _Normalized_

**Normalize**: make a search term also match the accented variants of its letters, so `"a"` also matches `"ä"` and `"å"`.

**Score**: a number ranking how well a haystack matched. Longer distinct matches and matches closer to the start of the haystack score higher.
