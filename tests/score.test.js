import { test } from 'node:test';
import assert from 'node:assert/strict';
import { search, score } from '../src/index.js';

test('score weights each distinct Match by length and how early it appears', () => {
    const haystack = 'The lazy dog'; // The: 3 * (12/12 + 1) = 6, dog: 3 * (3/12 + 1) = 3.75
    assert.equal(score(search(haystack, 'the dog').matches, haystack), 9.75);
});

test('a repeated Match text counts once, at its first position', () => {
    assert.equal(score(search('dog dog', 'dog').matches, 'dog dog'), 6);
});

test('score ranks Haystacks: an early Match beats a late one', () => {
    const early = 'dog and cat';
    const late = 'cat and dog';
    assert.ok(score(search(early, 'dog').matches, early) > score(search(late, 'dog').matches, late));
});

test('no Matches scores 0', () => {
    assert.equal(score([], 'anything'), 0);
});

test('score without a Haystack throws a TypeError an agent can act on', () => {
    assert.throws(() => score([], undefined), /haystack must be a string/);
});
