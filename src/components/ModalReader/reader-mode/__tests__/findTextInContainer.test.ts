import { describe, it, expect } from 'vitest'
import { findTextInContainer } from '../findTextInContainer'

function makeContainer(html: string): HTMLElement {
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}

describe('findTextInContainer', () => {
  it('找不到返回 null', () => {
    const c = makeContainer('<p>hello</p>')
    expect(findTextInContainer(c, 'xxx')).toBeNull()
  })

  it('目标在 p 内返回 blockIdx=0', () => {
    const c = makeContainer('<p>hello world</p>')
    const loc = findTextInContainer(c, 'world')
    expect(loc).not.toBeNull()
    expect(loc!.blockIdx).toBe(0)
    expect(loc!.offsetInBlock).toBe(6)
  })

  it('目标在第二个 block 返回 blockIdx=1', () => {
    const c = makeContainer('<p>aaa</p><p>bbb target ccc</p>')
    const loc = findTextInContainer(c, 'target')
    expect(loc).not.toBeNull()
    expect(loc!.blockIdx).toBe(1)
    expect(loc!.offsetInBlock).toBe(4)
  })

  it('匹配节点的 Text 引用能拿回原串', () => {
    const c = makeContainer('<p>foo BAR baz</p>')
    const loc = findTextInContainer(c, 'BAR')!
    expect(loc.node.textContent?.slice(loc.nodeOffset, loc.nodeOffset + 3)).toBe('BAR')
  })

  it('blockIdx 与容器 children 下标一致', () => {
    const c = makeContainer('<h2>x</h2><p>y</p><table><tr><td>z</td></tr></table>')
    const loc = findTextInContainer(c, 'z')!
    expect(loc.blockIdx).toBe(2)
  })
})
