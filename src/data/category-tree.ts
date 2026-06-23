// src/data/category-tree.ts — 前端门面：re-export 运行时真源
//
// 真源：scripts/lib/category-tree.js（纯 JS，前后端共享）
// 类型：scripts/lib/category-tree.d.ts（TS 旁路声明）
// 本文件仅做 re-export，类型 ArtSection 仍由 src/data/book-types.ts 提供（generate.js 自动生成）

import { CATEGORY_TREE as RAW, SECTION_ORDER as RAW_ORDER } from '../../scripts/lib/category-tree.js'

export const CATEGORY_TREE = RAW

export const SECTION_ORDER = RAW_ORDER