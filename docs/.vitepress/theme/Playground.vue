<script setup lang="ts">
import { computed, ref } from 'vue';
import * as lucid from '../../../index';

const findFlavours = [
    'findMatches',
    'findMatchesHtml',
    'findMatchesNormalized',
    'findMatchesHtmlNormalized'
] as const;
const uncoverFlavours = [
    'uncoverMatches',
    'uncoverMatchesHtml',
    'uncoverMatchesNormalized',
    'uncoverMatchesHtmlNormalized'
] as const;
const flavours = [...findFlavours, ...uncoverFlavours];
type FindFlavour = (typeof findFlavours)[number];
type UncoverFlavour = (typeof uncoverFlavours)[number];

const haystack = ref('Thé quick brown <strong>føx</strong> jumps over the låzy <em>dog</em>');
const needle = ref('the fox dog strong');
const flavour = ref<FindFlavour | UncoverFlavour>('findMatchesHtmlNormalized');
const isUncover = (name: string): name is UncoverFlavour => name.startsWith('uncover');

// The uncover flavours take search terms, so the needle is split on commas for them.
const found = computed(() =>
    isUncover(flavour.value)
        ? lucid[flavour.value](haystack.value, needle.value.split(','))
        : lucid[flavour.value](haystack.value, needle.value)
);
const score = computed(() => lucid.score(found.value.matches, haystack.value).toFixed(2));
</script>

<template>
    <div class="playground">
        <label>
            Haystack
            <textarea v-model="haystack" rows="3" />
        </label>
        <label>
            {{ isUncover(flavour) ? 'Search terms (comma separated)' : 'Needle' }}
            <input v-model="needle" />
        </label>
        <label>
            Flavour
            <select v-model="flavour">
                <option v-for="name in flavours" :key="name" :value="name">{{ name }}</option>
            </select>
        </label>
        <!-- The haystack is your own input, so rendering the mark as HTML is safe here. -->
        <p class="mark" v-html="found.mark" />
        <p>
            <strong>matches:</strong> <code>{{ JSON.stringify(found.matches) }}</code>
            <strong>score:</strong> <code>{{ score }}</code>
        </p>
    </div>
</template>

<style scoped>
.playground label {
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
}
.playground textarea,
.playground input,
.playground select {
    display: block;
    width: 100%;
    margin-top: 4px;
    padding: 6px 8px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 6px;
    font-weight: 400;
}
.mark {
    padding: 12px;
    border-radius: 6px;
    background: var(--vp-c-bg-soft);
}
.mark :deep(.matched) {
    background: var(--vp-c-yellow-soft);
    border-radius: 2px;
}
</style>
