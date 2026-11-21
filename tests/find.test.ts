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

it('findRanges folds ligatures into their letters', () => {
    expect(findRanges('ﬁesta ﬁnal', 'final')).toEqual([{ start: 6, end: 10 }]);
    expect(findRanges('ﬂor oﬃce ĲSSEL', 'flor office ijssel')).toEqual([
        { start: 0, end: 3 },
        { start: 4, end: 8 },
        { start: 9, end: 14 }
    ]);
    // A Range cannot split a character, so part of a ligature highlights all of it.
    expect(findRanges('ﬁnal', 'inal')).toEqual([{ start: 0, end: 4 }]);
    expect(findRanges('ﬁnal', 'final', { normalize: false })).toEqual([]);
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

it('findRanges with typos finds a term with a missing letter', () => {
    expect(findRanges('a search box', 'serch', { typos: 1 })).toEqual([{ start: 2, end: 8 }]);
});

it('findRanges with typos counts a replaced or an extra letter as one Typo', () => {
    expect(findRanges('a search box', 'seaxch', { typos: 1 })).toEqual([{ start: 2, end: 8 }]);
    expect(findRanges('a search box', 'seaarch', { typos: 1 })).toEqual([{ start: 2, end: 8 }]);
    expect(findRanges('a search box', 'sxarxh', { typos: 1 })).toEqual([]);
});

it('findRanges with typos counts two swapped letters as one Typo', () => {
    expect(findRanges('a search box', 'serach', { typos: 1 })).toEqual([{ start: 2, end: 8 }]);
    expect(findRanges('a search box', 'saerch', { typos: 1 })).toEqual([{ start: 2, end: 8 }]);
});

it('findRanges allows at most one Typo per 4 letters of a term', () => {
    expect(findRanges('cat cot', 'cat', { typos: 2 })).toEqual([{ start: 0, end: 3 }]);
    expect(findRanges('a sxarxh box', 'search', { typos: 2 })).toEqual([]);
    expect(findRanges('a sxarxhes box', 'searches', { typos: 2 })).toEqual([{ start: 2, end: 10 }]);
});

it('findRanges with typos returns the best match, not one padded by a letter', () => {
    expect(findRanges('research', 'search', { typos: 1 })).toEqual([{ start: 2, end: 8 }]);
    expect(findRanges('search searches', 'search', { typos: 1 })).toEqual([
        { start: 0, end: 6 },
        { start: 7, end: 13 }
    ]);
    expect(findRanges('aaaaaaaa', 'aaaa', { typos: 1 })).toEqual([{ start: 0, end: 8 }]);
});

it('findRanges matches terms over 32 letters exactly, and allows typos up to 32', () => {
    const word = 'abcdefghijklmnopqrstuvwxyzabcdef';
    expect(findRanges(`x ${word} y`, word.replace('m', 'x'), { typos: 1 })).toEqual([
        { start: 2, end: 34 }
    ]);
    expect(findRanges(`x ${word}g y`, `${word}g`.replace('m', 'x'), { typos: 1 })).toEqual([]);
});

it('findRanges with typos ignores accents and points into the original haystack', () => {
    expect(findRanges('Café au lait', 'cafee', { typos: 1 })).toEqual([{ start: 0, end: 4 }]);
    expect(findRanges('cafe\u0301 au lait', 'kafe', { typos: 1 })).toEqual([{ start: 0, end: 5 }]);
});

it('findRanges with typos matches letters outside ASCII', () => {
    expect(findRanges('Die Straße', 'straßee', { typos: 1, normalize: false })).toEqual([
        { start: 4, end: 10 }
    ]);
});

it('findRanges with typos matches emoji and other characters outside the BMP', () => {
    expect(findRanges('I 😀 search', '😀 sarch', { typos: 1 })).toEqual([
        { start: 2, end: 4 },
        { start: 5, end: 11 }
    ]);
    expect(findRanges('pizza🍕time', 'piza🍕', { typos: 1 })).toEqual([{ start: 0, end: 7 }]);
});

it('findRanges keeps an extra combining mark inside the Range of an accented letter', () => {
    expect(findRanges('Łódź́ city', 'lodz')).toEqual([{ start: 0, end: 5 }]);
});

it('findRanges with typos keeps working across many distinct terms', () => {
    const terms = Array.from({ length: 300 }, (_, i) => `term${i}`);
    expect(findRanges('a term299 here', terms, { typos: 1 })).toEqual([{ start: 2, end: 9 }]);
});

it('findRanges still matches after more than 10,000 distinct characters', () => {
    const many = Array.from({ length: 10_001 }, (_, i) => String.fromCodePoint(0x4e00 + i)).join(
        ''
    );
    findRanges(many, 'x');

    expect(findRanges('Café', 'cafe')).toEqual([{ start: 0, end: 4 }]);
});

it('findRanges treats a non-boolean normalize by its truthiness without changing later calls', () => {
    const loose = (value: string) => ({ normalize: value }) as unknown as { normalize: boolean };

    expect(findRanges('Café', 'cafe', loose('yes'))).toEqual([{ start: 0, end: 4 }]);
    expect(findRanges('é', 'e', loose('0'))).toEqual([{ start: 0, end: 1 }]);
    expect(findRanges('é', 'e', { normalize: false })).toEqual([]);
});

it('findRanges matches typos only when the caller allows them', () => {
    expect(findRanges('a search box', 'serach')).toEqual([]);
    expect(findRanges('a search box', 'serach', { typos: 0 })).toEqual([]);
});

it('findRanges with typos keeps whole words: no space at an edge, no letter cut off', () => {
    expect(findRanges('a cafe b', 'cafex', { typos: 1 })).toEqual([{ start: 2, end: 6 }]);
    expect(findRanges('a cafe b', 'xcafe', { typos: 1 })).toEqual([{ start: 2, end: 6 }]);
    expect(findRanges('a search box', 'searhc', { typos: 1 })).toEqual([{ start: 2, end: 8 }]);
    expect(findRanges('a search box', 'esarch', { typos: 1 })).toEqual([{ start: 2, end: 8 }]);
    expect(findRanges('searc search', 'search', { typos: 1 })).toEqual([
        { start: 0, end: 5 },
        { start: 6, end: 12 }
    ]);
    expect(findRanges('a 😀😀 b', '😀😀x', { typos: 1 })).toEqual([{ start: 2, end: 6 }]);
});

it('findRanges with typos handles a haystack that is one long run of candidates', () => {
    expect(findRanges('a'.repeat(200_000), 'aaaa', { typos: 1 })).toEqual([
        { start: 0, end: 200_000 }
    ]);
});

it('findRanges throws a TypeError an agent can act on for wrong input types', () => {
    const untyped = (value: unknown) => value as string;
    expect(() => findRanges(untyped(null), 'x')).toThrow(/haystack must be a string/);
    expect(() => findRanges('a 1 b', untyped([1]))).toThrow(/query must be a string or an array/);
    expect(() => findRanges('a', untyped(42))).toThrow(/query must be/);
    const holes = new Array<string>(2);
    holes[1] = 'a';
    expect(findRanges('a b', holes)).toEqual([{ start: 0, end: 1 }]);
});

it('findRanges with wordStart matches a term only where a word starts', () => {
    expect(findRanges('Feliz and Lina', 'li', { wordStart: true })).toEqual([
        { start: 10, end: 12 }
    ]);
    expect(findRanges('Feliz and Lina', 'li')).toEqual([
        { start: 2, end: 4 },
        { start: 10, end: 12 }
    ]);
});

it('findRanges with wordStart reads the character before a match as findRanges folds it', () => {
    const atWordStart = (haystack: string, term: string, normalize = true) =>
        findRanges(haystack, term, { wordStart: true, normalize });
    // Inside a ligature the `i` follows an `f`, though its Range starts at the ligature.
    expect(atWordStart('ﬁnal', 'i')).toEqual([]);
    // A letter outside the BMP is still a letter; an emoji is not.
    expect(atWordStart('𝐀li', 'li')).toEqual([]);
    expect(atWordStart('😀li', 'li')).toEqual([{ start: 2, end: 4 }]);
    // A combining mark belongs to its word, also when accents are kept.
    expect(atWordStart('caféli', 'li', false)).toEqual([]);
    // Punctuation and symbols end a word; a term that starts with one still needs a word start.
    expect(atWordStart('$li foo_li', 'li')).toEqual([
        { start: 1, end: 3 },
        { start: 8, end: 10 }
    ]);
    expect(atWordStart('asp.net .net', '.net')).toEqual([{ start: 8, end: 12 }]);
});

it('findRanges with wordStart and typos keeps only matches that start a word', () => {
    expect(findRanges('xserach and serach', 'search', { typos: 1, wordStart: true })).toEqual([
        { start: 12, end: 18 }
    ]);
});
