import { test } from 'tape';
import {
    findMatches,
    findMatchesHtml,
    findMatchesNormalized,
    findMatchesHtmlNormalized,
} from '../src/examples/index';

test('Lucid find the correct matches', (t) => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needle = 'The dog';
    const found = findMatches(haystack, needle);

    t.deepEquals(found.matches, ['The', 'the', 'dog']);
    t.equals(found.matches.length, 3);
    t.end();
});

test('Lucid highlights correctly', (t) => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needle = 'The dog';
    const found = findMatches(haystack, needle);

    t.equals(found.mark, '<span class="matched">The</span> quick brown fox jumps over <span class="matched">the</span> lazy <span class="matched">dog</span>');
    t.end();
});

test('Lucid highlights correctly with options', (t) => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needle = 'The dog';
    const options = { el: 'mark', cssClass: 'found' };
    const found = findMatches(haystack, needle, options);

    t.equals(found.mark, '<mark class="found">The</mark> quick brown fox jumps over <mark class="found">the</mark> lazy <mark class="found">dog</mark>');
    t.end();
});

test('Lucid find the correct matches in HTML string', (t) => {
    const haystack = 'The quick brown <strong>fox</strong> jumps over the lazy <div>dog</div>';
    const needle = 'The dog strong div';
    const found = findMatchesHtml(haystack, needle);

    t.deepEquals(found.matches, ['The', 'the', 'dog']);
    t.equals(found.matches.length, 3);
    t.end();
});

test('Lucid highlights HTML strings correctly', (t) => {
    const haystack = 'The quick brown <strong>fox</strong> jumps over the lazy <div>dog</div>';
    const needle = 'The dog strong div';
    const found = findMatchesHtml(haystack, needle);

    t.equals(found.mark, '<span class="matched">The</span> quick brown <strong>fox</strong> jumps over <span class="matched">the</span> lazy <div><span class="matched">dog</span></div>');
    t.end();
});

test('Lucid find the correct matches with special characters like äöüè', (t) => {
    const haystack = 'Thé quīçk brown føx jümps over the låzy dog';
    const needle = 'Thë dog';
    const found = findMatchesNormalized(haystack, needle);

    t.deepEquals(found.matches, ['Thé', 'the', 'dog']);
    t.equals(found.matches.length, 3);
    t.end();
});

test('Lucid highlights HTML strings correctly with special characters like äöüè', (t) => {
    const haystack = 'Thé quīçk brown <strong>føx</strong> jümps over the låzy <div>dog</div>';
    const needle = 'The dog strong div';
    const found = findMatchesHtmlNormalized(haystack, needle);

    t.equals(found.mark, '<span class="matched">Thé</span> quīçk brown <strong>føx</strong> jümps over <span class="matched">the</span> låzy <div><span class="matched">dog</span></div>');
    t.end();
});

test('Lucid highlights HTML strings correctly with special characters like äöüè', (t) => {
    const haystack = 'Thé quīçk brown <strong>føx</strong> jümps over the låzy <div>dog</div>';
    const needle = 'The dog strong div';
    const found = findMatchesHtmlNormalized(haystack, needle);

    t.deepEquals(found.matches, ['Thé', 'the', 'dog']);
    t.equals(found.matches.length, 3);
    t.end();
});
