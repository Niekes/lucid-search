# Migrating from v1

v2 returns positions instead of an HTML string. The eight v1 functions (`findMatches`,
`findMatchesHtml`, `findMatchesNormalized`, `findMatchesHtmlNormalized` and their
`uncoverMatches*` twins) and the `mark` string are gone.

| v1                                         | v2                                                       |
| ------------------------------------------ | -------------------------------------------------------- |
| `findMatches(haystack, needle).mark`       | `toSegments(haystack, findRanges(haystack, query))`      |
| `findMatchesNormalized(…)`                 | `findRanges(…)`: normalization is on by default          |
| `findMatches(…)` without accents           | `findRanges(haystack, query, { normalize: false })`      |
| `uncoverMatches(haystack, ['the', 'dog'])` | `findRanges(haystack, ['the', 'dog'])`                   |
| `findMatchesHtml(…)`                       | Strip the markup first: HTML haystacks are not supported |
| `{ el, cssClass }` options                 | Render the Segments with your own element and class      |
| `score(matches, haystack)`                 | `score(haystack, ranges)`                                |
| `normalize(term)`                          | Removed; use the `normalize` option                      |

Other changes that can affect you:

- **Only whitespace splits a query.** `e-mail` and `foo.bar` are one term; v1 split them.
- **Terms are plain text.** In v1, `findMatches(text, '(')` threw.
- **More letters ignore accents**, including `ñ`, `ł`, `ý`, `ž`, `ğ`, `ş`, and `ß` matches `ss`.
- **The CDN file moved** to `build/lucid-search.js`. The package ships ESM, CommonJS and UMD
  builds with TypeScript types.
