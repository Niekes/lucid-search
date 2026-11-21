# Word starts in findRanges follow the server's prefix rule

Servers often match short Terms only at a Word start, for example with a Postgres regex `(^|[^[:alnum:]])term` or a `tsquery` prefix (`term:*`). If the client highlights every occurrence, `li` marks `Fe[li]z` in a result the server found through another field. `findRanges` takes `{ wordStart }`, off by default: a Term then matches only at the start of the haystack or after a character that is not a letter, digit or combining mark. Only the start of a match is checked, so `lin` still matches inside `Linas`. The rule applies to every Term, including one that starts with punctuation, so `.net` does not match in `asp.net`, as on the server. The check reads the folded haystack, not the original: the Range of `i` in `ﬁnal` maps back to the whole ligature, which starts at 0, but in the folded text the `i` follows an `f`.

This definition of a word differs on purpose from the one typo ranking uses (whitespace and punctuation, in `shape`). There, a symbol such as `$` or `+` is not a word gap. Here it is, because the server's `[[:alnum:]]` says so, and agreeing with the server is the reason the option exists.

## Considered Options

- **Reuse the typo-ranking word gaps**: rejected; `$li` would not be a Word start, unlike on the server.
- **Check the original haystack**: rejected; a match inside a ligature would count as a Word start.
- **Let only Word-start candidates compete in typo matching**: deferred. Matches are chosen first, then filtered, so with `typos` a mid-word match can hide a slightly worse one at a Word start. Changing the candidate selection from [ADR 0003](0003-typo-tolerant-findranges.md) is not worth it until someone hits it.
- **`wordStart: "short"` (only Terms under 3 letters)**: deferred; it puts one server's threshold into the API. A caller can split the Terms and call `findRanges` twice, but must then sort and merge the two lists of Ranges before `toSegments`.
- **`wordStart` in `search`**: rejected; `search` reports what literally occurs, for agent callers ([ADR 0002](0002-search-returns-data-for-agent-callers.md)).
