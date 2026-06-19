// src/components/ModalReader/modalType.ts

/**
 * ModalType 单一权威定义。
 *
 * 用 `as const` 字面量 + `typeof` 派生联合类型，避免在 props/handler/Map 中
 * 重复书写 `'interp' | 'skill' | 'source'`。
 *
 * 能力映射（MODAL_TYPE_CAPS）取代分散在组件内的 `modalType === 'skill'` /
 * `modalType !== 'interp'` 嵌套条件。
 */

/** 权威字面量元组（不可变） */
export const MODAL_TYPES = ['interp', 'skill', 'source'] as const

/** 联合类型由 MODAL_TYPES 派生 */
export type ModalType = (typeof MODAL_TYPES)[number]

/** 运行时类型守卫（供 URL 参数 / localStorage 读取等不可信来源用） */
export const isModalType = (v: unknown): v is ModalType =>
  typeof v === 'string' && (MODAL_TYPES as readonly string[]).includes(v)

/** 能力映射：单一权威定义每种 modalType 的"能/不能" */
export interface ModalTypeCapabilities {
  /** 是否允许文本选中 + 标注 */
  allowsAnnotation: boolean
  /** 是否支持 paginated 渲染（true → SmoothBody/FlipBody 接管） */
  supportsPagination: boolean
  /** 注入到 ReactMarkdown 容器的 prose class（空 = 不挂） */
  proseClass: string
}

export const MODAL_TYPE_CAPS: Record<ModalType, ModalTypeCapabilities> = {
  interp: { allowsAnnotation: true, supportsPagination: true, proseClass: 'prose-interp' },
  source: { allowsAnnotation: true, supportsPagination: true, proseClass: 'prose-interp' },
  skill: { allowsAnnotation: false, supportsPagination: false, proseClass: '' },
}

/** 用户可见标签（中文） */
export const MODAL_TYPE_LABEL: Record<ModalType, string> = {
  interp: '解读',
  skill: '技能',
  source: '原文',
}

/** "未找到内容" 占位文本（仅对可加载内容的类型有意义） */
export const NOT_FOUND_MSG: Record<ModalType, string> = {
  source: '<p class="not-found-msg">未找到该篇原文</p>',
  interp: '<p class="not-found-msg">未找到该篇解读内容</p>',
  skill: '',
}

/**
 * skill 模式的 modalKey 是 "技能名"，需要通过 skillToChapters 映射到篇章文件夹名。
 * 其他模式（interp/source）modalKey 就是 chapterName，无需映射。
 * 找不到映射时 fallback 到 modalKey 自身（保持当前行为）。
 */
export function resolveCanonicalChapterName(
  modalType: ModalType,
  modalKey: string,
  skillToChapters: Record<string, string[]>
): string {
  if (modalType !== 'skill') return modalKey
  return skillToChapters[modalKey]?.[0] ?? modalKey
}

/**
 * 单本典籍数据形状——ModalReader.tsx 与 useChapterNavigation 共用。
 * 来自 data/registry.getBook<T>() 泛型参数。
 */
export interface BookData {
  interpContent?: Record<string, () => Promise<string>>
  sourceContent?: Record<string, () => Promise<string>>
  skillRawContent?: Record<string, () => Promise<string>>
  skillDisplayNames?: Record<string, string>
  chapterToSkills?: Record<string, string[]>
  skillToChapters?: Record<string, string[]>
}
