// Auto-generated — do not edit manually
// 动态加载各典籍数据，避免前端代码硬编码 slug
import * as _book0 from './三命通会';
import * as _book1 from './五行大义';
import * as _book2 from './五行精纪';
import * as _book3 from './八字提要';
import * as _book4 from './千里命稿';
import * as _book5 from './呱呱集';
import * as _book6 from './命理探原';
import * as _book7 from './命理约言';
import * as _book8 from './子平真诠';
import * as _book9 from './子平管见';
import * as _book10 from './李虚中命书';
import * as _book11 from './渊海子平';
import * as _book12 from './滴天髓阐微';
import * as _book13 from './玉照定真经';
import * as _book14 from './神峰通考';
import * as _book15 from './穷通宝鉴';
import * as _book16 from './紫微斗数全书';
import * as _book17 from './造化元钥评注';
import * as _book18 from './鬼谷遗文';

const registry: Record<string, any> = {
  '三命通会': _book0,
  '五行大义': _book1,
  '五行精纪': _book2,
  '八字提要': _book3,
  '千里命稿': _book4,
  '呱呱集': _book5,
  '命理探原': _book6,
  '命理约言': _book7,
  '子平真诠': _book8,
  '子平管见': _book9,
  '李虚中命书': _book10,
  '渊海子平': _book11,
  '滴天髓阐微': _book12,
  '玉照定真经': _book13,
  '神峰通考': _book14,
  '穷通宝鉴': _book15,
  '紫微斗数全书': _book16,
  '造化元钥评注': _book17,
  '鬼谷遗文': _book18,
};

export function getBook(slug: string) {
  return registry[slug] ?? {};
}
