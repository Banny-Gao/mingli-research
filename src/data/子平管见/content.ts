// Auto-generated — do not edit manually

const sourceModules = import.meta.glob(
  '../../../books/子平管见/articles/*/source.md',
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

export const sourceKeys = ["子平管见序","正官格","偏官格","时上偏官格（即时上一位贵也）","正财格","偏财格","时上偏财格","正印格","偏印格","伤官格有二","食神格","月令建禄格有二","羊刃格","日禄归时格","拱禄格","拱贵格","二格合言一首","六壬趋艮 六甲趋乾（二格同于一理，故总言之。）","六阴朝阳格","六乙鼠贵格","井栏叉格","子遥巳格","丑遥巳格","飞天禄马格有五","合禄格","壬骑龙背格","财旺生官格","财煞格","杂气有三","杂气财官格","杂气财杀格","杂气印绶格","日贵格","福德秀气格","魁罡格","金神格","日德格","专禄格","日刃格","夹丘格","胞胎格（绝句）","十干喜忌诗","论形气","论虚邀夹拱","管见篇","阴命赋","二五心鉴篇","探玄篇","曲直格","炎上格","稼穑格","从革格","润下格","胆论"] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
