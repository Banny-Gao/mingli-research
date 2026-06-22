// Auto-generated — do not edit manually

const sourceModules = import.meta.glob(
  '../../../books/滴天髓阐微/articles/*/source.md',
  { query: '?raw', import: 'default', eager: false }
)
const interpModules = import.meta.glob(
  '../../../books/滴天髓阐微/articles/*/interpretation.md',
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

export const sourceKeys = ["天道","坤道","人道","知命","理气","配合","天干","地支","干支总论","形象","方局","八格","体用","精神","月令","生时","衰旺","中和","源流","通关","官杀","伤官","清气","浊气","真神","假神","刚柔","顺逆","寒暖","燥湿","隐显","众寡","震兑","坎离","夫妻","子女","父母","兄弟","何知","女命","小儿","才德","奋郁","恩怨","闲神","从象","化象","假从","假化","顺局","反局","战局","合局","君象","臣象","母象","子象","性情","疾病","出身","地位","岁运","贞元"] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
export const interpKeys = ["天道","坤道","人道","知命","理气","配合","天干","地支","干支总论","形象","方局","八格","体用","精神","月令","生时","衰旺","中和","源流","通关","官杀","伤官","清气","浊气","真神","假神","刚柔","顺逆","寒暖","燥湿","隐显","众寡","震兑","坎离","夫妻","子女","父母","兄弟","何知","女命","小儿","才德","奋郁","恩怨","闲神","从象","化象","假从","假化","顺局","反局","战局","合局","君象","臣象","母象","子象","性情","疾病","出身","地位","岁运","贞元"] as const;
export const interpContent = extractPathKey(interpModules as any, '/interpretation.md');
