const ACCENT_GROUPS = [
    'aæäåáàãâāą',
    'cçčć',
    'dđď',
    'eéêèëēėę',
    'gğ',
    'iîïíīì',
    'lł',
    'nñńň',
    'oœöóõôòøō',
    'rř',
    'sśšß',
    'uüùúŭūûů',
    'yýÿ',
    'zžźż'
];

/**
 * Turns every letter that has accented variants into a regex character class of them.
 * One letter becomes one class, so match positions still line up with the haystack.
 */
export function normalize(term: string): string {
    return term.replace(/./g, (letter) => {
        const group = ACCENT_GROUPS.find((g) => g.includes(letter.toLowerCase()));
        return group ? `[${group}]` : letter;
    });
}
