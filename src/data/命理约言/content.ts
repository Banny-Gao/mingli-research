// Auto-generated — do not edit manually

const sourceModules = import.meta.glob(
  '../../../books/命理约言/articles/*/source.md',
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

export const sourceKeys = ["命理约言原书十卷凡例","袁序","蒋序","韦序","看命总法一","看命总法二","看格局法","看格局法二","看用神法","看生年法一","看月令法一","看月令法二","旧例","看日主法","看生时法一","看生时法二","看运法一","看运法二","看流年法","看正官法","看偏官法","看官煞去留法一","看官煞去留法二","看官煞去留法三","看正偏印法","看偏正财法","看食神法","看伤官法","看食神法（二）","看比劫禄刃法","看拱夹法","看杂气墓库法","看从局法","看化局法","看一行得气法","看两神成象法","看暗冲法一","看暗冲法二","看暗合法","看六亲法一","看六亲法二","看贵贱法","看贫富法","看吉凶法","看寿夭法","看富贵吉寿贫贱凶夭总法","富贵吉寿诸局","贫贱凶夭诸局","看富贵吉寿贫贱凶夭要法","看科第法","看性情法","看疾病法","看女命法一","看女命法二","看小儿命法","总纲赋","格局赋","行运赋","流年赋","正官赋","偏官赋","正印赋","偏印赋","正财赋","偏财赋","食神赋","伤官赋","比劫赋","禄刃赋","从局赋","化局赋","一行得气赋","两神成象赋","暗冲暗合赋","女命赋","天干论","地支论","干合论","支三合论","支六合论","支方论","支冲论","支刑论","支害论","五行旺相休囚论","十干生旺墓等位论","十二支作用论","支干覆载论","诸神煞论一","诸神煞论二","太岁论","月煞论","天月二德论","贵人论","月将论","驿马论","空亡论","劫煞论","纳音论","八法论","小运论","干支一气论","双飞两干三朋论","月日时禄论","青龙伏形等格论","福德秀气格论","三奇论","双美论","十恶大败","壬骑龙背论","六乙鼠贵论","六阴朝阳格","金神论","趋乾趋艮论","合禄论"] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
