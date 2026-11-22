import { findTerm, fold, inWord, toRange } from './find';
import type { Match } from './search';

// Matches at `lastIndex` when a letter, digit or combining mark starts there.
const wordChar = /[\p{L}\p{N}\p{M}]/uy;

/**
 * The Suggestion for a term: the whole word in the haystack the fewest Typos away from it (the
 * earliest on a tie), ignoring case and accents, with at most one Typo per 4 letters of the term.
 * Meant for the missing terms of `search`.
 * @throws TypeError when haystack or term is not a string.
 */
export function suggest(haystack: string, term: string): Match | undefined {
    if (typeof haystack !== 'string') throw new TypeError('haystack must be a string');
    if (typeof term !== 'string') throw new TypeError('term must be a string');
    const folded = fold(haystack, true);
    const foldedTerm = fold(term, true).text;
    if (!foldedTerm) return undefined;
    let best: { first: number; last: number; typos: number } | undefined;
    // shortcut: filters chosen matches, so a mid-word one can hide a worse whole word in the same run (ADR 0005); let only whole words compete if a caller hits it.
    findTerm(folded.text, foldedTerm, Infinity, (first, last, typos) => {
        inWord.lastIndex = first;
        wordChar.lastIndex = last + 1;
        if (inWord.test(folded.text) || wordChar.test(folded.text)) return;
        if (!best || typos < best.typos || (typos === best.typos && first < best.first)) {
            best = { first, last, typos };
        }
    });
    if (!best) return undefined;
    const { start, end } = toRange(folded, best.first, best.last);
    return { start, end, text: haystack.slice(start, end), term };
}
