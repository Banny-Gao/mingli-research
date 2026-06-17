// src/components/ModalReader/reader-mode/__tests__/splitMarkdownByBlocks.test.ts
import { describe, it, expect } from 'vitest'
import { splitMarkdownByBlocks } from '../splitMarkdownByBlocks'

describe('splitMarkdownByBlocks', () => {
  it('空字符串返回空数组', () => {
    expect(splitMarkdownByBlocks('')).toEqual([])
    expect(splitMarkdownByBlocks('   \n  ')).toEqual([])
  })

  it('单段落返回一个 block', () => {
    const md = 'hello world'
    const result = splitMarkdownByBlocks(md)
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0]).toContain('hello world')
  })

  it('多顶级 block 返回对应数量', () => {
    const md = '# h1\n\nparagraph\n\n## h2\n\nanother paragraph'
    const result = splitMarkdownByBlocks(md)
    expect(result.length).toBeGreaterThanOrEqual(3)
  })

  it('含 code block 不被切碎', () => {
    const md = 'p1\n\n```\nline1\nline2\nline3\n```\n\np2'
    const result = splitMarkdownByBlocks(md)
    const all = result.join('')
    expect(all).toContain('line1')
    expect(all).toContain('line3')
  })

  it('mermaid code block 整块不切', () => {
    const md = 'p1\n\n```mermaid\ngraph TD;\nA-->B\n```\n\np2'
    const result = splitMarkdownByBlocks(md)
    const all = result.join('')
    expect(all).toContain('graph TD;')
    expect(all).toContain('A-->B')
  })

  it('含 <mark> 标签的段落不丢失标签', () => {
    const md = '# 标题\n\n<mark class="ann-emphasis" data-ann-id="a1">标注文本</mark>，后续内容。'
    const result = splitMarkdownByBlocks(md)
    const all = result.join('')
    expect(all).toContain('<mark class="ann-emphasis"')
    expect(all).toContain('</mark>')
    expect(all).toContain('标注文本')
  })

  it('table 块不切', () => {
    const md = 'p1\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\np2'
    const result = splitMarkdownByBlocks(md)
    const all = result.join('')
    expect(all).toContain('| a | b |')
  })

  it('拼回后文本内容一致（忽略 remark 列表标记符差异）', () => {
    const md = '# h1\n\np1\n\n- item 1\n- item 2\n\np2'
    const result = splitMarkdownByBlocks(md)
    const rejoined = result.join('\n\n')
    // 验证关键文本都在
    expect(rejoined).toContain('# h1')
    expect(rejoined).toContain('p1')
    expect(rejoined).toContain('item 1')
    expect(rejoined).toContain('item 2')
    expect(rejoined).toContain('p2')
  })
})
