const ACCENT_GROUPS = [
    'aæäåáàãâāą', 'cçčć', 'dđď', 'eéêèëēėę', 'gğ', 'iîïíīì', 'lł',
    'nñńň', 'oœöóõôòøō', 'rř', 'sśšß', 'uüùúŭūûů', 'yýÿ', 'zžźż',
];

const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Each letter becomes a one-character class, so Match positions still line up with the Haystack.
const normalize = pattern => pattern.replace(/./g, (c) => {
    const group = ACCENT_GROUPS.find(g => g.includes(c.toLowerCase()));
    return group ? `[${group}]` : c;
});

function toTerms(needle) {
    if (typeof needle === 'string') {
        return needle.split(/[.\-_\s]+/).filter(Boolean);
    }
    if (Array.isArray(needle) && needle.every(t => typeof t === 'string')) {
        return needle.filter(t => t.trim());
    }
    throw new TypeError('needle must be a string or an array of strings');
}

export function search(haystack, needle, { normalize: fold = false } = {}) {
    if (typeof haystack !== 'string') {
        throw new TypeError('haystack must be a string');
    }
    const terms = [...new Set(toTerms(needle))];
    if (!terms.length) {
        return { matches: [], missing: [] };
    }

    const pattern = t => (fold ? normalize(escapeRegExp(t)) : escapeRegExp(t));
    // Longest Term first, so it wins when two Terms match at the same position.
    const byLength = [...terms].sort((a, b) => b.length - a.length);
    const matches = [...haystack.matchAll(new RegExp(byLength.map(t => `(${pattern(t)})`).join('|'), 'gi'))]
        .map(m => ({
            start: m.index,
            end: m.index + m[0].length,
            text: m[0],
            term: byLength[m.slice(1).findIndex(g => g !== undefined)],
        }));
    const missing = terms.filter(t => !new RegExp(pattern(t), 'i').test(haystack));

    return { matches, missing };
}

const HTML_ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = s => s.replace(/[&<>"']/g, c => HTML_ENTITIES[c]);

// matches must be sorted and non-overlapping, as search returns them.
export function highlight(haystack, matches, { el = 'span', cssClass = 'matched' } = {}) {
    if (!/^[a-z][a-z0-9-]*$/i.test(el) || /["<>]/.test(cssClass)) {
        throw new TypeError('el must be a tag name and cssClass must not contain " < or >');
    }
    let html = '';
    let cursor = 0;
    matches.forEach(({ start, end }) => {
        html += `${escapeHtml(haystack.slice(cursor, start))}<${el} class="${cssClass}">${escapeHtml(haystack.slice(start, end))}</${el}>`;
        cursor = end;
    });
    return html + escapeHtml(haystack.slice(cursor));
}

export function score(matches, haystack) {
    const firstStart = new Map();
    matches.forEach(({ text, start }) => {
        if (!firstStart.has(text)) firstStart.set(text, start);
    });
    const { length } = haystack;
    return [...firstStart].reduce((sum, [text, start]) => sum + text.length * ((length - start) / length + 1), 0);
}
