# Migrating from v1

v2 is a TypeScript rewrite. The function names are unchanged. These are the changes that can
affect you:

- **`uncoverMatchesNormalized` and `uncoverMatchesHtmlNormalized` now normalize.** In v1 they
  behaved exactly like `uncoverMatches` and `uncoverMatchesHtml`.
- **Regex characters in the needle are plain text.** In v1, `findMatches(text, '(')` threw,
  and `a*b` matched `b`, `ab`, `aab` and so on.
- **The longest match wins.** With the needle `e emmerich`, v1 marked `E` and `e` inside
  `Emmerich`. v2 marks `Emmerich`.
- **Matches that contain a comma stay whole.** v1 split them at the comma.
- **Empty search terms are ignored.** In v1, `uncoverMatches(text, [''])` wrapped an empty
  element between every character.
- **Options are optional one by one.** Pass only `{ el: 'mark' }` and `cssClass` stays
  `matched`.
- **`normalize` is a named export of the package.** The deep import `lucid-search/src/normalize`
  is gone.
- **The CDN file moved** to `build/lucid-search.js`. The package now ships ESM, CommonJS and
  UMD builds with TypeScript types.
