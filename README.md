**Lucid** is a stand-alone, zero-dependency, fast and lightweight library to highlight text and find matches.

[![CI](https://github.com/niekes/lucid-search/actions/workflows/main.yml/badge.svg)](https://github.com/niekes/lucid-search/actions/workflows/main.yml)
[![npm](https://img.shields.io/npm/v/lucid-search)](https://www.npmjs.com/package/lucid-search)
[![npm](https://img.shields.io/npm/dw/lucid-search)](https://www.npmjs.com/package/lucid-search)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/lucid-search)](https://bundlephobia.com/result?p=lucid-search)
[![npm](https://img.shields.io/npm/l/lucid-search)](https://github.com/niekes/lucid-search/blob/master/LICENSE)

<img src="assets/demo-1.gif" alt="lucid-search highlighting matches as you type">

**[Documentation and playground](https://niekes.github.io/lucid-search/)** · [Migrating from v1](https://niekes.github.io/lucid-search/guide/migration)

## Install

```bash
npm i lucid-search
```

```html
<!-- UMD build, exposes the global `lucidSearch` -->
<script src="https://unpkg.com/lucid-search/build/lucid-search.js"></script>
```

## Usage

```js
import { findMatches } from 'lucid-search';

const found = findMatches('The quick brown fox jumps over the lazy dog', 'The dog', {
    el: 'mark', // default 'span'
    cssClass: 'found' // default 'matched'
});

found.matches; // ['The', 'the', 'dog']
found.mark;
// '<mark class="found">The</mark> quick brown fox jumps over <mark class="found">the</mark> lazy <mark class="found">dog</mark>'
```

`mark` is not escaped. Only put it into `innerHTML` if you trust the haystack.

## Flavours

| Flavour                        | Takes          | Haystack   | Matches `ä` for `a` |
| ------------------------------ | -------------- | ---------- | ------------------- |
| `findMatches`                  | needle string  | plain text | no                  |
| `findMatchesHtml`              | needle string  | HTML       | no                  |
| `findMatchesNormalized`        | needle string  | plain text | yes                 |
| `findMatchesHtmlNormalized`    | needle string  | HTML       | yes                 |
| `uncoverMatches`               | array of terms | plain text | no                  |
| `uncoverMatchesHtml`           | array of terms | HTML       | no                  |
| `uncoverMatchesNormalized`     | array of terms | plain text | yes                 |
| `uncoverMatchesHtmlNormalized` | array of terms | HTML       | yes                 |

`score(matches, haystack)` ranks results: longer matches and matches closer to the start score higher. See the [API reference](https://niekes.github.io/lucid-search/api/).

## Development

```bash
pnpm install
pnpm verify # typecheck, format, lint, tests with 100% coverage, fallow, build, docs
```
