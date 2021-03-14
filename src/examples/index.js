const defaultOptions = { el: 'span', cssClass: 'matched' };
const split = /[.\-_\s]/;

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
    let newHaystack = haystack;

    const {
        el,
        cssClass,
    } = options;

    const matches = needles.map((n) => {
        if (!n) return null;
        return haystack.match(new RegExp(`(${n})(?!([^<]+)?>)`, 'gi'));
    }).flat().filter(d => d !== null);

    newHaystack = newHaystack.replace(
        new RegExp(
            `(${matches.join('|')})(?!([^<]+)?>)`, 'gi',
        ),
        s => `<${el} class="${cssClass}">${s}</${el}>`,
    );

    return {
        matches,
        mark: matches.length > 0
            ? newHaystack
            : haystack,
    };
}

function find(haystack, needles, options) {
    let newHaystack = haystack;

    const {
        el,
        cssClass,
    } = options;

    const matches = needles.map((n) => {
        if (!n) return null;
        return haystack.match(new RegExp(n, 'gi'));
    }).flat().filter(d => d !== null);

    newHaystack = newHaystack.replace(
        new RegExp(matches.join('|'), 'gi'),
        s => `<${el} class="${cssClass}">${s}</${el}>`,
    );

    return {
        matches,
        mark: matches.length > 0
            ? newHaystack
            : haystack,
    };
}

export function findMatchesNormalized(haystack, needle, options = defaultOptions) {
    const needles = normalize(needle).split(split);

    return find(haystack, needles, options);
}

export function findMatchesHtmlNormalized(haystack, needle, options = defaultOptions) {
    const needles = normalize(needle).split(split);

    return findHTML(haystack, needles, options);
}

export function findMatchesHtml(haystack, needle, options = defaultOptions) {
    const needles = needle.split(split);

    return findHTML(haystack, needles, options);
}

export function findMatches(haystack, needle, options = defaultOptions) {
    const needles = needle.split(split);

    return find(haystack, needles, options);
}
