# Highlighting Postgres results

A common setup: Postgres finds the rows with `pg_trgm` and `unaccent`, and lucid-search
highlights the query in each result. The two match in different ways, so they cannot agree
on every row. This page shows how to get them as close as possible, and what to do where they
still differ.

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- unaccent() is not IMMUTABLE, so an index cannot use it: wrap it in a function that is.
CREATE FUNCTION f_unaccent(text) RETURNS text
    LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
    AS $$ SELECT public.unaccent('public.unaccent', $1) $$;

CREATE INDEX events_name_trgm ON events USING gin (f_unaccent(name) gin_trgm_ops);

SET pg_trgm.word_similarity_threshold = 0.3;

SELECT name
FROM events
WHERE f_unaccent($1) <% f_unaccent(name)
ORDER BY f_unaccent($1) <<-> f_unaccent(name);
```

Only the `<%` operator can use the trigram index. Calling `word_similarity()` in `WHERE`
reads every row. `<%` keeps a row when its word similarity is above
`pg_trgm.word_similarity_threshold`, which defaults to `0.6`. Set it on the connection, or for
the whole database with `ALTER DATABASE … SET`.

## Typos are not trigrams

`pg_trgm` compares the sets of three-letter pieces two strings share. lucid-search counts
typos: inserted, deleted, replaced or swapped letters. Neither one can be converted into the other.

Use `typos: 2`. Because a term gets at most one typo per 4 letters, this allows one typo in a
term of 4 to 7 letters and two typos in a longer one, which comes closest to a similarity of `0.3`.

```js
findRanges('Doñana', 'donana', { typos: 2 }); // [{ start: 0, end: 6 }]
findRanges('Doñana', 'manana', { typos: 2 }); // []
```

Postgres finds `Doñana` for `manana`, but that is two typos in a 6-letter term, so
lucid-search marks nothing. A result without a highlight is expected: show the text as it is.
Don't raise `typos` to make every row light up, because short terms with many typos match
almost anything.

## Short terms

Servers often match 1 or 2 letter terms only at the start of a word, or hardly weigh them at
all. If every occurrence is highlighted, `li` marks `Fe[li]z`, and in `jazz em lisboa`,
`em` marks `[Em]presa` and `t[em]as`. Two rules bring the highlight in line:

- If the query has longer terms, drop the 1 and 2 letter ones. They barely decided the match.
- If the query has only short terms, match them at word starts only.

Pass the query as an array, so you decide which terms are searched:

```js
import { findRanges } from 'lucid-search';

// Short terms can't have typos (one per 4 letters), so only the long ones get `typos`.
function postgresRanges(haystack, query) {
    const terms = query.split(/\s+/);
    const long = terms.filter((term) => term.length > 2);
    return long.length
        ? findRanges(haystack, long, { typos: 2 })
        : findRanges(haystack, terms, { wordStart: true });
}

postgresRanges('Empresa de temas, jazz em Lisboa', 'jazz em lisboa'); // marks jazz, Lisboa
postgresRanges('Feliz Lisboa', 'li'); // marks Li
```

If your server matches every term by prefix, for example with a `tsquery` like `term:*`,
pass `wordStart: true` for all of them instead.

## Fold accents the same way on both sides

Use `unaccent` on the server and keep `normalize` on (the default) in lucid-search. Both
ignore accents, `ß`, `æ`, `œ`, `ø`, `ł` and the `ﬁ`/`ﬂ` ligatures, so `cafe` finds and
highlights `Café`.

They are not identical. Tested with Postgres 17:

| Haystack               | `unaccent`            | lucid-search                                |
| ---------------------- | --------------------- | ------------------------------------------- |
| `йога`                 | keeps `й`             | folds `й` to `и`                            |
| `שָׁלוֹם`, `مُحَمَّد`, `हिंदी` | keeps the marks       | removes every combining mark, in any script |
| `Þórsmörk`, `Ħamrun`   | `thorsmork`, `hamrun` | keeps `þ`, `ð`, `ħ`, `ŧ`                    |

Where lucid-search folds more, a row can show more highlights than the server matched on,
which is harmless. Where `unaccent` folds more, `thorsmork` finds `Þórsmörk` on the server, and
lucid-search marks it only because `typos: 2` forgives the `þ`. Check the scripts your data uses
with `SELECT unaccent('…')`.

## Render Segments, not HTML

Render the Ranges as Segments, as in [Render in React](./getting-started#render-in-react), with
`postgresRanges(text, query)` in place of `findRanges(text, query)`. Never build an HTML string
from a row: names and descriptions in your database are user input.
