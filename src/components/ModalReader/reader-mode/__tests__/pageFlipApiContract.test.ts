// src/components/ModalReader/reader-mode/__tests__/pageFlipApiContract.test.ts
/**
 * 回归测试：复现 "FlipPages 点击内容区后 .flip-stage 消失" 的根因。
 *
 * 复现路径（来自用户实测）：
 *   1. 移动端 375×667 打开 /books/命/三命通会
 *   2. 点击"原造化之始"解读 → flip 模式正常加载
 *   3. 点击内容区 → .paginated-reader-container 下只剩 measure-dom
 *
 * 触发链：
 *   .flip-stage click → onCenterTap → setHeaderVisible
 *   → GSAP 改 modal 高度 → ResizeObserver 触发 pageSize 更新
 *   → FlipPages effect 重跑（依赖 pageSize.width/height）
 *   → 进入 ready 分支调 flip.updateFromHTML(items)
 *   → ❌ page-flip 2.0.7 库实际方法名是 updateFromHtml（小写 h）
 *   → 抛 TypeError → FlipPages 子树渲染失败 → .flip-stage 消失
 *
 * 测试在真实 page-flip 实例上断言：
 * - updateFromHTML（大写 HTML）调必抛 TypeError（锁住"死方法"陷阱）
 * - updateFromHtml（小写 h）存在且可调用（锁住正确 API）
 *
 * 配套源码层契约由 grep / 代码审查保证（见 commit message）。
 */
import { describe, it, expect } from 'vitest'
import { PageFlip } from 'page-flip'

function makeContainer(): HTMLElement {
  const el = document.createElement('div')
  el.style.width = '100px'
  el.style.height = '100px'
  document.body.appendChild(el)
  return el
}

describe('page-flip 2.0.7 增量更新 API 契约', () => {
  it('updateFromHTML（大写 HTML）调用必抛 TypeError —— FlipPages 旧实现死方法', () => {
    const el = makeContainer()
    const flip = new PageFlip(el, { width: 100, height: 100, size: 'fixed' })
    expect(() =>
      (flip as unknown as { updateFromHTML: (items: HTMLElement[]) => void }).updateFromHTML([el])
    ).toThrowError(/updateFromHTML is not a function/)
  })

  it('updateFromHtml（小写 h）是库真实暴露的增量更新方法', () => {
    const el = makeContainer()
    const flip = new PageFlip(el, { width: 100, height: 100, size: 'fixed' })
    expect(typeof (flip as unknown as Record<string, unknown>).updateFromHtml).toBe('function')
  })
})
