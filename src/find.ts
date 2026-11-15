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

/** Splits a haystack into parts that alternate text, tag, text, …; only text is searched. */
type Splitter = (haystack: string) => string[];

const defaults: MarkOptions = { el: 'span', cssClass: 'matched' };

const plain: Splitter = (haystack) => [haystack];
// `[^<>]` stops at the next `<`, so a run of `<` without `>` stays linear.
const html: Splitter = (haystack) => haystack.split(/(<[^<>]*>)/);

const regex = (pattern: string): RegExp => new RegExp(pattern, 'gi');
const isText = (_part: string, index: number): boolean => index % 2 === 0;

const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const split = (needle: string): string[] => needle.split(/[.\-_\s]/);

const normalized = (term: string): string => normalize(escape(term));

function find(
    haystack: string,
    patterns: string[],
    options: Partial<MarkOptions>,
    splitter: Splitter
): Found {
    const parts = splitter(haystack);
    const texts = parts.filter(isText);
    const matches = patterns
        .map(regex)
        .flatMap((re) => texts.flatMap((text) => text.match(re) ?? []));
    if (!matches.length) return { matches, mark: haystack };

    const { el, cssClass } = { ...defaults, ...options };
    // Longest first, so a short match never splits a longer one it is part of.
    const alternatives = [...new Set(matches)].sort((a, b) => b.length - a.length);
    const alternation = regex(alternatives.map(escape).join('|'));
    const wrap = (match: string): string => `<${el} class="${cssClass}">${match}</${el}>`;
    const mark = parts
        .map((part, index) => (isText(part, index) ? part.replace(alternation, wrap) : part))
        .join('');
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
        splitter: Splitter
    ): Flavour<T> =>
    (haystack, needle, options = {}) =>
        find(haystack, toTerms(needle).filter(Boolean).map(toPattern), options, splitter);

const asIs = (terms: string[]): string[] => terms;

export const findMatches: Flavour<string> = flavour(split, escape, plain);
export const findMatchesHtml: Flavour<string> = flavour(split, escape, html);
export const findMatchesNormalized: Flavour<string> = flavour(split, normalized, plain);
export const findMatchesHtmlNormalized: Flavour<string> = flavour(split, normalized, html);
export const uncoverMatches: Flavour<string[]> = flavour(asIs, escape, plain);
export const uncoverMatchesHtml: Flavour<string[]> = flavour(asIs, escape, html);
export const uncoverMatchesNormalized: Flavour<string[]> = flavour(asIs, normalized, plain);
export const uncoverMatchesHtmlNormalized: Flavour<string[]> = flavour(asIs, normalized, html);
