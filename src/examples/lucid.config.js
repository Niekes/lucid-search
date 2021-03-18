module.exports = {
    title: 'Lucid search',
    name: 'lucid-search',
    status: 'ready',
    context: {
        method: 'findMatches',
        example0: true,
        example1: false,
        example2: false,
        haystack: 'The quick brown fox jumps over the lazy dog',
    },
    variants: [
        {
            name: 'special characters and umlaute',
            context: {
                haystack: 'Thé quīçk brown føx jümps over the låzy dog',
                method: 'findMatchesNormalized',
            },
        },
        {
            name: 'Html string',
            context: {
                method: 'findMatchesHtml',
                haystack: 'The quick brown <strong>fox</strong> jumps over the lazy <strong>dog</strong>',
            },
        },
        {

            name: 'special characters and umlaute inside html strings',
            context: {
                method: 'findMatchesHtmlNormalized',
                haystack: 'Thé quīçk brown <strong>føx</strong> jümps over the låzy <strong>dog</strong>',
            },

        },
        {

            name: 'Autocomplete suggestions',
            context: {
                example0: false,
                example1: false,
                example2: true,
                method: 'findMatches',
            },
        },
        {

            name: 'Custom needle split',
            context: {
                example0: false,
                example1: true,
                example2: false,
                method: 'uncoverMatches',
                haystack: 'The quick brown fox jumps over the lazy dog',
            },
        },
    ],
};
