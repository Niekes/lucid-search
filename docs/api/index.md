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
    typos?: number; // default 0
    wordStart?: boolean; // default false
}
```

## `findRanges(haystack, query, options?)`

Returns the `Range[]` of every term of the query in the haystack.

- A string query is split on whitespace into terms. Pass a `string[]` to split it yourself.
- Matching always ignores case, and terms are plain text, never patterns.
- With `normalize` (the default), accents and diacritics are ignored: `cafe` finds `Café`,
  `lodz` finds `Łódź`, `strasse` finds `Straße`, `final` finds `ﬁnal`. Standalone symbols like `^` stay searchable.
- With `typos`, a term may differ from the text by that many typos: an inserted, deleted or
  replaced letter, or two adjacent letters swapped. A term gets at most one typo per 4 letters,
  so `cat` always matches exactly, and terms over 32 letters always match exactly. Emoji and
  other characters outside the Basic Multilingual Plane count as two letters.
- With `wordStart`, a term matches only where a word starts: at the start of the haystack or
  after a character that is not a letter, digit or combining mark. `li` finds `Lina` but not
  `Feliz`, and `.net` does not match in `asp.net`.
- Ranges always point into the original haystack, even where a letter folds to two (`ß` → `ss`).
  They are sorted, and overlapping or touching ones are merged.
- An empty or blank query returns `[]`. Wrong input types throw a `TypeError`.

```js
findRanges('Straße in Łódź', 'strasse lodz');
// [{ start: 0, end: 6 }, { start: 10, end: 14 }]

findRanges('a search box', 'serach', { typos: 1 });
// [{ start: 2, end: 8 }]

findRanges('Feliz and Lina', 'li', { wordStart: true });
// [{ start: 10, end: 12 }]
```

## `toSegments(haystack, ranges)`

Slices the haystack into `Segment[]`. Joined, the segments rebuild the haystack exactly. Pass
Ranges as `findRanges` returns them: sorted and non-overlapping.

```js
toSegments('a Café', [{ start: 2, end: 6 }]);
// [{ text: 'a ', match: false }, { text: 'Café', match: true }]
```

## `toSnippet(segments, size, { ellipsis })`

Cuts Segments to a Snippet: a window of `size` characters (UTF-16 code units) around the first
match, starting about a third of `size` before it. Where text was cut, it adds
`{ text: ellipsis, match: false }` (default `'…'`, `''` for none). Edges move to a word boundary
when one is close, a surrogate pair is never split, and the first match is cut only when it is
longer than `size`. Returns `segments` unchanged when the haystack fits. Unlike `toSegments`, a
Snippet does not rebuild the haystack. Throws a `TypeError` when `size` is not a positive integer or `ellipsis` is not a string.

```js
const text = 'one two three four five six seven eight nine ten Café eleven twelve thirteen';
toSnippet(toSegments(text, findRanges(text, 'cafe')), 30);
// [{ text: '…', match: false }, { text: 'nine ten ', match: false },
//  { text: 'Café', match: true }, { text: ' eleven twelve', match: false }, { text: '…', match: false }]
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
lists the terms found nowhere. `normalize` is off by default here; when on, accents and ligatures are ignored
the same way as in `findRanges`. Wrong input types throw a
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

## `suggest(haystack, term)`

The "did you mean" for a missing term of `search`: the whole word in the haystack that is the
fewest typos away from the term, as a Match, or `undefined`. It allows one typo per 4 letters of
the term, ignores case and accents, and on a tie takes the earliest word. It never suggests part
of a word, so `serch` gets nothing from `researching`. Wrong input types throw a `TypeError`.

```js
const haystack = 'Lucid search highlights matches';
const { missing } = search(haystack, 'serach cafe');
missing.map((term) => suggest(haystack, term)?.text); // ['search', undefined]

suggest('Ein Café in Köln', 'cafe'); // { start: 4, end: 8, text: 'Café', term: 'cafe' }
```

## `highlight(haystack, matches, options?)`

Wraps the matches of `search` in `<el class="cssClass">` (default `span` and `matched`) and
HTML-escapes the whole haystack, so the result is safe for `innerHTML`.

```js
highlight('a < dog', search('a < dog', 'dog').matches);
// 'a &lt; <span class="matched">dog</span>'
```
