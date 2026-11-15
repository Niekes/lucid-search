import { normalize } from '../index';

it('normalize turns every letter with accented variants into a character class', () => {
    expect(normalize('Thë dog barkß')).toBe(
        'Th[eéêèëēėę] [dđď][oœöóõôòøō][gğ] b[aæäåáàãâāą][rř]k[sśšß]'
    );
});
