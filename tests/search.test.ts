import { search, highlight, score, findRanges } from '../index';

const fox = 'The quick brown fox jumps over the lazy dog';
// Agents call these from untyped JSON, so the runtime checks are part of the contract.
const untyped = (value: unknown) => value as string;

describe('search', () => {
    it('returns each match with its position and the search term that found it', () => {
        expect(search(fox, 'The dog barks')).toEqual({
            matches: [
                { start: 0, end: 3, text: 'The', term: 'The' },
                { start: 31, end: 34, text: 'the', term: 'The' },
                { start: 40, end: 43, text: 'dog', term: 'dog' }
            ],
            missing: ['barks']
        });
    });

    it('takes the needle literally: pattern characters match themselves', () => {
        const { matches, missing } = search('I write c++ and a*b daily', ['c++', 'a*b', '(x']);
        expect(matches.map((m) => m.text)).toEqual(['c++', 'a*b']);
        expect(missing).toEqual(['(x']);
    });

    it('lets the longer search term win at the same position', () => {
        expect(search('there', 'the there').matches).toEqual([
            { start: 0, end: 5, text: 'there', term: 'there' }
        ]);
    });

    it('does not report a search term hidden by a longer overlapping match as missing', () => {
        expect(search('the', 'he the').missing).toEqual([]);
    });

    it('normalizes accents without shifting positions', () => {
        const { matches } = search('Crème brûlée in Łódź', 'creme brulee lodz', {
            normalize: true
        });
        expect(matches.map((m) => [m.start, m.text])).toEqual([
            [0, 'Crème'],
            [6, 'brûlée'],
            [16, 'Łódź']
        ]);
    });

    it('matches accents exactly without normalize', () => {
        expect(search('Crème', 'creme').missing).toEqual(['creme']);
    });

    it('finds nothing and misses nothing for an empty or blank needle', () => {
        expect(search(fox, '  ')).toEqual({ matches: [], missing: [] });
        expect(search(fox, ['', ' '])).toEqual({ matches: [], missing: [] });
    });

    it('throws a TypeError an agent can act on for wrong input types', () => {
        expect(() => search(untyped(null), 'x')).toThrow(/haystack must be a string/);
        expect(() => search(fox, untyped(42))).toThrow(/needle must be a string or an array/);
        expect(() => search(fox, untyped(['ok', 1]))).toThrow(/needle must be/);
    });

    it('keeps missing search terms in the order the caller gave them', () => {
        expect(search(fox, 'yy zzz').missing).toEqual(['yy', 'zzz']);
    });

    it('treats search terms differing only in case as one, spelled as first given', () => {
        expect(search(fox, ['CAT', 'cat', 'Cat']).missing).toEqual(['CAT']);
    });
});

describe('highlight', () => {
    it('wraps each match in a span with class "matched" by default', () => {
        const haystack = 'The lazy dog';
        expect(highlight(haystack, search(haystack, 'the dog').matches)).toBe(
            '<span class="matched">The</span> lazy <span class="matched">dog</span>'
        );
    });

    it('escapes HTML in the haystack, inside and outside matches', () => {
        const haystack = '<script>alert("x")</script> & script';
        expect(
            highlight(haystack, search(haystack, 'script').matches, { el: 'mark', cssClass: 'hit' })
        ).toBe(
            '&lt;<mark class="hit">script</mark>&gt;alert(&quot;x&quot;)&lt;/<mark class="hit">script</mark>&gt; &amp; <mark class="hit">script</mark>'
        );
    });

    it('returns the escaped haystack when there are no matches', () => {
        expect(highlight('a < b', [])).toBe('a &lt; b');
    });

    it('rejects an element or class that could inject markup', () => {
        expect(() => highlight('a', [], { el: 'img src=x onerror=alert(1)' })).toThrow(TypeError);
        expect(() => highlight('a', [], { cssClass: '"><script>' })).toThrow(TypeError);
        expect(() => highlight('a', [], { el: untyped(null) })).toThrow(TypeError);
        expect(() => highlight('a', [], { cssClass: untyped(5) })).toThrow(TypeError);
    });
});

describe('score with matches from search', () => {
    it('weights each distinct match by length and how early it appears', () => {
        const haystack = 'The lazy dog'; // The: 3 * (12/12 + 1) = 6, dog: 3 * (3/12 + 1) = 3.75
        expect(score(haystack, search(haystack, 'the dog').matches)).toBe(9.75);
    });

    it('counts a repeated match text once, at its first position', () => {
        expect(score('dog dog', search('dog dog', 'dog').matches)).toBe(6);
    });

    it('scores the same as with the Ranges of findRanges', () => {
        expect(score(fox, search(fox, 'the dog').matches)).toBe(
            score(fox, findRanges(fox, 'the dog'))
        );
    });
});

it('search does not report a term as missing when it only occurs inside a longer match', () => {
    const result = search('the theory', ['theory', 'heo']);

    expect(result.matches.map((m) => m.term)).toEqual(['theory']);
    expect(result.missing).toEqual([]);
});

it('search finds the same terms when the same needle searches another haystack', () => {
    expect(search('a dog', 'dog cat').missing).toEqual(['cat']);
    expect(search('a cat', 'dog cat').missing).toEqual(['dog']);
    expect(search('a cat', 'dog cat', { normalize: true }).matches).toHaveLength(1);
});

it('search still works after more than 100 different needles', () => {
    for (let i = 0; i < 101; i++) search('dog', `dog ${i}`);

    expect(search('dog 7', 'dog 7').missing).toEqual([]);
});

it('search returns a fresh missing list that the caller may change', () => {
    search('x', 'dog').missing.push('cat');

    expect(search('x', 'dog').missing).toEqual(['dog']);
});

it('search finds long needles on every call', () => {
    const needle = `dog ${'x'.repeat(1000)}`;

    expect(search('a dog', needle).missing).toEqual(['x'.repeat(1000)]);
    expect(search('a dog', needle).matches).toHaveLength(1);
});
