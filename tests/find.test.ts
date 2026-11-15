import {
    findMatches,
    findMatchesHtml,
    findMatchesNormalized,
    findMatchesHtmlNormalized,
    uncoverMatches,
    uncoverMatchesHtml,
    uncoverMatchesNormalized,
    uncoverMatchesHtmlNormalized,
    score
} from '../index';

it('Lucid finds the correct matches', () => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needle = 'The dog barks';
    const found = findMatches(haystack, needle);

    expect(found.matches).toEqual(['The', 'the', 'dog']);
});

it('Lucid finds the correct matches in long english texts', () => {
    const haystack = `Her companions instrument set estimating sex remarkably solicitude motionless. Property men the why smallest graceful day insisted required. Inquiry justice country old placing sitting any ten age. Looking venture justice in evident in totally he do ability. Be is lose girl long of up give. Trifling wondered unpacked ye at he. In household certainty an on tolerably smallness difficult. Many no each like up be is next neat. Put not enjoyment behaviour her supposing. At he pulled object others.
Stronger unpacked felicity to of mistaken. Fanny at wrong table ye in. Be on easily cannot innate in lasted months on. Differed and and felicity steepest mrs age outweigh. Opinions learning likewise daughter now age outweigh. Raptures stanhill my greatest mistaken or exercise he on although. Discourse otherwise disposing as it of strangers forfeited deficient
Impossible considered invitation him men instrument saw celebrated unpleasant. Put rest and must set kind next many near nay. He exquisite continued explained middleton am. Voice hours young woody has she think equal. Estate moment he at on wonder at season little. Six garden result summer set family esteem nay estate. End admiration mrs unreserved discovered comparison especially invitation.
Delightful remarkably mr on announcing themselves entreaties favourable. About to in so terms voice at. Equal an would is found seems of. The particular friendship one sufficient terminated frequently themselves. It more shed went up is roof if loud case. Delay music in lived noise an. Beyond genius really enough passed is up.
Maids table how learn drift but purse stand yet set. Music me house could among oh as their. Piqued our sister shy nature almost his wicket. Hand dear so we hour to. He we be hastily offence effects he service. Sympathize it projection ye insipidity celebrated my pianoforte indulgence. Point his truth put style. Elegance exercise as laughing proposal mistaken if. We up precaution an it solicitude acceptance invitation.
Admiration we surrounded possession frequently he. Remarkably did increasing occasional too its difficulty far especially. Known tiled but sorry joy balls. Bed sudden manner indeed fat now feebly. Face do with in need of wife paid that be. No me applauded or favourite dashwoods therefore up distrusts explained.
Affronting everything discretion men now own did. Still round match we to. Frankness pronounce daughters remainder extensive has but. Happiness cordially one determine concluded fat. Plenty season beyond by hardly giving of. Consulted or acuteness dejection an smallness if. Outward general passage another as it. Very his are come man walk one next. Delighted prevailed supported too not remainder perpetual who furnished. Nay affronting bed projection compliment instrument.
Its sometimes her behaviour are contented. Do listening am eagerness oh objection collected. Together gay feelings continue juvenile had off one. Unknown may service subject her letters one bed. Child years noise ye in forty. Loud in this in both hold. My entrance me is disposal bachelor remember relation.
By spite about do of do allow blush. Additions in conveying or collected objection in. Suffer few desire wonder her object hardly nearer. Abroad no chatty others my silent an. Fat way appear denote who wholly narrow gay settle. Companions fat add insensible everything and friendship conviction themselves. Theirs months ten had add narrow own.
Perhaps far exposed age effects. Now distrusts you her delivered applauded affection out sincerity. As tolerably recommend shameless unfeeling he objection consisted. She although cheerful perceive screened throwing met not eat distance. Viewing hastily or written dearest elderly up weather it as. So direction so sweetness or extremity at daughters. Provided put unpacked now but bringing.`;

    const needle = 'prevailed match keyboard did';
    const found = findMatches(haystack, needle);

    expect(found.matches).toEqual(['prevailed', 'match', 'did', 'did']);
});

it('Lucid handles empty strings correctly', () => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needle = '     The       dog      barks      ';
    const found1 = findMatches(haystack, needle);
    const found2 = findMatches(haystack, '    ');

    expect(found1.matches).toEqual(['The', 'the', 'dog']);
    expect(found2.matches).toEqual([]);
});

it('Lucid finds the correct emojis', () => {
    const haystack = '😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎';
    const needle = '😎';
    const found = findMatches(haystack, needle);

    expect(found.matches).toEqual(['😎']);
});

it('Lucid highlights correctly', () => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needle = 'The dog barks';
    const found = findMatches(haystack, needle);

    expect(found.mark).toBe(
        '<span class="matched">The</span> quick brown fox jumps over <span class="matched">the</span> lazy <span class="matched">dog</span>'
    );
});

it('Lucid finds every casing of a short search term', () => {
    const haystack = 'Emmerich, Wyman and Sanford';
    const needle = 'emmerich e';
    const found = findMatches(haystack, needle);

    expect(found.matches).toEqual(['Emmerich', 'E', 'e']);
    expect(found.mark).toBe('<span class="matched">Emmerich</span>, Wyman and Sanford');
});

it('Lucid highlights correctly with options', () => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needle = 'The dog barks';
    const options = { el: 'mark', cssClass: 'found' };
    const found = findMatches(haystack, needle, options);

    expect(found.mark).toBe(
        '<mark class="found">The</mark> quick brown fox jumps over <mark class="found">the</mark> lazy <mark class="found">dog</mark>'
    );
});

it('Lucid finds the correct matches in HTML string', () => {
    const haystack = 'The quick brown <strong>fox</strong> jumps over the lazy <div>dog</div>';
    const needle = 'The dog strong div';
    const found = findMatchesHtml(haystack, needle);

    expect(found.matches).toEqual(['The', 'the', 'dog']);
});

it('Lucid highlights HTML strings correctly', () => {
    const haystack = 'The quick brown <strong>fox</strong> jumps over the lazy <div>dog</div>';
    const needle = 'The dog strong div';
    const found = findMatchesHtml(haystack, needle);

    expect(found.mark).toBe(
        '<span class="matched">The</span> quick brown <strong>fox</strong> jumps over <span class="matched">the</span> lazy <div><span class="matched">dog</span></div>'
    );
});

it('Lucid highlights nested HTML strings correctly', () => {
    const haystack =
        'The quick brown <strong>fox</strong> jumps over the lazy <div><nav><strong>dog</strong></nav></div>';
    const needle = 'The dog strong div nav';
    const found = findMatchesHtml(haystack, needle);

    expect(found.mark).toBe(
        '<span class="matched">The</span> quick brown <strong>fox</strong> jumps over <span class="matched">the</span> lazy <div><nav><strong><span class="matched">dog</span></strong></nav></div>'
    );
});

it('Lucid finds the correct matches with special characters like äöüè', () => {
    const haystack = 'Thé quīçk brown føx jümps over the låzy dog';
    const needle = 'Thë dog barkß';
    const found = findMatchesNormalized(haystack, needle);

    expect(found.matches).toEqual(['Thé', 'the', 'dog']);
});

it('Lucid highlights HTML strings correctly with special characters like äöüè', () => {
    const haystack = 'Thé quīçk brown <strong>føx</strong> jümps over the låzy <div>dog</div>';
    const needle = 'The dog strong div';
    const found = findMatchesHtmlNormalized(haystack, needle);

    expect(found.matches).toEqual(['Thé', 'the', 'dog']);
    expect(found.mark).toBe(
        '<span class="matched">Thé</span> quīçk brown <strong>føx</strong> jümps over <span class="matched">the</span> låzy <div><span class="matched">dog</span></div>'
    );
});

it('Lucid finds the correct matches when search terms are passed as an array', () => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const searchTerms = ['The', 'dog', 'barks'];
    const found = uncoverMatches(haystack, searchTerms);

    expect(found.matches).toEqual(['The', 'the', 'dog']);
});

it('Lucid highlights correctly when search terms are passed as an array', () => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const searchTerms = ['fox jumps'];
    const found = uncoverMatches(haystack, searchTerms);

    expect(found.mark).toBe(
        'The quick brown <span class="matched">fox jumps</span> over the lazy dog'
    );
});

it('Lucid scores words closer to the beginning higher', () => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needle1 = 'quick';
    const needle2 = 'jumps';
    const found1 = findMatches(haystack, needle1);
    const found2 = findMatches(haystack, needle2);

    expect(score(found1.matches, haystack) > score(found2.matches, haystack)).toBe(true);
});

it('Lucid scores long matches higher than short ones', () => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needle1 = 'fox';
    const needle2 = 'jumps';
    const found1 = findMatches(haystack, needle1);
    const found2 = findMatches(haystack, needle2);

    expect(score(found1.matches) < score(found2.matches)).toBe(true);
});

it('Lucid treats regex characters in the needle as plain text', () => {
    const found = findMatches('f(x) = a*b + [c]', '(x) a*b [c] +');

    expect(found.matches).toEqual(['(x)', 'a*b', '[c]', '+']);
    expect(found.mark).toBe(
        'f<span class="matched">(x)</span> = <span class="matched">a*b</span> <span class="matched">+</span> <span class="matched">[c]</span>'
    );
});

it('Lucid marks the longest match when search terms overlap', () => {
    const found = findMatches('Emmerich', 'e emmerich');

    expect(found.mark).toBe('<span class="matched">Emmerich</span>');
});

it('Lucid normalizes search terms passed as an array', () => {
    const found = uncoverMatchesNormalized('Thé quick dög', ['the', 'dog']);

    expect(found.matches).toEqual(['Thé', 'dög']);
});

it('Lucid normalizes search terms passed as an array in HTML strings', () => {
    const found = uncoverMatchesHtmlNormalized('<b class="dog">Thé</b> dög', ['the', 'dog']);

    expect(found.mark).toBe(
        '<b class="dog"><span class="matched">Thé</span></b> <span class="matched">dög</span>'
    );
});

it('Lucid skips tags for search terms passed as an array in HTML strings', () => {
    const found = uncoverMatchesHtml('<div title="fox">brown fox</div>', ['brown fox', 'div']);

    expect(found.mark).toBe('<div title="fox"><span class="matched">brown fox</span></div>');
});

it('Lucid keeps matches that contain a comma whole', () => {
    const found = uncoverMatches('Hello, world', ['o, w']);

    expect(found.matches).toEqual(['o, w']);
    expect(found.mark).toBe('Hell<span class="matched">o, w</span>orld');
});

it('Lucid ignores empty search terms passed as an array', () => {
    expect(uncoverMatches('abc', ['', 'b']).mark).toBe('a<span class="matched">b</span>c');
});

it('Lucid fills in options that were left out with the defaults', () => {
    expect(findMatches('lazy dog', 'dog', { el: 'mark' }).mark).toBe(
        'lazy <mark class="matched">dog</mark>'
    );
});

it('Lucid searches long HTML strings without tags quickly', () => {
    const haystack = 'the lazy dog '.repeat(40_000);
    const start = performance.now();
    const found = findMatchesHtml(haystack, 'dog');

    expect(performance.now() - start).toBeLessThan(1000);
    expect(found.matches).toHaveLength(40_000);
});

it('Lucid finds matches before a lone > in HTML strings', () => {
    const found = findMatchesHtml('the dog > 0', 'the dog');

    expect(found.matches).toEqual(['the', 'dog']);
});

it('Lucid treats a < without its own > as text in HTML strings', () => {
    const found = findMatchesHtml('if a <b and c <i>the</i>', 'and i');

    expect(found.mark).toBe(
        '<span class="matched">i</span>f a <b <span class="matched">and</span> c <i>the</i>'
    );
});
