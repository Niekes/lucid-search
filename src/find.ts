import { normalize } from './normalize';

export interface MarkOptions {
    /** The element of every highlight. Default `span`. */
    el: string;
    /** The class of that element. Default `matched`. */
    cssClass: string;
}

export interface Found {
    /** Every match in its original casing, in search-term order. */
    matches: string[];
    /**
     * The haystack with every match highlighted in `<el class="cssClass">`; matches that overlap
     * or touch share one highlight. The haystack is not escaped: only put it into `innerHTML`
     * if you trust it.
     */
    mark: string;
}

type Matcher = (pattern: string) => RegExp;

const defaults: MarkOptions = { el: 'span', cssClass: 'matched' };

const plain: Matcher = (pattern) => new RegExp(pattern, 'gi');
// Skips text inside tags: a match must not be followed by a `>` without a `<` before it.
const html: Matcher = (pattern) => new RegExp(`(${pattern})(?!([^<]+)?>)`, 'gi');

const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const split = (needle: string): string[] => needle.split(/[.\-_\s]/);

const normalized = (term: string): string => normalize(escape(term));

function find(
    haystack: string,
    patterns: string[],
    options: Partial<MarkOptions>,
    matcher: Matcher
): Found {
    const results = patterns.flatMap((pattern) => [...haystack.matchAll(matcher(pattern))]);
    const matches = results.map(([match]) => match);
    if (!matches.length) return { matches, mark: haystack };

    // Matches that overlap or touch merge into one highlight.
    const highlights: [number, number][] = [];
    const ranges = results
        .map(({ 0: match, index }): [number, number] => [index, index + match.length])
        .sort(([a], [b]) => a - b);
    for (const [from, to] of ranges) {
        const last = highlights[highlights.length - 1];
        if (last && from <= last[1]) last[1] = Math.max(last[1], to);
        else highlights.push([from, to]);
    }

    const { el, cssClass } = { ...defaults, ...options };
    let mark = '';
    let copied = 0;
    for (const [from, to] of highlights) {
        mark += `${haystack.slice(copied, from)}<${el} class="${cssClass}">${haystack.slice(from, to)}</${el}>`;
        copied = to;
    }
    return { matches, mark: mark + haystack.slice(copied) };
}

/**
 * One of the eight search functions. `T` is a needle (`string`) or search terms (`string[]`).
 * The returned `mark` is not escaped: only put it into `innerHTML` if you trust the haystack.
 */
export type Flavour<T> = (haystack: string, needle: T, options?: Partial<MarkOptions>) => Found;

const flavour =
    <T>(
        toTerms: (needle: T) => string[],
        toPattern: (term: string) => string,
        matcher: Matcher
    ): Flavour<T> =>
    (haystack, needle, options = {}) =>
        find(haystack, toTerms(needle).filter(Boolean).map(toPattern), options, matcher);

const asIs = (terms: string[]): string[] => terms;

export const findMatches: Flavour<string> = flavour(split, escape, plain);
export const findMatchesHtml: Flavour<string> = flavour(split, escape, html);
export const findMatchesNormalized: Flavour<string> = flavour(split, normalized, plain);
export const findMatchesHtmlNormalized: Flavour<string> = flavour(split, normalized, html);
export const uncoverMatches: Flavour<string[]> = flavour(asIs, escape, plain);
export const uncoverMatchesHtml: Flavour<string[]> = flavour(asIs, escape, html);
export const uncoverMatchesNormalized: Flavour<string[]> = flavour(asIs, normalized, plain);
export const uncoverMatchesHtmlNormalized: Flavour<string[]> = flavour(asIs, normalized, html);
