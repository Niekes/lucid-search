import { test } from 'node:test';
import assert from 'node:assert/strict';
import { search } from '../src/index.js';

const fox = 'The quick brown fox jumps over the lazy dog';

test('search returns each Match with its position and the Term that found it', () => {
    assert.deepEqual(search(fox, 'The dog barks'), {
        matches: [
            { start: 0, end: 3, text: 'The', term: 'The' },
            { start: 31, end: 34, text: 'the', term: 'The' },
            { start: 40, end: 43, text: 'dog', term: 'dog' },
        ],
        missing: ['barks'],
    });
});

test('a Needle is literal: pattern characters match themselves', () => {
    const { matches, missing } = search('I write c++ and a*b daily', ['c++', 'a*b', '(x']);
    assert.deepEqual(matches.map(m => m.text), ['c++', 'a*b']);
    assert.deepEqual(missing, ['(x']);
});

test('overlapping Terms: the longer Term wins at the same position', () => {
    assert.deepEqual(search('there', 'the there').matches, [{ start: 0, end: 5, text: 'there', term: 'there' }]);
});

test('a Term hidden by a longer overlapping Match is still not Missing', () => {
    assert.deepEqual(search('the', 'he the').missing, []);
});

test('Normalization lets a plain Needle find accented text without shifting positions', () => {
    const { matches } = search('Crème brûlée in Łódź', 'creme brulee lodz', { normalize: true });
    assert.deepEqual(matches.map(m => [m.start, m.text]), [[0, 'Crème'], [6, 'brûlée'], [16, 'Łódź']]);
});

test('without Normalization accents must match exactly', () => {
    assert.deepEqual(search('Crème', 'creme').missing, ['creme']);
});

test('an empty or blank Needle finds nothing and misses nothing', () => {
    assert.deepEqual(search(fox, '  '), { matches: [], missing: [] });
    assert.deepEqual(search(fox, ['', ' ']), { matches: [], missing: [] });
});

test('wrong input types throw a TypeError an agent can act on', () => {
    assert.throws(() => search(null, 'x'), /haystack must be a string/);
    assert.throws(() => search(fox, 42), /needle must be a string or an array of strings/);
    assert.throws(() => search(fox, ['ok', 1]), /needle must be/);
});

test('Missing Terms keep the order the caller gave them in', () => {
    assert.deepEqual(search(fox, 'yy zzz').missing, ['yy', 'zzz']);
});
