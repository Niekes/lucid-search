<script setup lang="ts">
import { ref } from 'vue';

interface Row {
    library: string;
    opsPerSecond: number;
}
interface Result {
    name: string;
    rows: Row[];
    skipped: string[];
}

const results = ref<Result[]>([]);
const status = ref('');
const running = ref(false);

// Yields to the browser between rounds, so the page stays responsive and can repaint.
const idle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

// Warm up, then the median of 5 rounds of 200 ms each.
async function opsPerSecond(run: () => void): Promise<number> {
    for (let i = 0; i < 20; i++) run();
    const rounds: number[] = [];
    for (let r = 0; r < 5; r++) {
        await idle();
        const end = performance.now() + 200;
        let n = 0;
        for (; performance.now() < end; n++) run();
        rounds.push(n * 5);
    }
    return rounds.sort((a, b) => a - b)[2];
}

async function start(): Promise<void> {
    running.value = true;
    results.value = [];
    // Loaded on demand: the libraries and the generated texts are only needed for a run.
    const [{ contenders }, { scenarios }] = await Promise.all([
        import('../../../bench/adapters'),
        import('../../../bench/fixtures')
    ]);
    for (const scenario of scenarios) {
        const { same, skipped } = contenders(scenario);
        const result: Result = { name: scenario.name, rows: [], skipped };
        results.value.push(result);
        for (const [library, adapter] of same) {
            status.value = `${scenario.name}: ${library}`;
            const opsPerSecondValue = await opsPerSecond(() => {
                for (const haystack of scenario.haystacks) adapter(haystack, scenario.query);
            });
            result.rows.push({ library, opsPerSecond: Math.round(opsPerSecondValue) });
            result.rows.sort((a, b) => b.opsPerSecond - a.opsPerSecond);
            results.value = [...results.value];
        }
    }
    status.value = 'Done.';
    running.value = false;
}

const width = (row: Row, rows: Row[]): string =>
    `${(row.opsPerSecond / rows[0].opsPerSecond) * 100}%`;
</script>

<template>
    <div class="benchmark">
        <button type="button" :disabled="running" @click="start">
            {{ running ? 'Running…' : results.length ? 'Run again' : 'Run the benchmark' }}
        </button>
        <p class="status" aria-live="polite">{{ status }}</p>
        <section v-for="result in results" :key="result.name">
            <h3>{{ result.name }}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Library</th>
                        <th class="ops">ops/s</th>
                        <th class="bar-cell" aria-hidden="true"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="row in result.rows"
                        :key="row.library"
                        :class="{ lucid: row.library.startsWith('lucid-search') }"
                    >
                        <td>{{ row.library }}</td>
                        <td class="ops">{{ row.opsPerSecond.toLocaleString('en-US') }}</td>
                        <td class="bar-cell" aria-hidden="true">
                            <span class="bar" :style="{ width: width(row, result.rows) }" />
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-if="result.skipped.length" class="skipped">
                Left out, highlights different text: {{ result.skipped.join(', ') }}
            </p>
        </section>
    </div>
</template>

<style scoped>
.benchmark button {
    padding: 8px 16px;
    border-radius: 6px;
    background: var(--vp-c-brand-1);
    color: var(--vp-c-white);
    font-weight: 600;
}
.benchmark button:disabled {
    opacity: 0.6;
    cursor: progress;
}
.status,
.skipped {
    color: var(--vp-c-text-2);
    font-size: 14px;
}
.benchmark table {
    display: table;
    width: 100%;
    table-layout: fixed;
}
.ops {
    text-align: right;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}
.bar-cell {
    width: 40%;
}
.bar {
    display: block;
    height: 10px;
    border-radius: 0 4px 4px 0;
    background: var(--vp-c-gray-1);
}
.lucid td {
    font-weight: 600;
}
.lucid .bar {
    background: var(--vp-c-brand-1);
}
</style>
