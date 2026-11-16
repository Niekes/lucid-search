<script setup lang="ts">
import { computed, ref } from 'vue';
import { findRanges, score, toSegments } from '../../../index';

const haystack = ref('Thé quick brown føx jumps over the låzy dog in Łódź');
const query = ref('the fox dog lodz');
const normalize = ref(true);

const ranges = computed(() =>
    findRanges(haystack.value, query.value, { normalize: normalize.value })
);
const segments = computed(() => toSegments(haystack.value, ranges.value));
const rank = computed(() => score(haystack.value, ranges.value).toFixed(2));
</script>

<template>
    <div class="playground">
        <label>
            Haystack
            <textarea v-model="haystack" rows="3" />
        </label>
        <label>
            Query
            <input v-model="query" />
        </label>
        <label class="inline">
            <input v-model="normalize" type="checkbox" />
            Ignore accents (<code>normalize</code>)
        </label>
        <p class="segments">
            <template v-for="(segment, i) in segments" :key="i">
                <mark v-if="segment.match">{{ segment.text }}</mark>
                <template v-else>{{ segment.text }}</template>
            </template>
        </p>
        <p>
            <strong>ranges:</strong> <code>{{ JSON.stringify(ranges) }}</code>
            <strong>score:</strong> <code>{{ rank }}</code>
        </p>
    </div>
</template>

<style scoped>
.playground label {
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
}
.playground label.inline {
    display: flex;
    gap: 8px;
    align-items: center;
}
.playground textarea,
.playground input:not([type='checkbox']) {
    display: block;
    width: 100%;
    margin-top: 4px;
    padding: 6px 8px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 6px;
    font-weight: 400;
}
.segments {
    padding: 12px;
    border-radius: 6px;
    background: var(--vp-c-bg-soft);
    white-space: pre-wrap;
}
.segments mark {
    background: var(--vp-c-yellow-soft);
    color: inherit;
    border-radius: 2px;
}
</style>
