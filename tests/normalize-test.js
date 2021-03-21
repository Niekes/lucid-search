import { test } from 'tape';
import normalize from '../src/examples/normalize';

test('Lucid finds the correct matches', (t) => {
    t.deepEquals(normalize('Thë dog barkß'), 'Th[eéêèëēė] d[oœöóõôòøō]g b[aæäåáàãâā]rk[sśšß]');
    t.end();
});
