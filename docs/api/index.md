# API

```ts
interface Range {
    start: number; // inclusive, a UTF-16 index into the original haystack
    end: number; // exclusive, like String.prototype.slice
}

interface Segment {
    text: string;
    match: boolean;
}

interface FindOptions {
    normalize?: boolean; // default true
}
```

## `findRanges(haystack, query, options?)`

Returns the `Range[]` of every term of the query in the haystack.

- A string query is split on whitespace into terms. Pass a `string[]` to split it yourself.
- Matching always ignores case, and terms are plain text, never patterns.
- With `normalize` (the default), accents and diacritics are ignored: `cafe` finds `Café`,
  `lodz` finds `Łódź`, `strasse` finds `Straße`. Standalone symbols like `^` stay searchable.
- Ranges always point into the original haystack, even where a letter folds to two (`ß` → `ss`).
  They are sorted, and overlapping or touching ones are merged.
- An empty or blank query returns `[]`.

```js
findRanges('Straße in Łódź', 'strasse lodz');
// [{ start: 0, end: 6 }, { start: 10, end: 14 }]
```

## `toSegments(haystack, ranges)`

Slices the haystack into `Segment[]`. Joined, the segments rebuild the haystack exactly. Pass
Ranges as `findRanges` returns them: sorted and non-overlapping.

```js
toSegments('a Café', [{ start: 2, end: 6 }]);
// [{ text: 'a ', match: false }, { text: 'Café', match: true }]
```

## `score(haystack, ranges)`

Ranks how well a haystack matched: the length of every distinct matched text, weighted up to 2x
the closer it starts to the beginning. Repeats of the same text (ignoring case) count once.

```js
const haystack = 'The quick brown fox';
score(haystack, findRanges(haystack, 'the fox')); // 9.47…
```

## `search(haystack, query, options?)`

Finds every literal, case-insensitive occurrence of the terms and returns plain data, built for
AI agents. A string query is split on whitespace, `.`, `-` and `_`; pass an array to choose the
terms yourself. Matches are sorted by `start` and never overlap: the longer term wins. `missing`
lists the terms found nowhere. `normalize` is off by default here; when on, accents are ignored
exactly as in `findRanges`. Wrong input types throw a
`TypeError`.

```ts
interface Match {
    start: number; // haystack.slice(start, end) === text
    end: number;
    text: string;
    term: string; // the term that found it
}

search('The lazy dog', 'the cat');
// { matches: [{ start: 0, end: 3, text: 'The', term: 'the' }], missing: ['cat'] }

search('Crème', 'creme', { normalize: true }).matches; // [{ start: 0, end: 5, text: 'Crème', term: 'creme' }]
```

A Match is also a Range, so `score(haystack, search(haystack, query).matches)` works.

## `highlight(haystack, matches, options?)`

Wraps the matches of `search` in `<el class="cssClass">` (default `span` and `matched`) and
HTML-escapes the whole haystack, so the result is safe for `innerHTML`.

```js
highlight('a < dog', search('a < dog', 'dog').matches);
// 'a &lt; <span class="matched">dog</span>'
```
