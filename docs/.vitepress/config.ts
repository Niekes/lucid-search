import { defineConfig } from 'vitepress';
import type { UserConfig } from 'vitepress';

const config: UserConfig = defineConfig({
    title: 'lucid-search',
    description: 'Highlight text and find matches. Zero dependencies.',
    base: '/lucid-search/',
    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/getting-started' },
            { text: 'API', link: '/api/' },
            { text: 'Playground', link: '/playground' }
        ],
        sidebar: [
            {
                text: 'Guide',
                items: [
                    { text: 'Getting started', link: '/guide/getting-started' },
                    { text: 'Migrating from v1', link: '/guide/migration' }
                ]
            },
            { text: 'API', items: [{ text: 'Reference', link: '/api/' }] },
            { text: 'Playground', link: '/playground' }
        ],
        socialLinks: [{ icon: 'github', link: 'https://github.com/niekes/lucid-search' }],
        search: { provider: 'local' },
        footer: {
            message: 'Released under the BSD-3-Clause License.',
            copyright: 'Copyright © 2018-present Stefan Nieke'
        }
    }
});

export default config;
