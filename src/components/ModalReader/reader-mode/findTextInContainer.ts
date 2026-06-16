import type { TextLocation } from './types'

/**
 * 在 measure DOM 容器内搜索文本,返回 { blockIdx, offsetInBlock, node, nodeOffset }。
 * blockIdx = 顶级子元素在 container.children 中的下标。
 */
export function findTextInContainer(
  container: HTMLElement,
  searchText: string
): TextLocation | null {
  const needle = searchText.trim()
  if (!needle) return null

  const children = Array.from(container.children)

  for (let i = 0; i < children.length; i++) {
    const block = children[i]
    const text = block.textContent || ''
    const idx = text.indexOf(needle)
    if (idx >= 0) {
      const found = walkForChar(block, idx)
      if (found) {
        return {
          blockIdx: i,
          offsetInBlock: idx,
          node: found.node,
          nodeOffset: found.offset,
        }
      }
    }
  }
  return null
}

function walkForChar(
  root: Node,
  charOffset: number
): { node: Text; offset: number } | null {
  let count = 0
  const walk = (node: Node): { node: Text; offset: number } | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node as Text).textContent || ''
      if (charOffset < count + text.length) {
        return { node: node as Text, offset: charOffset - count }
      }
      count += text.length
    } else {
      for (const child of Array.from(node.childNodes)) {
        const r = walk(child)
        if (r) return r
      }
    }
    return null
  }
  return walk(root)
}
