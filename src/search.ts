import { checkInput, foldChar, foldCharUncached } from './find';

/** One place in the haystack where a term was found. `haystack.slice(start, end) === text`. */
export interface Match {
    start: number;
    end: number;
    text: string;
    /** The term (as the caller wrote it) that found this match. */
    term: string;
}

export interface SearchResult {
    /** Sorted by start, never overlapping. */
    matches: Match[];
    /** Terms that occur nowhere in the haystack, in the caller's order. */
    missing: string[];
}

export interface SearchOptions {
    /** Let plain letters match their accented variants and ligatures. Default `false`. */
    normalize: boolean;
}

export interface HighlightOptions {
    /** The element that wraps every match. Default `span`. */
    el: string;
    /** The class of that element. Default `matched`. */
    cssClass: string;
}

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Every character that folds to something else, keyed by what it folds to: 'e' -> 'éèÉ…', 'ss' -> 'ßẞ'.
// Built once, in a few milliseconds, from the same folding as `findRanges`. Hangul syllables are
// left out: they fold to two or three letters and match themselves instead (see `foldedPattern`).
let variants: Map<string, string> | undefined;

function variantsOf(folded: string): string {
    if (!variants) {
        variants = new Map();
        for (let code = 0xc0; code <= 0xffff; code += 1) {
            if (code === 0xac00) code = 0xe000; // skips Hangul syllables and surrogates
            const char = String.fromCharCode(code);
            const to = foldCharUncached(char, true);
            if (to !== char.toLowerCase()) variants.set(to, (variants.get(to) ?? '') + char);
        }
    }
    return variants.get(folded) ?? '';
}

const escapeClass = (chars: string): string => chars.replace(/[\\\]^-]/g, '\\$&');

// One folded character, or any character that folds to it, plus combining marks that fold away.
const unit = (char: string): string => {
    const others = variantsOf(char);
    return `${others ? `[${escapeClass(char + others)}]` : escapeRegExp(char)}\\p{M}*`;
};

// Folded characters, with `ss`, `ae` and `ffi` also matching `ß`, `æ` and `ﬃ`. Letters a longer
// fold covers are tried again with shorter ones, so `ffi` also matches `ﬀi`.
// shortcut: folds are read left to right, so `sss` finds `ßs` but not `sß`; try every split if a real word needs it.
// 3 is the longest fold in `UNDECOMPOSABLE` (src/find.ts): `ffi` and `ffl`.
function runPattern(folded: string, longest = 3): string {
    const chars = Array.from(folded);
    let pattern = '';
    for (let i = 0; i < chars.length; i += 1) {
        let size = Math.min(longest, chars.length - i);
        while (size > 1 && !variantsOf(chars.slice(i, i + size).join(''))) size -= 1;
        if (size > 1) {
            const letters = chars.slice(i, i + size).join('');
            pattern += `(?:${runPattern(letters, size - 1)}|[${escapeClass(variantsOf(letters))}]\\p{M}*)`;
            i += size - 1;
        } else {
            pattern += unit(chars[i]);
        }
    }
    return pattern;
}

/** A pattern that matches the term the way `findRanges` folds text: ignoring case, accents and ligatures. */
function foldedPattern(term: string): string {
    let pattern = '';
    let run = '';
    // Composed first, so a term typed as separate parts (`한` as three letters) is one character.
    for (const char of term.normalize('NFC')) {
        const folded = foldChar(char, true);
        // A character the table leaves out also matches itself as a whole: `한` finds `한` as well
        // as its parts.
        if (folded && folded !== char.toLowerCase() && !variantsOf(folded).includes(char)) {
            pattern += `${runPattern(run)}(?:${escapeRegExp(char)}\\p{M}*|${runPattern(folded)})`;
            run = '';
        } else {
            run += folded;
        }
    }
    // A term of only combining marks folds to nothing and matches nowhere.
    return pattern + runPattern(run) || '(?!)';
}

function toTerms(query: string | string[]): string[] {
    return typeof query === 'string'
        ? query.split(/[.\-_\s]+/).filter(Boolean)
        : query.filter((t) => t.trim());
}

interface Compiled {
    /** The terms, deduplicated ignoring case, in the caller's order. */
    terms: string[];
    /** The same terms, longest first, so the longest wins when two match at one position. */
    byLength: string[];
    /** One capture group per term in `byLength`, to tell which term found a match. */
    alternatives: RegExp;
    /** One regex per term in `terms`, to check the ones that found no match. */
    perTerm: RegExp[];
}

function compile(query: string[], normalize: boolean): Compiled {
    const terms = query.filter(
        (t, i, all) => all.findIndex((u) => u.toLowerCase() === t.toLowerCase()) === i
    );
    const toPattern = normalize ? foldedPattern : escapeRegExp;
    // `u` for `\p{M}`; it also lets ſ match s and ς match σ, which `findRanges` does not.
    // Without normalize the flags stay as they were, so plain matching does not change.
    const flags = normalize ? 'iu' : 'i';
    const byLength = [...terms].sort((a, b) => b.length - a.length);
    return {
        terms,
        byLength,
        alternatives: new RegExp(byLength.map((t) => `(${toPattern(t)})`).join('|'), `g${flags}`),
        perTerm: terms.map((t) => new RegExp(toPattern(t), flags))
    };
}

// `matchAll` copies the regex and `test` has no `g` flag, so reusing them is safe.
const cache = new Map<string, Compiled>();

/** The compiled query, from the cache when the same query was searched recently. */
function compiledQuery(query: string | string[], normalize: boolean): Compiled {
    // A string query is the key as it is; an array query is keyed by its terms, each quoted so
    // none can collide.
    const terms = typeof query === 'string' ? undefined : toTerms(query);
    const key = `${normalize ? 1 : 0}${terms ? `a${terms.map((t) => JSON.stringify(t)).join(',')}` : `s${query}`}`;
    let entry = cache.get(key);
    if (!entry) {
        entry = compile(terms ?? toTerms(query), normalize);
        // Long queries are rarely repeated and would keep large keys and regexes alive.
        if (key.length < 1000) {
            // shortcut: forgets every query after 100, upgrade to an LRU if a page cycles through more.
            if (cache.size >= 100) cache.clear();
            cache.set(key, entry);
        }
    }
    return entry;
}

/**
 * Find every literal, case-insensitive occurrence of the query's terms.
 * A string query is split on whitespace, `.`, `-` and `_`; pass an array to choose the terms.
 * With `normalize`, accents and ligatures are ignored the same way `findRanges` ignores them.
 * @throws TypeError when haystack is not a string or query is not a string / string[].
 */
export function search(
    haystack: string,
    query: string | string[],
    { normalize = false }: Partial<SearchOptions> = {}
): SearchResult {
    checkInput(haystack, query);
    const { terms, byLength, alternatives, perTerm } = compiledQuery(query, normalize);
    if (!terms.length) return { matches: [], missing: [] };

    const matches: Match[] = [];
    const found = new Set<string>();
    for (const m of haystack.matchAll(alternatives)) {
        let group = 1;
        while (m[group] === undefined) group += 1;
        const term = byLength[group - 1];
        found.add(term);
        matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], term });
    }
    // Without any match no term occurs. Otherwise a term without a match of its own can still
    // occur inside a longer term's match.
    const missing = matches.length
        ? terms.filter((t, i) => !found.has(t) && !perTerm[i].test(haystack))
        : [...terms];

    return { matches, missing };
}

const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};
const escapeHtml = (text: string): string => text.replace(/[&<>"']/g, (c) => HTML_ENTITIES[c]);

/**
 * Wrap matches in `<el class="cssClass">`, HTML-escaping the whole haystack.
 * `matches` must be sorted and non-overlapping, as `search` returns them.
 * @throws TypeError when el is not a plain tag name or cssClass contains `"`, `<` or `>`.
 */
export function highlight(
    haystack: string,
    matches: Match[],
    { el = 'span', cssClass = 'matched' }: Partial<HighlightOptions> = {}
): string {
    if (
        typeof el !== 'string' ||
        !/^[a-z][a-z0-9-]*$/i.test(el) ||
        typeof cssClass !== 'string' ||
        /["<>]/.test(cssClass)
    ) {
        throw new TypeError('el must be a tag name and cssClass must not contain " < or >');
    }
    // Checked once for the whole haystack, so text without special characters skips escaping.
    const escape = /[&<>"']/.test(haystack) ? escapeHtml : (text: string): string => text;
    let html = '';
    let cursor = 0;
    for (const { start, end } of matches) {
        html += `${escape(haystack.slice(cursor, start))}<${el} class="${cssClass}">${escape(haystack.slice(start, end))}</${el}>`;
        cursor = end;
    }
    return html + escape(haystack.slice(cursor));
}
