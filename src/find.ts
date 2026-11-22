/** A matched span of the original haystack: `start` inclusive, `end` exclusive, like `slice`. */
export interface Range {
    start: number;
    end: number;
}

export interface FindOptions {
    /** Ignore accents, diacritics and ligatures, so `cafe` matches `café` and `final` matches `ﬁnal`. Default `true`. */
    normalize?: boolean;
    /** The most Typos a Term may have, at most one per 4 letters of the Term. Default `0`. */
    typos?: number;
    /** Match a Term only at a Word start: at the start of the haystack or after a character that is not a letter, digit or combining mark. Default `false`. */
    wordStart?: boolean;
}

// Letters that NFD does not split into a base letter plus a combining mark, and ligatures: NFKD
// would split those too, but would also turn `²` into `2` and `…` into `...`.
const UNDECOMPOSABLE: Record<string, string> = {
    ł: 'l',
    đ: 'd',
    ø: 'o',
    ı: 'i',
    ß: 'ss',
    æ: 'ae',
    œ: 'oe',
    ĳ: 'ij',
    ﬀ: 'ff',
    ﬁ: 'fi',
    ﬂ: 'fl',
    ﬃ: 'ffi',
    ﬄ: 'ffl',
    ﬅ: 'st',
    ﬆ: 'st'
};
const undecomposable = new RegExp(`[${Object.keys(UNDECOMPOSABLE).join('')}]`, 'g');

/**
 * The folded text, and where each piece of it came from in the original. A piece is either a run of
 * ASCII (`to` is -1: unit `i` of the run came from `from + i`) or the folded units of one character
 * (all from the original span `from` to `to`). `at` is where each piece starts in `text`.
 */
export interface Folded {
    text: string;
    at: number[];
    from: number[];
    to: number[];
}

export function foldCharUncached(char: string, normalize: boolean): string {
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

export function foldChar(char: string, normalize: boolean): string {
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

export function fold(input: string, normalize: boolean): Folded {
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
export function toRange({ at, from, to }: Folded, first: number, last: number): Range {
    const head = pieceOf(at, first);
    const tail = pieceOf(at, last);
    return {
        start: to[head] >= 0 ? from[head] : from[head] + first - at[head],
        end: to[tail] >= 0 ? to[tail] : from[tail] + last - at[tail] + 1
    };
}

/** Throws a TypeError an untyped caller, such as an agent sending JSON, can act on. */
export function checkInput(haystack: unknown, query: unknown): void {
    if (typeof haystack !== 'string') throw new TypeError('haystack must be a string');
    if (
        typeof query !== 'string' &&
        !(Array.isArray(query) && query.every((term) => typeof term === 'string'))
    ) {
        throw new TypeError('query must be a string or an array of strings');
    }
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

// Haystack edges, whitespace and punctuation separate words.
const gap = /[\s\p{P}]/u;
// The same test for ASCII, as a table: ranking candidates asks it four times per candidate.
// Pure, so a bundle that only imports `search` drops it.
const asciiGaps = /* @__PURE__ */ Array.from({ length: 128 }, (_, code) =>
    gap.test(String.fromCharCode(code))
);
const isGap = (char: string | undefined): boolean => {
    if (char === undefined) return true;
    const code = char.charCodeAt(0);
    return code < 128 ? asciiGaps[code] : gap.test(char);
};

/**
 * How far a candidate is from the Term's shape, lowest first: an edge that cuts a word or sits on a
 * gap the Term does not have, then an edge on a letter the Term does not start or end with, then
 * the difference in length.
 */
function shape(text: string, term: string, { start, end }: Range): number {
    const cuts =
        Number(!isGap(text[start - 1]) || isGap(text[start]) !== isGap(term[0])) +
        Number(!isGap(text[end + 1]) || isGap(text[end]) !== isGap(term[term.length - 1]));
    const letters = Number(text[start] !== term[0]) + Number(text[end] !== term[term.length - 1]);
    return cuts * 128 + letters * 32 + Math.abs(end - start + 1 - term.length);
}

/**
 * The start of the best match of `term` ending at `end`: fewest Typos, then the closest shape.
 * `reversed` is the Term reversed by UTF-16 unit, the way `scan` walks the text backwards.
 */
function startOf(text: string, term: string, reversed: string, end: number, typos: number): number {
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
            if (found > best.typos) return;
            const candidate = { start, typos: found, shape: shape(text, term, { start, end }) };
            if (found < best.typos || candidate.shape < best.shape) best = candidate;
        }
    );
    return best.start;
}

interface End {
    end: number;
    typos: number;
}

interface Candidate extends Range {
    shape: number;
}

/**
 * Finds the matches of `term` within the Typo budget. Neighbouring end positions are variants of
 * the same few matches, so each run of them keeps every exact match, then the best of the rest
 * that overlap nothing kept: fewest Typos, then the closest shape. Each one goes to `add`.
 */
function fuzzyFind(
    text: string,
    term: string,
    typos: number,
    add: (first: number, last: number, typos: number) => void
): void {
    let reversed = '';
    for (let unit = term.length - 1; unit >= 0; unit -= 1) reversed += term[unit];
    // Whatever its start, a match ending at `end` covers its last `core` units.
    const core = term.length - typos;
    let run: End[] = [];
    const flush = (): void => {
        // Units of the text a kept match covers, counted from the earliest start the run allows.
        const base = Math.max(0, run[0].end - term.length - typos);
        const taken = new Uint8Array(run[run.length - 1].end - base + 1);
        const free = (start: number, end: number): boolean => {
            for (let unit = start - base; unit <= end - base; unit += 1)
                if (taken[unit]) return false;
            return true;
        };
        for (let count = 0; count <= typos; count += 1) {
            const spans: Candidate[] = [];
            for (const at of run) {
                // One that overlaps a kept match in its core is skipped before its start is searched for.
                if (at.typos !== count || (count && !free(at.end - core + 1, at.end))) continue;
                const start = startOf(text, term, reversed, at.end, typos);
                spans.push({
                    start,
                    end: at.end,
                    shape: shape(text, term, { start, end: at.end })
                });
            }
            spans.sort((a, b) => a.shape - b.shape);
            for (const { start, end } of spans) {
                if (count && !free(start, end)) continue;
                taken.fill(1, start - base, end - base + 1);
                add(start, end, count);
            }
        }
        run = [];
    };
    scan(term, text, 0, 1, text.length, false, typos, (end, count) => {
        if (run.length && end !== run[run.length - 1].end + 1) flush();
        run.push({ end, typos: count });
    });
    if (run.length) flush();
}

const wordChar = /[\p{L}\p{N}\p{M}]/u;

/** Whether a letter, digit or combining mark ends right before `at`. No lookbehind: Safari has it only from 16.4. */
export function inWord(text: string, at: number): boolean {
    // Step back over a whole surrogate pair, so a letter outside the BMP counts.
    const back = at > 1 && (text.charCodeAt(at - 1) & 0xfc00) === 0xdc00 ? 2 : 1;
    return at > 0 && wordChar.test(text.slice(at - back, at));
}

/**
 * Calls `add` with the folded units of each match of `term` (already folded) in `text`, and its Typos.
 * `typos` is the caller's maximum; the Term gets at most one per 4 letters, and none over 32 letters.
 */
export function findTerm(
    text: string,
    term: string,
    typos: number,
    add: (first: number, last: number, typos: number) => void
): void {
    // shortcut: one 32-bit integer holds the Term, so longer Terms match exactly; use multi-block Myers if needed.
    const budget = term.length > 32 ? 0 : Math.min(typos, Math.floor([...term].length / 4));
    if (budget > 0) return fuzzyFind(text, term, budget, add);
    for (let at = text.indexOf(term); at !== -1; at = text.indexOf(term, at + 1)) {
        add(at, at + term.length - 1, 0);
    }
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
    checkInput(haystack, query);
    const normalize = options.normalize ?? true;
    // `filter` also drops the holes of a sparse array, as `search` does.
    const terms = typeof query === 'string' ? query.split(/\s+/) : query.filter(() => true);
    const folded = fold(haystack, normalize);
    const ranges: Range[] = [];
    // Reads the folded text, so `i` inside `ﬁnal` follows an `f` even though its Range starts at the ligature.
    // shortcut: with typos this filters chosen matches, so a mid-word one can hide a worse one at a Word start; let only Word-start candidates compete if a caller hits it.
    const addAtWordStart = (first: number, last: number): void => {
        if (options.wordStart) {
            if (inWord(folded.text, first)) return;
        }
        ranges.push(toRange(folded, first, last));
    };
    for (const term of terms) {
        const foldedTerm = fold(term, normalize).text;
        if (foldedTerm) findTerm(folded.text, foldedTerm, options.typos ?? 0, addAtWordStart);
    }
    return merge(ranges);
}
