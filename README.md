**Lucid** is a stand-alone, zero-dependency, fast and lightweight library to highlight text and find matches.

[![Codecov](https://img.shields.io/codecov/c/github/niekes/lucid-search)](https://app.codecov.io/gh/niekes/lucid-search)
[![Travis (.org) branch](https://travis-ci.com/Niekes/lucid-search.svg?branch=master)](https://travis-ci.com/github/Niekes/lucid-search)
[![npm](https://img.shields.io/npm/dt/lucid-search)](https://www.npmjs.com/package/lucid-search)
[![npm](https://img.shields.io/npm/dw/lucid-search)](https://www.npmjs.com/package/lucid-search)
[![npm](https://img.shields.io/npm/l/lucid-search)](https://github.com/Niekes/lucid-search/blob/master/LICENSE)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/lucid-search)](https://bundlephobia.com/result?p=lucid-search)
[![npm](https://img.shields.io/npm/v/lucid-search)](https://www.npmjs.com/package/lucid-search)

<table>
    <tr>
        <td> <a target="_blank" href="https://codepen.io/niekes/pen/QWGJBKe"> <img src="assets/demo-1.gif"> </a> </td>
    </tr>
</table>

# Installing

### Npm
```bash
npm i lucid-search --save
```

### CDN
```html
<script src="https://unpkg.com/lucid-search/dist/lucid-search.min.js"></script>
```

# Demo
* [Go to examples](https://codepen.io/collection/AEqKVL)

# Usage

### Default (ES6)
```js
import {
    findMatches,
} from 'lucid-search';

const haystack = 'The quick brown fox jumps over the lazy dog';
const needle = 'The dog';

const found = findMatches(haystack, needle);

console.log(found);
/*
{
    mark: "<span class="matched">The</span> quick brown fox jumps over <span class="matched">the</span> lazy <span class="matched">dog</span>",
    matches: (3) ["The", "the", "dog"]
}
*/
```

### With options (ES6)
```js
import {
    findMatches,
} from 'lucid-search';

const haystack = 'The quick brown fox jumps over the lazy dog';
const needle = 'The dog';
/*
    Due to performance you need to pass in the whole options object with "el" and "cssClass"
*/
const options = {
    cssClass: 'found', // default is "marked"
    el: 'mark', // default is "span"
};

const found = findMatches(haystack, needle, options);

console.log(found);
/*
{
    mark: "<mark class="found">The</mark> quick brown fox jumps over <mark class="found">the</mark> lazy <mark class="found">dog</mark>",
    matches: (3) ["The", "the", "dog"]
}
*/
```

### Default (CDN)
Same like with ES6, only with `lucidSearch` prefix:
```js
// ...
const found = lucidSearch.findMatches(haystack, needle);
// ...
```

### Flavours

`findMatches(haystack, needle, options)`

* Use for plain strings **without** special characters like _????????_
* [Demo](https://codepen.io/Niekes/pen/qBRNdqp)

---

`findMatchesHtml(haystack, needle, options)`

* Use for plain strings and **html** strings **without** special characters like _????????_
* [Demo](https://codepen.io/Niekes/pen/abpZOyV)

---

`findMatchesNormalized(haystack, needle, options)`

* Use for plain strings **with** special characters like _????????_
* [Demo](https://codepen.io/Niekes/pen/zYNBGpE)

---

`findMatchesHtmlNormalized(haystack, needle, options)`

* Use for plain strings and **html** strings **with** special characters like _????????_
* [Demo](https://codepen.io/Niekes/pen/QWGJBKe)

---

`uncoverMatches(haystack, needles, options)`

* Similar to *findMatches* but expects an array of strings like `["the", "dog"]` as needle
* [Demo](https://codepen.io/Niekes/pen/eYgzNjR)

---

`uncoverMatchesHtml(haystack, needles, options)`

* Similar to *findMatchesHtml* but expects an array of strings like `["the", "dog"]` as needle

---

`uncoverMatchesNormalized(haystack, needles, options)`

* Similar to *findMatchesNormalized* but expects an array of strings like `["the", "dog"]` as needle

---

`uncoverMatchesHtmlNormalized(haystack, needles, options)`

* Similar to *findMatchesHtmlNormalized* but expects an array of strings like `["the", "dog"]` as needle

---

`score(matches, [haystack])`

* Creates a score for passed matches, pass haystack so that lucid-search ranks matches closer to the beginning higher
* [Demo](https://codepen.io/Niekes/pen/KKaMPBg)

### Funding
<a href="https://www.buymeacoffee.com/niekes" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="70"></a>

### License
[BSD-3-Clause](https://github.com/Niekes/lucid-search/blob/master/LICENSE) ?? [Stefan Nieke](https://www.niekes.com)
