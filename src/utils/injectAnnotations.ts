import { walkTextNodes } from './domWalk'

export interface AnnotationData {
  selectedText: string
  matchIndex?: number
  rangeStart: number
  type: string
  id: string
}

/**
 * 统计 text 在 plainText 中 foundStart 之前出现了几次。
 *
 * 用于从"用户选区起点（扁平字符索引）"反推第几个 occurrence，以便后续
 * 注入 mark 时能精确标记对应位置（不同 occurrence 的 mark 互相独立）。
 *
 * 行为：
 * - needle 为空或 plainText 不含 needle → 0
 * - 统计 idx < foundStart 的命中次数；idx === foundStart 不算（视为"从该位置开始的新区域"）
 */
export function countOccurrencesBefore(
  plainText: string,
  needle: string,
  foundStart: number
): number {
  if (!needle) return 0
  let count = 0
  let searchPos = 0
  while (true) {
    const idx = plainText.indexOf(needle, searchPos)
    if (idx === -1 || idx >= foundStart) break
    count++
    searchPos = idx + 1
  }
  return count
}

/**
 * 注入批注高亮到 HTML 字符串
 * @param html - 原始 HTML 字符串
 * @param annotations - 批注数组
 * @returns 注入高亮标记后的 HTML
 */
export function injectAnnotations(html: string, annotations: AnnotationData[]): string {
  if (annotations.length === 0 || typeof document === 'undefined') return html
  const div = document.createElement('div')
  div.innerHTML = html

  for (const ann of annotations) {
    // Determine which occurrence of the text to mark.
    // Use matchIndex if available (new data), otherwise derive from rangeStart (legacy).
    let targetOccurrence: number
    if (ann.matchIndex !== undefined) {
      targetOccurrence = ann.matchIndex
    } else {
      targetOccurrence = countOccurrencesBefore(
        div.textContent || '',
        ann.selectedText,
        ann.rangeStart
      )
    }

    wrapNthOccurrence(div, ann.selectedText, targetOccurrence, text => {
      const mark = document.createElement('mark')
      mark.className = `ann-${ann.type}`
      mark.dataset.annId = ann.id
      mark.textContent = text
      return mark
    })
  }
  return div.innerHTML
}

/**
 * 在 root 子树中找 needle 的第 n 次出现，包裹为 wrapFn 返回的元素。
 * 返回是否找到并替换。
 *
 * 纯函数（除 DOM 副作用外无状态）：用 walkTextNodes 做 DFS，每节点内 indexOf 计数。
 * 中途 found = true 即停止（短路）。
 */
function wrapNthOccurrence(
  root: HTMLElement,
  needle: string,
  n: number,
  wrapFn: (matchedText: string) => Element
): boolean {
  if (!needle) return false
  let occurrence = 0
  let found = false
  walkTextNodes(root, node => {
    if (found) return false
    const nodeText = node.textContent || ''
    let localSearchStart = 0
    while (true) {
      const foundIdx = nodeText.indexOf(needle, localSearchStart)
      if (foundIdx === -1) return true // 继续下一个 text node

      if (occurrence === n) {
        const matched = nodeText.slice(foundIdx, foundIdx + needle.length)
        const before = nodeText.slice(0, foundIdx)
        const after = nodeText.slice(foundIdx + needle.length)
        const wrapper = wrapFn(matched)
        const frag = document.createDocumentFragment()
        frag.appendChild(document.createTextNode(before))
        frag.appendChild(wrapper)
        frag.appendChild(document.createTextNode(after))
        node.parentNode?.replaceChild(frag, node)
        found = true
        return false
      }

      occurrence++
      localSearchStart = foundIdx + 1
    }
  })
  return found
}
