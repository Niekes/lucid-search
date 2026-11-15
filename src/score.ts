/** Sums the length of every distinct match, weighted up to 2x the closer it sits to the start of the haystack. */
export function score(matches: string[], haystack = ''): number {
    const { length } = haystack;
    return [...new Set(matches)].reduce((sum, match) => {
        const index = haystack.indexOf(match);
        const weight = index !== -1 && length ? (length - index) / length + 1 : 1;
        return sum + match.length * weight;
    }, 0);
}
