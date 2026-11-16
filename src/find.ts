/** A matched span of the original haystack: `start` inclusive, `end` exclusive, like `slice`. */
export interface Range {
    start: number;
    end: number;
}

export interface FindOptions {
    /** Ignore accents and diacritics, so `cafe` matches `café`. Default `true`. */
    normalize?: boolean;
}

// Letters that NFD does not split into a base letter plus a combining mark.
const UNDECOMPOSABLE: Record<string, string> = {
    ł: 'l',
    đ: 'd',
    ø: 'o',
    ı: 'i',
    ß: 'ss',
    æ: 'ae',
    œ: 'oe'
};
const undecomposable = new RegExp(`[${Object.keys(UNDECOMPOSABLE).join('')}]`, 'g');

interface Folded {
    text: string;
    /** For each UTF-16 unit of `text`: the span of the character it came from in the original. */
    sources: Range[];
}

function foldCharUncached(char: string, normalize: boolean): string {
    // 'İ' lowercases to 'i' plus a combining dot, which would stop it matching 'i'.
    const lower = char === 'İ' ? 'i' : char.toLowerCase();
    if (!normalize) return lower;
    // Strip only combining marks (\p{M}): \p{Diacritic} would also delete standalone `^` and `` ` ``.
    return lower
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(undecomposable, (letter) => UNDECOMPOSABLE[letter]);
}

// Haystacks repeat a small set of characters, so each one is folded once per mode.
const folds = [new Map<string, string>(), new Map<string, string>()];

function foldChar(char: string, normalize: boolean): string {
    const cache = folds[+normalize];
    let text = cache.get(char);
    if (text === undefined) {
        text = foldCharUncached(char, normalize);
        // shortcut: forgets every character after 10,000, upgrade to an LRU if CJK-heavy servers refold often.
        if (cache.size >= 10_000) cache.clear();
        cache.set(char, text);
    }
    return text;
}

function fold(input: string, normalize: boolean): Folded {
    const folded: Folded = { text: '', sources: [] };
    let index = 0;
    for (const char of input) {
        const end = index + char.length;
        const text = foldChar(char, normalize);
        const previous = folded.sources[folded.sources.length - 1];
        // A combining mark that folds away stays inside the Range of the letter before it.
        if (!text && previous) previous.end = end;
        for (let unit = 0; unit < text.length; unit += 1) {
            folded.sources.push({ start: index, end });
        }
        folded.text += text;
        index = end;
    }
    return folded;
}

function merge(ranges: Range[]): Range[] {
    ranges.sort((a, b) => a.start - b.start);
    const merged: Range[] = [];
    for (const range of ranges) {
        const last = merged[merged.length - 1];
        if (last && range.start <= last.end) last.end = Math.max(last.end, range.end);
        else merged.push(range);
    }
    return merged;
}

/**
 * Finds every term of the query in the haystack, case-insensitively and as plain text.
 * A string query is split on whitespace; pass an array to split it yourself.
 * Returns Ranges into the original haystack, sorted, with overlapping or touching ones merged.
 */
export function findRanges(
    haystack: string,
    query: string | string[],
    options: FindOptions = {}
): Range[] {
    const normalize = options.normalize ?? true;
    const terms = typeof query === 'string' ? query.split(/\s+/) : query;
    // ASCII folds to its lowercase, one unit per unit, so positions need no mapping.
    const ascii = /^[\x00-\x7f]*$/.test(haystack);
    const folded = ascii ? undefined : fold(haystack, normalize);
    const text = folded ? folded.text : haystack.toLowerCase();
    const ranges: Range[] = [];
    for (const term of terms) {
        const foldedTerm = fold(term, normalize).text;
        if (!foldedTerm) continue;
        for (let at = text.indexOf(foldedTerm); at !== -1; at = text.indexOf(foldedTerm, at + 1)) {
            const last = at + foldedTerm.length - 1;
            ranges.push(
                folded
                    ? { start: folded.sources[at].start, end: folded.sources[last].end }
                    : { start: at, end: last + 1 }
            );
        }
    }
    return merge(ranges);
}
