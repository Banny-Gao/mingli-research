import { describe, it, expect } from 'vitest'
import { splitMarkdownByBlocks } from '../splitMarkdownByBlocks'

describe('splitMarkdownByBlocks', () => {
  it('空字符串返回空数组', () => {
    expect(splitMarkdownByBlocks('')).toEqual([])
  })

  it('单段 md 切 1 份', () => {
    const md = '# 标题\n\n段落。'
    const result = splitMarkdownByBlocks(md)
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result.join('').trim()).toBe(md.trim())
  })

  it('多 block 切多份, 拼回近似原串', () => {
    const md = '# h1\n\np1\n\n## h2\n\np2\n\n```js\ncode\n```\n\np3'
    const result = splitMarkdownByBlocks(md)
    expect(result.length).toBeGreaterThanOrEqual(3)
    const joined = result.map(s => s.trim()).join('\n\n')
    expect(joined).toContain('# h1')
    expect(joined).toContain('p1')
    expect(joined).toContain('```js')
    expect(joined).toContain('p3')
  })

  it('含 code block 不被切碎', () => {
    const md = 'p1\n\n```\nline1\nline2\nline3\n```\n\np2'
    const result = splitMarkdownByBlocks(md)
    const all = result.join('')
    expect(all).toContain('line1\nline2\nline3')
  })

  it('mermaid code block 整块不切', () => {
    const md = 'p1\n\n```mermaid\ngraph TD;\nA-->B\n```\n\np2'
    const result = splitMarkdownByBlocks(md)
    const all = result.join('')
    expect(all).toContain('graph TD;\nA-->B')
  })

  it('table 整块不切', () => {
    const md = 'p1\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\np2'
    const result = splitMarkdownByBlocks(md)
    const all = result.join('')
    expect(all).toContain('| a | b |')
  })
})
