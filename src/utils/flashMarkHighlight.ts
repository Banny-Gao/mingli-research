// src/utils/flashMarkHighlight.ts

/**
 * 在 root 内查找 searchText 首次出现位置，将对应字符包裹 <mark class="search-flash">。
 * AUTO_FADE_MS 后还原为原始文本节点。
 *
 * - 跨 text node：先命中 text node 取部分，再走 nextSibling 继续拼接
 * - 未命中：静默 return
 *
 * 接受 onConsume 回调；调用时机：闪黄完成（命中并包裹后）或命中/未命中。
 * 纯函数：仅依赖入参与 DOM API；用 vi.useFakeTimers 控制 fade 时机。
 */
export const AUTO_FADE_MS = 4000

export function flashMarkHighlight(
  searchText: string,
  root: HTMLElement,
  onConsume?: () => void
): void {
  const container = root
  const plainText = container.textContent || ''
  let charCount = 0
  let targetNode: Text | null = null
  let targetOffset = 0
  const walk = (node: Node) => {
    if (targetNode) return
    if (node.nodeType === Node.TEXT_NODE) {
      const t = (node as Text).textContent || ''
      const nextCount = charCount + t.length
      if (searchTextId < nextCount) {
        targetNode = node as Text
        targetOffset = searchTextId - charCount
        return
      }
      charCount = nextCount
    } else {
      for (const child of Array.from(node.childNodes)) {
        walk(child)
        if (targetNode) return
      }
    }
  }
  const searchTextId = plainText.indexOf(searchText)
  if (searchTextId < 0) return
  walk(container)
  if (!targetNode) return

  let current: Text | null = targetNode
  let offset = targetOffset
  let remaining = searchText.length
  // 跨 text node 拼接：每次 replaceChild 后，原 `current` 已脱离 DOM，
  // 必须用其父节点（DOM 仍在的位置）走 nextSibling 找到下一个 text 节点。
  // `restoreIdx` 记录首个 mark 在其父节点中的位置，用于 fade 时还原。
  let restoreIdx = -1

  while (current && remaining > 0) {
    const nodeText = current.textContent || ''
    const available = nodeText.length - offset
    const take = Math.min(remaining, Math.max(0, available))
    if (take <= 0) {
      const parent = current.parentNode
      if (!parent) return
      let next: Node | null = parent.nextSibling ? null : null
      let sibling: Node | null = current.nextSibling
      while (sibling) {
        if (sibling.nodeType === Node.TEXT_NODE) {
          next = sibling
          break
        }
        sibling = sibling.nextSibling
      }
      current = next as Text | null
      offset = 0
      continue
    }

    const validOffset = Math.max(0, Math.min(offset, nodeText.length))
    const validEnd = validOffset + take
    const parent = current.parentNode
    if (!parent) return

    const mark = document.createElement('mark')
    mark.className = 'search-flash'
    mark.textContent = nodeText.slice(validOffset, validEnd)
    const before = document.createTextNode(nodeText.slice(0, validOffset))
    const after = document.createTextNode(nodeText.slice(validEnd))
    const frag = document.createDocumentFragment()
    frag.appendChild(before)
    frag.appendChild(mark)
    frag.appendChild(after)
    const idx = Array.from(parent.childNodes).indexOf(current)
    parent.replaceChild(frag, current)
    if (restoreIdx < 0) restoreIdx = idx

    remaining -= take
    if (remaining <= 0) {
      setTimeout(() => {
        if (!parent || restoreIdx < 0) {
          onConsume?.()
          return
        }
        const a = parent.childNodes[restoreIdx] as Text
        const b = parent.childNodes[restoreIdx + 1] as HTMLElement
        const c = parent.childNodes[restoreIdx + 2] as Text
        const combined = document.createTextNode(a.textContent! + b.textContent! + c.textContent!)
        parent.replaceChild(combined, parent.childNodes[restoreIdx])
        parent.removeChild(parent.childNodes[restoreIdx + 1])
        parent.removeChild(parent.childNodes[restoreIdx + 1])
        onConsume?.()
      }, AUTO_FADE_MS)
      return
    }

    // 关键修复：原代码用 current.nextSibling 找下一个 text 节点，
    // 但 replaceChild 后 current 已脱离 DOM，nextSibling=null。
    // 改用 TreeWalker 沿 DOM 树向下找下一个 text 节点（自然处理跨 span/嵌套边界）。
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    walker.currentNode = after
    current = walker.nextNode() as Text | null
    offset = 0
  }

  onConsume?.()
}
