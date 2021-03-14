const defaultOptions = { el: 'span', cssClass: 'matched' };

function splitNeedle(needle) {
    return needle
        .split(/[.\-_\s]/)
        .filter(n => n !== '');
}

function normalize(string) {
    return string
        .replace(/a|æ|ä|å|á|à|ã|â|ā/gi, '[aæäåáàãâā]')
        .replace(/c|ç|č|ć/gi, '[cçčć]')
        .replace(/e|é|ê|è|ë|ē|ė/gi, '[eéêèëēė]')
        .replace(/i|î|ï|í|ī|ì/gi, '[iîïíīì]')
        .replace(/o|œ|ö|ó|õ|ô|ò|ø|ō/gi, '[oœöóõôòøō]')
        .replace(/s|ś|š|ß/gi, '[sśšß]')
        .replace(/u|ü|ù|ú|ŭ|ū|û/gi, '[uüùúŭūû]');
}

function findHTML(haystack, needles, options) {
    if (!needles.length) {
        return {
            matches: [],
            mark: haystack,
        };
    }

    let newHaystack = haystack;

    const {
        el,
        cssClass,
    } = options;

    const matches = needles
        .map(n => haystack.match(new RegExp(`(${n})(?!([^<]+)?>)`, 'gi')))
        .filter(n => n !== null)
        .join('|').replace(/,/gi, '|');

    newHaystack = newHaystack.replace(
        new RegExp(
            `(${matches})(?!([^<]+)?>)`, 'gi',
        ),
        s => `<${el} class="${cssClass}">${s}</${el}>`,
    );

    return {
        matches: matches.split('|'),
        mark: matches.length > 0
            ? newHaystack
            : haystack,
    };
}

function find(haystack, needles, options) {
    if (!needles.length) {
        return {
            matches: [],
            mark: haystack,
        };
    }

    let newHaystack = haystack;

    const {
        el,
        cssClass,
    } = options;

    const matches = needles
        .map(n => haystack.match(new RegExp(n, 'gi')))
        .filter(n => n !== null)
        .join('|').replace(/,/gi, '|');

    newHaystack = newHaystack.replace(
        new RegExp(matches, 'gi'),
        s => `<${el} class="${cssClass}">${s}</${el}>`,
    );

    return {
        matches: matches.split('|'),
        mark: matches.length > 0
            ? newHaystack
            : haystack,
    };
}

export function findMatchesNormalized(haystack, needle, options = defaultOptions) {
    const needles = splitNeedle(normalize(needle));

    return find(haystack, needles, options);
}

export function findMatchesHtmlNormalized(haystack, needle, options = defaultOptions) {
    const needles = splitNeedle(normalize(needle));

    return findHTML(haystack, needles, options);
}

export function findMatchesHtml(haystack, needle, options = defaultOptions) {
    const needles = splitNeedle(needle);

    return findHTML(haystack, needles, options);
}

export function findMatches(haystack, needle, options = defaultOptions) {
    const needles = splitNeedle(needle);

    return find(haystack, needles, options);
}
