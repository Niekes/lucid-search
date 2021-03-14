# Installing

```bash
# NPM
npm i lucid-search --save

# Yarn
yarn add i lucid-search --save
```

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
    el: 'mark', // default is "span"
    cssClass: 'found', // default is "marked"
};

const found = findMatches(haystack, needle);

console.log(found);
/*
{
    mark: "<mark class="found">The</mark> quick brown fox jumps over <mark class="found">the</mark> lazy <mark class="found">dog</mark>",
    matches: (3) ["The", "the", "dog"]
}
*/
```

### Flavours

`findMatches()`: Use for plain strings **without** special characters like _üöäè_

`findMatchesHtml()`: Use for **html** strings **without** special characters like _üöäè_

`findMatchesNormalized()` Use for plain strings **with** special characters like _üöäè_

`findMatchesHtmlNormalized()`: Use for **html** strings **with** special characters like _üöäè_

