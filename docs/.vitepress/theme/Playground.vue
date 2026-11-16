<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { findRanges, highlight, score, search, toSegments } from '../../../index';

type Mode = 'search' | 'findRanges';

const haystack = ref(
    [
        'Thé quick brown føx jumps over the låzy dog in Łódź, then naps beside a café on the Straße.',
        'The élève at the next table orders a crème brûlée and asks the señor at the counter about the façade, which a naïve tourist mistakes for a museum.',
        'By evening the fox is back in the forest, the dog is asleep, and the café in Łódź closes its doors. Nobody in the city remembers the quick brown fox, except the dog.'
    ].join('\n\n')
);
const query = ref('the fox dog lodz cafe');
const mode = ref<Mode>('search');
// Each function's own default: `search` keeps accents, `findRanges` ignores them.
const normalize = ref(false);
watch(mode, (m) => (normalize.value = m === 'findRanges'));
const el = ref('mark');
const cssClass = ref('matched');
const editing = ref(false);

// One JSON line per item, as one string, not an element per line, so long results stay fast.
const lines = (items: object[]): string => items.map((item) => JSON.stringify(item)).join('\n');
const list = (texts: string[]): string => texts.join(', ') || 'none';

const result = computed(() => {
    try {
        if (mode.value === 'search') {
            const { matches, missing } = search(haystack.value, query.value, {
                normalize: normalize.value
            });
            const perTerm = new Map<string, number>();
            for (const { term } of matches) perTerm.set(term, (perTerm.get(term) ?? 0) + 1);
            return {
                stats: [
                    { label: 'Matches', value: matches.length },
                    { label: 'Found', value: list([...perTerm].map(([t, n]) => `${t} ×${n}`)) },
                    { label: 'Missing', value: list(missing) }
                ],
                lines: lines(matches),
                html: highlight(haystack.value, matches, { el: el.value, cssClass: cssClass.value })
            };
        }
        const ranges = findRanges(haystack.value, query.value, { normalize: normalize.value });
        return {
            stats: [
                { label: 'Ranges', value: ranges.length },
                { label: 'Score', value: Number(score(haystack.value, ranges).toFixed(2)) }
            ],
            lines: lines(ranges),
            segments: toSegments(haystack.value, ranges)
        };
    } catch (error) {
        // The haystack stays readable, unhighlighted, while the options are invalid.
        return {
            error: String(error),
            segments: [{ text: haystack.value, match: false }]
        };
    }
});
</script>

<template>
    <div class="playground">
        <input v-model="query" class="query" type="search" aria-label="Query" placeholder="Query" />

        <div class="options">
            <label>
                Function
                <select v-model="mode">
                    <option value="search">search + highlight</option>
                    <option value="findRanges">findRanges + toSegments</option>
                </select>
            </label>
            <label class="inline">
                <input v-model="normalize" type="checkbox" />
                <code>normalize</code>
            </label>
            <template v-if="mode === 'search'">
                <label>
                    <code>el</code>
                    <input v-model="el" class="short" />
                </label>
                <label>
                    <code>cssClass</code>
                    <input v-model="cssClass" class="short" />
                </label>
            </template>
        </div>

        <!-- Always in the page, so screen readers announce every change of the stats or the error. -->
        <div class="stats" aria-live="polite">
            <p v-if="result.error" class="card error">{{ result.error }}</p>
            <div v-for="stat in result.stats" v-else :key="stat.label" class="card">
                <div class="label">{{ stat.label }}</div>
                <div class="value" :class="{ number: typeof stat.value === 'number' }">
                    {{ stat.value }}
                </div>
            </div>
        </div>
        <details v-if="result.lines" class="raw">
            <summary>Show the result as JSON</summary>
            <pre>{{ result.lines }}</pre>
        </details>

        <div class="text-header">
            <strong>Haystack</strong>
            <button type="button" @click="editing = !editing">
                {{ editing ? 'Done' : 'Edit text' }}
            </button>
        </div>
        <textarea v-if="editing" v-model="haystack" rows="10" aria-label="Haystack" />
        <!-- `highlight` escapes the whole haystack, so its output is safe to insert. -->
        <div v-else-if="result.html !== undefined" class="haystack" v-html="result.html" />
        <div v-else class="haystack">
            <template v-for="(segment, i) in result.segments" :key="i">
                <mark v-if="segment.match">{{ segment.text }}</mark>
                <template v-else>{{ segment.text }}</template>
            </template>
        </div>
    </div>
</template>

<style scoped>
.playground input,
.playground select,
.playground textarea {
    padding: 6px 8px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 6px;
    background: var(--vp-c-bg);
    font: inherit;
}
.query {
    display: block;
    width: 100%;
    font-size: 1.1em;
}
.options {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px 20px;
    margin: 16px 0;
}
.options label {
    display: flex;
    gap: 8px;
    align-items: center;
}
.options .short {
    width: 7em;
}
.stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 12px;
}
.card {
    margin: 0;
    padding: 12px 16px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    background: var(--vp-c-bg-soft);
}
.card .label {
    color: var(--vp-c-text-2);
    font-size: 13px;
}
.card .value {
    font-weight: 600;
    overflow-wrap: anywhere;
}
.card .value.number {
    font-size: 24px;
}
.card.error {
    grid-column: 1 / -1;
    border-color: var(--vp-c-danger-1);
    color: var(--vp-c-danger-1);
}
.raw {
    margin-bottom: 16px;
}
.raw summary {
    cursor: pointer;
    color: var(--vp-c-text-2);
    font-size: 14px;
}
.raw pre {
    max-height: 18em;
    overflow: auto;
    margin: 8px 0 0;
    padding: 12px 16px;
    border-radius: 8px;
    background: var(--vp-c-bg-soft);
    font-size: 13px;
}
.text-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}
.text-header button {
    padding: 2px 10px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 6px;
}
.playground textarea {
    display: block;
    width: 100%;
}
.haystack {
    padding: 12px 16px;
    border-radius: 8px;
    background: var(--vp-c-bg-soft);
    white-space: pre-wrap;
    line-height: 1.7;
}
/* Any element inside the haystack is a match, whatever `el` and `cssClass` are. */
.haystack :deep(*) {
    background: var(--vp-c-yellow-soft);
    color: inherit;
    border-radius: 2px;
}
</style>
