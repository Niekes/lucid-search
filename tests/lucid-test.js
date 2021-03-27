import { test } from 'tape';
import {
    findMatches,
    findMatchesHtml,
    findMatchesNormalized,
    findMatchesHtmlNormalized,
    uncoverMatches,
    score,
} from '../src/index';

test('Lucid finds the correct matches', (t) => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needle = 'The dog barks';
    const found = findMatches(haystack, needle);

    t.deepEquals(found.matches, ['The', 'the', 'dog']);
    t.equals(found.matches.length, 3);
    t.end();
});

test('Lucid finds the correct matches in long english texts', (t) => {
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

    t.deepEquals(found.matches, ['prevailed', 'match', 'did', 'did']);
    t.equals(found.matches.length, 4);
    t.end();
});

test('Lucid handles empty strings correctly', (t) => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needle = '     The       dog      barks      ';
    const found1 = findMatches(haystack, needle);
    const found2 = findMatches(haystack, '    ');

    t.deepEquals(found1.matches, ['The', 'the', 'dog']);
    t.deepEquals(found2.matches, []);
    t.end();
});

test('Lucid finds the correct emojis', (t) => {
    const haystack = '😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎';
    const needle = '😎';
    const found = findMatches(haystack, needle);

    t.deepEquals(found.matches, ['😎']);
    t.equals(found.matches.length, 1);
    t.end();
});

test('Lucid highlights correctly', (t) => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needle = 'The dog barks';
    const found = findMatches(haystack, needle);

    t.equals(found.mark, '<span class="matched">The</span> quick brown fox jumps over <span class="matched">the</span> lazy <span class="matched">dog</span>');
    t.end();
});

test('Lucid highlights correctly', (t) => {
    const haystack = 'Emmerich, Wyman and Sanford';
    const needle = 'emmerich e';
    const found = findMatches(haystack, needle);

    t.deepEquals(found.matches, ['Emmerich', 'E', 'e']);
    t.equals(found.mark, '<span class="matched">Emmerich</span>, Wyman and Sanford');
    t.end();
});

test('Lucid highlights correctly with options', (t) => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needle = 'The dog barks';
    const options = { el: 'mark', cssClass: 'found' };
    const found = findMatches(haystack, needle, options);

    t.equals(found.mark, '<mark class="found">The</mark> quick brown fox jumps over <mark class="found">the</mark> lazy <mark class="found">dog</mark>');
    t.end();
});

test('Lucid finds the correct matches in HTML string', (t) => {
    const haystack = 'The quick brown <strong>fox</strong> jumps over the lazy <div>dog</div>';
    const needle = 'The dog strong div';
    const found = findMatchesHtml(haystack, needle);

    t.deepEquals(found.matches, ['The', 'the', 'dog']);
    t.equals(found.matches.length, 3);
    t.end();
});

test('Lucid highlights HTML strings correctly', (t) => {
    const haystack = 'The quick brown <strong>fox</strong> jumps over the lazy <div>dog</div>';
    const needle = 'The dog strong div';
    const found = findMatchesHtml(haystack, needle);

    t.equals(found.mark, '<span class="matched">The</span> quick brown <strong>fox</strong> jumps over <span class="matched">the</span> lazy <div><span class="matched">dog</span></div>');
    t.end();
});

test('Lucid highlights nested HTML strings correctly', (t) => {
    const haystack = 'The quick brown <strong>fox</strong> jumps over the lazy <div><nav><strong>dog</strong></nav></div>';
    const needle = 'The dog strong div nav';
    const found = findMatchesHtml(haystack, needle);

    t.equals(found.mark, '<span class="matched">The</span> quick brown <strong>fox</strong> jumps over <span class="matched">the</span> lazy <div><nav><strong><span class="matched">dog</span></strong></nav></div>');
    t.equals(found.matches.length, 3);
    t.end();
});

test('Lucid finds the correct matches with special characters like äöüè', (t) => {
    const haystack = 'Thé quīçk brown føx jümps over the låzy dog';
    const needle = 'Thë dog barkß';
    const found = findMatchesNormalized(haystack, needle);

    t.deepEquals(found.matches, ['Thé', 'the', 'dog']);
    t.equals(found.matches.length, 3);
    t.end();
});

test('Lucid highlights HTML strings correctly with special characters like äöüè', (t) => {
    const haystack = 'Thé quīçk brown <strong>føx</strong> jümps over the låzy <div>dog</div>';
    const needle = 'The dog strong div';
    const found = findMatchesHtmlNormalized(haystack, needle);

    t.equals(found.mark, '<span class="matched">Thé</span> quīçk brown <strong>føx</strong> jümps over <span class="matched">the</span> låzy <div><span class="matched">dog</span></div>');
    t.end();
});

test('Lucid highlights HTML strings correctly with special characters like äöüè', (t) => {
    const haystack = 'Thé quīçk brown <strong>føx</strong> jümps over the låzy <div>dog</div>';
    const needle = 'The dog strong div';
    const found = findMatchesHtmlNormalized(haystack, needle);

    t.deepEquals(found.matches, ['Thé', 'the', 'dog']);
    t.equals(found.matches.length, 3);
    t.end();
});

test('Lucid finds the correct matches when needle was passed as an array of strings', (t) => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needles = ['The', 'dog', 'barks'];
    const found = uncoverMatches(haystack, needles);

    t.deepEquals(found.matches, ['The', 'the', 'dog']);
    t.equals(found.matches.length, 3);
    t.end();
});

test('Lucid highlights correctly when needle was passed as an array of strings', (t) => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needles = ['fox jumps'];
    const found = uncoverMatches(haystack, needles);

    t.equals(found.mark, 'The quick brown <span class="matched">fox jumps</span> over the lazy dog');
    t.end();
});

test('Lucid scores words closer to the beginning higher', (t) => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needle1 = 'quick';
    const needle2 = 'jumps';
    const found1 = findMatches(haystack, needle1);
    const found2 = findMatches(haystack, needle2);

    t.equals(score(found1.matches, haystack) > score(found2.matches, haystack), true);
    t.end();
});

test('Lucid scores long matches higher than short ones', (t) => {
    const haystack = 'The quick brown fox jumps over the lazy dog';
    const needle1 = 'fox';
    const needle2 = 'jumps';
    const found1 = findMatches(haystack, needle1);
    const found2 = findMatches(haystack, needle2);

    t.equals(score(found1.matches) < score(found2.matches), true);
    t.end();
});
