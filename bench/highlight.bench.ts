import { test } from 'vite-plus/test';
import { contenders } from './adapters';
import { scenarios } from './fixtures';

for (const scenario of scenarios) {
    test(scenario.name, async ({ bench }) => {
        const { same, skipped } = contenders(scenario);
        for (const library of skipped)
            console.warn(`[${scenario.name}] ${library} skipped: highlights different text`);
        const registrations = same.map(([library, adapter]) =>
            bench(library, () => {
                for (const haystack of scenario.haystacks) adapter(haystack, scenario.query);
            })
        );
        await bench.compare(...registrations);
    });
}
