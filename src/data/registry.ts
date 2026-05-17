// Auto-generated — do not edit manually
// 动态加载各典籍数据，避免前端代码硬编码 slug
import * as _ditiansui_site from './ditiansui-site';
import * as _ditiansui_siteSkill from './ditiansui-site/skill';
import * as _ditiansui_siteAssoc from './ditiansui-site/assoc';

interface BookModules {
  module: Record<string, any>;
  skill: Record<string, any>;
  assoc: Record<string, any>;
}

const registry: Record<string, BookModules> = {
  'ditiansui-site': { module: _ditiansui_site, skill: _ditiansui_siteSkill, assoc: _ditiansui_siteAssoc },
};

export function getBookCompat(slug: string): Record<string, any> {
  return registry[slug]?.module ?? {};
}

export function getBookSkill(slug: string): Record<string, any> {
  return registry[slug]?.skill ?? {};
}

export function getBookAssoc(slug: string): Record<string, any> {
  return registry[slug]?.assoc ?? {};
}
