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
    const terms = toTerms(needle).filter(
        (t, i, all) => all.findIndex((u) => u.toLowerCase() === t.toLowerCase()) === i
    );
    if (!terms.length) return { matches: [], missing: [] };

    const toPattern = (t: string): string =>
        normalize ? foldAccents(escapeRegExp(t)) : escapeRegExp(t);
    // Longest term first, so it wins when two terms match at the same position.
    const byLength = [...terms].sort((a, b) => b.length - a.length);
    const alternatives = new RegExp(byLength.map((t) => `(${toPattern(t)})`).join('|'), 'gi');
    const matches = [...haystack.matchAll(alternatives)].map((m) => ({
        start: m.index,
        end: m.index + m[0].length,
        text: m[0],
        term: byLength[m.slice(1).findIndex((g) => g !== undefined)]
    }));
    const missing = terms.filter((t) => !new RegExp(toPattern(t), 'i').test(haystack));

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
    let html = '';
    let cursor = 0;
    for (const { start, end } of matches) {
        html += `${escapeHtml(haystack.slice(cursor, start))}<${el} class="${cssClass}">${escapeHtml(haystack.slice(start, end))}</${el}>`;
        cursor = end;
    }
    return html + escapeHtml(haystack.slice(cursor));
}
