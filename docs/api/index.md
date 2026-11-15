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
