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

function foldChar(char: string, normalize: boolean): string {
    // 'İ' lowercases to 'i' plus a combining dot, which would stop it matching 'i'.
    const lower = char === 'İ' ? 'i' : char.toLowerCase();
    if (!normalize) return lower;
    // Strip only combining marks (\p{M}): \p{Diacritic} would also delete standalone `^` and `` ` ``.
    return lower
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(undecomposable, (letter) => UNDECOMPOSABLE[letter]);
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
    const folded = fold(haystack, normalize);
    const ranges: Range[] = [];
    for (const term of terms) {
        const needle = fold(term, normalize).text;
        if (!needle) continue;
        for (
            let at = folded.text.indexOf(needle);
            at !== -1;
            at = folded.text.indexOf(needle, at + 1)
        ) {
            const { start } = folded.sources[at];
            const { end } = folded.sources[at + needle.length - 1];
            ranges.push({ start, end });
        }
    }
    return merge(ranges);
}
