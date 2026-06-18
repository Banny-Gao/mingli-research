// src/utils/__tests__/flashMarkHighlight.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flashMarkHighlight, AUTO_FADE_MS } from '../flashMarkHighlight'

function makeRoot(html: string): HTMLElement {
  const div = document.createElement('div')
  div.innerHTML = html
  document.body.appendChild(div)
  return div
}

describe('flashMarkHighlight', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('单 text node 命中：包裹 mark.search-flash', () => {
    const root = makeRoot('前文abc后文')
    expect(() => flashMarkHighlight('abc', root)).not.toThrow()
    const mark = root.querySelector('mark.search-flash')
    expect(mark).not.toBeNull()
    expect(mark?.textContent).toBe('abc')
  })

  it('AUTO_FADE_MS 后还原为原始文本', () => {
    const root = makeRoot('前文abc后文')
    flashMarkHighlight('abc', root)
    expect(root.querySelector('mark.search-flash')).not.toBeNull()
    vi.advanceTimersByTime(AUTO_FADE_MS)
    expect(root.querySelector('mark.search-flash')).toBeNull()
    expect(root.textContent).toBe('前文abc后文')
  })

  it('未命中：静默 return（不抛错、不调 onConsume）', () => {
    const root = makeRoot('不含目标')
    const onConsume = vi.fn()
    expect(() => flashMarkHighlight('xyz', root, onConsume)).not.toThrow()
    expect(root.querySelector('mark.search-flash')).toBeNull()
    expect(onConsume).not.toHaveBeenCalled()
  })

  it('命中：fade 完成时调 onConsume 一次', () => {
    // 实际行为：onConsume 在 fade 定时器回调里调（命中后 4s）
    const root = makeRoot('abc')
    const onConsume = vi.fn()
    flashMarkHighlight('abc', root, onConsume)
    expect(onConsume).not.toHaveBeenCalled()
    vi.advanceTimersByTime(AUTO_FADE_MS)
    expect(onConsume).toHaveBeenCalledTimes(1)
  })

  // ── 跨 text node 拼接 ──
  it('跨相邻 text node 命中：拼接多段文本', () => {
    // <span>ab</span><span>cd</span>，搜 "bcd"：跨两个 text node
    // 实际行为：产生两个 mark 节点（每个 text node 一个），拼起来 = 'bcd'
    const root = makeRoot('<span>ab</span><span>cd</span>')
    flashMarkHighlight('bcd', root)
    const marks = Array.from(root.querySelectorAll('mark.search-flash'))
    expect(marks.length).toBeGreaterThanOrEqual(1)
    expect(marks.map(m => m.textContent).join('')).toBe('bcd')
    vi.advanceTimersByTime(AUTO_FADE_MS)
    expect(root.textContent).toBe('abcd')
  })

  it('跨嵌套 text node 命中：<p><strong>ab</strong>cd</p> 搜 "bcd"', () => {
    const root = makeRoot('<p><strong>ab</strong>cd</p>')
    flashMarkHighlight('bcd', root)
    const marks = Array.from(root.querySelectorAll('mark.search-flash'))
    expect(marks.length).toBeGreaterThanOrEqual(1)
    expect(marks.map(m => m.textContent).join('')).toBe('bcd')
  })
})
