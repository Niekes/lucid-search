import type { Match } from './search';

/**
 * Sums the length of every distinct match, weighted up to 2x the closer it sits to the start of
 * the haystack. Takes the `matches` of a flavour (strings) or of `search` (Match objects).
 */
export function score(matches: ReadonlyArray<string | Match>, haystack = ''): number {
    const firstIndex = new Map<string, number>();
    for (const match of matches) {
        const [text, index] =
            typeof match === 'string'
                ? [match, haystack.indexOf(match)]
                : [match.text, match.start];
        if (!firstIndex.has(text)) firstIndex.set(text, index);
    }
    const { length } = haystack;
    return [...firstIndex].reduce((sum, [text, index]) => {
        const weight = index !== -1 && length ? (length - index) / length + 1 : 1;
        return sum + text.length * weight;
    }, 0);
}
