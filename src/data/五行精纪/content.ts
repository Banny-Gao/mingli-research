// Auto-generated — do not edit manually

const sourceModules = import.meta.glob(
  '../../../books/五行精纪/articles/*/source.md',
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

export const sourceKeys = ["序","六十甲子上","六甲纳音法","六十甲子下","干神一","干神二","干神三","甲乙","戊己","庚辛","壬癸","支神","十神","五行一","五行二","五行三","年月日时胎","释日时凶中凶格","十二月节气","释吉贵神例","天乙贵神","禄","马","并论禄马","官神","印绶","食神","三奇四奇附","进神","正印","库墓","财"] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
