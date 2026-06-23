// scripts/lib/category-tree.d.ts — TS 旁路声明（仅给 tsc 看）
//
// 真源：scripts/lib/category-tree.js（纯 JS，无类型）
// 本文件提供 TS 类型信息，运行时由 Vite 读取 .js
// 注意：tsconfig.json 仅 include ["src"]，本文件路径不在内——但 tsc 通过 import 自动跟随解析

export type ArtSectionLiteral = '山' | '医' | '命' | '相' | '卜'

export const SECTION_ORDER: readonly ArtSectionLiteral[]

export interface CategoryTreeNode {
  section: ArtSectionLiteral
  categories: readonly string[]
}

export const CATEGORY_TREE: readonly CategoryTreeNode[]

export function isValidCategory(section: string, category: string): boolean