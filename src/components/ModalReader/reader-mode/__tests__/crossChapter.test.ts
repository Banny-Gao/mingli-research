import { describe, it, expect } from 'vitest'
import { decideCrossChapter } from '../crossChapter'

describe('decideCrossChapter', () => {
  it('末页右滑, 有下一篇 -> 下篇第 1 页', () => {
    const r = decideCrossChapter({
      currentPage: 4, totalPages: 5, direction: 'next',
      hasNext: true, hasPrev: true, isPrevRead: false,
    })
    expect(r.action).toBe('navigate')
    expect(r.targetPage).toBe(0)
  })

  it('首页左滑, 上一篇未读 -> 上篇第 1 页', () => {
    const r = decideCrossChapter({
      currentPage: 0, totalPages: 5, direction: 'prev',
      hasNext: true, hasPrev: true, isPrevRead: false,
    })
    expect(r.action).toBe('navigate')
    expect(r.targetPage).toBe(0)
  })

  it('首页左滑, 上一篇已读 -> 上篇末页 (lastPage)', () => {
    const r = decideCrossChapter({
      currentPage: 0, totalPages: 5, direction: 'prev',
      hasNext: true, hasPrev: true, isPrevRead: true, prevLastPage: 7,
    })
    expect(r.action).toBe('navigate')
    expect(r.targetPage).toBe(7)
  })

  it('非末页右滑 -> 不跨篇, 仅切页', () => {
    const r = decideCrossChapter({
      currentPage: 2, totalPages: 5, direction: 'next',
      hasNext: true, hasPrev: true, isPrevRead: false,
    })
    expect(r.action).toBe('stay')
  })

  it('末页右滑但无下篇 -> 不跨篇', () => {
    const r = decideCrossChapter({
      currentPage: 4, totalPages: 5, direction: 'next',
      hasNext: false, hasPrev: true, isPrevRead: false,
    })
    expect(r.action).toBe('stay')
  })
})
