import { defineConfig } from 'vite-plus';
import type { UserConfig } from 'vite-plus';

// The badges are written by CI, unformatted.
const ignorePatterns = ['docs/.vitepress/cache/**', 'docs/.vitepress/dist/**', '.github/badges/**'];
const fileNames: Record<string, string> = { umd: 'lucid-search.js', cjs: 'lucid-search.cjs' };

const config: UserConfig = {
    fmt: {
        semi: true,
        singleQuote: true,
        printWidth: 100,
        trailingComma: 'none',
        tabWidth: 4,
        ignorePatterns
    },
    lint: {
        ignorePatterns,
        jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
        rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
        options: { typeAware: true, typeCheck: true }
    },
    check: {},
    pack: {
        entry: ['index.ts'],
        format: ['esm', 'cjs', 'umd'],
        globalName: 'lucidSearch',
        outDir: 'build',
        sourcemap: true,
        minify: true,
        target: 'es2020',
        platform: 'neutral',
        dts: { generator: 'oxc' },
        outputOptions: (options, format, ctx) => {
            const dtsName = ctx?.cjsDts ? 'index.d.cts' : 'index.d.ts';
            options.entryFileNames = (chunk) =>
                chunk.name?.endsWith('.d')
                    ? dtsName
                    : (fileNames[String(format)] ?? 'lucid-search.es.js');
            return options;
        }
    },
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary'],
            include: ['src/**/*.ts', 'index.ts'],
            thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 }
        }
    }
};

export default defineConfig(config) as UserConfig;
