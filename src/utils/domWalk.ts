// src/utils/domWalk.ts
/**
 * DOM 文本遍历原语。被 ModalReader、flashMarkHighlight、injectAnnotations 等共享。
 *
 * 五个原语覆盖最常见的需求：
 * - findTextNodeByCharIndex：按"扁平化后的字符索引"找 text node + 节点内偏移
 * - findTextNodeByAnchor：上述的反向操作 —— 按 (anchorNode, anchorOffset) 找扁平字符索引
 * - walkTextNodes：通用 text node DFS 遍历（visit 返回 false 提前终止）
 * - replaceTextRangeWithElement：在 text node 内切出 [offset, offset+length) 区间，
 *   包裹为指定元素；返回 DocumentFragment（外层 replaceChild 后即生效）
 * - findNextTextNodeAfter：从某节点之后找下一个非空 text 节点（用于跨 text node 拼接）
 */

/**
 * 在 root 的 textContent 扁平序列中，按 charIndex 找到对应的 text node + 节点内偏移。
 *
 * 行为：
 * - charIndex < 0 或 charIndex ≥ plainText.length → null
 * - 跨 text node、跨嵌套 element 都会自然处理（深度优先遍历 childNodes）
 * - 返回的 node 是真实存在的 text 节点（非元素节点）
 */
export function findTextNodeByCharIndex(
  root: HTMLElement,
  charIndex: number
): { node: Text; offset: number } | null {
  if (charIndex < 0) return null
  const plainText = root.textContent || ''
  if (charIndex >= plainText.length) return null

  let charCount = 0
  let result: { node: Text; offset: number } | null = null

  walkTextNodes(root, node => {
    const t = node.textContent || ''
    const nextCount = charCount + t.length
    if (charIndex < nextCount) {
      result = { node, offset: charIndex - charCount }
      return false
    }
    charCount = nextCount
    return true
  })

  return result
}

/**
 * 上述的原语的反向操作：按 DOM 选区 (anchorNode, anchorOffset) 找扁平化字符索引。
 *
 * 设计动机：ModalReader 的 handleMouseUp 需要从 window.getSelection() 拿到的
 * Range 起始位置，反算其在 container.textContent 中的字符索引（用于后续匹配
 * 文本出现位置 → matchIndex）。
 *
 * 行为：
 * - anchorNode 必须是 root 子树内的 text 节点；否则 null（element 节点是"位置"但不含字符）
 * - offset 越界（< 0 或 > anchorNode.length）→ null
 * - anchorNode 不在 root 子树内 → null
 * - 与 findTextNodeByCharIndex 互逆（round-trip 测试见 __tests__/domWalk.test.ts）
 */
export function findTextNodeByAnchor(
  root: HTMLElement,
  anchorNode: Node,
  anchorOffset: number
): number | null {
  if (anchorNode.nodeType !== Node.TEXT_NODE) return null
  if (anchorOffset < 0 || anchorOffset > (anchorNode.textContent || '').length) return null

  let charCount = 0
  let result: number | null = null
  walkTextNodes(root, node => {
    if (node === anchorNode) {
      result = charCount + anchorOffset
      return false
    }
    charCount += (node.textContent || '').length
    return true
  })
  return result
}

/**
 * 深度优先遍历 root 下所有 text node。
 *
 * - 按 DOM 文档顺序（DFS pre-order）逐个调 visit
 * - visit 返回 false → 停止后续遍历（早退）
 * - visit 不返回值 / 返回 truthy → 继续
 */
export function walkTextNodes(root: Element, visit: (node: Text) => boolean | void): void {
  const stack: Node[] = [root]
  while (stack.length > 0) {
    const node = stack.pop()!
    if (node.nodeType === Node.TEXT_NODE) {
      const proceed = visit(node as Text)
      if (proceed === false) return
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // 倒序入栈 → 保持文档顺序（从左到右）
      const children = Array.from(node.childNodes)
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i])
      }
    }
  }
}

/**
 * 在 text node 中切出 [offset, offset+length) 区间，包裹为 element。
 *
 * 行为：
 * - 返回 DocumentFragment，外层调用 replaceChild(frag, textNode) 即可生效
 * - offset 越界（< 0 或 > nodeText.length）→ 钳到合法范围
 * - length 越界 → 钳到 offset 到节点末尾
 * - offset === nodeText.length → 返回仅含 wrapper 的 fragment
 */
export function replaceTextRangeWithElement(
  textNode: Text,
  offset: number,
  length: number,
  wrapper: Element
): DocumentFragment {
  const nodeText = textNode.textContent || ''
  const validOffset = Math.max(0, Math.min(offset, nodeText.length))
  const validEnd = Math.max(validOffset, Math.min(offset + length, nodeText.length))

  // 总是返回 [before, wrapper, after] 三段（含空 text 节点）。
  // flashMarkHighlight 的 fade 还原按 [idx, idx+1, idx+2] 取节点合并。
  // 某些消费方（如 findNextTextNodeAfter）需要在三个固定槽位里走遍历。
  const frag = document.createDocumentFragment()
  frag.appendChild(document.createTextNode(nodeText.slice(0, validOffset)))
  frag.appendChild(wrapper)
  frag.appendChild(document.createTextNode(nodeText.slice(validEnd)))
  return frag
}

/**
 * 在 root 的 DOM 树中，从 `node` 之后找下一个非空 text 节点（不进入 node 内部）。
 *
 * 设计动机：调用方刚用 replaceChild 替换了某 text node，需要从包裹 wrapper 之后
 * 继续遍历；用 TreeWalker 配合 currentNode=wrapper 会进入 wrapper 内部 text child，
 * 此原语直接处理这种"跳过锚点自身"场景。
 *
 * 行为：
 * - 起点 = node 之后的位置（firstNodeAfter）
 * - 跳过空 text 节点（replaceTextRangeWithElement 的三段式 frag 会在 wrapper 前后
 *   插入空 text 节点）
 * - 跨 element 边界自然处理
 * - 找不到 → null
 *
 * 算法分解为 3 步：
 *   1. findAncestorWithNextSibling(node, root) — 上溯到首个有 nextSibling 的祖先
 *   2. findNextNonEmptyText(start) — 从 start 开始沿 nextSibling 链找非空 text
 *   3. 主函数循环上溯直到找到或耗尽
 */
export function findNextTextNodeAfter(node: Node, root: Element): Text | null {
  let start = findAncestorWithNextSibling(node, root)
  while (start) {
    const found = findNextNonEmptyText(start.nextSibling)
    if (found) return found
    // 当前层无结果，上溯一层
    start = findAncestorWithNextSibling(start.parentNode, root)
  }
  return null
}

/** 从 start 开始，沿 nextSibling 链找下一个非空 text 节点。
 *  - element 节点会进入其子树找首个非空 text
 *  - 空 text 节点跳过
 *  - 链耗尽 → null */
function findNextNonEmptyText(start: Node | null): Text | null {
  let candidate: Node | null = start
  while (candidate) {
    if (candidate.nodeType === Node.TEXT_NODE) {
      if ((candidate.textContent || '').length > 0) return candidate as Text
    } else {
      const inner = firstNonEmptyTextInSubtree(candidate)
      if (inner) return inner
    }
    candidate = candidate.nextSibling
  }
  return null
}

/** 从 node 沿 parent 链上溯，找到首个有 nextSibling 且不等于 root 的祖先。
 *  返回该祖先（其 nextSibling 是"node 之后"的搜索起点）。
 *  找不到（到 root 都无 nextSibling）→ null */
function findAncestorWithNextSibling(node: Node | null, root: Element): Node | null {
  let current: Node | null = node
  while (current && current !== root && !current.nextSibling) {
    current = current.parentNode
  }
  return current === root ? null : current
}

function firstNonEmptyTextInSubtree(root: Node): Text | null {
  const stack: Node[] = [root]
  while (stack.length > 0) {
    const node = stack.pop()!
    if (node.nodeType === Node.TEXT_NODE && (node.textContent || '').length > 0) {
      return node as Text
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const children = Array.from(node.childNodes)
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i])
      }
    }
  }
  return null
}
