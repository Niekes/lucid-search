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

## Options

```js
findMatches(haystack, needle, { el: 'mark', cssClass: 'found' });
```

| Option     | Default   | Description                       |
| ---------- | --------- | --------------------------------- |
| `el`       | `span`    | The element that wraps each match |
| `cssClass` | `matched` | The class of that element         |

Options you leave out keep their default.

::: warning The mark is not escaped
`mark` is the haystack with tags added around the matches. If the haystack comes from
somewhere you don't trust, escape it before you search it, or don't put `mark` into
`innerHTML`.
:::
