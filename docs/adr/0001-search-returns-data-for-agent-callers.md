# v2: search returns data for agent callers

v1 returned an HTML string (`mark`) plus matched strings, which suited search-as-you-type UIs but was unusable for AI agents and unsafe (the Haystack was put into HTML unescaped). v2 makes AI agents and their tool-calls the primary caller: `search` returns Matches with positions plus Missing Terms, Needles are literal (never regex), and Highlighting is a separate function that escapes HTML. The library stays zero-dependency, so smarter matching (embeddings, semantic ranking) is out of scope.

## Considered Options

- **Keep `mark` in the search result**: rejected; agents pay for HTML they never use, and it couples search to display.
- **Bundle an MCP server / tool package**: rejected for now; agent frameworks define tools differently, and it would break zero-dependency. The README shows a short tool wrapper instead.
- **Unicode NFD for Normalization**: rejected; it changes string length, so Match positions would no longer line up with the Haystack.
- **Keep the old functions as deprecated wrappers**: rejected; about 68 monthly downloads did not justify carrying ten exports.
