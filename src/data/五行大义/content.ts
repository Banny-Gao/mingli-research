// Auto-generated — do not edit manually

const sourceModules = import.meta.glob(
  '../../../books/五行大义/articles/*/source.md',
  { query: '?raw', import: 'default', eager: false }
)
const interpModules = import.meta.glob(
  '../../../books/五行大义/articles/*/interpretation.md',
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

export const sourceKeys = ["五行大义简介","五行大义序","题五行大义后","释名","论支干名","起大衍论易动静数","论五行及生成数","论支干数","论纳音数","论九宫数","论相生","论配支干","论相杂","论德","论合","论扶抑","论害","论冲破","配五色至五事","论律吕","论七政","论八卦八风","论情性","论治政","论诸神","论五帝","论诸官","论诸人","论禽虫"] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
export const interpKeys = ["五行大义简介","五行大义序","题五行大义后"] as const;
export const interpContent = extractPathKey(interpModules as any, '/interpretation.md');
