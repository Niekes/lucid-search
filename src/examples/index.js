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
    let j = needles.length;
    let mark = haystack;
    const matches = [];

    // eslint-disable-next-line no-plusplus
    while (j--) {
        const m = haystack.match(matchFn(needles[j]));

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
