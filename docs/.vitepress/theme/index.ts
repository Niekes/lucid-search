import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import Playground from './Playground.vue';
import Benchmark from './Benchmark.vue';

const theme: Theme = {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component('Playground', Playground);
        app.component('Benchmark', Benchmark);
    }
};

export default theme;
