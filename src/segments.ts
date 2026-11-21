import type { Range } from './find';

/** A consecutive slice of the haystack, flagged as a match or not. */
export interface Segment {
    text: string;
    match: boolean;
}

/**
 * Slices the haystack into Segments that, joined, rebuild it exactly.
 * Expects Ranges as `findRanges` returns them: sorted and non-overlapping.
 */
export function toSegments(haystack: string, ranges: Range[]): Segment[] {
    const segments: Segment[] = [];
    let position = 0;
    for (const { start, end } of ranges) {
        if (start > position)
            segments.push({ text: haystack.slice(position, start), match: false });
        segments.push({ text: haystack.slice(start, end), match: true });
        position = end;
    }
    if (position < haystack.length) segments.push({ text: haystack.slice(position), match: false });
    return segments;
}

const isSpace = (char: string | undefined): boolean => char !== undefined && /\s/.test(char);
const isLowSurrogate = (haystack: string, at: number): boolean =>
    (haystack.charCodeAt(at) & 0xfc00) === 0xdc00;

function firstMatch(segments: Segment[]): Range | undefined {
    let at = 0;
    for (const { text, match } of segments) {
        if (match) return { start: at, end: at + text.length };
        at += text.length;
    }
    return undefined;
}

// Moves the window start forward to a word start within `slack`, never past `limit` (the first match).
function toWordStart(haystack: string, start: number, limit: number, slack: number): number {
    if (start > 0 && !isSpace(haystack[start - 1])) {
        const space = haystack.slice(start, Math.min(start + slack, limit)).search(/\s/);
        if (space >= 0) start += space + 1;
    }
    while (start < limit && isSpace(haystack[start])) start++;
    return start > 0 && isLowSurrogate(haystack, start) ? start + 1 : start;
}

// Moves the window end back to a word end within `slack`, never before `limit` (the first match's end).
function toWordEnd(haystack: string, end: number, limit: number, slack: number): number {
    if (end < haystack.length && !isSpace(haystack[end])) {
        const from = Math.max(end - slack, limit);
        const space = haystack.slice(from, end).search(/\s\S*$/);
        if (space >= 0) end = from + space;
    }
    while (end > limit && isSpace(haystack[end - 1])) end--;
    return end < haystack.length && isLowSurrogate(haystack, end) ? end - 1 : end;
}

/**
 * Cuts Segments to a Snippet: a window of `size` UTF-16 code units around the first match,
 * starting about a third of `size` before it, with an ellipsis Segment where text was cut.
 * Returns `segments` itself when the haystack fits.
 * shortcut: with size 1 an astral match (an emoji) has no room and is dropped; real excerpts use ~160.
 * @throws TypeError when size is not a positive integer or ellipsis is not a string.
 */
export function toSnippet(
    segments: Segment[],
    size: number,
    { ellipsis = '…' }: { ellipsis?: string } = {}
): Segment[] {
    if (!Number.isInteger(size) || size < 1 || typeof ellipsis !== 'string') {
        throw new TypeError('size must be a positive integer and ellipsis a string');
    }
    const haystack = segments.map((segment) => segment.text).join('');
    if (haystack.length <= size) return segments;

    const found = firstMatch(segments);
    // Without a match, the window starts where the text starts, after any leading whitespace.
    const text = Math.max(0, haystack.search(/\S/));
    const match = found ?? { start: text, end: text };
    // A third before the match, kept inside the haystack; the match stays whole unless longer than size.
    const before = found ? Math.floor(size / 3) : 0;
    let start = Math.max(0, Math.min(match.start - before, haystack.length - size));
    start = Math.max(start, Math.min(match.start, match.end - size));
    const slack = Math.floor(size * 0.15);
    const end = toWordEnd(haystack, start + size, match.end, slack);
    start = toWordStart(haystack, start, match.start, slack);

    const snippet: Segment[] = [];
    if (ellipsis && /\S/.test(haystack.slice(0, start)))
        snippet.push({ text: ellipsis, match: false });
    let at = 0;
    for (const { text, match } of segments) {
        const slice = text.slice(Math.max(0, start - at), Math.max(0, end - at));
        if (slice) snippet.push({ text: slice, match });
        at += text.length;
    }
    if (ellipsis && /\S/.test(haystack.slice(end))) snippet.push({ text: ellipsis, match: false });
    return snippet;
}
