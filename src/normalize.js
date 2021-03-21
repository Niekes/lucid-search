export default function normalize(string) {
    return string
        .replace(/a|æ|ä|å|á|à|ã|â|ā/gi, '[aæäåáàãâā]')
        .replace(/c|ç|č|ć/gi, '[cçčć]')
        .replace(/e|é|ê|è|ë|ē|ė/gi, '[eéêèëēė]')
        .replace(/i|î|ï|í|ī|ì/gi, '[iîïíīì]')
        .replace(/o|œ|ö|ó|õ|ô|ò|ø|ō/gi, '[oœöóõôòøō]')
        .replace(/s|ś|š|ß/gi, '[sśšß]')
        .replace(/u|ü|ù|ú|ŭ|ū|û/gi, '[uüùúŭūû]');
}
