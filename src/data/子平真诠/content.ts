// Auto-generated — do not edit manually

const sourceModules = import.meta.glob(
  '../../../books/子平真诠/articles/*/source.md',
  { query: '?raw', import: 'default', eager: false }
)
const interpModules = import.meta.glob(
  '../../../books/子平真诠/articles/*/interpretation.md',
  { query: '?raw', import: 'default', eager: false }
)
const skillModules = import.meta.glob(
  '../../../books/子平真诠/articles/*/skill.md',
  { query: '?raw', import: 'default', eager: false }
)

function extractPathKey(mod: Record<string, () => Promise<string>>, suffix: string): Record<string, () => Promise<string>> {
  const result: Record<string, () => Promise<string>> = {};
  for (const key in mod) {
    const idx = key.indexOf('/articles/');
    if (idx === -1) continue;
    const start = idx + '/articles/'.length;
    const end = key.lastIndexOf(suffix);
    if (end === -1) continue;
    result[key.slice(start, end)] = mod[key];
  }
  return result;
}

export const sourceKeys = ["子平真诠评注序","子平真诠评注凡例","论十干十二支","论阴阳生克","论阴阳生死","论十干配合性情","论十干合而不合","论十干得时不旺失时不弱","论刑冲会合解法","论用神","论用神成败救应","论用神变化","论用神纯杂","论用神格局高低","论用神因成得败因败得成","论用神配气候得失","论相神紧要","论杂气如何取用","论墓库刑冲之说","论四吉神能破格","论四凶神能成格","论生克先后分吉凶","论星辰无关格局","论外格用舍","论宫分用神配六亲","论妻子","论行运","论行运成格变格","论喜忌干支有别","论支中喜忌逢运透清","论时说拘泥格局","论时说以讹传讹","论正官","论正官取运","论财","论财取运","论印绶","论印绶取运","论食神","论食神取运","论偏官","论偏官取运","论伤官","论伤官取运","论阳刃","论阳刃取运","论建禄月劫","论建禄月劫取运","论杂格","附论杂格取运"] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
export const interpKeys = ["子平真诠评注序","子平真诠评注凡例","论十干十二支","论阴阳生克","论阴阳生死","论十干配合性情","论十干合而不合","论十干得时不旺失时不弱","论刑冲会合解法","论用神","论用神成败救应","论用神变化","论用神纯杂","论用神格局高低","论用神因成得败因败得成","论用神配气候得失","论相神紧要","论杂气如何取用","论墓库刑冲之说","论四吉神能破格","论四凶神能成格","论生克先后分吉凶","论星辰无关格局","论外格用舍","论宫分用神配六亲","论妻子","论行运","论行运成格变格","论喜忌干支有别","论支中喜忌逢运透清","论时说拘泥格局","论时说以讹传讹","论正官","论正官取运","论财","论财取运","论印绶","论印绶取运","论食神","论食神取运","论偏官","论偏官取运","论伤官","论伤官取运","论阳刃","论阳刃取运","论建禄月劫","论建禄月劫取运","论杂格","附论杂格取运"] as const;
export const interpContent = extractPathKey(interpModules as any, '/interpretation.md');
export const skillKeys = [] as const;
export const skillContent = extractPathKey(skillModules as any, '/skill.md');
export const skillRawContent = extractPathKey(skillModules as any, '/skill.md');
export const skillDisplayNames: Record<string, string> = {};
