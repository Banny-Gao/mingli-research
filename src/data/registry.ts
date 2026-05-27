// Auto-generated — do not edit manually
// 动态加载各典籍数据，避免前端代码硬编码 slug
import * as _____ from './渊海子平';
import * as ______ from './滴天髓阐微';
import * as _______ from './紫微斗数全书';

const registry: Record<string, any> = {
  '渊海子平': _____,
  '滴天髓阐微': ______,
  '紫微斗数全书': _______,
};

export function getBook(slug: string) {
  return registry[slug] ?? {};
}
