<p align="center">
  <a href="https://github.com/sponsors/niekes"><img src="https://img.shields.io/badge/Sponsor_lucid--search-EA4AAA?logo=githubsponsors&logoColor=white&style=for-the-badge" alt="Sponsor lucid-search"></a>
</p>

<p align="center">
  <strong>Find matches in text and highlight them safely. Zero dependencies, under 3 kB.</strong><br>
  Free and open source, kept alive by one maintainer and the people who sponsor the work.
</p>

<p align="center">
  <a href="https://github.com/niekes/lucid-search/actions"><img src="https://github.com/niekes/lucid-search/actions/workflows/main.yml/badge.svg" alt="Build"></a>
  <a href="https://github.com/niekes/lucid-search/actions"><img src="https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/niekes/lucid-search/master/.github/badges/coverage.json" alt="Coverage"></a>
  <a href="https://fallow.tools/docs/explanations/health/"><img src="https://raw.githubusercontent.com/niekes/lucid-search/master/.github/badges/health.svg" alt="fallow health"></a>
  <a href="https://www.npmjs.com/package/lucid-search"><img src="https://img.shields.io/npm/dt/lucid-search" alt="npm downloads"></a>
  <a href="https://www.npmjs.com/package/lucid-search"><img src="https://img.shields.io/npm/dw/lucid-search" alt="npm weekly downloads"></a>
  <a href="https://github.com/niekes/lucid-search/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/lucid-search" alt="License"></a>
  <a href="https://www.npmjs.com/package/lucid-search"><img src="https://img.shields.io/npm/v/lucid-search" alt="npm version"></a>
  <a href="https://bundlephobia.com/result?p=lucid-search"><img src="https://img.shields.io/bundlephobia/minzip/lucid-search" alt="Bundle size"></a>
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue" alt="TypeScript">
  <a href="https://github.com/niekes/lucid-search"><img src="https://img.shields.io/github/stars/niekes/lucid-search" alt="GitHub stars"></a>
  <a href="https://github.com/sponsors/niekes"><img src="https://img.shields.io/github/sponsors/niekes?logo=GitHub+Sponsors&logoColor=%23EA4AAA&style=flat" alt="GitHub Sponsors"></a>
</p>

<p align="center">
  <a href="https://niekes.github.io/lucid-search/">Docs</a> ·
  <a href="https://niekes.github.io/lucid-search/guide/getting-started">Getting started</a> ·
  <a href="https://niekes.github.io/lucid-search/api/">API reference</a> ·
  <a href="https://niekes.github.io/lucid-search/playground">Playground</a> ·
  <a href="https://niekes.github.io/lucid-search/guide/migration">Migrating from v1</a>
</p>

---

<p align="center">
  <a target="_blank" href="https://niekes.github.io/lucid-search/playground"><img src="assets/demo-1.gif" alt="lucid-search highlighting matches as you type"></a>
</p>

Try it in the [playground](https://niekes.github.io/lucid-search/playground).

## Sponsor lucid-search

**lucid-search** is free, and it always will be. There is no company behind it — just one maintainer working in spare time — so the cost of keeping it alive is paid for by the people who depend on it.

If lucid-search saves you time, [become a sponsor](https://github.com/sponsors/niekes).

| Tier        | What you get                                                                                |
| ----------- | ------------------------------------------------------------------------------------------- |
| **$5/mo**   | Your name in the [sponsors list](#sponsors) and my sincere thanks                           |
| **$25/mo**  | The above, plus your logo in the README and on the docs site, and priority issue triage     |
| **$100/mo** | The above, plus direct email access for feature requests and a mention in the release notes |

Where the money goes:

- **Issue triage and bug fixes.** Sponsorship buys a reply within a couple of days instead of whenever I get to it.
- **Types that stay correct.** Keeping the TypeScript types accurate as TypeScript and the platform move on.
- **The documentation site.** Hosting, builds and the playground.
- **Time for new work.** More languages for normalizing, and better ranking.

Prefer a one-off? The [sponsor page](https://github.com/sponsors/niekes) also takes one-time contributions.

**Need a company sponsorship or an invoice?** [Get in touch](mailto:s@niekes.com).

## Sponsors

Thank you to the people who make this possible. Sponsors at $25/mo and above get their logo in this README and on the docs site; everyone gets their name below.

<!-- New sponsors go below this line, one per line. -->

## Using lucid-search

```bash
npm install lucid-search
```

```js
import { findRanges, toSegments } from 'lucid-search';

const haystack = 'Café au lait in Łódź';
toSegments(haystack, findRanges(haystack, 'cafe lodz'));
// [
//   { text: 'Café', match: true },
//   { text: ' au lait in ', match: false },
//   { text: 'Łódź', match: true }
// ]

// Forgive one typo per term (terms under 4 letters still match exactly).
findRanges('Pride and Prejudice', 'prejudcie', { typos: 1 });
// [{ start: 10, end: 19 }]
```

lucid-search returns positions, never HTML, so you render the matches yourself, e.g. as
`<mark>` elements in React, and an untrusted haystack can't inject markup.

```tsx
toSegments(haystack, findRanges(haystack, query, { typos: 1 })).map((segment, i) =>
    segment.match ? <mark key={i}>{segment.text}</mark> : segment.text
);
```

For an excerpt in a result list, `toSnippet(segments, 160)` cuts the segments to a window around
the first match and adds `…` where text was cut.

## Using it from an AI agent

`search` returns plain JSON with positions, plus the terms it could not find, so an agent knows what to rephrase. `suggest(haystack, term)` offers the closest word in the haystack for such a term ("did you mean"). `highlight` turns those matches into HTML and escapes the whole haystack.

```js
import { search, suggest, highlight } from 'lucid-search';

search('The quick brown fox jumps over the lazy dog', 'The dog barks');
/*
{
    matches: [
        { start: 0, end: 3, text: 'The', term: 'The' },
        { start: 31, end: 34, text: 'the', term: 'The' },
        { start: 40, end: 43, text: 'dog', term: 'dog' }
    ],
    missing: ['barks']
}
*/
```

Give the model the text around each match instead of the whole document, by wrapping `search` as a tool (shape shown for the Anthropic Messages API; other frameworks are similar):

```js
const tool = {
    name: 'find_in_text',
    description:
        'Find literal, case-insensitive occurrences of terms in the document. Returns positions, short context, and terms that were not found.',
    input_schema: {
        type: 'object',
        properties: { terms: { type: 'array', items: { type: 'string' } } },
        required: ['terms']
    }
};

function findInText({ terms }) {
    const { matches, missing } = search(documentText, terms, { normalize: true });
    return {
        missing: missing.map((term) => ({ term, didYouMean: suggest(documentText, term)?.text })),
        matches: matches.slice(0, 20).map((m) => ({
            ...m,
            context: documentText.slice(Math.max(0, m.start - 80), m.end + 80)
        }))
    };
}
```

See [`llms.txt`](llms.txt) for a compact API reference for coding assistants.

Everything else lives in the [documentation](https://niekes.github.io/lucid-search/): [getting started](https://niekes.github.io/lucid-search/guide/getting-started), the [API reference](https://niekes.github.io/lucid-search/api/), the [playground](https://niekes.github.io/lucid-search/playground) and [migrating from v1](https://niekes.github.io/lucid-search/guide/migration).

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=niekes/lucid-search&type=date&legend=bottom-right)](https://www.star-history.com/#niekes/lucid-search&type=date&legend=bottom-right)
