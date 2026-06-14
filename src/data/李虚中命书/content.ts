// Auto-generated — do not edit manually

const sourceModules = import.meta.glob(
  '../../../books/李虚中命书/articles/*/source.md',
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

export const sourceKeys = ["提要","原序","甲子纳音六十位","六十位轻重总结","本家贵人命","天乙贵人","论贵神优劣","此格三等","紫虚局","贵合贵食","天乙贵神合","清浊阴阳易卦","干支纳音数理","五行方位与变通","三元四柱主本","五行性情","真假邪正","升降清浊","衰旺取时","三元九限","天承地禄起论","六合之德六十表","鬼谷自谓","六十干支格局表","五行体合方位","神头禄总论","水土名用"] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
