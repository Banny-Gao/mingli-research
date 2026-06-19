// src/components/ModalReader/useSelectionToolbar.ts
import { useCallback } from 'react'
import { findTextNodeByAnchor } from '../../utils/domWalk'
import { countOccurrencesBefore } from '../../utils/injectAnnotations'

const TOOLBAR_Y_OFFSET = 8

interface UseSelectionToolbarParams {
  containerRef: React.RefObject<HTMLDivElement | null>
  /** 用户选择后 toolbar 位置 + 选区信息回调 */
  onSelect: (
    position: { x: number; y: number },
    selection: {
      text: string
      start: number
      end: number
      matchIndex: number
    }
  ) => void
}

interface UseSelectionToolbarResult {
  /** 处理 mouseup / touchend 事件 */
  handleSelection: (e: React.MouseEvent | React.TouchEvent) => void
}

/**
 * 文本选区 → 反算扁平字符索引 → 触发 toolbar 显示。
 *
 * 算法步骤：
 * 1. 检查 window.getSelection() 有效性（非 collapsed、非空）
 * 2. findTextNodeByAnchor 反算选区起点的扁平字符索引
 * 3. countOccurrencesBefore 推导选中文本在 foundStart 之前出现次数（matchIndex）
 * 4. setToolbarPos + setPendingSelection 通知父组件
 *
 * 跨 Mouse / Touch 事件统一通过 'touches' in e 判别取 clientX/Y。
 */
export function useSelectionToolbar({
  containerRef,
  onSelect,
}: UseSelectionToolbarParams): UseSelectionToolbarResult {
  const handleSelection = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !containerRef.current) return
      const text = sel.toString().trim()
      if (!text) return

      const range = sel.getRangeAt(0)
      const foundStart = findTextNodeByAnchor(
        containerRef.current,
        range.startContainer,
        range.startOffset
      )
      if (foundStart === null) return

      const matchIndex = countOccurrencesBefore(
        containerRef.current.textContent || '',
        text,
        foundStart
      )

      // TouchEvent 走 changedTouches[0]；MouseEvent 走 clientX/Y。
      // 'touches' in e 不可靠（SyntheticEvent 类型 cast），用结构化判别。
      const touch = (e as React.TouchEvent).changedTouches?.[0]
      const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX
      const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY
      onSelect(
        { x: clientX, y: clientY - TOOLBAR_Y_OFFSET },
        { text, start: foundStart, end: foundStart + text.length, matchIndex }
      )
    },
    [containerRef, onSelect]
  )

  return { handleSelection: handleSelection }
}
