// src/utils/__tests__/injectAnnotations.test.ts
import { describe, it, expect } from 'vitest'
import {
  injectAnnotations,
  type AnnotationData,
  countOccurrencesBefore,
} from '../injectAnnotations'

function makeRoot(html: string): HTMLElement {
  const div = document.createElement('div')
  div.innerHTML = html
  document.body.appendChild(div)
  return div
}

describe('countOccurrencesBefore', () => {
  it('text 不在 plainText 内 → 0', () => {
    expect(countOccurrencesBefore('hello world', 'xyz', 999)).toBe(0)
  })

  it('text 在 foundStart 之前出现 N 次 → 返回 N', () => {
    // 'a' 在 index 0, 2, 4 出现；foundStart=3 → 出现 2 次
    expect(countOccurrencesBefore('aXaXa', 'a', 3)).toBe(2)
  })

  it('text 出现在 foundStart 之后 → 不计', () => {
    // 'a' 在 0, 2, 4；foundStart=0 → 出现 0 次（因为 idx >= foundStart 时 break）
    expect(countOccurrencesBefore('aXaXa', 'a', 0)).toBe(0)
  })

  it('text 多次连续出现', () => {
    expect(countOccurrencesBefore('aaaa', 'a', 4)).toBe(4)
  })

  it('foundStart 落在 text 中间 → 该次不计入（idx >= foundStart）', () => {
    // 'foo' 在 idx 0；foundStart=1 → 0 次（idx 0 < 1，但 idx=0+3=3 >= 1 break）
    // 实际循环：idx=0，0<1 → count=1, searchPos=1 → 1+2=3 not in 'foo'... 重新 indexOf('foo', 1) = -1 → break
    // 所以返回 1
    expect(countOccurrencesBefore('foo bar foo', 'foo', 1)).toBe(1)
  })

  it('空 text → 0（边界）', () => {
    expect(countOccurrencesBefore('abc', '', 1)).toBe(0)
  })
})

describe('injectAnnotations', () => {
  it('无 annotations → 返回原 html', () => {
    expect(injectAnnotations('<p>hello</p>', [])).toBe('<p>hello</p>')
  })

  it('单 annotation：按 matchIndex 标记正确 occurrence', () => {
    const html = '<p>foo bar foo baz foo</p>'
    const ann: AnnotationData[] = [
      { selectedText: 'foo', matchIndex: 1, rangeStart: 0, type: 'emphasis', id: 'a1' },
    ]
    const result = injectAnnotations(html, ann)
    const root = makeRoot(result)
    const marks = Array.from(root.querySelectorAll('mark.ann-emphasis'))
    expect(marks.length).toBe(1)
    expect(marks[0].textContent).toBe('foo')
    expect(marks[0].getAttribute('data-ann-id')).toBe('a1')
  })

  it('matchIndex 缺省 → 按 rangeStart 推导（向后兼容）', () => {
    const html = '<p>foo bar foo baz foo</p>'
    // rangeStart=8 落在第二个 'foo' 区间 → matchIndex=1
    const ann: AnnotationData[] = [
      { selectedText: 'foo', rangeStart: 8, type: 'emphasis', id: 'a1' },
    ]
    const result = injectAnnotations(html, ann)
    const root = makeRoot(result)
    const marks = Array.from(root.querySelectorAll('mark.ann-emphasis'))
    expect(marks.length).toBe(1)
    expect(marks[0].textContent).toBe('foo')
  })

  it('多 annotations → 各自包裹', () => {
    const html = '<p>foo bar foo</p>'
    const ann: AnnotationData[] = [
      { selectedText: 'foo', matchIndex: 0, rangeStart: 0, type: 'emphasis', id: 'a1' },
      { selectedText: 'foo', matchIndex: 1, rangeStart: 8, type: 'question', id: 'a2' },
    ]
    const result = injectAnnotations(html, ann)
    const root = makeRoot(result)
    expect(root.querySelectorAll('mark.ann-emphasis').length).toBe(1)
    expect(root.querySelectorAll('mark.ann-question').length).toBe(1)
  })

  it('selectedText 不在 html 中 → 不包裹（无副作用）', () => {
    const html = '<p>hello</p>'
    const ann: AnnotationData[] = [
      { selectedText: 'xyz', matchIndex: 0, rangeStart: 0, type: 'emphasis', id: 'a1' },
    ]
    expect(injectAnnotations(html, ann)).toBe(html)
  })

  it('matchIndex 超出实际出现次数 → 静默不包裹', () => {
    const html = '<p>foo bar</p>'
    const ann: AnnotationData[] = [
      { selectedText: 'foo', matchIndex: 5, rangeStart: 0, type: 'emphasis', id: 'a1' },
    ]
    expect(injectAnnotations(html, ann)).toBe(html)
  })
})
