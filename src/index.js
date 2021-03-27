import normalize from './normalize';

const defaultOptions = {
    cssClass: 'matched',
    el: 'span',
};

function matchHtml(n) {
    return new RegExp(`(${n})(?!([^<]+)?>)`, 'gi');
}

function match(n) {
    return new RegExp(n, 'gi');
}

function splitNeedle(needle) {
    return needle
        .split(/[.\-_\s]/)
        .filter(n => n !== '');
}

function find(haystack, needles, options, matchFn) {
    if (!needles.length) {
        return {
            matches: [],
            mark: haystack,
        };
    }

    /*
        Options
    */
    const {
        el,
        cssClass,
    } = options;

    /*
        Find matches
    */
    let mark = haystack;
    const matches = [];

    for (let i = 0; i < needles.length; i += 1) {
        const m = haystack.match(matchFn(needles[i]));

        if (m) {
            matches.push(m);
        }
    }

    if (!matches.length) {
        return {
            matches: [],
            mark: haystack,
        };
    }

    const matched = matches.join('|').replace(/,/gi, '|');
    const matchedSplit = matched.split('|');

    /*
        Mark matches
    */
    mark = mark.replace(
        matchFn(matched),
        s => `<${el} class="${cssClass}">${s}</${el}>`,
    );

    return {
        matches: matchedSplit,
        mark: matches.length > 0
            ? mark
            : haystack,
    };
}

/* default */
export function findMatches(haystack, needle, options = defaultOptions) {
    return find(haystack, splitNeedle(needle), options, match);
}
export function findMatchesHtml(haystack, needle, options = defaultOptions) {
    return find(haystack, splitNeedle(needle), options, matchHtml);
}
export function findMatchesNormalized(haystack, needle, options = defaultOptions) {
    return find(haystack, splitNeedle(normalize(needle)), options, match);
}
export function findMatchesHtmlNormalized(haystack, needle, options = defaultOptions) {
    return find(haystack, splitNeedle(normalize(needle)), options, matchHtml);
}
/* custom splitting */
export function uncoverMatches(haystack, needles, options = defaultOptions) {
    return find(haystack, needles, options, match);
}
export function uncoverMatchesHtml(haystack, needles, options = defaultOptions) {
    return find(haystack, needles, options, matchHtml);
}
export function uncoverMatchesNormalized(haystack, needles, options = defaultOptions) {
    return find(haystack, needles, options, match);
}
export function uncoverMatchesHtmlNormalized(haystack, needles, options = defaultOptions) {
    return find(haystack, needles, options, matchHtml);
}
/* score */
export function score(matches, haystack = '') {
    return Array.from(new Set(matches))
        .reduce((sum, m) => {
            const index = haystack.indexOf(m);
            const { length } = haystack;
            const weight = index !== -1 && length
                ? ((length - index) / length) + 1
                : 1;

            return sum + m.length * weight;
        }, 0);
}
