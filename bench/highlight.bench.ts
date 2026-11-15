import { test } from 'vite-plus/test';
import { accents, highlighted, plain } from './adapters';
import { scenarios } from './fixtures';

for (const { name, haystacks, needle } of scenarios) {
    const adapters = name.startsWith('S4') ? accents : plain;
    const expected = JSON.stringify(
        haystacks.map((h) => highlighted(adapters['lucid-search'](h, needle)))
    );

    test(name, async ({ bench }) => {
        const registrations = Object.entries(adapters)
            // Only libraries that highlight exactly the same text take part.
            .filter(([library, adapter]) => {
                const same =
                    JSON.stringify(haystacks.map((h) => highlighted(adapter(h, needle)))) ===
                    expected;
                if (!same) console.warn(`[${name}] ${library} skipped: highlights different text`);
                return same;
            })
            .map(([library, adapter]) =>
                bench(library, () => {
                    for (const haystack of haystacks) adapter(haystack, needle);
                })
            );
        await bench.compare(...registrations);
    });
}
