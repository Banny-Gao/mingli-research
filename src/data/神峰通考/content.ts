// Auto-generated — do not edit manually

const sourceModules = import.meta.glob(
  '../../../books/神峰通考/articles/*/source.md',
  { query: '?raw', import: 'default', eager: false }
)
const interpModules = import.meta.glob(
  '../../../books/神峰通考/articles/*/interpretation.md',
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

export const sourceKeys = ["五星正说类","五星谬说类","男女合婚说","总论子平谬说类","动静说","盖头说","六亲说","病药说类","雕桔旺弱四病说类","损益生长四药说类","正官格","偏官格 附弃命从杀格","时上一位贵格","附官杀去留杂格","月支正财格 附弃从财格","时上偏财格 附月偏财格","伤官食神格","印绶格","阳刃格 附比劫、建禄格","杂气财官印绶格 附时墓格","金神格","飞天禄马格 附倒冲禄马格","子遥巳格","丑遥巳格","壬骑龙背格","井栏叉格","六乙鼠贵格","六阴朝阳格","刑合格","合禄格","曲直仁寿格","稼穑格","炎上格","润下格","从革格","年时上官星格","从化格","来兵拱财格","岁德扶杀格","专财格","日德格","日贵格","魁罡格","勾陈得位格","玄武当权格","财官双美格","拱禄拱贵二格","日禄归时格","四位纯全格","天元一气格","三合聚集格","福德格","神趣八法","论大运","论太岁","认格局生死之歌","五星论","金不换骨髓歌断","十天干体象全编论","十二支咏","总咏","吉神类","凶神类","起八字诀","子平举要","男女命小运定局","天干阴阳通变、定格局决","子平泛论","十干从化定诀","十段锦","十段化气","五阴歌","天元一字歌","运晦运通歌","刑克歌 刑妻歌 克子歌","带疾歌","寿元歌","飘荡歌","女命歌","月建生克","看命捷歌","论诸格有救","取格指诀歌断","节气歌断","万尚书琼玑三盘赋","崖泉男女命赋","讲命捷径赋","四言独步 身弱论 弃命从杀格","五步独言","喜忌篇","继善篇","六神篇","气象篇","渭泾论","定真篇","五行元理消息赋","五行生克赋","一行禅师天元赋","捷驰千里马赋","络绎赋","玄机赋","憎爱赋","万金赋","相心赋","仙机赋","金玉赋","人鉴论","渊源集说","妖祥赋","幽微天干赋","人元消息赋","地支赋","病源赋"] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
export const interpKeys = [] as const;
export const interpContent = extractPathKey(interpModules as any, '/interpretation.md');
