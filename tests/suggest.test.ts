import { search, suggest } from '../index';

describe('suggest', () => {
    it('suggests the word in the haystack that is the fewest typos away', () => {
        expect(suggest('How to search a text', 'serach')).toEqual({
            start: 7,
            end: 13,
            text: 'search',
            term: 'serach'
        });
    });

    it('suggests only whole words, never part of one', () => {
        expect(suggest('researching the topic', 'serch')).toBeUndefined();
        expect(suggest('research', 'search')).toBeUndefined();
        expect(suggest('searching', 'search')).toBeUndefined();
        expect(suggest('researching, then search', 'serch')?.text).toBe('search');
    });

    it('prefers fewer typos over an earlier word, and the earlier word on a tie', () => {
        expect(suggest('sarch serach search', 'search')?.start).toBe(13);
        expect(suggest('saerch serach', 'search')?.start).toBe(0);
    });

    it('ignores case and accents, and maps back to the haystack as given', () => {
        expect(suggest('Ein Café in Köln', 'cafe')).toEqual({
            start: 4,
            end: 8,
            text: 'Café',
            term: 'cafe'
        });
        expect(suggest('Straße', 'strasse')?.text).toBe('Straße');
    });

    it('allows one typo per 4 letters, so a short term gets no typo', () => {
        expect(suggest('the cat', 'teh')).toBeUndefined();
        expect(suggest('the cat', 'CAT')?.text).toBe('cat');
        expect(suggest('a lovely day', 'lvoely')?.text).toBe('lovely');
        expect(suggest('a lovely day', 'lvoley')).toBeUndefined();
    });

    it('suggests nothing for an empty term or a haystack without a close word', () => {
        expect(suggest('some text', '')).toBeUndefined();
        expect(suggest('some text', 'banana')).toBeUndefined();
    });

    it('rejects an untyped caller sending something other than strings', () => {
        expect(() => suggest(1 as unknown as string, 'x')).toThrow('haystack must be a string');
        expect(() => suggest('x', ['x'] as unknown as string)).toThrow('term must be a string');
    });

    it('gives a suggestion for each missing term of search', () => {
        const haystack = 'Lucid search highlights matches';
        const { missing } = search(haystack, 'serach higlights');
        expect(missing.map((term) => suggest(haystack, term)?.text)).toEqual([
            'search',
            'highlights'
        ]);
    });
});
