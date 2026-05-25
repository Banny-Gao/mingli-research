// Auto-generated — do not edit manually
// 动态加载各典籍数据，避免前端代码硬编码 slug
import * as _____ from './渊海子平';
import * as ______ from './滴天髓阐微';

const registry: Record<string, any> = {
  '渊海子平': _____,
  '滴天髓阐微': ______,
};

export function getBook(slug: string) {
  return registry[slug] ?? {};
}
