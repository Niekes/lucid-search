const defaultOptions = { el: 'span', cssClass: 'matched' };

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

function find(haystack, needles, options, matchFn) {
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
        .map(n => haystack.match(matchFn(n)))
        .filter(n => n !== null)
        .join('|').replace(/,/gi, '|');

    newHaystack = newHaystack.replace(
        matchFn(matches),
        s => `<${el} class="${cssClass}">${s}</${el}>`,
    );

    return {
        matches: matches.split('|'),
        mark: matches.length > 0
            ? newHaystack
            : haystack,
    };
}

export function findMatches(haystack, needle, options = defaultOptions) {
    const needles = splitNeedle(needle);

    return find(haystack, needles, options, match);
}

export function findMatchesHtml(haystack, needle, options = defaultOptions) {
    const needles = splitNeedle(needle);

    return find(haystack, needles, options, matchHtml);
}

export function findMatchesNormalized(haystack, needle, options = defaultOptions) {
    const needles = splitNeedle(normalize(needle));

    return find(haystack, needles, options, match);
}

export function findMatchesHtmlNormalized(haystack, needle, options = defaultOptions) {
    const needles = splitNeedle(normalize(needle));

    return find(haystack, needles, options, matchHtml);
}
