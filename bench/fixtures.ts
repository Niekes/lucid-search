// Deterministic text, so every run and every library sees the same input.
const words = (
    'the quick brown fox jumps over lazy dog search highlight match text result list item ' +
    'query value index order price stock house garden river mountain city street window'
).split(' ');
const accented = ['élève', 'café', 'naïve', 'über', 'señor', 'façade', 'crème', 'brûlée'];

function random(seed: number): () => number {
    // mulberry32
    return () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function text(length: number, seed: number, pool = words): string {
    const next = random(seed);
    let out = '';
    while (out.length < length) out += `${pool[Math.floor(next() * pool.length)]} `;
    return out.slice(0, length).trimEnd();
}

export interface Scenario {
    name: string;
    haystacks: string[];
    needle: string;
}

export const scenarios: Scenario[] = [
    {
        name: 'S1 search-as-you-type: 1,000 items of 60 chars, 2 terms',
        haystacks: Array.from({ length: 1000 }, (_, i) => text(60, i + 1)),
        needle: 'qu ho'
    },
    { name: 'S2 article: 10 kB, 3 terms', haystacks: [text(10_000, 2)], needle: 'the over lazy' },
    {
        name: 'S4 accents: 10 kB, 1 term',
        haystacks: [text(10_000, 4, [...words, ...accented])],
        needle: 'eleve'
    },
    { name: 'S5 no match: 10 kB, 2 terms', haystacks: [text(10_000, 2)], needle: 'zzz qqq' },
    {
        name: 'S6 stress: 100 kB, 20 terms',
        haystacks: [text(100_000, 6)],
        needle: words.slice(0, 20).join(' ')
    }
];
