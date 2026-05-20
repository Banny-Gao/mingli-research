// Auto-generated — do not edit manually

const interpModules = import.meta.glob(
  '../../../books/ditiansui-site/articles/*/interpretation.md',
  { query: '?raw', import: 'default', eager: false }
)
const sourceModules = import.meta.glob(
  '../../../books/ditiansui-site/articles/*/source.md',
  { query: '?raw', import: 'default', eager: false }
)
const skillModules = import.meta.glob(
  '../../../books/ditiansui-site/articles/*/skill.md',
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

export const interpKeys = ["天道","坤道","人道","知命","理气","配合","天干","地支","干支总论","形象","方局","八格","体用","精神","月令","生时","衰旺","中和","源流","通关","官杀","伤官","清气","浊气","真神","假神","刚柔","顺逆","寒暖","燥湿","隐显","众寡","震兑","坎离","夫妻","子女","父母","兄弟","何知","女命","小儿","才德","奋郁","恩怨","闲神","从象","化象","假从","假化","顺局","反局","战局","合局","君象","臣象","母象","子象","性情","疾病","出身","地位","岁运","贞元"] as const;
export const interpContent = extractPathKey(interpModules as any, '/interpretation.md');
export const sourceKeys = ["天道","坤道","人道","知命","理气","配合","天干","地支","干支总论","形象","方局","八格","体用","精神","月令","生时","衰旺","中和","源流","通关","官杀","伤官","清气","浊气","真神","假神","刚柔","顺逆","寒暖","燥湿","隐显","众寡","震兑","坎离","夫妻","子女","父母","兄弟","何知","女命","小儿","才德","奋郁","恩怨","闲神","从象","化象","假从","假化","顺局","反局","战局","合局","君象","臣象","母象","子象","性情","疾病","出身","地位","岁运","贞元"] as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
export const skillKeys = ["tiandao","kundao","rendao","zhiming","liqi","peihe","tiangan","dizhi","ganzhi","xiangxing","fangju","bage","tiyong","jingshen","yueling","shengshi","shuaiwang","zhonghe","yuanliu","tongguan","guansha","shangguan","qingqi","zhuoqi","zhenshen","jiashen","gangrou","shunni","hannuan","zaoshi","yinxian","zhonggua","zhendui","kanli","fuqi","zinv","fumu","xiongdi","hezhi","nvming","xiaoer","caide","fenyu","enyuan","xianshen","congxiang","huaxiang","jiacong","jiahua","shunju","fanju","zhanju","heju","junxiang","chenxiang","muxiang","zixiang","xingqing","jibing","chushen","diwei","suiyun","zhenyuan"] as const;
export const skillContent = extractPathKey(skillModules as any, '/skill.md');
export const skillRawContent = extractPathKey(skillModules as any, '/skill.md');
export const skillDisplayNames: Record<string, string> = {
  "tiandao": "三元分析器",
  "kundao": "五气偏全分析",
  "rendao": "顺悖分析器",
  "zhiming": "顺逆之机分析器",
  "liqi": "进退之机分析器",
  "peihe": "去留舒配合局分析器",
  "tiangan": "十干性情分析法",
  "dizhi": "地支作用关系分析器",
  "ganzhi": "干支配合分析器",
  "xiangxing": "形象格局判定器",
  "fangju": "方局气势分析器",
  "bage": "八格格局判定与病药分析器",
  "tiyong": "体用格局分析器",
  "jingshen": "精神气状态评估器",
  "yueling": "月令格局分析器",
  "shengshi": "生时归宿分析器",
  "shuaiwang": "日主衰旺判定器",
  "zhonghe": "中和平衡评估器",
  "yuanliu": "五行源流分析器",
  "tongguan": "通关分析器",
  "guansha": "官杀格分析器",
  "shangguan": "伤官格分析器",
  "qingqi": "清气评估器",
  "zhuoqi": "浊气评估器",
  "zhenshen": "真神判定器",
  "jiashen": "假神辨析器",
  "gangrou": "刚柔平衡分析器",
  "shunni": "顺逆时令分析器",
  "hannuan": "寒暖调候分析器",
  "zaoshi": "燥湿平衡分析器",
  "yinxian": "吉凶藏显局势分析器",
  "zhonggua": "众寡强弱分析器",
  "zhendui": "震兑金木调候分析器",
  "kanli": "坎离水火调候分析器",
  "fuqi": "夫妻姻缘分析器",
  "zinv": "子女运势分析器",
  "fumu": "父母运势分析器",
  "xiongdi": "兄弟姐妹运势分析器",
  "hezhi": "命理问答速断器",
  "nvming": "女命分析器",
  "xiaoer": "小儿命分析器",
  "caide": "才德品格分析器",
  "fenyu": "奋郁状态分析器",
  "enyuan": "恩怨关系分析器",
  "xianshen": "闲神识别与作用分析器",
  "congxiang": "从格判定器",
  "huaxiang": "化格判定器",
  "jiacong": "假从格辨析器",
  "jiahua": "假化格辨析器",
  "shunju": "顺局判定与顺势分析器",
  "fanju": "反局判定与逆势风险分析器",
  "zhanju": "战局分析与制化判定器",
  "heju": "合局吉凶判定器",
  "junxiang": "君象判定与官印配合分析器",
  "chenxiang": "臣象君臣关系分析器",
  "muxiang": "母象印星分析器",
  "zixiang": "子象子母关系分析器",
  "xingqing": "五行性情推断器",
  "jibing": "五行偏枯疾病推断器",
  "chushen": "出身分析器",
  "diwei": "地位分析器",
  "suiyun": "岁运分析器",
  "zhenyuan": "贞元循环分析器"
};
