import { findRanges } from '../index';

it('findRanges finds every term case-insensitively', () => {
    expect(findRanges('The quick brown fox jumps over the lazy dog', 'the DOG')).toEqual([
        { start: 0, end: 3 },
        { start: 31, end: 34 },
        { start: 40, end: 43 }
    ]);
});

it('findRanges treats terms as plain text, not patterns', () => {
    expect(findRanges('I like C++ (a lot) [really]', 'c++ ( [')).toEqual([
        { start: 7, end: 10 },
        { start: 11, end: 12 },
        { start: 19, end: 20 }
    ]);
    expect(findRanges('Berlin, Germany and Bern', 'n, g')).toEqual([
        { start: 5, end: 7 },
        { start: 8, end: 9 }
    ]);
});

it('findRanges splits a string query on whitespace only and merges overlapping matches', () => {
    expect(findRanges('send an e-mail', 'e-mail mail')).toEqual([{ start: 8, end: 14 }]);
    expect(findRanges('aaaa', 'aa')).toEqual([{ start: 0, end: 4 }]);
    expect(findRanges('foobar', ['foo', 'bar'])).toEqual([{ start: 0, end: 6 }]);
});

it('findRanges returns no Ranges for an empty or blank query', () => {
    expect(findRanges('anything', '')).toEqual([]);
    expect(findRanges('anything', '   ')).toEqual([]);
    expect(findRanges('anything', [])).toEqual([]);
    expect(findRanges('', 'x')).toEqual([]);
});

it('findRanges ignores accents by default and points Ranges into the original haystack', () => {
    expect(findRanges('Café Łódź', 'cafe lodz')).toEqual([
        { start: 0, end: 4 },
        { start: 5, end: 9 }
    ]);
    expect(findRanges('cafe', 'café')).toEqual([{ start: 0, end: 4 }]);
    expect(findRanges('Straße', 'strasse')).toEqual([{ start: 0, end: 6 }]);
    expect(findRanges('Mañana Ørsted Ærø İzmir ŞĞÝŽ', 'manana orsted aero izmir sgyz')).toEqual([
        { start: 0, end: 6 },
        { start: 7, end: 13 },
        { start: 14, end: 17 },
        { start: 18, end: 23 },
        { start: 24, end: 28 }
    ]);
});

it('findRanges keeps an already-decomposed accent inside its Range', () => {
    expect(findRanges('café au lait', 'cafe')).toEqual([{ start: 0, end: 5 }]);
    expect(findRanges('́abc', 'abc')).toEqual([{ start: 1, end: 4 }]);
});

it('findRanges keeps standalone diacritic symbols searchable', () => {
    expect(findRanges('2^8 and `code`', '^ `')).toEqual([
        { start: 1, end: 2 },
        { start: 8, end: 9 },
        { start: 13, end: 14 }
    ]);
});

it('findRanges matches accents exactly but still ignores case when normalize is off', () => {
    expect(findRanges('Café cafe', 'cafe', { normalize: false })).toEqual([{ start: 5, end: 9 }]);
    expect(findRanges('İstanbul', 'istanbul', { normalize: false })).toEqual([
        { start: 0, end: 8 }
    ]);
});

it('findRanges still matches after more than 10,000 distinct characters', () => {
    const many = Array.from({ length: 10_001 }, (_, i) => String.fromCodePoint(0x4e00 + i)).join(
        ''
    );
    findRanges(many, 'x');

    expect(findRanges('Café', 'cafe')).toEqual([{ start: 0, end: 4 }]);
});
