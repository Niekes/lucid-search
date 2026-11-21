import { findRanges, toSegments, toSnippet } from '../index';

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

const text = (segments: { text: string }[]): string => segments.map((s) => s.text).join('');

it('toSnippet returns the same Segments when the haystack fits', () => {
    const segments = toSegments('short Café', findRanges('short Café', 'cafe'));
    expect(toSnippet(segments, 10)).toBe(segments);
});

it('toSnippet starts a third of size before the first match, at a word start', () => {
    const haystack =
        'one two three four five six seven eight nine ten Café eleven twelve thirteen fourteen';
    const snippet = toSnippet(toSegments(haystack, findRanges(haystack, 'cafe')), 30);
    expect(snippet).toEqual([
        { text: '…', match: false },
        { text: 'nine ten ', match: false },
        { text: 'Café', match: true },
        { text: ' eleven twelve', match: false },
        { text: '…', match: false }
    ]);
});

it('toSnippet keeps the start without a match or with a match at the start', () => {
    const haystack = 'alpha beta gamma delta epsilon zeta eta theta';
    expect(text(toSnippet(toSegments(haystack, []), 18))).toBe('alpha beta gamma…');
    expect(text(toSnippet(toSegments(haystack, findRanges(haystack, 'alpha')), 18))).toBe(
        'alpha beta gamma…'
    );
});

it('toSnippet does not run past the end', () => {
    const haystack = 'alpha beta gamma delta epsilon zeta eta theta';
    expect(text(toSnippet(toSegments(haystack, findRanges(haystack, 'theta')), 23))).toBe(
        '…epsilon zeta eta theta'
    );
});

it('toSnippet cuts hard without whitespace near the edge and never splits a surrogate pair', () => {
    const haystack = '😀'.repeat(20) + 'match' + '😀'.repeat(20);
    const snippet = toSnippet(toSegments(haystack, findRanges(haystack, 'match')), 16, {
        ellipsis: ''
    });
    expect(snippet).toEqual([
        { text: '😀😀', match: false },
        { text: 'match', match: true },
        { text: '😀😀😀', match: false }
    ]);
    // Size 15 ends the window inside a pair after the match, so it steps back.
    expect(
        text(toSnippet(toSegments(haystack, findRanges(haystack, 'match')), 15, { ellipsis: '' }))
    ).toBe('😀😀match😀😀');
});

it('toSnippet keeps a long first match whole, and cuts only a match longer than size', () => {
    const long = 'xxxxxxxxxxxxxxxxxxxxxxxx';
    const haystack = `aaa bbb ccc ddd ${long} eee`;
    expect(text(toSnippet(toSegments(haystack, findRanges(haystack, 'xxxxxxxxxxxxxxx')), 26))).toBe(
        `…${long}…`
    );
    expect(toSnippet(toSegments(haystack, findRanges(haystack, long)), 10)).toEqual([
        { text: '…', match: false },
        { text: 'xxxxxxxxxx', match: true },
        { text: '…', match: false }
    ]);
});

it('toSnippet drops whitespace next to the ellipsis', () => {
    const haystack = 'aaaa bbbb cccc  dddd  Café  eeee  ffff gggg hhhh';
    const segments = toSegments(haystack, findRanges(haystack, 'cafe'));
    expect(text(toSnippet(segments, 20))).toBe('…dddd  Café  eeee…');
    expect(text(toSnippet(segments, 24))).toBe('…dddd  Café  eeee  ffff…');
});

it('toSnippet adds no ellipsis where it dropped only whitespace at the haystack edges', () => {
    const haystack = '  M bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
    expect(text(toSnippet(toSegments(haystack, findRanges(haystack, 'm')), 6))).toBe('M bb…');
    const tail = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa M b  ';
    expect(text(toSnippet(toSegments(tail, findRanges(tail, 'm')), 6))).toBe('…a M b');
});

it('toSnippet throws a TypeError for a size that is not a positive integer or a non-string ellipsis', () => {
    expect(() => toSnippet([], 0)).toThrow(TypeError);
    expect(() => toSnippet([], 1.5)).toThrow(TypeError);
    expect(() => toSnippet([], 5, { ellipsis: 1 as unknown as string })).toThrow(TypeError);
});
