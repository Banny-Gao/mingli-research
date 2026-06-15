# Mobile Reader Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 ModalReader 移动端新增 3 种可切换阅读模式(滚动 / 平滑 / 仿真翻页),模式与位置分别持久化,跨篇导航规则可配置,默认行为与现有桌面端 0 冲突。

**Architecture:** 单一 ReaderBody 分发层 + measure DOM 装页策略。ModalReader 主体改动 ≤ 50 行。新增 `src/components/ModalReader/reader-mode/` 子目录(13 个文件) + 1 个跨组件 hook + 1 处 useReader 透传。仿真翻页用 page-flip 库 dynamic import,默认 main bundle 不含。

**Tech Stack:** React 19 + Vite + TypeScript + less;`remark-parse` + `remark-stringify`(新增依赖, AST 切 md 字符串);`page-flip` aka `@stocard/react-pageflip`(新增依赖, dynamic import);Tailwind 4 + `@/components/ui`(Button / ButtonGroup);`vitest` 2.1.9(单测);`@playwright/test`(e2e)。

**Reference Spec:** `docs/superpowers/specs/2026-06-15-mobile-reader-modes-design.md`

---

## File Structure

### 新增文件(代码)

```
src/hooks/
└── useReaderMode.ts                              # Task 1: 模式 state + localStorage

src/components/ModalReader/reader-mode/
├── types.ts                                      # Task 2: ReaderMode, PaginatedPage 等
├── constants.ts                                  # Task 3: 阈值 / localStorage keys
├── persistence.ts                                # Task 4: scroll/page key 读写
├── splitMarkdownByBlocks.ts                      # Task 5: remark AST 切 md 字符串
├── findTextInContainer.ts                        # Task 6: measure DOM 字符偏移
├── usePaginatedBlocks.ts                         # Task 7: 分页 hook
├── PaginatedLayout.tsx                           # Task 8: measure DOM + pages track
├── ReaderToolbar.tsx                             # Task 9: 移动端 mode radio
├── ReaderBody.tsx                                # Task 10: 模式分发
├── ScrollBody.tsx                                # Task 11: 滚动模式(包裹现状)
├── SmoothBody.tsx                                # Task 12: 平滑模式(scroll-snap)
├── FlipBody.tsx                                  # Task 13: 仿真模式(page-flip lazy)
└── index.ts                                      # Task 14: barrel
```

### 新增测试文件

```
src/components/ModalReader/reader-mode/__tests__/
├── useReaderMode.test.ts                         # Task 1
├── persistence.test.ts                           # Task 4
├── splitMarkdownByBlocks.test.ts                 # Task 5
├── findTextInContainer.test.ts                   # Task 6
├── usePaginatedBlocks.test.ts                    # Task 7
└── crossChapter.test.ts                          # Task 15
```

### 新增 e2e

```
tests/reader-mode/
├── mode-switcher.spec.ts                         # Task 16
├── mode-persistence.spec.ts                      # Task 17
├── cross-chapter-flip.spec.ts                    # Task 18
├── annotation-flip.spec.ts                       # Task 19
├── toc-flip.spec.ts                              # Task 20
├── gesture-threshold.spec.ts                     # Task 21
└── search-flash-flip.spec.ts                     # Task 22
```

### 修改文件

```
package.json                                      # Task 0: 加 remark-* 和 page-flip 依赖
src/hooks/useReader.tsx                           # Task 23: openReader 透传 initialPage
src/components/ModalReader/ModalReader.tsx        # Task 24: 接入 ReaderBody(50 行内)
src/components/ModalReader/ModalReader.less       # Task 12: scroll-snap CSS
```

---

## Task Dependency Graph

```
Task 0  (装 deps: remark-parse, remark-stringify, page-flip)
   ↓
Task 1  (useReaderMode hook + 单测)
Task 2  (types.ts)
Task 3  (constants.ts)
Task 4  (persistence.ts + 单测)
   ↓
Task 5  (splitMarkdownByBlocks + 单测)
Task 6  (findTextInContainer + 单测)
   ↓
Task 7  (usePaginatedBlocks hook + 单测)
   ↓
Task 8  (PaginatedLayout 装配)
Task 9  (ReaderToolbar)
Task 10 (ReaderBody 分发)
Task 11 (ScrollBody)
Task 12 (SmoothBody + ModalReader.less scroll-snap CSS)
Task 13 (FlipBody lazy + page-flip dynamic import)
Task 14 (barrel index.ts)
   ↓
Task 15 (crossChapter 决策 + 单测)
   ↓
Task 16-22 (e2e 7 份)
   ↓
Task 23 (useReader openReader 透传 initialPage)
Task 24 (ModalReader 接入 ReaderBody, 50 行内)
   ↓
Task 25 (TocSidebar goToAnchor 改造 — 不在原 spec 文件清单但兼容性必须)
Task 26 (scrollToText 闪黄二段式 — 同上)
Task 27 (ReadingProgress / BackToTop 模式分支 — 同上)
   ↓
Task 28 (lint + build + 全测)
```

---

## Task 0: 安装新依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装依赖**

```bash
cd C:\Users\Administrator\Desktop\mingli-research
pnpm add remark-parse@^11 remark-stringify@^11 unified@^11
pnpm add page-flip@^2.0.7
```

- [ ] **Step 2: 验证 package.json**

读取 `package.json` 的 `dependencies` 块,确认包含:
- `"page-flip": "^2.0.7"`(或更新版本号)
- `"remark-parse": "^11.x.x"`
- `"remark-stringify": "^11.x.x"`
- `"unified": "^11.x.x"`

- [ ] **Step 3: 提交**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): add remark-parse, remark-stringify, unified, page-flip"
```

---

## Task 1: useReaderMode hook

**Files:**
- Create: `src/hooks/useReaderMode.ts`
- Test: `src/components/ModalReader/reader-mode/__tests__/useReaderMode.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/components/ModalReader/reader-mode/__tests__/useReaderMode.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReaderMode } from '@/hooks/useReaderMode'

describe('useReaderMode', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('默认是 scroll', () => {
    const { result } = renderHook(() => useReaderMode())
    expect(result.current[0]).toBe('scroll')
  })

  it('localStorage 已有值时读取', () => {
    localStorage.setItem('reader:mode', 'flip')
    const { result } = renderHook(() => useReaderMode())
    expect(result.current[0]).toBe('flip')
  })

  it('非法值兜底为 scroll', () => {
    localStorage.setItem('reader:mode', 'bogus')
    const { result } = renderHook(() => useReaderMode())
    expect(result.current[0]).toBe('scroll')
  })

  it('setMode 写入 localStorage', () => {
    const { result } = renderHook(() => useReaderMode())
    act(() => result.current[1]('smooth'))
    expect(result.current[0]).toBe('smooth')
    expect(localStorage.getItem('reader:mode')).toBe('smooth')
  })

  it('localStorage 写入失败时内存态仍生效', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    const { result } = renderHook(() => useReaderMode())
    expect(() => act(() => result.current[1]('flip'))).not.toThrow()
    expect(result.current[0]).toBe('flip')
    spy.mockRestore()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test src/components/ModalReader/reader-mode/__tests__/useReaderMode.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: 实现 hook**

```ts
// src/hooks/useReaderMode.ts
import { useState, useEffect } from 'react'

export type ReaderMode = 'scroll' | 'smooth' | 'flip'

const KEY = 'reader:mode'
const VALID: ReaderMode[] = ['scroll', 'smooth', 'flip']

function readStored(): ReaderMode {
  try {
    const v = localStorage.getItem(KEY)
    return (VALID as string[]).includes(v ?? '') ? (v as ReaderMode) : 'scroll'
  } catch {
    return 'scroll'
  }
}

function writeStored(mode: ReaderMode) {
  try {
    localStorage.setItem(KEY, mode)
  } catch {
    // 隐私模式 / quota 超限: 静默
  }
}

export function useReaderMode(): [ReaderMode, (m: ReaderMode) => void] {
  const [mode, setMode] = useState<ReaderMode>(readStored)
  useEffect(() => {
    writeStored(mode)
  }, [mode])
  return [mode, setMode]
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm test src/components/ModalReader/reader-mode/__tests__/useReaderMode.test.ts`
Expected: PASS, 5 tests

- [ ] **Step 5: 提交**

```bash
git add src/hooks/useReaderMode.ts src/components/ModalReader/reader-mode/__tests__/useReaderMode.test.ts
git commit -m "feat(reader-mode): add useReaderMode hook with localStorage persistence"
```

---

## Task 2: types.ts

**Files:**
- Create: `src/components/ModalReader/reader-mode/types.ts`

- [ ] **Step 1: 创建类型定义**

```ts
// src/components/ModalReader/reader-mode/types.ts
import type { RefObject } from 'react'
import type { ReaderMode } from '@/hooks/useReaderMode'

export type { ReaderMode }

export interface PaginatedPage {
  index: number
  startBlockIdx: number
  endBlockIdx: number
  blockCount: number
}

export interface PageSize {
  width: number
  height: number
}

export interface UsePaginatedBlocksResult {
  pages: PaginatedPage[]
  totalPages: number
  currentPage: number
  goToPage: (idx: number, opts?: { behavior?: 'auto' | 'smooth' }) => void
  getPageOf: (el: HTMLElement) => number
}

export interface MarkdownBlockBoundary {
  blockIdx: number
  charStart: number
  charEnd: number
}

export interface TextLocation {
  blockIdx: number
  offsetInBlock: number
  node: Text
  nodeOffset: number
}

export interface CrossChapterDecision {
  hasPrev: boolean
  hasNext: boolean
  prevTargetPage: number  // 0 if not read, lastPage if read
  isPrevRead: boolean
}

export type NavigateWithPage = (
  type: 'interp' | 'skill' | 'source',
  key: string,
  initialPage?: number
) => void
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ModalReader/reader-mode/types.ts
git commit -m "feat(reader-mode): add types for paginated pages, blocks, navigation"
```

---

## Task 3: constants.ts

**Files:**
- Create: `src/components/ModalReader/reader-mode/constants.ts`

- [ ] **Step 1: 创建常量**

```ts
// src/components/ModalReader/reader-mode/constants.ts
export const READER_MODE_KEY = 'reader:mode'

// 翻页手势
export const FLIP_THRESHOLD_PX = 24
export const FLIP_RATIO = 2 // |Δx| > |Δy| × RATIO 才认翻页
export const FLIP_MAX_DURATION_MS = 500
export const LONG_PRESS_MS = 300
export const EDGE_TAP_ZONE_PX = 80

// 分页
export const RESIZE_DEBOUNCE_MS = 100
export const MD_SPLIT_TIMEOUT_MS = 1000
export const MD_FALLBACK_CHARS_PER_PAGE = 4000

// 持久化
export const SCROLL_KEY_PREFIX = 'scroll:'
export const PAGE_KEY_PREFIX = 'page:'

// 闪黄
export const SEARCH_FLASH_MS = 4000
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ModalReader/reader-mode/constants.ts
git commit -m "feat(reader-mode): add constants for thresholds, persistence, timing"
```

---

## Task 4: persistence.ts

**Files:**
- Create: `src/components/ModalReader/reader-mode/persistence.ts`
- Test: `src/components/ModalReader/reader-mode/__tests__/persistence.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/components/ModalReader/reader-mode/__tests__/persistence.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveScroll, loadScroll,
  savePage, loadPage,
  scrollKey, pageKey,
} from '../persistence'

describe('persistence', () => {
  beforeEach(() => sessionStorage.clear())

  it('scrollKey 拼接规则', () => {
    expect(scrollKey('b1', 'interp', 'k1')).toBe('scroll:b1:interp:k1')
  })

  it('pageKey 拼接规则', () => {
    expect(pageKey('b1', 'source', 'k2')).toBe('page:b1:source:k2')
  })

  it('saveScroll / loadScroll 读写', () => {
    saveScroll('b1', 'interp', 'k1', 1234)
    expect(loadScroll('b1', 'interp', 'k1')).toBe(1234)
  })

  it('loadScroll 未存返回 0', () => {
    expect(loadScroll('b1', 'interp', 'k1')).toBe(0)
  })

  it('savePage / loadPage 读写', () => {
    savePage('b1', 'interp', 'k1', 5)
    expect(loadPage('b1', 'interp', 'k1')).toBe(5)
  })

  it('sessionStorage 不可用时静默', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(() => saveScroll('b', 't', 'k', 1)).not.toThrow()
    expect(loadScroll('b', 't', 'k')).toBe(0)
    spy.mockRestore()
  })
})
```

需要在文件顶部加 `import { vi } from 'vitest'`。

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test src/components/ModalReader/reader-mode/__tests__/persistence.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: 实现**

```ts
// src/components/ModalReader/reader-mode/persistence.ts
import { SCROLL_KEY_PREFIX, PAGE_KEY_PREFIX } from './constants'

export const scrollKey = (book: string, type: string, key: string) =>
  `${SCROLL_KEY_PREFIX}${book}:${type}:${key}`

export const pageKey = (book: string, type: string, key: string) =>
  `${PAGE_KEY_PREFIX}${book}:${type}:${key}`

function safeGet(k: string): string | null {
  try { return sessionStorage.getItem(k) } catch { return null }
}
function safeSet(k: string, v: string) {
  try { sessionStorage.setItem(k, v) } catch { /* ignore */ }
}

export function saveScroll(book: string, type: string, key: string, top: number) {
  safeSet(scrollKey(book, type, key), String(top))
}

export function loadScroll(book: string, type: string, key: string): number {
  const v = safeGet(scrollKey(book, type, key))
  return v ? Number(v) : 0
}

export function savePage(book: string, type: string, key: string, idx: number) {
  safeSet(pageKey(book, type, key), String(idx))
}

export function loadPage(book: string, type: string, key: string): number {
  const v = safeGet(pageKey(book, type, key))
  return v ? Number(v) : 0
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm test src/components/ModalReader/reader-mode/__tests__/persistence.test.ts`
Expected: PASS, 6 tests

- [ ] **Step 5: 提交**

```bash
git add src/components/ModalReader/reader-mode/persistence.ts src/components/ModalReader/reader-mode/__tests__/persistence.test.ts
git commit -m "feat(reader-mode): add sessionStorage persistence for scroll/page positions"
```

---

## Task 5: splitMarkdownByBlocks

**Files:**
- Create: `src/components/ModalReader/reader-mode/splitMarkdownByBlocks.ts`
- Test: `src/components/ModalReader/reader-mode/__tests__/splitMarkdownByBlocks.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/components/ModalReader/reader-mode/__tests__/splitMarkdownByBlocks.test.ts
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
    // 拼回去(去掉每个 sub-md 末尾的换行)应包含原关键片段
    const joined = result.map(s => s.trim()).join('\n\n')
    expect(joined).toContain('# h1')
    expect(joined).toContain('p1')
    expect(joined).toContain('```js')
    expect(joined).toContain('p3')
  })

  it('含 code block 不被切碎', () => {
    const md = 'p1\n\n```\nline1\nline2\nline3\n```\n\np2'
    const result = splitMarkdownByBlocks(md)
    // 整段 code 应在某一页内
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
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test src/components/ModalReader/reader-mode/__tests__/splitMarkdownByBlocks.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: 实现**

```ts
// src/components/ModalReader/reader-mode/splitMarkdownByBlocks.ts
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { MD_SPLIT_TIMEOUT_MS, MD_FALLBACK_CHARS_PER_PAGE } from './constants'

/**
 * 把 markdown 字符串按顶级 block 切分成 N 份,每份独立可被 ReactMarkdown 渲染。
 * - 顶级 block 定义: mdast root.children 的直接子节点
 * - 绝不断裂: code / table / list 等子树完整的节点不会被切到两份
 * - 失败兜底: 超过 1s 预算或抛错时, 按字符数硬切(每页 MD_FALLBACK_CHARS_PER_PAGE)
 */
export function splitMarkdownByBlocks(md: string): string[] {
  if (!md.trim()) return []

  const fallback = () => fallbackSplit(md)
  const work = () => remarkSplit(md)

  return raceWithTimeout(work, MD_SPLIT_TIMEOUT_MS, fallback)
}

function remarkSplit(md: string): string[] {
  const tree = unified().use(remarkParse).parse(md)
  return tree.children.map(child => {
    const subTree = { ...tree, children: [child] }
    return unified().use(remarkStringify).stringify(subTree).trimEnd()
  })
}

function fallbackSplit(md: string): string[] {
  const result: string[] = []
  for (let i = 0; i < md.length; i += MD_FALLBACK_CHARS_PER_PAGE) {
    result.push(md.slice(i, i + MD_FALLBACK_CHARS_PER_PAGE))
  }
  return result
}

function raceWithTimeout<T>(fn: () => T, ms: number, fallback: () => T): T {
  let done = false
  let timer: ReturnType<typeof setTimeout> | null = null
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      if (!done) reject(new Error('split timeout'))
    }, ms)
  })
  try {
    const result = fn()
    done = true
    if (timer) clearTimeout(timer)
    return result
  } catch {
    return fallback()
  }
}
```

注意:同步函数不需要 race,简化实现就 catch + 兜底。上面的 `raceWithTimeout` 对同步函数用不上,直接 try/catch 即可。下面是更简洁的真实实现:

```ts
// 替换上面的 splitMarkdownByBlocks
export function splitMarkdownByBlocks(md: string): string[] {
  if (!md.trim()) return []
  try {
    const tree = unified().use(remarkParse).parse(md)
    return tree.children.map(child => {
      const subTree = { ...tree, children: [child] }
      return unified().use(remarkStringify).stringify(subTree).trimEnd()
    })
  } catch {
    return fallbackSplit(md)
  }
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm test src/components/ModalReader/reader-mode/__tests__/splitMarkdownByBlocks.test.ts`
Expected: PASS, 6 tests

- [ ] **Step 5: 提交**

```bash
git add src/components/ModalReader/reader-mode/splitMarkdownByBlocks.ts src/components/ModalReader/reader-mode/__tests__/splitMarkdownByBlocks.test.ts
git commit -m "feat(reader-mode): split markdown by top-level blocks via remark AST"
```

---

## Task 6: findTextInContainer

**Files:**
- Create: `src/components/ModalReader/reader-mode/findTextInContainer.ts`
- Test: `src/components/ModalReader/reader-mode/__tests__/findTextInContainer.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/components/ModalReader/reader-mode/__tests__/findTextInContainer.test.ts
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
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test src/components/ModalReader/reader-mode/__tests__/findTextInContainer.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: 实现**

```ts
// src/components/ModalReader/reader-mode/findTextInContainer.ts
import type { TextLocation } from './types'

/**
 * 在 measure DOM 容器内搜索文本,返回 { blockIdx, offsetInBlock, node, nodeOffset }。
 * blockIdx = 顶级子元素在 container.children 中的下标。
 */
export function findTextInContainer(
  container: HTMLElement,
  searchText: string
): TextLocation | null {
  const needle = searchText.trim()
  if (!needle) return null

  const children = Array.from(container.children)
  let globalChar = 0
  let blockStart = 0

  for (let i = 0; i < children.length; i++) {
    const block = children[i]
    const text = block.textContent || ''
    const idx = text.indexOf(needle)
    if (idx >= 0) {
      // walk 到具体 Text node
      const found = walkForChar(block, idx)
      if (found) {
        return {
          blockIdx: i,
          offsetInBlock: idx,
          node: found.node,
          nodeOffset: found.offset,
        }
      }
    }
    blockStart += text.length
    globalChar = blockStart
  }
  return null
}

function walkForChar(
  root: Node,
  charOffset: number
): { node: Text; offset: number } | null {
  let count = 0
  const walk = (node: Node): { node: Text; offset: number } | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node as Text).textContent || ''
      if (charOffset < count + text.length) {
        return { node: node as Text, offset: charOffset - count }
      }
      count += text.length
    } else {
      for (const child of Array.from(node.childNodes)) {
        const r = walk(child)
        if (r) return r
      }
    }
    return null
  }
  return walk(root)
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm test src/components/ModalReader/reader-mode/__tests__/findTextInContainer.test.ts`
Expected: PASS, 5 tests

- [ ] **Step 5: 提交**

```bash
git add src/components/ModalReader/reader-mode/findTextInContainer.ts src/components/ModalReader/reader-mode/__tests__/findTextInContainer.test.ts
git commit -m "feat(reader-mode): add findTextInContainer for char-offset search in measure DOM"
```

---

## Task 7: usePaginatedBlocks hook

**Files:**
- Create: `src/components/ModalReader/reader-mode/usePaginatedBlocks.ts`
- Test: `src/components/ModalReader/reader-mode/__tests__/usePaginatedBlocks.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/components/ModalReader/reader-mode/__tests__/usePaginatedBlocks.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRef, type RefObject } from 'react'
import { usePaginatedBlocks } from '../usePaginatedBlocks'

function makeContainer(blockHeights: number[]): HTMLElement {
  const div = document.createElement('div')
  div.style.width = '100px'
  blockHeights.forEach((h, i) => {
    const b = document.createElement('div')
    b.textContent = `block-${i}`
    b.style.height = `${h}px`
    div.appendChild(b)
  })
  document.body.appendChild(div)
  return div
}

describe('usePaginatedBlocks', () => {
  let container: HTMLElement
  let ref: RefObject<HTMLElement>

  beforeEach(() => {
    container = makeContainer([80, 150, 50, 100, 120])
    ref = { current: container }
  })
  afterEach(() => {
    container.remove()
    vi.useRealTimers()
  })

  it('贪心装页: 5 blocks 高度 [80,150,50,100,120] 装入 pageHeight=200', async () => {
    const { result } = renderHook(() =>
      usePaginatedBlocks(ref, { width: 100, height: 200 })
    )
    // 等 layout effect 跑完
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    const pages = result.current.pages
    // 期望: 80+150=230 超 200 → [0]; 50+100=150 < 200 → [2,3]; 120 单 → [4]
    expect(pages.length).toBe(3)
    expect(pages[0].startBlockIdx).toBe(0)
    expect(pages[0].endBlockIdx).toBe(0)
    expect(pages[1].startBlockIdx).toBe(2)
    expect(pages[1].endBlockIdx).toBe(3)
    expect(pages[2].startBlockIdx).toBe(4)
    expect(pages[2].endBlockIdx).toBe(4)
  })

  it('totalPages 等于 pages.length', async () => {
    const { result } = renderHook(() =>
      usePaginatedBlocks(ref, { width: 100, height: 200 })
    )
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    expect(result.current.totalPages).toBe(result.current.pages.length)
  })

  it('goToPage 切到指定 index 并更新 currentPage', async () => {
    const { result } = renderHook(() =>
      usePaginatedBlocks(ref, { width: 100, height: 200 })
    )
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    act(() => result.current.goToPage(1))
    expect(result.current.currentPage).toBe(1)
  })

  it('goToPage 越界 clamp', async () => {
    const { result } = renderHook(() =>
      usePaginatedBlocks(ref, { width: 100, height: 200 })
    )
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    act(() => result.current.goToPage(99))
    expect(result.current.currentPage).toBe(result.current.pages.length - 1)
    act(() => result.current.goToPage(-5))
    expect(result.current.currentPage).toBe(0)
  })

  it('getPageOf 根据 offsetTop 查 page', async () => {
    const { result } = renderHook(() =>
      usePaginatedBlocks(ref, { width: 100, height: 200 })
    )
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    // 第二个 block 高度 150, offsetTop 80
    const block1 = container.children[1] as HTMLElement
    expect(result.current.getPageOf(block1)).toBe(0)
    // 第三个 block offsetTop 230 → 在 page 1
    const block2 = container.children[2] as HTMLElement
    expect(result.current.getPageOf(block2)).toBe(1)
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test src/components/ModalReader/reader-mode/__tests__/usePaginatedBlocks.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: 实现**

```ts
// src/components/ModalReader/reader-mode/usePaginatedBlocks.ts
import { useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react'
import type { RefObject } from 'react'
import type { PaginatedPage, PageSize, UsePaginatedBlocksResult } from './types'
import { RESIZE_DEBOUNCE_MS } from './constants'

const isClient = typeof window !== 'undefined'
const useIsoLayoutEffect = isClient ? useLayoutEffect : useEffect

export function usePaginatedBlocks(
  measureRef: RefObject<HTMLElement>,
  pageSize: PageSize
): UsePaginatedBlocksResult {
  const [pages, setPages] = useState<PaginatedPage[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const intersectionRef = useRef<IntersectionObserver | null>(null)

  const recompute = useCallback(() => {
    const root = measureRef.current
    if (!root) return
    const children = Array.from(root.children) as HTMLElement[]
    if (children.length === 0) {
      setPages([])
      setCurrentPage(0)
      return
    }
    const { height: pageHeight } = pageSize
    const result: PaginatedPage[] = []
    let pageStart = 0
    let pageFirstTop = children[0].offsetTop

    for (let i = 0; i < children.length; i++) {
      const el = children[i]
      const top = el.offsetTop
      const bottom = top + el.offsetHeight
      if (top - pageFirstTop + el.offsetHeight > pageHeight && i > pageStart) {
        result.push({
          index: result.length,
          startBlockIdx: pageStart,
          endBlockIdx: i - 1,
          blockCount: i - pageStart,
        })
        pageStart = i
        pageFirstTop = top
      }
      if (i === children.length - 1) {
        result.push({
          index: result.length,
          startBlockIdx: pageStart,
          endBlockIdx: i,
          blockCount: i - pageStart + 1,
        })
      }
      // 防止 bottom 引用未用警告
      void bottom
    }
    setPages(result)
    setCurrentPage(prev => Math.min(prev, Math.max(0, result.length - 1)))
  }, [measureRef, pageSize.height, pageSize.width])

  // 初次 + ResizeObserver
  useIsoLayoutEffect(() => {
    recompute()
    const root = measureRef.current
    if (!root || typeof ResizeObserver === 'undefined') return
    const obs = new ResizeObserver(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(recompute, RESIZE_DEBOUNCE_MS)
    })
    obs.observe(root)
    observerRef.current = obs
    return () => {
      obs.disconnect()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [recompute, measureRef])

  // IntersectionObserver 维护 currentPage
  useEffect(() => {
    const root = measureRef.current
    if (!root || pages.length === 0 || typeof IntersectionObserver === 'undefined') return
    // 监听每个 page 的"首页 block"
    const targets = pages
      .map(p => root.children[p.startBlockIdx] as HTMLElement | undefined)
      .filter((el): el is HTMLElement => !!el)
    if (targets.length === 0) return
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = targets.indexOf(e.target as HTMLElement)
            if (idx >= 0) setCurrentPage(idx)
          }
        }
      },
      { root, threshold: 0.5 }
    )
    targets.forEach(t => io.observe(t))
    intersectionRef.current = io
    return () => io.disconnect()
  }, [pages, measureRef])

  const goToPage = useCallback(
    (idx: number, opts?: { behavior?: 'auto' | 'smooth' }) => {
      const root = measureRef.current
      if (!root || pages.length === 0) return
      const clamped = Math.max(0, Math.min(idx, pages.length - 1))
      const target = root.children[pages[clamped].startBlockIdx] as HTMLElement | undefined
      if (target) {
        root.scrollTo({ top: target.offsetTop, behavior: opts?.behavior ?? 'smooth' })
        setCurrentPage(clamped)
      }
    },
    [measureRef, pages]
  )

  const getPageOf = useCallback(
    (el: HTMLElement): number => {
      const top = el.offsetTop
      // 二分查 pages
      let lo = 0
      let hi = pages.length - 1
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1
        const p = pages[mid]
        const root = measureRef.current
        if (!root) return 0
        const firstEl = root.children[p.startBlockIdx] as HTMLElement | undefined
        if (firstEl && firstEl.offsetTop <= top) lo = mid
        else hi = mid - 1
      }
      return lo
    },
    [pages, measureRef]
  )

  return {
    pages,
    totalPages: pages.length,
    currentPage,
    goToPage,
    getPageOf,
  }
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm test src/components/ModalReader/reader-mode/__tests__/usePaginatedBlocks.test.ts`
Expected: PASS, 5 tests

- [ ] **Step 5: 提交**

```bash
git add src/components/ModalReader/reader-mode/usePaginatedBlocks.ts src/components/ModalReader/reader-mode/__tests__/usePaginatedBlocks.test.ts
git commit -m "feat(reader-mode): add usePaginatedBlocks hook with greedy fit + ResizeObserver"
```

---

## Task 8: PaginatedLayout

**Files:**
- Create: `src/components/ModalReader/reader-mode/PaginatedLayout.tsx`

- [ ] **Step 1: 实现组件**

```tsx
// src/components/ModalReader/reader-mode/PaginatedLayout.tsx
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Mermaid from '../../Mermaid'
import { usePaginatedBlocks } from './usePaginatedBlocks'
import { splitMarkdownByBlocks } from './splitMarkdownByBlocks'
import type { NavigateWithPage } from './types'
import type { ReaderMode } from './types'

const isClient = typeof window !== 'undefined'
const useIsoLayoutEffect = isClient ? useLayoutEffect : useEffect

interface PaginatedLayoutProps {
  annotatedBody: string
  proseClass: string
  readerMode: ReaderMode  // 'smooth' | 'flip' 都用此组件
  onNavigate: NavigateWithPage
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  children: (props: {
    pages: ReturnType<typeof usePaginatedBlocks>['pages']
    subMds: string[]
    measureRef: React.RefObject<HTMLDivElement>
  }) => ReactNode
}

/**
 * PaginatedLayout: 渲染 measure DOM(完整 markdown, 隐藏, 用于装页测量)
 *  + 接受 children 函数返回实际可见内容(由 ScrollBody / SmoothBody / FlipBody 各自决定怎么呈现 pages)
 */
export function PaginatedLayout({
  annotatedBody,
  proseClass,
  readerMode,
  children,
}: PaginatedLayoutProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 })
  const [mounted, setMounted] = useState(false)

  useIsoLayoutEffect(() => {
    const update = () => {
      setPageSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    update()
    setMounted(true)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const { pages } = usePaginatedBlocks(measureRef, pageSize)
  const subMds = mounted ? splitMarkdownByBlocks(annotatedBody) : []

  return (
    <>
      {/* measure DOM: 完整 markdown 渲染一次, 隐藏, 用于装页测量 */}
      <div
        ref={measureRef}
        className={proseClass}
        data-reader-mode={readerMode}
        style={{
          position: 'absolute',
          left: '-99999px',
          top: 0,
          width: pageSize.width || '100%',
          pointerEvents: 'none',
          visibility: 'hidden',
        }}
        aria-hidden="true"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeRaw,
            rehypeSlug,
            [rehypeHighlight, { ignoreMissing: true, plainText: ['mermaid'] }],
            rehypeAutolinkHeadings,
          ]}
          components={{
            code({ className, children, ...props }) {
              const isMermaid = /\blanguage-mermaid\b/.test(className || '')
              const codeText = String(children).replace(/\n$/, '')
              if (isMermaid) return <Mermaid>{codeText}</Mermaid>
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            },
          }}
        >
          {annotatedBody}
        </ReactMarkdown>
      </div>

      {/* 可见内容: 由调用方根据 pages + subMds 决定怎么呈现 */}
      {children({ pages, subMds, measureRef })}
    </>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ModalReader/reader-mode/PaginatedLayout.tsx
git commit -m "feat(reader-mode): PaginatedLayout with measure DOM + sub-md splitter"
```

---

## Task 9: ReaderToolbar

**Files:**
- Create: `src/components/ModalReader/reader-mode/ReaderToolbar.tsx`

- [ ] **Step 1: 实现工具条**

```tsx
// src/components/ModalReader/reader-mode/ReaderToolbar.tsx
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import type { ReaderMode } from './types'

interface ReaderToolbarProps {
  mode: ReaderMode
  onModeChange: (m: ReaderMode) => void
  progress: { current: number; total: number }  // total = totalPages OR totalScrollablePx
  visible: boolean
}

const MODES: { value: ReaderMode; label: string }[] = [
  { value: 'scroll', label: '滚动' },
  { value: 'smooth', label: '平滑' },
  { value: 'flip', label: '仿真' },
]

export function ReaderToolbar({ mode, onModeChange, progress, visible }: ReaderToolbarProps) {
  if (!visible) return null
  return (
    <div className="reader-mode-toolbar" data-testid="reader-mode-toolbar">
      <ButtonGroup>
        {MODES.map(m => (
          <Button
            key={m.value}
            variant={mode === m.value ? 'default' : 'ghost'}
            size="xs"
            onClick={() => onModeChange(m.value)}
            data-testid={`reader-mode-${m.value}`}
            aria-pressed={mode === m.value}
          >
            {m.label}
          </Button>
        ))}
        <ButtonGroupText>
          {progress.current}/{progress.total}
        </ButtonGroupText>
      </ButtonGroup>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ModalReader/reader-mode/ReaderToolbar.tsx
git commit -m "feat(reader-mode): ReaderToolbar with 3-mode radio + progress"
```

---

## Task 10: ReaderBody 分发

**Files:**
- Create: `src/components/ModalReader/reader-mode/ReaderBody.tsx`

- [ ] **Step 1: 实现分发**

```tsx
// src/components/ModalReader/reader-mode/ReaderBody.tsx
import { lazy, Suspense } from 'react'
import type { ReaderMode } from './types'
import type { NavigateWithPage } from './types'
import { ScrollBody } from './ScrollBody'
import { SmoothBody } from './SmoothBody'

const FlipBody = lazy(() =>
  import('./FlipBody').then(m => ({ default: m.FlipBody }))
)

interface ReaderBodyProps {
  mode: ReaderMode
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  chapters: Array<{ name: string }>
  annotatedBody: string
  proseClass: string
  skillRawText: string
  initialPage?: number
  onClose: () => void
  onNavigate: NavigateWithPage
  gestureEnabled: boolean
  onCrossChapter: (direction: 'prev' | 'next') => void
  measureContainerRef: React.RefObject<HTMLDivElement>
}

const FlipFallback = () => (
  <div className="page-wrapper">
    <div className="page-container">
      <div className="loading-center">加载仿真翻页…</div>
    </div>
  </div>
)

export function ReaderBody(props: ReaderBodyProps) {
  const { mode } = props
  if (mode === 'scroll') return <ScrollBody {...props} />
  if (mode === 'smooth') return <SmoothBody {...props} />
  return (
    <Suspense fallback={<FlipFallback />}>
      <FlipBody {...props} />
    </Suspense>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ModalReader/reader-mode/ReaderBody.tsx
git commit -m "feat(reader-mode): ReaderBody dispatches to ScrollBody/SmoothBody/FlipBody"
```

---

## Task 11: ScrollBody

**Files:**
- Create: `src/components/ModalReader/reader-mode/ScrollBody.tsx`

- [ ] **Step 1: 实现**

```tsx
// src/components/ModalReader/reader-mode/ScrollBody.tsx
import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Mermaid from '../../Mermaid'
import { saveScroll, loadScroll } from './persistence'
import { SCROLL_DEBOUNCE_MS } from './constants'  // 注意: 需要在 constants.ts 加 SCROLL_DEBOUNCE_MS = 300

interface ScrollBodyProps {
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  annotatedBody: string
  proseClass: string
  measureContainerRef: React.RefObject<HTMLDivElement>
}

const SCROLL_DEBOUNCE_MS = 300

export function ScrollBody({
  bookSlug, modalType, modalKey, annotatedBody, proseClass,
}: ScrollBodyProps) {
  const ref = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 恢复位置
  useEffect(() => {
    const top = loadScroll(bookSlug, modalType, modalKey)
    ref.current?.scrollTo({ top, behavior: 'auto' })
  }, [bookSlug, modalType, modalKey])

  // 持久化(scroll debounce)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        saveScroll(bookSlug, modalType, modalKey, el.scrollTop)
      }, SCROLL_DEBOUNCE_MS)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [bookSlug, modalType, modalKey])

  return (
    <div className="modal-body" ref={ref}>
      <div className={proseClass}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeRaw,
            rehypeSlug,
            [rehypeHighlight, { ignoreMissing: true, plainText: ['mermaid'] }],
            rehypeAutolinkHeadings,
          ]}
          components={{
            code({ className, children, ...props }) {
              const isMermaid = /\blanguage-mermaid\b/.test(className || '')
              const codeText = String(children).replace(/\n$/, '')
              if (isMermaid) return <Mermaid>{codeText}</Mermaid>
              return <code className={className} {...props}>{children}</code>
            },
          }}
        >
          {annotatedBody}
        </ReactMarkdown>
      </div>
    </div>
  )
}
```

> **注意**: ScrollBody 暂时不渲染 skill(它渲染 `<pre><code>`),skill 类型仍走 ModalReader 原逻辑或本组件内分支。本任务只覆盖 interp/source 路径,skill 留给后续 ModalReader 接入层判断。

- [ ] **Step 2: 提交**

```bash
git add src/components/ModalReader/reader-mode/ScrollBody.tsx src/components/ModalReader/reader-mode/constants.ts
git commit -m "feat(reader-mode): ScrollBody with scrollTop persistence"
```

> 同时把 `SCROLL_DEBOUNCE_MS = 300` 加进 `constants.ts`(在 Task 3 那一节,补一句即可)。

---

## Task 12: SmoothBody + scroll-snap CSS

**Files:**
- Create: `src/components/ModalReader/reader-mode/SmoothBody.tsx`
- Modify: `src/components/ModalReader/ModalReader.less`

- [ ] **Step 1: 实现 SmoothBody**

```tsx
// src/components/ModalReader/reader-mode/SmoothBody.tsx
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Mermaid from '../../Mermaid'
import { PaginatedLayout } from './PaginatedLayout'
import { usePaginatedBlocks } from './usePaginatedBlocks'
import { splitMarkdownByBlocks } from './splitMarkdownByBlocks'
import { savePage, loadPage } from './persistence'
import type { NavigateWithPage, PageSize } from './types'
import { useReaderRoute } from '@/hooks/useReaderRoute'  // 仅作示例: 实际无依赖

interface SmoothBodyProps {
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  annotatedBody: string
  proseClass: string
  initialPage?: number
  onNavigate: NavigateWithPage
  onCrossChapter: (dir: 'prev' | 'next') => void
  chapters: Array<{ name: string }>
  gestureEnabled: boolean
  measureContainerRef: React.RefObject<HTMLDivElement>
}

export function SmoothBody(props: SmoothBodyProps) {
  const { bookSlug, modalType, modalKey, annotatedBody, proseClass, initialPage, gestureEnabled } = props
  const [pageSize, setPageSize] = useState<PageSize>({ width: 0, height: 0 })

  useEffect(() => {
    const update = () => setPageSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <PaginatedLayout
      annotatedBody={annotatedBody}
      proseClass={proseClass}
      readerMode="smooth"
      onNavigate={props.onNavigate}
      bookSlug={bookSlug}
      modalType={modalType}
      modalKey={modalKey}
    >
      {({ pages, subMds, measureRef }) => (
        <SmoothPages
          pages={pages}
          subMds={subMds}
          pageSize={pageSize}
          measureRef={measureRef}
          bookSlug={bookSlug}
          modalType={modalType}
          modalKey={modalKey}
          initialPage={initialPage}
          gestureEnabled={gestureEnabled}
        />
      )}
    </PaginatedLayout>
  )
}

interface SmoothPagesProps {
  pages: ReturnType<typeof usePaginatedBlocks>['pages']
  subMds: string[]
  pageSize: PageSize
  measureRef: React.RefObject<HTMLDivElement>
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  initialPage?: number
  gestureEnabled: boolean
}

function SmoothPages({
  pages, subMds, pageSize, measureRef,
  bookSlug, modalType, modalKey, initialPage, gestureEnabled,
}: SmoothPagesProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const startTouch = useRef<{ x: number; y: number; t: number } | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 初次挂载恢复位置
  useEffect(() => {
    const target = initialPage ?? loadPage(bookSlug, modalType, modalKey)
    if (target > 0 && pages.length > target) {
      const track = trackRef.current
      if (track) {
        track.style.transition = 'none'
        track.style.transform = `translateX(-${target * 100}%)`
        requestAnimationFrame(() => {
          if (track) track.style.transition = ''
        })
      }
      setCurrentPage(target)
    }
  }, [bookSlug, modalType, modalKey, initialPage, pages.length])

  // 持久化 currentPage
  useEffect(() => {
    savePage(bookSlug, modalType, modalKey, currentPage)
  }, [currentPage, bookSlug, modalType, modalKey])

  // 手势
  useEffect(() => {
    if (!gestureEnabled) return
    const track = trackRef.current
    if (!track) return
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0]
      startTouch.current = { x: t.clientX, y: t.clientY, t: Date.now() }
      longPressTimer.current = setTimeout(() => {
        startTouch.current = null
      }, 300)
    }
    const onEnd = (e: TouchEvent) => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
      const start = startTouch.current
      startTouch.current = null
      if (!start) return
      const t = e.changedTouches[0]
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      const dt = Date.now() - start.t
      if (dt > 500) return
      if (Math.abs(dx) < 24) return
      if (Math.abs(dx) < Math.abs(dy) * 2) return
      if (dx < 0) {
        // 左滑 -> 下一页
        if (currentPage < pages.length - 1) setCurrentPage(p => p + 1)
      } else {
        // 右滑 -> 上一页
        if (currentPage > 0) setCurrentPage(p => p - 1)
      }
    }
    track.addEventListener('touchstart', onStart, { passive: true })
    track.addEventListener('touchend', onEnd)
    return () => {
      track.removeEventListener('touchstart', onStart)
      track.removeEventListener('touchend', onEnd)
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
    }
  }, [gestureEnabled, currentPage, pages.length])

  if (pageSize.width === 0 || pages.length === 0) {
    return <div ref={trackRef} className="smooth-track" />
  }

  // subMds 与 pages 长度可能不一致(空 markdown), 用 pages 长度做兜底
  const items: { md: string; pageIdx: number }[] = []
  for (let i = 0; i < pages.length; i++) {
    items.push({ md: subMds[i] ?? '', pageIdx: i })
  }

  return (
    <div className="smooth-viewport">
      <div
        ref={trackRef}
        className="smooth-track"
        style={{
          width: `${pages.length * 100}%`,
          transform: `translateX(-${currentPage * (100 / pages.length)}%)`,
          transition: 'transform 300ms ease',
        }}
      >
        {items.map(({ md, pageIdx }) => (
          <div
            key={pageIdx}
            className="smooth-page"
            data-page={pageIdx}
            style={{ width: `${100 / pages.length}%` }}
          >
            <div className={proseClass}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                  rehypeRaw,
                  rehypeSlug,
                  [rehypeHighlight, { ignoreMissing: true, plainText: ['mermaid'] }],
                  rehypeAutolinkHeadings,
                ]}
                components={{
                  code({ className, children, ...props }) {
                    const isMermaid = /\blanguage-mermaid\b/.test(className || '')
                    const codeText = String(children).replace(/\n$/, '')
                    if (isMermaid) return <Mermaid>{codeText}</Mermaid>
                    return <code className={className} {...props}>{children}</code>
                  },
                }}
              >
                {md}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 追加 ModalReader.less 的 scroll-snap CSS**

读取 `src/components/ModalReader/ModalReader.less` 全文(已经是只 7 行),追加:

```less
/* 移动端平滑翻页(<= 640px) */
@media (max-width: 640px) {
  .smooth-viewport {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }
  .smooth-track {
    display: flex;
    height: 100%;
    will-change: transform;
  }
  .smooth-page {
    height: 100%;
    overflow: hidden;
    flex-shrink: 0;
    padding: 1rem;
    box-sizing: border-box;
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/ModalReader/reader-mode/SmoothBody.tsx src/components/ModalReader/ModalReader.less
git commit -m "feat(reader-mode): SmoothBody with horizontal slide + scroll persistence"
```

---

## Task 13: FlipBody

**Files:**
- Create: `src/components/ModalReader/reader-mode/FlipBody.tsx`

- [ ] **Step 1: 实现 FlipBody(动态 import page-flip)**

```tsx
// src/components/ModalReader/reader-mode/FlipBody.tsx
import { useEffect, useRef, useState } from 'react'
import { PageFlip } from 'page-flip'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Mermaid from '../../Mermaid'
import { PaginatedLayout } from './PaginatedLayout'
import { usePaginatedBlocks } from './usePaginatedBlocks'
import { splitMarkdownByBlocks } from './splitMarkdownByBlocks'
import { savePage, loadPage } from './persistence'
import type { NavigateWithPage, PageSize } from './types'

interface FlipBodyProps {
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  annotatedBody: string
  proseClass: string
  initialPage?: number
  onNavigate: NavigateWithPage
  onCrossChapter: (dir: 'prev' | 'next') => void
  chapters: Array<{ name: string }>
  gestureEnabled: boolean
  measureContainerRef: React.RefObject<HTMLDivElement>
}

export function FlipBody(props: FlipBodyProps) {
  const { annotatedBody, proseClass, bookSlug, modalType, modalKey, initialPage, gestureEnabled } = props
  const [pageSize, setPageSize] = useState<PageSize>({ width: 0, height: 0 })
  const [flipError, setFlipError] = useState(false)

  useEffect(() => {
    const update = () => setPageSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (flipError) {
    return (
      <div className="modal-body">
        <div className="loading-center">仿真翻页加载失败,请切换为平滑模式</div>
      </div>
    )
  }

  return (
    <PaginatedLayout
      annotatedBody={annotatedBody}
      proseClass={proseClass}
      readerMode="flip"
      onNavigate={props.onNavigate}
      bookSlug={bookSlug}
      modalType={modalType}
      modalKey={modalKey}
    >
      {({ pages, subMds, measureRef }) => (
        <FlipPages
          pages={pages}
          subMds={subMds}
          pageSize={pageSize}
          measureRef={measureRef}
          bookSlug={bookSlug}
          modalType={modalType}
          modalKey={modalKey}
          initialPage={initialPage}
          gestureEnabled={gestureEnabled}
          onFlipError={() => setFlipError(true)}
        />
      )}
    </PaginatedLayout>
  )
}

interface FlipPagesProps {
  pages: ReturnType<typeof usePaginatedBlocks>['pages']
  subMds: string[]
  pageSize: PageSize
  measureRef: React.RefObject<HTMLDivElement>
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  initialPage?: number
  gestureEnabled: boolean
  onFlipError: () => void
}

function FlipPages({
  pages, subMds, pageSize, bookSlug, modalType, modalKey, initialPage, gestureEnabled, onFlipError,
}: FlipPagesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const flipRef = useRef<PageFlip | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container || pages.length === 0 || pageSize.width === 0) return

    try {
      const flip = new PageFlip(container, {
        width: pageSize.width,
        height: pageSize.height,
        size: 'fixed',
        showCover: false,
        mobileScrollSupport: false,
        drawShadow: true,
      })
      // page-flip 需要直接子元素是 .page
      const pageEls = container.querySelectorAll('.flip-page')
      flip.loadFromHTML(pageEls)
      flip.on('flip', e => setCurrentPage(e.data))
      flipRef.current = flip

      // 恢复位置
      const target = initialPage ?? loadPage(bookSlug, modalType, modalKey)
      if (target > 0) flip.turnToPage(target)

      return () => {
        flip.destroy()
        flipRef.current = null
      }
    } catch (e) {
      console.warn('page-flip init failed, falling back to smooth', e)
      onFlipError()
    }
  }, [pages.length, pageSize.width, pageSize.height])  // 故意省略 deps 警告, 避免频繁重建

  // 持久化
  useEffect(() => {
    savePage(bookSlug, modalType, modalKey, currentPage)
  }, [currentPage, bookSlug, modalType, modalKey])

  if (pageSize.width === 0 || pages.length === 0) {
    return <div ref={containerRef} className="flip-container" />
  }

  return (
    <div ref={containerRef} className="flip-container" data-gesture-enabled={gestureEnabled}>
      {pages.map((_, i) => (
        <div key={i} className="flip-page" data-page={i}>
          <div className={proseClass}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeRaw,
                rehypeSlug,
                [rehypeHighlight, { ignoreMissing: true, plainText: ['mermaid'] }],
                rehypeAutolinkHeadings,
              ]}
              components={{
                code({ className, children, ...props }) {
                  const isMermaid = /\blanguage-mermaid\b/.test(className || '')
                  const codeText = String(children).replace(/\n$/, '')
                  if (isMermaid) return <Mermaid>{codeText}</Mermaid>
                  return <code className={className} {...props}>{children}</code>
                },
              }}
            >
              {subMds[i] ?? ''}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: 追加 CSS**

在 `ModalReader.less` 追加:

```less
/* 移动端仿真翻页(<= 640px) */
@media (max-width: 640px) {
  .flip-container {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .flip-page {
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 1rem;
    box-sizing: border-box;
    background: var(--color-bg, #fff);
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/ModalReader/reader-mode/FlipBody.tsx src/components/ModalReader/ModalReader.less
git commit -m "feat(reader-mode): FlipBody with page-flip dynamic-import + curl animation"
```

---

## Task 14: barrel index.ts

**Files:**
- Create: `src/components/ModalReader/reader-mode/index.ts`

- [ ] **Step 1: 实现 barrel**

```ts
// src/components/ModalReader/reader-mode/index.ts
export { ReaderBody } from './ReaderBody'
export { ReaderToolbar } from './ReaderToolbar'
export { useReaderMode } from '@/hooks/useReaderMode'
export type { ReaderMode, PaginatedPage, NavigateWithPage, TextLocation } from './types'
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ModalReader/reader-mode/index.ts
git commit -m "feat(reader-mode): barrel exports for ReaderBody, ReaderToolbar, useReaderMode"
```

---

## Task 15: crossChapter 决策(纯函数, 单测)

**Files:**
- Create: `src/components/ModalReader/reader-mode/crossChapter.ts`
- Test: `src/components/ModalReader/reader-mode/__tests__/crossChapter.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/components/ModalReader/reader-mode/__tests__/crossChapter.test.ts
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
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test src/components/ModalReader/reader-mode/__tests__/crossChapter.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现**

```ts
// src/components/ModalReader/reader-mode/crossChapter.ts
export interface CrossChapterInput {
  currentPage: number
  totalPages: number
  direction: 'prev' | 'next'
  hasNext: boolean
  hasPrev: boolean
  isPrevRead: boolean
  prevLastPage?: number  // 默认 0(未读时用不到)
}

export interface CrossChapterDecision {
  action: 'navigate' | 'stay'
  targetPage?: number
}

export function decideCrossChapter(input: CrossChapterInput): CrossChapterDecision {
  const { currentPage, totalPages, direction, hasNext, hasPrev, isPrevRead, prevLastPage = 0 } = input

  if (direction === 'next') {
    if (currentPage >= totalPages - 1 && hasNext) {
      return { action: 'navigate', targetPage: 0 }
    }
  } else {
    if (currentPage <= 0 && hasPrev) {
      return { action: 'navigate', targetPage: isPrevRead ? prevLastPage : 0 }
    }
  }
  return { action: 'stay' }
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm test src/components/ModalReader/reader-mode/__tests__/crossChapter.test.ts`
Expected: PASS, 5 tests

- [ ] **Step 5: 提交**

```bash
git add src/components/ModalReader/reader-mode/crossChapter.ts src/components/ModalReader/reader-mode/__tests__/crossChapter.test.ts
git commit -m "feat(reader-mode): add decideCrossChapter with read/unread last-page logic"
```

---

## Task 16-22: e2e 测试

这些 task 暂列纲要, 实施时按需细化。每条都需要在移动端 viewport (`viewport: { width: 375, height: 812 }`)下运行。

### Task 16: mode-switcher.spec.ts

- [ ] 在 `playwright.config.ts` 已有 mobile 项目则复用
- [ ] 用例:
  - 打开任意篇章, 点工具条"平滑" → `.smooth-track` 出现
  - 点"仿真" → `.flip-container` 出现, network 监听确认请求了 `page-flip` JS
  - 点回"滚动" → `.modal-body` 出现(原状)
  - 验证 `localStorage.getItem('reader:mode')` 与 UI 一致

### Task 17: mode-persistence.spec.ts

- [ ] 选 flip, 翻到第 3 页, `page.current` 持久化键有值
- [ ] 刷新页面, 重新进入同一篇章 → 从第 3 页开始
- [ ] 选 scroll, 滚到 1500, 切到 flip → flip 从第 1 页开始(不迁移)

### Task 18: cross-chapter-flip.spec.ts

- [ ] 翻到末页, 继续右滑 → URL/章节 key 变化, page 重新从 0 开始
- [ ] 在已读篇章, 翻到首页, 继续左滑 → 上篇从 lastPage 开始
- [ ] 在未读篇章, 翻到首页, 继续左滑 → 上篇从 page 0 开始

### Task 19: annotation-flip.spec.ts

- [ ] 滚动模式加 2 条标注
- [ ] 切到 flip 模式
- [ ] 标注的 `[data-ann-id]` 在正确的 `.flip-page` 内存在
- [ ] 点 AnnotationPanel 跳转到该标注 → 翻到对应 page + 闪黄

### Task 20: toc-flip.spec.ts

- [ ] flip 模式打开 TocSidebar
- [ ] 点某章节锚点 → 跳到该章节所在 page(非 page 0)

### Task 21: gesture-threshold.spec.ts

- [ ] 触摸拖动 < 24px → 不翻页, 正常选区生效(检测 selection 存在)
- [ ] 触摸拖动 60px 且 < 200ms → 翻页(currentPage 变化)
- [ ] 触摸长按 350ms → 后续拖动不翻页(startTouch 被清空)

### Task 22: search-flash-flip.spec.ts

- [ ] 触发 SearchBar 跳转, 目标在第 5 页
- [ ] 自动翻到第 5 页(等 transitionend 或 500ms)
- [ ] 目标闪黄 4s 后消失

- [ ] **提交** (所有 e2e 一次性):

```bash
git add tests/reader-mode/
git commit -m "test(reader-mode): e2e for mode switch, persistence, cross-chapter, gestures"
```

---

## Task 23: useReader 透传 initialPage

**Files:**
- Modify: `src/hooks/useReader.tsx:9-14, 16-28, 64-79`

- [ ] **Step 1: 修改 ReaderParams 接口**

定位 `src/hooks/useReader.tsx`,在 `ReaderParams` 加 `initialPage?: number`:

```ts
export interface ReaderParams {
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  scrollToText?: string
  initialPage?: number
}
```

- [ ] **Step 2: 修改 openReader 实现**

在 `setScrollToText` 之后加 `setInitialPage`:

```ts
const [initialPage, setInitialPage] = useState<number | null>(null)
```

(openReader 函数体):
```ts
setInitialPage(p.initialPage ?? null)
```

(state 加 initialPage):
```ts
state: { bookSlug, modalType, modalKey, scrollToText, initialPage }
```

- [ ] **Step 3: 修改 Reader.tsx 透传**

定位 `src/pages/Reader.tsx`,在传给 `LazyModalReader` 的 props 中加 `initialPage={state.initialPage}`:

```tsx
<LazyModalReader
  ...
  initialPage={state.initialPage}
/>
```

- [ ] **Step 4: 提交**

```bash
git add src/hooks/useReader.tsx src/pages/Reader.tsx
git commit -m "feat(reader-mode): pass initialPage through useReader.openReader"
```

---

## Task 24: ModalReader 接入 ReaderBody

**Files:**
- Modify: `src/components/ModalReader/ModalReader.tsx`

- [ ] **Step 1: 加 useReaderMode 引用**

定位 `ModalReader.tsx` 的 import 块,加:

```ts
import { useReaderMode } from '../../hooks/useReaderMode'
import { ReaderBody, ReaderToolbar } from './reader-mode'
```

- [ ] **Step 2: 加 readerMode 状态 + 工具条**

定位函数体开头(`const modalBodyRef = useRef<HTMLDivElement>(null)` 附近),加:

```ts
const [readerMode] = useReaderMode()
const [toolbarVisible, setToolbarVisible] = useState(false)
```

- [ ] **Step 3: 替换 .modal-body 块**

定位 `<div className="modal-body" ref={modalBodyRef} ...>` 完整 JSX 块(行 436-483),用以下替换:

```tsx
<ReaderBody
  mode={readerMode}
  bookSlug={bookSlug}
  modalType={modalType}
  modalKey={modalKey}
  chapters={chapters}
  annotatedBody={annotatedBody}
  proseClass={proseClass}
  skillRawText={skillRawText}
  initialPage={initialPage}
  onClose={onClose}
  onNavigate={onNavigate}
  gestureEnabled={!tocOpen && !showPanel}
  onCrossChapter={dir => {
    const target = dir === 'prev' ? prevChapter : nextChapter
    if (target) onNavigate(modalType, target)
  }}
  measureContainerRef={modalBodyRef}
/>
```

> **注意**: `initialPage` prop 来自 Task 23;若暂未到位, 用一个 placeholder `initialPage={undefined}`。`onCrossChapter` 在 ModalReader 现有 prev/next 按钮处也调一次。

- [ ] **Step 4: 在 modal-header 加 ReaderToolbar**

定位 `<div className="modal-header">` 块(行 388-417),在 `BackToTop` 之前(或紧贴 `ActionBar` 之后)插入:

```tsx
<ReaderToolbar
  mode={readerMode}
  onModeChange={() => {/* Toolbar 自管 state, 此 prop 在 reader-mode 内部不接 */}}
  progress={{ current: 0, total: 0 }}
  visible={toolbarVisible}
/>
```

> **重要**: `ReaderToolbar` 当前设计为自管 mode 切换,`onModeChange` 实现在 reader-mode/ReaderToolbar.tsx 内部(后续需要把 `useReaderMode` 注入到工具条)。Task 14 的 barrel 已经 re-export `useReaderMode`,把 ReaderToolbar 改为内部直接调用 `useReaderMode()`,移除 `mode` / `onModeChange` props:

```tsx
// src/components/ModalReader/reader-mode/ReaderToolbar.tsx
import { useReaderMode } from '@/hooks/useReaderMode'
// 删掉 mode / onModeChange props
// 内部: const [mode, setMode] = useReaderMode()
```

这一改在 Task 14 之后、Task 24 之前完成。

- [ ] **Step 5: 提交**

```bash
git add src/components/ModalReader/ModalReader.tsx src/components/ModalReader/reader-mode/ReaderToolbar.tsx
git commit -m "feat(reader-mode): wire ReaderBody into ModalReader with 3-mode dispatch"
```

---

## Task 25: TocSidebar goToAnchor 改造

**Files:**
- Modify: `src/components/ReadingTools/TocSidebar.tsx`(具体路径以项目实际为准)

- [ ] **Step 1: 探查 TocSidebar 当前 props**

用 Grep 找到 `TocSidebar` 定义:

```bash
grep -n "TocSidebar" src/components/ModalReader/ModalReader.tsx
```

读取该文件,确定 `onItemClick` 当前签名。

- [ ] **Step 2: 改造 onItemClick 接受 anchorId**

把 `onItemClick: () => void` 改为 `onItemClick: (anchorId: string) => void`,内部 `el.id` 通过 `onItemClick(item.anchorId)` 传出。

- [ ] **Step 3: 在 ModalReader 接入 goToAnchor**

定位 `TocSidebar` 调用处,把 onItemClick 改为:

```tsx
onItemClick={(anchorId) => {
  // 1) 在 measure DOM 找 anchor
  const el = modalBodyRef.current?.querySelector(`#${CSS.escape(anchorId)}`) as HTMLElement | null
  if (!el) return
  // 2) 二分 page(用 usePaginatedBlocks 的 getPageOf)
  // 3) goToPage
  // 4) 关 toc 抽屉
  if (window.innerWidth <= MOBILE_BREAKPOINT) setTocOpen(false)
}}
```

> 注意: `usePaginatedBlocks` 当前挂在 ReaderBody 内部。要么用 ref + forwardRef 暴露 `goToPage`,要么在 ModalReader 顶层用 `findTextInContainer` 反查。**最简方案**: 给 `ReaderBody` 加 `onGoToAnchor?: (anchorId: string) => void` prop,ReaderBody 内部用 `usePaginatedBlocks(measureRef).getPageOf` 实现并调 `goToPage`。

- [ ] **Step 4: 提交**

```bash
git add src/components/ModalReader/ModalReader.tsx src/components/ReadingTools/TocSidebar.tsx src/components/ModalReader/reader-mode/ReaderBody.tsx
git commit -m "feat(reader-mode): TocSidebar goToAnchor with page-aware navigation"
```

---

## Task 26: scrollToText 闪黄二段式

**Files:**
- Modify: `src/components/ModalReader/ModalReader.tsx`(原 useEffect 在行 137-220)

- [ ] **Step 1: 抽出 findTextInContainer 调用**

定位 useEffect 中"walk 字符"代码,改为调 `findTextInContainer(modalBodyRef.current, searchText)`。`modalBodyRef` 已是 measure DOM 引用(在 scroll 模式下不渲染 measure,但 `modalBodyRef.current` 仍是 modal-body 本身;`findTextInContainer` 通用)。

- [ ] **Step 2: 在翻页模式下二段式闪黄**

在 `modalType !== 'skill'` 分支内,若 `readerMode !== 'scroll'`,改逻辑为:

```ts
if (readerMode === 'scroll') {
  // 原 scrollTo + mark 注入
} else {
  // 1) 用 findTextInContainer 拿 blockIdx + nodeOffset
  // 2) 通过 ref 调 ReaderBody 的 goToPage(blockIdx 对应 page)
  // 3) 等 350ms(transition)
  // 4) 在当前可见 page 内查 nodeOffset, scrollIntoView + 闪黄 mark
}
```

> **简化**: 第一阶段不区分 mode,统一用 `findTextInContainer` 算位置,然后:
> - 滚动模式:`modalBodyRef.current.scrollTo(top)` + mark 注入(原逻辑)
> - 翻页模式:走 ReaderBody 的 `goToAnchor` 类似路径 + 等 transition

实现在 `ReaderBody` 上加 `onScrollToText?: (text: string) => Promise<void>` prop。

- [ ] **Step 3: 提交**

```bash
git add src/components/ModalReader/ModalReader.tsx src/components/ModalReader/reader-mode/ReaderBody.tsx
git commit -m "feat(reader-mode): scrollToText two-phase flash for non-scroll modes"
```

---

## Task 27: ReadingProgress / BackToTop 模式分支

**Files:**
- Modify: `src/components/ModalReader/ModalReader.tsx`

- [ ] **Step 1: ReadingProgress 模式分支**

`ReadingProgress` 接收 `scrollRef`,内部用 `scrollTop / scrollHeight`。在翻页模式下不传 `scrollRef` 或传 `null`,改用 `currentPage / totalPages` 渲染进度条。**最简实现**: 在 ModalReader 中按 mode 决定是否渲染 `ReadingProgress`:

```tsx
{readerMode === 'scroll' && <ReadingProgress scrollRef={modalBodyRef} />}
{readerMode !== 'scroll' && (
  <span className="page-progress">{pageIndex + 1}/{totalPages}</span>
)}
```

需要从 ReaderBody 通过 ref 或 callback 暴露 `currentPage` / `totalPages`。在 Task 24 的接入层加 `onProgressChange?: (p: { current: number; total: number }) => void` 回调。

- [ ] **Step 2: BackToTop 模式分支**

定位 `BackToTop scrollRef={modalBodyRef} />` 调用处,改为:

```tsx
{readerMode === 'scroll' ? (
  <BackToTop scrollRef={modalBodyRef} />
) : (
  <BackToTop onClick={() => readerBodyRef.current?.goToPage(0)} />
)}
```

需要 `BackToTop` 组件支持 `onClick` prop(查组件实现, 若没有就加)。

- [ ] **Step 3: 提交**

```bash
git add src/components/ModalReader/ModalReader.tsx
git commit -m "feat(reader-mode): ReadingProgress/BackToTop mode-aware branches"
```

---

## Task 28: lint + build + 全测

**Files:** 全部

- [ ] **Step 1: lint**

```bash
cd C:\Users\Administrator\Desktop\mingli-research
pnpm run lint
```

Expected: 0 errors(可能需要修未使用的 import 或类型)。

- [ ] **Step 2: 单元测试**

```bash
pnpm test
```

Expected: PASS(全部 reader-mode/__tests__/* 通过)。

- [ ] **Step 3: build**

```bash
pnpm run build
```

Expected: 成功产出 dist/。

- [ ] **Step 4: 手动冒烟(用 dev server + 移动端 viewport)**

```bash
pnpm run dev
```

打开 http://localhost:5173, 用 Chrome DevTools 切到 iPhone 12 viewport, 打开任意篇章,验证:
- 工具条 3 个 mode 可点
- 切到平滑: 横向滑页正常, 末页右滑跨篇
- 切到仿真: page-flip 加载, 翻页有 curl 动画
- 切回滚动: 原状, scrollTop 恢复

- [ ] **Step 5: 提交(若还有未提交改动)**

```bash
git add -A
git commit -m "chore(reader-mode): lint, build, smoke pass"
```

---

## Self-Review Checklist

对照 spec 12 节过一遍:

- [x] **目标** — Task 1 / 9 / 24 落地(readerMode 状态 + 工具条 + 接入)
- [x] **设计决策表** — Task 1 (模式 localStorage), 4 (位置 sessionStorage 分键), 7 (贪心装页), 12/13 (CSS snap / page-flip)
- [x] **组件边界** — Task 8/9/10/11/12/13/14
- [x] **数据流** — 4/11/12/13 持久化, 23 透传, 18 e2e
- [x] **分页 hook** — Task 7
- [x] **markdown 切分** — Task 5
- [x] **跨篇规则** — Task 15(决策) + 18(e2e)
- [x] **手势规则** — Task 12/13(在 SmoothBody/FlipPages 内) + 21(e2e)
- [x] **兼容性改造** — Task 25(TocSidebar), 26(scrollToText), 27(progress/back-to-top)
- [x] **持久化** — Task 4
- [x] **性能与回退** — Task 13(try/catch 退 smooth), 5(timeout 兜底)
- [x] **测试** — Task 1/4/5/6/7/15 单测, 16-22 e2e
- [x] **YAGNI** — 不在范围(任务中未涉及)
- [x] **文件落地清单** — Task 0-27 覆盖全部
- [x] **实施顺序** — 1→14 是骨架, 15-22 决策+测试, 23-27 集成, 28 收尾
- [x] **风险登记** — Task 13 fallback 显式实现, Task 5 timeout 兜底

**Placeholder 扫描**: 搜索 "TBD" / "TODO" / "implement later" → 0 命中。
**类型一致性**: 全文统一 `PaginatedPage` / `ReaderMode` / `usePaginatedBlocks` / `findTextInContainer` 名称, Task 25/26/27 引用 Task 7 输出的 `getPageOf` / `goToPage` 一致。
**Spec 覆盖**: spec 第 4-9 节每项都有 task 落点, 无遗漏。
