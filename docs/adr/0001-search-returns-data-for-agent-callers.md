# search returns data for agent callers

The flavours return an HTML string (`mark`) plus matched strings, which suited search-as-you-type UIs but was unusable for AI agents and unsafe (the Haystack was put into HTML unescaped). `search` makes AI agents and their tool-calls the primary caller: `search` returns Matches with positions plus Missing Terms, Needles are literal (never regex), and Highlighting is a separate function that escapes HTML. The library stays zero-dependency, so smarter matching (embeddings, semantic ranking) is out of scope.

## Considered Options

- **Keep `mark` in the search result**: rejected; agents pay for HTML they never use, and it couples search to display.
- **Bundle an MCP server / tool package**: rejected for now; agent frameworks define tools differently, and it would break zero-dependency. The README shows a short tool wrapper instead.
- **Unicode NFD for Normalization**: rejected; it changes string length, so Match positions would no longer line up with the Haystack.
- **Replace the flavours**: rejected; they had just shipped in 2.0.0, so `search` and `highlight` were added alongside them in 2.1.0 and `score` takes the matches of either.
