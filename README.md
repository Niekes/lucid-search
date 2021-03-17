**Lucid** is a stand-alone, zero-dependency, fast and lightweight library to highlight text and find matches.
Lucid is **NOT** a fuzzy-search. Lucid cares about **exact** matches.

# Installing

```bash
npm i lucid-search --save
```

# Demo
* [Go to examples](https://lucid.niekes.com/components/detail/lucid-search--default.html)

# Usage

### Default
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

### With options
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

### Flavours

`findMatches(haystack, needle, options)`

* Use for plain strings **without** special characters like _üöäè_
* [Demo](https://lucid.niekes.com/components/detail/lucid-search--default.html)

---

`findMatchesHtml(haystack, needle, options)`

* Use for plain strings and **html** strings **without** special characters like _üöäè_
* [Demo](https://lucid.niekes.com/components/detail/lucid-search--html-string.html)

---

`findMatchesNormalized(haystack, needle, options)`

* Use for plain strings **with** special characters like _üöäè_
* [Demo](https://lucid.niekes.com/components/detail/lucid-search--special-characters-and-umlaute.html)

---

`findMatchesHtmlNormalized(haystack, needle, options)`

* Use for plain strings and **html** strings **with** special characters like _üöäè_
* [Demo](https://lucid.niekes.com/components/detail/lucid-search--special-characters-and-umlaute-inside-html-strings.html)

---

`uncoverMatches(haystack, needles, options)`

* Similar to *findMatches* but expects an array of strings like `["the", "dog"]` as needle
* [Demo](https://lucid.niekes.com/components/detail/lucid-search--custom-needle-split.html)

---

`uncoverMatchesHtml(haystack, needles, options)`

* Similar to *findMatchesHtml* but expects an array of strings like `["the", "dog"]` as needle

---

`uncoverMatchesNormalized(haystack, needles, options)`

* Similar to *findMatchesNormalized* but expects an array of strings like `["the", "dog"]` as needle

---

`uncoverMatchesHtmlNormalized(haystack, needles, options)`

* Similar to *findMatchesHtmlNormalized* but expects an array of strings like `["the", "dog"]` as needle

### Funding
<a href="https://www.buymeacoffee.com/niekes" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="70"></a>
