// Min + gzip size of what a user bundles for the import below. Run with `pnpm bench:size`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { build } from 'vite-plus';

const imports: Record<string, string> = {
    'lucid-search': "export { findMatches } from '../../../index.ts';",
    'highlight-words-core': "export { findAll } from 'highlight-words-core';",
    'highlight-words': "export { default } from 'highlight-words';",
    spotmark: "export { createHighlighter } from 'spotmark';",
    'accent-folding': "export { default } from 'accent-folding';",
    'mark.js': "export { default } from 'mark.js';"
};

// Entries live under node_modules so the packages resolve from there.
const dir = 'node_modules/.cache/size';
mkdirSync(dir, { recursive: true });

const rows: [string, number, number][] = [];
for (const [library, code] of Object.entries(imports)) {
    const entry = `${dir}/${library}.js`;
    writeFileSync(entry, code);
    const output = await build({
        logLevel: 'silent',
        configFile: false,
        build: { write: false, minify: true, lib: { entry, formats: ['es'], fileName: 'out' } }
    });
    const chunks = (Array.isArray(output) ? output : [output]).flatMap((o) =>
        'output' in o ? o.output : []
    );
    const js = chunks.map((c) => ('code' in c ? c.code : '')).join('');
    rows.push([library, Buffer.byteLength(js), gzipSync(js).length]);
}
for (const [library, min, gz] of rows.sort((a, b) => a[2] - b[2])) {
    console.log(
        `${library.padEnd(22)} ${(min / 1024).toFixed(1).padStart(6)} kB min  ${(gz / 1024).toFixed(1).padStart(5)} kB gzip`
    );
}
