// Run with `pnpm bench`. Every library searches the same haystacks for the same Term, and is
// timed only after its recall (which expected words it found) and precision (how much of what it
// returned is one of them) are printed, so nobody wins by finding less.
import uFuzzy from '@leeoniya/ufuzzy';
import Fuse from 'fuse.js';
import fuzzysort from 'fuzzysort';
import { test } from 'vite-plus/test';
import { findRanges } from '../index';
import type { Range } from '../index';
import book from './fixtures/pride-and-prejudice.txt?raw';

type Finder = (haystacks: string[], term: string) => Range[][];

// Consecutive matched positions become one Range.
function toRanges(positions: readonly number[]): Range[] {
    const ranges: Range[] = [];
    for (const at of positions) {
        const last = ranges[ranges.length - 1];
        if (last && last.end === at) last.end += 1;
        else ranges.push({ start: at, end: at + 1 });
    }
    return ranges;
}

const finders: Record<string, Finder> = {
    'lucid-search': (haystacks, term) => haystacks.map((h) => findRanges(h, [term], { typos: 2 })),
    'fuse.js': (haystacks, term) => {
        const found: Range[][] = haystacks.map(() => []);
        const fuse = new Fuse(haystacks, {
            includeMatches: true,
            ignoreLocation: true,
            threshold: 0.3,
            minMatchCharLength: term.length - 2
        });
        for (const { refIndex, matches } of fuse.search(term)) {
            found[refIndex] = (matches?.[0]?.indices ?? []).map(([start, end]) => ({
                start,
                end: end + 1
            }));
        }
        return found;
    },
    uFuzzy: (haystacks, term) => {
        const found: Range[][] = haystacks.map(() => []);
        const uf = new uFuzzy({ intraMode: 1, intraIns: 1, intraSub: 1, intraTrn: 1, intraDel: 1 });
        const [, info] = uf.search(haystacks, term, 0, Infinity);
        // uFuzzy leaves `idx` out when nothing matched.
        (info?.idx ?? []).forEach((index, i) => {
            const flat = info?.ranges[i] ?? [];
            for (let r = 0; r < flat.length; r += 2) {
                found[index].push({ start: flat[r], end: flat[r + 1] });
            }
        });
        return found;
    },
    fuzzysort: (haystacks, term) => {
        const found: Range[][] = haystacks.map(() => []);
        const targets = haystacks.map((text, index) => ({ text, index }));
        for (const result of fuzzysort.go(term, targets, { key: 'text' })) {
            found[result.obj.index] = toRanges(result.indexes);
        }
        return found;
    }
};

const lines = book.split('\n').filter((line) => line.trim().length > 20);
const corpora: Record<string, string[]> = {
    'one short line': [lines.find((line) => line.includes('Netherfield')) as string],
    [`${lines.length} short lines`]: lines,
    'one 200 KB haystack': [book]
};

// Each query's `target` is the text it should find; its exact occurrences are the expected matches.
const queries = [
    { label: 'exact', term: 'Netherfield', target: 'Netherfield' },
    { label: '1 typo (swap)', term: 'Netherfeild', target: 'Netherfield' },
    { label: '2 typos', term: 'Nethrfeeld', target: 'Netherfield' },
    {
        label: '1 typo, 38 letters',
        term: 'truth universally acknowledgde, that a',
        target: 'truth universally acknowledged, that a'
    }
];

const overlaps = (a: Range, b: Range): boolean => a.start < b.end && b.start < a.end;

function quality(finder: Finder, haystacks: string[], term: string, target: string): string {
    const got = finder(haystacks, term);
    let expected = 0;
    let hit = 0;
    let returned = 0;
    let relevant = 0;
    haystacks.forEach((haystack, i) => {
        const wanted = findRanges(haystack, [target]);
        expected += wanted.length;
        hit += wanted.filter((w) => got[i].some((g) => overlaps(g, w))).length;
        returned += got[i].length;
        relevant += got[i].filter((g) => wanted.some((w) => overlaps(g, w))).length;
    });
    const percent = (part: number, whole: number): string =>
        whole ? `${Math.round((100 * part) / whole)}%` : '-';
    return `recall ${percent(hit, expected)}, precision ${percent(relevant, returned)}`;
}

for (const [corpus, haystacks] of Object.entries(corpora)) {
    for (const { label, term, target } of queries) {
        test(`${corpus}: ${label}`, async ({ bench }) => {
            await bench.compare(
                ...Object.entries(finders).map(([name, finder]) =>
                    bench(`${name} (${quality(finder, haystacks, term, target)})`, () => {
                        finder(haystacks, term);
                    })
                )
            );
        });
    }
}
