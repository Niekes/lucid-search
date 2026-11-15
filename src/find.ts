import { normalize } from './normalize';

export interface MarkOptions {
    /** The element that wraps every match. Default `span`. */
    el: string;
    /** The class of that element. Default `matched`. */
    cssClass: string;
}

export interface Found {
    /** Every match in its original casing, in search-term order. */
    matches: string[];
    /**
     * The haystack with every match wrapped in `<el class="cssClass">`. The haystack is not
     * escaped: only put it into `innerHTML` if you trust it.
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
    const matches = patterns.flatMap((pattern) => haystack.match(matcher(pattern)) ?? []);
    if (!matches.length) return { matches, mark: haystack };

    const { el, cssClass } = { ...defaults, ...options };
    // Longest first, so a short match never splits a longer one it is part of.
    const alternatives = [...new Set(matches)].sort((a, b) => b.length - a.length);
    const mark = haystack.replace(
        matcher(alternatives.map(escape).join('|')),
        (match) => `<${el} class="${cssClass}">${match}</${el}>`
    );
    return { matches, mark };
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
