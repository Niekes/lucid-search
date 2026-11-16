# Getting started

## Install

```bash
npm i lucid-search
```

Or load the UMD build from a CDN. It exposes the global `lucidSearch`:

```html
<script src="https://unpkg.com/lucid-search/build/lucid-search.js"></script>
```

## Find matches

```js
import { findRanges, toSegments } from 'lucid-search';

const haystack = 'The quick brown fox jumps over the lazy dog';
const ranges = findRanges(haystack, 'The dog');
// [{ start: 0, end: 3 }, { start: 31, end: 34 }, { start: 40, end: 43 }]

toSegments(haystack, ranges);
// [
//   { text: 'The', match: true },
//   { text: ' quick brown fox jumps over ', match: false },
//   { text: 'the', match: true },
//   { text: ' lazy ', match: false },
//   { text: 'dog', match: true }
// ]
```

The query is split on whitespace, so each term is searched on its own. Matching ignores case
and accents, and terms are plain text: `c++` or `(` match themselves.

## Forgive typos

```js
findRanges('Pride and Prejudice', 'prejudcie', { typos: 1 });
// [{ start: 10, end: 19 }]
```

`typos` is the most Typos a term may have: an inserted, deleted or replaced letter, or two
adjacent letters swapped. A term gets at most one Typo per 4 letters, because short terms with
typos match almost anything. Each Range covers the best match, not the letters around it.
`score` ranks a match with typos like an exact one of the same length. See the
[benchmarks](./performance#typos) against Fuse.js, uFuzzy and fuzzysort.

## Render in React

```tsx
import { findRanges, toSegments } from 'lucid-search';

function Highlight({ text, query }: { text: string; query: string }) {
    return toSegments(text, findRanges(text, query)).map((segment, i) =>
        segment.match ? <mark key={i}>{segment.text}</mark> : segment.text
    );
}
```

No HTML string is ever built, so a haystack like `<img onerror=…>` stays plain text.
