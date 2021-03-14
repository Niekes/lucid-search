module.exports = {
    title: 'Lucid search',
    name: 'lucid-search',
    status: 'ready',
    context: {
        method: 'findMatches',
        haystack: 'The quick brown fox jumps over the lazy dog',
        cssStyle: `
#haystack {
    color: #aaa;
    font-size: 1.5rem;
    font-style: italic;
    padding: 2rem;
    text-align: center;
}

#needle {
    margin: 0 auto;
    max-width: 50%;
    padding: 1rem;
    width: 50%;
}

#result {
    color: #000;
    padding: 0.5rem;
    text-align: center;
}

.matched {
    color: #000;
}`,
    },
    variants: [
        {
            name: 'special characters and umlaute',
            context: {
                haystack: 'Thé quīçk brown føx jümps over the låzy dog',
                method: 'findMatchesNormalized',
                cssStyle: `
#haystack {
    color: #aaa;
    font-size: 1.5rem;
    font-style: italic;
    padding: 2rem;
    text-align: center;
}

#needle {
    margin: 0 auto;
    max-width: 50%;
    padding: 1rem;
    width: 50%;
}

#result {
    color: #000;
    padding: 0.5rem;
    text-align: center;
}

.matched {
    color: #000;
}`,
            },
        },
        {
            name: 'Html string',
            context: {
                method: 'findMatchesHtml',
                haystack: 'The quick brown <strong>fox</strong> jumps over the lazy <strong>dog</strong>',
                cssStyle: `
#haystack {
    color: #aaa;
    font-size: 1.5rem;
    font-style: italic;
    padding: 2rem;
    text-align: center;
}

#needle {
    margin: 0 auto;
    max-width: 50%;
    padding: 1rem;
    width: 50%;
}

#result {
    color: #000;
    padding: 0.5rem;
    text-align: center;
}

.matched {
    color: #000;
}`,
            },
        },
        {

            name: 'special characters and umlaute inside html strings',
            context: {
                method: 'findMatchesHtmlNormalized',
                haystack: 'Thé quīçk brown <strong>føx</strong> jümps over the låzy <strong>dog</strong>',
                cssStyle: `
#haystack {
    color: #aaa;
    font-size: 1.5rem;
    font-style: italic;
    padding: 2rem;
    text-align: center;
}

#needle {
    margin: 0 auto;
    max-width: 50%;
    padding: 1rem;
    width: 50%;
}

#result {
    color: #000;
    padding: 0.5rem;
    text-align: center;
}

.matched {
    color: #000;
}`,
            },

        },
    ],
};
