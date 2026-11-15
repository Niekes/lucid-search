import { findRanges, toSegments } from '../index';

it('toSegments slices the haystack into Segments that rebuild it exactly', () => {
    const haystack = '<img onerror=x> Café';
    const segments = toSegments(haystack, findRanges(haystack, 'img cafe'));
    expect(segments).toEqual([
        { text: '<', match: false },
        { text: 'img', match: true },
        { text: ' onerror=x> ', match: false },
        { text: 'Café', match: true }
    ]);
    expect(segments.map((segment) => segment.text).join('')).toBe(haystack);
});

it('toSegments returns one non-match Segment without Ranges and nothing for an empty haystack', () => {
    expect(toSegments('plain', [])).toEqual([{ text: 'plain', match: false }]);
    expect(toSegments('', [])).toEqual([]);
});

it('toSegments returns a single match Segment when the whole haystack matches', () => {
    expect(toSegments('Café', findRanges('Café', 'cafe'))).toEqual([{ text: 'Café', match: true }]);
});
