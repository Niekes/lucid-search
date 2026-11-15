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
