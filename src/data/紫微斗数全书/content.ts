// Auto-generated — do not edit manually

const sourceModules = import.meta.glob(
  '../../../books/紫微斗数全书/articles/*/source.md',
  { query: '?raw', import: 'default', eager: false }
)
const interpModules = import.meta.glob(
  '../../../books/紫微斗数全书/articles/*/interpretation.md',
  { query: '?raw', import: 'default', eager: false }
)
const skillModules = import.meta.glob(
  '../../../books/紫微斗数全书/articles/*/skill.md',
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

export const sourceKeys = ["羅序","太微賦","形性賦","星垣論","斗數準繩","斗數發微論","重補斗數彀率","增補太微賦","問紫微所主若何？","問天機所主如何？","問太陽所主若何？","問武曲星所主為何？","問天同星所主若何？","問廉貞所主若何？","問天府所主若何？","問太陰星所主若何？","問貪狼所主若何？","問巨門所主若何？","問天相星所主若何？","問天梁星所主若何？","問七殺星所主若何？","問破軍所主若何？","問文昌星所主若何？","问文曲星所主若何？","问流年昌曲若何？","问左辅所主若何？","问右弼所主若何？","问天魁天钺星所主若何？","问禄存星所主若何？","问天马星所主若何？","问化禄星所主若何？","问化权星所主若何？","问化科星所主若何？","问化忌星所主若何？","问擎羊星所主若何？","问陀罗星所主若何？","羊陀二星总论","问火星所主若何？","问铃星所主若何？","羊陀火铃四星总论","问天空地劫所主若何？","问天伤天使所主若何？","问天刑星所主若何？","问天姚星所主若何？","问天哭天虚二星所主若何？","斗数骨髓赋","女命骨髓赋","定富贵贫贱十等论","十二宫诸星得地合格诀","十二宫诸星失陷破格诀","十二宫诸星得地富贵论","十二宫诸星失陷贫贱论","定富局","定贵局","定贫贱局","定杂局","安身命例","一 命宫","二兄弟","三妻妾","四子女","五财帛","六疾厄","七迁移","八奴仆","九官禄","十田宅","十一福德","十二父母","谈星要论","论人命入格","论格星数高下","论男女命同异","论小儿命","定小儿生时诀","论人生时安命吉凶","论人生时要审的确","论小儿克亲","论命先贫后富","论大限十年祸福何如","论二限太岁吉凶","论行限分南北斗","论流年太岁吉凶星杀","论阴骘延寿","论羊陀迭并","论七杀重逢","论大小限星辰过十二宫遇十二支所忌诀","论立命行限宫歌","论诸星同垣各司所宜分别富贵贫贱夭寿"] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
export const interpKeys = [] as const;
export const interpContent = extractPathKey(interpModules as any, '/interpretation.md');
export const skillKeys = [] as const;
export const skillContent = extractPathKey(skillModules as any, '/skill.md');
export const skillRawContent = extractPathKey(skillModules as any, '/skill.md');
export const skillDisplayNames: Record<string, string> = {};
