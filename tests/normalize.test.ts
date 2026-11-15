import { normalize } from '../index';

it('normalize turns every letter with accented variants into a character class', () => {
    expect(normalize('Thë dog barkß')).toBe('Th[eéêèëēė] d[oœöóõôòøō]g b[aæäåáàãâā]rk[sśšß]');
});
