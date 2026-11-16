import { findAll } from 'highlight-words-core';
import highlightWords from 'highlight-words';
import { createHighlighter } from 'spotmark';
import AccentFolding from 'accent-folding';
import * as lucid from '../index';
import type { Scenario } from './fixtures';

/** Turns (haystack, needle) into an HTML string with every match wrapped in a span. */
export type Adapter = (haystack: string, needle: string) => string;

// Copied once: calling through the module runner's export getters would slow lucid down only.
const { search, highlight, findRanges, toSegments } = lucid;

const wrap = (text: string): string => `<span class="matched">${text}</span>`;
const segments = (haystack: string, needle: string, normalize: boolean): string =>
    toSegments(haystack, findRanges(haystack, needle, { normalize }))
        .map(({ text, match }) => (match ? wrap(text) : text))
        .join('');
const terms = (needle: string): string[] => needle.split(' ');
const stripAccents = (text: string): string => text.normalize('NFD').replace(/\p{M}/gu, '');

function hwc(haystack: string, needle: string, sanitize?: (text: string) => string): string {
    return findAll({
        textToHighlight: haystack,
        searchWords: terms(needle),
        autoEscape: true,
        sanitize
    })
        .map(({ start, end, highlight }) => {
            const text = haystack.slice(start, end);
            return highlight ? wrap(text) : text;
        })
        .join('');
}

const spotmark = createHighlighter({
    className: 'matched',
    separateWordSearch: true,
    diacritics: false
});
const spotmarkAccents = createHighlighter({
    className: 'matched',
    separateWordSearch: true,
    diacritics: true
});
const folding = new AccentFolding();

/** Plain-text adapters: case-insensitive, every occurrence, no accent folding. */
const plain: Record<string, Adapter> = {
    'lucid-search': (h, n) => highlight(h, search(h, n).matches),
    'lucid-search (findRanges)': (h, n) => segments(h, n, false),
    'highlight-words-core': (h, n) => hwc(h, n),
    'highlight-words': (h, n) =>
        highlightWords({ text: h, query: n })
            .map(({ text, match }) => (match ? wrap(text) : text))
            .join(''),
    spotmark: (h, n) => spotmark(h, n)
};

/** Accent-insensitive adapters. accent-folding takes a single search term. */
const accents: Record<string, Adapter> = {
    'lucid-search': (h, n) => highlight(h, search(h, n, { normalize: true }).matches),
    'lucid-search (findRanges)': (h, n) => segments(h, n, true),
    'highlight-words-core': (h, n) => hwc(h, n, stripAccents),
    spotmark: (h, n) => spotmarkAccents(h, n),
    'accent-folding': (h, n) => folding.highlightMatch(h, n, 'span')
};

// The highlighted texts in order, so outputs with different tags can be compared.
const highlighted = (html: string): string[] =>
    [...html.matchAll(/<span[^>]*>(.*?)<\/span>/g)].map((m) => m[1]);

/**
 * The adapters for a scenario, split into the ones that highlight exactly the same text as
 * lucid-search (only these are timed) and the names of the ones that don't.
 */
export function contenders({ name, haystacks, needle }: Scenario): {
    same: [string, Adapter][];
    skipped: string[];
} {
    const adapters = name.startsWith('S4') ? accents : plain;
    const texts = (adapter: Adapter): string =>
        JSON.stringify(haystacks.map((h) => highlighted(adapter(h, needle))));
    const expected = texts(adapters['lucid-search']);
    const same: [string, Adapter][] = [];
    const skipped: string[] = [];
    for (const [library, adapter] of Object.entries(adapters)) {
        if (texts(adapter) === expected) same.push([library, adapter]);
        else skipped.push(library);
    }
    return { same, skipped };
}
