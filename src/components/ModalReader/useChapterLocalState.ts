// src/components/ModalReader/useChapterLocalState.ts
import { useEffect, useRef, useState, useCallback } from 'react'

export interface ChapterLocalState {
  toolbarPos: { x: number; y: number } | null
  showPanel: boolean
  pendingSelection: {
    text: string
    start: number
    end: number
    matchIndex: number
  } | null
  tocOpen: boolean
  headerVisible: boolean
}

const DEFAULT_STATE: ChapterLocalState = {
  toolbarPos: null,
  showPanel: false,
  pendingSelection: null,
  tocOpen: false,
  headerVisible: true,
}

/**
 * ModalReader 内的"章节本地 UI 状态"集中管理。
 *
 * 职责：
 * - 暴露 toolbarPos / showPanel / pendingSelection / tocOpen / headerVisible + setter
 * - modalKey 变化（章节身份切换）时自动 reset 到默认值
 * - 暴露 reset() 供其他需要主动清除的 effect 调用
 *
 * 与父级 ModalReader 的 `setLoadedContent` 无关——那些是
 * 数据加载状态，归属各自 effect；本 hook 只管"用户交互 / 跨章节无意义"的 UI 标志。
 */
export function useChapterLocalState(modalKey: string) {
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(
    DEFAULT_STATE.toolbarPos
  )
  const [showPanel, setShowPanel] = useState<boolean>(DEFAULT_STATE.showPanel)
  const [pendingSelection, setPendingSelection] = useState<ChapterLocalState['pendingSelection']>(
    DEFAULT_STATE.pendingSelection
  )
  const [tocOpen, setTocOpen] = useState<boolean>(DEFAULT_STATE.tocOpen)
  const [headerVisible, setHeaderVisible] = useState<boolean>(DEFAULT_STATE.headerVisible)

  const reset = useCallback(() => {
    setToolbarPos(null)
    setShowPanel(false)
    setPendingSelection(null)
    setTocOpen(false)
    setHeaderVisible(true)
  }, [])

  // 章节身份变化时自动 reset（与父级 prevKeyRef + effect 等价）
  const prevKeyRef = useRef(modalKey)
  useEffect(() => {
    if (prevKeyRef.current !== modalKey) {
      prevKeyRef.current = modalKey
      reset()
    }
  }, [modalKey, reset])

  return {
    toolbarPos,
    setToolbarPos,
    showPanel,
    setShowPanel,
    pendingSelection,
    setPendingSelection,
    tocOpen,
    setTocOpen,
    headerVisible,
    setHeaderVisible,
    reset,
  }
}
