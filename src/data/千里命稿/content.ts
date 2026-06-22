// Auto-generated — do not edit manually

const sourceModules = import.meta.glob(
  '../../../books/千里命稿/articles/*/source.md',
  { query: '?raw', import: 'default', eager: false }
)
const interpModules = import.meta.glob(
  '../../../books/千里命稿/articles/*/interpretation.md',
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

export const sourceKeys = ["序","起例问答","天干篇","地支篇","人元篇","五行篇","强弱篇","六神篇","比劫禄刃篇","格局篇","外格篇","运限篇","流年篇","月建篇","六亲篇","女命篇","富贵吉寿篇","贫贱凶夭篇","补充篇","评断篇","应运篇上","应运篇下"] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
export const interpKeys = ["序","起例问答","天干篇","地支篇","人元篇","五行篇","强弱篇","六神篇","比劫禄刃篇","格局篇","外格篇","运限篇","流年篇","月建篇","六亲篇","女命篇","富贵吉寿篇","贫贱凶夭篇","补充篇","评断篇","应运篇上","应运篇下"] as const;
export const interpContent = extractPathKey(interpModules as any, '/interpretation.md');
