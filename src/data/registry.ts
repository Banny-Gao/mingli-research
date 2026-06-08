// Auto-generated — do not edit manually
// 动态加载各典籍数据，避免前端代码硬编码 slug
import * as _____ from './千里命稿';
import * as _____ from './子平真诠';
import * as _____ from './渊海子平';
import * as ______ from './滴天髓阐微';
import * as _____ from './穷通宝鉴';
import * as _______ from './紫微斗数全书';

const registry: Record<string, any> = {
  '千里命稿': _____,
  '子平真诠': _____,
  '渊海子平': _____,
  '滴天髓阐微': ______,
  '穷通宝鉴': _____,
  '紫微斗数全书': _______,
};

export function getBook(slug: string) {
  return registry[slug] ?? {};
}
