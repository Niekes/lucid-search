# API

Every flavour has the same shape and returns a `Found` object:

```ts
interface Found {
    matches: string[]; // every match, in its original casing
    mark: string; // the haystack with every match wrapped in <el class="cssClass">
}

interface MarkOptions {
    el: string; // default 'span'
    cssClass: string; // default 'matched'
}
```

## Flavours

Each flavour combines three choices: whether it takes a needle or search terms, whether the
haystack is plain text or HTML, and whether search terms match accented letters.

| Flavour                        | Takes        | Haystack   | Matches `ä` for `a` |
| ------------------------------ | ------------ | ---------- | ------------------- |
| `findMatches`                  | needle       | plain text | no                  |
| `findMatchesHtml`              | needle       | HTML       | no                  |
| `findMatchesNormalized`        | needle       | plain text | yes                 |
| `findMatchesHtmlNormalized`    | needle       | HTML       | yes                 |
| `uncoverMatches`               | search terms | plain text | no                  |
| `uncoverMatchesHtml`           | search terms | HTML       | no                  |
| `uncoverMatchesNormalized`     | search terms | plain text | yes                 |
| `uncoverMatchesHtmlNormalized` | search terms | HTML       | yes                 |

### `findMatches(haystack, needle, options?)`

Splits the needle on whitespace, `.`, `-` and `_` and searches for each search term.

```js
findMatches('The lazy dog', 'the dog').matches; // ['The', 'dog']
```

### `findMatchesHtml(haystack, needle, options?)`

Like `findMatches`, but never matches inside tags or attributes.

```js
findMatchesHtml('<div>dog</div>', 'div dog').mark;
// '<div><span class="matched">dog</span></div>'
```

### `findMatchesNormalized(haystack, needle, options?)`

Like `findMatches`, but `the` also matches `Thé` and `dog` also matches `dög`.

```js
findMatchesNormalized('Thé dög', 'the dog').matches; // ['Thé', 'dög']
```

### `findMatchesHtmlNormalized(haystack, needle, options?)`

Combines `findMatchesHtml` and `findMatchesNormalized`.

```js
findMatchesHtmlNormalized('<b class="the">Thé</b>', 'the').mark;
// '<b class="the"><span class="matched">Thé</span></b>'
```

### `uncoverMatches(haystack, terms, options?)`

Takes an array of search terms and does not split them, so a term can contain spaces.

```js
uncoverMatches('The quick brown fox', ['brown fox']).mark;
// 'The quick <span class="matched">brown fox</span>'
```

### `uncoverMatchesHtml(haystack, terms, options?)`

Like `uncoverMatches`, but never matches inside tags or attributes.

```js
uncoverMatchesHtml('<a title="brown fox">brown fox</a>', ['brown fox']).mark;
// '<a title="brown fox"><span class="matched">brown fox</span></a>'
```

### `uncoverMatchesNormalized(haystack, terms, options?)`

Like `uncoverMatches`, but accent-insensitive.

```js
uncoverMatchesNormalized('Thé dög', ['the dog']).matches; // ['Thé dög']
```

### `uncoverMatchesHtmlNormalized(haystack, terms, options?)`

Combines `uncoverMatchesHtml` and `uncoverMatchesNormalized`.

```js
uncoverMatchesHtmlNormalized('<i>Thé dög</i>', ['the dog']).mark;
// '<i><span class="matched">Thé dög</span></i>'
```

## `score(matches, haystack?)`

Ranks how well a haystack matched. Every distinct match adds its length, weighted up to 2× the
closer it sits to the start of the haystack. Without a haystack, every match counts 1×.

```js
const { matches } = findMatches(haystack, needle);
score(matches, haystack);
```

## `normalize(term)`

Turns every letter that has accented variants into a regex character class. The Normalized
flavours use it.

```js
normalize('dog'); // 'd[oœöóõôòøō]g'
```
