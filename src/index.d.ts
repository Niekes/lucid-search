/** One place in the Haystack where a Term was found. `haystack.slice(start, end) === text`. */
export interface Match {
    start: number;
    end: number;
    text: string;
    /** The Term (as the caller wrote it) that found this Match. */
    term: string;
}

export interface SearchResult {
    /** Sorted by start, never overlapping. */
    matches: Match[];
    /** Terms that occur nowhere in the Haystack, in the caller's order. */
    missing: string[];
}

/**
 * Find every literal, case-insensitive occurrence of the Needle's Terms.
 * A string Needle is split on whitespace, `.`, `-` and `_`; pass an array to choose the Terms yourself.
 * @throws TypeError when haystack is not a string or needle is not a string / string[].
 */
export function search(
    haystack: string,
    needle: string | string[],
    options?: { normalize?: boolean },
): SearchResult;

/**
 * Wrap Matches in `<el class="cssClass">`, HTML-escaping the whole Haystack.
 * @throws TypeError when el is not a plain tag name or cssClass contains `"`, `<` or `>`.
 */
export function highlight(
    haystack: string,
    matches: Match[],
    options?: { el?: string; cssClass?: string },
): string;

/**
 * Rank Haystacks for the same Needle: longer and earlier distinct Matches score higher.
 * @throws TypeError when haystack is not a string.
 */
export function score(matches: Match[], haystack: string): number;
