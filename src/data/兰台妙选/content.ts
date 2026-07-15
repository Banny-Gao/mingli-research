// Auto-generated — do not edit manually

const sourceModules = import.meta.glob(
  '../../../books/兰台妙选/articles/*/source.md',
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

export const sourceKeys = ["总论根基","藏象纳音","神煞格局","三奇拱贵","禄马财官","魁星学堂","天象节气","二十八宿与贵人","数理数格","总论凶格","凶煞破格","印破刑截","体象衰败","总论推断","日月星华","节气候应","明堂官禄","贵格与不遇","末论总结"] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
