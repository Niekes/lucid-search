<script setup lang="ts">
import { computed, ref } from 'vue';
import { findRanges, score, toSegments } from '../../../index';
import type { Segment } from '../../../index';
import { random } from '../../../bench/fixtures';

// 10,000 made-up companies, the same on every visit (seeded, no network).
const people =
    'Müller Łukasiewicz Nowak Schröder Dubois Lefèvre García Núñez Søndergaard Ødegaard Smith Johnson Brown Yılmaz Kovačević Dvořák Weiß Østergaard Peña Božić'.split(
        ' '
    );
const trades =
    'Logistics Software Bäckerei Café Consulting Robotics Energy Finance Design Labs Media Foods Brewing Outdoor Health Security Analytics Studio Garden Travel'.split(
        ' '
    );
const suffixes = ['GmbH', 'Inc', 'S.A.', 'Ltd', 'AG', '& Söhne', 'Group', 'Partners'];
const tlds = ['com', 'de', 'io', 'fr', 'es', 'dk', 'net'];

const next = random(42);
const pick = <T>(list: T[]): T => list[Math.floor(next() * list.length)];
const slug = (text: string): string =>
    text
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');

const companies = Array.from({ length: 10_000 }, () => {
    const person = pick(people);
    const trade = pick(trades);
    return {
        name: `${person} ${trade} ${pick(suffixes)}`,
        url: `https://${slug(`${person}-${trade}`)}.${pick(tlds)}`
    };
});

const query = ref('muller cafe');
const normalize = ref(true);

interface Hit {
    name: Segment[];
    url: Segment[];
    rank: number;
}

const found = computed(() => {
    const started = performance.now();
    const hits: Hit[] = [];
    for (const { name, url } of companies) {
        const nameRanges = findRanges(name, query.value, { normalize: normalize.value });
        const urlRanges = findRanges(url, query.value, { normalize: normalize.value });
        if (!nameRanges.length && !urlRanges.length) continue;
        hits.push({
            name: toSegments(name, nameRanges),
            url: toSegments(url, urlRanges),
            // A match in the name counts five times as much as one in the URL.
            rank: score(name, nameRanges) * 5 + score(url, urlRanges)
        });
    }
    hits.sort((a, b) => b.rank - a.rank);
    return { top: hits.slice(0, 10), count: hits.length, ms: performance.now() - started };
});
</script>

<template>
    <div class="company-search">
        <input
            v-model="query"
            class="query"
            type="search"
            aria-label="Search companies"
            placeholder="Search companies"
        />
        <label class="inline">
            <input v-model="normalize" type="checkbox" />
            <code>normalize</code>
        </label>
        <p class="status" aria-live="polite">
            Searched {{ companies.length.toLocaleString('en') }} companies in
            <strong>{{ Math.round(found.ms) }} ms</strong> and found
            <strong>{{ found.count.toLocaleString('en') }}</strong
            >.
        </p>
        <ol class="results">
            <li v-for="(hit, i) in found.top" :key="i">
                <span class="icon" aria-hidden="true">{{ hit.name[0].text[0] }}</span>
                <span>
                    <span class="name">
                        <template v-for="(segment, j) in hit.name" :key="j">
                            <mark v-if="segment.match">{{ segment.text }}</mark>
                            <template v-else>{{ segment.text }}</template>
                        </template>
                    </span>
                    <small class="url">
                        <template v-for="(segment, j) in hit.url" :key="j">
                            <mark v-if="segment.match">{{ segment.text }}</mark>
                            <template v-else>{{ segment.text }}</template>
                        </template>
                    </small>
                </span>
            </li>
        </ol>
    </div>
</template>

<style scoped>
.query {
    display: block;
    width: 100%;
    padding: 6px 8px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 6px;
    background: var(--vp-c-bg);
    font: inherit;
    font-size: 1.1em;
}
.inline {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 12px;
}
.status {
    color: var(--vp-c-text-2);
}
.results {
    margin: 0;
    padding: 0;
    list-style: none;
}
.results li {
    display: flex;
    gap: 12px;
    align-items: center;
    margin: 0 0 8px;
    padding: 8px 12px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
}
.icon {
    display: grid;
    place-items: center;
    flex: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--vp-c-brand-soft);
    color: var(--vp-c-brand-1);
    font-weight: 600;
}
.name {
    display: block;
    font-weight: 600;
}
.url {
    color: var(--vp-c-text-2);
}
mark {
    background: var(--vp-c-yellow-soft);
    color: inherit;
    border-radius: 2px;
}
</style>
