// Auto-generated — do not edit manually

const sourceModules = import.meta.glob(
  '../../../books/造化元钥评注/articles/*/source.md',
  { query: '?raw', import: 'default', eager: false }
)
const interpModules = import.meta.glob(
  '../../../books/造化元钥评注/articles/*/interpretation.md',
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

export const sourceKeys = ["论木","论火","论土","论金","论水","十天干总论甲木","乙木","丙火","丁火","戊土","己土","庚金","辛金","壬水","癸水"] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
export const interpKeys = [] as const;
export const interpContent = extractPathKey(interpModules as any, '/interpretation.md');
