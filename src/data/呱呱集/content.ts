// Auto-generated — do not edit manually

const sourceModules = import.meta.glob(
  '../../../books/呱呱集/articles/*/source.md',
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

export const sourceKeys = ["小言","张氏父子","陈诚俞大维俞鸿钓","杜月笙","邵邨人","汪希文","阎锡山","吴国桢","甬商王某","吴乡王翁","明思宗","陈孝威","马票王某","于右任","梁二姑","任伯棠","陈克锦","段祺瑞吴光新","哈同","叶锦文","吴子深","王晓籁程霖生","燕春瑞冰","鞋匠医生陈妇王企予文姑娘","李弘毅孙太太太原生陈经理章太炎冼冠生许世英","蒋孔宋朱家骅何应钦锺森孙传芳曾左彭关羽","漫谈贫富徐乐吾十里自造","婚姻","财气","子嗣","事业","寿元","行运流年","相法杂问","命学综论"] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
