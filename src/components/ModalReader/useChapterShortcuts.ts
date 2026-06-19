// src/components/ModalReader/useChapterShortcuts.ts
import { useEffect } from 'react'
import type { ModalType } from './modalType'

interface UseChapterShortcutsParams {
  chapters: Array<{ name: string }>
  modalKey: string
  modalType: ModalType
  onNavigate: (type: ModalType, key: string) => void
  toggleBookmark: (key: string, type: ModalType) => void
  /** Escape 触发：取消选中文本 / 关闭工具栏 */
  onCancelSelection: () => void
}

const SHORTCUTS = {
  next: ['j', 'J'],
  prev: ['k', 'K'],
  bookmark: ['b', 'B'],
  cancel: ['Escape'],
} as const

const matches = (key: string, candidates: readonly string[]) => candidates.includes(key)

/**
 * ModalReader 内的键盘快捷键 effect 抽出。
 *
 * - j / J → 下一章
 * - k / K → 上一章
 * - b / B → 书签切换
 * - Escape → 取消选区
 *
 * INPUT / TEXTAREA focus 时全部忽略（让用户能正常输入）。
 */
export function useChapterShortcuts(params: UseChapterShortcutsParams) {
  const { chapters, modalKey, modalType, onNavigate, toggleBookmark, onCancelSelection } = params

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (matches(e.key, SHORTCUTS.cancel)) {
        onCancelSelection()
        return
      }
      const currentIdx = modalKey ? chapters.findIndex(c => c.name === modalKey) : -1
      if (matches(e.key, SHORTCUTS.next) && currentIdx >= 0 && currentIdx < chapters.length - 1)
        onNavigate(modalType, chapters[currentIdx + 1].name)
      if (matches(e.key, SHORTCUTS.prev) && currentIdx > 0)
        onNavigate(modalType, chapters[currentIdx - 1].name)
      if (matches(e.key, SHORTCUTS.bookmark)) {
        if (modalKey) toggleBookmark(modalKey, modalType)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [chapters, modalKey, modalType, onNavigate, toggleBookmark, onCancelSelection])
}
