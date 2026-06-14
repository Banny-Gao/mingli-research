// Auto-generated — do not edit manually
// 动态加载各典籍数据，避免前端代码硬编码 slug
import * as _book0 from './三命通会';
import * as _book1 from './千里命稿';
import * as _book2 from './命理探原';
import * as _book3 from './子平真诠';
import * as _book4 from './李虚中命书';
import * as _book5 from './渊海子平';
import * as _book6 from './滴天髓阐微';
import * as _book7 from './神峰通考';
import * as _book8 from './穷通宝鉴';
import * as _book9 from './紫微斗数全书';

const registry: Record<string, any> = {
  '三命通会': _book0,
  '千里命稿': _book1,
  '命理探原': _book2,
  '子平真诠': _book3,
  '李虚中命书': _book4,
  '渊海子平': _book5,
  '滴天髓阐微': _book6,
  '神峰通考': _book7,
  '穷通宝鉴': _book8,
  '紫微斗数全书': _book9,
};

export function getBook(slug: string) {
  return registry[slug] ?? {};
}
