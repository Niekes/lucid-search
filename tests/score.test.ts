import { findRanges, score } from '../index';

it('score weighs matched length by how close to the start each distinct match is', () => {
    // The: 3 * (19/19 + 1) = 6; fox: 3 * (3/19 + 1)
    const haystack = 'The quick brown fox';
    expect(score(haystack, findRanges(haystack, 'the fox'))).toBe(6 + 3 * (3 / 19 + 1));
});

it('score counts a repeated match once, at its first position', () => {
    // dog: 3 * (7/7 + 1)
    expect(score('dog Dog', findRanges('dog Dog', 'dog'))).toBe(6);
    expect(score('', [])).toBe(0);
});
