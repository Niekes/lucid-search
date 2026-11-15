import { test } from 'node:test';
import assert from 'node:assert/strict';
import { search, highlight } from '../src/index.js';

test('highlight wraps each Match in a span with class "matched" by default', () => {
    const haystack = 'The lazy dog';
    assert.equal(
        highlight(haystack, search(haystack, 'the dog').matches),
        '<span class="matched">The</span> lazy <span class="matched">dog</span>',
    );
});

test('highlight escapes HTML in the Haystack, inside and outside Matches', () => {
    const haystack = '<script>alert("x")</script> & script';
    assert.equal(
        highlight(haystack, search(haystack, 'script').matches, { el: 'mark', cssClass: 'hit' }),
        '&lt;<mark class="hit">script</mark>&gt;alert(&quot;x&quot;)&lt;/<mark class="hit">script</mark>&gt; &amp; <mark class="hit">script</mark>',
    );
});

test('highlight rejects an element or class that could inject markup', () => {
    assert.throws(() => highlight('a', [], { el: 'img src=x onerror=alert(1)' }), TypeError);
    assert.throws(() => highlight('a', [], { cssClass: '"><script>' }), TypeError);
});

test('highlight with no Matches returns the escaped Haystack', () => {
    assert.equal(highlight('a < b', []), 'a &lt; b');
});
