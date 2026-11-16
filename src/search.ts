import { normalize as foldAccents } from './normalize';

/** One place in the haystack where a search term was found. `haystack.slice(start, end) === text`. */
export interface Match {
    start: number;
    end: number;
    text: string;
    /** The search term (as the caller wrote it) that found this match. */
    term: string;
}

export interface SearchResult {
    /** Sorted by start, never overlapping. */
    matches: Match[];
    /** Search terms that occur nowhere in the haystack, in the caller's order. */
    missing: string[];
}

export interface SearchOptions {
    /** Let plain letters match their accented variants. Default `false`. */
    normalize: boolean;
}

export interface HighlightOptions {
    /** The element that wraps every match. Default `span`. */
    el: string;
    /** The class of that element. Default `matched`. */
    cssClass: string;
}

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function toTerms(needle: unknown): string[] {
    if (typeof needle === 'string') return needle.split(/[.\-_\s]+/).filter(Boolean);
    if (Array.isArray(needle) && needle.every((t) => typeof t === 'string')) {
        return needle.filter((t: string) => t.trim());
    }
    throw new TypeError('needle must be a string or an array of strings');
}

interface Compiled {
    /** The search terms, deduplicated ignoring case, in the caller's order. */
    terms: string[];
    /** The same terms, longest first, so the longest wins when two match at one position. */
    byLength: string[];
    /** One capture group per term in `byLength`, to tell which term found a match. */
    alternatives: RegExp;
    /** One regex per term in `terms`, to check the ones that found no match. */
    perTerm: RegExp[];
}

function compile(needle: string | string[], normalize: boolean): Compiled {
    const terms = toTerms(needle).filter(
        (t, i, all) => all.findIndex((u) => u.toLowerCase() === t.toLowerCase()) === i
    );
    const toPattern = (t: string): string =>
        normalize ? foldAccents(escapeRegExp(t)) : escapeRegExp(t);
    const byLength = [...terms].sort((a, b) => b.length - a.length);
    return {
        terms,
        byLength,
        alternatives: new RegExp(byLength.map((t) => `(${toPattern(t)})`).join('|'), 'gi'),
        perTerm: terms.map((t) => new RegExp(toPattern(t), 'i'))
    };
}

// `matchAll` copies the regex and `test` has no `g` flag, so reusing them is safe.
const cache = new Map<string, Compiled>();

/**
 * Find every literal, case-insensitive occurrence of the needle's search terms.
 * A string needle is split on whitespace, `.`, `-` and `_`; pass an array to choose the terms.
 * @throws TypeError when haystack is not a string or needle is not a string / string[].
 */
export function search(
    haystack: string,
    needle: string | string[],
    { normalize = false }: Partial<SearchOptions> = {}
): SearchResult {
    if (typeof haystack !== 'string') throw new TypeError('haystack must be a string');
    // Invalid needles throw in compile, so only valid ones are ever cached.
    const key = `${+normalize}${typeof needle === 'string' ? `s${needle}` : `a${JSON.stringify(needle)}`}`;
    let compiled = cache.get(key);
    if (!compiled) {
        // shortcut: forgets every needle after 100, upgrade to an LRU if a page cycles through more.
        if (cache.size >= 100) cache.clear();
        compiled = compile(needle, normalize);
        cache.set(key, compiled);
    }
    const { terms, byLength, alternatives, perTerm } = compiled;
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
