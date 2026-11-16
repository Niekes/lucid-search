// Lucid vs mark.js in Chromium. Both end with highlighted DOM: lucid sets innerHTML to the
// output of highlight, mark.js highlights the element in place. Run with `pnpm bench:browser`.
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { scenarios } from './fixtures.ts';

const article = scenarios.find(({ name }) => name.startsWith('S2'));
const accents = scenarios.find(({ name }) => name.startsWith('S4'));
if (!article || !accents) throw new Error('S2 and S4 fixtures are missing');

const cases = [
    {
        name: 'S2 article: 10 kB, 3 terms',
        haystack: article.haystacks[0],
        needle: article.needle,
        diacritics: false
    },
    {
        name: 'S4 accents: 10 kB, 1 term',
        haystack: accents.haystacks[0],
        needle: accents.needle,
        diacritics: true
    }
];

const browser = await chromium.launch();
const page = await browser.newPage();
await page.addScriptTag({ path: 'build/lucid-search.js' });
await page.addScriptTag({
    path: createRequire(import.meta.url).resolve('mark.js/dist/mark.min.js')
});

for (const testCase of cases) {
    const result = await page.evaluate(({ name, haystack, needle, diacritics }) => {
        const el = document.createElement('div');
        document.body.append(el);
        const reset = () => (el.textContent = haystack);
        const runs: Record<string, () => void> = {
            'lucid-search': () => {
                const { search, highlight } = (window as any).lucidSearch;
                el.innerHTML = highlight(
                    haystack,
                    search(haystack, needle, { normalize: diacritics }).matches
                );
            },
            'mark.js': () => {
                reset();
                new (window as any).Mark(el).mark(needle, {
                    separateWordSearch: true,
                    diacritics,
                    accuracy: 'partially'
                });
            }
        };
        const texts = (selector: string) =>
            [...el.querySelectorAll(selector)].map((n) => n.textContent);
        runs['lucid-search']();
        const expected = JSON.stringify(texts('span.matched'));
        runs['mark.js']();
        const same = JSON.stringify(texts('mark')) === expected;

        // Warm up, then the median of 7 timed rounds of 1 s each.
        const opsPerSecond = (run: () => void) => {
            for (let i = 0; i < 50; i++) run();
            const rounds: number[] = [];
            for (let r = 0; r < 7; r++) {
                let n = 0;
                const start = performance.now();
                while (performance.now() - start < 1000) {
                    run();
                    n++;
                }
                rounds.push((n * 1000) / (performance.now() - start));
            }
            return rounds.sort((a, b) => a - b)[3];
        };
        const rows = Object.entries(runs).map(([library, run]) => ({
            library,
            opsPerSecond: Math.round(opsPerSecond(run))
        }));
        el.remove();
        return { name, same, rows };
    }, testCase);

    console.log(
        `\n${result.name}${result.same ? '' : '  (mark.js highlights different text, not comparable)'}`
    );
    for (const { library, opsPerSecond } of result.rows.sort(
        (a, b) => b.opsPerSecond - a.opsPerSecond
    )) {
        console.log(
            `  ${library.padEnd(14)} ${opsPerSecond.toLocaleString('en-US').padStart(9)} ops/s`
        );
    }
}
await browser.close();
