// Auto-generated — do not edit manually

const sourceModules = import.meta.glob(
  '../../../books/五行大义/articles/*/source.md',
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

export const sourceKeys = ["五行大义简介","五行大义序","卷第一","卷第二","卷第三","卷第四","卷第五","题五行大义后"] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
