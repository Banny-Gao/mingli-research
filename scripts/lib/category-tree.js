/**
 * scripts/lib/category-tree.js — CATEGORY_TREE 唯一真源
 *
 * 前后端共享：scripts/generate.js (Node ESM) 与 src/data/category-tree.ts (Vite) 都从这里读
 * 任何新增一级/二级类别，必须先改本文件，再 npm run generate
 */

export const SECTION_ORDER = ['命', '医', '山', '相', '卜']

/**
 * @typedef {{ section: '命' | '医' | '山' | '相' | '卜', categories: string[] }} CategoryTreeNode
 */

/** @type {CategoryTreeNode[]} */
export const CATEGORY_TREE = [
  { section: '山', categories: ['拳法'] },
  { section: '医', categories: ['中医'] },
  { section: '命', categories: ['八字', '紫微斗数', '七政四余'] },
  { section: '相', categories: ['地相', '人相', '星相'] },
  { section: '卜', categories: ['易经', '六爻', '梅花易数', '奇门遁甲', '大六壬'] },
]

/**
 * 校验给定的 (section, category) 是否在 CATEGORY_TREE 中注册
 * @param {string} section
 * @param {string} category
 * @returns {boolean}
 */
export function isValidCategory(section, category) {
  const node = CATEGORY_TREE.find(n => n.section === section)
  return Boolean(node && node.categories.includes(category))
}
