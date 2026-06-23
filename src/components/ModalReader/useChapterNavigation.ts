// src/components/ModalReader/useChapterNavigation.ts
import { useMemo } from 'react'
import type { ModalType, BookData } from './modalType'
import { MODAL_TYPE_LABEL } from './modalType'

interface UseChapterNavigationParams {
  chapters: Array<{ name: string }>
  modalType: ModalType
  modalKey: string
  bookData: BookData
}

export interface ContentNavItem {
  type: ModalType
  label: string
  navKey: string
}

export interface UseChapterNavigationResult {
  /** 跨内容导航统一后的篇章 key（interp/source 模式即 modalKey） */
  chapterName: string
  chapterIndex: number
  hasPrev: boolean
  hasNext: boolean
  prevChapter: string | null
  nextChapter: string | null
  /** 同篇章内可跳转的 source / interp 列表（已过滤当前类型 + 缺数据项） */
  contentNavItems: ContentNavItem[]
}

/**
 * ModalReader 的"章节导航派生"hook。
 *
 * 合并 3 类派生：
 * 1. `chapterName`：跨内容导航的章节 key（interp/source 模式即 modalKey）
 * 2. `chapterIndex / hasPrev / hasNext / prevChapter / nextChapter`：上一/下一章导航
 * 3. `contentNavItems`：同篇章内可跳转的 source / interp 列表
 *
 * 单一权威派生 → ModalReader 不再写 30 行内联 if/filter/map。
 */
export function useChapterNavigation(
  params: UseChapterNavigationParams
): UseChapterNavigationResult {
  const { chapters, modalType, modalKey, bookData } = params

  return useMemo(() => {
    // skill 模式没有章节目录，跳过导航派生（chapterIndex / prev / next 均返回 null/空）
    if (modalType === 'skill') {
      return {
        chapterName: modalKey,
        chapterIndex: -1,
        hasPrev: false,
        hasNext: false,
        prevChapter: null,
        nextChapter: null,
        contentNavItems: [],
      }
    }

    const chapterName = modalKey
    const chapterIndex = chapters.findIndex(c => c.name === chapterName)
    const hasPrev = chapterIndex > 0
    const hasNext = chapterIndex >= 0 && chapterIndex < chapters.length - 1
    const prevChapter = hasPrev ? chapters[chapterIndex - 1].name : null
    const nextChapter = hasNext ? chapters[chapterIndex + 1].name : null

    const interpContent = bookData.interpContent ?? {}
    const sourceContent = bookData.sourceContent ?? {}
    const hasSource = !!sourceContent[chapterName]
    const hasInterp = !!interpContent[chapterName]

    const contentNavItems: ContentNavItem[] = [
      { type: 'source' as const, condition: hasSource, navKey: chapterName },
      { type: 'interp' as const, condition: hasInterp, navKey: chapterName },
    ]
      .filter(({ condition, type }) => condition && modalType !== type)
      .map(({ type, navKey }) => ({
        type,
        label: MODAL_TYPE_LABEL[type],
        navKey,
      }))

    return {
      chapterName,
      chapterIndex,
      hasPrev,
      hasNext,
      prevChapter,
      nextChapter,
      contentNavItems,
    }
  }, [chapters, modalType, modalKey, bookData])
}
