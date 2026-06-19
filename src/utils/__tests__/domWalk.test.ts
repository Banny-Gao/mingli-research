// src/utils/__tests__/domWalk.test.ts
import { describe, it, expect } from 'vitest'
import {
  findTextNodeByCharIndex,
  replaceTextRangeWithElement,
  walkTextNodes,
  findNextTextNodeAfter,
  findTextNodeByAnchor,
} from '../domWalk'

function makeRoot(html: string): HTMLElement {
  const div = document.createElement('div')
  div.innerHTML = html
  document.body.appendChild(div)
  return div
}

describe('findTextNodeByCharIndex', () => {
  it('单 text node：idx 在中段 → 返回该 node + offset', () => {
    const root = makeRoot('前文abc后文')
    const result = findTextNodeByCharIndex(root, 2)
    expect(result).not.toBeNull()
    expect(result?.node.textContent).toBe('前文abc后文')
    expect(result?.offset).toBe(2)
  })

  it('idx 超出范围 → null', () => {
    const root = makeRoot('abc')
    expect(findTextNodeByCharIndex(root, 99)).toBeNull()
    expect(findTextNodeByCharIndex(root, -1)).toBeNull()
  })

  it('跨相邻 text node：<span>ab</span><span>cd</span>，plainText="abcd"，idx=2 → 第二个 span 的 offset=0', () => {
    const root = makeRoot('<span>ab</span><span>cd</span>')
    const result = findTextNodeByCharIndex(root, 2)
    expect(result).not.toBeNull()
    expect(result?.node.textContent).toBe('cd')
    expect(result?.offset).toBe(0)
  })

  it('跨嵌套 text node：<p><strong>ab</strong>cd</p>，plainText="abcd"，idx=3 → "cd" 的 offset=1', () => {
    const root = makeRoot('<p><strong>ab</strong>cd</p>')
    const result = findTextNodeByCharIndex(root, 3)
    expect(result).not.toBeNull()
    expect(result?.node.textContent).toBe('cd')
    expect(result?.offset).toBe(1)
  })

  it('空 root → null', () => {
    const root = makeRoot('')
    expect(findTextNodeByCharIndex(root, 0)).toBeNull()
  })

  it('deeply nested：3 层 div 嵌套 text node', () => {
    const root = makeRoot('<div><div><span>x</span></div></div>')
    const result = findTextNodeByCharIndex(root, 0)
    expect(result).not.toBeNull()
    expect(result?.node.textContent).toBe('x')
    expect(result?.offset).toBe(0)
  })
})

describe('walkTextNodes', () => {
  it('纯 text 节点：visit 被调 1 次', () => {
    const root = makeRoot('abc')
    const seen: string[] = []
    walkTextNodes(root, node => {
      seen.push(node.textContent || '')
    })
    expect(seen).toEqual(['abc'])
  })

  it('混合嵌套：按 DOM 顺序访问所有 text node', () => {
    const root = makeRoot('<p>hello <strong>world</strong> foo</p>')
    const seen: string[] = []
    walkTextNodes(root, node => {
      seen.push(node.textContent || '')
    })
    expect(seen).toEqual(['hello ', 'world', ' foo'])
  })

  it('visit 返回 false → 提前停止遍历', () => {
    const root = makeRoot('<p>a <strong>b</strong> c</p>')
    const seen: string[] = []
    walkTextNodes(root, node => {
      seen.push(node.textContent || '')
      if (node.textContent === 'b') return false
      return true
    })
    expect(seen).toEqual(['a ', 'b'])
  })

  it('空 root：不调 visit', () => {
    const root = makeRoot('')
    let count = 0
    walkTextNodes(root, () => {
      count++
    })
    expect(count).toBe(0)
  })
})

describe('replaceTextRangeWithElement', () => {
  it('在 text node 中间切出区间，包裹元素，前后保留 text node', () => {
    const root = makeRoot('前文abc后文')
    const textNode = root.firstChild as Text
    const wrapper = document.createElement('mark')
    wrapper.className = 'test-mark'
    wrapper.textContent = 'abc'
    const frag = replaceTextRangeWithElement(textNode, 2, 3, wrapper)
    root.replaceChild(frag, textNode)
    expect(root.textContent).toBe('前文abc后文')
    const mark = root.querySelector('mark.test-mark')
    expect(mark).not.toBeNull()
    expect(mark?.textContent).toBe('abc')
  })

  it('offset=0, length=nodeText.length → 整个 node 替换为 wrapper（含空 text 节点）', () => {
    const root = makeRoot('abc')
    const textNode = root.firstChild as Text
    const wrapper = document.createElement('mark')
    wrapper.textContent = 'abc'
    const frag = replaceTextRangeWithElement(textNode, 0, 3, wrapper)
    root.replaceChild(frag, textNode)
    // frag 总是 [before(text 空), wrapper, after(text 空)]
    expect(root.childNodes.length).toBe(3)
    expect(root.textContent).toBe('abc')
    expect(root.querySelector('mark')?.textContent).toBe('abc')
  })

  it('offset+length 超过 nodeText.length → 截到末尾（before/wrapper/after 三段固定槽位）', () => {
    const root = makeRoot('abc')
    const textNode = root.firstChild as Text
    const wrapper = document.createElement('mark')
    wrapper.textContent = 'abc'
    const frag = replaceTextRangeWithElement(textNode, 0, 99, wrapper)
    root.replaceChild(frag, textNode)
    expect(root.childNodes.length).toBe(3)
    expect(root.textContent).toBe('abc')
  })
})

describe('findNextTextNodeAfter', () => {
  it('同父级 nextSibling：<span>a</span><span>b</span>，从 "a" 后找 → "b"', () => {
    const root = makeRoot('<span>a</span><span>b</span>')
    const a = root.children[0].firstChild as Text
    const next = findNextTextNodeAfter(a, root)
    expect(next?.textContent).toBe('b')
  })

  it('从 element 后找 → 跳到下一个兄弟 element 内部第一个 text 节点', () => {
    const root = makeRoot('<span><strong>x</strong></span><span>y</span>')
    const span1 = root.children[0]
    const next = findNextTextNodeAfter(span1, root)
    expect(next?.textContent).toBe('y')
  })

  it('从 wrapper (mark) 之后找 → 不进入 wrapper 内部，找到 wrapper 后下一个有内容的 text', () => {
    // 关键场景：刚用 mark 包裹 text 后，需要从 mark 之后找下一个有内容的 text
    const root = makeRoot('<span>ab</span><span>cd</span>')
    const span0 = root.children[0]
    const textA = span0.firstChild as Text
    const mark = document.createElement('mark')
    mark.textContent = 'b'
    const frag = replaceTextRangeWithElement(textA, 1, 1, mark)
    span0.replaceChild(frag, textA)
    // span0 结构: <span><空text>a<mark>b</mark><空text></span><span>cd</span>
    // mark 在 span0 中（位置 idx=2），nextSibling 是空 text。findNextTextNodeAfter
    // 跳过同 parent 的空 text，上溯到 span0 找 nextSibling "cd"。
    const next = findNextTextNodeAfter(mark, root)
    expect(next?.textContent).toBe('cd')
  })

  it('从最后节点后找 → null', () => {
    const root = makeRoot('<span>only</span>')
    const span = root.children[0]
    const next = findNextTextNodeAfter(span, root)
    expect(next).toBeNull()
  })

  it('嵌套深层：mark 在 <strong> 内，从 mark 之后找 → 跨出 strong 到 <span> 内的 text', () => {
    const root = makeRoot('<p><strong><span>ab</span></strong><span>cd</span></p>')
    const p = root.children[0]
    const strong = p.children[0]
    const span0 = strong.children[0]
    const textA = span0.firstChild as Text
    const mark = document.createElement('mark')
    mark.textContent = 'b'
    const frag = replaceTextRangeWithElement(textA, 1, 1, mark)
    span0.replaceChild(frag, textA)
    const next = findNextTextNodeAfter(mark, root)
    expect(next?.textContent).toBe('cd')
  })
})

describe('findTextNodeByAnchor', () => {
  it('单 text node：anchor 是该 text 节点本身 + offset 2 → 返回 2', () => {
    const root = makeRoot('前文abc后文')
    const text = root.firstChild as Text
    expect(findTextNodeByAnchor(root, text, 2)).toBe(2)
  })

  it('anchor offset 0 → 返回该 text 节点的扁平起点', () => {
    const root = makeRoot('abc')
    const text = root.firstChild as Text
    expect(findTextNodeByAnchor(root, text, 0)).toBe(0)
  })

  it('anchor offset === nodeText.length → 返回"该节点末尾"扁平索引', () => {
    const root = makeRoot('abc')
    const text = root.firstChild as Text
    expect(findTextNodeByAnchor(root, text, 3)).toBe(3)
  })

  it('跨相邻 text node：anchor 是第二个 span 的 "cd" + offset 1 → 累加 "ab" 长度 = 3', () => {
    const root = makeRoot('<span>ab</span><span>cd</span>')
    const span1 = root.children[1]
    const textB = span1.firstChild as Text
    expect(findTextNodeByAnchor(root, textB, 1)).toBe(3)
  })

  it('跨嵌套 text node：<p><strong>ab</strong>cd</p>，anchor 是 "cd" + offset 1 → 累加 "ab" = 3', () => {
    const root = makeRoot('<p><strong>ab</strong>cd</p>')
    const p = root.children[0]
    const textCd = p.lastChild as Text
    expect(findTextNodeByAnchor(root, textCd, 1)).toBe(3)
  })

  it('anchor 是 element 节点（非 text）→ null', () => {
    const root = makeRoot('<p>abc</p>')
    const p = root.firstChild as Element
    expect(findTextNodeByAnchor(root, p, 0)).toBeNull()
  })

  it('anchor 不在 root 子树内 → null', () => {
    const root = makeRoot('<span>abc</span>')
    const orphan = document.createTextNode('orphan')
    document.body.appendChild(orphan)
    try {
      expect(findTextNodeByAnchor(root, orphan, 0)).toBeNull()
    } finally {
      document.body.removeChild(orphan)
    }
  })

  it('负 offset / 超出 length 的 offset → null（边界守卫）', () => {
    const root = makeRoot('abc')
    const text = root.firstChild as Text
    expect(findTextNodeByAnchor(root, text, -1)).toBeNull()
    expect(findTextNodeByAnchor(root, text, 99)).toBeNull()
  })

  it('round-trip：findTextNodeByCharIndex 与 findTextNodeByAnchor 互逆', () => {
    const root = makeRoot('<p><strong>ab</strong>cd</p>')
    const p = root.children[0]
    const textCd = p.lastChild as Text
    const charIdx = findTextNodeByAnchor(root, textCd, 1)
    expect(charIdx).toBe(3)
    const located = findTextNodeByCharIndex(root, charIdx!)
    expect(located).not.toBeNull()
    expect(located?.node).toBe(textCd)
    expect(located?.offset).toBe(1)
  })
})
