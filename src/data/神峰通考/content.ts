// Auto-generated — do not edit manually

const sourceModules = import.meta.glob(
  '../../../books/神峰通考/articles/*/source.md',
  { query: '?raw', import: 'default', eager: false }
)
const interpModules = import.meta.glob(
  '../../../books/神峰通考/articles/*/interpretation.md',
  { query: '?raw', import: 'default', eager: false }
)
const skillModules = import.meta.glob(
  '../../../books/神峰通考/articles/*/skill.md',
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

export const sourceKeys = [] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
export const interpKeys = [] as const;
export const interpContent = extractPathKey(interpModules as any, '/interpretation.md');
export const skillKeys = [] as const;
export const skillContent = extractPathKey(skillModules as any, '/skill.md');
export const skillRawContent = extractPathKey(skillModules as any, '/skill.md');
export const skillDisplayNames: Record<string, string> = {};
