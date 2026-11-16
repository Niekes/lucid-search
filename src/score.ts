import type { Range } from './find';

/**
 * Sums the length of every distinct matched text, weighted up to 2x the closer it starts to the
 * beginning of the haystack. Repeats of the same text (ignoring case) count once, at their first Range.
 */
export function score(haystack: string, ranges: Range[]): number {
    const seen = new Set<string>();
    let total = 0;
    for (const { start, end } of ranges) {
        const text = haystack.slice(start, end).toLowerCase();
        if (seen.has(text)) continue;
        seen.add(text);
        total += (end - start) * ((haystack.length - start) / haystack.length + 1);
    }
    return total;
}
