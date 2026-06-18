// src/components/ModalReader/reader-mode/__tests__/groupBlocksIntoPages.test.ts
import { describe, it, expect } from 'vitest'
import { groupBlocksIntoPages } from '../groupBlocksIntoPages'
import type { PaginatedPage, MarkdownBlock } from '../types'

describe('groupBlocksIntoPages', () => {
  it('空数组返回空数组', () => {
    expect(groupBlocksIntoPages([], [])).toEqual([])
  })

  it('单个 block 对应单个 page', () => {
    const blocks: MarkdownBlock[] = [{ md: '# hello\n\nworld' }]
    const pages: PaginatedPage[] = [{ index: 0, startBlockIdx: 0, endBlockIdx: 0, blockCount: 1 }]
    expect(groupBlocksIntoPages(blocks, pages)).toEqual(['# hello\n\nworld'])
  })

  it('多个 block 组装到多个 page（贪心装页模拟）', () => {
    const blocks: MarkdownBlock[] = [
      { md: 'block-0' },
      { md: 'block-1' },
      { md: 'block-2' },
      { md: 'block-3' },
      { md: 'block-4' },
    ]
    const pages: PaginatedPage[] = [
      { index: 0, startBlockIdx: 0, endBlockIdx: 1, blockCount: 2 },
      { index: 1, startBlockIdx: 2, endBlockIdx: 3, blockCount: 2 },
      { index: 2, startBlockIdx: 4, endBlockIdx: 4, blockCount: 1 },
    ]
    const result = groupBlocksIntoPages(blocks, pages)
    expect(result).toHaveLength(3)
    expect(result[0]).toBe('block-0\n\nblock-1')
    expect(result[1]).toBe('block-2\n\nblock-3')
    expect(result[2]).toBe('block-4')
  })

  it('page 的 start/end 指向同一 block 时只取一个', () => {
    const blocks: MarkdownBlock[] = [{ md: 'single-block' }]
    const pages: PaginatedPage[] = [{ index: 0, startBlockIdx: 0, endBlockIdx: 0, blockCount: 1 }]
    expect(groupBlocksIntoPages(blocks, pages)).toEqual(['single-block'])
  })

  it('包含 <mark> 标签的 block 不被破坏', () => {
    const blocks: MarkdownBlock[] = [
      { md: '# 标题' },
      { md: '<mark class="ann-emphasis" data-ann-id="a1">标注文本</mark>，后续内容。' },
      { md: '普通段落' },
    ]
    const pages: PaginatedPage[] = [
      { index: 0, startBlockIdx: 0, endBlockIdx: 2, blockCount: 3 },
    ]
    const result = groupBlocksIntoPages(blocks, pages)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('<mark class="ann-emphasis"')
    expect(result[0]).toContain('标注文本')
    expect(result[0]).toContain('普通段落')
  })

  it('heading metadata 被忽略（输出只用 md 字段）', () => {
    const blocks: MarkdownBlock[] = [
      { md: '## 标题 A', headingId: '标题-a', headingLevel: 2 },
      { md: 'paragraph' },
    ]
    const pages: PaginatedPage[] = [{ index: 0, startBlockIdx: 0, endBlockIdx: 1, blockCount: 2 }]
    expect(groupBlocksIntoPages(blocks, pages)).toEqual(['## 标题 A\n\nparagraph'])
  })
})
