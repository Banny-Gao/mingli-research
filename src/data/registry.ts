// Auto-generated — do not edit manually
// 动态加载各典籍数据，避免前端代码硬编码 slug
import * as _ditiansui_site from './ditiansui-site'

const registry: Record<string, any> = {
  'ditiansui-site': _ditiansui_site,
}

export function getBook(slug: string) {
  return registry[slug] ?? {}
}
