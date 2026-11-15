# Getting started

## Install

```bash
npm i lucid-search
```

Or load the UMD build from a CDN. It exposes the global `lucidSearch`:

```html
<script src="https://unpkg.com/lucid-search/build/lucid-search.js"></script>
```

## Find and mark matches

```js
import { findMatches } from 'lucid-search';

const found = findMatches('The quick brown fox jumps over the lazy dog', 'The dog');

found.matches; // ['The', 'the', 'dog']
found.mark;
// '<span class="matched">The</span> quick brown fox jumps over
//  <span class="matched">the</span> lazy <span class="matched">dog</span>'
```

The needle is split on whitespace, `.`, `-` and `_`, so each word is searched on its own.
Matching ignores case, and regex characters in the needle are treated as plain text.

## Overlapping matches

When matches overlap or touch, they share one highlight. A highlight never reaches past its
matches, so a short search term marks only the letters it matches, not the whole word.

```js
const haystack = 'The quick brown fox jumps over the lazy dog';

findMatches(haystack, 'ove ver').matches; // ['ove', 'ver']
findMatches(haystack, 'ove ver').mark;
// 'The quick brown fox jumps <span class="matched">over</span> the lazy dog'

findMatches(haystack, 'o', { el: 'mark' }).mark;
// 'The quick br<mark class="matched">o</mark>wn f<mark class="matched">o</mark>x jumps
//  <mark class="matched">o</mark>ver the lazy d<mark class="matched">o</mark>g'
```

## Options

```js
findMatches(haystack, needle, { el: 'mark', cssClass: 'found' });
```

| Option     | Default   | Description                   |
| ---------- | --------- | ----------------------------- |
| `el`       | `span`    | The element of each highlight |
| `cssClass` | `matched` | The class of that element     |

Options you leave out keep their default.

::: warning The mark is not escaped
`mark` is the haystack with tags added around the matches. If the haystack comes from
somewhere you don't trust, escape it before you search it, or don't put `mark` into
`innerHTML`.
:::
