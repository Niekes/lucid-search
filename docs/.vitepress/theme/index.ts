import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import Playground from './Playground.vue';

const theme: Theme = {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component('Playground', Playground);
    }
};

export default theme;
