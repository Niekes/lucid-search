/** A matched span of the original haystack: `start` inclusive, `end` exclusive, like `slice`. */
export interface Range {
    start: number;
    end: number;
}

export interface FindOptions {
    /** Ignore accents and diacritics, so `cafe` matches `café`. Default `true`. */
    normalize?: boolean;
    /** The most Typos a Term may have, at most one per 4 letters of the Term. Default `0`. */
    typos?: number;
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

/**
 * The folded text, and where each piece of it came from in the original. A piece is either a run of
 * ASCII (`to` is -1: unit `i` of the run came from `from + i`) or the folded units of one character
 * (all from the original span `from` to `to`). `at` is where each piece starts in `text`.
 */
interface Folded {
    text: string;
    at: number[];
    from: number[];
    to: number[];
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
    const cache = folds[normalize ? 1 : 0];
    let text = cache.get(char);
    if (text === undefined) {
        text = foldCharUncached(char, normalize);
        // shortcut: forgets every character after 10,000, upgrade to an LRU if CJK-heavy servers refold often.
        if (cache.size >= 10_000) cache.clear();
        cache.set(char, text);
    }
    return text;
}

/** Widens the last folded character's source to `end`, so a combining mark stays inside its Range. */
function widenLast(folded: Folded, end: number): void {
    const last = folded.at.length - 1;
    if (last < 0) return;
    if (folded.to[last] >= 0) {
        folded.to[last] = end;
        return;
    }
    // The last character ends a run of ASCII: split it off into a piece of its own.
    const unit = folded.text.length - 1;
    folded.at.push(unit);
    folded.from.push(folded.from[last] + unit - folded.at[last]);
    folded.to.push(end);
}

function fold(input: string, normalize: boolean): Folded {
    // Most haystacks are pure ASCII: one piece, no character to fold one by one.
    if (/^[\0-\x7f]*$/.test(input)) {
        return { text: input.toLowerCase(), at: [0], from: [0], to: [-1] };
    }
    const folded: Folded = { text: '', at: [], from: [], to: [] };
    const piece = (from: number, to: number, text: string): void => {
        folded.at.push(folded.text.length);
        folded.from.push(from);
        folded.to.push(to);
        folded.text += text;
    };
    let index = 0;
    // ASCII only needs lowercasing, so only the characters between ASCII runs are folded one by one.
    for (const { 0: char, index: start } of input.matchAll(/[^\0-\x7f]/gu)) {
        if (start > index) piece(index, -1, input.slice(index, start).toLowerCase());
        const end = start + char.length;
        const text = foldChar(char, normalize);
        if (text) piece(start, end, text);
        else widenLast(folded, end);
        index = end;
    }
    if (index < input.length) piece(index, -1, input.slice(index).toLowerCase());
    return folded;
}

/** The piece of the folded text that unit `unit` belongs to. */
function pieceOf(at: number[], unit: number): number {
    let low = 0;
    let high = at.length - 1;
    while (low < high) {
        const middle = (low + high + 1) >> 1;
        if (at[middle] <= unit) low = middle;
        else high = middle - 1;
    }
    return low;
}

/** The Range of the original haystack that folded units `first` to `last` (inclusive) came from. */
function toRange({ at, from, to }: Folded, first: number, last: number): Range {
    const head = pieceOf(at, first);
    const tail = pieceOf(at, last);
    return {
        start: to[head] >= 0 ? from[head] : from[head] + first - at[head],
        end: to[tail] >= 0 ? to[tail] : from[tail] + last - at[tail] + 1
    };
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

interface Bits {
    ascii: Int32Array;
    other: Map<number, number>;
}

// A search box sends the same few Terms against many haystacks, so their tables are reused.
const tables = new Map<string, Bits>();

/** For each character: a bit per position of the Term where it occurs. ASCII gets a flat table. */
function bitsOf(term: string): Bits {
    let bits = tables.get(term);
    if (bits) return bits;
    bits = { ascii: new Int32Array(128), other: new Map() };
    for (let i = 0; i < term.length; i += 1) {
        const code = term.charCodeAt(i);
        if (code < 128) bits.ascii[code] |= 1 << i;
        else bits.other.set(code, (bits.other.get(code) ?? 0) | (1 << i));
    }
    // shortcut: forget all tables past 256 Terms; use an LRU if callers cycle through more.
    if (tables.size >= 256) tables.clear();
    tables.set(term, bits);
    return bits;
}

/**
 * Runs Myers' bit-vector edit distance (with swaps) over `count` units of `text`, from `from` in steps of `step`,
 * and calls `visit` with each position where the best match of `term` ending there has at most
 * `limit` Typos, and with that count.
 * `anchored` makes the match start at `from`; otherwise it may start anywhere.
 */
function scan(
    term: string,
    text: string,
    from: number,
    step: number,
    count: number,
    anchored: boolean,
    limit: number,
    visit: (at: number, typos: number) => void
): void {
    const { ascii, other } = bitsOf(term);
    const last = 1 << (term.length - 1);
    let pv = -1;
    let mv = 0;
    let d0 = 0;
    let previousEq = 0;
    let typos = term.length;
    for (let n = 0, at = from; n < count; n += 1, at += step) {
        const code = text.charCodeAt(at);
        const eq = code < 128 ? ascii[code] : (other.get(code) ?? 0);
        // Hyyrö's extension: two swapped adjacent letters cost one Typo, not two.
        const swapped = ((~d0 & eq) << 1) & previousEq;
        d0 = (((eq & pv) + pv) ^ pv) | eq | mv | swapped;
        let ph = mv | ~(d0 | pv);
        let mh = d0 & pv;
        if (ph & last) typos += 1;
        else if (mh & last) typos -= 1;
        ph = (ph << 1) | (anchored ? 1 : 0);
        mh <<= 1;
        pv = mh | ~(d0 | ph);
        mv = ph & d0;
        previousEq = eq;
        if (typos <= limit) visit(at, typos);
    }
}

// How far a candidate is from the Term's shape: an end on a letter the Term does not end on, then its length.
const shape = (text: string, term: string, { start, end }: Range): number =>
    (Number(text[start] !== term[0]) + Number(text[end] !== term[term.length - 1])) * 64 +
    Math.abs(end - start + 1 - term.length);

/** The start of the best match of `term` ending at `end`: fewest Typos, then the closest shape. */
function startOf(text: string, term: string, end: number, typos: number): number {
    // Reversed by UTF-16 unit, the way `scan` walks the text backwards.
    let reversed = '';
    for (let unit = term.length - 1; unit >= 0; unit -= 1) reversed += term[unit];
    let best = { start: end, typos: Infinity, shape: Infinity };
    scan(
        reversed,
        text,
        end,
        -1,
        Math.min(end + 1, term.length + typos),
        true,
        typos,
        (start, found) => {
            const candidate = { start, typos: found, shape: shape(text, term, { start, end }) };
            if (found < best.typos || (found === best.typos && candidate.shape < best.shape)) {
                best = candidate;
            }
        }
    );
    return best.start;
}

/** Keeps the best match from each run of consecutive end positions within the Typo budget. */
function fuzzyFind(folded: Folded, term: string, typos: number, found: Range[]): void {
    const { text } = folded;
    let run: number[] = [];
    let fewest = Infinity;
    // The last position within budget; a gap after it ends the run.
    let latest = -2;
    const flush = (): void => {
        const spans = run.map((end) => ({ start: startOf(text, term, end, typos), end }));
        const closest = Math.min(...spans.map((span) => shape(text, term, span)));
        for (const span of spans) {
            if (shape(text, term, span) === closest)
                found.push(toRange(folded, span.start, span.end));
        }
    };
    scan(term, text, 0, 1, text.length, false, typos, (at, count) => {
        if (at !== latest + 1 && run.length) {
            flush();
            run = [];
            fewest = Infinity;
        }
        latest = at;
        if (count < fewest) run = [];
        if (count <= fewest) run.push(at);
        fewest = Math.min(fewest, count);
    });
    if (run.length) flush();
}

/**
 * Finds every term of the query in the haystack, case-insensitively and as plain text,
 * allowing up to `typos` Typos per term (at most one per 4 letters; terms over 32 letters match exactly).
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
        const foldedTerm = fold(term, normalize).text;
        if (!foldedTerm) continue;
        // shortcut: one 32-bit integer holds the Term, so longer Terms match exactly; use multi-block Myers if needed.
        const typos =
            foldedTerm.length > 32
                ? 0
                : Math.min(options.typos ?? 0, Math.floor(foldedTerm.length / 4));
        if (typos > 0) {
            fuzzyFind(folded, foldedTerm, typos, ranges);
            continue;
        }
        for (
            let at = folded.text.indexOf(foldedTerm);
            at !== -1;
            at = folded.text.indexOf(foldedTerm, at + 1)
        ) {
            ranges.push(toRange(folded, at, at + foldedTerm.length - 1));
        }
    }
    return merge(ranges);
}
